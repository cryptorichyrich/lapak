import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'lapak-progress.db'));

// Enable WAL mode for concurrent reads
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','blocked')),
    started_at TEXT,
    completed_at TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phase_id INTEGER NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
    step_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','blocked','skipped')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low','medium','high','critical')),
    assignee TEXT NOT NULL DEFAULT 'hermes' CHECK(assignee IN ('hermes','bio','both')),
    files TEXT DEFAULT '',
    prd_ref TEXT DEFAULT '',
    started_at TEXT,
    completed_at TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS task_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS blockers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_task_log_task ON task_log(task_id);
`);

console.log('✅ Database schema created');

// Helper functions
export function addPhase(number, name, description) {
  const existing = db.prepare('SELECT id FROM phases WHERE number = ?').get(number);
  if (existing) return existing.id;
  return db.prepare('INSERT INTO phases (number, name, description, sort_order) VALUES (?, ?, ?, ?)').run(number, name, description, number).lastInsertRowid;
}

export function addTask(phaseId, stepCode, title, description, opts = {}) {
  const existing = db.prepare('SELECT id FROM tasks WHERE phase_id = ? AND step_code = ?').get(phaseId, stepCode);
  if (existing) return existing.id;
  return db.prepare(`
    INSERT INTO tasks (phase_id, step_code, title, description, priority, assignee, files, prd_ref, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    phaseId, stepCode, title, description,
    opts.priority || 'medium',
    opts.assignee || 'hermes',
    opts.files || '',
    opts.prdRef || '',
    opts.sortOrder || 0
  ).lastInsertRowid;
}

export function updateTaskStatus(taskId, status, note = '') {
  const task = db.prepare('SELECT status FROM tasks WHERE id = ?').get(taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  
  const now = new Date().toISOString();
  const startedAt = status === 'in_progress' ? now : undefined;
  const completedAt = status === 'completed' ? now : undefined;
  
  db.prepare(`
    UPDATE tasks SET status = ?, started_at = COALESCE(?, started_at), completed_at = COALESCE(?, completed_at)
    WHERE id = ?
  `).run(status, startedAt || null, completedAt || null, taskId);
  
  db.prepare(`
    INSERT INTO task_log (task_id, action, old_status, new_status, note)
    VALUES (?, 'status_change', ?, ?, ?)
  `).run(taskId, task.status, status, note);
  
  return true;
}

export function getProgress() {
  const phases = db.prepare('SELECT * FROM phases ORDER BY number').all();
  const tasks = db.prepare('SELECT * FROM tasks ORDER BY phase_id, sort_order').all();
  
  return phases.map(p => {
    const phaseTasks = tasks.filter(t => t.phase_id === p.id);
    const completed = phaseTasks.filter(t => t.status === 'completed').length;
    const total = phaseTasks.length;
    return {
      ...p,
      tasks: phaseTasks,
      completed,
      total,
      progress: total ? Math.round((completed / total) * 100) : 0
    };
  });
}

export function getNextTask() {
  return db.prepare(`
    SELECT t.*, p.name as phase_name, p.number as phase_number
    FROM tasks t JOIN phases p ON t.phase_id = p.id
    WHERE t.status IN ('pending', 'in_progress', 'blocked')
    ORDER BY p.number, t.sort_order
    LIMIT 1
  `).get();
}

export { db };
