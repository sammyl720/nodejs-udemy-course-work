const Product = require('../models/product');
const Order = require('../models/order')


exports.getProducts = (req,res,next)=>{
  // console.log(req.user._id);
  let message = req.flash('success');
  if(message[0]){
    message = message[0];
  }else{
    message = null;
  }
  Product.find()
  .then(products => {
    res.render("shop/product-list", {
      products:products,
      pageTitle: "Shop",
      message:message,
      path: '/products'
    });
  })
  .catch(err => {
    console.log(err)
  });
}

exports.getProduct = (req,res,next) =>{
  const prodId = req.params.productId;
  console.log(prodId);
  Product.findById(prodId)
  .then((product) => {
    res.render('shop/product-detail',{
      product:product,
      pageTitle:product.title,

      path: "/products"

    });
  })
  .catch(err => console.log(err));
  
}

exports.getIndex = (req,res,next)=>{
  let message = req.flash('success');
  if(message[0]){
    message = message[0];
  }else{
    message = null;
  }
  Product.find()
  .then(products => {
    // console.log(req.session.isLoggedIn)
    res.render("shop/product-list", {
      products:products,   
      pageTitle: "Shop",
      message: message,
      path: '/'
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  
}

exports.getCart = (req,res, next) =>{
    if(!req.user){
      res.redirect('/');
    }
    req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      // console.log(user.cart.items);
      const products = user.cart.items;
      res.render('shop/cart',{
        path:'/cart',
        pageTitle: "Your Cart",
        products: products
    
      });
    })
    .catch(err => {
      const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
    }); 
};


exports.postCartDeleteProduct = (req,res,next)=>{
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
  .then(result => {
    // console.log(result);
    res.redirect('/cart');
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  
}
exports.postCart = (req,res,next) =>{
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product); 
    }).then(result => {
      // console.log(result);
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
    });
}

exports.postOrder = (req,res,next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity,productData: { ...i.productId._doc }
        }
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      order.save();
    })
  .then(result => {
    return req.user.clearCart();
    
  }).then(() => {
    res.redirect('/orders');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
};

exports.getOrders = (req,res,next) => {
  if(!req.user){
    res.redirect('/');
  }
  Order.find({'user.userId': req.user._id})
  .then(orders => {
    console.log(orders);
    res.render('shop/orders',{
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders
    })
  })
  .catch(err =>{ 
    console.log(err)
    res.redirect(404, '/error')
  })
 
}