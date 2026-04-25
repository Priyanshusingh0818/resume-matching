// models/Job.js — Data-access layer for the "jobs" table

import db from '../db.js';

const Job = {
  /** Return all jobs. */
  getAll() {
    return db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
  },

  /**
   * Find a job by primary key.
   * @param {number} id
   */
  getById(id) {
    return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  },

  /**
   * Insert a new job.
   * @param {{ title: string, description: string, skills: string, company: string }} data
   */
  create({ title, description, skills, company }) {
    const result = db
      .prepare(
        'INSERT INTO jobs (title, description, skills, company) VALUES (?, ?, ?, ?)'
      )
      .run(title, description, skills, company);
    return { id: result.lastInsertRowid };
  },

  /**
   * Update a job row.
   * @param {number} id
   * @param {{ title: string, description: string, skills: string, company: string }} data
   */
  update(id, { title, description, skills, company }) {
    return db
      .prepare(
        'UPDATE jobs SET title = ?, description = ?, skills = ?, company = ? WHERE id = ?'
      )
      .run(title, description, skills, company, id);
  },

  /**
   * Delete a job row.
   * @param {number} id
   */
  delete(id) {
    return db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
  },
};

export default Job;
