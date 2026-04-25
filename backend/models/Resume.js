// models/Resume.js — Data-access layer for the "resumes" table

import db from '../db.js';

const Resume = {
  /** Return every resume. */
  getAll() {
    return db.prepare('SELECT * FROM resumes ORDER BY created_at DESC').all();
  },

  /**
   * Find a single resume by primary key.
   * @param {number} id
   */
  getById(id) {
    return db.prepare('SELECT * FROM resumes WHERE id = ?').get(id);
  },

  /**
   * All resumes belonging to a specific user.
   * @param {number} userId
   */
  getByUserId(userId) {
    return db
      .prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId);
  },

  /**
   * Insert a new resume.
   * @param {{ user_id: number, content: string, score?: number }} data
   */
  create({ user_id, content, score = 0 }) {
    const result = db
      .prepare('INSERT INTO resumes (user_id, content, score) VALUES (?, ?, ?)')
      .run(user_id, content, score);
    return { id: result.lastInsertRowid };
  },

  /**
   * Update the score (and optionally content) of a resume.
   * @param {number} id
   * @param {{ content: string, score: number }} data
   */
  update(id, { content, score }) {
    return db
      .prepare('UPDATE resumes SET content = ?, score = ? WHERE id = ?')
      .run(content, score, id);
  },

  /**
   * Delete a resume row.
   * @param {number} id
   */
  delete(id) {
    return db.prepare('DELETE FROM resumes WHERE id = ?').run(id);
  },
};

export default Resume;
