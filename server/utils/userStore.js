/**
 * utils/userStore.js
 * A lightweight JSON-file-based user store.
 * In production, replace this with MongoDB/PostgreSQL.
 */

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "users.json");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify([]));

/** Read all users from disk */
function readUsers() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Write users array to disk */
function writeUsers(users) {
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}

/** Find a user by a field value */
function findUser(field, value) {
  return readUsers().find((u) => u[field] === value) || null;
}

/** Find a user by ID */
function findUserById(id) {
  return findUser("id", id);
}

/** Create a new user */
function createUser(userData) {
  const users = readUsers();
  users.push(userData);
  writeUsers(users);
  return userData;
}

/** Update specific fields on a user by ID */
function updateUser(id, updates) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates };
  writeUsers(users);
  return users[idx];
}

module.exports = { findUser, findUserById, createUser, updateUser, readUsers };
