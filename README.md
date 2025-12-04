# 📱 ChatApp - Aplikasi Chat Real-time

Aplikasi mobile ChatApp sederhana

## 👨‍💻 Identitas Mahasiswa

- **Nama**: Rajwaa Muflihul Aufaa
- **NIM**: 24060123140189
- **Kelas**: PBP E

---

## 📋 Deskripsi Tugas

Tugas ini merupakan pengembangan aplikasi chat sederhana yang telah dipelajari di kelas dengan penambahan fitur-fitur berikut:

1. ✅ **Autentikasi pengguna** menggunakan username dan password
2. ✅ **Login otomatis** - pengguna tetap login meskipun aplikasi ditutup
3. ✅ **Simpan riwayat chat** di penyimpanan lokal untuk mode offline
4. ✅ **Unggah gambar** dari galeri

---

## 🎯 Fitur Aplikasi

### 🔐 **Autentikasi**
- Registrasi dengan username, email, dan password
- Login menggunakan **username ATAU email** + password
- Login otomatis menggunakan AsyncStorage (sesi persisten)
- Keluar dengan konfirmasi

### 💬 **Chat Waktu Nyata**
- Kirim dan terima pesan secara waktu nyata menggunakan Firebase Firestore
- Tampilan gelembung chat modern (biru untuk pesan sendiri, putih untuk orang lain)
- Tampilkan nama pengirim dan waktu pengiriman setiap pesan
- Riwayat chat disimpan di penyimpanan lokal (bisa dibaca tanpa internet)

### 📷 **Unggah Gambar**
- Pilih gambar dari galeri
- Pratinjau gambar sebelum dikirim (bisa dibatalkan)
- Kompresi otomatis (maksimal 900KB)
- Ketuk gambar yang sudah dikirim untuk melihat layar penuh

---

## 🛠️ Teknologi yang Digunakan

- **React Native** - Framework aplikasi mobile lintas platform
- **TypeScript** - JavaScript dengan tipe data yang aman
- **Firebase Authentication** - Sistem login/registrasi
- **Cloud Firestore** - Basis data waktu nyata
- **AsyncStorage** - Penyimpanan lokal untuk cache & login otomatis
- **React Native Image Picker** - Unggah gambar dari galeri

---

## 📱 Cara Menggunakan Aplikasi

### **1. Registrasi Akun Baru**
1. Buka aplikasi, akan muncul **Halaman Login**
2. Klik tombol **"Daftar disini"** di bawah
3. Isi formulir registrasi:
   - **Username**: minimal 3 karakter (contoh: `rajwaa`)
   - **Email**: format email yang valid (contoh: `rajwaa@mail.com`)
   - **Password**: minimal 6 karakter
   - **Konfirmasi Password**: harus sama dengan password
4. Klik tombol **DAFTAR**
5. Aplikasi otomatis login dan masuk ke **Halaman Chat**

### **2. Login**
1. Di **Halaman Login**, masukkan:
   - **Username atau Email** (bisa salah satu)
   - **Password**
2. Klik tombol **LOGIN**
3. Jika berhasil, akan masuk ke **Halaman Chat**

> **Catatan**: Setelah login, aplikasi akan menyimpan sesi. Jika aplikasi ditutup dan dibuka lagi, pengguna akan langsung masuk ke Halaman Chat tanpa perlu login ulang.

### **3. Mengirim Pesan**
1. Di **Halaman Chat**, ketik pesan di kolom input bawah
2. Klik tombol **KIRIM** (biru)
3. Pesan akan langsung muncul di chat (waktu nyata)

### **4. Mengirim Gambar**
1. Klik ikon **📷** di sebelah kiri kolom input
2. Pilih gambar dari galeri
3. Akan muncul **pratinjau gambar** dengan 2 tombol:
   - **Batal**: membatalkan pengiriman
   - **Kirim**: mengirim gambar ke chat
4. Gambar yang dikirim akan muncul di chat

### **5. Melihat Gambar Layar Penuh**
1. Ketuk pada gambar yang ada di chat
2. Gambar akan ditampilkan layar penuh
3. Klik tombol **✕** di pojok kanan atas untuk menutup

### **6. Keluar**
1. Klik tombol **LOGOUT** (merah) di pojok kanan atas
2. Konfirmasi dengan klik **Logout** di dialog
3. Akan kembali ke **Halaman Login**

---

## 🚀 Cara Menjalankan Proyek

### **Prasyarat**
- Node.js (versi 18 atau lebih baru)
- Android Studio + Android SDK
- JDK 17

### **Langkah 1: Instalasi Dependensi**

```bash
npm install
```

### **Langkah 2: Jalankan Metro Bundler**

```bash
npx react-native start
```

### **Langkah 3: Jalankan Aplikasi**

Buka terminal baru dan jalankan:

#### Untuk Android

```bash
# Menggunakan npm
npm run android

# ATAU menggunakan Yarn
yarn android
```

#### Untuk iOS

Untuk iOS, pastikan untuk menginstal dependensi CocoaPods terlebih dahulu:

```bash
# Instal Ruby bundler (hanya sekali)
bundle install

# Instal pod dependencies
bundle exec pod install
```

Kemudian jalankan:

```bash
# Menggunakan npm
npm run ios

# ATAU menggunakan Yarn
yarn ios
```

### **Jika Terjadi Error**

```bash
# Reset cache
npx react-native start --reset-cache

# Bersihkan build Android
cd android && ./gradlew clean && cd ..
```

---

## 📂 Struktur Proyek

```
ChatApp/
├── screens/
│   ├── LoginScreen.tsx      
│   ├── RegisterScreen.tsx    
│   └── ChatScreen.tsx        
├── firebase.ts               
├── App.tsx                  
└── README.md                
```

---

## 📸 UI

1. **Halaman Login**: Formulir login dengan opsi ke registrasi
2. **Halaman Registrasi**: Formulir registrasi dengan 4 kolom input
3. **Halaman Chat**: 
   - Header dengan info pengguna + tombol keluar
   - Area chat dengan gelembung pesan
   - Footer dengan ikon kamera, input teks, dan tombol kirim

---

## 📝 Catatan

- Aplikasi menggunakan **Firebase Firestore** untuk basis data waktu nyata
- Gambar disimpan dalam format **Base64** dengan ukuran maksimal **900KB**
- **Login otomatis** bekerja dengan menyimpan sesi di AsyncStorage
- **Mode offline** memungkinkan pengguna membaca chat lama tanpa internet
- Semua fitur sudah **diuji dan berjalan dengan baik**

---
