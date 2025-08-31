
# Prompt Rekayasa Aplikasi: Sehati Kopi Digital

Berikut adalah serangkaian prompt terperinci yang dirancang untuk memandu AI coding partner dalam membangun aplikasi web e-commerce dan portal konten "Sehati Kopi Digital" dari awal.

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
"Buat halaman beranda (`src/app/page.tsx`) yang menampilkan beberapa bagian utama:
1.  **Hero Section**: Gambar latar belakang besar dengan judul utama dan subjudul yang menarik.
2.  **About Us Snippet**: Sedikit teks pengantar tentang perusahaan dengan gambar pendukung.
3.  **Featured Products**: Placeholder untuk menampilkan 3 produk unggulan.
4.  **Testimonials**: Tiga kartu testimoni dari pelanggan.
5.  **CTA Section**: Ajakan bertindak untuk menelusuri blog."

---

### **Fase 2: Fungsionalitas E-Commerce Inti**

**Prompt 4: Manajemen Produk & Firestore**
"Kita perlu mengelola data produk. Buat skrip di `src/lib/products-data.ts` yang dapat melakukan operasi CRUD (Create, Read, Update, Delete) untuk produk di Firestore. Produk harus memiliki atribut seperti `name`, `slug`, `origin`, `description`, `price`, `image`, `roast`, `tags`, `rating`, dan `reviews`. Implementasikan fungsi `seed` untuk mengisi database dengan beberapa produk awal jika koleksi kosong."

**Prompt 5: Halaman Katalog & Detail Produk**
"Buat dua halaman terkait produk:
1.  **Halaman Katalog (`/products`)**: Tampilkan semua produk dalam format grid. Implementasikan fungsionalitas filter di sisi klien untuk menyaring berdasarkan *roast level* dan *origin*, serta pengurutan berdasarkan nama, harga, dan rating.
2.  **Halaman Detail Produk (`/products/[slug]`)**: Tampilkan semua detail untuk satu produk, termasuk gambar, deskripsi, harga, dan tombol 'Add to Cart' dengan input kuantitas."

**Prompt 6: Keranjang Belanja & Konteks**
"Implementasikan fungsionalitas keranjang belanja menggunakan React Context (`src/context/cart-context.tsx`). Konteks ini harus mengelola state keranjang (menambah, menghapus, memperbarui kuantitas item) dan menyimpannya di `localStorage` untuk persistensi. Ikon keranjang di header harus menampilkan jumlah item saat ini."

**Prompt 7: Halaman Keranjang Belanja & Proses Checkout**
"Buat halaman keranjang belanja (`/cart`) yang menampilkan ringkasan item, memungkinkan pengguna untuk mengubah kuantitas atau menghapus item, dan menunjukkan subtotal, biaya pengiriman, dan total. Implementasikan tombol 'Checkout via WhatsApp' yang menghasilkan pesan pre-filled dengan detail pesanan dan mengarahkannya ke WhatsApp Web/API. Setelah checkout, data pesanan juga harus disimpan ke koleksi 'orders' di Firestore yang ditautkan dengan UID pengguna (jika login)."

**Prompt 8: Halaman Konfirmasi Pesanan**
"Buat halaman konfirmasi (`/checkout/success`) yang ditampilkan setelah pengguna menyelesaikan proses checkout. Halaman ini harus menampilkan ringkasan pesanan terakhir dari `sessionStorage` (sebagai fallback jika pengguna tidak login) dan mengucapkan terima kasih kepada pelanggan."

---

### **Fase 3: Konten & Fitur Komunitas**

**Prompt 9: Sistem Blog dengan Firestore**
"Sama seperti produk, buat sistem CRUD untuk postingan blog di `src/lib/blog-data.ts`. Postingan harus memiliki `title`, `slug`, `content` (dalam Markdown), `excerpt`, `category`, `image`, `author`, dan `date`. Buat halaman daftar blog (`/blog`) yang menampilkan postingan unggulan dan daftar postingan lainnya. Buat juga halaman detail (`/blog/[slug]`) yang merender konten Markdown menjadi HTML dan menampilkan informasi postingan."

**Prompt 10: Halaman Statis & Menu**
"Buat halaman-halaman berikut:
1.  **About Us (`/about`)**: Halaman informatif tentang perusahaan, nilai-nilai, dan tim.
2.  **Contact (`/contact`)**: Halaman dengan informasi kontak, peta lokasi (embedded Google Maps), dan formulir kontak fungsional yang menggunakan Resend untuk mengirim email.
3.  **In-Store Menu (`/menu`)**: Halaman yang menampilkan menu digital untuk pelanggan di toko, dikategorikan ke dalam tab (misalnya, Hot, Cold, Signature)."

**Prompt 11: Jadwal Acara**
"Buat halaman (`/events`) yang menampilkan daftar acara mendatang seperti workshop atau sesi cupping. Setiap acara harus ditampilkan dalam kartu dengan gambar, judul, tanggal, lokasi, deskripsi, dan tombol 'Register'. Fungsi 'Register' hanya akan menampilkan notifikasi toast sebagai konfirmasi."

---

### **Fase 4: Otentikasi & Dasbor Pengguna**

**Prompt 12: Otentikasi Pengguna**
"Implementasikan sistem otentikasi lengkap menggunakan Firebase Authentication. Buat halaman `/login` dan `/signup` dengan dukungan untuk Email/Password dan Google Sign-In. Gunakan React Context (`src/context/auth-context.tsx`) untuk mengelola status otentikasi di seluruh aplikasi. Pengguna yang berhasil login harus dialihkan ke halaman profil mereka."

**Prompt 13: Halaman Profil Pengguna**
"Buat halaman profil (`/profile`) yang hanya dapat diakses oleh pengguna yang sudah login. Halaman ini harus menampilkan informasi pengguna (nama, email, foto profil) dan riwayat pesanan mereka dengan mengambil data dari koleksi 'orders' di Firestore berdasarkan UID mereka."

**Prompt 14: Dasbor Admin Dasar**
"Buat halaman dasbor admin (`/dashboard`) yang dilindungi dan hanya dapat diakses oleh pengguna dengan email yang telah ditentukan sebagai admin. Buat navigasi samping untuk beralih antara berbagai tampilan manajemen. Tampilan awal harus berupa 'Overview' yang menampilkan metrik bisnis kunci (misalnya, total produk, total ulasan) dalam bentuk kartu dan beberapa bagan (misalnya, distribusi asal, popularitas produk)."

**Prompt 15: Manajemen CRUD di Dasbor**
"Implementasikan tampilan CRUD lengkap di dalam dasbor untuk:
1.  **Products**: Tambah, lihat, edit, dan hapus produk.
2.  **Blog Posts**: Tambah, lihat, edit, dan hapus postingan blog. Gunakan editor Markdown kustom dengan pratinjau langsung.
3.  **Events**: Tambah, lihat, edit, dan hapus acara.
4.  **Users**: Tampilkan daftar semua pengguna terdaftar, dengan kemampuan untuk menonaktifkan atau menghapus akun mereka.
5.  **Settings**: Buat formulir untuk mengelola pengaturan di seluruh situs seperti info kontak dan tautan media sosial, yang datanya diambil dari Firestore."

---

### **Fase 5: Finalisasi & Optimasi**

**Prompt 16: SEO & Metadata**
"Lakukan optimasi SEO. Hasilkan metadata dinamis untuk halaman produk dan blog. Buat `sitemap.ts` untuk menghasilkan sitemap.xml secara dinamis dan `robots.txt` untuk mengontrol perayapan mesin pencari."

**Prompt 17: Pembersihan & Dokumentasi**
"Terakhir, tinjau seluruh basis kode. Rapikan kode, hapus impor yang tidak digunakan, pastikan konsistensi gaya, dan tambahkan komentar jika diperlukan. Perbarui file `README.md` untuk mencerminkan semua fitur yang telah diimplementasikan dan berikan instruksi yang jelas tentang cara menjalankan proyek secara lokal."
