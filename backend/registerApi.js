const {
  users,
  normalizeEmail,
  isValidEmail,
  hashPassword,
  generateToken,
  readJsonBody,
  sendJson,
} = require('./store');

/**
 * Registers a new user after validating input and checking for duplicate emails.
 * @param {{ fullName: string, email: string, password: string }} input
 * @returns {{ status: number, user?: object, error?: string }}
 */
function registerUser({ fullName, email, password }) {
  const cleanName = String(fullName || '').trim();
  const cleanEmail = normalizeEmail(email);

  if (cleanName.length < 3) {
    return { status: 400, error: 'Ad soyad en az 3 karakter olmalıdır.' };
  }

  if (!isValidEmail(cleanEmail)) {
    return { status: 400, error: 'Geçerli bir e-posta adresi giriniz.' };
  }

  if (typeof password !== 'string' || password.length < 8) {
    return { status: 400, error: 'Şifre en az 8 karakter uzunluğunda olmalıdır.' };
  }

  if (users.has(cleanEmail)) {
    return { status: 409, error: 'Bu e-posta adresi zaten kayıtlı.' };
  }

  const userRecord = {
    id: generateToken(8),
    fullName: cleanName,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.set(cleanEmail, userRecord);

  return {
    status: 201,
    user: {
      id: userRecord.id,
      fullName: userRecord.fullName,
      email: userRecord.email,
      createdAt: userRecord.createdAt,
    },
  };
}

/**
 * HTTP handler for POST /api/auth/register.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
async function registerHandler(req, res) {
  try {
    const body = await readJsonBody(req);
    const result = registerUser(body);
    return sendJson(res, result.status, result);
  } catch (err) {
    return sendJson(res, 400, { status: 400, error: err.message });
  }
}

module.exports = {
  registerUser,
  registerHandler,
};
