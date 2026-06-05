import initSqlJs, { type Database } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: Database | null = null;

const getDbPath = (): string => {
  if (process.env.NODE_ENV === 'production') {
    return path.join(__dirname, '..', '..', '..', 'data', 'bidbond.db');
  }
  return path.join(__dirname, '..', 'data', 'bidbond.db');
};

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_name TEXT NOT NULL,
  section_code TEXT NOT NULL UNIQUE,
  section_name TEXT NOT NULL,
  open_date TEXT,
  status TEXT NOT NULL DEFAULT 'unopened'
    CHECK(status IN ('unopened','opened','awarded','contracted')),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS bonds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL REFERENCES sections(id),
  payer_name TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  bond_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid'
    CHECK(status IN ('paid','refunded','partial_refunded')),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS bid_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL UNIQUE REFERENCES sections(id),
  winner_name TEXT NOT NULL,
  award_date TEXT NOT NULL,
  contract_signed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS refund_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bond_id INTEGER NOT NULL REFERENCES bonds(id),
  section_id INTEGER NOT NULL REFERENCES sections(id),
  applicant_name TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','approved','rejected','paid')),
  reject_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE TABLE IF NOT EXISTS payment_vouchers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  refund_id INTEGER NOT NULL REFERENCES refund_applications(id),
  voucher_no TEXT NOT NULL UNIQUE,
  amount REAL NOT NULL CHECK(amount > 0),
  pay_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'issued'
    CHECK(status IN ('issued','confirmed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
);
`;

const SEED_SQL = `
INSERT OR IGNORE INTO sections (id, project_name, section_code, section_name, open_date, status) VALUES
  (1, '城市道路改造工程', 'SEC-2024-001', '一标段', '2024-03-15', 'contracted'),
  (2, '城市道路改造工程', 'SEC-2024-002', '二标段', '2024-03-15', 'awarded'),
  (3, '智慧园区建设项目', 'SEC-2024-003', '施工标段', NULL, 'unopened'),
  (4, '污水处理厂扩建', 'SEC-2024-004', '设备采购标段', '2024-04-01', 'opened');

INSERT OR IGNORE INTO bonds (id, section_id, payer_name, amount, bond_date, status) VALUES
  (1, 1, '华建集团有限公司', 500000, '2024-02-20', 'paid'),
  (2, 1, '中天建设集团', 500000, '2024-02-21', 'paid'),
  (3, 2, '大华工程有限公司', 300000, '2024-02-22', 'paid'),
  (4, 3, '远东建设有限公司', 200000, '2024-03-01', 'paid'),
  (5, 4, '绿城建设集团', 400000, '2024-03-15', 'paid');

INSERT OR IGNORE INTO bid_results (id, section_id, winner_name, award_date, contract_signed) VALUES
  (1, 1, '华建集团有限公司', '2024-03-20', 1),
  (2, 2, '大华工程有限公司', '2024-03-25', 0);

INSERT OR IGNORE INTO refund_applications (id, bond_id, section_id, applicant_name, amount, reason, status) VALUES
  (1, 2, 1, '中天建设集团', 500000, '未中标，申请退还保证金', 'approved');
`;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  const DB_PATH = getDbPath();
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    db.run(SCHEMA_SQL);
    db.run(SEED_SQL);
    saveDb();
  }

  return db;
}

export function saveDb(): void {
  if (!db) return;
  const DB_PATH = getDbPath();
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function queryAll<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T[] {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T | null {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  let result: T | null = null;
  if (stmt.step()) {
    result = stmt.getAsObject() as T;
  }
  stmt.free();
  return result;
}

export function run(sql: string, params: unknown[] = []): void {
  if (!db) throw new Error('Database not initialized');
  db.run(sql, params);
  saveDb();
}
