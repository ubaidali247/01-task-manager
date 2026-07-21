const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { tasks: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Seed data if empty
function seedIfEmpty() {
  const db = readDB();
  if (db.tasks.length === 0) {
    db.tasks = [
    {
        "id": "seed-1",
        "title": "Complete project report",
        "description": "Sample description for Complete project report. This is test data for the flaky test detection research study.",
        "category": "Work",
        "createdAt": "2026-07-21T00:21:18.481Z",
        "status": "todo",
        "priority": "low"
    },
    {
        "id": "seed-2",
        "title": "Buy groceries",
        "description": "Sample description for Buy groceries. This is test data for the flaky test detection research study.",
        "category": "Personal",
        "createdAt": "2026-07-20T00:21:18.502Z",
        "status": "in-progress",
        "priority": "medium"
    },
    {
        "id": "seed-3",
        "title": "Call dentist",
        "description": "Sample description for Call dentist. This is test data for the flaky test detection research study.",
        "category": "Shopping",
        "createdAt": "2026-07-19T00:21:18.502Z",
        "status": "done",
        "priority": "high"
    },
    {
        "id": "seed-4",
        "title": "Review pull requests",
        "description": "Sample description for Review pull requests. This is test data for the flaky test detection research study.",
        "category": "Health",
        "createdAt": "2026-07-18T00:21:18.502Z",
        "status": "todo",
        "priority": "low"
    },
    {
        "id": "seed-5",
        "title": "Plan weekly meeting",
        "description": "Sample description for Plan weekly meeting. This is test data for the flaky test detection research study.",
        "category": "Work",
        "createdAt": "2026-07-17T00:21:18.502Z",
        "status": "in-progress",
        "priority": "medium"
    },
    {
        "id": "seed-6",
        "title": "Update documentation",
        "description": "Sample description for Update documentation. This is test data for the flaky test detection research study.",
        "category": "Personal",
        "createdAt": "2026-07-16T00:21:18.502Z",
        "status": "done",
        "priority": "high"
    },
    {
        "id": "seed-7",
        "title": "Fix login bug",
        "description": "Sample description for Fix login bug. This is test data for the flaky test detection research study.",
        "category": "Shopping",
        "createdAt": "2026-07-15T00:21:18.502Z",
        "status": "todo",
        "priority": "low"
    },
    {
        "id": "seed-8",
        "title": "Design new feature",
        "description": "Sample description for Design new feature. This is test data for the flaky test detection research study.",
        "category": "Health",
        "createdAt": "2026-07-14T00:21:18.502Z",
        "status": "in-progress",
        "priority": "medium"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all
app.get('/api/tasks', (req, res) => {
  const db = readDB();
  let items = db.tasks;
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    items = items.filter(i => i.title && i.title.toLowerCase().includes(q) || (i.name && i.name.toLowerCase().includes(q)));
  }
  if (req.query.category) {
    items = items.filter(i => i.category === req.query.category);
  }
  res.json(items);
});

// GET one
app.get('/api/tasks/:id', (req, res) => {
  const db = readDB();
  const item = db.tasks.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create
app.post('/api/tasks', (req, res) => {
  const db = readDB();
  const item = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  db.tasks.push(item);
  writeDB(db);
  res.status(201).json(item);
});

// PUT update
app.put('/api/tasks/:id', (req, res) => {
  const db = readDB();
  const idx = db.tasks.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.tasks[idx] = { ...db.tasks[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(db);
  res.json(db.tasks[idx]);
});

// DELETE
app.delete('/api/tasks/:id', (req, res) => {
  const db = readDB();
  const idx = db.tasks.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.tasks.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Deleted successfully' });
});

// Reset endpoint for testing
app.post('/api/reset', (req, res) => {
  const initial = { tasks: [] };
  writeDB(initial);
  seedIfEmpty();
  res.json({ message: 'Database reset' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Task Manager' }));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Task Manager server running on http://localhost:3001'));
