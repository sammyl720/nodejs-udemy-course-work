const express = require('express');
const {body, check} = require('express-validator');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const router = express.Router();

router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.post('/add-product',
[
  body('title', 'Title must be between 3 and a 100 characters')
  .isString()
  .isLength({min:5})
  .trim(),
  body('price', 'not a valid pricr')
  .isFloat(),
  check('description', 'Description Must be at least 5 characters and at most 255.')
  .isLength({min: 5, max: 255})
  .trim(),
],
 isAuth,  adminController.postAddProduct);
router.get('/edit-product/:prodId', isAuth, adminController.getEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct);
router.post('/edit-product',
[
  body('title', 'Title must be between 3 and a 100 characters')
  .isString()
  .isLength({min:3, max:100})
  .trim(),
  body('price', 'price is invalid')
  .isFloat(),
  check('description', 'Description must be between 5 and 255 characters')
  .isLength({min: 5, max: 255})
  .trim(),
],
 isAuth, adminController.postEditProduct);
module.exports = router;