const Product = require('../models/product');
const Order = require('../models/order')
const fs = require("fs");
const PDFDocument = require("pdfkit")
const path = require("path");
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const ITEMS_PER_PAGE = 1;

exports.getProducts = (req,res,next)=>{
  // console.log(req.user._id);
  const page = +req.query.page || 1;
  let totalItems;
  let message = req.flash('success');
  if(message[0]){
    message = message[0];
  }else{
    message = null;
  }
  Product.find().countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    //skip: amount off documents to skip
    //example (2 - 1) * 2 = skip 2 documents
    .skip((page - 1) * ITEMS_PER_PAGE)
    //limit: limit the amount of docs to retrieve
    .limit(ITEMS_PER_PAGE)
  })
  .then(products => {
    res.render("shop/product-list", {
      products:products,
      pageTitle: "Shop",
      message:message,
      path: '/products',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
    });
  })
  .catch(err => {
    console.log(err)
  });
}

exports.getProduct = (req,res,next) =>{
  
  const prodId = req.params.productId;
  // console.log(prodId);
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
  const page = +req.query.page || 1;
  let totalItems;
  let message = req.flash('success');
  if(message[0]){
    message = message[0];
  }else{
    message = null;
  }
  Product.find().countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
    //skip: amount off documents to skip
    //example (2 - 1) * 2 = skip 2 documents
    .skip((page - 1) * ITEMS_PER_PAGE)
    //limit: limit the amount of docs to retrieve
    .limit(ITEMS_PER_PAGE)
  })
  .then(products => {
    // console.log(req.session.isLoggedIn)
    res.render("shop/product-list", {
      products:products,   
      pageTitle: "Shop",
      message: message,
      path: '/',
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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

exports.getCheckout = (req,res,next)=>{
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      // console.log(user.cart.items);
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
          total += p.quantity * p.productId.price;
      });
      res.render('shop/checkout',{
        path:'/checkout',
        pageTitle: "Checkout",
        products: products,
        totalSum: total
    
      });
    })
    .catch(err => {
      const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
    }); 
}

exports.postOrder = (req,res,next) => {
  const token = req.body.stripeToken;
  let totalSum = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      
      user.cart.items.forEach(p => {
        totalSum += p.quantity * p.productId.price;
      });
      
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
      return order.save();
    })
  .then(result => {
    console.log(result);
    const charge = stripe.charges.create({
      amount: totalSum * 100,
      currency:'usd',
      description: "Demo Order",
      source:token,
      metadata: { order_id: result._id.toString() }
    });
    return req.user.clearCart();
    
  }).then(() => {
    res.redirect('/orders');
  })
  .catch(err => {
    console.log(err);
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
    // console.log(orders);
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
 
};

exports.getInvoice = (req,res,next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order =>{
    if(!order){
      console.log("no order found");
      return next(new Error('No order found'));
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      console.log("unauthorized");
      return next(new Error('Unauthorized'));
    }
    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join('data', "invoices", invoiceName);
    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline:true
    });
    pdfDoc.text('----------------------');
    let totalPrice = 0;
    order.products.forEach(prod => {
      totalPrice = totalPrice + prod.quantity * prod.productData.price;
      pdfDoc.fontSize(14).text(
        prod.productData.title + " - " + prod.quantity + " x " + "$" + prod.productData.price)
    });
    pdfDoc.text('----')
    pdfDoc.fontSize(20).text('Total Price: $'+totalPrice);

    pdfDoc.end();
  //   fs.readFile(invoicePath, (err,data)=> {
  //   if(err){
  //     console.log("fs error");
  //    return next(err);
  //   }
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
  //   res.send(data);
  // });
  // const file = fs.createReadStream(invoicePath);
  
  // file.pipe(res);

  }).catch(err => {
    console.log(`catch error:\n ${err}`)
    next(err)});
  
};

