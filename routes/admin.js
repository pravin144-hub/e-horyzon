const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-event => GET
router.get('/add-event', adminController.getAddProduct);

// /admin/events => GET
router.get('/events', isAuth, adminController.getProducts);

// /admin/add-event => POST




router.post(
  '/add-event',adminController.postAddProduct
);

router.get('/edit-event/:productId',  adminController.getEditProduct);

router.post(
  '/edit-event',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('price').isFloat(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  
  adminController.postEditProduct
);

router.delete('/event/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
