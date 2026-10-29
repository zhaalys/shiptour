# Rencana supervisor (review otomatis adaCODE)
Status: BERJALAN · Sumber: review APPROVED (claude) · Diperbarui: 2026-10-29 18:33
<!-- adacode:rencana-supervisor — ditulis ulang tiap review; catatan Anda sendiri taruh di handoff lain -->

## Tugas terakhir
layoutnya tetep sama cuman iconnya aja yang ilangin

## Ringkasan review
Perubahan giliran ini (menyembunyikan ikon saat field image kosong, layout tetap sama, aset tetap CDN Greenpeace) sudah diimplementasikan dengan benar di semua jalur render: resolveIcon() mengembalikan null untuk nilai kosong (index.js:394-397), lalu elemen ikon disembunyikan di pratinjau share-arrows (528), kartu marquee (656), pratinjau kartu pengguna (731), dan modal share (1254) — sesuai permintaan "postcard kosong iconnya jangan diisi". Aset ikon dan latar postcard memakai URL CDN greenpeace.org persis seperti yang diminta pengguna, tanpa referensi file lokal assets/ tersisa di kode. Bukt

## Langkah berikutnya — JUNIOR
- [ ] (sedang) junior: samakan jalur fallback generatePostcardCanvas (index.js:953) agar kartu pos dengan image kosong tidak digambar stempel Rainbow Warrior, konsisten dengan jalur html2canvas yang menyembunyikan ikon.
- [ ] (rendah) junior: bersihkan kode mati handleMessageSubmit (index.js:692) atau gantikan dengan hook event onFormSubmitted HubSpot agar preview kartu pos pengguna tetap terisi.

## Langkah berikutnya — SENIOR (verifikasi)
- [ ] (tinggi) senior: uji ujung-ke-ujung unduh "Unduh Gambar Kartu Pos" pada data dengan image kosong (postcard josua) di desktop dan mobile, pastikan PNG hasil html2canvas tidak menampilkan ikon dan latar postcard CDN ikut ter-render tanpa galat CORS.
- [ ] (sedang) senior: uji tombol share (WhatsApp/Instagram/X/Threads) dengan Web Share API file image/png di perangkat nyata, termasuk fallback unduhan+clipboard.

## Langkah berikutnya — PENGGUNA (keputusan/akses)
- [ ] (sedang) pengguna: verifikasi visual hasil unduhan dengan data asli sheet (termasuk postcard josua) dan putuskan apakah stempel pengganti di jalur fallback boleh dipertahankan atau harus kosong.
