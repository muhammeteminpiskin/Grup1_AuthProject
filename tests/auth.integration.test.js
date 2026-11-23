const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { resetStore } = require('../backend/store');
const { registerUser } = require('../backend/registerApi');
const { loginUser } = require('../backend/loginApi');
const { requestPasswordReset, resetPassword } = require('../backend/resetPasswordApi');

function runIntegrationTests() {
  resetStore();

  // 1. Kayıt testi (AUTH-4)
  const regResult = registerUser({
    fullName: 'Muhammet Emin Pişkin',
    email: '2412721040@isubu.edu.tr',
    password: 'StrongPassword123',
  });
  assert.equal(regResult.status, 201, 'Kullanıcı kaydı 201 döndürmelidir.');
  assert.equal(regResult.user.email, '2412721040@isubu.edu.tr');

  // Mükerrer kayıt engelleme testi
  const dupResult = registerUser({
    fullName: 'Muhammet Emin Pişkin',
    email: '2412721040@isubu.edu.tr',
    password: 'StrongPassword123',
  });
  assert.equal(dupResult.status, 409, 'Aynı e-posta ile ikinci kayıt 409 döndürmelidir.');

  // 2. Giriş testi (AUTH-5)
  const badLogin = loginUser({
    email: '2412721040@isubu.edu.tr',
    password: 'WrongPassword',
  });
  assert.equal(badLogin.status, 401, 'Hatalı şifre 401 döndürmelidir.');

  const okLogin = loginUser({
    email: '2412721040@isubu.edu.tr',
    password: 'StrongPassword123',
  });
  assert.equal(okLogin.status, 200, 'Doğru bilgilerle giriş 200 döndürmelidir.');
  assert.ok(okLogin.token && okLogin.token.length >= 16, 'Oturum tokenı üretilmelidir.');

  // 3. Şifre sıfırlama akışı testi (AUTH-6)
  const resetReq = requestPasswordReset({ email: '2412721040@isubu.edu.tr' });
  assert.equal(resetReq.status, 200);
  assert.ok(resetReq.resetCode && resetReq.resetCode.length === 6);

  const invalidCodeRes = resetPassword({
    email: '2412721040@isubu.edu.tr',
    resetCode: '000000',
    newPassword: 'NewPassword456',
  });
  assert.equal(invalidCodeRes.status, 400);

  const validResetRes = resetPassword({
    email: '2412721040@isubu.edu.tr',
    resetCode: resetReq.resetCode,
    newPassword: 'NewPassword456',
  });
  assert.equal(validResetRes.status, 200);

  // Eski şifre artık reddedilmeli, yeni şifre kabul edilmeli
  const oldPassLogin = loginUser({
    email: '2412721040@isubu.edu.tr',
    password: 'StrongPassword123',
  });
  assert.equal(oldPassLogin.status, 401);

  const newPassLogin = loginUser({
    email: '2412721040@isubu.edu.tr',
    password: 'NewPassword456',
  });
  assert.equal(newPassLogin.status, 200);

  // 4. Frontend ekran dosyalarının varlık ve form kontrolü (AUTH-1, AUTH-2, AUTH-3)
  const frontendDir = path.join(__dirname, '..', 'frontend');
  const expectedFiles = ['styles.css', 'register.html', 'login.html', 'reset-password.html'];
  for (const file of expectedFiles) {
    const filePath = path.join(frontendDir, file);
    assert.ok(fs.existsSync(filePath), `${file} dosyası mevcut olmalıdır.`);
  }

  console.log('TÜM ENTEGRASYON TESTLERİ BAŞARIYLA GEÇTİ (AUTH-1 .. AUTH-7).');
}

runIntegrationTests();
