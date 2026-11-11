const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema(
    {
        nama: { type: String, required: true, trim: true },
        harga: { type: Number, required: true, min: 0 },
        tenant: {type: String, required: true, trim: true},
        kategori: { type: String, enum: ['Makanan', 'Minuman', 'Snack'], default: 'Makanan' },
        tersedia: { type: Boolean, default: true},
    },
    { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);