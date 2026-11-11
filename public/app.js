let semuaMenu = [];
let keranjang = [];
let tenantAktif = 'Semua';

const IKON = {
  Makanan:
    '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#c2410c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z"/><path d="M8 8c0-1.5 1-1.5 1-3M12 8c0-1.5 1-1.5 1-3M16 8c0-1.5 1-1.5 1-3"/></svg>',
  Minuman: '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#0b5c8f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6h12l-1.5 14h-9Z"/><path d="M9 3h6M7 11h10"/></svg>',
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

function ambilIdSaya() {
  try {
    return JSON.parse(localStorage.getItem('pesananSaya')) || [];
  } catch (e) {
    return [];
  }
}
function simpanIdSaya(id) {
  const daftar = ambilIdSaya();
  daftar.push(id);
  localStorage.setItem('pesananSaya', JSON.stringify(daftar));
}

function jumlahDiKeranjang(id) {
  const i = keranjang.find(function (x) {
    return x.id === id;
  });
  return i ? i.jumlah : 0;
}

function perbaruiBar() {
  let n = 0;
  let t = 0;
  keranjang.forEach(function (i) {
    n += i.jumlah;
    t += i.harga * i.jumlah;
  });
  document.getElementById('bar-bawah').hidden = n === 0;
  document.getElementById('bar-info').textContent = n + ' item \u00b7 ' + rupiah(t);
}

/* ========== MENU ========== */
async function muatMenu() {
  const wadah = document.getElementById('daftar-menu');
  try {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error('Server menjawab ' + res.status);
    semuaMenu = await res.json();
    tampilkanTabs();
    tampilkanMenu();
  } catch (error) {
    wadah.textContent = 'Gagal memuat menu: ' + error.message;
  }
}

function tampilkanTabs() {
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = '';
  const nama = ['Semua'];
  semuaMenu.forEach(function (m) {
    if (nama.indexOf(m.tenant) === -1) nama.push(m.tenant);
  });
  nama.forEach(function (n) {
    const b = el('button', 'tab' + (n === tenantAktif ? ' aktif' : ''), n);
    b.addEventListener('click', function () {
      tenantAktif = n;
      tampilkanTabs();
      tampilkanMenu();
    });
    tabs.appendChild(b);
  });
}

// Tombol Tambah berubah jadi - 1 + setelah menu dipilih
function tombolAksi(m) {
  if (jumlahDiKeranjang(m._id) === 0) {
    const btn = el('button', 'btn-tambah', 'Tambah');
    btn.addEventListener('click', function () {
      tambahKeKeranjang(m);
    });
    return btn;
  }
  const aksi = el('div', 'jumlah');
  const kurang = el('button', 'kurang', '-');
  kurang.setAttribute('aria-label', 'Kurangi ' + m.nama);
  kurang.addEventListener('click', function () {
    ubahJumlah(m._id, -1);
  });
  const tambah = el('button', '', '+');
  tambah.setAttribute('aria-label', 'Tambah ' + m.nama);
  tambah.addEventListener('click', function () {
    ubahJumlah(m._id, 1);
  });
  aksi.appendChild(kurang);
  aksi.appendChild(el('strong', '', String(jumlahDiKeranjang(m._id))));
  aksi.appendChild(tambah);
  return aksi;
}

function tampilkanMenu() {
  const wadah = document.getElementById('daftar-menu');
  wadah.innerHTML = '';
  const tersedia = semuaMenu.filter(function (m) {
    return m.tersedia && (tenantAktif === 'Semua' || m.tenant === tenantAktif);
  });
  if (tersedia.length === 0) {
    wadah.textContent = 'Belum ada menu.';
    return;
  }

  const perTenant = {};
  tersedia.forEach(function (m) {
    if (!perTenant[m.tenant]) perTenant[m.tenant] = [];
    perTenant[m.tenant].push(m);
  });

  Object.keys(perTenant).forEach(function (namaTenant) {
    const bagian = el('div', 'tenant');
    bagian.appendChild(el('h2', '', namaTenant));
    const grid = el('div', 'grid');
    perTenant[namaTenant].forEach(function (m) {
      const kartu = el('div', 'kartu');

      const ikon = el('div', 'ikon' + (m.kategori === 'Minuman' ? ' minuman' : ''));
      ikon.innerHTML = IKON[m.kategori] || IKON.Makanan;
      kartu.appendChild(ikon);

      const info = el('div', 'info');
      info.appendChild(el('h3', '', m.nama));
      info.appendChild(el('div', 'kategori', m.kategori));
      info.appendChild(el('div', 'harga', rupiah(m.harga)));
      kartu.appendChild(info);

      kartu.appendChild(tombolAksi(m));
      grid.appendChild(kartu);
    });
    bagian.appendChild(grid);
    wadah.appendChild(bagian);
  });
}

/* ========== KERANJANG ========== */
function tambahKeKeranjang(m) {
  const ada = keranjang.find(function (i) {
    return i.id === m._id;
  });
  if (ada) ada.jumlah++;
  else keranjang.push({ id: m._id, nama: m.nama, tenant: m.tenant, harga: m.harga, jumlah: 1 });
  tampilkanKeranjang();
}

function ubahJumlah(id, perubahan) {
  const item = keranjang.find(function (i) {
    return i.id === id;
  });
  if (!item) return;
  item.jumlah += perubahan;
  if (item.jumlah <= 0) {
    keranjang = keranjang.filter(function (i) {
      return i.id !== id;
    });
  }
  tampilkanKeranjang();
}

function tampilkanKeranjang() {
  perbaruiBar();
  if (semuaMenu.length) tampilkanMenu();

  const wadah = document.getElementById('isi-keranjang');
  const totalEl = document.getElementById('total');
  wadah.innerHTML = '';

  if (keranjang.length === 0) {
    wadah.textContent = 'Keranjang masih kosong.';
    totalEl.textContent = 'Rp0';
    return;
  }

  let total = 0;
  keranjang.forEach(function (i) {
    total += i.harga * i.jumlah;
    const baris = el('div', 'item-keranjang');

    const info = el('div', 'info');
    info.appendChild(el('strong', '', i.nama));
    info.appendChild(el('small', '', i.tenant + ' - ' + rupiah(i.harga)));
    baris.appendChild(info);

    const aksi = el('div', 'jumlah');
    const kurang = el('button', 'kurang', '-');
    kurang.setAttribute('aria-label', 'Kurangi ' + i.nama);
    kurang.addEventListener('click', function () {
      ubahJumlah(i.id, -1);
    });
    const tambah = el('button', '', '+');
    tambah.setAttribute('aria-label', 'Tambah ' + i.nama);
    tambah.addEventListener('click', function () {
      ubahJumlah(i.id, 1);
    });
    aksi.appendChild(kurang);
    aksi.appendChild(el('strong', '', String(i.jumlah)));
    aksi.appendChild(tambah);
    baris.appendChild(aksi);

    wadah.appendChild(baris);
  });
  totalEl.textContent = rupiah(total);
}

/* ========== KIRIM PESANAN ========== */
async function kirimPesanan() {
  const info = document.getElementById('pesan-info');
  const nama = document.getElementById('nama-pemesan').value.trim();
  const jam = document.getElementById('jam-ambil').value;

  function pesan(kelas, teks) {
    info.className = kelas;
    info.textContent = teks;
  }

  if (keranjang.length === 0) return pesan('gagal', 'Keranjang masih kosong.');
  if (!nama) return pesan('gagal', 'Nama pemesan wajib diisi.');
  if (!jam) return pesan('gagal', 'Pilih jam ambil.');

  const data = {
    namaPemesan: nama,
    jamAmbil: jam,
    items: keranjang.map(function (i) {
      return { menu: i.id, jumlah: i.jumlah };
    }),
  };

  try {
    const res = await fetch('/api/pesanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const hasil = await res.json();
    if (!res.ok) throw new Error(hasil.message);

    simpanIdSaya(hasil._id);
    pesan('sukses', 'Pesanan berhasil! Total ' + rupiah(hasil.totalHarga) + '.');
    keranjang = [];
    tampilkanKeranjang();
    muatRiwayat();
  } catch (error) {
    pesan('gagal', 'Gagal: ' + error.message);
  }
}

/* ========== RIWAYAT PESANAN ========== */
async function muatRiwayat() {
  const wadah = document.getElementById('riwayat');
  const idSaya = ambilIdSaya();
  if (idSaya.length === 0) {
    wadah.textContent = 'Belum ada pesanan.';
    return;
  }
  try {
    const res = await fetch('/api/pesanan');
    const semua = await res.json();
    const milikku = semua.filter(function (p) {
      return idSaya.indexOf(p._id) !== -1;
    });
    wadah.innerHTML = '';
    if (milikku.length === 0) {
      wadah.textContent = 'Belum ada pesanan.';
      return;
    }
    milikku.forEach(function (p) {
      wadah.appendChild(kartuPesanan(p));
    });
  } catch (error) {
    wadah.textContent = 'Gagal memuat pesanan.';
  }
}

function kartuPesanan(p) {
  const kotak = el('div', 'pesanan');
  const atas = el('div', 'pesanan-atas');
  atas.appendChild(el('strong', '', 'Ambil jam ' + (p.jamAmbil || '-')));
  atas.appendChild(el('span', 'badge ' + p.status.replace(' ', '-'), p.status));
  kotak.appendChild(atas);

  const daftar = p.items
    .map(function (i) {
      return i.nama + ' x' + i.jumlah;
    })
    .join(', ');
  kotak.appendChild(el('p', '', daftar));
  kotak.appendChild(el('p', '', 'Total ' + rupiah(p.totalHarga)));

  if (p.status === 'Menunggu') {
    const btn = el('button', 'btn garis', 'Batalkan pesanan');
    btn.addEventListener('click', async function () {
      if (!confirm('Batalkan pesanan ini?')) return;
      const res = await fetch('/api/pesanan/' + p._id, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
      }
      muatRiwayat();
    });
    kotak.appendChild(btn);
  }
  return kotak;
}

document.getElementById('btn-pesan').addEventListener('click', kirimPesanan);

muatMenu();
muatRiwayat();
setInterval(muatRiwayat, 10000);
