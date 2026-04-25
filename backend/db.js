import 'dotenv/config';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'resume_match.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  console.log('\n[DB] Initializing database tables...\n');

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('[DB] ✔ Table "users" ready.');

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      skills      TEXT    NOT NULL,
      company     TEXT    NOT NULL,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('[DB] ✔ Table "jobs" ready.');

  db.exec(`
    CREATE TABLE IF NOT EXISTS resumes (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      content    TEXT    NOT NULL,
      score      REAL    DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('[DB] ✔ Table "resumes" ready.');

  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      job_id     INTEGER NOT NULL,
      score      REAL    DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE
    );
  `);
  console.log('[DB] ✔ Table "matches" ready.');

  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id     INTEGER PRIMARY KEY,
      phone       TEXT    DEFAULT '',
      location    TEXT    DEFAULT '',
      education   TEXT    DEFAULT '[]',
      preferences TEXT    DEFAULT '{}',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('[DB] ✔ Table "profiles" ready.');

  // === Migration: new tables ===
  db.exec(`
    CREATE TABLE IF NOT EXISTS parsed_data (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      resume_id           INTEGER NOT NULL,
      user_id             INTEGER NOT NULL,
      skills              TEXT    DEFAULT '[]',
      experience_entries  TEXT    DEFAULT '[]',
      education_entries   TEXT    DEFAULT '[]',
      certifications      TEXT    DEFAULT '[]',
      summary             TEXT    DEFAULT '',
      contact_info        TEXT    DEFAULT '{}',
      years_of_experience REAL    DEFAULT 0,
      created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('[DB] ✔ Table "parsed_data" ready.');

  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      event_type TEXT    NOT NULL,
      data       TEXT    DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('[DB] ✔ Table "analytics_logs" ready.');

  // === Migration: add columns to existing tables ===
  const safeAddColumn = (table, column, type) => {
    try {
      const info = db.pragma(`table_info(${table})`);
      if (!info.some(col => col.name === column)) {
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        console.log(`[DB] ✔ Added "${column}" to "${table}".`);
      }
    } catch (e) {
      console.error(`[DB] Column patch error (${table}.${column}):`, e.message);
    }
  };

  safeAddColumn('matches', 'status', "TEXT DEFAULT 'Pending'");
  safeAddColumn('matches', 'is_applied', 'INTEGER DEFAULT 0');
  safeAddColumn('matches', 'insights', 'TEXT');
  safeAddColumn('matches', 'skills_score', 'REAL DEFAULT 0');
  safeAddColumn('matches', 'experience_score', 'REAL DEFAULT 0');
  safeAddColumn('matches', 'education_score', 'REAL DEFAULT 0');
  safeAddColumn('matches', 'keyword_score', 'REAL DEFAULT 0');
  safeAddColumn('matches', 'quality_score', 'REAL DEFAULT 0');
  safeAddColumn('resumes', 'raw_text', "TEXT DEFAULT ''");
  safeAddColumn('resumes', 'version', 'INTEGER DEFAULT 1');

  // === Indexes ===
  db.exec('CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_matches_job_id ON matches(job_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_parsed_data_user_id ON parsed_data(user_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_parsed_data_resume_id ON parsed_data(resume_id);');
  db.exec('CREATE INDEX IF NOT EXISTS idx_analytics_logs_user_id ON analytics_logs(user_id);');
  console.log('[DB] ✔ All indexes created.');

  console.log('\n[DB] All tables initialized successfully.\n');
}

initializeDatabase();

export default db;
