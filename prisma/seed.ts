import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. Data Master Gejala
  const gejalaData = [
    { nama: 'Hidung tersumbat' },
    { nama: 'Hidung berair atau meler' },
    { nama: 'Bersin-bersin' },
    { nama: 'Sakit tenggorokan saat menelan' },
    { nama: 'Batuk berdahak' },
    { nama: 'Batuk kering' },
    { nama: 'Sakit kepala bagian tengkuk' },
    { nama: 'Dada terasa berdebar' },
    { nama: 'Mudah lelah dan lemas' },
    { nama: 'Sering merasa haus (Polidipsia)' },
    { nama: 'Sering buang air kecil (Poliuria)' },
    { nama: 'Mudah lapar (Polifagia)' },
    { nama: 'Penurunan berat badan tanpa sebab' },
    { nama: 'Nyeri sendi yang hebat' },
    { nama: 'Sendi bengkak dan kemerahan' },
    { nama: 'Sendi terasa panas' },
    { nama: 'Pegal pada area tengkuk dan pundak' },
    { nama: 'Sering kesemutan' },
    { nama: 'Nyeri saat buang air kecil (Anyang-anyangan)' },
    { nama: 'Nyeri ulu hati' },
    { nama: 'Perut kembung dan begah' },
    { nama: 'Mual dan muntah' },
    { nama: 'Kulit melepuh atau ruam merah' },
    { nama: 'Demam tinggi' },
    { nama: 'Tenggorokan terasa kering' },
    { nama: 'Suara serak' },
    { nama: 'Bau badan tidak sedap' },
    { nama: 'Keputihan abnormal' },
    { nama: 'Mimisan (hidung berdarah)' }
  ];

  const createdGejala: Record<string, any> = {};
  for (const g of gejalaData) {
    let res = await prisma.gejala.findFirst({ where: { nama: g.nama } });
    if (!res) {
      res = await prisma.gejala.create({ data: g });
    }
    createdGejala[res.nama] = res;
  }

  // 3. Data Master Penyakit dan Relasi Gejalanya
  const penyakitData = [
    {
      nama: 'Batuk dan Flu',
      deskripsi: 'Infeksi saluran pernapasan atas akut yang disebabkan oleh virus.',
      gejalaTerkait: ['Hidung tersumbat', 'Hidung berair atau meler', 'Bersin-bersin', 'Sakit tenggorokan saat menelan', 'Batuk berdahak', 'Batuk kering']
    },
    {
      nama: 'Hipertensi (Tekanan Darah Tinggi)',
      deskripsi: 'Kondisi di mana tekanan darah di dinding arteri terlalu tinggi.',
      gejalaTerkait: ['Sakit kepala bagian tengkuk', 'Dada terasa berdebar', 'Mudah lelah dan lemas']
    },
    {
      nama: 'Diabetes Melitus',
      deskripsi: 'Penyakit kronis yang ditandai dengan tingginya kadar gula darah.',
      gejalaTerkait: ['Sering merasa haus (Polidipsia)', 'Sering buang air kecil (Poliuria)', 'Mudah lapar (Polifagia)', 'Penurunan berat badan tanpa sebab', 'Mudah lelah dan lemas']
    },
    {
      nama: 'Asam Urat (Gout)',
      deskripsi: 'Bentuk radang sendi yang menyebabkan kemerahan, bengkak, dan rasa sakit yang tiba-tiba pada sendi.',
      gejalaTerkait: ['Nyeri sendi yang hebat', 'Sendi bengkak dan kemerahan', 'Sendi terasa panas']
    },
    {
      nama: 'Kolesterol Tinggi',
      deskripsi: 'Kadar kolesterol di dalam darah melampaui batas normal, berisiko memicu penyakit jantung.',
      gejalaTerkait: ['Pegal pada area tengkuk dan pundak', 'Sering kesemutan']
    },
    {
      nama: 'Infeksi Saluran Kemih (ISK)',
      deskripsi: 'Infeksi pada bagian mana pun dari sistem saluran kemih, bisa di ginjal, ureter, kandung kemih, atau uretra.',
      gejalaTerkait: ['Nyeri saat buang air kecil (Anyang-anyangan)']
    },
    {
      nama: 'Gangguan Pencernaan / Maag',
      deskripsi: 'Kondisi rusaknya lapisan mukosa lambung akibat asam lambung berlebih atau infeksi bakteri.',
      gejalaTerkait: ['Nyeri ulu hati', 'Perut kembung dan begah', 'Mual dan muntah']
    },
    {
      nama: 'Radang Tenggorokan',
      deskripsi: 'Peradangan pada tenggorokan (faring) yang umumnya disebabkan oleh infeksi virus atau bakteri.',
      gejalaTerkait: ['Sakit tenggorokan saat menelan', 'Tenggorokan terasa kering', 'Suara serak', 'Demam tinggi']
    },
    {
      nama: 'Luka Luar dan Luka Bakar Ringan',
      deskripsi: 'Cedera pada jaringan yang disebabkan oleh panas, bahan kimia, atau gesekan pada epidermis luar.',
      gejalaTerkait: ['Kulit melepuh atau ruam merah']
    },
    {
      nama: 'Masalah pencernaan (kembung, mual, iritasi usus)',
      deskripsi: 'Sensasi kembung, mual, atau iritasi pada usus.',
      gejalaTerkait: ['Perut kembung dan begah', 'Mual dan muntah']
    },
    {
      nama: 'Sakit kepala',
      deskripsi: 'Rasa sakit atau ketidaknyamanan di kepala atau wajah.',
      gejalaTerkait: ['Sakit kepala bagian tengkuk']
    },
    {
      nama: 'Batuk pilek',
      deskripsi: 'Infeksi virus ringan pada saluran pernapasan hidung dan tenggorokan.',
      gejalaTerkait: ['Hidung tersumbat', 'Hidung berair atau meler', 'Bersin-bersin', 'Batuk berdahak']
    },
    {
      nama: 'Gangguan pernapasan ringan',
      deskripsi: 'Kesulitan bernapas ringan atau sesak sesaat.',
      gejalaTerkait: []
    },
    {
      nama: 'Stres ringan',
      deskripsi: 'Ketegangan mental sesaat akibat kecemasan berlebih.',
      gejalaTerkait: []
    },
    {
      nama: 'Infeksi saluran napas',
      deskripsi: 'Infeksi akibat virus atau bakteri pada jalan napas paru-paru.',
      gejalaTerkait: []
    },
    {
      nama: 'Gangguan kognitif',
      deskripsi: 'Gangguan fungsi berpikir, memori, atau konsentrasi ringan.',
      gejalaTerkait: []
    },
    {
      nama: 'Peradangan sendi',
      deskripsi: 'Penyakit peradangan yang mengenai tulang dan sendi.',
      gejalaTerkait: ['Sendi bengkak dan kemerahan', 'Nyeri sendi yang hebat']
    },
    {
      nama: 'Infeksi bakteri ringan',
      deskripsi: 'Infeksi spektrum kecil yang ditimbulkan oleh agen bakteriologis.',
      gejalaTerkait: []
    },
    {
      nama: 'Kelelahan',
      deskripsi: 'Keadaan lemas fisik kronis atau letih ekstrim berkelanjutan.',
      gejalaTerkait: ['Mudah lelah dan lemas']
    },
    {
      nama: 'Gangguan hati ringan',
      deskripsi: 'Pelemahan fungsi liver akibat racun atau inflamasi.',
      gejalaTerkait: []
    },
    {
      nama: 'Kanker payudara & kolon',
      deskripsi: 'Penyakit kanker pada area payudara dan usus besar.',
      gejalaTerkait: []
    },
    {
      nama: 'Hipertensi ringan',
      deskripsi: 'Peningkatan tekanan darah skala ringan.',
      gejalaTerkait: ['Sakit kepala bagian tengkuk']
    },
    {
      nama: 'Gangguan memori',
      deskripsi: 'Kondisi penurunan daya ingat dan fungsi otak.',
      gejalaTerkait: []
    },
    {
      nama: 'Kecemasan',
      deskripsi: 'Gangguan kecemasan berlebih yang mengganggu aktivitas.',
      gejalaTerkait: ['Dada terasa berdebar']
    },
    {
      nama: 'Radang',
      deskripsi: 'Reaksi inflamasi pada organ tubuh.',
      gejalaTerkait: ['Demam tinggi']
    },
    {
      nama: 'Stres oksidatif',
      deskripsi: 'Ketidakseimbangan radikal bebas dan antioksidan dalam tubuh.',
      gejalaTerkait: ['Mudah lelah dan lemas']
    },
    {
      nama: 'Stres',
      deskripsi: 'Ketegangan emosional atau fisik.',
      gejalaTerkait: []
    },
    {
      nama: 'Infeksi ringan',
      deskripsi: 'Infeksi tahap awal yang mudah diobati.',
      gejalaTerkait: ['Demam tinggi']
    },
    {
      nama: 'Batuk',
      deskripsi: 'Refleks alami untuk membersihkan saluran pernapasan.',
      gejalaTerkait: ['Batuk berdahak', 'Batuk kering']
    },
    {
      nama: 'Radikal bebas',
      deskripsi: 'Kerusakan sel akibat molekul radikal bebas berlebih.',
      gejalaTerkait: []
    },
    {
      nama: 'Kurang nafsu makan',
      deskripsi: 'Kondisi hilangnya rasa lapar atau selera makan.',
      gejalaTerkait: ['Penurunan berat badan tanpa sebab']
    },
    {
      nama: 'Flu',
      deskripsi: 'Penyakit menular pada saluran pernapasan oleh virus influenza.',
      gejalaTerkait: ['Hidung tersumbat', 'Hidung berair atau meler', 'Bersin-bersin', 'Demam tinggi']
    },
    {
      nama: 'Kanker',
      deskripsi: 'Pertumbuhan sel abnormal dalam tubuh.',
      gejalaTerkait: []
    },
    {
      nama: 'Peradangan',
      deskripsi: 'Inflamasi umum sebagai respon imun protektif.',
      gejalaTerkait: []
    },
    {
      nama: 'Penyakit hati',
      deskripsi: 'Segala gangguan yang menghambat fungsi liver.',
      gejalaTerkait: []
    },
    {
      nama: 'Luka bakar',
      deskripsi: 'Kerusakan jaringan kulit akibat benda panas terik ekstrim.',
      gejalaTerkait: ['Kulit melepuh atau ruam merah']
    },
    {
      nama: 'Radang kulit',
      deskripsi: 'Reaksi alergi atau infeksi yang menyebabkan merah pada kulit.',
      gejalaTerkait: ['Kulit melepuh atau ruam merah']
    },
    {
      nama: 'Sakit sendi',
      deskripsi: 'Rasa ngilu atau nyeri tajam pada area sendi.',
      gejalaTerkait: ['Nyeri sendi yang hebat']
    },
    {
      nama: 'Obesitas',
      deskripsi: 'Kondisi penumpukan lemak berlebih pada tubuh dan organ.',
      gejalaTerkait: []
    },
    {
      nama: 'Nyeri haid',
      deskripsi: 'Kram tajam pada area perut bawah wanita saat siklus bulanan.',
      gejalaTerkait: ['Nyeri ulu hati']
    },
    {
      nama: 'Nyeri sendi',
      deskripsi: 'Rasa tidak nyaman atau ngilu persendian (arthralgia).',
      gejalaTerkait: ['Nyeri sendi yang hebat']
    },
    {
      nama: 'Jerawat',
      deskripsi: 'Bintik merah pada wajah punggung akibat produksi minyak berlebih.',
      gejalaTerkait: []
    },
    {
      nama: 'Infeksi kulit',
      deskripsi: 'Tumbuhnya bakteri jamur jahat pada area luar kulit.',
      gejalaTerkait: ['Kulit melepuh atau ruam merah']
    },
    {
      nama: 'Infeksi',
      deskripsi: 'Kompilasi seragan agen asing ke inang.',
      gejalaTerkait: ['Demam tinggi']
    },
    {
      nama: 'Anemia ringan',
      deskripsi: 'Kekurangan sel darah merah di batas sangat minimal.',
      gejalaTerkait: ['Mudah lelah dan lemas']
    },
    {
      nama: 'Infeksi bakteri',
      deskripsi: 'Infeksi patogen yang sering terjadi di saluran dalam dan kulit.',
      gejalaTerkait: []
    },
    {
      nama: 'Infeksi bakteri/jamur',
      deskripsi: 'Serangan gabungan oleh spora mikroskopis.',
      gejalaTerkait: []
    }
  ];

  const createdPenyakit: Record<string, any> = {};
  for (const p of penyakitData) {
    let res = await prisma.penyakit.findFirst({ where: { nama: p.nama } });
    if (!res) {
      res = await prisma.penyakit.create({
        data: {
          nama: p.nama,
          deskripsi: p.deskripsi,
          gejala: {
            create: p.gejalaTerkait.map(gName => ({
              gejala: { connect: { id: createdGejala[gName].id } }
            }))
          }
        }
      });
    }
    createdPenyakit[res.nama] = res;
  }

  // 4. Data Master Tanaman dan Relasi Penyakitnya
  const tanamanData = [
    {
      namaLokal: 'Jahe',
      namaLatin: 'Zingiber officinale',
      deskripsi: 'Rimpang yang sangat populer sebagai rempah dan obat. Jahe memiliki rasa pedas dan memberikan sensasi hangat.',
      kandunganSenyawa: 'Gingerol, Shogaol, Zingerone, Minyak Atsiri',
      khasiatUtama: 'Meredakan mual, batuk, nyeri sendi, dan gangguan pernapasan ringan.',
      lokasiTanam: 'Blok A (Taman Rimpang)',
      gambarUrl: 'https://images.unsplash.com/photo-1615486171448-4fd1ebdd1c12?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Batuk dan Flu', 'Gangguan Pencernaan / Maag', 'Asam Urat (Gout)'],
      resep: [
        'Memar irisan rimpang jahe seukuran ibu jari.',
        'Rebus dengan 2 gelas air hingga tersisa 1 gelas.',
        'Saring dan minum selagi hangat. Bisa ditambahkan madu sedap rasa.'
      ]
    },
    {
      namaLokal: 'Kunyit',
      namaLatin: 'Curcuma longa',
      deskripsi: 'Rimpang berwarna kuning-oranye yang khas, sering digunakan untuk bumbu masakan dan obat luka lambung.',
      kandunganSenyawa: 'Kurkumin, Seskuiterpen, Bisdesmetoksikurkumin',
      khasiatUtama: 'Anti-inflamasi kuat, menyembuhkan maag, dan meredakan nyeri menstruasi.',
      lokasiTanam: 'Blok A (Taman Rimpang)',
      gambarUrl: 'https://images.unsplash.com/photo-1615560462719-7521c7d2e964?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Gangguan Pencernaan / Maag', 'Asam Urat (Gout)'],
      resep: [
        'Parut 2 ruas kunyit yang sudah dicuci bersih.',
        'Peras airnya dengan sedikit air matang.',
        'Minum sari kunyit tersebut 1-2 kali sehari untuk meredakan nyeri lambung.'
      ]
    },
    {
      namaLokal: 'Kumis Kucing',
      namaLatin: 'Orthosiphon aristatus',
      deskripsi: 'Tanaman berbunga putih menyerupai kumis kucing. Sangat terkenal sebagai luruh kencing (diuretik).',
      kandunganSenyawa: 'Ortosifonin, Sinensetin, Asam Rosmarinat, Flavonoid',
      khasiatUtama: 'Melancarkan buang air kecil, menghancurkan batu ginjal, dan menurunkan asam urat.',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80', // placeholder
      penyakitTerkait: ['Infeksi Saluran Kemih (ISK)', 'Asam Urat (Gout)', 'Hipertensi (Tekanan Darah Tinggi)'],
      resep: [
        'Ambil segenggam daun kumis kucing segar, cuci bersih.',
        'Rebus dengan 3 gelas air hingga mendidih dan tersisa separuhnya.',
        'Minum rebusan tersebut 2 kali sehari.'
      ]
    },
    {
      namaLokal: 'Sambiloto',
      namaLatin: 'Andrographis paniculata',
      deskripsi: 'Tanaman herba yang rasanya sangat pahit (Raja Pahit). Memiliki ragam khasiat sangat kuat untuk berbagai penyakit kronis.',
      kandunganSenyawa: 'Andrographolide, Flavonoid, Saponin, Tannin',
      khasiatUtama: 'Menurunkan gula darah, tekanan darah, dan sebagai imunomodulator kuat penurun demam.',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://cdn.pixabay.com/photo/2020/09/25/11/47/andrographis-paniculata-5601112_1280.jpg',
      penyakitTerkait: ['Diabetes Melitus', 'Hipertensi (Tekanan Darah Tinggi)', 'Radang Tenggorokan'],
      resep: [
        'Cuci 10-15 lembar daun sambiloto segar.',
        'Rebus dengan 3 gelas air hingga tersisa 1 gelas.',
        'Minum saat hangat. (Hati-hati, rasanya sangat pahit).'
      ]
    },
    {
      namaLokal: 'Lidah Buaya',
      namaLatin: 'Aloe barbadensis miller',
      deskripsi: 'Tanaman berduri lunak berpaging tebal berlendir jernih. Obat pertolongan pertama yang sangat baik di rumah.',
      kandunganSenyawa: 'Aloin, Enzim Bradykinase, Asam Salisilat alami, Lignin',
      khasiatUtama: 'Menyembuhkan luka bakar, meredakan radang tenggorokan, mendinginkan pencernaan.',
      lokasiTanam: 'Blok C (Area Sukulen)',
      gambarUrl: 'https://images.unsplash.com/photo-1596547609652-9fc5d8d428ce?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Luka Luar dan Luka Bakar Ringan', 'Radang Tenggorokan', 'Gangguan Pencernaan / Maag'],
      resep: [
        'Kupas kulit luar daun lidah buaya.',
        'Ambil gel beningnya, cuci hingga lendir kuning hilang.',
        'Untuk luka luar: oleskan langsung pada kulit.',
        'Untuk radang: potong dadu gel yang bersih, campur air hangat dan madu, lalu diminum.'
      ]
    },
    {
      namaLokal: 'Bawang Putih',
      namaLatin: 'Allium sativum',
      deskripsi: 'Bumbu dapur yang merupakan antibiotik alami bertenaga tinggi dan peluruh lemak pembuluh darah.',
      kandunganSenyawa: 'Allicin, Alliin, Dialil Disulfida',
      khasiatUtama: 'Menurunkan kolesterol, menurunkan tekanan darah tinggi, membunuh bakteri asing.',
      lokasiTanam: 'Blok D (Tanaman Dapur Hidup)',
      gambarUrl: 'https://images.unsplash.com/photo-1615486171448-4fd1ebdd1c12?auto=format&fit=crop&q=80', // Replace with garlic
      penyakitTerkait: ['Kolesterol Tinggi', 'Hipertensi (Tekanan Darah Tinggi)'],
      resep: [
        'Kupas 1-2 siung bawang putih tunggal atau bawang putih biasa.',
        'Memarkan sedikit dan biarkan udara terbuka selama 10 menit agar allicin aktif.',
        'Telan langsung atau seduh dengan air hangat campur madu untuk menekan kolesterol.'
      ]
    },
    {
      namaLokal: 'Daun Mint',
      namaLatin: 'Mentha piperita',
      deskripsi: 'Daun mint memiliki aroma segar mentol yang menenangkan saluran pernapasan dan pencernaan.',
      kandunganSenyawa: 'Menthol, Menthone, Menthyl acetate',
      khasiatUtama: 'Meredakan sakit kepala, batuk pilek, dan masalah pencernaan.',
      lokasiTanam: 'Blok A (Taman Rimpang)',
      gambarUrl: 'https://images.unsplash.com/photo-1628156173003-8d0092c8dc8f?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Masalah pencernaan (kembung, mual, iritasi usus)', 'Sakit kepala', 'Batuk pilek', 'Gangguan pernapasan ringan', 'Stres ringan'],
      resep: ['Seduh 5-7 lembar daun mint segar dengan secangkir air panas.']
    },
    {
      namaLokal: 'Mulberry / Murbei',
      namaLatin: 'Morus alba',
      deskripsi: 'Pohon murbei menghasilkan daun yang banyak digunakan dalam pengobatan tradisional untuk mengontrol gula darah.',
      kandunganSenyawa: 'DNJ (1-deoxynojirimycin), Flavonoid',
      khasiatUtama: 'Menurunkan gula darah (diabetes), kolesterol, dan mengatasi infeksi pernapasan.',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://images.unsplash.com/photo-1620619864227-8494c2599b9e?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Diabetes Melitus', 'Kolesterol Tinggi', 'Infeksi saluran napas', 'Gangguan kognitif'],
      resep: ['Rebus segenggam daun murbei kering, minum sebagai teh sehari sekali.']
    },
    {
      namaLokal: 'Rosemary',
      namaLatin: 'Salvia rosmarinus',
      deskripsi: 'Tanaman herbal aromatik berdaun jarum. Populer karena kemampuannya meningkatkan fungsi otak dan kekebalan.',
      kandunganSenyawa: 'Asam rosmarinat, Asam karnosat',
      khasiatUtama: 'Mengatasi peradangan sendi, infeksi bakteri, dan memulihkan kelelahan mental.',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Peradangan sendi', 'Infeksi bakteri ringan', 'Kelelahan', 'Gangguan hati ringan'],
      resep: ['Gunakan secukupnya aromanya dengan diseduh atau dihirup uapnya.']
    },
    {
      namaLokal: 'Daun Kari',
      namaLatin: 'Murraya koenigii',
      deskripsi: 'Daun dengan aroma tajam yang banyak digunakan untuk pengobatan tradisional perut.',
      kandunganSenyawa: 'Mahanimbine, Koenimbine',
      khasiatUtama: 'Menyehatkan pencernaan dan meredakan mual.',
      lokasiTanam: 'Blok D (Tanaman Dapur Hidup)',
      gambarUrl: 'https://images.unsplash.com/photo-1621245785097-f131aebb2dfd?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Gangguan Pencernaan / Maag'],
      resep: ['Rebus 5 lembar daun kari segar, lalu minum air sarinya.']
    },
    {
      namaLokal: 'Bawang Dayak',
      namaLatin: 'Eleutherine palmifolia',
      deskripsi: 'Bawang lokal dengan bonggol panjang merah menyala khas obat tradisional dayak.',
      kandunganSenyawa: 'Naphthoquinone (eleutherin, isoeleutherin), flavonoid, saponin, tanin, alkaloid',
      khasiatUtama: 'Antioksidan, antidiabetes, antikanker, antibakteri, antijamur, antiinflamasi',
      lokasiTanam: 'Blok A (Taman Rimpang)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Diabetes Melitus', 'Kanker payudara & kolon', 'Infeksi bakteri/jamur', 'Hipertensi ringan', 'Masalah pencernaan (kembung, mual, iritasi usus)'],
      resep: ['Rajang bawang dayak segar lalu seduh dengan air mendidih.']
    },
    {
      namaLokal: 'Bunga Piladang / Bunga Telang',
      namaLatin: 'Clitoria ternatea',
      deskripsi: 'Bunga rambat biru ungu cerah sering digunakan sebagai seduhan teh pewarna alami relaksan otak.',
      kandunganSenyawa: 'Anthocyanin (ternatin), flavonoid, alkaloid, saponin, tanin',
      khasiatUtama: 'Antioksidan kuat, neuroprotektif, antiinflamasi, meningkatkan memori',
      lokasiTanam: 'Blok C (Area Tanaman Rambat)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Gangguan memori', 'Kecemasan', 'Radang', 'Stres oksidatif'],
      resep: ['Sajikan 5 bunga telang sebagai teh herbal warna biru alami. Tambahkan perasan melon jeruk.']
    },
    {
      namaLokal: 'Tanaman Selasih',
      namaLatin: 'Ocimum basilicum',
      deskripsi: 'Biji selasih yang kembang direndaman air dan daun aromatik penghias es manis.',
      kandunganSenyawa: 'Eugenol, linalool, methyl chavicol, flavonoid, saponin',
      khasiatUtama: 'Antibakteri, antijamur, antiinflamasi, menenangkan, meningkatkan pencernaan',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Masalah pencernaan (kembung, mual, iritasi usus)', 'Stres', 'Infeksi ringan', 'Batuk'],
      resep: ['Siapkan satu sendok biji selasih kering di air hangat sebagai pendamping teh hangat mint.']
    },
    {
      namaLokal: 'Kenikir',
      namaLatin: 'Cosmos caudatus',
      deskripsi: 'Daun kenikir adalah jenis sayuran lalab kesukaan nusantara. Berbentuk memanjang dan rasanya lumayan enak khas.',
      kandunganSenyawa: 'Flavonoid (quercetin), tokoferol, fenolik, asam amino',
      khasiatUtama: 'Antioksidan kuat, menurunkan gula darah, meningkatkan nafsu makan',
      lokasiTanam: 'Blok D (Tanaman Dapur Hidup)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Diabetes Melitus', 'Radikal bebas', 'Kurang nafsu makan'],
      resep: ['Konsumsi seledri segar yang diseduh di lauk basah nasi.']
    },
    {
      namaLokal: 'Jeruk Kasturi',
      namaLatin: 'Citrus microcarpa',
      deskripsi: 'Spesies jeruk peras sangat kecil asam segar. Dikenal luar di kuliner dan anti infeksi peradangan gatal.',
      kandunganSenyawa: 'Vitamin C tinggi, limonene, citral, flavonoid',
      khasiatUtama: 'Antiviral, antibakteri, ekspektoran, antioksidan',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Batuk', 'Flu', 'Radang Tenggorokan', 'Gangguan Pencernaan / Maag'],
      resep: ['Peras dua butir jeruk kasturi ke dalam segelas air hangat dan madu.']
    },
    {
      namaLokal: 'Cimplukan',
      namaLatin: 'Physalis angulata',
      deskripsi: 'Gulma liar kaya manfaat dengan buah bertabung kulit lampion yang sangat bermanfaat dan bisa dikonsumsi di masa panen matang.',
      kandunganSenyawa: 'Withanolides, saponin, flavonoid, physalin',
      khasiatUtama: 'Antidiabetes, antihipertensi, antikanker, imunomodulator',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Diabetes Melitus', 'Hipertensi (Tekanan Darah Tinggi)', 'Kanker', 'Peradangan'],
      resep: ['Makan buah matang atau rebus daun cabut keseluruhan ciplukan sebagai air mandian obat luar memar.']
    },
    {
      namaLokal: 'Lengkuas Putih',
      namaLatin: 'Alpinia galanga var. White',
      deskripsi: 'Rimpang keras populer nusantara.',
      kandunganSenyawa: 'Galangin, eugenol, flavonoid, diarylheptanoids',
      khasiatUtama: 'Antimikroba, antiinflamasi, melancarkan pencernaan',
      lokasiTanam: 'Blok A (Taman Rimpang)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Infeksi bakteri', 'Nyeri sendi', 'Masalah pencernaan (kembung, mual, iritasi usus)'],
      resep: ['Tumbuk kecil lengkuas lalu rebus bersama jahe dan serai minum ketika pagi.']
    },
    {
      namaLokal: 'Sambung Nyawa',
      namaLatin: 'Gynura procumbens',
      deskripsi: 'Daun hijau lebar dikenal luas efektif untuk mengatasi penyakit kronis terkait tekanan darah dan gula tubuh hati.',
      kandunganSenyawa: 'Flavonoid, asam fenolat, saponin, tanin',
      khasiatUtama: 'Hipoglikemik, hepatoprotektif, antiinflamasi',
      lokasiTanam: 'Blok D (Tanaman Dapur Hidup)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Diabetes Melitus', 'Penyakit hati', 'Hipertensi (Tekanan Darah Tinggi)'],
      resep: ['Lalap 3 daun nyawa layu atau direbus air semalaman didinginkan']
    },
    {
      namaLokal: 'Jadam / Kaktus Centong / Opuntia',
      namaLatin: 'Opuntia cochenillifera',
      deskripsi: 'Kaktus berbentuk telinga dengan gel kaya nutrisi luka.',
      kandunganSenyawa: 'Saponin, mukilago, vitamin B & C, betalain',
      khasiatUtama: 'Menyembuhkan luka bakar, antiinflamasi, analgesik',
      lokasiTanam: 'Blok C (Area Sukulen)',
      gambarUrl: 'https://images.unsplash.com/photo-1596547609652-9fc5d8d428ce?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Luka bakar', 'Radang kulit', 'Sakit sendi'],
      resep: ['Buka lapisan kulitnya, lumatkan gel tipis di jaringan radang area luar atau kompres tempel.']
    },
    {
      namaLokal: 'Kemuning',
      namaLatin: 'Murraya paniculata',
      deskripsi: 'Tanaman populer perdu hias aroma bunga dan pembakar lemak di rahasia ayu tradisional tubuh putri keratin kraton nusantara.',
      kandunganSenyawa: 'Alkaloid murrayanine, coumarin, flavonoid, essential oil',
      khasiatUtama: 'Peluruh lemak, antiradang, analgesik',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Obesitas', 'Nyeri haid', 'Nyeri sendi'],
      resep: ['Daun kemuning segar diparut ditaruh dahi, jika rebus minum selagi pahitnya kuat hangat.']
    },
    {
      namaLokal: 'Belimbing Wuluh',
      namaLatin: 'Averrhoa bilimbi',
      deskripsi: 'Belimbing sangat lengket manis dan asam segar kaya antioksidan pendorong daya tahan dan penyembuhan jaringan kulit.',
      kandunganSenyawa: 'Asam oksalat, vitamin C, flavonoid, saponin',
      khasiatUtama: 'Antiseptik, antioksidan, antidiabetes, antihipertensi',
      lokasiTanam: 'Blok B (Taman Perdu Obat)',
      gambarUrl: 'https://images.unsplash.com/photo-1596708682121-50e561e13a96?auto=format&fit=crop&q=80',
      penyakitTerkait: ['Jerawat', 'Hipertensi (Tekanan Darah Tinggi)', 'Diabetes Melitus', 'Infeksi kulit'],
      resep: ['Tumbuk lumat peras air lalu rendam bilas pada rambut gatal atau seduh dengan garam madu dikit atasi flu tegang hipertensi.']
    }
  ];

  for (const t of tanamanData) {
    let resTanaman = await prisma.tanaman.findFirst({ where: { namaLokal: t.namaLokal } });
    
    if (!resTanaman) {
      resTanaman = await prisma.tanaman.create({
        data: {
          namaLokal: t.namaLokal,
          namaLatin: t.namaLatin,
          deskripsi: t.deskripsi,
          kandunganSenyawa: t.kandunganSenyawa,
          khasiatUtama: t.khasiatUtama,
          lokasiTanam: t.lokasiTanam,
          gambarUrl: t.gambarUrl,
          penyakitTerkait: {
            create: t.penyakitTerkait.map(pName => ({
              penyakit: { connect: { id: createdPenyakit[pName].id } }
            }))
          }
        }
      });

      // Seed Resep for this tanaman
      for (const langkah of t.resep) {
        await prisma.resep.create({
          data: {
            tanamanId: resTanaman.id,
            langkah: langkah,
          }
        });
      }
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
