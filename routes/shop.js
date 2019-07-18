const express = require('express');
const isAuth = require('../middleware/is-auth');
const shopController = require('../controllers/shop');
const router = express.Router();

router.get('/products',shopController.getProducts);
router.get('/', shopController.getIndex);
router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);
router.get("/products/:productId", shopController.getProduct);
router.get('/checkout',isAuth,shopController.getCheckout);
router.get('/orders', isAuth, shopController.getOrders);
router.get("/orders/:orderId",isAuth, shopController.getInvoice);

module.exports = router;