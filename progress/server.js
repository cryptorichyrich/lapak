const Database = require('better-sqlite3');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FLUX_DB = path.resolve(__dirname, '..', '.flux', 'data.sqlite');
const STATE_DB = path.resolve(
  (process.env.LOCALAPPDATA || process.env.APPDATA || '').replace(/Roaming$/, 'Local') || '',
  'hermes', 'state.db'
);
const PORT = 3590;
const PASS = 'lapak-2026-bio';
const HERMES_API = 'http://127.0.0.1:8642';
const HERMES_KEY = process.env.API_SERVER_KEY || 'lapak-hm-2026-secure';

// In-memory session store
const cookies = new Map();

// Favourites DB (read-write, local to PM app)
const FAV_DB = path.resolve(__dirname, 'favourites.sqlite');
const favDb = new Database(FAV_DB);
favDb.exec('CREATE TABLE IF NOT EXISTS favourites (title TEXT PRIMARY KEY, created_at INTEGER)');
favDb.close();
function openFav(mode) { return new Database(FAV_DB, { readonly: mode === 'r' }); }

function genId() { return crypto.randomBytes(16).toString('hex'); }

function openFlux() { return new Database(FLUX_DB, { readonly: true }); }
function openState() { return new Database(STATE_DB, { readonly: true }); }

function getFluxData() {
  const db = openFlux();
  const row = db.prepare('SELECT data FROM store WHERE id = 1').get();
  db.close();
  return JSON.parse(row.data);
}

function fmtShort(ts) {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function fmtDate(ts) {
  if (!ts) return '';
  return new Date(typeof ts === 'number' ? ts * 1000 : ts).toISOString();
}

function getCookie(req) {
  const hdr = req.headers.cookie || '';
  const m = hdr.match(/pm_session=([a-f0-9]{32})/);
  return m ? m[1] : null;
}
function isAuth(req) {
  const c = getCookie(req);
  return c && cookies.has(c);
}

function json(res, data, status = 200) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
  };
  // Set auth cookie on every response so browser always has it
  const c = data._setCookie;
  if (c) {
    headers['Set-Cookie'] = `pm_session=${c}; Path=/; Max-Age=86400; SameSite=Lax`;
    delete data._setCookie;
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

// Reusable turn grouping: merges raw messages into user/assistant turns with tool badges
function groupTurns(rawMsgs) {
  const turns = [];
  let cur = null;
  for (const m of rawMsgs) {
    if (m.role === 'user') {
      if (cur) turns.push(cur);
      cur = { role: 'user', content: m.content || '', id: m.id, timestamp: fmtDate(m.timestamp), tools: [], session_id: m.session_id || null };
    } else if (m.role === 'assistant') {
      if (!cur || cur.role === 'user') {
        if (cur) turns.push(cur);
        cur = { role: 'assistant', content: m.content || '', id: m.id, timestamp: fmtDate(m.timestamp), tools: [], session_id: m.session_id || null };
      } else if (cur.role === 'assistant') {
        if (m.content && m.content.trim()) {
          cur.content = cur.content ? cur.content + '\n\n' + m.content : m.content;
        }
      }
    } else if (m.role === 'tool') {
      if (cur && cur.role === 'assistant') {
        cur.tools.push({ name: m.tool_name || 'tool', preview: (m.content || '').substring(0, 120) });
      }
    }
  }
  if (cur) turns.push(cur);
  return turns.filter(t => t.role === 'user' || (t.content && t.content.trim()));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;
  const m = req.method;

  // CORS preflight
  if (m === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    });
    return res.end();
  }

  // Serve SPA
  if (p === '/' || p === '/app') {
    const html = fs.readFileSync(path.join(__dirname, 'app', 'index.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // Login
  if (p === '/api/auth/login' && m === 'POST') {
    const body = await readBody(req);
    if (body.password === PASS) {
      const token = genId();
      cookies.set(token, { created: Date.now(), user: 'Bio' });
      return json(res, { ok: true, _setCookie: token });
    }
    return json(res, { ok: false, error: 'Invalid password' }, 401);
  }

  if (p === '/api/auth/check') return json(res, { authenticated: isAuth(req) });

  // Skip auth for static assets
  if (p === '/favicon.ico') { res.writeHead(204); return res.end(); }

  // Auth gate for everything below
  if (!isAuth(req)) return json(res, { error: 'Unauthorized' }, 401);

  // ── TASKS / OVERVIEW ──
  if (p === '/api/overview' && m === 'GET') {
    const data = getFluxData();
    const project = data.projects[0];
    const phases = data.epics.filter(e => e.project_id === project.id).map(epic => {
      const tasks = data.tasks.filter(t => t.epic_id === epic.id);
      return {
        id: epic.id, title: epic.title, description: epic.description || '',
        tasks: tasks.map(t => ({
          id: t.id, title: t.title, status: t.status, priority: t.priority || 2,
          notes: t.notes || '', depends_on: t.depends_on || [],
          created_at: t.created_at, updated_at: t.updated_at,
        })),
        taskCount: tasks.length,
        doneCount: tasks.filter(t => t.status === 'done').length,
        inProgressCount: tasks.filter(t => t.status === 'in_progress').length,
        blockedCount: tasks.filter(t => t.status === 'blocked').length,
      };
    });
    const allTasks = data.tasks;
    return json(res, {
      project: { id: project.id, name: project.name },
      phases,
      stats: {
        total: allTasks.length,
        done: allTasks.filter(t => t.status === 'done').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        todo: allTasks.filter(t => t.status === 'todo').length,
        blocked: allTasks.filter(t => t.status === 'blocked').length,
        percent: allTasks.length ? Math.round(allTasks.filter(t => t.status === 'done').length / allTasks.length * 100) : 0,
      },
    });
  }

  // Update task
  if (m === 'PATCH' && p.match(/^\/api\/tasks\/[^/]+$/)) {
    const taskId = p.split('/').pop();
    const body = await readBody(req);
    const db = new Database(FLUX_DB);
    db.pragma('journal_mode = WAL');
    const row = db.prepare('SELECT data FROM store WHERE id = 1').get();
    const data = JSON.parse(row.data);
    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
      if (body.status) task.status = body.status;
      if (body.notes !== undefined) task.notes = body.notes;
      if (body.priority !== undefined) task.priority = body.priority;
      task.updated_at = new Date().toISOString();
      db.prepare('UPDATE store SET data = ? WHERE id = 1').run(JSON.stringify(data));
    }
    db.close();
    return json(res, { ok: true });
  }

  // ── SESSIONS ──
  if (p === '/api/sessions' && m === 'GET') {
    const db = openState();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('q') || '';
    const source = url.searchParams.get('source') || 'telegram';

    let query, countQuery, params;
    if (search) {
      query = `SELECT id, source, title, started_at, ended_at, message_count, model
               FROM sessions WHERE source = ? AND title LIKE ?
               ORDER BY started_at DESC LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) as c FROM sessions WHERE source = ? AND title LIKE ?`;
      params = [source, `%${search}%`, limit, offset];
    } else {
      query = `SELECT id, source, title, started_at, ended_at, message_count, model
               FROM sessions WHERE source = ?
               ORDER BY started_at DESC LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) as c FROM sessions WHERE source = ?`;
      params = [source, limit, offset];
    }

    const rows = db.prepare(query).all(...params);
    const total = db.prepare(countQuery).get(...params.slice(0, search ? 2 : 1)).c;
    db.close();

    return json(res, {
      sessions: rows.map(s => ({
        id: String(s.id), source: s.source, title: s.title || 'Untitled',
        started_at: fmtDate(s.started_at), started_short: fmtShort(s.started_at),
        ended_at: fmtDate(s.ended_at), message_count: s.message_count, model: s.model,
      })),
      total, limit, offset,
    });
  }

  // ── CONVERSATIONS (grouped like Hermes Desktop) ──
  if (p === '/api/conversations' && m === 'GET') {
    const db = openState();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('q') || '';

    // Fetch all telegram sessions with titles
    let rows;
    if (search) {
      rows = db.prepare(
        `SELECT id, title, started_at, ended_at, message_count, source, model
         FROM sessions WHERE title IS NOT NULL AND title LIKE ?
         ORDER BY started_at DESC`
      ).all(`%${search}%`);
    } else {
      rows = db.prepare(
        `SELECT id, title, started_at, ended_at, message_count, source, model
         FROM sessions WHERE title IS NOT NULL
         ORDER BY started_at DESC`
      ).all();
    }
    db.close();

    // Group by base title (strip trailing #N) — exclude cron jobs
    const groups = new Map();
    for (const s of rows) {
      if (s.source === 'cron') continue; // cron jobs have their own section
      const base = (s.title || 'Untitled').replace(/ #[0-9]+$/, '').trim();
      if (!groups.has(base)) {
        groups.set(base, { title: base, sessions: [], total_msgs: 0, last_at: null });
      }
      const g = groups.get(base);
      g.sessions.push({
        id: String(s.id), title: s.title || 'Untitled',
        started_at: fmtDate(s.started_at), started_short: fmtShort(s.started_at),
        ended_at: fmtDate(s.ended_at), message_count: s.message_count || 0,
        source: s.source, model: s.model,
      });
      g.total_msgs += s.message_count || 0;
      const t = s.started_at ? new Date(typeof s.started_at === 'number' ? s.started_at * 1000 : s.started_at).getTime() : 0;
      if (!g.last_at || t > g.last_at) g.last_at = t;
    }

    // Sort groups by most recent session
    const sorted = [...groups.values()].sort((a, b) => b.last_at - a.last_at);

    // Paginate
    const total = sorted.length;
    const page = sorted.slice(offset, offset + limit);

    return json(res, {
      conversations: page.map(g => ({
        title: g.title,
        session_count: g.sessions.length,
        total_messages: g.total_msgs,
        last_active: fmtShort(g.last_at / 1000),
        last_active_date: new Date(g.last_at).toISOString(),
        sources: [...new Set(g.sessions.map(s => s.source))],
        latest: g.sessions[0], // most recent session in group
        sessions: g.sessions.slice(0, 10), // first 10 for preview
      })),
      total, limit, offset,
    });
  }

  // ── FAVOURITES ──
  if (p === '/api/favourites' && m === 'GET') {
    const db = openFav('r');
    const rows = db.prepare('SELECT title FROM favourites ORDER BY created_at DESC').all();
    db.close();
    return json(res, { favourites: rows.map(r => r.title) });
  }
  if (p === '/api/favourites' && m === 'POST') {
    const body = await readBody(req);
    const title = (body.title || '').trim();
    if (!title) return json(res, { error: 'Missing title' }, 400);
    const db = openFav('w');
    db.prepare('INSERT OR REPLACE INTO favourites (title, created_at) VALUES (?, ?)').run(title, Date.now());
    db.close();
    return json(res, { ok: true });
  }
  if (p === '/api/favourites' && m === 'DELETE') {
    const body = await readBody(req);
    const title = (body.title || '').trim();
    if (!title) return json(res, { error: 'Missing title' }, 400);
    const db = openFav('w');
    db.prepare('DELETE FROM favourites WHERE title = ?').run(title);
    db.close();
    return json(res, { ok: true });
  }

  // Session stats — MUST be before the wildcard :id route
  if (p === '/api/sessions/stats' && m === 'GET') {
    const db = openState();
    const total = db.prepare("SELECT COUNT(*) as c FROM sessions WHERE source='telegram' AND title IS NOT NULL").get().c;
    const convos = db.prepare("SELECT title FROM sessions WHERE title IS NOT NULL AND source != 'cron'").all();
    const baseSet = new Set(convos.map(s => (s.title || '').replace(/ #[0-9]+$/, '').trim()));
    const cronCount = db.prepare("SELECT COUNT(DISTINCT title) as c FROM sessions WHERE source='cron' AND title IS NOT NULL").get().c;
    db.close();
    return json(res, { total, conversations: baseSet.size, cron_jobs: cronCount });
  }

  // ── CONVERSATION LIVE (SSE — real-time push via fs.watch) ──
  if (p.startsWith('/api/conversation-live/') && m === 'GET') {
    const encodedTitle = decodeURIComponent(p.replace('/api/conversation-live/', ''));
    let lastId = 0;

    // Resolve initial lastId from query param
    lastId = parseInt(url.searchParams.get('after')) || 0;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write(`event: connected\ndata: ${JSON.stringify({ title: encodedTitle })}\n\n`);

    // Watch state.db for OS-level filesystem change events
    let debounce = null;
    let closed = false;
    const watcher = fs.watch(STATE_DB, { persistent: false }, (eventType) => {
      if (closed || debounce) return;
      debounce = setTimeout(() => {
        debounce = null;
        if (closed) return;
        try {
          const db = openState();
          const allSessions = db.prepare(
            `SELECT id, title FROM sessions WHERE title IS NOT NULL ORDER BY started_at ASC`
          ).all();
          const matching = allSessions.filter(s => {
            const base = (s.title || '').replace(/ #[0-9]+$/, '').trim();
            return base === encodedTitle;
          });
          if (!matching.length) { db.close(); return; }
          const ids = matching.map(s => s.id);
          const ph = ids.map(() => '?').join(',');
          const rawMsgs = db.prepare(
            `SELECT id, role, substr(content, 1, 8000) as content, timestamp, tool_name, session_id
             FROM messages WHERE session_id IN (${ph}) AND id > ? ORDER BY id ASC`
          ).all(...ids, lastId);
          db.close();

          if (rawMsgs.length) {
            const turns = groupTurns(rawMsgs);
            for (const t of turns) {
              if (t.id > lastId) lastId = t.id;
            }
            res.write(`event: messages\ndata: ${JSON.stringify({ messages: turns })}\n\n`);
          }
        } catch (e) {
          // DB might be locked briefly, skip this tick
        }
      }, 150);
    });
    watcher.on('error', () => {});

    // Also watch the WAL file (SQLite WAL mode writes here)
    let walWatcher = null;
    try {
      walWatcher = fs.watch(STATE_DB + '-wal', { persistent: false }, () => {
        if (!debounce && !closed) watcher.emit('change');
      });
      walWatcher.on('error', () => {});
    } catch(e) {}

    // Cleanup on disconnect
    req.on('close', () => {
      closed = true;
      watcher.close();
      if (walWatcher) walWatcher.close();
      if (debounce) { clearTimeout(debounce); debounce = null; }
    });
    res.on('error', () => { closed = true; });
    return;
  }

  // ── CONVERSATION MESSAGES (merged from all sessions) ──
  if (p.startsWith('/api/conversation/') && m === 'GET') {
    const encodedTitle = decodeURIComponent(p.replace('/api/conversation/', ''));
    const db = openState();

    // Find all sessions matching this base title
    const allSessions = db.prepare(
      `SELECT id, title, started_at FROM sessions WHERE title IS NOT NULL ORDER BY started_at ASC`
    ).all();

    const matching = allSessions.filter(s => {
      const base = (s.title || '').replace(/ #[0-9]+$/, '').trim();
      return base === encodedTitle;
    });

    if (!matching.length) { db.close(); return json(res, { error: 'Not found' }, 404); }

    // Collect all messages across all sessions, in order
    const allMsgs = [];
    for (const sess of matching) {
      const msgs = db.prepare(
        `SELECT id, role, substr(content, 1, 8000) as content, timestamp, tool_name, session_id
         FROM messages WHERE session_id = ? ORDER BY id ASC`
      ).all(sess.id);
      allMsgs.push(...msgs);
    }
    db.close();

    // Sort by timestamp globally
    allMsgs.sort((a, b) => {
      const ta = a.timestamp ? new Date(typeof a.timestamp === 'number' ? a.timestamp * 1000 : a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(typeof b.timestamp === 'number' ? b.timestamp * 1000 : b.timestamp).getTime() : 0;
      return ta - tb;
    });

    // Group into turns
    const turns = groupTurns(allMsgs);

    // Find session boundaries for visual separators
    const sessionBoundaries = [];
    const sessIdSet = new Set();
    for (const msg of allMsgs) {
      if (!sessIdSet.has(msg.session_id)) {
        sessIdSet.add(msg.session_id);
        const sess = matching.find(s => s.id === msg.session_id);
        if (sess) sessionBoundaries.push({ session_id: msg.session_id, title: sess.title, timestamp: fmtDate(msg.timestamp) });
      }
    }

    return json(res, {
      title: encodedTitle,
      session_count: matching.length,
      total_messages: allMsgs.length,
      turns: turns.length,
      sessions: matching.map(s => ({ id: String(s.id), title: s.title, started_at: fmtDate(s.started_at) })),
      messages: turns,
    });
  }

  // ── CRON JOBS ──
  if (p === '/api/cron-jobs' && m === 'GET') {
    const db = openState();
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const rows = db.prepare(
      `SELECT id, title, started_at, ended_at, message_count
       FROM sessions WHERE source = 'cron' AND title IS NOT NULL
       ORDER BY started_at DESC LIMIT ? OFFSET ?`
    ).all(limit, offset);
    const total = db.prepare("SELECT COUNT(*) as c FROM sessions WHERE source='cron' AND title IS NOT NULL").get().c;

    // Group cron jobs by job name (before the · timestamp)
    const groups = new Map();
    for (const r of rows) {
      const jobName = (r.title || '').replace(/\s*·\s*.+$/, '').trim();
      if (!groups.has(jobName)) groups.set(jobName, { name: jobName, runs: [] });
      groups.get(jobName).runs.push({
        id: String(r.id), title: r.title,
        started_at: fmtDate(r.started_at), started_short: fmtShort(r.started_at),
        message_count: r.message_count || 0,
      });
    }

    db.close();
    return json(res, { total, jobs: [...groups.values()] });
  }

  // Session messages — grouped into turns
  if (m === 'GET' && p.match(/^\/api\/sessions\/[^/]+$/)) {
    const sessionId = decodeURIComponent(p.split('/').pop());
    const db = openState();
    const session = db.prepare('SELECT id, source, title, started_at, ended_at, message_count FROM sessions WHERE id = ?').get(sessionId);
    if (!session) { db.close(); return json(res, { error: 'Not found' }, 404); }

    const rawMsgs = db.prepare(
      `SELECT id, role, substr(content, 1, 8000) as content, timestamp, tool_name
       FROM messages WHERE session_id = ? ORDER BY id ASC`
    ).all(sessionId);
    db.close();

    const filtered = groupTurns(rawMsgs);

    return json(res, {
      session: {
        id: String(session.id), source: session.source,
        title: session.title || 'Untitled',
        started_at: fmtDate(session.started_at), ended_at: fmtDate(session.ended_at),
        message_count: session.message_count,
      },
      messages: filtered,
    });
  }

  // ── CHAT (streaming relay to Hermes API via Responses API) ──
  if (p === '/api/chat' && m === 'POST') {
    const body = await readBody(req);
    const message = body.message || '';
    const conversationId = body.conversation_id || 'lapak-pm';

    try {
      // Use raw http.request for TRUE streaming — Node fetch() buffers SSE chunks
      const relayReq = http.request({
        hostname: '127.0.0.1',
        port: 8642,
        path: '/v1/responses',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HERMES_KEY}`,
          'Content-Type': 'application/json',
        },
      }, (upstream) => {
        if (upstream.statusCode !== 200) {
          let errBody = '';
          upstream.on('data', c => errBody += c);
          upstream.on('end', () => json(res, { ok: false, reply: `API error: ${upstream.statusCode}`, error: errBody }, 502));
          return;
        }

        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        });

        let fullReply = '';
        let buffer = '';

        upstream.on('data', (chunk) => {
          // Parse and translate Hermes Responses API → chat.completions format
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('event:')) continue;
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const evt = JSON.parse(trimmed.slice(6));
                if (evt.type === 'response.output_text.delta' && evt.delta) {
                  // Translate to chat.completions chunk format
                  res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: evt.delta } }] })}\n\n`);
                  fullReply += evt.delta;
                }
              } catch {}
            }
          }
        });

        upstream.on('end', () => {
          // Convert accumulated Hermes SSE events to chat.completions format for frontend
          // Actually we already forwarded raw — just send DONE
          res.write('data: [DONE]\n\n');
          res.end();
        });

        upstream.on('error', (err) => {
          console.error('[UPSTREAM ERROR]', err.message);
          res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
          res.end();
        });
      });

      relayReq.on('error', (err) => {
        console.error('[RELAY REQ ERROR]', err.message);
        json(res, { ok: false, reply: `Relay error: ${err.message}` }, 502);
      });

      relayReq.write(JSON.stringify({
        model: 'hermes-agent',
        input: message,
        conversation: conversationId,
        stream: true,
      }));
      relayReq.end();

    } catch (err) {
      return json(res, { ok: false, reply: `Hermes API error: ${err.message}`, error: err.message }, 502);
    }
    return;
  }

  // ── SCRUM ──
  if (p === '/api/scrum' && m === 'GET') {
    const data = getFluxData();
    const allTasks = data.tasks;
    const phases = data.epics;
    const phaseData = phases.map(epic => {
      const tasks = allTasks.filter(t => t.epic_id === epic.id);
      return {
        name: epic.title, total: tasks.length,
        done: tasks.filter(t => t.status === 'done').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        todo: tasks.filter(t => t.status === 'todo').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
      };
    });
    const velocityData = phases.map((epic, i) => {
      const tasks = allTasks.filter(t => t.epic_id === epic.id);
      return { sprint: `Phase ${i + 1}`, done: tasks.filter(t => t.status === 'done').length, total: tasks.length };
    });
    return json(res, { phases: phaseData, velocity: velocityData });
  }

  // Hermes status
  if (p === '/api/hermes-status' && m === 'GET') {
    try {
      const resp = await fetch(`${HERMES_API}/health`, { signal: AbortSignal.timeout(3000) });
      const data = await resp.json();
      return json(res, { online: true, ...data });
    } catch {
      return json(res, { online: false });
    }
  }

  return json(res, { error: 'Not found' }, 404);
});

server.listen(PORT, () => console.log(`🚀 Hermes PM on http://localhost:${PORT}`));
process.stdin.resume(); // Keep event loop alive for MSYS background mode
process.on('uncaughtException', (e) => { console.error('[UNCAUGHT]', e.message, e.stack?.slice(0,200)); });
process.on('unhandledRejection', (e) => { console.error('[UNHANDLED REJECTION]', e?.message || e); });

