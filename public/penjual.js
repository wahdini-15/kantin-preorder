let semuaMenu = [];
let semuaPesanan = [];
let kiosAktif = '';
let kunci = '';

try {
  kunci = sessionStorage.getItem('kunciPenjual') || '';
} catch (e) {
  kunci = '';
}

// status sekarang -> status berikutnya + tulisan tombol
const LANJUT = {
  Menunggu: { berikut: 'Dimasak', tombol: 'Mulai masak' },
  Dimasak: { berikut: 'Siap Diambil', tombol: 'Tandai siap diambil' },
  'Siap Diambil': { berikut: 'Selesai', tombol: 'Tandai selesai' },
};

const KOLOM = {
  Menunggu: 'kolom-menunggu',
  Dimasak: 'kolom-dimasak',
  'Siap Diambil': 'kolom-siap',
};

function rupiah(angka) {
  return 'Rp' + Number(angka).toLocaleString('id-ID');
}

function el(tag, kelas, teks) {
  const e = document.createElement(tag);
  if (kelas) e.className = kelas;
  if (teks !== undefined) e.textContent = teks;
  return e;
}

/* ========== LOGIN PENJUAL ========== */
async function masuk() {
  if (!kunci) kunci = prompt('Masukkan kunci penjual:') || '';
  try {
    const res = await fetch('/api/login-penjual', {
      method: 'POST',
      headers: { 'x-kunci-penjual': kunci },
    });
    if (!res.ok) throw new Error('salah');
    try {
      sessionStorage.setItem('kunciPenjual', kunci);
    } catch (e) {}
    return true;
  } catch (e) {
    try {
      sessionStorage.removeItem('kunciPenjual');
    } catch (err) {}
    kunci = '';
    document.querySelector('main').textContent = 'Kunci salah. Muat ulang halaman (F5) untuk mencoba lagi.';
    return false;
  }
}

/* ========== DATA ========== */
// Cari nama kios dari menu pertama di pesanan
function tenantPesanan(p) {
  if (!p.items || p.items.length === 0) return '';
  const idMenu = String(p.items[0].menu);
  const m = semuaMenu.find(function (x) {
    return x._id === idMenu;
  });
  return m ? m.tenant : '';
}

function isiPilihanKios() {
  const pilih = document.getElementById('pilih-kios');
  const nama = [];
  semuaMenu.forEach(function (m) {
    if (nama.indexOf(m.tenant) === -1) nama.push(m.tenant);
  });
  if (!kiosAktif && nama.length) kiosAktif = nama[0];

  pilih.innerHTML = '';
  nama.forEach(function (n) {
    const opsi = el('option', '', n);
    opsi.value = n;
    if (n === kiosAktif) opsi.selected = true;
    pilih.appendChild(opsi);
  });
}

async function ubahStatus(id, statusBaru) {
  try {
    const res = await fetch('/api/pesanan/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-kunci-penjual': kunci,
      },
      body: JSON.stringify({ status: statusBaru }),
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || 'Gagal mengubah status');
    }
  } catch (e) {
    alert('Gagal menghubungi server');
  }
  muatData();
}

function kartuOrder(p) {
  const kartu = el('div', 'kartu-order');

  const baris = el('div', 'baris');
  baris.appendChild(el('strong', '', p.namaPemesan));
  baris.appendChild(el('span', 'jam', p.jamAmbil || '-'));
  kartu.appendChild(baris);

  const daftar = p.items
    .map(function (i) {
      return i.nama + ' x' + i.jumlah;
    })
    .join(', ');
  kartu.appendChild(el('p', '', daftar));
  kartu.appendChild(el('p', '', 'Total ' + rupiah(p.totalHarga)));

  const aturan = LANJUT[p.status];
  if (aturan) {
    const btn = el('button', 'btn', aturan.tombol);
    btn.addEventListener('click', function () {
      ubahStatus(p._id, aturan.berikut);
    });
    kartu.appendChild(btn);
  }
  return kartu;
}

function tampilkanPapan() {
  Object.keys(KOLOM).forEach(function (status) {
    const wadah = document.getElementById(KOLOM[status]);
    wadah.innerHTML = '';

    const daftar = semuaPesanan
      .filter(function (p) {
        return p.status === status && tenantPesanan(p) === kiosAktif;
      })
      .sort(function (a, b) {
        return String(a.jamAmbil).localeCompare(String(b.jamAmbil));
      });

    if (daftar.length === 0) {
      wadah.appendChild(el('p', 'kosong', 'Tidak ada pesanan.'));
      return;
    }
    daftar.forEach(function (p) {
      wadah.appendChild(kartuOrder(p));
    });
  });
}

async function muatData() {
  try {
    const [resMenu, resPesanan] = await Promise.all([fetch('/api/menu'), fetch('/api/pesanan')]);
    semuaMenu = await resMenu.json();
    semuaPesanan = await resPesanan.json();
    isiPilihanKios();
    tampilkanPapan();
  } catch (e) {
    document.getElementById('kolom-menunggu').textContent = 'Gagal memuat data.';
  }
}

document.getElementById('pilih-kios').addEventListener('change', function (e) {
  kiosAktif = e.target.value;
  tampilkanPapan();
});

// Papan baru dimuat setelah kunci benar
masuk().then(function (berhasil) {
  if (!berhasil) return;
  muatData();
  setInterval(muatData, 10000);
});
