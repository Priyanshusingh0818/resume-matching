// models/User.js — Data-access layer for the "users" table

import db from '../db.js';

const User = {
  /**
   * Return every user (passwords excluded for safety).
   */
  getAll() {
    return db.prepare('SELECT id, name, email, role, created_at FROM users').all();
  },

  /**
   * Find a single user by primary key.
   * @param {number} id
   */
  getById(id) {
    return db
      .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
      .get(id);
  },

  /**
   * Find a user by email (includes hashed password for auth checks).
   * @param {string} email
   */
  getByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  /**
   * Insert a new user row.
   * @param {{ name: string, email: string, password: string, role?: string }} data
   * @returns {{ id: number }} last-insert-rowid wrapped in an object
   */
  create({ name, email, password, role = 'student' }) {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(name, email, password, role);
    return { id: result.lastInsertRowid };
  },

  /**
   * Update a user row.
   * @param {number} id
   * @param {{ name?: string, email?: string, role?: string }} data
   */
  update(id, { name, email, role }) {
    return db
      .prepare('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?')
      .run(name, email, role, id);
  },

  /**
   * Delete a user row.
   * @param {number} id
   */
  delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  },
};

export default User;
