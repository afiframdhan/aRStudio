# AR Studio — GitHub + Cloudflare Pages + Supabase

## Arsitektur
- GitHub: repository/source control.
- Cloudflare Pages: hosting production dari branch `main`.
- Supabase: database, booking, dan Supabase Auth untuk admin upload.
- Google Drive + Apps Script: file besar/portfolio upload opsional.

## 1. Supabase
1. Buat project Supabase.
2. Buka SQL Editor dan jalankan `supabase/schema.sql` seluruhnya.
3. Ambil Project URL dan Publishable Key.
4. Isi `config.js`.
5. Jangan pernah memasukkan service role key ke repo/frontend.

## 2. GitHub
Push isi folder project ini ke repository GitHub AR Studio. Pastikan `config.js` hanya berisi publishable key.

## 3. Cloudflare Pages
1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Pilih repository AR Studio.
3. Production branch: `main`.
4. Framework preset: None.
5. Build command: kosong.
6. Build output directory: `/` atau `.` sesuai tampilan dashboard.
7. Deploy.

Setelah deploy, URL production menjadi `https://NAMA-PROJECT.pages.dev` dan bisa ditambahkan custom domain.

## 4. Data website
Tabel utama: `settings`, `services`, `audio_portfolio`, `video_portfolio`, `price_list`, `gallery`, `case_studies`, `testimonials`, `bookings`.

Untuk portfolio audio, isi `role`, `genre`, dan `year` agar credit tampil profesional.

## 5. Before / After
Masukkan URL raw recording di `case_studies.before_url` dan final mix/master di `after_url`. URL dapat berasal dari Google Drive yang public atau host lain.

## 6. Foto engineer
Upload foto profesional ke Google Drive/public host lalu masukkan URL yang dapat ditampilkan langsung ke `settings.engineerImage`. Bila kosong, website memakai monogram AR.

## 7. Upload Google Drive (opsional)
Gunakan `apps-script/Code.gs` dan deploy sebagai Web App. Isi Script Properties seperti petunjuk di file tersebut, lalu masukkan Web App URL ke `DRIVE_UPLOAD_URL` di `config.js`. Halaman `/admin/` menggunakan Supabase Auth untuk login sebelum upload.

## 8. Workflow update
Edit lokal → commit → push GitHub `main` → Cloudflare Pages deploy otomatis. Perubahan konten Supabase muncul tanpa redeploy website.
