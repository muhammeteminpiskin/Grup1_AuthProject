# Grup1_AuthProject — Authentication Modülü (Jira & GitHub Kanban)

Bu proje, **Bilgisayar Mühendisliğinde Proje Yönetimi** dersi Lab 1 uygulaması kapsamında **Jira Kanban** ve **GitHub** entegrasyonunu (`Smart Commits`, branch stratejisi, Pull Request ve Code Review akışı) deneyimlemek amacıyla geliştirilmiştir.

## Öğrenci Bilgileri
- **Ad Soyad:** Muhammet Emin Pişkin
- **Öğrenci No:** 2412721040
- **Çalışma Şekli:** Bireysel Çalışma (PO, Frontend Dev., Backend Dev.)

## Görev Listesi (Product Backlog)

| Issue Key | Görev Tanımı | Öncelik | Tahmini Süre | Branch |
| :--- | :--- | :--- | :--- | :--- |
| `AUTH-1` | Frontend: Kullanıcı kayıt ekranı tasarımı | High | 3 saat | `AUTH-1-kayit-ekrani` |
| `AUTH-2` | Frontend: Kullanıcı giriş ekranı tasarımı | High | 2 saat | `AUTH-2-giris-ekrani` |
| `AUTH-3` | Frontend: Şifre sıfırlama ekranı | Medium | 3 saat | `AUTH-3-sifre-sifirlama-ekrani` |
| `AUTH-4` | Backend: Kullanıcı kayıt (Register) API | High | 4 saat | `AUTH-4-register-api` |
| `AUTH-5` | Backend: Kullanıcı giriş (Login) API | High | 3 saat | `AUTH-5-login-api` |
| `AUTH-6` | Backend: Şifre sıfırlama API | Medium | 4 saat | `AUTH-6-sifre-sifirlama-api` |
| `AUTH-7` | Modül Entegrasyon Testleri | High | 3 saat | `AUTH-7-entegrasyon-testleri` |

## Testleri Çalıştırma

```bash
npm test
```
veya doğrudan:
```bash
node tests/auth.integration.test.js
```
