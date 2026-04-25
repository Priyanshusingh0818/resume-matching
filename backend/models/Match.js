// models/Match.js — Data-access layer for the "matches" table

import db from '../db.js';

const Match = {
  /** Return all matches. */
  getAll() {
    return db.prepare('SELECT * FROM matches ORDER BY score DESC').all();
  },

  /**
   * Find a single match by primary key.
   * @param {number} id
   */
  getById(id) {
    return db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  },

  /**
   * All matches for a specific user, joined with job title and company.
   * @param {number} userId
   */
  getByUserId(userId) {
    return db
      .prepare(`
        SELECT m.*, j.title AS job_title, j.company
        FROM   matches m
        JOIN   jobs    j ON j.id = m.job_id
        WHERE  m.user_id = ?
        ORDER  BY m.score DESC
      `)
      .all(userId);
  },

  /**
   * All matches for a specific job.
   * @param {number} jobId
   */
  getByJobId(jobId) {
    return db
      .prepare(`
        SELECT m.*, u.name AS user_name, u.email
        FROM   matches m
        JOIN   users   u ON u.id = m.user_id
        WHERE  m.job_id = ?
        ORDER  BY m.score DESC
      `)
      .all(jobId);
  },

  /**
   * Insert a new match record.
   * @param {{ user_id: number, job_id: number, score: number }} data
   */
  create({ user_id, job_id, score = 0 }) {
    const result = db
      .prepare('INSERT INTO matches (user_id, job_id, score) VALUES (?, ?, ?)')
      .run(user_id, job_id, score);
    return { id: result.lastInsertRowid };
  },

  /**
   * Update the match score.
   * @param {number} id
   * @param {number} score
   */
  updateScore(id, score) {
    return db.prepare('UPDATE matches SET score = ? WHERE id = ?').run(score, id);
  },

  /**
   * Delete a match row.
   * @param {number} id
   */
  delete(id) {
    return db.prepare('DELETE FROM matches WHERE id = ?').run(id);
  },
};

export default Match;
