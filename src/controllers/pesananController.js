const Pesanan = require('../models/Pesanan');
const Menu = require('../models/Menu');

// Aturan: dari status ini, boleh pindah ke status mana saja
const alurStatus = {
  Menunggu: ['Dimasak', 'Dibatalkan'],
  Dimasak: ['Siap Diambil'],
  'Siap Diambil': ['Selesai'],
  Selesai: [],
  Dibatalkan: [],
};

// CREATE: buat pesanan
exports.createPesanan = async (req, res) => {
  try {
    const { namaPemesan, items, jamAmbil } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items tidak boleh kosong' });
    }

    let totalHarga = 0;
    const itemsLengkap = [];

    for (const item of items) {
      const menu = await Menu.findById(item.menu);
      if (!menu) {
        return res.status(404).json({ message: 'Menu tidak ditemukan: ' + item.menu });
      }
      if (!menu.tersedia) {
        return res.status(400).json({ message: menu.nama + ' sedang tidak tersedia' });
      }
      const jumlah = Number(item.jumlah) || 1;
      totalHarga += menu.harga * jumlah;
      itemsLengkap.push({ menu: menu._id, nama: menu.nama, harga: menu.harga, jumlah });
    }

    const pesanan = await Pesanan.create({
      namaPemesan,
      items: itemsLengkap,
      totalHarga,
      jamAmbil,
    });
    res.status(201).json(pesanan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ: semua pesanan (bisa difilter, contoh ?status=Dimasak)
exports.getAllPesanan = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const pesanan = await Pesanan.find(filter).sort({ createdAt: -1 });
    res.json(pesanan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: satu pesanan
exports.getPesananById = async (req, res) => {
  try {
    const pesanan = await Pesanan.findById(req.params.id);
    if (!pesanan) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    res.json(pesanan);
  } catch (error) {
    res.status(400).json({ message: 'ID tidak valid' });
  }
};

// UPDATE: ubah status, atau edit item (hanya saat Menunggu)
exports.updatePesanan = async (req, res) => {
  try {
    const pesanan = await Pesanan.findById(req.params.id);
    if (!pesanan) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

    const { status, items, jamAmbil } = req.body;

    if (items || jamAmbil) {
      if (pesanan.status !== 'Menunggu') {
        return res.status(400).json({ message: 'Pesanan sudah diproses, tidak bisa diedit' });
      }
      if (jamAmbil) pesanan.jamAmbil = jamAmbil;
      if (items) {
        let totalHarga = 0;
        const itemsLengkap = [];
        for (const item of items) {
          const menu = await Menu.findById(item.menu);
          if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
          const jumlah = Number(item.jumlah) || 1;
          totalHarga += menu.harga * jumlah;
          itemsLengkap.push({ menu: menu._id, nama: menu.nama, harga: menu.harga, jumlah });
        }
        pesanan.items = itemsLengkap;
        pesanan.totalHarga = totalHarga;
      }
    }

    if (status) {
      if (!alurStatus[pesanan.status].includes(status)) {
        return res.status(400).json({
          message: 'Status tidak bisa diubah dari ' + pesanan.status + ' ke ' + status,
        });
      }
      pesanan.status = status;
    }

    await pesanan.save();
    res.json(pesanan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: batalkan, hanya jika masih Menunggu
exports.deletePesanan = async (req, res) => {
  try {
    const pesanan = await Pesanan.findById(req.params.id);
    if (!pesanan) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    if (pesanan.status !== 'Menunggu') {
      return res.status(400).json({ message: 'Pesanan sudah diproses, tidak bisa dibatalkan' });
    }
    await pesanan.deleteOne();
    res.json({ message: 'Pesanan berhasil dibatalkan' });
  } catch (error) {
    res.status(400).json({ message: 'ID tidak valid' });
  }
};
