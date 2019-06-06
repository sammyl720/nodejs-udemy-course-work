const Product = require('../models/product');
const Cart = require('../models/cart')



exports.getProducts = (req,res,next)=>{
  const products = Product.fetchAll(products=>{
    res.render("shop/product-list", {
      products:products,
      pageTitle: "Shop",
      path: '/products'
    });
  }); 
}

exports.getProduct = (req,res,next) =>{
  const prodId = req.params.productId;
  
  Product.findById(prodId, product => {
    
    res.render('shop/product-detail',{
      product:product,
      pageTitle:product.title,
      path: "/products"

    });
  });
  
}

exports.getIndex = (req,res)=>{
  Product.fetchAll(products => {
    res.render('shop/index', {
      products: products,
      path: "/",
      pageTitle: "products"
    });
  });
}

exports.getCart = (req,res, next) =>{
  res.render('shop/cart',{
    path:'/cart',
    pageTitle: "Your Cart"
  })
};

exports.getCheckout = (req,res,next) =>{
  res.render('shop/checkout',{
    path: "/checkout",
    pageTitle: "Checkout"
  })
}
exports.postCart = (req,res,next) =>{
    const prodId = req.body.productId;
    Product.findById(prodId, (product)=>{
      Cart.addProduct(prodId, product.price);
    })
    res.redirect("/cart");
}


exports.getOrders = (req,res,next) => {
  res.render('shop/orders',{
    path: "/orders",
    pageTitle: "Your Orders"
  })
}