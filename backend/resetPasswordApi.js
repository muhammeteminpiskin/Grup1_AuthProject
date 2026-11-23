const {
  users,
  resetTokens,
  normalizeEmail,
  isValidEmail,
  hashPassword,
  generateToken,
  readJsonBody,
  sendJson,
} = require('./store');

const RESET_TTL_MS = 15 * 60 * 1000;

/**
 * Generates and stores a password reset token for a registered user.
 * @param {{ email: string }} input
 * @returns {{ status: number, resetCode?: string, message?: string, error?: string }}
 */
function requestPasswordReset({ email }) {
  const cleanEmail = normalizeEmail(email);

  if (!isValidEmail(cleanEmail)) {
    return { status: 400, error: 'Geçerli bir e-posta adresi giriniz.' };
  }

  if (!users.has(cleanEmail)) {
    return { status: 404, error: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' };
  }

  const resetCode = generateToken(3).toUpperCase();
  resetTokens.set(cleanEmail, {
    code: resetCode,
    expiresAt: Date.now() + RESET_TTL_MS,
  });

  return {
    status: 200,
    resetCode,
    message: 'Şifre sıfırlama kodu oluşturuldu.',
  };
}

/**
 * Resets a user's password after verifying the reset code and password policy.
 * @param {{ email: string, resetCode: string, newPassword: string }} input
 * @returns {{ status: number, message?: string, error?: string }}
 */
function resetPassword({ email, resetCode, newPassword }) {
  const cleanEmail = normalizeEmail(email);
  const cleanCode = String(resetCode || '').trim().toUpperCase();

  if (!isValidEmail(cleanEmail)) {
    return { status: 400, error: 'Geçerli bir e-posta adresi giriniz.' };
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return { status: 400, error: 'Yeni şifre en az 8 karakter olmalıdır.' };
  }

  const record = resetTokens.get(cleanEmail);
  if (!record || record.code !== cleanCode) {
    return { status: 400, error: 'Şifre sıfırlama kodu geçersiz.' };
  }

  if (Date.now() > record.expiresAt) {
    resetTokens.delete(cleanEmail);
    return { status: 400, error: 'Şifre sıfırlama kodunun süresi dolmuş.' };
  }

  const user = users.get(cleanEmail);
  if (!user) {
    return { status: 404, error: 'Kullanıcı bulunamadı.' };
  }

  user.passwordHash = hashPassword(newPassword);
  resetTokens.delete(cleanEmail);

  return {
    status: 200,
    message: 'Şifre başarıyla güncellendi.',
  };
}

/**
 * HTTP handler for POST /api/auth/reset-password.
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
async function resetPasswordHandler(req, res) {
  try {
    const body = await readJsonBody(req);
    const result = body.resetCode
      ? resetPassword(body)
      : requestPasswordReset(body);
    return sendJson(res, result.status, result);
  } catch (err) {
    return sendJson(res, 400, { status: 400, error: err.message });
  }
}

module.exports = {
  requestPasswordReset,
  resetPassword,
  resetPasswordHandler,
};
