import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILES = {
  cases: path.join(DATA_DIR, 'cases.json'),
  timeline: path.join(DATA_DIR, 'timeline.json'),
  reports: path.join(DATA_DIR, 'reports.json'),
  entities: path.join(DATA_DIR, 'entities.json'),
  history: path.join(DATA_DIR, 'history.json'),
};

const store = {};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function load(name) {
  ensureDir();
  try {
    if (fs.existsSync(FILES[name])) {
      return JSON.parse(fs.readFileSync(FILES[name], 'utf-8'));
    }
  } catch (e) {
    console.error(`[DB] Failed to read ${name}:`, e.message);
  }
  return [];
}

function save(name, data) {
  ensureDir();
  try {
    fs.writeFileSync(FILES[name], JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`[DB] Failed to write ${name}:`, e.message);
  }
}

export function initDB() {
  for (const name of Object.keys(FILES)) {
    store[name] = load(name);
  }
  console.log('[DB] Initialized successfully');
}

export function getAll(name) {
  return store[name] || [];
}

export function getTable(name) {
  return {
    all: () => getAll(name),
    insert: (row) => {
      store[name].push(row);
      save(name, store[name]);
      return row;
    },
    find: (predicate) => store[name].find(predicate),
    filter: (predicate) => store[name].filter(predicate),
    update: (predicate, patch) => {
      const row = store[name].find(predicate);
      if (row) Object.assign(row, patch);
      save(name, store[name]);
      return row;
    },
    remove: (predicate) => {
      const idx = store[name].findIndex(predicate);
      if (idx >= 0) store[name].splice(idx, 1);
      save(name, store[name]);
      return idx >= 0;
    },
    raw: () => store[name],
  };
}