# minigame

# 🎮 Minigame Web Application

Website minigame sederhana berbasis HTML, CSS, dan JavaScript yang dideploy menggunakan Docker dan Nginx pada VPS Ubuntu. Proyek ini dibuat sebagai Ujian Akhir Semester dengan menerapkan konsep DevOps sederhana seperti CI/CD, HTTPS, monitoring, dan cloud backup.

---

## 📌 Features

- 🎮 Browser-based minigame
- 🐳 Docker Compose deployment
- 🌐 Nginx Reverse Proxy
- 🔒 HTTPS menggunakan Let's Encrypt (Certbot)
- ⚙️ CI/CD menggunakan GitHub Actions
- 📊 Monitoring menggunakan Uptime Kuma
- ☁️ Backup otomatis ke Backblaze B2 menggunakan Rclone
- ⏰ Backup harian menggunakan Cron

---

## 🛠️ Tech Stack

- HTML5
- CSS3
- JavaScript
- Docker & Docker Compose
- Nginx
- GitHub Actions
- Uptime Kuma
- Rclone
- Backblaze B2
- Ubuntu VPS

---

## 📂 Project Structure

```
minigame/
├── html/
│   ├── index.html
│   ├── styles.css
│   └── game.js
├── docker-compose.yml
├── backup.sh
└── README.md
```

---

## 🚀 Deployment

Website dijalankan menggunakan Docker Compose.

```bash
docker compose up -d
```

Container akan berjalan pada:

| Service | Port |
|---------|------|
| Website | 8084 |
| Uptime Kuma | 3005 |

---

## 🌐 Domain

Website

```
https://chapler.my.id
```

Monitoring

```
https://monitor.chapler.my.id
```

---

## 🔄 CI/CD

Proyek menggunakan GitHub Actions.

Workflow:

1. Developer melakukan `git push`
2. GitHub Actions dijalankan
3. GitHub melakukan SSH ke VPS
4. VPS melakukan update project
5. Docker Compose menjalankan container terbaru

Deploy dilakukan secara otomatis setiap ada perubahan pada branch **main**.

---

## 📊 Monitoring

Monitoring menggunakan **Uptime Kuma**.

Health check dilakukan secara berkala untuk memastikan website tetap online.

Dashboard Monitoring:

```
https://monitor.chapler.my.id
```

---

## ☁️ Backup

Backup dilakukan menggunakan script:

```
backup.sh
```

Script akan:

1. Mengarsipkan folder project.
2. Membuat file `.tar.gz`.
3. Mengupload backup ke Backblaze B2 menggunakan Rclone.
4. Menghapus file backup lokal setelah upload berhasil.

Backup dijalankan otomatis setiap hari menggunakan Cron.

Contoh Cron Job:

```cron
0 2 * * * /home/chapler/backup.sh >> /home/chapler/backup.log 2>&1
```

---

## 🔐 HTTPS

HTTPS dikonfigurasi menggunakan:

- Let's Encrypt
- Certbot
- Nginx Reverse Proxy

Semua akses ke website menggunakan koneksi HTTPS yang aman.

---

## 📋 Architecture

```
Developer
     │
 git push
     │
     ▼
 GitHub Repository
     │
 GitHub Actions
     │ SSH
     ▼
 VPS Ubuntu
 ├── Nginx
 ├── Docker Compose
 │     └── Minigame
 ├── Uptime Kuma
 └── Backup Script
        │
        ▼
 Backblaze B2
```

---

## 👨‍💻 Author

**Fachrel Fayaaz**

Teknik Informatika

---

## 📄 License

Project ini dibuat untuk keperluan akademik (Ujian Akhir Semester).
