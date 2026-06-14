const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join('C:', 'Users', 'fxwis', 'Lapak', '.flux', 'data.sqlite');
const db = new Database(dbPath);
const row = db.prepare('SELECT data FROM store WHERE id = 1').get();
const data = JSON.parse(row.data);
data.tasks = [];
db.prepare('UPDATE store SET data = ? WHERE id = 1').run(JSON.stringify(data));
console.log('Wiped. Epics:', data.epics.length);
