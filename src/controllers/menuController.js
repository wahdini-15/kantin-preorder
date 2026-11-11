const Menu = require('../models/Menu');

// CREATE: tambah menu baru
exports.createMenu = async (req, res) => {
  try {
    const menu = await Menu.create(req.body);
    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// READ: lihat semua menu
exports.getAllMenu = async (req, res) => {
  try {
    const menu = await Menu.find().sort({ createdAt: -1 });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: lihat satu menu
exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
    res.json(menu);
  } catch (error) {
    res.status(400).json({ message: 'ID tidak valid' });
  }
};

// UPDATE: ubah menu
exports.updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
    res.json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: hapus menu
exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
    res.json({ message: 'Menu berhasil dihapus' });
  } catch (error) {
    res.status(400).json({ message: 'ID tidak valid' });
  }
};
