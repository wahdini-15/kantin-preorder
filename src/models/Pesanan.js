const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
        nama: String,
        harga: Number,
        jumlah: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const pesananSchema = new mongoose.Schema(
    {
        namaPemesan: { type: String, required: true, trim: true },
        items: { type: [itemSchema], required: true },
        totalHarga: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['Menunggu', 'Dimasak', 'Siap Diambil', 'Selesai', 'Dibatalkan'],
            default: 'Menunggu',
        },
        jamAmbil: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Pesanan', pesananSchema);