require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path')
const kunciPenjual = require('./src/middleware/kunciPenjual');
const connectDB = require('./src/config/db');
const menuRoutes = require('./src/routes/menuRoutes');
const pesananRoutes = require('./src/routes/pesananRoutes'); 

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/menu', menuRoutes);
// Rute khusus penjual (dijaga kunci)
app.post('/api/login-penjual', kunciPenjual, function (req, res) {
  res.json({ ok: true });
});
app.put('/api/pesanan/:id', kunciPenjual);
app.post('/api/menu', kunciPenjual);
app.put('/api/menu/:id', kunciPenjual);
app.delete('/api/menu/:id', kunciPenjual);
app.use('/api/pesanan', pesananRoutes);


const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
