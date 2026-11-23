const {
  users,
  sessions,
  normalizeEmail,
  isValidEmail,
  verifyPassword,
  generateToken,
  readJsonBody,
  sendJson,
} = require('./store');

/**
 * Authenticates a user with email and password and issues a session token.
 * @param {{ email: string, password: string }} input
 * @returns {{ status: number, token?: string, user?: object, error?: string }}
 */
function loginUser({ email, password }) {
  const cleanEmail = normalizeEmail(email);

  if (!isValidEmail(cleanEmail) || typeof password !== 'string' || !password) {
    return { status: 400, error: 'Geçerli e-posta ve şifre giriniz.' };
  }

  const user = users.get(cleanEmail);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { status: 401, error: 'E-posta veya şifre hatalı.' };
  }

  const token = generateToken(24);
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    createdAt: new Date().toISOString(),
  });

  return {
    status: 200,
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  };
}

/**
 * HTTP handler for POST /api/auth/login.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
async function loginHandler(req, res) {
  try {
    const body = await readJsonBody(req);
    const result = loginUser(body);
    return sendJson(res, result.status, result);
  } catch (err) {
    return sendJson(res, 400, { status: 400, error: err.message });
  }
}

module.exports = {
  loginUser,
  loginHandler,
};
