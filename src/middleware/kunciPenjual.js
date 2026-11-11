// Penjaga pintu: hanya lolos kalau kunci yang dikirim sama dengan kunci di server
function kunciPenjual(req, res, next) {
  const kunci = process.env.KUNCI_PENJUAL;
  if (!kunci || req.headers['x-kunci-penjual'] !== kunci) {
    return res.status(401).json({ message: 'Khusus penjual. Kunci salah.' });
  }
  next();
}

module.exports = kunciPenjual;
