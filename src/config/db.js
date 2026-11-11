
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database terhubung');
  } catch (error) {
    console.error('Gagal terhubung ke database:', error.message);
  }
};

module.exports = connectDB;
