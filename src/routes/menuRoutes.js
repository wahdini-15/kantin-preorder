const express = require('express');
const router = express.Router();
const { createMenu, getAllMenu, getMenuById, updateMenu, deleteMenu } = require('../controllers/menuController');

router.get('/', getAllMenu);
router.get('/:id', getMenuById);
router.post('/', createMenu);
router.put('/:id', updateMenu);
router.delete('/:id', deleteMenu);

module.exports = router;
