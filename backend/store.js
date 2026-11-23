const crypto = require('crypto');

const users = new Map();
const sessions = new Map();
const resetTokens = new Map();

/**
 * Normalizes an email address for consistent store lookups.
 * @param {string} email
 * @returns {string}
 */
function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * Checks whether the given string is a syntactically valid email address.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

/**
 * Hashes a plaintext password using scrypt with a random per-user salt.
 * @param {string} password
 * @param {string} [salt]
 * @returns {string}
 */
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

/**
 * Verifies a plaintext password against a stored salt:hash value.
 * @param {string} password
 * @param {string} storedHash
 * @returns {boolean}
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, keyHex] = storedHash.split(':');
  const expectedBuffer = Buffer.from(keyHex, 'hex');
  const actualBuffer = crypto.scryptSync(String(password), salt, 64);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

/**
 * Generates a cryptographically random hex token.
 * @param {number} [bytes=24]
 * @returns {string}
 */
function generateToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Clears all in-memory records (used by integration tests).
 */
function resetStore() {
  users.clear();
  sessions.clear();
  resetTokens.clear();
}

/**
 * Reads and parses a JSON request body from an HTTP IncomingMessage.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<object>}
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('Geçersiz JSON gövdesi.'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Sends a JSON HTTP response with the specified status code.
 * @param {import('http').ServerResponse} res
 * @param {number} statusCode
 * @param {object} payload
 */
function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

module.exports = {
  users,
  sessions,
  resetTokens,
  normalizeEmail,
  isValidEmail,
  hashPassword,
  verifyPassword,
  generateToken,
  resetStore,
  readJsonBody,
  sendJson,
};
