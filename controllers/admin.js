const Product = require('../models/product');
const mongoose = require('mongoose');
const {validationResult} = require('express-validator');
const mongoDb = require('mongodb');

exports.getAddProduct = (req,res,next)=>{
  if(!req.session.isLoggedIn){
    return res.redirect('/login');
  }
  res.render("admin/edit-product",{
    pageTitle: "Add Product",
    path: '/admin/add-product',
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: null,
    hasError:false,
    editing:false,
    validationErrors: []
  });
}
exports.postEditProduct = (req,res,next)=>{
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  // console.log(errors);
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product",{
      pageTitle: "Edit Product",
      path: '/admin/edit-product',
      isAuthenticated: req.session.isLoggedIn,
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      product:{
        title: updatedTitle,
        imageUrl: updatedImage,
        price: updatedPrice,
        description:updatedDesc,
        _id: req.body.productId,
        
      },
      validationErrors: errors.array()
    });

  }
  Product.findById(prodId)
  .then(product => {
    if(product.userId.toString() !== req.user._id.toString()){
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImage;
    return product.save().then(result => {
      console.log("updated Product");
      res.redirect('/products');
    });
  }) 
  .catch(err =>{
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })
  
}
exports.getEditProduct = (req,res,next)=>{
  const editMode = req.query.edit;
  
  if(!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.prodId;
  
  Product.findById(prodId)
  .then(product => {
   
    if(!product){
      return res.redirect('/');
    }
    res.render("admin/edit-product",{
      pageTitle: "Edit Product",
      path: '/admin/edit-product',
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: null,
      hasError:false,
      editing: editMode,
      validationErrors: [],
      product:product
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }) 
}
exports.postAddProduct =  (req, res, next)=>{
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  console.log(errors);
  if(!errors.isEmpty()){
    return res.status(422).render("admin/edit-product",{
      pageTitle: "Add Product",
      path: '/admin/edit-product',
      isAuthenticated: req.session.isLoggedIn,
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product:{
        title,
        imageUrl,
        price,
        description
      }
    });

  }
  const product = new Product({
    title:title,
    price: price,
    description:description,
    imageUrl: imageUrl,
    userId: req.user

  });
  product.save()
  .then(result => {
    //console.log(result)
    console.log('created product');
    res.redirect('/');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  
}

exports.getProducts = (req,res,next)=>{
  // console.log(req.user);
  Product.find({userId:req.user._id})
  // .select('title price -_id')// select which content you want to retreive
  // .populate('userId', 'name') // retrieve/populate data through the ObjectID/reference
  .then(products => {
    // console.log(products);
    res.render('admin/products', {
      products: products,
      path: "/admin/products",
      isAuthenticated: req.session.isLoggedIn,
      pageTitle: "Admin products"
    });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}
exports.postDeleteProduct = (req,res,next)=>{
  const prodId = req.body.prodId;
  Product.deleteOne({
    _id:prodId,
    userId:req.user._id
  })
  .then(result => {
    console.log('Deleted')
    res.redirect('/admin/products');

  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  })

}