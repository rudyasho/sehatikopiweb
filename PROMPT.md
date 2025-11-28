# Prompt Rekayasa Aplikasi Final: Sehati Kopi Digital

Berikut adalah serangkaian prompt terperinci yang dirancang untuk memandu AI coding partner dalam membangun aplikasi web e-commerce dan portal konten "Sehati Kopi Digital" dari awal hingga selesai.

## Informasi Proyek

- **Nama Aplikasi**: Sehati Kopi Digital
- **Konsep**: Sebuah platform digital untuk sebuah kedai kopi dan roastery fiksi dari Indonesia. Aplikasi ini berfungsi sebagai etalase produk, portal konten (blog), dan dasbor manajemen bisnis.
- **Tumpukan Teknologi**: Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN/UI, Firebase (Auth, Firestore).
- **Persona AI**: App Prototyper di Firebase Studio.

---

### **Fase 1: Penyiapan Proyek & Struktur Inti**

**Prompt 1: Inisialisasi Proyek**
"Halo! Mari kita mulai proyek baru. Siapkan aplikasi Next.js dengan App Router, TypeScript, Tailwind CSS, dan ShadCN/UI. Pastikan untuk mengonfigurasi direktori `src` dan alias path (`@/*`). Inisialisasi juga Firebase SDK (klien dan admin). Buat struktur folder dasar untuk `components`, `lib`, dan `context`."

**Prompt 2: Tata Letak Utama (Layout)**
"Buat komponen tata letak utama (`Header`, `Footer`, dan `RootLayout`). Header harus responsif, berisi logo, tautan navigasi utama, tombol mode terang/gelap, ikon keranjang belanja, dan menu profil pengguna/tombol login. Footer harus berisi tautan cepat, informasi kontak, dan formulir langganan newsletter. Terapkan ini dalam `src/app/layout.tsx` menggunakan ThemeProvider, AuthProvider, dan CartProvider."

**Prompt 3: Halaman Beranda Awal**
"Buat halaman beranda (`src/app/page.tsx`) yang menampilkan beberapa bagian utama: Hero Section yang dinamis, cuplikan 'Tentang Kami', Produk Unggulan, Testimoni, dan CTA untuk blog."

---

### **Fase 2: Fungsionalitas E-Commerce Inti**

**Prompt 4: Manajemen Produk & Firestore**
"Kita perlu mengelola data produk. Buat skrip di `src/lib/products-data.ts` yang dapat melakukan operasi CRUD untuk produk di Firestore. Implementasikan fungsi `seed` untuk mengisi database dengan beberapa produk awal jika koleksi kosong."

**Prompt 5: Halaman Katalog & Detail Produk**
"Buat halaman katalog (`/products`) dengan fungsionalitas filter dan pengurutan di sisi klien. Buat juga halaman detail produk (`/products/[slug]`) yang menampilkan semua informasi produk dan tombol 'Tambah ke Keranjang'."

**Prompt 6: Keranjang Belanja & Konteks**
"Implementasikan fungsionalitas keranjang belanja menggunakan React Context (`src/context/cart-context.tsx`). Konteks ini harus mengelola state keranjang dan menyimpannya di `localStorage` untuk persistensi."

**Prompt 7: Halaman Keranjang Belanja & Proses Checkout**
"Buat halaman keranjang (`/cart`) yang fungsional. Implementasikan tombol 'Checkout via WhatsApp' yang menghasilkan pesan pre-filled. Setelah checkout, data pesanan juga harus disimpan ke koleksi 'orders' di Firestore yang ditautkan dengan UID pengguna (jika login)."

**Prompt 8: Halaman Konfirmasi Pesanan**
"Buat halaman konfirmasi (`/checkout/success`) yang menampilkan ringkasan pesanan terakhir dari `sessionStorage`."

---

### **Fase 3: Konten & Fitur Komunitas**

**Prompt 9: Sistem Blog dengan Firestore**
"Buat sistem CRUD untuk postingan blog di `src/lib/blog-data.ts`. Buat halaman daftar blog (`/blog`) dan halaman detail (`/blog/[slug]`) yang merender konten Markdown menjadi HTML."

**Prompt 10: Halaman Statis & Menu**
"Buat halaman-halaman statis berikut: 'About Us' (`/about`), 'Contact' (`/contact`) dengan formulir fungsional, dan 'In-Store Menu' (`/menu`) dengan tampilan tab."

**Prompt 11: Jadwal Acara**
"Buat halaman (`/events`) yang menampilkan daftar acara mendatang. Fungsi 'Register' hanya akan menampilkan notifikasi toast sebagai konfirmasi."

---

### **Fase 4: Otentikasi & Dasbor Pengguna**

**Prompt 12: Otentikasi Pengguna**
"Implementasikan sistem otentikasi lengkap menggunakan Firebase Authentication (Email/Password & Google Sign-In). Buat halaman `/login` dan `/signup`."

**Prompt 13: Halaman Profil Pengguna**
"Buat halaman profil (`/profile`) yang dilindungi dan menampilkan informasi pengguna serta riwayat pesanan mereka dari Firestore."

**Prompt 14: Dasbor Admin Dasar**
"Buat halaman dasbor admin (`/dashboard`) yang dilindungi. Tampilan awal harus berupa 'Overview' yang menampilkan metrik bisnis kunci dan beberapa bagan analisis."

**Prompt 15: Manajemen CRUD di Dasbor**
"Implementasikan tampilan CRUD lengkap di dalam dasbor untuk Produk, Postingan Blog, Acara, dan Pengguna. Buat juga halaman untuk mengelola Pengaturan Situs dan Konten Hero."

---

### **Fase 5: Finalisasi, Optimasi & Perbaikan**

**Prompt 16: SEO & Metadata**
"Lakukan optimasi SEO. Hasilkan metadata dinamis untuk halaman produk dan blog. Buat `sitemap.ts` dan `robots.txt`."

**Prompt 17: Peningkatan UI/UX dan Optimasi Dasbor**
"Tingkatkan pengalaman pengguna dengan mengoptimalkan tampilan UI dan UX di seluruh aplikasi, serta merombak dasbor admin agar lebih intuitif, fungsional, dan modern. Tambahkan fitur manajemen pesanan dan perbaiki navigasi seluler."

**Prompt 18 (Siklus Perbaikan): Penanganan Build & Runtime Error**
"Selama proses pengembangan, terjadi beberapa error build dan runtime. Lakukan analisis pada log error, identifikasi akar masalah (seperti impor yang hilang, konflik komponen klien/server, dan type safety), dan terapkan perbaikan yang diperlukan untuk memastikan aplikasi stabil dan dapat di-build dengan sukses."

**Prompt 19: Pembersihan & Dokumentasi Final**
"Terakhir, tinjau seluruh basis kode. Rapikan kode, hapus impor yang tidak digunakan, pastikan konsistensi gaya. Perbarui file `README.md` dan `PROMPT.md` ini untuk mencerminkan semua fitur yang telah diimplementasikan dan berikan instruksi yang jelas tentang cara menjalankan proyek secara lokal."

---

### **Tantangan & Solusi Selama Pengembangan**

- **Konflik Komponen Klien/Server**: Terjadi *build error* karena `generateStaticParams` digunakan dalam file yang sama dengan `'use client'`. **Solusi**: Memisahkan halaman menjadi dua file, satu untuk logika server (`page.tsx`) dan satu untuk logika klien (`client-page.tsx`), sesuai dengan praktik terbaik Next.js.
- **Error Tipe `null`**: Pemeriksa tipe TypeScript mengidentifikasi bahwa objek `dbAdmin` bisa `null` dalam beberapa kasus. **Solusi**: Menambahkan pemeriksaan `if (!dbAdmin) { ... }` di awal fungsi terkait untuk menjamin *type safety* dan membuat aplikasi lebih kuat.
- **Impor yang Hilang**: Beberapa *runtime error* disebabkan oleh komponen (`Separator`, `DialogClose`) yang digunakan tanpa diimpor. **Solusi**: Melakukan audit pada komponen dan menambahkan pernyataan impor yang hilang.

### **Hasil Akhir**

Aplikasi "Sehati Kopi Digital" kini menjadi platform web yang lengkap, fungsional, dan andal. Proyek ini mencakup fungsionalitas e-commerce penuh, sistem manajemen konten, dan dasbor analitik yang komprehensif. Arsitekturnya kokoh, UI/UX-nya telah disempurnakan, dan semua error yang diketahui telah diperbaiki. Dokumentasi telah diperbarui untuk mencerminkan status akhir proyek.
