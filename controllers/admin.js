const Product = require('../models/product');
const mongoose = require('mongoose');
const {validationResult} = require('express-validator');
const mongoDb = require('mongodb');
const fileHelper = require("../util/file");
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
  const image = req.file;
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
    if(image){
      fileHelper.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
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
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if(!image){
    return res.status(422).render("admin/edit-product",{
      pageTitle: "Add Product",
      path: '/admin/edit-product',
      isAuthenticated: req.session.isLoggedIn,
      editing: false,
      hasError: true,
      errorMessage: "attached file is not an image",
      validationErrors: [],
      product:{
        title,
        price,
        description
      }
    });
  }
  const imageUrl = image.path;
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
        price,
        description
      }
    });

  }
  const product = new Product({
    title:title,
    price: price,
    description:description,
    imageUrl:imageUrl,
    userId: req.user

  });
  product.save()
  .then(result => {
    //console.log(result)
    console.log('created product');
    res.redirect('/admin/products');
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
  
}

exports.getProducts = (req,res,next)=>{
  Product.find({userId:req.user._id})
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
// exports.postDeleteProduct = (req,res,next)=>{
//   const prodId = req.body.prodId;
//   Product.findById(prodId).then(product => {
//     if(!product){
//       return next(new Error("Product not found"))
//     }
//     fileHelper.deleteFile(product.imageUrl);
//     return Product.deleteOne({
//       _id:prodId,
//       userId:req.user._id
//     })
//   })
//   .then(result => {
//     console.log('Deleted')
//     res.redirect('/admin/products');

//   }).catch(err => {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     return next(error);
//   })

// }

exports.deleteProduct = (req,res,next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then(product => {
    if(!product){
      return next(new Error("Product not found"))
    }
    fileHelper.deleteFile(product.imageUrl);
    return Product.deleteOne({
      _id:prodId,
      userId:req.user._id
    })
  })
  .then(result => {
    console.log('Deleted')
    res.status(200).json({message:"Success!"});

  }).catch(err => {
    res.status(500).json({message: "Deleting product failed"});
  });

}