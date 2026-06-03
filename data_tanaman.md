# Data Tanaman Obat - Versi Rapih untuk Seeder

File ini sudah dinormalisasi agar data yang sering berulang, terutama **kondisi medis/keluhan** dan **gejala**, tidak perlu disimpan berulang di setiap tanaman.

> Catatan revisi: relasi tanaman-kondisi pada file ini sudah dikurangi agar setiap tanaman hanya menyimpan keluhan yang lebih kuat, lebih umum digunakan, dan lebih aman untuk ditampilkan sebagai klaim pendamping. Redaksi manfaat tetap dibuat sebagai "membantu" atau "pendamping", bukan klaim menyembuhkan penyakit secara mutlak.

## Ringkasan Normalisasi

| Item                        | Jumlah |
| --------------------------- | -----: |
| Tanaman unik                |     60 |
| Kondisi/keluhan master unik |     34 |
| Relasi tanaman-kondisi      |    119 |
| Cara pengolahan             |    106 |
| Kelompok risiko master      |     33 |

## Aturan Unique Key yang Disarankan

- `tanaman.slug` harus unik.
- `kondisi_master.slug` harus unik.
- Relasi `tanaman_slug + kondisi_slug` harus unik agar satu tanaman tidak memiliki kondisi yang sama dua kali.
- Relasi `tanaman_slug + kelompok_risiko_slug` harus unik.
- Relasi `pengolahan_slug + kondisi_slug` harus unik.
- Untuk Laravel, gunakan `updateOrCreate()` atau `updateOrInsert()` berdasarkan kolom `slug` agar seeder aman dijalankan berulang.

## Struktur Data yang Direkomendasikan

1. `tanaman` — profil utama tanaman.
2. `kondisi_master` — daftar penyakit/keluhan dan gejala unik.
3. `tanaman_kondisi` — pivot/relasi banyak-ke-banyak antara tanaman dan kondisi.
4. `kelompok_risiko_master` — kelompok/kondisi yang perlu berhati-hati.
5. `tanaman_kelompok_risiko` — pivot/relasi tanaman dan kelompok risiko.
6. `pengolahan` — cara pengolahan per tanaman; bisa terkait ke satu atau beberapa kondisi.

## Master Kondisi/Keluhan dan Gejala

| Kode   | Slug                             | Nama Kondisi/Keluhan           | Gejala Wajib/Utama                                                           | Gejala Umum                                                                                                      | Jumlah Tanaman Terkait |
| ------ | -------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------: |
| KND001 | `mual`                           | Mual                           | rasa ingin muntah/perut tidak enak sebagai keluhan utama                     | muntah; pusing; keringat dingin; lemas; nafsu makan turun                                                        |                      5 |
| KND002 | `mabuk-perjalanan`               | Mabuk Perjalanan               | mual saat naik kendaraan/perjalanan                                          | pusing; keringat dingin; muntah; mengantuk; lemas                                                                |                      2 |
| KND003 | `dispepsia-kembung`              | Dispepsia/Kembung              | rasa tidak nyaman; begah; kembung; nyeri ulu hati setelah/di antara makan    | sendawa; cepat kenyang; mual; perut terasa penuh; rasa panas di dada bila berkaitan dengan asam lambung          |                     19 |
| KND004 | `batuk-ispa-ringan`              | Batuk/ISPA Ringan              | batuk; pilek; tenggorokan terasa tidak nyaman                                | hidung tersumbat; bersin; dahak; demam ringan; nyeri kepala; badan pegal                                         |                      6 |
| KND005 | `diare`                          | Diare                          | BAB cair/lembek lebih sering dari biasanya; umumnya ≥3 kali/hari             | kram perut; mual; perut mulas; rasa ingin BAB mendadak; lemas; tanda dehidrasi                                   |                      3 |
| KND006 | `sariawan-radang-mulut`          | Sariawan/Radang Mulut          | luka kecil/bercak nyeri di mulut; bibir; lidah; gusi                         | perih saat makan pedas/asam; bau mulut; gusi merah; mulut terasa kering                                          |                      3 |
| KND007 | `isk-ringan`                     | ISK Ringan                     | nyeri/panas saat buang air kecil atau sering ingin BAK                       | anyang-anyangan; urin keruh/berbau; nyeri perut bawah; demam ringan; rasa tidak tuntas setelah BAK               |                      2 |
| KND008 | `batu-ginjal-saluran-kemih`      | Batu Ginjal/Saluran Kemih      | nyeri tajam/kolik di pinggang, punggung samping, perut bawah; nyeri saat BAK | urin merah/berdarah; mual muntah; demam/menggigil bila ada infeksi; urin keruh/berbau                            |                      3 |
| KND009 | `radang-tenggorokan`             | Radang Tenggorokan             | nyeri atau perih saat menelan                                                | tenggorokan merah; suara serak; demam ringan; batuk; pembesaran kelenjar leher                                   |                      3 |
| KND010 | `demam`                          | Demam                          | suhu tubuh meningkat di atas normal atau badan terasa panas                  | menggigil; berkeringat; lemas; nyeri otot; sakit kepala; nafsu makan turun                                       |                      2 |
| KND011 | `luka-ringan`                    | Luka Ringan                    | kulit tergores/terbuka ringan atau lecet superfisial                         | nyeri lokal; kemerahan; bengkak ringan; perdarahan sedikit; rasa perih                                           |                      3 |
| KND012 | `gatal-infeksi-jamur-kulit`      | Gatal/Infeksi Jamur Kulit      | gatal dengan ruam/bercak kulit yang menetap                                  | kulit kemerahan; bersisik; tepi melingkar pada kurap; rasa perih; kulit lembap/pecah                             |                      4 |
| KND013 | `nafsu-makan-turun`              | Nafsu Makan Turun              | keinginan makan menurun dari biasanya                                        | cepat kenyang; berat badan turun; lemas; mual                                                                    |                      6 |
| KND014 | `gangguan-empedu-hati-ringan`    | Gangguan Empedu/Hati Ringan    | keluhan pencernaan atau rasa penuh di perut kanan atas                       | mual; kuning pada mata atau kulit; urin gelap; nyeri perut kanan atas                                            |                      0 |
| KND015 | `keputihan-tidak-normal`         | Keputihan Tidak Normal         | cairan vagina berubah warna/bau/jumlah atau disertai gatal/nyeri             | bau tidak sedap; gatal; perih saat BAK; nyeri panggul                                                            |                      2 |
| KND016 | `nyeri-otot-pegal`               | Nyeri Otot/Pegal               | nyeri atau pegal pada otot setelah aktivitas/ketegangan                      | kaku; mudah lelah; nyeri tekan; gerak terbatas ringan                                                            |                      3 |
| KND017 | `diabetes-gula-darah-tinggi`     | Diabetes/Gula Darah Tinggi     | hasil pemeriksaan gula darah tinggi                                          | sering haus; sering BAK; cepat lapar; berat badan turun tanpa sebab; lelah; penglihatan kabur; luka sulit sembuh |                     12 |
| KND018 | `bau-mulut`                      | Bau Mulut                      | napas berbau tidak sedap yang menetap                                        | mulut kering; lidah berlapis; gusi mudah berdarah; rasa tidak enak di mulut                                      |                      6 |
| KND019 | `sembelit`                       | Sembelit                       | BAB sulit; jarang; feses keras                                               | kembung; mengejan; rasa tidak tuntas; nyeri perut ringan                                                         |                      3 |
| KND020 | `bau-badan`                      | Bau Badan                      | bau tubuh tidak sedap yang menetap                                           | keringat berlebih; pakaian cepat berbau; iritasi lipatan kulit                                                   |                      1 |
| KND021 | `hipertensi`                     | Hipertensi                     | hasil pengukuran tekanan darah berulang tinggi                               | sakit kepala; pusing; berdebar; mudah lelah; mimisan                                                             |                      6 |
| KND022 | `nyeri-haid`                     | Nyeri Haid                     | nyeri/kram perut bawah saat atau menjelang haid                              | nyeri pinggang; mual; sakit kepala; lemas; diare ringan                                                          |                      2 |
| KND023 | `asam-urat-nyeri-sendi`          | Asam Urat/Nyeri Sendi          | nyeri sendi (terutama bila datang mendadak atau berulang)                    | sendi bengkak; kemerahan pada sendi; sendi terasa hangat; kekakuan sendi; nyeri saat sendi digerakkan            |                      3 |
| KND024 | `cacingan`                       | Cacingan                       | ditemukan cacing/telur cacing atau dicurigai kuat dari pemeriksaan/riwayat   | gatal anus; nyeri perut; perut kembung; diare; berat badan sulit naik; anemia/lemas                              |                      1 |
| KND025 | `mata-lelah`                     | Mata Lelah                     | mata terasa pegal/kering atau buram sementara setelah aktivitas visual       | mata merah ringan; mata berair; silau; sakit kepala                                                              |                      1 |
| KND026 | `stres-ringan-sulit-tidur`       | Stres Ringan/Sulit Tidur       | gelisah ringan; sulit memulai tidur; tidur tidak nyenyak                     | tegang; mudah marah; sulit fokus; berdebar; lelah saat bangun                                                    |                      3 |
| KND027 | `rambut-ketombe`                 | Rambut/Ketombe                 | kulit kepala bersisik/gatal atau rambut mudah rontok ringan                  | ketombe; kulit kepala berminyak/kering; kemerahan ringan                                                         |                      2 |
| KND028 | `iritasi-kulit`                  | Iritasi Kulit                  | kemerahan/perih/gatal setelah kontak ringan dengan iritan                    | kulit kering; bersisik; bengkak ringan; rasa panas                                                               |                      4 |
| KND029 | `kelelahan-stamina-turun`        | Kelelahan/Stamina Turun        | rasa lelah yang mengganggu aktivitas                                         | mengantuk; sulit konsentrasi; nyeri otot; motivasi turun                                                         |                      1 |
| KND030 | `luka-bakar-ringan`              | Luka Bakar Ringan              | kulit merah dan nyeri setelah terkena panas/sinar matahari ringan            | bengkak ringan; kulit terasa panas; perih; kadang melepuh kecil                                                  |                      1 |
| KND031 | `kolesterol-tinggi-dislipidemia` | Kolesterol Tinggi/Dislipidemia | hasil pemeriksaan lipid darah tinggi; biasanya tanpa gejala                  | xanthelasma (benjolan lemak di kelopak mata); mudah lelah                                                        |                      4 |
| KND032 | `gigitan-serangga`               | Gigitan Serangga               | bentol/ruam gatal setelah gigitan/ sengatan ringan                           | kemerahan pada kulit; bengkak ringan; rasa panas di area gigitan                                                 |                      1 |
| KND033 | `bisul`                          | Bisul                          | benjolan merah nyeri berisi nanah pada kulit                                 | bengkak; hangat; kulit sekitar kemerahan; kadang demam bila infeksi meluas                                       |                      1 |
| KND034 | `wasir`                          | Wasir                          | benjolan/nyeri anus atau perdarahan merah segar saat BAB                     | gatal anus; rasa tidak tuntas; nyeri saat duduk; lendir                                                          |                      1 |

## Master Kelompok Risiko

| Kode   | Slug                                | Nama Kelompok Risiko                                    |
| ------ | ----------------------------------- | ------------------------------------------------------- |
| RSK001 | `ibu-hamil`                         | Ibu hamil                                               |
| RSK002 | `ibu-menyusui`                      | Ibu menyusui                                            |
| RSK003 | `bayi-anak-kecil`                   | Bayi/anak kecil                                         |
| RSK004 | `gangguan-perdarahan`               | Gangguan perdarahan                                     |
| RSK005 | `pengguna-pengencer-darah`          | Pengguna obat pengencer darah/antikoagulan/antiplatelet |
| RSK006 | `pasien-sebelum-operasi`            | Pasien sebelum operasi                                  |
| RSK007 | `gerd-maag-gastritis-tukak`         | GERD/maag/gastritis/tukak lambung                       |
| RSK008 | `diabetes-obat-antidiabetes`        | Diabetes/pengguna obat antidiabetes                     |
| RSK009 | `hipertensi-obat-antihipertensi`    | Hipertensi/pengguna obat antihipertensi                 |
| RSK010 | `tekanan-darah-rendah`              | Tekanan darah rendah/hipotensi                          |
| RSK011 | `penyakit-ginjal-gagal-ginjal`      | Penyakit ginjal/gagal ginjal                            |
| RSK012 | `penyakit-hati`                     | Penyakit/gangguan hati                                  |
| RSK013 | `batu-empedu-sumbatan-empedu`       | Batu empedu/sumbatan saluran empedu                     |
| RSK014 | `dehidrasi-diare`                   | Dehidrasi/diare                                         |
| RSK015 | `pengguna-diuretik-lithium-digoxin` | Pengguna diuretik/lithium/digoxin                       |
| RSK016 | `edema-gagal-jantung-ginjal`        | Edema karena gagal jantung/ginjal                       |
| RSK017 | `kulit-mukosa-sensitif-luka`        | Kulit/mukosa sensitif atau luka                         |
| RSK018 | `penyakit-mata-kornea-lensa-kontak` | Penyakit mata/luka kornea/pengguna lensa kontak         |
| RSK019 | `asma-epilepsi`                     | Asma/epilepsi                                           |
| RSK020 | `autoimun-imunosupresan`            | Penyakit autoimun/pengguna imunosupresan                |
| RSK021 | `gangguan-kesuburan`                | Gangguan kesuburan                                      |
| RSK022 | `parkinson-gangguan-gerak`          | Parkinson/gangguan gerak                                |
| RSK023 | `kadar-kalium-tinggi`               | Kadar kalium tinggi/hiperkalemia                        |
| RSK024 | `batu-ginjal-oksalat`               | Riwayat batu ginjal oksalat                             |
| RSK025 | `pasien-kemoterapi`                 | Pasien kemoterapi                                       |
| RSK026 | `riwayat-kanker`                    | Riwayat kanker                                          |
| RSK027 | `alergi`                            | Alergi                                                  |
| RSK028 | `gigi-sensitif-enamel-tipis`        | Gigi sensitif/enamel tipis                              |
| RSK029 | `fotosensitif-dermatitis`           | Dermatitis/fotosensitivitas kulit                       |
| RSK030 | `gangguan-usus-ibd-sumbatan-usus`   | Gangguan usus/IBD/sumbatan usus                         |
| RSK031 | `gangguan-elektrolit`               | Gangguan elektrolit                                     |
| RSK032 | `pengguna-obat-rutin-tertentu`      | Pengguna obat rutin/obat tertentu                       |
| RSK033 | `semua-orang-bila-diminum`          | Semua orang bila diminum/digunakan oral berbahaya       |

## Relasi Tanaman-Kondisi

| Tanaman                          | Kondisi/Keluhan Terkait                                        |
| -------------------------------- | -------------------------------------------------------------- |
| TAN001 - Jahe Merah              | `mual`; `mabuk-perjalanan`; `dispepsia-kembung`                |
| TAN002 - Jambu Biji              | `diare`; `sariawan-radang-mulut`                               |
| TAN003 - Keji Beling             | `isk-ringan`; `batu-ginjal-saluran-kemih`                      |
| TAN004 - Kembang Sepatu          | `batuk-ispa-ringan`; `radang-tenggorokan`                      |
| TAN005 - Jarak Tintir            | `luka-ringan`                                                  |
| TAN006 - Temulawak               | `nafsu-makan-turun`; `dispepsia-kembung`                       |
| TAN007 - Sirih Merah             | `sariawan-radang-mulut`; `luka-ringan`                         |
| TAN008 - Kencur                  | `batuk-ispa-ringan`; `dispepsia-kembung`                       |
| TAN009 - Daun Salam              | `diabetes-gula-darah-tinggi`; `diare`                          |
| TAN010 - Jeruk Nipis             | `batuk-ispa-ringan`; `radang-tenggorokan`; `bau-mulut`         |
| TAN011 - Jarak                   | `sembelit`                                                     |
| TAN012 - Kapulaga                | `dispepsia-kembung`; `bau-mulut`                               |
| TAN013 - Sirih Hijau             | `sariawan-radang-mulut`; `bau-mulut`; `bau-badan`; `keputihan-tidak-normal` |
| TAN014 - Kumis Kucing            | `isk-ringan`; `batu-ginjal-saluran-kemih`                      |
| TAN015 - Kunyit                  | `dispepsia-kembung`; `nyeri-haid`; `keputihan-tidak-normal`          |
| TAN016 - Temu Ireng              | `nafsu-makan-turun`; `cacingan`                                |
| TAN017 - Sirsak                  | `hipertensi`; `asam-urat-nyeri-sendi`                          |
| TAN018 - Mengkudu                | `hipertensi`; `diabetes-gula-darah-tinggi`                     |
| TAN019 - Sambiloto               | `batuk-ispa-ringan`; `demam`                                   |
| TAN020 - Tapak Dara              | —                                                              |
| TAN021 - Tempuyung               | `batu-ginjal-saluran-kemih`; `asam-urat-nyeri-sendi`           |
| TAN022 - Bunga Telang            | `mata-lelah`; `stres-ringan-sulit-tidur`                       |
| TAN023 - Lengkuas Putih          | `dispepsia-kembung`; `gatal-infeksi-jamur-kulit`               |
| TAN024 - Daun Mangkokan          | `rambut-ketombe`; `iritasi-kulit`                              |
| TAN025 - Ketepeng Cina           | `gatal-infeksi-jamur-kulit`; `iritasi-kulit`                   |
| TAN026 - Ginseng Jawa            | `kelelahan-stamina-turun`; `nafsu-makan-turun`                 |
| TAN027 - Serai Kampung           | `dispepsia-kembung`; `stres-ringan-sulit-tidur`                |
| TAN028 - Jahe                    | `mual`; `mabuk-perjalanan`; `dispepsia-kembung`                |
| TAN029 - Daun Afrika             | `diabetes-gula-darah-tinggi`; `nafsu-makan-turun`              |
| TAN030 - Garut                   | `diare`; `dispepsia-kembung`                                   |
| TAN031 - Lidah Buaya             | `luka-bakar-ringan`; `iritasi-kulit`                           |
| TAN032 - Patah Tulang            | —                                                              |
| TAN033 - Jeringau / Deringo      | `mual`; `dispepsia-kembung`                                    |
| TAN034 - Kintolod / Daun Katarak | —                                                              |
| TAN035 - Zaitun                  | `hipertensi`; `kolesterol-tinggi-dislipidemia`                 |
| TAN036 - Lempuyang               | `nafsu-makan-turun`; `dispepsia-kembung`                       |
| TAN037 - Cincau Rambat           | `dispepsia-kembung`; `sembelit`                                |
| TAN038 - Kayu Putih              | `batuk-ispa-ringan`; `nyeri-otot-pegal`                        |
| TAN039 - Kayu Manis              | `diabetes-gula-darah-tinggi`; `kolesterol-tinggi-dislipidemia` |
| TAN040 - Stevia                  | `diabetes-gula-darah-tinggi`                                   |
| TAN041 - Serai Wangi             | `gigitan-serangga`; `nyeri-otot-pegal`                         |
| TAN042 - Lengkuas Merah          | `dispepsia-kembung`; `gatal-infeksi-jamur-kulit`               |
| TAN043 - Kunyit Putih            | `dispepsia-kembung`; `nyeri-haid`                              |
| TAN044 - Insulin                 | `diabetes-gula-darah-tinggi`                                   |
| TAN045 - Bratawali               | `demam`; `diabetes-gula-darah-tinggi`                          |
| TAN046 - Cincau Daun Lebar       | `dispepsia-kembung`; `sembelit`                                |
| TAN047 - Jeruk Purut             | `mual`; `bau-mulut`; `rambut-ketombe`                          |
| TAN048 - Rosela                  | `hipertensi`; `kolesterol-tinggi-dislipidemia`                 |
| TAN049 - Bawang Dayak            | `diabetes-gula-darah-tinggi`; `hipertensi`                     |
| TAN050 - Bunga Piladang          | `bisul`; `wasir`                                               |
| TAN051 - Tanaman Selasih         | `dispepsia-kembung`; `stres-ringan-sulit-tidur`                |
| TAN052 - Kenikir                 | `nafsu-makan-turun`; `diabetes-gula-darah-tinggi`              |
| TAN053 - Jeruk Kasturi           | `batuk-ispa-ringan`; `radang-tenggorokan`; `bau-mulut`         |
| TAN054 - Sambung Nyawa           | `hipertensi`; `diabetes-gula-darah-tinggi`                     |
| TAN055 - Jadam Centong           | `luka-ringan`; `iritasi-kulit`                                 |
| TAN056 - Kemuning                | `asam-urat-nyeri-sendi`; `gatal-infeksi-jamur-kulit`           |
| TAN057 - Daun Kari               | `dispepsia-kembung`; `diabetes-gula-darah-tinggi`              |
| TAN058 - Merica                  | `dispepsia-kembung`; `nyeri-otot-pegal`                        |
| TAN059 - Mulberry                | `diabetes-gula-darah-tinggi`; `kolesterol-tinggi-dislipidemia` |
| TAN060 - Daun Mint               | `mual`; `dispepsia-kembung`; `bau-mulut`                       |

## Data Tanaman Ternormalisasi

### TAN001 — Jahe Merah

| Field                            | Isi                                                                                                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `jahe-merah`                                                                                                                                                                                                                             |
| Nama lokal                       | Jahe Merah                                                                                                                                                                                                                               |
| Nama latin                       | Zingiber officinale Roscoe var. rubrum                                                                                                                                                                                                   |
| Deskripsi                        | Jahe merah adalah rimpang jahe berwarna kemerahan yang rasanya pedas hangat. Tanaman ini sangat akrab digunakan sebagai bumbu dapur dan minuman herbal untuk membantu tubuh terasa lebih hangat.                                         |
| Senyawa aktif utama              | gingerol, shogaol, zingerone, minyak atsiri zingiberene/bisabolene                                                                                                                                                                       |
| Manfaat/khasiat tradisional      | Meredakan mual, mengurangi mual saat mabuk perjalanan, serta membantu perut terasa lebih nyaman saat dispepsia/kembung. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada pengguna pengencer darah, gangguan perdarahan, GERD berat, dan menjelang operasi, ibu hamil sebaiknya memakai dosis pangan/minuman ringan dan berkonsultasi bila ingin dosis tinggi.                                      |
| Kondisi refs                     | `mual`; `mabuk-perjalanan`; `dispepsia-kembung`                                                                                                                                                                                          |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                                                 |
| Kondisi/kelompok raw        | Ibu hamil terutama mendekati persalinan, gangguan perdarahan, pengguna warfarin/aspirin/clopidogrel, gastritis/GERD berat, pasien sebelum operasi.                     |
| Kelompok risiko refs        | `ibu-hamil`; `gangguan-perdarahan`; `pengguna-pengencer-darah`; `pasien-sebelum-operasi`; `gerd-maag-gastritis-tukak`                                                  |
| Bagian/cara pakai pantangan | Rimpang dosis tinggi, ekstrak/kapsul, rebusan sangat pekat.                                                                                                            |
| Alasan risiko               | Jahe dapat menimbulkan heartburn, iritasi lambung, diare, serta perlu kehati-hatian bila dikombinasikan dengan obat karena potensi interaksi dan efek pada perdarahan. |

#### Cara Pengolahan

| Kode     | Judul                     | Kondisi refs               | Bagian yang digunakan | Cara pengolahan                                                                                                                                                                   | Cara pakai tradisional                                           | Catatan keamanan                                                                                                   |
| -------- | ------------------------- | -------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| OLH00101 | Mual dan mabuk perjalanan | `mual`; `mabuk-perjalanan` | Rimpang segar         | Cuci rimpang, kupas tipis bila perlu, lalu iris atau memarkan. Seduh dengan air panas atau rebus ringan sampai air beraroma hangat. Madu dapat ditambahkan setelah ramuan hangat. | Diminum hangat sedikit-sedikit sebelum atau saat keluhan muncul. | Hindari ramuan sangat pekat pada GERD berat, gangguan perdarahan, pengguna pengencer darah, dan menjelang operasi. |
| OLH00102 | Dispepsia/kembung         | `dispepsia-kembung`        | Rimpang segar         | Rimpang dimemarkan, kemudian diseduh bersama air panas. Dapat dicampur sedikit serai atau gula aren bila tidak ada diabetes.                                                      | Diminum hangat setelah makan dalam jumlah wajar.                 | Hentikan bila dada terasa panas, nyeri lambung bertambah, atau diare.                                              |

### TAN002 — Jambu Biji

| Field                            | Isi                                                                                                                                                                                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `jambu-biji`                                                                                                                                                                                                                |
| Nama lokal                       | Jambu Biji                                                                                                                                                                                                                  |
| Nama latin                       | Psidium guajava L.                                                                                                                                                                                                          |
| Deskripsi                        | Jambu biji adalah tanaman buah yang mudah ditemukan di sekitar rumah. Selain buahnya kaya vitamin C, daun mudanya juga sering digunakan dalam ramuan tradisional untuk membantu keluhan pencernaan.                         |
| Senyawa aktif utama              | tanin, quercetin, flavonoid, vitamin C, karotenoid, minyak atsiri                                                                                                                                                           |
| Manfaat/khasiat tradisional      | Membantu diare ringan sebagai pendamping cairan serta menjaga kebersihan mulut saat sariawan/radang mulut. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Jangan mengganti cairan oralit/terapi dokter pada diare berat, buah dapat memengaruhi gula darah pada sebagian orang.                                                                                                       |
| Kondisi refs                     | `diare`; `sariawan-radang-mulut`                                                                                                                                                                                            |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                                                  |
| Kondisi/kelompok raw        | Penderita diabetes yang memakai obat penurun gula darah, konstipasi berat, ibu hamil/menyusui bila memakai ekstrak dosis tinggi.                               |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`                                                                                                      |
| Bagian/cara pakai pantangan | Daun/rebusan pekat, buah muda berlebihan pada orang yang mudah sembelit.                                                                                       |
| Alasan risiko               | Daun jambu mengandung tanin dan senyawa fenolik, dapat membantu diare, tetapi dosis tinggi dapat memperberat konstipasi dan berpotensi memengaruhi gula darah. |

#### Cara Pengolahan

| Kode     | Judul                 | Kondisi refs            | Bagian yang digunakan | Cara pengolahan                                                                                                           | Cara pakai tradisional                                    | Catatan keamanan                                                                                                                           |
| -------- | --------------------- | ----------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| OLH00201 | Diare ringan          | `diare`                 | Daun muda             | Cuci beberapa daun muda, rebus dengan air bersih hingga menjadi rebusan ringan, lalu saring. Jangan dibuat terlalu pekat. | Diminum sedikit-sedikit sebagai pendamping cairan/oralit. | Jangan digunakan sebagai pengganti oralit. Segera periksa bila diare berdarah, dehidrasi, demam tinggi, bayi/anak kecil, atau diare berat. |
| OLH00202 | Sariawan/radang mulut | `sariawan-radang-mulut` | Daun muda             | Daun dicuci, direbus ringan, didinginkan, lalu disaring.                                                                  | Dipakai untuk berkumur, kemudian dibuang.                 | Jangan ditelan berlebihan, hentikan bila mulut terasa kering/iritasi.                                                                      |

### TAN003 — Keji Beling

| Field                            | Isi                                                                                                                                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `keji-beling`                                                                                                                                                                                                                                               |
| Nama lokal                       | Keji Beling                                                                                                                                                                                                                                                 |
| Nama latin                       | Strobilanthes crispus (L.) Blume / Sericocalyx crispus (sinonim yang sering dipakai)                                                                                                                                                                        |
| Deskripsi                        | Keji beling adalah tanaman perdu dengan daun bergerigi yang cukup dikenal dalam ramuan tradisional. Daunnya sering dimanfaatkan sebagai pendamping untuk membantu melancarkan buang air kecil.                                                              |
| Senyawa aktif utama              | flavonoid, tanin, saponin, kalium, silika/asam silikat                                                                                                                                                                                                      |
| Manfaat/khasiat tradisional      | Mendukung keluhan ISK ringan sebagai pendamping minum air yang cukup serta mendukung keluhan batu saluran kemih ringan sebagai pendamping. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada penyakit ginjal berat, dehidrasi, pengguna diuretik/lithium, ibu hamil/menyusui, batu/ISK perlu evaluasi dokter bila nyeri hebat, demam, atau kencing berdarah.                                                                              |
| Kondisi refs                     | `isk-ringan`; `batu-ginjal-saluran-kemih`                                                                                                                                                                                                                   |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                              |
| Kondisi/kelompok raw        | Penyakit ginjal berat/gagal ginjal, dehidrasi, pengguna obat diuretik, pengguna lithium, ibu hamil/menyusui.                                        |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `penyakit-ginjal-gagal-ginjal`; `dehidrasi-diare`; `pengguna-diuretik-lithium-digoxin`                                 |
| Bagian/cara pakai pantangan | Daun sebagai rebusan peluruh kencing dalam dosis tinggi/lama.                                                                                       |
| Alasan risiko               | Secara tradisional digunakan sebagai diuretik/peluruh batu, efek diuretik dapat mengganggu cairan-elektrolit dan membebani kondisi ginjal tertentu. |

#### Cara Pengolahan

| Kode     | Judul                                        | Kondisi refs                | Bagian yang digunakan | Cara pengolahan                                                                                       | Cara pakai tradisional                                                        | Catatan keamanan                                                                                                                            |
| -------- | -------------------------------------------- | --------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| OLH00301 | ISK ringan/anyang-anyangan                   | `isk-ringan`                | Daun                  | Cuci daun, rebus ringan dengan air bersih, lalu saring. Ramuan dibuat encer dan tidak digunakan lama. | Diminum sebagai pendamping minum air putih yang cukup.                        | Tidak untuk gagal ginjal, dehidrasi, ibu hamil/menyusui, pengguna diuretik/lithium. Periksa bila demam, nyeri pinggang, atau urin berdarah. |
| OLH00302 | Batu ginjal/saluran kemih sebagai pendamping | `batu-ginjal-saluran-kemih` | Daun                  | Daun dicuci dan direbus ringan sebagai ramuan peluruh kencing tradisional.                            | Diminum terbatas sambil menjaga asupan cairan, bukan untuk nyeri kolik berat. | Nyeri hebat, muntah, demam, atau tidak bisa BAK harus segera ditangani medis.                                                               |

### TAN004 — Kembang Sepatu

| Field                            | Isi                                                                                                                                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kembang-sepatu`                                                                                                                                                                                      |
| Nama lokal                       | Kembang Sepatu                                                                                                                                                                                        |
| Nama latin                       | Hibiscus rosa-sinensis L.                                                                                                                                                                             |
| Deskripsi                        | Kembang sepatu adalah tanaman hias berbunga besar yang juga dikenal dalam penggunaan tradisional. Bagian bunga dan daunnya memiliki lendir alami yang terasa menenangkan saat digunakan dengan tepat. |
| Senyawa aktif utama              | flavonoid, antosianin, mucilage/lendir, asam organik, polifenol                                                                                                                                       |
| Manfaat/khasiat tradisional      | Melegakan batuk/ISPA ringan serta menenangkan radang tenggorokan ringan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter.             |
| Perhatian/kontraindikasi ringkas | Hindari ekstrak pekat pada ibu hamil/menyusui tanpa arahan, hati-hati bila memakai obat tekanan darah.                                                                                                |
| Kondisi refs                     | `batuk-ispa-ringan`; `radang-tenggorokan`                                                                                                                                                             |

#### Kontraindikasi

| Field                       | Isi                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                              |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, tekanan darah rendah, pengguna obat antihipertensi/antidiabetes.                                |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah` |
| Bagian/cara pakai pantangan | Bunga/daun ekstrak pekat atau konsumsi rutin dosis obat.                                                            |
| Alasan risiko               | Hibiscus dapat memiliki efek terhadap tekanan darah dan metabolisme, keamanan dosis obat pada kehamilan belum kuat. |

#### Cara Pengolahan

| Kode     | Judul                                    | Kondisi refs                              | Bagian yang digunakan | Cara pengolahan                                                                      | Cara pakai tradisional                               | Catatan keamanan                                                               |
| -------- | ---------------------------------------- | ----------------------------------------- | --------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------ |
| OLH00401 | Batuk/ISPA ringan dan radang tenggorokan | `batuk-ispa-ringan`; `radang-tenggorokan` | Bunga atau daun muda  | Cuci bunga/daun, seduh atau rebus ringan sampai keluar lendir/mucilage, lalu saring. | Diminum hangat atau dipakai berkumur setelah dingin. | Hindari ekstrak pekat pada ibu hamil/menyusui dan pengguna obat tekanan darah. |

### TAN005 — Jarak Tintir

| Field                            | Isi                                                                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `jarak-tintir`                                                                                                                                                                                         |
| Nama lokal                       | Jarak Tintir                                                                                                                                                                                           |
| Nama latin                       | Jatropha multifida L. (identifikasi lokal perlu dikonfirmasi)                                                                                                                                          |
| Deskripsi                        | Jarak tintir adalah tanaman hias bergetah yang perlu digunakan dengan hati-hati. Beberapa bagian tanaman jarak dapat bersifat iritatif atau beracun sehingga lebih aman dibatasi untuk pemakaian luar. |
| Senyawa aktif utama              | diterpen, saponin, flavonoid, tanin, senyawa iritan pada getah/biji                                                                                                                                    |
| Manfaat/khasiat tradisional      | Membantu perawatan luka ringan pada kulit luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter.                                       |
| Perhatian/kontraindikasi ringkas | Jangan diminum, biji/getah dapat beracun dan iritatif. Hindari pada anak, ibu hamil, kulit luka luas, mata, dan mukosa.                                                                                |
| Kondisi refs                     | `luka-ringan`                                                                                                                                                                                          |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sangat Tinggi                                                                                                                                  |
| Kondisi/kelompok raw        | Ibu hamil, anak-anak, penderita luka/mukosa sensitif, semua orang bila diminum.                                                                |
| Kelompok risiko refs        | `ibu-hamil`; `bayi-anak-kecil`; `kulit-mukosa-sensitif-luka`; `semua-orang-bila-diminum`                                                       |
| Bagian/cara pakai pantangan | Biji, getah/lateks, daun/akar untuk pemakaian oral, getah pada mata/luka terbuka.                                                              |
| Alasan risiko               | Banyak spesies Jatropha mengandung senyawa iritan/toksik, biji dan getah dapat menyebabkan keracunan, muntah, diare, dan iritasi kulit/mukosa. |

#### Cara Pengolahan

| Kode     | Judul       | Kondisi refs  | Bagian yang digunakan                | Cara pengolahan                                                                                                        | Cara pakai tradisional                                          | Catatan keamanan                                                         |
| -------- | ----------- | ------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| OLH00501 | Luka ringan | `luka-ringan` | Daun, bukan biji/getah untuk diminum | Daun dicuci bersih, dilayukan sebentar, lalu dapat dipakai sebagai kompres luar. Hindari getah pada luka terbuka luas. | Hanya ditempel sebentar pada kulit luar yang sudah dibersihkan. | Tidak boleh diminum. Biji dan getah/lateks berisiko toksik dan iritatif. |

### TAN006 — Temulawak

| Field                            | Isi                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `temulawak`                                                                                                                                                                                                         |
| Nama lokal                       | Temulawak                                                                                                                                                                                                           |
| Nama latin                       | Curcuma xanthorrhiza Roxb.                                                                                                                                                                                          |
| Deskripsi                        | Temulawak adalah rimpang berwarna kuning-oranye yang sangat dikenal dalam jamu Indonesia. Rasanya khas dan sering dipakai untuk membantu nafsu makan serta kenyamanan perut.                                        |
| Senyawa aktif utama              | xanthorrhizol, kurkuminoid, minyak atsiri, germacrone                                                                                                                                                               |
| Manfaat/khasiat tradisional      | Membantu meningkatkan nafsu makan serta membantu perut terasa lebih nyaman saat dispepsia/kembung. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada batu/sumbatan empedu, penyakit hati aktif, pengguna pengencer darah, dan kehamilan dosis tinggi.                                                                                                     |
| Kondisi refs                     | `nafsu-makan-turun`; `dispepsia-kembung`                                                                                                                                                                            |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                      |
| Kondisi/kelompok raw        | Batu empedu/sumbatan saluran empedu, gangguan lambung berat, pengguna pengencer darah, pasien sebelum operasi, ibu hamil bila dosis tinggi. |
| Kelompok risiko refs        | `ibu-hamil`; `pengguna-pengencer-darah`; `pasien-sebelum-operasi`; `gerd-maag-gastritis-tukak`; `batu-empedu-sumbatan-empedu`               |
| Bagian/cara pakai pantangan | Rimpang ekstrak pekat/kapsul, bukan bumbu kecil.                                                                                            |
| Alasan risiko               | Kelompok Curcuma dapat merangsang empedu dan berpotensi memengaruhi perdarahan pada dosis tinggi.                                           |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                                                                                | Cara pakai tradisional                           | Catatan keamanan                                                                                    |
| -------- | ----------------- | ------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| OLH00601 | Nafsu makan turun | `nafsu-makan-turun` | Rimpang               | Cuci rimpang, iris tipis, rebus ringan, lalu saring. Dapat ditambah madu/gula sedikit bila tidak ada diabetes. | Diminum sebagai jamu ringan sebelum makan.       | Periksa bila nafsu makan turun lama, berat badan turun, atau disertai nyeri/kuning.                 |
| OLH00602 | Dispepsia/kembung | `dispepsia-kembung` | Rimpang               | Rimpang dimemarkan atau diparut, kemudian direbus ringan dan disaring.                                         | Diminum hangat setelah makan dalam jumlah wajar. | Hindari pada batu/sumbatan empedu, penyakit hati aktif, atau pengguna pengencer darah tanpa arahan. |

### TAN007 — Sirih Merah

| Field                            | Isi                                                                                                                                                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `sirih-merah`                                                                                                                                                                                                              |
| Nama lokal                       | Sirih Merah                                                                                                                                                                                                                |
| Nama latin                       | Piper crocatum Ruiz & Pav. (sering ditulis Piper ornatum dalam sebagian sumber lokal)                                                                                                                                      |
| Deskripsi                        | Sirih merah adalah tanaman merambat dengan daun berwarna merah kehijauan. Daunnya dikenal sebagai bahan tradisional untuk membantu menjaga kebersihan kulit dan mulut.                                                     |
| Senyawa aktif utama              | fenol, flavonoid, tanin, alkaloid, saponin, minyak atsiri                                                                                                                                                                  |
| Manfaat/khasiat tradisional      | Menjaga kebersihan mulut saat sariawan/radang mulut serta membantu perawatan luka ringan pada kulit luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Pemakaian untuk area intim atau luka terbuka harus hati-hati karena dapat iritasi, keputihan berbau/nyeri/darah/hamil perlu dokter.                                                                                        |
| Kondisi refs                     | `sariawan-radang-mulut`; `luka-ringan`                                                                                                                                                                                     |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                             |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, anak-anak, penderita iritasi lambung/mulut, penyakit hati/ginjal bila ekstrak lama.                                            |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `penyakit-hati`                                                                                    |
| Bagian/cara pakai pantangan | Daun rebusan pekat, ekstrak, minyak atsiri, hindari pemakaian langsung ke mata/vagina/luka.                                                        |
| Alasan risiko               | Mengandung minyak atsiri/fenolik yang dapat bersifat antiseptik tetapi juga iritatif pada mukosa dan belum aman untuk dosis tinggi jangka panjang. |

#### Cara Pengolahan

| Kode     | Judul                 | Kondisi refs            | Bagian yang digunakan | Cara pengolahan                                                | Cara pakai tradisional                                                  | Catatan keamanan                                                          |
| -------- | --------------------- | ----------------------- | --------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| OLH00701 | Sariawan/radang mulut | `sariawan-radang-mulut` | Daun                  | Cuci daun, rebus ringan, dinginkan, lalu saring sampai bersih. | Dipakai berkumur, jangan ditelan banyak.                                | Larutan terlalu pekat dapat mengiritasi mukosa mulut.                     |
| OLH00702 | Luka ringan           | `luka-ringan`           | Daun                  | Daun dicuci dan direbus, air rebusan didinginkan.              | Dipakai membasuh kulit luar yang lecet ringan setelah area dibersihkan. | Jangan dipakai pada luka dalam/bernanah/luka luas tanpa tenaga kesehatan. |

### TAN008 — Kencur

| Field                            | Isi                                                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kencur`                                                                                                                                                                                                      |
| Nama lokal                       | Kencur                                                                                                                                                                                                        |
| Nama latin                       | Kaempferia galanga L.                                                                                                                                                                                         |
| Deskripsi                        | Kencur adalah rimpang kecil beraroma khas yang sering digunakan dalam jamu beras kencur dan bumbu dapur. Rasanya hangat dan mudah diterima sebagai minuman herbal ringan.                                     |
| Senyawa aktif utama              | ethyl p-methoxycinnamate, ethyl cinnamate, borneol, kamfer, minyak atsiri                                                                                                                                     |
| Manfaat/khasiat tradisional      | Melegakan batuk/ISPA ringan serta membantu perut terasa lebih nyaman saat dispepsia/kembung. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hindari dosis ekstrak tinggi pada ibu hamil/menyusui dan penderita gangguan hati tanpa arahan.                                                                                                                |
| Kondisi refs                     | `batuk-ispa-ringan`; `dispepsia-kembung`                                                                                                                                                                      |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                                  |
| Kondisi/kelompok raw        | Ibu hamil/menyusui bila dosis obat, gangguan hati/ginjal, lambung sensitif.                                                                    |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `gerd-maag-gastritis-tukak`; `penyakit-hati`                                                                      |
| Bagian/cara pakai pantangan | Rimpang ekstrak/kapsul/rebusan pekat.                                                                                                          |
| Alasan risiko               | Umumnya aman sebagai bumbu, tetapi data keamanan dosis obat masih terbatas dan rimpang aromatik dapat mengiritasi lambung pada sebagian orang. |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                                                                 | Cara pakai tradisional                    | Catatan keamanan                                                             |
| -------- | ----------------- | ------------------- | --------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| OLH00801 | Batuk/ISPA ringan | `batuk-ispa-ringan` | Rimpang               | Cuci rimpang, parut atau memarkan, seduh dengan air hangat. Dapat dicampur madu setelah hangat. | Diminum hangat sebagai ramuan ringan.     | Hindari dosis tinggi pada ibu hamil/menyusui dan gangguan hati tanpa arahan. |
| OLH00802 | Dispepsia/kembung | `dispepsia-kembung` | Rimpang               | Rimpang dimemarkan lalu diseduh/rebus ringan, dapat dibuat seperti beras kencur encer.          | Diminum setelah makan dalam jumlah wajar. | Hentikan bila lambung terasa perih.                                          |

### TAN009 — Daun Salam

| Field                            | Isi                                                                                                                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `daun-salam`                                                                                                                                                                                                                                           |
| Nama lokal                       | Daun Salam                                                                                                                                                                                                                                             |
| Nama latin                       | Syzygium polyanthum (Wight) Walp.                                                                                                                                                                                                                      |
| Deskripsi                        | Daun salam adalah daun aromatik yang sering dipakai sebagai bumbu masakan Indonesia. Dalam tradisi herbal, daun ini juga digunakan sebagai pendamping untuk pencernaan dan pengelolaan gula darah.                                                     |
| Senyawa aktif utama              | eugenol, tanin, flavonoid, saponin, minyak atsiri, metil kavikol                                                                                                                                                                                       |
| Manfaat/khasiat tradisional      | Mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter serta membantu diare ringan sebagai pendamping cairan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Bukan pengganti obat diabetes, pantau gula darah bila dikombinasikan obat antidiabetes.                                                                                                                                                                |
| Kondisi refs                     | `diabetes-gula-darah-tinggi`; `diare`                                                                                                                                                                                                                  |

#### Kontraindikasi

| Field                       | Isi                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                   |
| Kondisi/kelompok raw        | Pengguna obat diabetes/hipertensi, pasien sebelum operasi, ibu hamil/menyusui bila ekstrak dosis tinggi.                        |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `pasien-sebelum-operasi`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`           |
| Bagian/cara pakai pantangan | Daun rebusan pekat/ekstrak untuk diminum rutin.                                                                                 |
| Alasan risiko               | Berpotensi memengaruhi gula darah/tekanan darah, kombinasi dengan obat dapat memperkuat efek penurunan gula atau tekanan darah. |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                                  | Cara pakai tradisional                                          | Catatan keamanan                                                                     |
| -------- | --------------------------------------------- | ---------------------------- | --------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| OLH00901 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Daun                  | Cuci daun, rebus ringan, lalu saring. Gunakan ramuan encer, bukan ekstrak pekat. | Diminum terbatas sebagai pendamping pola makan dan obat dokter. | Pantau gula darah bila memakai obat diabetes, jangan mengganti obat medis.           |
| OLH00902 | Diare ringan                                  | `diare`                      | Daun                  | Daun dicuci dan direbus ringan, lalu disaring.                                   | Diminum sedikit-sedikit bersama cairan yang cukup.              | Jangan dipakai untuk diare berat, berdarah, dehidrasi, atau anak kecil tanpa arahan. |

### TAN010 — Jeruk Nipis

| Field                            | Isi                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `jeruk-nipis`                                                                                                                                                                                                             |
| Nama lokal                       | Jeruk Nipis                                                                                                                                                                                                               |
| Nama latin                       | Citrus aurantiifolia (Christm.) Swingle                                                                                                                                                                                   |
| Deskripsi                        | Jeruk nipis adalah buah kecil dengan rasa asam segar dan aroma khas. Air perasannya sering dicampur air hangat atau madu untuk membantu keluhan tenggorokan ringan.                                                       |
| Senyawa aktif utama              | asam sitrat, vitamin C, limonene, flavonoid hesperidin/naringin                                                                                                                                                           |
| Manfaat/khasiat tradisional      | Melegakan batuk/ISPA ringan, menenangkan radang tenggorokan ringan, serta membantu mengurangi bau mulut. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Asam dapat memperparah maag/GERD dan mengikis enamel gigi, hindari tetes mata/oles kulit sebelum matahari.                                                                                                                |
| Kondisi refs                     | `batuk-ispa-ringan`; `radang-tenggorokan`; `bau-mulut`                                                                                                                                                                    |

#### Kontraindikasi

| Field                       | Isi                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                    |
| Kondisi/kelompok raw        | GERD/maag berat, gigi sensitif/enamel tipis, dermatitis fotosensitif, pengguna obat tertentu bila konsumsi ekstrak berlebihan.   |
| Kelompok risiko refs        | `gerd-maag-gastritis-tukak`; `gigi-sensitif-enamel-tipis`; `fotosensitif-dermatitis`; `pengguna-obat-rutin-tertentu`             |
| Bagian/cara pakai pantangan | Air perasan sangat asam, kulit/minyak kulit jeruk pada kulit lalu terkena matahari.                                              |
| Alasan risiko               | Asam sitrat dapat mengiritasi lambung dan enamel gigi, minyak/peel citrus dapat menyebabkan iritasi/fotosensitivitas pada kulit. |

#### Cara Pengolahan

| Kode     | Judul                                    | Kondisi refs                              | Bagian yang digunakan            | Cara pengolahan                                                                                         | Cara pakai tradisional                                  | Catatan keamanan                                                                         |
| -------- | ---------------------------------------- | ----------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| OLH01001 | Batuk/ISPA ringan dan radang tenggorokan | `batuk-ispa-ringan`; `radang-tenggorokan` | Air perasan buah                 | Cuci buah, peras airnya, encerkan dengan air hangat, lalu tambahkan madu bila tidak ada kontraindikasi. | Diminum hangat atau dipakai berkumur encer.             | Jangan diminum terlalu asam pada GERD/maag, jangan diberikan madu pada bayi.             |
| OLH01002 | Bau mulut                                | `bau-mulut`                               | Air perasan buah yang diencerkan | Campur sedikit air jeruk nipis dengan air matang agar tidak terlalu asam.                               | Dipakai berkumur sebentar, lalu bilas dengan air putih. | Air asam dapat mengikis enamel gigi, jangan digunakan terlalu sering atau terlalu pekat. |

### TAN011 — Jarak

| Field                            | Isi                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `jarak`                                                                                                                                                             |
| Nama lokal                       | Jarak                                                                                                                                                               |
| Nama latin                       | Ricinus communis L.                                                                                                                                                 |
| Deskripsi                        | Jarak adalah tanaman penghasil biji dan minyak jarak. Minyak jarak olahan berbeda dari biji mentahnya karena biji mentah sangat beracun dan tidak boleh dikonsumsi. |
| Senyawa aktif utama              | ricinoleic acid pada minyak jarak, ricin/ricinine toksik pada biji                                                                                                  |
| Manfaat/khasiat tradisional      | Membantu sembelit ringan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter.                          |
| Perhatian/kontraindikasi ringkas | Biji jarak tidak boleh dimakan karena sangat beracun. Hindari pada ibu hamil, anak, penyakit usus, diare, dan dehidrasi.                                            |
| Kondisi refs                     | `sembelit`                                                                                                                                                          |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sangat Tinggi                                                                                                                                                                         |
| Kondisi/kelompok raw        | Anak-anak, ibu hamil, menyusui, semua orang bila memakai biji mentah, penderita penyakit lambung/usus.                                                                                |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `gerd-maag-gastritis-tukak`; `gangguan-usus-ibd-sumbatan-usus`; `semua-orang-bila-diminum`                                            |
| Bagian/cara pakai pantangan | Biji jarak/daun/akar untuk diminum, biji dikunyah, minyak jarak oral tanpa arahan medis.                                                                                              |
| Alasan risiko               | Biji jarak mengandung ricin, protein sangat toksik, biji yang dikunyah dapat melepaskan racun. Minyak jarak juga dapat memicu diare kuat dan tidak aman untuk penggunaan sembarangan. |

#### Cara Pengolahan

| Kode     | Judul    | Kondisi refs | Bagian yang digunakan                   | Cara pengolahan                                                                                                                                         | Cara pakai tradisional                                                              | Catatan keamanan                                                                              |
| -------- | -------- | ------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| OLH01101 | Sembelit | `sembelit`   | Minyak jarak olahan farmasi, bukan biji | Tidak dianjurkan mengolah sendiri biji/daun/akar. Bila memakai minyak jarak, gunakan hanya produk olahan yang jelas dan sesuai arahan tenaga kesehatan. | Hanya untuk penggunaan jangka pendek dengan arahan, bukan ramuan rumahan dari biji. | Biji jarak sangat beracun. Hindari pada ibu hamil, anak, diare, dehidrasi, dan penyakit usus. |

### TAN012 — Kapulaga

| Field                            | Isi                                                                                                                                                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kapulaga`                                                                                                                                                                                                      |
| Nama lokal                       | Kapulaga                                                                                                                                                                                                        |
| Nama latin                       | Amomum compactum Sol. ex Maton (kapulaga Jawa) / Elettaria cardamomum (kapulaga hijau)                                                                                                                          |
| Deskripsi                        | Kapulaga adalah rempah berbiji aromatik yang memberi rasa hangat pada makanan dan minuman. Aromanya kuat sehingga sering dipakai untuk membantu rasa tidak nyaman di mulut dan perut.                           |
| Senyawa aktif utama              | 1,8-cineole, terpinyl acetate, limonene, linalool, flavonoid                                                                                                                                                    |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu mengurangi bau mulut. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada alergi rempah dan gangguan empedu, dosis bumbu umumnya lebih aman.                                                                                                                               |
| Kondisi refs                     | `dispepsia-kembung`; `bau-mulut`                                                                                                                                                                                |

#### Kontraindikasi

| Field                       | Isi                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Rendah–Sedang                                                                                                            |
| Kondisi/kelompok raw        | Batu empedu, gastritis/GERD, pengguna pengencer darah bila dosis tinggi, ibu hamil bila ekstrak/minyak dosis tinggi.     |
| Kelompok risiko refs        | `ibu-hamil`; `pengguna-pengencer-darah`; `gerd-maag-gastritis-tukak`; `batu-empedu-sumbatan-empedu`                      |
| Bagian/cara pakai pantangan | Biji/minyak atsiri dosis tinggi, bukan bumbu kecil.                                                                      |
| Alasan risiko               | Rempah aromatik dapat mengiritasi lambung pada sebagian orang, minyak atsiri lebih pekat dan berisiko iritasi/interaksi. |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                                                   | Cara pakai tradisional                           | Catatan keamanan                                                     |
| -------- | ----------------- | ------------------- | --------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| OLH01201 | Dispepsia/kembung | `dispepsia-kembung` | Buah/biji             | Memarkan beberapa biji, seduh dengan air panas, lalu saring.                      | Diminum hangat setelah makan dalam jumlah wajar. | Hati-hati pada GERD/gastritis dan gangguan empedu bila dosis tinggi. |
| OLH01202 | Bau mulut         | `bau-mulut`         | Biji                  | Biji dapat dikunyah sebentar setelah makan atau diseduh sebagai air kumur ringan. | Dikunyah sebentar lalu dibuang, atau berkumur.   | Jangan berlebihan bila lambung sensitif.                             |

### TAN013 — Sirih Hijau

| Field                            | Isi                                                                                                                                                                                                                                                            |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `sirih-hijau`                                                                                                                                                                                                                                                  |
| Nama lokal                       | Sirih Hijau                                                                                                                                                                                                                                                    |
| Nama latin                       | Piper betle L.                                                                                                                                                                                                                                                 |
| Deskripsi                        | Sirih hijau adalah tanaman merambat berdaun aromatik yang sudah lama dikenal dalam perawatan tradisional. Daunnya sering digunakan sebagai bahan kumur atau bilasan luar.                                                                                      |
| Senyawa aktif utama              | chavicol, eugenol, tanin, hidroksikavikol, minyak atsiri                                                                                                                                                                                                       |
| Manfaat/khasiat tradisional      | Menjaga kebersihan mulut saat sariawan/radang mulut, membantu mengurangi bau mulut, membantu mengurangi bau badan sebagai bilasan luar, serta membantu mengatasi keputihan tidak normal sebagai pembilas luar secara eksternal. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hindari penggunaan bersama pinang/kapur untuk mengunyah karena berisiko merusak mukosa, bisa iritatif bila terlalu pekat.                                                                                                                                      |
| Kondisi refs                     | `sariawan-radang-mulut`; `bau-mulut`; `bau-badan`; `keputihan-tidak-normal`                                                                                                                                                                                    |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Sedang                                                                                                                                                       |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, anak-anak, penderita luka/iritasi mulut, penderita penyakit hati/ginjal bila pemakaian lama, pasien sebelum operasi bila ekstrak tinggi. |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `pasien-sebelum-operasi`; `penyakit-hati`; `kulit-mukosa-sensitif-luka`                                      |
| Bagian/cara pakai pantangan | Daun kunyah/rebusan pekat/minyak atsiri, terutama pada mukosa, mata, vagina, luka terbuka.                                                                   |
| Alasan risiko               | Kandungan minyak atsiri/fenolik dapat bersifat antiseptik tetapi juga iritatif, penggunaan oral/mukosa jangka panjang perlu dibatasi.                        |

#### Cara Pengolahan

| Kode     | Judul                               | Kondisi refs                         | Bagian yang digunakan   | Cara pengolahan                                                       | Cara pakai tradisional                                                | Catatan keamanan                                                |
| -------- | ----------------------------------- | ------------------------------------ | ----------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| OLH01301 | Sariawan/radang mulut dan bau mulut | `sariawan-radang-mulut`; `bau-mulut` | Daun                    | Daun dicuci, direbus ringan, didinginkan, lalu disaring.              | Dipakai berkumur, kemudian dibuang.                                   | Hindari larutan pekat dan penggunaan lama karena bisa iritatif. |
| OLH01302 | Bau badan                           | `bau-badan`                          | Daun untuk bilasan luar | Rebus daun, dinginkan, lalu gunakan air rebusan sebagai bilasan luar. | Dipakai saat mandi pada area lipatan/keringat, lalu bilas bila perlu. | Jangan dipakai pada kulit luka/iritasi berat.                   |
| OLH01303 | Meredakan keputihan tidak normal   | `keputihan-tidak-normal`             | Daun                    | Cuci bersih beberapa lembar daun sirih, rebus ringan dengan air secukupnya, saring dan biarkan air rebusan mendingin hingga suam-suam kuku. | Digunakan untuk membasuh area kewanitaan secara eksternal. | Jangan digunakan jangka panjang atau terlalu pekat karena dapat mengganggu flora normal area intim. |

### TAN014 — Kumis Kucing

| Field                            | Isi                                                                                                                                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kumis-kucing`                                                                                                                                                                                                                                              |
| Nama lokal                       | Kumis Kucing                                                                                                                                                                                                                                                |
| Nama latin                       | Orthosiphon aristatus (Blume) Miq. / Orthosiphon stamineus Benth.                                                                                                                                                                                           |
| Deskripsi                        | Kumis kucing adalah tanaman herbal dengan bunga yang benang sarinya menyerupai kumis kucing. Tanaman ini dikenal sebagai pendamping tradisional untuk membantu keluhan saluran kemih.                                                                       |
| Senyawa aktif utama              | sinensetin, rosmarinic acid, eupatorin, kalium, flavonoid                                                                                                                                                                                                   |
| Manfaat/khasiat tradisional      | Mendukung keluhan ISK ringan sebagai pendamping minum air yang cukup serta mendukung keluhan batu saluran kemih ringan sebagai pendamping. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada penyakit ginjal berat, dehidrasi, obat diuretik/lithium/antihipertensi, kehamilan.                                                                                                                                                           |
| Kondisi refs                     | `isk-ringan`; `batu-ginjal-saluran-kemih`                                                                                                                                                                                                                   |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                                               |
| Kondisi/kelompok raw        | Gagal ginjal, edema karena gagal jantung/ginjal, dehidrasi, pengguna diuretik/lithium, ibu hamil/menyusui, anak kecil.                                               |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `penyakit-ginjal-gagal-ginjal`; `dehidrasi-diare`; `pengguna-diuretik-lithium-digoxin`; `edema-gagal-jantung-ginjal` |
| Bagian/cara pakai pantangan | Daun rebusan sebagai peluruh kencing dosis tinggi/lama.                                                                                                              |
| Alasan risiko               | Efek diuretik dapat mengubah cairan dan elektrolit, tidak cocok untuk kondisi ginjal/jantung tertentu tanpa pengawasan.                                              |

#### Cara Pengolahan

| Kode     | Judul                                        | Kondisi refs                | Bagian yang digunakan | Cara pengolahan                                                                     | Cara pakai tradisional                               | Catatan keamanan                                                                                                  |
| -------- | -------------------------------------------- | --------------------------- | --------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| OLH01401 | ISK ringan                                   | `isk-ringan`                | Daun                  | Cuci daun, rebus ringan, lalu saring. Buat rebusan encer dan minum cukup air putih. | Diminum terbatas sebagai pendamping hidrasi.         | Hindari pada gagal ginjal, edema karena jantung/ginjal, dehidrasi, pengguna diuretik/lithium, ibu hamil/menyusui. |
| OLH01402 | Batu ginjal/saluran kemih sebagai pendamping | `batu-ginjal-saluran-kemih` | Daun                  | Daun direbus ringan sebagai minuman tradisional peluruh kencing.                    | Diminum jangka pendek, bukan saat nyeri kolik hebat. | Nyeri hebat, demam, muntah, urin berdarah, atau sulit BAK harus ke fasilitas kesehatan.                           |

### TAN015 — Kunyit

| Field                            | Isi                                                                                                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `kunyit`                                                                                                                                                                                                     |
| Nama lokal                       | Kunyit                                                                                                                                                                                                       |
| Nama latin                       | Curcuma longa L.                                                                                                                                                                                             |
| Deskripsi                        | Kunyit adalah rimpang berwarna kuning-oranye yang sangat umum digunakan sebagai bumbu dan jamu. Rasanya khas dan sering dikaitkan dengan kenyamanan pencernaan.                                              |
| Senyawa aktif utama              | kurkumin, demetoksikurkumin, bisdemetoksikurkumin, turmerone                                                                                                                                                 |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung, membantu nyeri haid ringan, serta membantu mengatasi keputihan tidak normal. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada batu empedu, GERD berat, penggunaan pengencer darah, persiapan operasi, dan kehamilan dosis tinggi.                                                                                           |
| Kondisi refs                     | `dispepsia-kembung`; `nyeri-haid`; `keputihan-tidak-normal`                                                                                                                                                                                  |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang–Tinggi                                                                                                                                                             |
| Kondisi/kelompok raw        | Batu empedu/sumbatan empedu, gangguan perdarahan, pengguna antikoagulan/antiplatelet, pasien sebelum operasi, ibu hamil bila dosis suplemen, riwayat batu ginjal oksalat. |
| Kelompok risiko refs        | `ibu-hamil`; `gangguan-perdarahan`; `pengguna-pengencer-darah`; `pasien-sebelum-operasi`; `batu-empedu-sumbatan-empedu`; `batu-ginjal-oksalat`                            |
| Bagian/cara pakai pantangan | Rimpang/kurkumin ekstrak tinggi, kapsul, jamu pekat.                                                                                                                      |
| Alasan risiko               | Kunyit dosis tinggi dapat memengaruhi empedu, pencernaan, serta berpotensi meningkatkan risiko perdarahan/interaksi obat.                                                 |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                                                                     | Cara pakai tradisional              | Catatan keamanan                                                                           |
| -------- | ----------------- | ------------------- | --------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------ |
| OLH01501 | Dispepsia/kembung | `dispepsia-kembung` | Rimpang               | Cuci rimpang, iris/parut, rebus ringan, lalu saring. Bisa dicampur asam/madu secukupnya bila cocok. | Diminum hangat setelah makan.       | Hindari pada GERD berat, batu/sumbatan empedu, atau pengguna pengencer darah dosis tinggi. |
| OLH01502 | Nyeri haid ringan | `nyeri-haid`        | Rimpang               | Rimpang kunyit diparut atau diiris, direbus ringan dan disaring.                                    | Diminum hangat saat keluhan ringan. | Nyeri haid berat, perdarahan banyak, atau hamil perlu evaluasi.                            |
| OLH01503 | Meredakan keputihan tidak normal | `keputihan-tidak-normal` | Rimpang | Rimpang kunyit dicuci bersih, diparut atau diiris tipis, direbus ringan bersama air bersih, lalu disaring. | Diminum hangat secara teratur dalam jumlah wajar. | Hentikan jika terjadi efek lambung. Keputihan abnormal berbau/bernanah/berdarah perlu penanganan medis segera. |

### TAN016 — Temu Ireng

| Field                            | Isi                                                                                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `temu-ireng`                                                                                                                                                                                                                          |
| Nama lokal                       | Temu Ireng                                                                                                                                                                                                                            |
| Nama latin                       | Curcuma aeruginosa Roxb.                                                                                                                                                                                                              |
| Deskripsi                        | Temu ireng adalah rimpang berwarna gelap kebiruan yang dikenal dalam jamu tradisional. Rasanya cenderung pahit dan biasanya digunakan dalam jumlah terbatas.                                                                          |
| Senyawa aktif utama              | kurkuminoid, germacrone, curzerenone, furanodiene, minyak atsiri                                                                                                                                                                      |
| Manfaat/khasiat tradisional      | Membantu meningkatkan nafsu makan serta membantu keluhan cacingan secara tradisional sebagai pendamping pemeriksaan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Jangan dipakai sebagai pengganti obat cacing yang tepat, hindari pada kehamilan dan gangguan empedu/hati tanpa arahan.                                                                                                                |
| Kondisi refs                     | `nafsu-makan-turun`; `cacingan`                                                                                                                                                                                                       |

#### Kontraindikasi

| Field                       | Isi                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                              |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, batu empedu/sumbatan empedu, gangguan lambung, pengguna pengencer darah.                        |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `pengguna-pengencer-darah`; `gerd-maag-gastritis-tukak`; `batu-empedu-sumbatan-empedu` |
| Bagian/cara pakai pantangan | Rimpang ekstrak pekat/jamu dosis tinggi.                                                                            |
| Alasan risiko               | Termasuk kelompok Curcuma, data keamanan dosis tinggi terbatas dan berpotensi mengiritasi lambung/empedu.           |

#### Cara Pengolahan

| Kode     | Judul                                | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                                                                                      | Cara pakai tradisional                                    | Catatan keamanan                                                                                                       |
| -------- | ------------------------------------ | ------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| OLH01601 | Nafsu makan turun                    | `nafsu-makan-turun` | Rimpang               | Cuci rimpang, iris tipis, rebus ringan, lalu saring. Rasanya pahit sehingga dapat dibuat sangat encer.               | Diminum sedikit sebelum makan sebagai jamu tradisional.   | Hindari pada kehamilan dan gangguan empedu/hati tanpa arahan.                                                          |
| OLH01602 | Cacingan sebagai pendamping edukatif | `cacingan`          | Rimpang               | Tidak disarankan menjadi terapi utama. Bila tetap digunakan secara tradisional, rimpang hanya dibuat rebusan ringan. | Gunakan hanya setelah berkonsultasi, terutama untuk anak. | Obat cacing yang tepat tetap lebih aman dan terukur, periksa bila ada anemia, berat badan turun, atau anak terinfeksi. |

### TAN017 — Sirsak

| Field                            | Isi                                                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `sirsak`                                                                                                                                                                                                                                                                  |
| Nama lokal                       | Sirsak                                                                                                                                                                                                                                                                    |
| Nama latin                       | Annona muricata L.                                                                                                                                                                                                                                                        |
| Deskripsi                        | Sirsak adalah pohon buah tropis yang buahnya sering dimakan langsung atau dibuat jus. Daunnya juga populer sebagai herbal tradisional tetapi penggunaannya perlu lebih hati-hati daripada buahnya.                                                                        |
| Senyawa aktif utama              | acetogenins annonaceous, alkaloid, flavonoid, vitamin C pada buah                                                                                                                                                                                                         |
| Manfaat/khasiat tradisional      | Mendukung pemantauan tekanan darah sebagai pendamping pola hidup dan obat dokter serta membantu keluhan nyeri sendi/asam urat ringan sebagai pendamping. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Jangan klaim sebagai obat kanker. Hindari suplemen/ekstrak pada Parkinson/gangguan saraf, ibu hamil, tekanan darah rendah, dan pengguna obat hipertensi/diabetes.                                                                                                         |
| Kondisi refs                     | `hipertensi`; `asam-urat-nyeri-sendi`                                                                                                                                                                                                                                     |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Tinggi                                                                                                                                                           |
| Kondisi/kelompok raw        | Parkinson/gangguan gerak, tekanan darah rendah, pengguna obat antihipertensi/antidiabetes, ibu hamil/menyusui, penderita penyakit hati/ginjal.                   |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`; `penyakit-hati`; `parkinson-gangguan-gerak` |
| Bagian/cara pakai pantangan | Daun/biji/ekstrak sirsak, teh daun pekat, buah sebagai pangan jauh lebih rendah risikonya.                                                                       |
| Alasan risiko               | Daun/biji mengandung acetogenin seperti annonacin yang dikaitkan dengan kekhawatiran neurotoksisitas, juga dapat menurunkan gula darah dan tekanan darah.        |

#### Cara Pengolahan

| Kode     | Judul                                    | Kondisi refs            | Bagian yang digunakan                                         | Cara pengolahan                                                                                      | Cara pakai tradisional                 | Catatan keamanan                                                                                                                                              |
| -------- | ---------------------------------------- | ----------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OLH01701 | Hipertensi sebagai pendamping            | `hipertensi`            | Buah matang lebih disarankan, daun hanya dengan kehati-hatian | Buah matang dicuci, dikonsumsi langsung atau dibuat jus tanpa gula berlebih. Hindari teh daun pekat. | Dikonsumsi sebagai buah pangan.        | Daun/biji/ekstrak berisiko lebih tinggi, hindari pada Parkinson/gangguan saraf, hamil/menyusui, tekanan darah rendah, atau pengguna obat hipertensi/diabetes. |
| OLH01702 | Nyeri sendi/asam urat sebagai pendamping | `asam-urat-nyeri-sendi` | Buah matang                                                   | Buah matang dikonsumsi sebagai sumber cairan dan antioksidan pangan.                                 | Dikonsumsi wajar, bukan ekstrak pekat. | Tidak menggantikan obat antiinflamasi/asam urat.                                                                                                              |

### TAN018 — Mengkudu

| Field                            | Isi                                                                                                                                                                                                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `mengkudu`                                                                                                                                                                                                                                                                              |
| Nama lokal                       | Mengkudu                                                                                                                                                                                                                                                                                |
| Nama latin                       | Morinda citrifolia L.                                                                                                                                                                                                                                                                   |
| Deskripsi                        | Mengkudu adalah buah dengan aroma yang sangat khas dan sering diolah menjadi jus herbal. Karena rasanya kuat, penggunaannya biasanya dibuat encer atau dicampur bahan lain.                                                                                                             |
| Senyawa aktif utama              | scopoletin, iridoid, deacetylasperulosidic acid, proxeronine, kalium                                                                                                                                                                                                                    |
| Manfaat/khasiat tradisional      | Mendukung pemantauan tekanan darah sebagai pendamping pola hidup dan obat dokter serta mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada penyakit ginjal/kalium tinggi, penyakit hati, pengguna ACE inhibitor/ARB/spironolakton, obat diabetes/hipertensi.                                                                                                                                                        |
| Kondisi refs                     | `hipertensi`; `diabetes-gula-darah-tinggi`                                                                                                                                                                                                                                              |

#### Kontraindikasi

| Field                       | Isi                                                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Tinggi                                                                                                                            |
| Kondisi/kelompok raw        | Penyakit ginjal, kadar kalium tinggi, pengguna ACE inhibitor/ARB/spironolactone, penyakit hati, diabetes, ibu hamil/menyusui.     |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `penyakit-ginjal-gagal-ginjal`; `penyakit-hati`; `kadar-kalium-tinggi` |
| Bagian/cara pakai pantangan | Jus buah pekat/ekstrak, konsumsi rutin dosis tinggi.                                                                              |
| Alasan risiko               | Jus mengkudu dapat tinggi kalium, ada laporan efek hati dan interaksi dengan kondisi ginjal/diabetes.                             |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                                                 | Cara pakai tradisional                                             | Catatan keamanan                                                                                                                      |
| -------- | --------------------------------------------- | ---------------------------- | --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| OLH01801 | Hipertensi sebagai pendamping                 | `hipertensi`                 | Buah matang           | Buah matang dicuci, dipotong, lalu dibuat jus encer. Hindari jus pekat dan konsumsi berlebihan. | Diminum sedikit sebagai pendamping, sambil memantau tekanan darah. | Tidak untuk penyakit ginjal/kalium tinggi, penyakit hati, hamil/menyusui, atau pengguna ACE inhibitor/ARB/spironolakton tanpa arahan. |
| OLH01802 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Buah matang           | Jus dibuat encer tanpa gula tambahan.                                                           | Diminum terbatas sambil memantau gula darah.                       | Berisiko memperkuat efek obat diabetes, jangan mengganti obat.                                                                        |

### TAN019 — Sambiloto

| Field                            | Isi                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `sambiloto`                                                                                                                                                                                                         |
| Nama lokal                       | Sambiloto                                                                                                                                                                                                           |
| Nama latin                       | Andrographis paniculata (Burm.f.) Nees                                                                                                                                                                              |
| Deskripsi                        | Sambiloto adalah tanaman herbal yang terkenal sangat pahit. Dalam tradisi jamu, tanaman ini sering dipakai saat badan terasa tidak enak, demam ringan, atau masuk angin.                                            |
| Senyawa aktif utama              | andrographolide, neoandrographolide, diterpen lactone, flavonoid                                                                                                                                                    |
| Manfaat/khasiat tradisional      | Melegakan batuk/ISPA ringan serta membantu rasa tidak nyaman saat demam ringan sebagai pendamping. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hindari pada kehamilan/menyusui, hati-hati dengan obat pengencer darah, imunosupresan, dan obat yang diproses hati.                                                                                                 |
| Kondisi refs                     | `batuk-ispa-ringan`; `demam`                                                                                                                                                                                        |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Tinggi                                                                                                                                         |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, gangguan kesuburan, pengguna antikoagulan/antiplatelet, penyakit autoimun/pengguna imunosupresan, gangguan hati.           |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `pengguna-pengencer-darah`; `penyakit-hati`; `autoimun-imunosupresan`; `gangguan-kesuburan`                       |
| Bagian/cara pakai pantangan | Daun/ekstrak kapsul/rebusan pekat.                                                                                                             |
| Alasan risiko               | Sambiloto memiliki efek imunomodulator, pahit kuat, dan potensi interaksi dengan obat pengencer darah serta obat yang memengaruhi sistem imun. |

#### Cara Pengolahan

| Kode     | Judul                              | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                                     | Cara pakai tradisional             | Catatan keamanan                                                                              |
| -------- | ---------------------------------- | ---------------------------- | --------------------- | ----------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| OLH01901 | Batuk/ISPA ringan dan demam ringan | `batuk-ispa-ringan`; `demam` | Daun/herba            | Daun dicuci, direbus ringan, lalu disaring. Rasa sangat pahit, jangan dibuat pekat. | Diminum sedikit dan jangka pendek. | Hindari pada hamil/menyusui, gangguan hati, pengguna pengencer darah, autoimun/imunosupresan. |

### TAN020 — Tapak Dara

| Field                            | Isi                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `tapak-dara`                                                                                                                                                                       |
| Nama lokal                       | Tapak Dara                                                                                                                                                                         |
| Nama latin                       | Catharanthus roseus (L.) G.Don                                                                                                                                                     |
| Deskripsi                        | Tapak dara adalah tanaman hias berbunga yang mengandung senyawa kuat. Walaupun beberapa senyawanya dipakai dalam obat modern, tanaman utuhnya tidak aman untuk pengobatan mandiri. |
| Senyawa aktif utama              | vincristine, vinblastine, ajmalicine, catharanthine, vindoline                                                                                                                     |
| Manfaat/khasiat tradisional      | Tidak direkomendasikan untuk klaim pengobatan mandiri dalam seeder ini karena pertimbangan keamanan dan keterbatasan bukti penggunaan yang kuat.                                   |
| Perhatian/kontraindikasi ringkas | Jangan digunakan sebagai ramuan oral mandiri. Berisiko toksik, kontraindikasi untuk ibu hamil, menyusui, anak, dan pasien terapi kanker tanpa pengawasan.                          |
| Kondisi refs                     | —                                                                                                                                                                                  |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sangat Tinggi                                                                                                                                  |
| Kondisi/kelompok raw        | Ibu hamil, menyusui, anak-anak, pasien kemoterapi, gangguan hati/ginjal, semua orang bila digunakan mandiri sebagai obat kanker/diabetes.      |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `diabetes-obat-antidiabetes`; `penyakit-hati`; `pasien-kemoterapi`; `semua-orang-bila-diminum` |
| Bagian/cara pakai pantangan | Semua bagian tanaman, terutama daun/akar/ekstrak oral.                                                                                         |
| Alasan risiko               | Mengandung alkaloid vinca seperti vincristine/vinblastine yang bersifat sitotoksik, berbahaya bila digunakan tanpa standar dosis medis.        |

#### Cara Pengolahan

| Kode | Judul | Kondisi refs | Bagian yang digunakan | Cara pengolahan | Cara pakai tradisional | Catatan keamanan |
| ---- | ----- | ------------ | --------------------- | --------------- | ---------------------- | ---------------- |

### TAN021 — Tempuyung

| Field                            | Isi                                                                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `tempuyung`                                                                                                                                                                                                                                             |
| Nama lokal                       | Tempuyung                                                                                                                                                                                                                                               |
| Nama latin                       | Sonchus arvensis L.                                                                                                                                                                                                                                     |
| Deskripsi                        | Tempuyung adalah tanaman liar berdaun lunak yang dikenal dalam ramuan peluruh kencing tradisional. Tanaman ini sering dipakai sebagai pendamping keluhan saluran kemih ringan.                                                                          |
| Senyawa aktif utama              | flavonoid, kalium, taraxasterol, lactucopicrin, saponin                                                                                                                                                                                                 |
| Manfaat/khasiat tradisional      | Mendukung keluhan batu saluran kemih ringan sebagai pendamping serta membantu keluhan nyeri sendi/asam urat ringan sebagai pendamping. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada penyakit ginjal, dehidrasi, penggunaan diuretik/lithium, dan kehamilan.                                                                                                                                                                  |
| Kondisi refs                     | `batu-ginjal-saluran-kemih`; `asam-urat-nyeri-sendi`                                                                                                                                                                                                    |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                                                        |
| Kondisi/kelompok raw        | Gagal ginjal, dehidrasi, pengguna diuretik/lithium, ibu hamil/menyusui, tekanan darah rendah.                                                                                 |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`; `penyakit-ginjal-gagal-ginjal`; `dehidrasi-diare`; `pengguna-diuretik-lithium-digoxin` |
| Bagian/cara pakai pantangan | Daun rebusan peluruh kencing dosis tinggi/lama.                                                                                                                               |
| Alasan risiko               | Secara tradisional bersifat diuretik/peluruh batu, dapat mengubah keseimbangan cairan-elektrolit.                                                                             |

#### Cara Pengolahan

| Kode     | Judul                                        | Kondisi refs                | Bagian yang digunakan | Cara pengolahan                                              | Cara pakai tradisional                              | Catatan keamanan                                                                                 |
| -------- | -------------------------------------------- | --------------------------- | --------------------- | ------------------------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| OLH02101 | Batu ginjal/saluran kemih sebagai pendamping | `batu-ginjal-saluran-kemih` | Daun                  | Cuci daun, rebus ringan, lalu saring. Gunakan ramuan encer.  | Diminum jangka pendek sambil menjaga asupan cairan. | Tidak untuk gagal ginjal, dehidrasi, diuretik/lithium, hamil/menyusui, nyeri kolik perlu dokter. |
| OLH02103 | Nyeri sendi/asam urat sebagai pendamping     | `asam-urat-nyeri-sendi`     | Daun                  | Daun dapat diseduh/rebus ringan sebagai minuman tradisional. | Diminum terbatas, bukan pengganti obat asam urat.   | Pantau bila memakai obat diuretik atau ada gangguan ginjal.                                      |

### TAN022 — Bunga Telang

| Field                            | Isi                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `bunga-telang`                                                                                                                                                                                      |
| Nama lokal                       | Bunga Telang                                                                                                                                                                                        |
| Nama latin                       | Clitoria ternatea L.                                                                                                                                                                                |
| Deskripsi                        | Bunga telang adalah bunga biru keunguan yang sering dipakai sebagai pewarna alami makanan dan minuman. Warnanya menarik dan kandungan antioksidannya membuatnya populer sebagai teh herbal.         |
| Senyawa aktif utama              | antosianin ternatin, flavonoid, kaempferol, quercetin, peptida cyclotide                                                                                                                            |
| Manfaat/khasiat tradisional      | Membantu mata lelah ringan serta membantu relaksasi pada stres ringan/sulit tidur. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Jangan diteteskan ke mata, minum berlebihan dapat menyebabkan mual pada sebagian orang, ibu hamil gunakan wajar sebagai pangan.                                                                     |
| Kondisi refs                     | `mata-lelah`; `stres-ringan-sulit-tidur`                                                                                                                                                            |

#### Kontraindikasi

| Field                       | Isi                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                             |
| Kondisi/kelompok raw        | Ibu hamil/menyusui bila dosis ekstrak, pengguna obat diabetes/tekanan darah, alergi tanaman tertentu.                     |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `alergi`                     |
| Bagian/cara pakai pantangan | Bunga/ekstrak pekat, bukan teh ringan sesekali.                                                                           |
| Alasan risiko               | Umumnya dipakai sebagai pangan/minuman, tetapi data keamanan dosis obat pada kehamilan dan kombinasi obat masih terbatas. |

#### Cara Pengolahan

| Kode     | Judul                    | Kondisi refs               | Bagian yang digunakan                   | Cara pengolahan                        | Cara pakai tradisional                                                                           | Catatan keamanan                                            |
| -------- | ------------------------ | -------------------------- | --------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| OLH02202 | Mata lelah               | `mata-lelah`               | Bunga sebagai minuman, bukan tetes mata | Bunga diseduh sebagai teh ringan.      | Diminum sebagai minuman antioksidan, istirahatkan mata dan kompres dengan air bersih bila perlu. | Jangan meneteskan ramuan ke mata karena tidak steril.       |
| OLH02203 | Stres ringan/sulit tidur | `stres-ringan-sulit-tidur` | Bunga                                   | Seduh bunga sebagai teh hangat ringan. | Diminum malam hari secara wajar.                                                                 | Bila insomnia berat/berkepanjangan, cari evaluasi penyebab. |

### TAN023 — Lengkuas Putih

| Field                            | Isi                                                                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `lengkuas-putih`                                                                                                                                                                                                                                 |
| Nama lokal                       | Lengkuas Putih                                                                                                                                                                                                                                   |
| Nama latin                       | Alpinia galanga (L.) Willd.                                                                                                                                                                                                                      |
| Deskripsi                        | Lengkuas putih adalah rimpang aromatik yang umum digunakan dalam masakan. Rasa pedas hangatnya membuat tanaman ini sering dipakai untuk membantu keluhan perut dan batuk ringan.                                                                 |
| Senyawa aktif utama              | galangin, 1’-acetoxychavicol acetate, eugenol, cineole, minyak atsiri                                                                                                                                                                            |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu keluhan gatal/jamur kulit ringan untuk pemakaian luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Bisa mengiritasi lambung pada dosis tinggi, hati-hati pada alergi rempah dan kehamilan dosis ekstrak.                                                                                                                                            |
| Kondisi refs                     | `dispepsia-kembung`; `gatal-infeksi-jamur-kulit`                                                                                                                                                                                                 |

#### Kontraindikasi

| Field                       | Isi                                                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                          |
| Kondisi/kelompok raw        | GERD/maag, pengguna pengencer darah bila dosis tinggi, ibu hamil/menyusui bila ekstrak pekat.                          |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `pengguna-pengencer-darah`; `gerd-maag-gastritis-tukak`                                   |
| Bagian/cara pakai pantangan | Rimpang/minyak atsiri/ekstrak tinggi.                                                                                  |
| Alasan risiko               | Rempah aromatik dapat mengiritasi lambung, ekstrak tinggi berpotensi interaksi dan lebih pekat daripada bumbu masakan. |

#### Cara Pengolahan

| Kode     | Judul                            | Kondisi refs                | Bagian yang digunakan | Cara pengolahan                                            | Cara pakai tradisional                                     | Catatan keamanan                                                      |
| -------- | -------------------------------- | --------------------------- | --------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| OLH02301 | Dispepsia/kembung                | `dispepsia-kembung`         | Rimpang               | Cuci, iris/memarkan rimpang, seduh atau rebus ringan.      | Diminum hangat setelah makan atau digunakan sebagai bumbu. | Hati-hati pada GERD/maag.                                             |
| OLH02303 | Gatal/infeksi jamur kulit ringan | `gatal-infeksi-jamur-kulit` | Rimpang untuk luar    | Rimpang diparut, campur sedikit air matang/minyak pembawa. | Oles tipis pada area kecil, lalu bilas bila perih.         | Bukan pengganti antijamur untuk kurap luas, jangan pada luka terbuka. |

### TAN024 — Daun Mangkokan

| Field                            | Isi                                                                                                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `daun-mangkokan`                                                                                                                                                                                             |
| Nama lokal                       | Daun Mangkokan                                                                                                                                                                                               |
| Nama latin                       | Polyscias scutellaria (Burm.f.) Fosberg / Nothopanax scutellarius                                                                                                                                            |
| Deskripsi                        | Daun mangkokan adalah tanaman perdu dengan daun cekung seperti mangkuk. Daunnya sering digunakan dalam perawatan rambut dan ramuan luar untuk kulit.                                                         |
| Senyawa aktif utama              | flavonoid, saponin, tanin, alkaloid, polifenol                                                                                                                                                               |
| Manfaat/khasiat tradisional      | Membantu perawatan rambut/ketombe serta membantu iritasi kulit ringan untuk pemakaian luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Pemakaian luar bisa menimbulkan alergi, hentikan bila perih/merah memburuk.                                                                                                                                  |
| Kondisi refs                     | `rambut-ketombe`; `iritasi-kulit`                                                                                                                                                                            |

#### Kontraindikasi

| Field                       | Isi                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                       |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, anak-anak, gangguan lambung, alergi kulit.                                                      |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `gerd-maag-gastritis-tukak`; `kulit-mukosa-sensitif-luka`; `alergi` |
| Bagian/cara pakai pantangan | Daun mentah/ekstrak pekat, pemakaian pada luka terbuka tanpa sterilitas.                                            |
| Alasan risiko               | Data keamanan klinis terbatas, pemakaian topikal/oral pekat berisiko iritasi atau kontaminasi.                      |

#### Cara Pengolahan

| Kode     | Judul                | Kondisi refs     | Bagian yang digunakan | Cara pengolahan                                                               | Cara pakai tradisional                                             | Catatan keamanan                                                 |
| -------- | -------------------- | ---------------- | --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| OLH02401 | Rambut/ketombe       | `rambut-ketombe` | Daun                  | Daun dicuci, ditumbuk atau diblender dengan sedikit air, lalu disaring kasar. | Dioles pada kulit kepala sebelum keramas, kemudian dibilas bersih. | Hentikan bila kulit kepala perih/merah.                          |
| OLH02403 | Iritasi kulit ringan | `iritasi-kulit`  | Daun untuk luar       | Daun ditumbuk halus dengan air matang menjadi tapal lembut.                   | Tempel tipis sebentar pada area kecil.                             | Uji alergi terlebih dahulu, hentikan bila gatal/perih bertambah. |

### TAN025 — Ketepeng Cina

| Field                            | Isi                                                                                                                                                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `ketepeng-cina`                                                                                                                                                                                                                           |
| Nama lokal                       | Ketepeng Cina                                                                                                                                                                                                                             |
| Nama latin                       | Senna alata (L.) Roxb. / Cassia alata L.                                                                                                                                                                                                  |
| Deskripsi                        | Ketepeng cina adalah tanaman perdu yang dikenal dalam ramuan luar untuk masalah kulit. Daunnya sering dikaitkan dengan perawatan tradisional untuk kurap, panu, dan gatal.                                                                |
| Senyawa aktif utama              | anthraquinone, chrysophanol, emodin, rhein, flavonoid, tanin                                                                                                                                                                              |
| Manfaat/khasiat tradisional      | Membantu keluhan gatal/jamur kulit ringan untuk pemakaian luar serta membantu iritasi kulit ringan untuk pemakaian luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hindari laksatif jangka panjang, kehamilan, diare, dehidrasi, radang usus, dan anak kecil tanpa arahan.                                                                                                                                   |
| Kondisi refs                     | `gatal-infeksi-jamur-kulit`; `iritasi-kulit`                                                                                                                                                                                              |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Tinggi                                                                                                                                                           |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, anak kecil, diare, dehidrasi, radang usus, sumbatan usus, gangguan elektrolit, pengguna diuretik/digoxin.                                    |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `dehidrasi-diare`; `pengguna-diuretik-lithium-digoxin`; `gangguan-usus-ibd-sumbatan-usus`; `gangguan-elektrolit` |
| Bagian/cara pakai pantangan | Daun/polong/biji sebagai laksatif oral, rebusan pekat, pemakaian topikal untuk kulit lebih rendah risikonya.                                                     |
| Alasan risiko               | Mengandung senyawa antrakuinon laksatif, penggunaan berlebih dapat menyebabkan kram, diare, dehidrasi, dan gangguan elektrolit.                                  |

#### Cara Pengolahan

| Kode     | Judul                            | Kondisi refs                                 | Bagian yang digunakan | Cara pengolahan                                                                           | Cara pakai tradisional                                        | Catatan keamanan                                                                                  |
| -------- | -------------------------------- | -------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| OLH02501 | Gatal/infeksi jamur kulit ringan | `gatal-infeksi-jamur-kulit`; `iritasi-kulit` | Daun untuk luar       | Daun dicuci, ditumbuk halus, dapat dicampur sedikit air matang atau minyak kelapa bersih. | Oles tipis pada area berjamur, hindari mata dan luka terbuka. | Bila ruam luas, bernanah, atau tidak membaik, gunakan pemeriksaan dan obat antijamur yang sesuai. |
| OLH02503 | Iritasi kulit ringan             | `gatal-infeksi-jamur-kulit`; `iritasi-kulit` | Daun untuk luar       | Daun direbus ringan, airnya didinginkan dan disaring.                                     | Dipakai membasuh area kulit luar.                             | Hentikan bila iritasi bertambah.                                                                  |

### TAN026 — Ginseng Jawa

| Field                            | Isi                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `ginseng-jawa`                                                                                                                                                                                   |
| Nama lokal                       | Ginseng Jawa                                                                                                                                                                                     |
| Nama latin                       | Talinum paniculatum (Jacq.) Gaertn.                                                                                                                                                              |
| Deskripsi                        | Ginseng jawa adalah tanaman herba yang daun dan akarnya dikenal sebagai pangan atau tonik tradisional. Tanaman ini sering dikaitkan dengan pemulihan tenaga setelah lelah.                       |
| Senyawa aktif utama              | saponin, flavonoid, tanin, steroid/triterpenoid, vitamin/mineral                                                                                                                                 |
| Manfaat/khasiat tradisional      | Membantu stamina saat kelelahan ringan serta membantu meningkatkan nafsu makan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Bukti klinis terbatas, hati-hati pada ibu hamil/menyusui, gangguan hormon, atau penggunaan suplemen tonik lain.                                                                                  |
| Kondisi refs                     | `kelelahan-stamina-turun`; `nafsu-makan-turun`                                                                                                                                                   |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                         |
| Kondisi/kelompok raw        | Ibu hamil/menyusui bila dosis obat, penderita batu ginjal/riwayat oksalat, pengguna obat diabetes.                                    |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `batu-ginjal-oksalat`                                                      |
| Bagian/cara pakai pantangan | Daun/akar ekstrak tinggi, konsumsi berlebihan.                                                                                        |
| Alasan risiko               | Umumnya sebagai sayuran lebih aman, penggunaan obat dosis tinggi belum cukup data dan beberapa tanaman daun dapat menyumbang oksalat. |

#### Cara Pengolahan

| Kode     | Judul                   | Kondisi refs              | Bagian yang digunakan                           | Cara pengolahan                                                                                              | Cara pakai tradisional                                        | Catatan keamanan                                                            |
| -------- | ----------------------- | ------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| OLH02601 | Kelelahan/stamina turun | `kelelahan-stamina-turun` | Daun muda atau akar sebagai pangan/tonik ringan | Daun muda dapat dimasak sebagai sayur bening/lalapan matang. Akar bila digunakan cukup diseduh/rebus ringan. | Dikonsumsi sebagai pangan/tonik ringan, bukan suplemen pekat. | Periksa bila lelah menetap, berat badan turun, demam, atau anemia.          |
| OLH02602 | Nafsu makan turun       | `nafsu-makan-turun`       | Daun muda                                       | Daun dicuci dan dimasak sebagai sayur.                                                                       | Dimakan sebagai lauk/sayur pendamping.                        | Hati-hati pada hamil/menyusui dan gangguan hormon bila menggunakan ekstrak. |

### TAN027 — Serai Kampung

| Field                            | Isi                                                                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `serai-kampung`                                                                                                                                                                                                                    |
| Nama lokal                       | Serai Kampung                                                                                                                                                                                                                      |
| Nama latin                       | Cymbopogon citratus (DC.) Stapf                                                                                                                                                                                                    |
| Deskripsi                        | Serai kampung adalah rumput aromatik beraroma lemon yang sangat umum dipakai dalam masakan dan minuman hangat. Batangnya memberi rasa segar dan hangat.                                                                            |
| Senyawa aktif utama              | citral, geraniol, myrcene, citronellal, flavonoid                                                                                                                                                                                  |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu relaksasi pada stres ringan/sulit tidur. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada tekanan darah rendah, obat sedatif/antihipertensi, dan kehamilan dosis minyak atsiri.                                                                                                                               |
| Kondisi refs                     | `dispepsia-kembung`; `stres-ringan-sulit-tidur`                                                                                                                                                                                    |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Sedang                                                                                                                                                                   |
| Kondisi/kelompok raw        | Ibu hamil terutama dosis tinggi/minyak atsiri, tekanan darah rendah, pengguna diuretik/antihipertensi, penyakit ginjal berat, kulit sensitif.                            |
| Kelompok risiko refs        | `ibu-hamil`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`; `penyakit-ginjal-gagal-ginjal`; `pengguna-diuretik-lithium-digoxin`; `kulit-mukosa-sensitif-luka` |
| Bagian/cara pakai pantangan | Minyak atsiri serai, rebusan sangat pekat, ekstrak dosis tinggi.                                                                                                         |
| Alasan risiko               | Serai dapat bersifat diuretik/vasodilator ringan, minyak atsiri pekat dapat iritatif dan tidak sama risikonya dengan serai sebagai bumbu.                                |

#### Cara Pengolahan

| Kode     | Judul                    | Kondisi refs               | Bagian yang digunakan | Cara pengolahan                                                  | Cara pakai tradisional          | Catatan keamanan                                                      |
| -------- | ------------------------ | -------------------------- | --------------------- | ---------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| OLH02701 | Dispepsia/kembung        | `dispepsia-kembung`        | Batang                | Cuci batang, memarkan, rebus ringan atau seduh dengan air panas. | Diminum hangat setelah makan.   | Hati-hati pada tekanan darah rendah dan obat antihipertensi/diuretik. |
| OLH02703 | Stres ringan/sulit tidur | `stres-ringan-sulit-tidur` | Batang                | Seduh batang serai sebagai teh aromatik ringan.                  | Diminum hangat pada sore/malam. | Hindari minyak atsiri serai untuk diminum.                            |

### TAN028 — Jahe

| Field                            | Isi                                                                                                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `jahe`                                                                                                                                                                                                                                   |
| Nama lokal                       | Jahe                                                                                                                                                                                                                                     |
| Nama latin                       | Zingiber officinale Roscoe                                                                                                                                                                                                               |
| Deskripsi                        | Jahe adalah rimpang pedas aromatik yang sangat akrab sebagai bumbu dan minuman penghangat. Tanaman ini sering menjadi pilihan rumahan saat mual, masuk angin, atau tenggorokan kurang nyaman.                                            |
| Senyawa aktif utama              | gingerol, shogaol, paradol, zingerone, zingiberene                                                                                                                                                                                       |
| Manfaat/khasiat tradisional      | Meredakan mual, mengurangi mual saat mabuk perjalanan, serta membantu perut terasa lebih nyaman saat dispepsia/kembung. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati dengan pengencer darah, GERD, batu empedu, dan sebelum operasi, ibu hamil konsultasi untuk dosis tinggi.                                                                                                                       |
| Kondisi refs                     | `mual`; `mabuk-perjalanan`; `dispepsia-kembung`                                                                                                                                                                                          |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                |
| Kondisi/kelompok raw        | Ibu hamil terutama mendekati persalinan, gangguan perdarahan, pengguna pengencer darah, gastritis/GERD berat, pasien sebelum operasi. |
| Kelompok risiko refs        | `ibu-hamil`; `gangguan-perdarahan`; `pengguna-pengencer-darah`; `pasien-sebelum-operasi`; `gerd-maag-gastritis-tukak`                 |
| Bagian/cara pakai pantangan | Rimpang dosis tinggi, ekstrak/kapsul, rebusan sangat pekat.                                                                           |
| Alasan risiko               | Efek samping yang sering adalah heartburn, diare, dan iritasi mulut/lambung, perlu kehati-hatian pada obat dan perdarahan.            |

#### Cara Pengolahan

| Kode     | Judul                     | Kondisi refs               | Bagian yang digunakan | Cara pengolahan                                                        | Cara pakai tradisional                    | Catatan keamanan                                                                                    |
| -------- | ------------------------- | -------------------------- | --------------------- | ---------------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------- |
| OLH02801 | Mual dan mabuk perjalanan | `mual`; `mabuk-perjalanan` | Rimpang segar         | Cuci rimpang, iris/memarkan, seduh dengan air panas atau rebus ringan. | Diminum hangat sedikit-sedikit.           | Hindari dosis tinggi pada GERD berat, gangguan perdarahan, pengencer darah, atau menjelang operasi. |
| OLH02802 | Dispepsia/kembung         | `dispepsia-kembung`        | Rimpang segar         | Rimpang dimemarkan dan diseduh/rebus ringan.                           | Diminum setelah makan dalam jumlah wajar. | Hentikan bila heartburn atau diare.                                                                 |

### TAN029 — Daun Afrika

| Field                            | Isi                                                                                                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `daun-afrika`                                                                                                                                                                                                                            |
| Nama lokal                       | Daun Afrika                                                                                                                                                                                                                              |
| Nama latin                       | Vernonia amygdalina Delile / Gymnanthemum amygdalinum                                                                                                                                                                                    |
| Deskripsi                        | Daun afrika adalah daun bercita rasa pahit yang di beberapa daerah dikonsumsi sebagai sayur atau herbal. Karena rasanya kuat, penggunaannya biasanya sedikit dan tidak berlebihan.                                                       |
| Senyawa aktif utama              | sesquiterpene lactones, vernoniosides, flavonoid, saponin, polifenol                                                                                                                                                                     |
| Manfaat/khasiat tradisional      | Mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter serta membantu meningkatkan nafsu makan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Rasa pahit dapat mengiritasi lambung, pantau gula darah bila bersama obat diabetes, hindari kehamilan dosis tinggi.                                                                                                                      |
| Kondisi refs                     | `diabetes-gula-darah-tinggi`; `nafsu-makan-turun`                                                                                                                                                                                        |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                                            |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, diabetes yang memakai obat, tekanan darah rendah, penyakit hati/ginjal, lambung sensitif.                                                     |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `gerd-maag-gastritis-tukak`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`; `penyakit-hati` |
| Bagian/cara pakai pantangan | Daun pahit/rebusan pekat/ekstrak.                                                                                                                                 |
| Alasan risiko               | Berpotensi memengaruhi gula darah/tekanan darah, rasa pahit dan senyawa aktif pekat dapat mengiritasi lambung.                                                    |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                                 | Cara pakai tradisional                                        | Catatan keamanan                                                          |
| -------- | --------------------------------------------- | ---------------------------- | --------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| OLH02901 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Daun                  | Daun dicuci dan direbus ringan, karena sangat pahit, gunakan ramuan encer.      | Diminum terbatas sambil memantau gula darah.                  | Jangan mengganti obat diabetes, hati-hati hipoglikemia bila memakai obat. |
| OLH02903 | Nafsu makan turun                             | `nafsu-makan-turun`          | Daun                  | Daun muda dapat direbus sebagai lalapan/sayur pahit atau dibuat seduhan ringan. | Dikonsumsi sedikit sebagai perangsang rasa pahit tradisional. | Hindari pada hamil/menyusui, penyakit hati/ginjal tanpa arahan.           |

### TAN030 — Garut

| Field                            | Isi                                                                                                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `garut`                                                                                                                                                                                                                           |
| Nama lokal                       | Garut                                                                                                                                                                                                                             |
| Nama latin                       | Maranta arundinacea L.                                                                                                                                                                                                            |
| Deskripsi                        | Garut adalah tanaman umbi penghasil pati arrowroot yang teksturnya lembut dan mudah dicerna. Pati garut sering dipakai sebagai makanan ringan untuk perut yang sensitif.                                                          |
| Senyawa aktif utama              | pati resisten, serat, mineral, flavonoid dalam bagian tertentu                                                                                                                                                                    |
| Manfaat/khasiat tradisional      | Membantu diare ringan sebagai pendamping cairan serta membantu perut terasa lebih nyaman saat dispepsia/kembung. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Aman sebagai pangan, tetapi penderita diabetes perlu menghitung karbohidrat, bukan obat diare berat.                                                                                                                              |
| Kondisi refs                     | `diare`; `dispepsia-kembung`                                                                                                                                                                                                      |

#### Kontraindikasi

| Field                       | Isi                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah                                                                                      |
| Kondisi/kelompok raw        | Diabetes bila konsumsi tepung/umbi berlebihan, alergi sangat jarang.                        |
| Kelompok risiko refs        | `diabetes-obat-antidiabetes`; `alergi`                                                      |
| Bagian/cara pakai pantangan | Pati/umbi dalam jumlah sangat besar pada penderita kontrol gula darah buruk.                |
| Alasan risiko               | Umumnya bahan pangan, risiko utama terkait beban karbohidrat, bukan toksisitas herbal khas. |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                                                      | Cara pakai tradisional                               | Catatan keamanan                                                        |
| -------- | ----------------- | ------------------- | --------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| OLH03001 | Diare ringan      | `diare`             | Umbi/pati garut       | Umbi diolah menjadi pati/tepung bersih, lalu dimasak dengan air menjadi bubur encer. | Dikonsumsi sebagai makanan lunak pendamping cairan.  | Bukan pengganti oralit, batasi pada diabetes karena sumber karbohidrat. |
| OLH03002 | Dispepsia/kembung | `dispepsia-kembung` | Umbi/pati garut       | Pati dimasak menjadi bubur lembut, tanpa santan/pedas berlebihan.                    | Dimakan sedikit-sedikit sebagai makanan mudah cerna. | Hentikan bila kembung bertambah.                                        |

### TAN031 — Lidah Buaya

| Field                            | Isi                                                                                                                                                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `lidah-buaya`                                                                                                                                                                                                              |
| Nama lokal                       | Lidah Buaya                                                                                                                                                                                                                |
| Nama latin                       | Aloe vera (L.) Burm.f. / Aloe barbadensis Mill.                                                                                                                                                                            |
| Deskripsi                        | Lidah buaya adalah tanaman sukulen berdaun tebal yang berisi gel bening. Gel bagian dalamnya sering digunakan untuk membantu menenangkan kulit.                                                                            |
| Senyawa aktif utama              | acemannan, polisakarida, aloin/anthraquinone pada lateks, glucomannan, sterol                                                                                                                                              |
| Manfaat/khasiat tradisional      | Membantu luka bakar ringan untuk pemakaian luar serta membantu iritasi kulit ringan untuk pemakaian luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Gel luar relatif lebih aman. Jangan minum lateks/whole leaf sembarangan, hindari pada hamil, menyusui, anak, penyakit ginjal, diare, dan obat diabetes/diuretik.                                                           |
| Kondisi refs                     | `luka-bakar-ringan`; `iritasi-kulit`                                                                                                                                                                                       |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Tinggi                                                                                                                                                                                                  |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, anak kecil, diare, IBD, penyakit ginjal/jantung, pengguna diuretik/digoxin/obat diabetes.                                                                                           |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `diabetes-obat-antidiabetes`; `penyakit-ginjal-gagal-ginjal`; `dehidrasi-diare`; `pengguna-diuretik-lithium-digoxin`; `gangguan-usus-ibd-sumbatan-usus` |
| Bagian/cara pakai pantangan | Lateks/getah kuning di bawah kulit daun, ekstrak whole-leaf diminum, gel bening topikal lebih rendah risiko.                                                                                            |
| Alasan risiko               | Aloe latex bersifat laksatif kuat, dapat menyebabkan diare, kehilangan kalium, gangguan elektrolit, dan berisiko pada kehamilan serta ginjal.                                                           |

#### Cara Pengolahan

| Kode     | Judul                           | Kondisi refs                         | Bagian yang digunakan        | Cara pengolahan                                                                                         | Cara pakai tradisional                                                     | Catatan keamanan                                                                                  |
| -------- | ------------------------------- | ------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| OLH03101 | Luka bakar ringan/iritasi kulit | `luka-bakar-ringan`; `iritasi-kulit` | Gel bening bagian dalam daun | Cuci daun, kupas kulit, ambil gel bening, bilas gel agar getah kuning hilang, lalu gunakan alat bersih. | Oles tipis pada kulit luar yang terbakar ringan/iritasi, bukan luka dalam. | Hindari lateks/getah kuning. Luka bakar luas, melepuh besar, atau infeksi perlu tenaga kesehatan. |

### TAN032 — Patah Tulang

| Field                            | Isi                                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `patah-tulang`                                                                                                                                                        |
| Nama lokal                       | Patah Tulang                                                                                                                                                          |
| Nama latin                       | Euphorbia tirucalli L.                                                                                                                                                |
| Deskripsi                        | Patah tulang adalah tanaman sukulen bercabang yang mengeluarkan getah putih. Getahnya dapat mengiritasi kulit dan mata sehingga penggunaannya perlu sangat hati-hati. |
| Senyawa aktif utama              | diterpene ester, euphorbol, triterpen, lateks iritan                                                                                                                  |
| Manfaat/khasiat tradisional      | Tidak direkomendasikan untuk klaim pengobatan mandiri dalam seeder ini karena pertimbangan keamanan dan keterbatasan bukti penggunaan yang kuat.                      |
| Perhatian/kontraindikasi ringkas | Tidak dianjurkan untuk penggunaan mandiri. Getah dapat melukai kulit/mata, jangan diminum, hindari pada anak, hamil, luka, dan mata.                                  |
| Kondisi refs                     | —                                                                                                                                                                     |

#### Kontraindikasi

| Field                       | Isi                                                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sangat Tinggi                                                                                               |
| Kondisi/kelompok raw        | Anak-anak, ibu hamil, kulit/mata sensitif, semua orang untuk pemakaian oral.                                |
| Kelompok risiko refs        | `ibu-hamil`; `bayi-anak-kecil`; `semua-orang-bila-diminum`                                                  |
| Bagian/cara pakai pantangan | Getah putih/lateks, semua bagian bila diminum, getah pada mata/kulit/luka.                                  |
| Alasan risiko               | Getah Euphorbia bersifat kaustik/iritan, paparan mata dapat menyebabkan peradangan berat dan cedera kornea. |

#### Cara Pengolahan

| Kode | Judul | Kondisi refs | Bagian yang digunakan | Cara pengolahan | Cara pakai tradisional | Catatan keamanan |
| ---- | ----- | ------------ | --------------------- | --------------- | ---------------------- | ---------------- |

### TAN033 — Jeringau / Deringo

| Field                            | Isi                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `jeringau-deringo`                                                                                                                                                                               |
| Nama lokal                       | Jeringau / Deringo                                                                                                                                                                               |
| Nama latin                       | Acorus calamus L.                                                                                                                                                                                |
| Deskripsi                        | Jeringau atau deringo adalah rimpang aromatik dari tanaman yang tumbuh di tempat basah. Walaupun dikenal dalam ramuan pencernaan, tanaman ini memiliki catatan keamanan yang perlu diperhatikan. |
| Senyawa aktif utama              | β-asarone, α-asarone, eugenol, minyak atsiri, tanin                                                                                                                                              |
| Manfaat/khasiat tradisional      | Meredakan mual serta membantu perut terasa lebih nyaman saat dispepsia/kembung. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hindari penggunaan oral bebas, terutama ibu hamil/menyusui, anak, penyakit hati, dan penggunaan jangka panjang karena potensi toksisitas β-asarone.                                              |
| Kondisi refs                     | `mual`; `dispepsia-kembung`                                                                                                                                                                      |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sangat Tinggi                                                                                                                                                                       |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, anak-anak, penyakit hati, riwayat kanker, semua orang untuk konsumsi oral tanpa standar bebas β-asarone.                                                        |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `penyakit-hati`; `riwayat-kanker`; `semua-orang-bila-diminum`                                                                       |
| Bagian/cara pakai pantangan | Rimpang dan minyak atsiri oral, ekstrak pekat.                                                                                                                                      |
| Alasan risiko               | Dapat mengandung β-asarone yang dikaitkan dengan toksisitas, mutagenisitas/karsinogenisitas pada data hewan, penggunaan oral perlu dihindari kecuali produk terstandar dan diawasi. |

#### Cara Pengolahan

| Kode     | Judul                      | Kondisi refs                | Bagian yang digunakan                       | Cara pengolahan                                                                                             | Cara pakai tradisional                                                      | Catatan keamanan                                                                                |
| -------- | -------------------------- | --------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| OLH03301 | Mual dan dispepsia/kembung | `mual`; `dispepsia-kembung` | Rimpang tidak dianjurkan untuk oral mandiri | Tidak disarankan membuat rebusan/minyak oral sendiri karena risiko beta-asarone pada beberapa jenis/produk. | Gunakan alternatif herbal yang lebih aman atau konsultasi tenaga kesehatan. | Risiko sangat tinggi untuk hamil/menyusui, anak, penyakit hati, dan penggunaan oral nonstandar. |

### TAN034 — Kintolod / Daun Katarak

| Field                            | Isi                                                                                                                                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kintolod-daun-katarak`                                                                                                                                                                   |
| Nama lokal                       | Kintolod / Daun Katarak                                                                                                                                                                   |
| Nama latin                       | Isotoma longiflora (L.) C.Presl / Hippobroma longiflora                                                                                                                                   |
| Deskripsi                        | Kintolod atau daun katarak adalah tanaman kecil berbunga putih yang memiliki getah. Tanaman ini dikenal dalam cerita pengobatan mata, tetapi pemakaian langsung ke mata berisiko iritasi. |
| Senyawa aktif utama              | alkaloid seperti lobeline/lobelanidine, saponin, flavonoid, getah iritan                                                                                                                  |
| Manfaat/khasiat tradisional      | Tidak direkomendasikan untuk klaim pengobatan mandiri dalam seeder ini karena pertimbangan keamanan dan keterbatasan bukti penggunaan yang kuat.                                          |
| Perhatian/kontraindikasi ringkas | Jangan diteteskan langsung ke mata. Hindari pada anak, hamil, mata luka/merah/nyeri, segera cuci air mengalir bila terkena mata.                                                          |
| Kondisi refs                     | —                                                                                                                                                                                         |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Tinggi                                                                                                                                                           |
| Kondisi/kelompok raw        | Penyakit mata, luka kornea, mata merah/nyeri, pengguna lensa kontak, anak-anak, ibu hamil/menyusui.                                                              |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `penyakit-mata-kornea-lensa-kontak`                                                                              |
| Bagian/cara pakai pantangan | Getah/air rendaman bunga/daun yang diteteskan ke mata, ekstrak tidak steril.                                                                                     |
| Alasan risiko               | Pemakaian langsung ke mata berisiko iritasi, infeksi, dan kontaminasi karena tidak steril, klaim untuk katarak tidak boleh menggantikan pemeriksaan dokter mata. |

#### Cara Pengolahan

| Kode | Judul | Kondisi refs | Bagian yang digunakan | Cara pengolahan | Cara pakai tradisional | Catatan keamanan |
| ---- | ----- | ------------ | --------------------- | --------------- | ---------------------- | ---------------- |

### TAN035 — Zaitun

| Field                            | Isi                                                                                                                                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `zaitun`                                                                                                                                                                                                                                                                |
| Nama lokal                       | Zaitun                                                                                                                                                                                                                                                                  |
| Nama latin                       | Olea europaea L.                                                                                                                                                                                                                                                        |
| Deskripsi                        | Zaitun adalah pohon penghasil buah dan minyak yang banyak digunakan sebagai bahan pangan sehat. Minyak zaitun juga sering dipakai untuk membantu merawat kulit kering.                                                                                                  |
| Senyawa aktif utama              | oleuropein, hydroxytyrosol, oleic acid, secoiridoid, flavonoid                                                                                                                                                                                                          |
| Manfaat/khasiat tradisional      | Mendukung pemantauan tekanan darah sebagai pendamping pola hidup dan obat dokter serta mendukung pengelolaan kolesterol sebagai pendamping pola makan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Minyak tinggi kalori, daun/ekstrak dapat menurunkan tekanan/gula darah, hati-hati bila bersama obat.                                                                                                                                                                    |
| Kondisi refs                     | `hipertensi`; `kolesterol-tinggi-dislipidemia`                                                                                                                                                                                                                          |

#### Kontraindikasi

| Field                       | Isi                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                             |
| Kondisi/kelompok raw        | Tekanan darah rendah, pengguna obat antihipertensi/antidiabetes, pengguna pengencer darah bila ekstrak daun dosis tinggi. |
| Kelompok risiko refs        | `pengguna-pengencer-darah`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`        |
| Bagian/cara pakai pantangan | Ekstrak daun zaitun dosis tinggi, minyak zaitun pangan umumnya rendah risiko.                                             |
| Alasan risiko               | Ekstrak daun dapat memengaruhi tekanan darah/gula darah, efeknya dapat bertambah dengan obat.                             |

#### Cara Pengolahan

| Kode     | Judul                                             | Kondisi refs                     | Bagian yang digunakan          | Cara pengolahan                                                                                                | Cara pakai tradisional                                      | Catatan keamanan                                                               |
| -------- | ------------------------------------------------- | -------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| OLH03501 | Hipertensi sebagai pendamping                     | `hipertensi`                     | Daun atau minyak zaitun pangan | Daun dapat diseduh ringan, minyak zaitun digunakan sebagai bagian pola makan sehat.                            | Dikonsumsi sebagai pangan/pendamping, bukan pengganti obat. | Hati-hati pada tekanan darah rendah dan obat antihipertensi/antidiabetes.      |
| OLH03502 | Kolesterol tinggi/dislipidemia sebagai pendamping | `kolesterol-tinggi-dislipidemia` | Minyak buah zaitun             | Gunakan minyak zaitun sebagai pengganti sebagian lemak jenuh dalam makanan, tidak perlu dipanaskan berlebihan. | Dikonsumsi dalam pola makan seimbang.                       | Efek utama berasal dari pola makan keseluruhan, tetap perlu pemeriksaan lipid. |

### TAN036 — Lempuyang

| Field                            | Isi                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `lempuyang`                                                                                                                                                                                                         |
| Nama lokal                       | Lempuyang                                                                                                                                                                                                           |
| Nama latin                       | Zingiber zerumbet (L.) Roscoe ex Sm. / Zingiber aromaticum Val. (nama lokal bisa berbeda)                                                                                                                           |
| Deskripsi                        | Lempuyang adalah rimpang beraroma tajam dari keluarga jahe-jahean. Dalam jamu tradisional, rimpang ini sering dipakai untuk membantu nafsu makan dan keluhan pegal.                                                 |
| Senyawa aktif utama              | zerumbone, humulene, camphene, minyak atsiri, flavonoid                                                                                                                                                             |
| Manfaat/khasiat tradisional      | Membantu meningkatkan nafsu makan serta membantu perut terasa lebih nyaman saat dispepsia/kembung. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada kehamilan, gangguan empedu, GERD berat, dan penggunaan pengencer darah.                                                                                                                              |
| Kondisi refs                     | `nafsu-makan-turun`; `dispepsia-kembung`                                                                                                                                                                            |

#### Kontraindikasi

| Field                       | Isi                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                              |
| Kondisi/kelompok raw        | Ibu hamil/menyusui bila dosis obat, batu empedu, gangguan lambung, pengguna pengencer darah.                        |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `pengguna-pengencer-darah`; `gerd-maag-gastritis-tukak`; `batu-empedu-sumbatan-empedu` |
| Bagian/cara pakai pantangan | Rimpang/ekstrak pekat/minyak atsiri.                                                                                |
| Alasan risiko               | Rimpang aromatik dapat mengiritasi lambung, data keamanan dosis tinggi masih terbatas dan berpotensi interaksi.     |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                            | Cara pakai tradisional                       | Catatan keamanan                                                             |
| -------- | ----------------- | ------------------- | --------------------- | ---------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| OLH03601 | Nafsu makan turun | `nafsu-makan-turun` | Rimpang               | Rimpang dicuci, diiris tipis, direbus ringan dan disaring. | Diminum sedikit sebagai jamu pahit-aromatik. | Hindari dosis tinggi pada hamil/menyusui, batu empedu, dan lambung sensitif. |
| OLH03602 | Dispepsia/kembung | `dispepsia-kembung` | Rimpang               | Rimpang dimemarkan, seduh/rebus ringan.                    | Diminum hangat setelah makan.                | Hentikan bila lambung perih.                                                 |

### TAN037 — Cincau Rambat

| Field                            | Isi                                                                                                                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `cincau-rambat`                                                                                                                                                                                            |
| Nama lokal                       | Cincau Rambat                                                                                                                                                                                              |
| Nama latin                       | Cyclea barbata Miers                                                                                                                                                                                       |
| Deskripsi                        | Cincau rambat adalah tanaman merambat yang daunnya dapat diolah menjadi gel cincau hijau. Gel ini dikenal sebagai minuman yang terasa sejuk dan ringan di perut.                                           |
| Senyawa aktif utama              | pektin/gel polisakarida, flavonoid, alkaloid, klorofil, mineral                                                                                                                                            |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu sembelit ringan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Pastikan kebersihan pembuatan cincau, penderita diabetes hindari tambahan gula berlebihan.                                                                                                                 |
| Kondisi refs                     | `dispepsia-kembung`; `sembelit`                                                                                                                                                                            |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                                 |
| Kondisi/kelompok raw        | Tekanan darah rendah, diabetes dengan obat, diare, ibu hamil/menyusui bila konsumsi ekstrak berlebihan.                                       |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`; `dehidrasi-diare`        |
| Bagian/cara pakai pantangan | Daun gel/rebusan pekat dalam jumlah besar.                                                                                                    |
| Alasan risiko               | Umumnya sebagai pangan/minuman, penggunaan obat dosis besar dapat memengaruhi pencernaan, tekanan darah, atau gula darah pada sebagian orang. |

#### Cara Pengolahan

| Kode     | Judul                                 | Kondisi refs                    | Bagian yang digunakan       | Cara pengolahan                                                                                                | Cara pakai tradisional                                | Catatan keamanan                                           |
| -------- | ------------------------------------- | ------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| OLH03701 | Dispepsia/kembung dan sembelit ringan | `dispepsia-kembung`; `sembelit` | Daun yang dibuat gel cincau | Daun dicuci, diremas dengan air matang sampai lendir/gel keluar, lalu disaring dan didiamkan hingga mengental. | Dikonsumsi sebagai gel/minuman tanpa gula berlebihan. | Hentikan bila diare, penderita diabetes batasi gula sirup. |

### TAN038 — Kayu Putih

| Field                            | Isi                                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kayu-putih`                                                                                                                                                                          |
| Nama lokal                       | Kayu Putih                                                                                                                                                                            |
| Nama latin                       | Melaleuca cajuputi Powell / Melaleuca leucadendra (sering tertukar dalam penggunaan lokal)                                                                                            |
| Deskripsi                        | Kayu putih adalah pohon aromatik penghasil minyak kayu putih. Minyaknya umum dipakai sebagai obat luar untuk memberi rasa hangat dan membantu pernapasan terasa lebih lega.           |
| Senyawa aktif utama              | 1,8-cineole, α-terpineol, limonene, pinene                                                                                                                                            |
| Manfaat/khasiat tradisional      | Melegakan batuk/ISPA ringan serta membantu keluhan Nyeri Otot/Pegal. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Jangan diminum. Minyak esensial berbahaya bila tertelan, terutama anak, hindari area wajah bayi, mata, luka, dan penderita asma sensitif.                                             |
| Kondisi refs                     | `batuk-ispa-ringan`; `nyeri-otot-pegal`                                                                                                                                               |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Tinggi–Sangat Tinggi                                                                                                                                               |
| Kondisi/kelompok raw        | Bayi/anak kecil, ibu hamil/menyusui, penderita asma/epilepsi, semua orang bila diminum, kulit sensitif.                                                            |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `kulit-mukosa-sensitif-luka`; `asma-epilepsi`; `semua-orang-bila-diminum`                                          |
| Bagian/cara pakai pantangan | Minyak kayu putih murni diminum, pemakaian dekat hidung bayi, oles berlebihan, minyak masuk mata.                                                                  |
| Alasan risiko               | Minyak kayu putih/essential oil dapat menimbulkan toksisitas saraf bila tertelan, termasuk mengantuk berat, muntah, kejang, hingga koma pada dosis kecil tertentu. |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan                       | Cara pengolahan                                                                                                                                  | Cara pakai tradisional                                              | Catatan keamanan                                                                      |
| -------- | ----------------- | ------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| OLH03801 | Batuk/ISPA ringan | `batuk-ispa-ringan` | Minyak kayu putih untuk luar, bukan diminum | Gunakan minyak kayu putih komersial yang sudah sesuai pemakaian luar, jangan diminum. Bisa diencerkan dengan minyak pembawa bila kulit sensitif. | Oles tipis di dada/punggung orang dewasa, hindari area hidung bayi. | Berisiko tinggi pada bayi/anak kecil, asma/epilepsi, hamil/menyusui, jangan tertelan. |
| OLH03802 | Nyeri otot/pegal  | `nyeri-otot-pegal`  | Minyak kayu putih untuk luar                | Oles sedikit minyak, dapat dicampur minyak pembawa.                                                                                              | Pijat ringan pada otot pegal.                                       | Jangan pada luka terbuka atau kulit iritasi.                                          |

### TAN039 — Kayu Manis

| Field                            | Isi                                                                                                                                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kayu-manis`                                                                                                                                                                                                                                                          |
| Nama lokal                       | Kayu Manis                                                                                                                                                                                                                                                            |
| Nama latin                       | Cinnamomum burmannii (Nees & T.Nees) Blume / Cinnamomum verum J.Presl                                                                                                                                                                                                 |
| Deskripsi                        | Kayu manis adalah kulit batang beraroma manis-pedas yang sering digunakan sebagai rempah. Rasanya hangat dan cocok ditambahkan dalam makanan atau minuman.                                                                                                            |
| Senyawa aktif utama              | cinnamaldehyde, eugenol, procyanidin, coumarin (lebih tinggi pada cassia/burmannii)                                                                                                                                                                                   |
| Manfaat/khasiat tradisional      | Mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter serta mendukung pengelolaan kolesterol sebagai pendamping pola makan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Dosis tinggi jangka panjang dapat bermasalah pada hati karena coumarin, hati-hati dengan obat diabetes/pengencer darah.                                                                                                                                               |
| Kondisi refs                     | `diabetes-gula-darah-tinggi`; `kolesterol-tinggi-dislipidemia`                                                                                                                                                                                                        |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang–Tinggi                                                                                                                            |
| Kondisi/kelompok raw        | Penyakit hati, pengguna warfarin/pengencer darah, diabetes dengan obat, ibu hamil bila suplemen tinggi, pasien sebelum operasi.          |
| Kelompok risiko refs        | `ibu-hamil`; `pengguna-pengencer-darah`; `pasien-sebelum-operasi`; `diabetes-obat-antidiabetes`; `penyakit-hati`                         |
| Bagian/cara pakai pantangan | Kulit batang/kapsul ekstrak tinggi, terutama jenis cassia/burmannii yang dapat mengandung coumarin lebih tinggi.                         |
| Alasan risiko               | Coumarin pada kayu manis cassia dapat bermasalah bagi hati pada orang sensitif, ekstrak tinggi juga berpotensi berinteraksi dengan obat. |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                     | Bagian yang digunakan                     | Cara pengolahan                                                                  | Cara pakai tradisional                          | Catatan keamanan                                                                                    |
| -------- | --------------------------------------------- | -------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| OLH03901 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi`     | Kulit batang sebagai bumbu/seduhan ringan | Gunakan sedikit kayu manis dalam minuman/makanan, hindari kapsul/ekstrak tinggi. | Dikonsumsi sebagai bumbu pendamping pola makan. | Jenis cassia/burmannii dapat mengandung coumarin, hati-hati penyakit hati, warfarin, obat diabetes. |
| OLH03902 | Kolesterol tinggi sebagai pendamping          | `kolesterol-tinggi-dislipidemia` | Kulit batang                              | Ditambahkan sedikit sebagai bumbu pada makanan/minuman tanpa gula berlebihan.    | Dikonsumsi dalam pola makan sehat.              | Tidak menggantikan diet, olahraga, atau obat lipid bila diresepkan.                                 |

### TAN040 — Stevia

| Field                            | Isi                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `stevia`                                                                                                                                                                                         |
| Nama lokal                       | Stevia                                                                                                                                                                                           |
| Nama latin                       | Stevia rebaudiana Bertoni                                                                                                                                                                        |
| Deskripsi                        | Stevia adalah tanaman berdaun manis yang sering digunakan sebagai pemanis rendah kalori. Daunnya dapat menjadi alternatif rasa manis tanpa tambahan gula biasa.                                  |
| Senyawa aktif utama              | stevioside, rebaudioside A, flavonoid, diterpene glycoside                                                                                                                                       |
| Manfaat/khasiat tradisional      | Mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Gunakan produk steviol glycoside yang aman, hati-hati bila gula darah/tekanan darah rendah atau memakai obat diabetes/hipertensi.                                                                |
| Kondisi refs                     | `diabetes-gula-darah-tinggi`                                                                                                                                                                     |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                                         |
| Kondisi/kelompok raw        | Diabetes yang memakai obat, tekanan darah rendah/pengguna antihipertensi, alergi famili Asteraceae, ibu hamil/menyusui bila ekstrak pekat nonstandar. |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`; `alergi`                         |
| Bagian/cara pakai pantangan | Ekstrak daun pekat, produk herbal nonstandar, pemanis steviol glycoside terstandar lebih jelas keamanannya.                                           |
| Alasan risiko               | Dapat memengaruhi gula darah/tekanan darah, risiko lebih besar pada ekstrak herbal dibanding pemanis yang sudah dimurnikan dan terstandar.            |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan                          | Cara pengolahan                                                                                                                        | Cara pakai tradisional                     | Catatan keamanan                              |
| -------- | --------------------------------------------- | ---------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------- |
| OLH04001 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Daun atau pemanis steviol glycoside terstandar | Daun dapat diseduh ringan atau digunakan sedikit sebagai pemanis. Produk pemanis terstandar lebih terukur daripada ekstrak daun pekat. | Dipakai mengganti gula dalam jumlah wajar. | Pantau gula darah bila memakai obat diabetes. |

### TAN041 — Serai Wangi

| Field                            | Isi                                                                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `serai-wangi`                                                                                                                                                                                                                      |
| Nama lokal                       | Serai Wangi                                                                                                                                                                                                                        |
| Nama latin                       | Cymbopogon nardus (L.) Rendle / Cymbopogon winterianus Jowitt                                                                                                                                                                      |
| Deskripsi                        | Serai wangi adalah rumput aromatik yang menjadi sumber minyak citronella. Aromanya kuat dan sering digunakan untuk membantu mengusir nyamuk atau serangga.                                                                         |
| Senyawa aktif utama              | citronellal, geraniol, citronellol, limonene, elemol                                                                                                                                                                               |
| Manfaat/khasiat tradisional      | Membantu mengurangi keluhan gigitan serangga ringan untuk pemakaian luar serta membantu keluhan Nyeri Otot/Pegal. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Minyak atsiri wajib diencerkan, hindari pada kulit bayi, hamil trimester awal, alergi, luka terbuka, dan jangan diminum.                                                                                                           |
| Kondisi refs                     | `gigitan-serangga`; `nyeri-otot-pegal`                                                                                                                                                                                             |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Tinggi                                                                                                                                 |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, bayi/anak kecil, asma, epilepsi, kulit sensitif/alergi.                                                            |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `kulit-mukosa-sensitif-luka`; `asma-epilepsi`; `alergi`                                |
| Bagian/cara pakai pantangan | Minyak atsiri citronella diminum, oles pekat tanpa pengencer, penggunaan dekat wajah bayi.                                             |
| Alasan risiko               | Minyak atsiri sangat pekat dan dapat menyebabkan iritasi kulit, gangguan napas pada orang sensitif, serta risiko toksik bila tertelan. |

#### Cara Pengolahan

| Kode     | Judul                    | Kondisi refs       | Bagian yang digunakan               | Cara pengolahan                                                                      | Cara pakai tradisional                                                              | Catatan keamanan                                                                         |
| -------- | ------------------------ | ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| OLH04101 | Gigitan serangga/repelan | `gigitan-serangga` | Minyak atsiri citronella untuk luar | Minyak atsiri harus diencerkan dengan minyak pembawa sebelum dioles. Jangan diminum. | Oles tipis di kulit luar atau gunakan sebagai aroma ruangan sesuai petunjuk produk. | Tidak untuk bayi/anak kecil, hamil/menyusui, asma/epilepsi, kulit sensitif tanpa arahan. |
| OLH04102 | Nyeri otot/pegal         | `nyeri-otot-pegal` | Minyak atsiri yang diencerkan       | Campur sedikit minyak serai wangi dengan minyak pembawa.                             | Pijat ringan pada area pegal.                                                       | Uji tempel, hindari luka terbuka.                                                        |

### TAN042 — Lengkuas Merah

| Field                            | Isi                                                                                                                                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `lengkuas-merah`                                                                                                                                                                                                                                 |
| Nama lokal                       | Lengkuas Merah                                                                                                                                                                                                                                   |
| Nama latin                       | Alpinia purpurata (Vieill.) K.Schum. / Alpinia galanga varietas merah (perlu verifikasi lokal)                                                                                                                                                   |
| Deskripsi                        | Lengkuas merah adalah varian lengkuas dengan warna rimpang kemerahan. Rimpang ini beraroma tajam dan sering digunakan sebagai rempah hangat dalam ramuan tradisional.                                                                            |
| Senyawa aktif utama              | galangin, diarylheptanoid, cineole, eugenol, minyak atsiri                                                                                                                                                                                       |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu keluhan gatal/jamur kulit ringan untuk pemakaian luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada lambung sensitif, alergi rempah, dan penggunaan ekstrak dosis tinggi saat hamil.                                                                                                                                                  |
| Kondisi refs                     | `dispepsia-kembung`; `gatal-infeksi-jamur-kulit`                                                                                                                                                                                                 |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Rendah–Sedang                                                                                                                                                |
| Kondisi/kelompok raw        | GERD/maag, ibu hamil/menyusui bila dosis obat, pengguna pengencer darah.                                                                                     |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `pengguna-pengencer-darah`; `gerd-maag-gastritis-tukak`                                                                         |
| Bagian/cara pakai pantangan | Rimpang/ekstrak/minyak atsiri dosis tinggi.                                                                                                                  |
| Alasan risiko               | Identifikasi botani perlu dipastikan, jika termasuk Alpinia, risikonya mirip rimpang aromatik lain: iritasi lambung dan potensi interaksi pada dosis tinggi. |

#### Cara Pengolahan

| Kode     | Judul                            | Kondisi refs                | Bagian yang digunakan | Cara pengolahan                                          | Cara pakai tradisional                               | Catatan keamanan                                                 |
| -------- | -------------------------------- | --------------------------- | --------------------- | -------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| OLH04201 | Dispepsia/kembung                | `dispepsia-kembung`         | Rimpang               | Rimpang dicuci, dimemarkan, seduh/rebus ringan.          | Diminum hangat setelah makan.                        | Hati-hati GERD/maag.                                             |
| OLH04203 | Gatal/infeksi jamur kulit ringan | `gatal-infeksi-jamur-kulit` | Rimpang untuk luar    | Rimpang diparut dan dicampur sedikit air/minyak pembawa. | Oles tipis pada area kecil, lalu bilas bila iritasi. | Jangan pada luka terbuka, identifikasi tanaman perlu dipastikan. |

### TAN043 — Kunyit Putih

| Field                            | Isi                                                                                                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `kunyit-putih`                                                                                                                                                                                               |
| Nama lokal                       | Kunyit Putih                                                                                                                                                                                                 |
| Nama latin                       | Curcuma zedoaria (Christm.) Roscoe                                                                                                                                                                           |
| Deskripsi                        | Kunyit putih adalah rimpang dari keluarga Curcuma dengan warna lebih pucat dan aroma khas. Tanaman ini dikenal dalam ramuan tradisional untuk keluhan perut dan nyeri.                                       |
| Senyawa aktif utama              | curdione, germacrone, curzerenone, zederone, minyak atsiri                                                                                                                                                   |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu nyeri haid ringan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hindari pada kehamilan karena potensi efek pada rahim, hati-hati gangguan empedu, pengencer darah, dan operasi.                                                                                              |
| Kondisi refs                     | `dispepsia-kembung`; `nyeri-haid`                                                                                                                                                                            |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Tinggi                                                                                                                                                   |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, gangguan perdarahan, pengguna pengencer darah, batu empedu/sumbatan empedu, pasien sebelum operasi.                                  |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `gangguan-perdarahan`; `pengguna-pengencer-darah`; `pasien-sebelum-operasi`; `batu-empedu-sumbatan-empedu`                  |
| Bagian/cara pakai pantangan | Rimpang/ekstrak pekat, jamu peluruh haid, kapsul.                                                                                                        |
| Alasan risiko               | Secara tradisional dikaitkan dengan efek emmenagogue/peluruh haid, kelompok Curcuma juga berpotensi memengaruhi empedu dan perdarahan pada dosis tinggi. |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                                                                                         | Cara pakai tradisional                    | Catatan keamanan                                                                      |
| -------- | ----------------- | ------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| OLH04301 | Dispepsia/kembung | `dispepsia-kembung` | Rimpang               | Rimpang dicuci, diiris, direbus ringan dan disaring.                                                                    | Diminum sedikit setelah makan bila cocok. | Risiko tinggi pada hamil/menyusui, gangguan perdarahan, batu empedu, pengencer darah. |
| OLH04302 | Nyeri haid        | `nyeri-haid`        | Rimpang               | Tidak dianjurkan untuk hamil atau dicurigai hamil. Jika digunakan tradisional, dibuat rebusan ringan, bukan jamu pekat. | Diminum terbatas untuk keluhan ringan.    | Nyeri berat/perdarahan banyak perlu pemeriksaan.                                      |

### TAN044 — Insulin

| Field                            | Isi                                                                                                                                                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Slug                             | `insulin`                                                                                                                                                                                              |
| Nama lokal                       | Insulin                                                                                                                                                                                                |
| Nama latin                       | Chamaecostus cuspidatus (Nees & Mart.) C.D.Specht / Costus igneus Nak (nama populer: insulin plant)                                                                                                    |
| Deskripsi                        | Tanaman insulin adalah tanaman hias sekaligus herbal yang populer karena daunnya sering dikaitkan dengan pendamping gula darah. Penggunaannya tetap perlu pemantauan terutama bagi penderita diabetes. |
| Senyawa aktif utama              | flavonoid, saponin, steroid, corosolic acid (dilaporkan), mineral                                                                                                                                      |
| Manfaat/khasiat tradisional      | Mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter.       |
| Perhatian/kontraindikasi ringkas | Risiko hipoglikemia bila bersama obat diabetes/insulin, ibu hamil/menyusui dan penyakit ginjal/hati sebaiknya menghindari dosis herbal tanpa dokter.                                                   |
| Kondisi refs                     | `diabetes-gula-darah-tinggi`                                                                                                                                                                           |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                      |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang–Tinggi                                                                                                                                            |
| Kondisi/kelompok raw        | Diabetes yang memakai insulin/obat antidiabetes, ibu hamil/menyusui, penyakit hati/ginjal, anak-anak.                                                    |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `diabetes-obat-antidiabetes`; `penyakit-hati`                                                            |
| Bagian/cara pakai pantangan | Daun/rebusan/ekstrak sebagai “obat diabetes”, terutama bila menggantikan obat dokter.                                                                    |
| Alasan risiko               | Dikenal secara empiris sebagai antidiabetes, risiko utamanya hipoglikemia bila digabung obat dan keterlambatan terapi bila mengganti insulin/obat medis. |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                                                       | Cara pakai tradisional                       | Catatan keamanan                                                          |
| -------- | --------------------------------------------- | ---------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| OLH04401 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Daun                  | Daun dapat direbus ringan sebagai seduhan encer, tetapi tidak boleh menggantikan insulin/obat dokter. | Diminum terbatas sambil memantau gula darah. | Berisiko hipoglikemia bila digabung obat diabetes. Konsultasi diperlukan. |

### TAN045 — Bratawali

| Field                            | Isi                                                                                                                                                                                                                                                                    |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `bratawali`                                                                                                                                                                                                                                                            |
| Nama lokal                       | Bratawali                                                                                                                                                                                                                                                              |
| Nama latin                       | Tinospora crispa (L.) Hook.f. & Thomson                                                                                                                                                                                                                                |
| Deskripsi                        | Bratawali adalah tanaman merambat dengan rasa sangat pahit. Dalam tradisi jamu, tanaman ini sering dipakai untuk keluhan demam, gatal, dan gula darah.                                                                                                                 |
| Senyawa aktif utama              | borapetoside, tinocrisposide, berberine, diterpenoid, alkaloid                                                                                                                                                                                                         |
| Manfaat/khasiat tradisional      | Membantu rasa tidak nyaman saat demam ringan sebagai pendamping serta mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Ada kekhawatiran efek hati pada sebagian laporan herbal Tinospora, hati-hati pada penyakit hati, autoimun, obat diabetes, hamil/menyusui.                                                                                                                              |
| Kondisi refs                     | `demam`; `diabetes-gula-darah-tinggi`                                                                                                                                                                                                                                  |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Sedang–Tinggi                                                                                                                                    |
| Kondisi/kelompok raw        | Diabetes dengan obat, penyakit hati, penyakit autoimun/pengguna imunosupresan, ibu hamil/menyusui, anak-anak.                                    |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `diabetes-obat-antidiabetes`; `penyakit-hati`; `autoimun-imunosupresan`                          |
| Bagian/cara pakai pantangan | Batang/rebusan pahit/ekstrak pekat.                                                                                                              |
| Alasan risiko               | Berpotensi memengaruhi gula darah dan imun, data keamanan dosis tinggi/kehamilan terbatas sehingga tidak boleh digunakan sebagai pengganti obat. |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                             | Cara pakai tradisional                       | Catatan keamanan                                                                       |
| -------- | --------------------------------------------- | ---------------------------- | --------------------- | --------------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| OLH04501 | Demam ringan                                  | `demam`                      | Batang                | Batang dicuci, dipotong kecil, direbus ringan, karena pahit, gunakan encer. | Diminum sedikit dan jangka pendek.           | Demam tinggi/menetap perlu pemeriksaan, hindari pada hamil/menyusui dan penyakit hati. |
| OLH04502 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Batang                | Rebusan batang dibuat encer, bukan ekstrak pekat.                           | Diminum terbatas sambil memantau gula darah. | Jangan mengganti obat, hati-hati hipoglikemia dan penyakit autoimun/imunosupresan.     |

### TAN046 — Cincau Daun Lebar

| Field                            | Isi                                                                                                                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `cincau-daun-lebar`                                                                                                                                                                                        |
| Nama lokal                       | Cincau Daun Lebar                                                                                                                                                                                          |
| Nama latin                       | Premna oblongifolia Merr. / Premna serratifolia (identifikasi lokal perlu dikonfirmasi)                                                                                                                    |
| Deskripsi                        | Cincau daun lebar adalah tanaman yang daunnya bisa diolah menjadi cincau bertekstur gel. Minuman cincau dari daun bersih terasa sejuk dan mudah dikonsumsi.                                                |
| Senyawa aktif utama              | pektin/polisakarida, flavonoid, tanin, klorofil, mineral                                                                                                                                                   |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu sembelit ringan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Perhatikan kebersihan dan tambahan gula, bukan obat demam/konstipasi berat.                                                                                                                                |
| Kondisi refs                     | `dispepsia-kembung`; `sembelit`                                                                                                                                                                            |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Rendah–Sedang                                                                                                                                    |
| Kondisi/kelompok raw        | Tekanan darah rendah, diabetes dengan obat, diare, ibu hamil/menyusui bila konsumsi berlebihan.                                                  |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`; `dehidrasi-diare`           |
| Bagian/cara pakai pantangan | Daun gel/rebusan pekat dalam jumlah besar.                                                                                                       |
| Alasan risiko               | Karena identifikasi lokal bisa berbeda, risiko spesifik belum pasti, penggunaan sebagai minuman pangan umumnya lebih aman daripada ekstrak obat. |

#### Cara Pengolahan

| Kode     | Judul                                 | Kondisi refs                    | Bagian yang digunakan | Cara pengolahan                                                                      | Cara pakai tradisional                                | Catatan keamanan                                |
| -------- | ------------------------------------- | ------------------------------- | --------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------- |
| OLH04601 | Dispepsia/kembung dan sembelit ringan | `dispepsia-kembung`; `sembelit` | Daun gel              | Daun dicuci, diremas dengan air matang, disaring, lalu didiamkan hingga menjadi gel. | Dikonsumsi sebagai gel/minuman tanpa gula berlebihan. | Hentikan bila diare, batasi gula pada diabetes. |

### TAN047 — Jeruk Purut

| Field                            | Isi                                                                                                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `jeruk-purut`                                                                                                                                                                                            |
| Nama lokal                       | Jeruk Purut                                                                                                                                                                                              |
| Nama latin                       | Citrus hystrix DC.                                                                                                                                                                                       |
| Deskripsi                        | Jeruk purut adalah tanaman sitrus dengan daun dan kulit buah yang sangat wangi. Aromanya sering dipakai dalam masakan, minuman, dan perawatan tradisional.                                               |
| Senyawa aktif utama              | citronellal, limonene, β-pinene, flavonoid, vitamin C                                                                                                                                                    |
| Manfaat/khasiat tradisional      | Meredakan mual, membantu mengurangi bau mulut, serta membantu perawatan rambut/ketombe. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Minyak kulit jeruk dapat mengiritasi/fotosensitif, hindari kontak mata, luka, dan dosis ekstrak saat hamil.                                                                                              |
| Kondisi refs                     | `mual`; `bau-mulut`; `rambut-ketombe`                                                                                                                                                                    |

#### Kontraindikasi

| Field                       | Isi                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Rendah–Sedang                                                                                                      |
| Kondisi/kelompok raw        | GERD/maag, kulit sensitif/fotosensitif, ibu hamil bila minyak atsiri dosis tinggi.                                 |
| Kelompok risiko refs        | `ibu-hamil`; `gerd-maag-gastritis-tukak`; `kulit-mukosa-sensitif-luka`; `fotosensitif-dermatitis`                  |
| Bagian/cara pakai pantangan | Minyak kulit/daun jeruk purut pekat, oles kulit sebelum terkena matahari, air jeruk berlebihan.                    |
| Alasan risiko               | Minyak kulit citrus dapat iritatif dan sebagian citrus berisiko fotosensitisasi, asam dapat memperburuk GERD/maag. |

#### Cara Pengolahan

| Kode     | Judul          | Kondisi refs     | Bagian yang digunakan                                   | Cara pengolahan                                                                        | Cara pakai tradisional                                | Catatan keamanan                                                 |
| -------- | -------------- | ---------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| OLH04701 | Mual           | `mual`           | Daun atau kulit buah sebagai aroma, air buah bila cocok | Daun/kulit dicuci, diseduh ringan untuk aroma. Air buah harus diencerkan bila diminum. | Aroma dihirup dari seduhan hangat atau diminum encer. | Hati-hati GERD/maag, minyak kulit dapat fotosensitif pada kulit. |
| OLH04703 | Bau mulut      | `bau-mulut`      | Air buah sangat encer atau daun                         | Air buah diencerkan untuk kumur, daun direbus ringan sebagai kumur aromatik.           | Berkumur sebentar lalu bilas.                         | Jangan terlalu asam agar tidak merusak enamel.                   |
| OLH04704 | Rambut/ketombe | `rambut-ketombe` | Air buah/daun untuk luar                                | Air buah diencerkan banyak atau air rebusan daun didinginkan.                          | Dipakai bilasan rambut lalu dibilas air bersih.       | Hindari kulit kepala luka/iritasi, jangan terkena mata.          |

### TAN048 — Rosela

| Field                            | Isi                                                                                                                                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `rosela`                                                                                                                                                                                                                                                                |
| Nama lokal                       | Rosela                                                                                                                                                                                                                                                                  |
| Nama latin                       | Hibiscus sabdariffa L.                                                                                                                                                                                                                                                  |
| Deskripsi                        | Rosela adalah tanaman dengan kelopak bunga merah yang biasa diseduh sebagai teh herbal bercita rasa asam segar. Warnanya berasal dari pigmen alami yang kaya antioksidan.                                                                                               |
| Senyawa aktif utama              | antosianin, hibiscus acid, flavonoid, asam organik, polifenol                                                                                                                                                                                                           |
| Manfaat/khasiat tradisional      | Mendukung pemantauan tekanan darah sebagai pendamping pola hidup dan obat dokter serta mendukung pengelolaan kolesterol sebagai pendamping pola makan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada tekanan darah rendah, obat antihipertensi/diabetes, diuretik, dan kehamilan dosis pekat.                                                                                                                                                                 |
| Kondisi refs                     | `hipertensi`; `kolesterol-tinggi-dislipidemia`                                                                                                                                                                                                                          |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                        |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, tekanan darah rendah, pengguna antihipertensi/antidiabetes, pasien sebelum operasi.                                       |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `pasien-sebelum-operasi`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah` |
| Bagian/cara pakai pantangan | Kelopak/calyx sebagai teh sangat pekat atau ekstrak rutin dosis tinggi.                                                                       |
| Alasan risiko               | Rosela dapat memiliki efek hipotensif dan metabolik, keamanan pada kehamilan/laktasi belum cukup kuat.                                        |

#### Cara Pengolahan

| Kode     | Judul                                | Kondisi refs                     | Bagian yang digunakan           | Cara pengolahan                                       | Cara pakai tradisional                               | Catatan keamanan                                                              |
| -------- | ------------------------------------ | -------------------------------- | ------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| OLH04801 | Hipertensi sebagai pendamping        | `hipertensi`                     | Kelopak/calyx kering atau segar | Cuci/seduh kelopak seperti teh, jangan terlalu pekat. | Diminum sebagai teh asam ringan tanpa gula berlebih. | Hati-hati tekanan darah rendah, obat antihipertensi/diabetes, hamil/menyusui. |
| OLH04802 | Kolesterol tinggi sebagai pendamping | `kolesterol-tinggi-dislipidemia` | Kelopak/calyx                   | Seduh kelopak sebagai teh ringan.                     | Dikonsumsi sebagai bagian pola makan sehat.          | Tetap perlu pemeriksaan lipid dan pengaturan makan.                           |

### TAN049 — Bawang Dayak

| Field                            | Isi                                                                                                                                                                                                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `bawang-dayak`                                                                                                                                                                                                                                                                          |
| Nama lokal                       | Bawang Dayak                                                                                                                                                                                                                                                                            |
| Nama latin                       | Eleutherine bulbosa (Mill.) Urb. / Eleutherine palmifolia (L.) Merr.                                                                                                                                                                                                                    |
| Deskripsi                        | Bawang dayak adalah umbi berwarna merah yang dikenal dalam ramuan tradisional terutama di beberapa daerah Indonesia. Umbinya biasanya dikeringkan atau direbus sebagai minuman herbal.                                                                                                  |
| Senyawa aktif utama              | eleutherine, isoeleutherine, eleutherol, naphthoquinone, flavonoid                                                                                                                                                                                                                      |
| Manfaat/khasiat tradisional      | Mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter serta mendukung pemantauan tekanan darah sebagai pendamping pola hidup dan obat dokter. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati dengan obat diabetes/hipertensi/pengencer darah, hindari dosis tinggi saat hamil/menyusui.                                                                                                                                                                                    |
| Kondisi refs                     | `diabetes-gula-darah-tinggi`; `hipertensi`                                                                                                                                                                                                                                              |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                |
| Kondisi/kelompok raw        | Gangguan perdarahan, pengguna pengencer darah, pasien sebelum operasi, maag/GERD, ibu hamil/menyusui.                                 |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `gangguan-perdarahan`; `pengguna-pengencer-darah`; `pasien-sebelum-operasi`; `gerd-maag-gastritis-tukak` |
| Bagian/cara pakai pantangan | Umbi/rebusan/ekstrak pekat.                                                                                                           |
| Alasan risiko               | Mengandung senyawa naftokuinon/fenolik, potensi iritasi lambung dan interaksi perdarahan perlu diwaspadai pada dosis obat.            |

#### Cara Pengolahan

| Kode     | Judul                                  | Kondisi refs                               | Bagian yang digunakan | Cara pengolahan                                                                                  | Cara pakai tradisional                                     | Catatan keamanan                                                                        |
| -------- | -------------------------------------- | ------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| OLH04901 | Diabetes/hipertensi sebagai pendamping | `diabetes-gula-darah-tinggi`; `hipertensi` | Umbi                  | Umbi dicuci, diiris tipis, dikeringkan bersih, lalu diseduh/rebus ringan. Hindari ekstrak pekat. | Diminum terbatas sambil memantau gula darah/tekanan darah. | Hati-hati bila memakai obat diabetes/hipertensi/pengencer darah, jangan mengganti obat. |

### TAN050 — Bunga Piladang

| Field                            | Isi                                                                                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `bunga-piladang`                                                                                                                                                                                                                      |
| Nama lokal                       | Bunga Piladang                                                                                                                                                                                                                        |
| Nama latin                       | Plectranthus scutellarioides (L.) R.Br. / Coleus scutellarioides (nama lokal: miana/iler/piladang)                                                                                                                                    |
| Deskripsi                        | Bunga piladang adalah tanaman hias berdaun menarik yang di beberapa daerah digunakan sebagai tanaman obat tradisional. Bagian daunnya sering dikaitkan dengan keluhan kulit dan nyeri.                                                |
| Senyawa aktif utama              | flavonoid, saponin, tanin, polifenol, minyak atsiri                                                                                                                                                                                   |
| Manfaat/khasiat tradisional      | Membantu perawatan bisul ringan sebagai kompres/tapal luar serta membantu keluhan wasir ringan sebagai kompres luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Pemakaian untuk perdarahan/wasir berat, demam nifas, atau nyeri haid berat perlu dokter, hati-hati pada hamil/menyusui.                                                                                                               |
| Kondisi refs                     | `bisul`; `wasir`                                                                                                                                                                                                                      |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                                                              |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, anak-anak, pengguna obat diabetes/tekanan darah, alergi kulit.                                                                                  |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `kulit-mukosa-sensitif-luka`; `alergi`              |
| Bagian/cara pakai pantangan | Daun/ekstrak pekat oral, pemakaian topikal pada luka terbuka tanpa sterilitas.                                                                                      |
| Alasan risiko               | Tanaman hias/obat lokal dengan data keamanan klinis terbatas, daun mengandung senyawa fenolik/terpenoid yang dapat mengiritasi atau berinteraksi pada dosis tinggi. |

#### Cara Pengolahan

| Kode     | Judul | Kondisi refs | Bagian yang digunakan   | Cara pengolahan                                               | Cara pakai tradisional                                                     | Catatan keamanan                                                      |
| -------- | ----- | ------------ | ----------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| OLH05001 | Bisul | `bisul`      | Daun untuk luar         | Daun dicuci, dilayukan sebentar, lalu ditumbuk menjadi tapal. | Tempel di sekitar bisul, bukan dipaksa pada luka terbuka, jaga kebersihan. | Bisul besar, nyeri berat, demam, atau bernanah luas perlu dokter.     |
| OLH05002 | Wasir | `wasir`      | Daun untuk kompres luar | Daun direbus ringan, airnya didinginkan dan disaring.         | Dipakai kompres luar area anus, bukan dimasukkan.                          | Perdarahan, nyeri berat, atau benjolan tidak masuk perlu pemeriksaan. |

### TAN051 — Tanaman Selasih

| Field                            | Isi                                                                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `tanaman-selasih`                                                                                                                                                                                                                  |
| Nama lokal                       | Tanaman Selasih                                                                                                                                                                                                                    |
| Nama latin                       | Ocimum basilicum L. / Ocimum americanum L. (tergantung jenis lokal)                                                                                                                                                                |
| Deskripsi                        | Tanaman selasih adalah herba aromatik dengan daun wangi dan biji yang dapat mengembang menjadi gel. Biji dan daunnya sering dipakai dalam minuman atau ramuan ringan.                                                              |
| Senyawa aktif utama              | linalool, eugenol, methyl chavicol/estragole, rosmarinic acid, flavonoid                                                                                                                                                           |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu relaksasi pada stres ringan/sulit tidur. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hindari minyak atsiri/dosis tinggi saat hamil, biji harus direndam cukup agar tidak mengembang di tenggorokan.                                                                                                                     |
| Kondisi refs                     | `dispepsia-kembung`; `stres-ringan-sulit-tidur`                                                                                                                                                                                    |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                   |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                                         |
| Kondisi/kelompok raw        | Ibu hamil/menyusui bila minyak atsiri/ekstrak tinggi, pengguna pengencer darah, diabetes dengan obat, anak kecil.                                     |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `pengguna-pengencer-darah`; `diabetes-obat-antidiabetes`                                              |
| Bagian/cara pakai pantangan | Minyak atsiri selasih, ekstrak pekat, biji selasih kering tanpa cukup air.                                                                            |
| Alasan risiko               | Daun sebagai bumbu relatif aman, minyak atsiri/ekstrak lebih pekat. Biji mengembang sehingga perlu cukup air agar tidak berisiko tersedak/tersangkut. |

#### Cara Pengolahan

| Kode     | Judul                    | Kondisi refs               | Bagian yang digunakan | Cara pengolahan                                                      | Cara pakai tradisional               | Catatan keamanan                             |
| -------- | ------------------------ | -------------------------- | --------------------- | -------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------- |
| OLH05102 | Dispepsia/kembung        | `dispepsia-kembung`        | Daun                  | Daun diseduh ringan atau dimakan sebagai lalapan dalam jumlah wajar. | Dikonsumsi setelah makan bila cocok. | Hindari minyak atsiri/ekstrak pekat.         |
| OLH05103 | Stres ringan/sulit tidur | `stres-ringan-sulit-tidur` | Daun                  | Seduh daun sebagai teh aromatik ringan.                              | Diminum hangat pada malam hari.      | Keluhan cemas/insomnia berat perlu evaluasi. |

### TAN052 — Kenikir

| Field                            | Isi                                                                                                                                                                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kenikir`                                                                                                                                                                                                                                |
| Nama lokal                       | Kenikir                                                                                                                                                                                                                                  |
| Nama latin                       | Cosmos caudatus Kunth                                                                                                                                                                                                                    |
| Deskripsi                        | Kenikir adalah tanaman sayur lalap beraroma khas yang kaya antioksidan. Daunnya sering dimakan sebagai bagian dari pola makan sehari-hari.                                                                                               |
| Senyawa aktif utama              | quercetin, chlorogenic acid, catechin, flavonoid, vitamin/mineral                                                                                                                                                                        |
| Manfaat/khasiat tradisional      | Membantu meningkatkan nafsu makan serta mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Aman sebagai sayur bersih, pantau bila menggunakan obat diabetes/hipertensi dan mengonsumsi ekstrak pekat.                                                                                                                               |
| Kondisi refs                     | `nafsu-makan-turun`; `diabetes-gula-darah-tinggi`                                                                                                                                                                                        |

#### Kontraindikasi

| Field                       | Isi                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Rendah                                                                                                                   |
| Kondisi/kelompok raw        | Ibu hamil/menyusui bila ekstrak obat, pengguna obat diabetes/hipertensi bila konsumsi ekstrak tinggi, alergi Asteraceae. |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `alergi`                    |
| Bagian/cara pakai pantangan | Daun ekstrak/rebusan pekat, bukan lalapan wajar.                                                                         |
| Alasan risiko               | Umumnya sebagai sayuran, risiko meningkat pada ekstrak dosis tinggi karena potensi efek metabolik dan alergi.            |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                                       | Cara pakai tradisional                      | Catatan keamanan                                                     |
| -------- | --------------------------------------------- | ---------------------------- | --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| OLH05201 | Nafsu makan turun                             | `nafsu-makan-turun`          | Daun muda             | Daun dicuci bersih, dapat direbus sebentar sebagai lalapan matang atau dimasak sayur. | Dikonsumsi sebagai pangan pendamping makan. | Gunakan sebagai pangan, bukan ekstrak pekat.                         |
| OLH05202 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Daun                  | Daun dikonsumsi sebagai sayur/lalapan matang tanpa garam/gula berlebihan.             | Dikonsumsi dalam pola makan seimbang.       | Pantau bila memakai obat diabetes/hipertensi, jangan mengganti obat. |

### TAN053 — Jeruk Kasturi

| Field                            | Isi                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `jeruk-kasturi`                                                                                                                                                                                                           |
| Nama lokal                       | Jeruk Kasturi                                                                                                                                                                                                             |
| Nama latin                       | Citrus microcarpa Bunge / Citrus × microcarpa (calamansi)                                                                                                                                                                 |
| Deskripsi                        | Jeruk kasturi adalah buah sitrus kecil yang sangat asam dan beraroma segar. Air perasannya sering dipakai dalam minuman, sambal, atau ramuan tenggorokan ringan.                                                          |
| Senyawa aktif utama              | vitamin C, asam sitrat, limonene, flavonoid hesperidin/naringin                                                                                                                                                           |
| Manfaat/khasiat tradisional      | Melegakan batuk/ISPA ringan, menenangkan radang tenggorokan ringan, serta membantu mengurangi bau mulut. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada GERD/maag, enamel gigi, iritasi kulit dan fotosensitivitas.                                                                                                                                                |
| Kondisi refs                     | `batuk-ispa-ringan`; `radang-tenggorokan`; `bau-mulut`                                                                                                                                                                    |

#### Kontraindikasi

| Field                       | Isi                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                               |
| Kondisi/kelompok raw        | GERD/maag, gigi sensitif, kulit fotosensitif, pengguna obat yang sensitif terhadap citrus bila konsumsi ekstrak berlebihan. |
| Kelompok risiko refs        | `gerd-maag-gastritis-tukak`; `gigi-sensitif-enamel-tipis`; `fotosensitif-dermatitis`                                        |
| Bagian/cara pakai pantangan | Air perasan sangat asam, minyak/peel citrus pada kulit lalu terkena matahari.                                               |
| Alasan risiko               | Asam dapat mengiritasi lambung/enamel gigi, minyak kulit citrus dapat iritatif/fotosensitisasi.                             |

#### Cara Pengolahan

| Kode     | Judul                                    | Kondisi refs                              | Bagian yang digunakan  | Cara pengolahan                                                                | Cara pakai tradisional                  | Catatan keamanan                         |
| -------- | ---------------------------------------- | ----------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ | --------------------------------------- | ---------------------------------------- |
| OLH05301 | Batuk/ISPA ringan dan radang tenggorokan | `batuk-ispa-ringan`; `radang-tenggorokan` | Air perasan buah       | Cuci buah, peras, lalu encerkan dengan air hangat. Tambahkan madu bila sesuai. | Diminum hangat atau berkumur encer.     | Hati-hati GERD/maag dan enamel gigi.     |
| OLH05302 | Bau mulut                                | `bau-mulut`                               | Air perasan buah encer | Campur sedikit air jeruk kasturi dengan air matang.                            | Berkumur sebentar lalu bilas air putih. | Jangan terlalu pekat/sering karena asam. |

### TAN054 — Sambung Nyawa

| Field                            | Isi                                                                                                                                                                                                                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `sambung-nyawa`                                                                                                                                                                                                                                                                         |
| Nama lokal                       | Sambung Nyawa                                                                                                                                                                                                                                                                           |
| Nama latin                       | Gynura procumbens (Lour.) Merr.                                                                                                                                                                                                                                                         |
| Deskripsi                        | Sambung nyawa adalah tanaman herba berdaun lunak yang sering dijadikan lalap atau herbal pendamping. Tanaman ini populer untuk keluhan metabolik dan nyeri ringan.                                                                                                                      |
| Senyawa aktif utama              | quercetin, kaempferol, flavonoid, saponin, sterol, asam fenolat                                                                                                                                                                                                                         |
| Manfaat/khasiat tradisional      | Mendukung pemantauan tekanan darah sebagai pendamping pola hidup dan obat dokter serta mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati dengan obat diabetes/antihipertensi, bukti klinis terbatas dan bukan pengganti obat.                                                                                                                                                                                          |
| Kondisi refs                     | `hipertensi`; `diabetes-gula-darah-tinggi`                                                                                                                                                                                                                                              |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Sedang                                                                                                                               |
| Kondisi/kelompok raw        | Diabetes dengan obat, tekanan darah rendah/pengguna antihipertensi, ibu hamil/menyusui, penyakit hati/ginjal.                        |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `tekanan-darah-rendah`; `penyakit-hati` |
| Bagian/cara pakai pantangan | Daun/rebusan/ekstrak pekat.                                                                                                          |
| Alasan risiko               | Berpotensi memengaruhi gula darah/tekanan darah, keamanan pada kehamilan dan pemakaian lama belum cukup kuat.                        |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                                      | Cara pakai tradisional                          | Catatan keamanan                                             |
| -------- | --------------------------------------------- | ---------------------------- | --------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| OLH05401 | Hipertensi sebagai pendamping                 | `hipertensi`                 | Daun                  | Daun dicuci, diseduh atau direbus ringan, lalu saring.                               | Diminum terbatas sambil memantau tekanan darah. | Hati-hati dengan obat antihipertensi, jangan mengganti obat. |
| OLH05402 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Daun                  | Daun dibuat rebusan encer atau dikonsumsi sebagai lalapan matang dalam jumlah wajar. | Dikonsumsi sebagai pendamping pola makan.       | Pantau gula darah bila memakai obat diabetes.                |

### TAN055 — Jadam Centong

| Field                            | Isi                                                                                                                                                                                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `jadam-centong`                                                                                                                                                                                                                    |
| Nama lokal                       | Jadam Centong                                                                                                                                                                                                                      |
| Nama latin                       | Agave spp. / Aloe-like succulent; identifikasi lokal perlu verifikasi dari spesimen                                                                                                                                                |
| Deskripsi                        | Jadam centong adalah nama lokal yang perlu dipastikan lagi jenis tanamannya karena dapat merujuk pada beberapa tanaman sukulen. Karena identitasnya belum pasti, penggunaannya sebaiknya dibatasi untuk luar dan sangat hati-hati. |
| Senyawa aktif utama              | saponin, polisakarida, flavonoid, beberapa sukulen memiliki getah iritan                                                                                                                                                           |
| Manfaat/khasiat tradisional      | Membantu perawatan luka ringan pada kulit luar serta membantu iritasi kulit ringan untuk pemakaian luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter.          |
| Perhatian/kontraindikasi ringkas | Identifikasi wajib sebelum digunakan. Jangan diminum atau diteteskan ke mata, getah beberapa Agave/Aloe/Opuntia dapat iritatif atau laksatif kuat.                                                                                 |
| Kondisi refs                     | `luka-ringan`; `iritasi-kulit`                                                                                                                                                                                                     |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                             |
| Kondisi/kelompok raw        | Diabetes dengan obat, diare, kulit sensitif, ibu hamil/menyusui bila ekstrak tinggi.                                                      |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`; `dehidrasi-diare`; `kulit-mukosa-sensitif-luka`                                |
| Bagian/cara pakai pantangan | Lendir/batang ekstrak tinggi, duri/glochid pada kulit/mata, buah/batang mentah yang tidak dibersihkan.                                    |
| Alasan risiko               | Opuntia umumnya pangan, tetapi dapat memengaruhi gula darah dan menyebabkan gangguan pencernaan, duri halus dapat mengiritasi kulit/mata. |

#### Cara Pengolahan

| Kode     | Judul                     | Kondisi refs                   | Bagian yang digunakan                               | Cara pengolahan                                                                                    | Cara pakai tradisional                                                                    | Catatan keamanan                                                                  |
| -------- | ------------------------- | ------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| OLH05501 | Luka ringan/iritasi kulit | `luka-ringan`; `iritasi-kulit` | Lendir/bagian dalam batang setelah duri dibersihkan | Bersihkan duri/glochid dengan hati-hati, kupas bagian luar, ambil lendir/bagian dalam yang bersih. | Oles tipis pada kulit luar yang iritasi ringan, lalu tutup bila perlu dengan kasa bersih. | Pastikan tidak ada duri tersisa. Jangan pada luka dalam/bernanah atau dekat mata. |

### TAN056 — Kemuning

| Field                            | Isi                                                                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `kemuning`                                                                                                                                                                                                                                              |
| Nama lokal                       | Kemuning                                                                                                                                                                                                                                                |
| Nama latin                       | Murraya paniculata (L.) Jack                                                                                                                                                                                                                            |
| Deskripsi                        | Kemuning adalah perdu atau pohon kecil berbunga harum yang sering dijadikan tanaman pagar. Daun dan akarnya dikenal dalam penggunaan tradisional untuk nyeri dan kulit.                                                                                 |
| Senyawa aktif utama              | coumarin, flavonoid, alkaloid carbazole, minyak atsiri                                                                                                                                                                                                  |
| Manfaat/khasiat tradisional      | Membantu keluhan nyeri sendi/asam urat ringan sebagai pendamping serta membantu keluhan gatal/jamur kulit ringan untuk pemakaian luar. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati pada pemakaian akar/dosis tinggi, sakit gigi/gusi bengkak perlu dokter gigi.                                                                                                                                                                  |
| Kondisi refs                     | `asam-urat-nyeri-sendi`; `gatal-infeksi-jamur-kulit`                                                                                                                                                                                                    |

#### Kontraindikasi

| Field                       | Isi                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Sedang                                                                                                                           |
| Kondisi/kelompok raw        | Ibu hamil/menyusui, anak-anak, penyakit hati/ginjal, pengguna obat tekanan darah/diabetes.                                       |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `bayi-anak-kecil`; `diabetes-obat-antidiabetes`; `hipertensi-obat-antihipertensi`; `penyakit-hati`  |
| Bagian/cara pakai pantangan | Daun/akar/kulit batang ekstrak pekat, pemakaian lama.                                                                            |
| Alasan risiko               | Data keamanan klinis terbatas, beberapa bagian tanaman mengandung alkaloid/kumarin sehingga perlu kehati-hatian pada dosis obat. |

#### Cara Pengolahan

| Kode     | Judul                                    | Kondisi refs                | Bagian yang digunakan | Cara pengolahan                                                     | Cara pakai tradisional                               | Catatan keamanan                                     |
| -------- | ---------------------------------------- | --------------------------- | --------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| OLH05601 | Nyeri sendi/asam urat sebagai pendamping | `asam-urat-nyeri-sendi`     | Daun                  | Daun dicuci dan direbus ringan, atau ditumbuk sebagai kompres luar. | Diminum terbatas atau ditempel luar pada area pegal. | Hindari ekstrak pekat/pemakaian lama tanpa arahan.   |
| OLH05602 | Gatal/infeksi jamur kulit ringan         | `gatal-infeksi-jamur-kulit` | Daun untuk luar       | Daun direbus, airnya didinginkan dan disaring.                      | Dipakai membasuh area kulit luar.                    | Bukan pengganti antijamur bila infeksi luas/menetap. |

### TAN057 — Daun Kari

| Field                            | Isi                                                                                                                                                                                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `daun-kari`                                                                                                                                                                                                                                                      |
| Nama lokal                       | Daun Kari                                                                                                                                                                                                                                                        |
| Nama latin                       | Murraya koenigii (L.) Spreng.                                                                                                                                                                                                                                    |
| Deskripsi                        | Daun kari adalah daun aromatik yang sering dipakai sebagai bumbu masakan. Selain memberi aroma khas, daun ini juga digunakan dalam tradisi herbal untuk mendukung pencernaan.                                                                                    |
| Senyawa aktif utama              | carbazole alkaloids, mahanimbine, flavonoid, terpenoid, vitamin/mineral                                                                                                                                                                                          |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Hati-hati dengan obat diabetes bila menggunakan ekstrak, gunakan daun bersih sebagai bumbu/pangan.                                                                                                                                                               |
| Kondisi refs                     | `dispepsia-kembung`; `diabetes-gula-darah-tinggi`                                                                                                                                                                                                                |

#### Kontraindikasi

| Field                       | Isi                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                                 |
| Kondisi/kelompok raw        | Diabetes dengan obat, pasien sebelum operasi, ibu hamil/menyusui bila ekstrak tinggi, alergi.                                 |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `pasien-sebelum-operasi`; `diabetes-obat-antidiabetes`; `alergi`                                 |
| Bagian/cara pakai pantangan | Daun/ekstrak pekat, biji tidak lazim untuk konsumsi obat.                                                                     |
| Alasan risiko               | Daun sebagai bumbu relatif aman, tetapi ekstrak dapat memengaruhi gula darah dan belum cukup data untuk kehamilan dosis obat. |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                 | Bagian yang digunakan | Cara pengolahan                                                      | Cara pakai tradisional                      | Catatan keamanan                                        |
| -------- | --------------------------------------------- | ---------------------------- | --------------------- | -------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------- |
| OLH05701 | Dispepsia/kembung                             | `dispepsia-kembung`          | Daun                  | Daun dicuci dan digunakan sebagai bumbu masakan atau diseduh ringan. | Dikonsumsi dalam makanan/minuman hangat.    | Hindari ekstrak pekat bila hamil/menyusui tanpa arahan. |
| OLH05703 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi` | Daun sebagai pangan   | Gunakan daun dalam masakan tanpa gula/lemak berlebihan.              | Dikonsumsi sebagai bagian pola makan sehat. | Pantau gula darah bila memakai obat diabetes.           |

### TAN058 — Merica

| Field                            | Isi                                                                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `merica`                                                                                                                                                                                                            |
| Nama lokal                       | Merica                                                                                                                                                                                                              |
| Nama latin                       | Piper nigrum L.                                                                                                                                                                                                     |
| Deskripsi                        | Merica adalah buah lada hitam atau putih yang memberi rasa pedas hangat pada makanan. Karena sifatnya kuat, merica lebih aman digunakan sebagai bumbu dalam jumlah wajar.                                           |
| Senyawa aktif utama              | piperine, chavicine, minyak atsiri, limonene, pinene                                                                                                                                                                |
| Manfaat/khasiat tradisional      | Membantu perut terasa lebih nyaman saat dispepsia/kembung serta membantu keluhan Nyeri Otot/Pegal. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Dosis tinggi dapat mengiritasi lambung/GERD dan memengaruhi metabolisme obat, hati-hati dengan obat rutin.                                                                                                          |
| Kondisi refs                     | `dispepsia-kembung`; `nyeri-otot-pegal`                                                                                                                                                                             |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Rendah–Sedang                                                                                                                                          |
| Kondisi/kelompok raw        | GERD/maag, tukak lambung, pengguna banyak obat karena piperine dapat memengaruhi penyerapan/metabolisme, pengguna pengencer darah bila ekstrak tinggi. |
| Kelompok risiko refs        | `pengguna-pengencer-darah`; `gerd-maag-gastritis-tukak`; `pengguna-obat-rutin-tertentu`                                                                |
| Bagian/cara pakai pantangan | Biji/ekstrak piperine dosis tinggi, bukan bumbu kecil.                                                                                                 |
| Alasan risiko               | Piperine dapat meningkatkan bioavailabilitas beberapa obat/senyawa, merica juga dapat mengiritasi lambung pada penderita maag/GERD.                    |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan            | Cara pengolahan                                                                                 | Cara pakai tradisional                                             | Catatan keamanan                                            |
| -------- | ----------------- | ------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| OLH05801 | Dispepsia/kembung | `dispepsia-kembung` | Biji sebagai bumbu               | Gunakan sedikit merica dalam makanan hangat, jangan dibuat ekstrak pekat.                       | Dikonsumsi sebagai bumbu makanan.                                  | Hindari pada GERD/maag karena dapat memperparah rasa panas. |
| OLH05803 | Nyeri otot/pegal  | `nyeri-otot-pegal`  | Biji untuk luar dengan hati-hati | Tidak dianjurkan balur merica pekat karena dapat mengiritasi kulit. Pilih kompres hangat biasa. | Bila digunakan tradisional, harus sangat encer dan uji area kecil. | Hentikan bila panas/perih, jangan pada luka.                |

### TAN059 — Mulberry

| Field                            | Isi                                                                                                                                                                                                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `mulberry`                                                                                                                                                                                                                                                            |
| Nama lokal                       | Mulberry                                                                                                                                                                                                                                                              |
| Nama latin                       | Morus alba L. / Morus spp.                                                                                                                                                                                                                                            |
| Deskripsi                        | Mulberry atau murbei adalah tanaman buah yang buahnya dapat dimakan dan daunnya juga digunakan sebagai herbal. Buahnya kaya serat dan antioksidan.                                                                                                                    |
| Senyawa aktif utama              | 1-deoxynojirimycin (DNJ), anthocyanin, resveratrol, flavonoid, serat                                                                                                                                                                                                  |
| Manfaat/khasiat tradisional      | Mendukung pengelolaan gula darah sebagai pendamping pola makan dan obat dokter serta mendukung pengelolaan kolesterol sebagai pendamping pola makan. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Pantau gula darah bila memakai obat diabetes, buah kering/manisan tinggi gula.                                                                                                                                                                                        |
| Kondisi refs                     | `diabetes-gula-darah-tinggi`; `kolesterol-tinggi-dislipidemia`                                                                                                                                                                                                        |

#### Kontraindikasi

| Field                       | Isi                                                                                                                  |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Tingkat risiko              | Rendah–Sedang                                                                                                        |
| Kondisi/kelompok raw        | Diabetes dengan obat, ibu hamil/menyusui bila ekstrak tinggi, gangguan pencernaan.                                   |
| Kelompok risiko refs        | `ibu-hamil`; `ibu-menyusui`; `diabetes-obat-antidiabetes`                                                            |
| Bagian/cara pakai pantangan | Daun/ekstrak teh pekat, konsumsi berlebihan.                                                                         |
| Alasan risiko               | Daun mulberry dapat memengaruhi metabolisme karbohidrat/gula darah, buah sebagai pangan umumnya lebih rendah risiko. |

#### Cara Pengolahan

| Kode     | Judul                                         | Kondisi refs                     | Bagian yang digunakan                        | Cara pengolahan                                                                               | Cara pakai tradisional                       | Catatan keamanan                      |
| -------- | --------------------------------------------- | -------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------- |
| OLH05901 | Diabetes/gula darah tinggi sebagai pendamping | `diabetes-gula-darah-tinggi`     | Daun sebagai teh ringan, buah sebagai pangan | Daun dicuci dan diseduh ringan sebagai teh. Buah matang dimakan langsung tanpa gula tambahan. | Dikonsumsi wajar sambil memantau gula darah. | Hati-hati bila memakai obat diabetes. |
| OLH05902 | Kolesterol tinggi sebagai pendamping          | `kolesterol-tinggi-dislipidemia` | Daun/buah                                    | Daun diseduh ringan atau buah dikonsumsi sebagai bagian pola makan tinggi serat.              | Dikonsumsi dalam pola makan seimbang.        | Tetap perlu pemeriksaan lipid.        |

### TAN060 — Daun Mint

| Field                            | Isi                                                                                                                                                                                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Slug                             | `daun-mint`                                                                                                                                                                                                                      |
| Nama lokal                       | Daun Mint                                                                                                                                                                                                                        |
| Nama latin                       | Mentha spicata L. / Mentha × piperita L. (tergantung jenis)                                                                                                                                                                      |
| Deskripsi                        | Daun mint adalah herba aromatik dengan rasa segar yang sering dipakai dalam teh, minuman, dan penyegar napas. Aromanya ringan dan banyak disukai.                                                                                |
| Senyawa aktif utama              | menthol, menthone, carvone (spearmint), rosmarinic acid, flavonoid                                                                                                                                                               |
| Manfaat/khasiat tradisional      | Meredakan mual, membantu perut terasa lebih nyaman saat dispepsia/kembung, serta membantu mengurangi bau mulut. Relasi dibuat lebih konservatif agar tidak berlebihan dan tetap sebagai pendamping, bukan pengganti obat dokter. |
| Perhatian/kontraindikasi ringkas | Dapat memperburuk GERD pada sebagian orang, minyak peppermint tidak untuk bayi/anak kecil dan jangan dioles dekat hidung bayi.                                                                                                   |
| Kondisi refs                     | `mual`; `dispepsia-kembung`; `bau-mulut`                                                                                                                                                                                         |

#### Kontraindikasi

| Field                       | Isi                                                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Tingkat risiko              | Rendah–Sedang                                                                                                                        |
| Kondisi/kelompok raw        | GERD/refluks, batu empedu, bayi/anak kecil terutama minyak mentol, ibu hamil bila minyak atsiri/ekstrak tinggi.                      |
| Kelompok risiko refs        | `ibu-hamil`; `bayi-anak-kecil`; `gerd-maag-gastritis-tukak`; `batu-empedu-sumbatan-empedu`                                           |
| Bagian/cara pakai pantangan | Minyak peppermint/mint diminum/dioles dekat wajah bayi, teh/ekstrak pekat pada GERD.                                                 |
| Alasan risiko               | Mint dapat merelaksasi sfingter esofagus dan memperburuk refluks, minyak mentol pekat berisiko pada bayi/anak dan dapat mengiritasi. |

#### Cara Pengolahan

| Kode     | Judul             | Kondisi refs        | Bagian yang digunakan | Cara pengolahan                                                                   | Cara pakai tradisional                                      | Catatan keamanan                                                          |
| -------- | ----------------- | ------------------- | --------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| OLH06001 | Mual              | `mual`              | Daun                  | Daun dicuci, diseduh dengan air panas sebagai teh mint ringan.                    | Diminum hangat sedikit-sedikit.                             | Hati-hati GERD karena mint dapat memperburuk refluks pada sebagian orang. |
| OLH06002 | Dispepsia/kembung | `dispepsia-kembung` | Daun                  | Seduh daun sebagai teh ringan.                                                    | Diminum setelah makan bila cocok.                           | Hentikan bila heartburn bertambah.                                        |
| OLH06004 | Bau mulut         | `bau-mulut`         | Daun                  | Daun diseduh lalu didinginkan untuk kumur, atau dikunyah sebentar setelah dicuci. | Berkumur atau kunyah sebentar lalu buang bila tidak nyaman. | Jaga kebersihan gigi/mulut, bau mulut menetap perlu evaluasi.             |
