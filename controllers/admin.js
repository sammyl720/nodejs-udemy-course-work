const Product = require('../models/product')
const mongoDb = require('mongodb');

exports.getAddProduct = (req,res,next)=>{
  res.render("admin/edit-product",{
    pageTitle: "Add Product",
    path: '/admin/add-product',
    editing:false
  });
}
exports.postEditProduct = (req,res,next)=>{
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImage = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const product = new Product(updatedTitle, updatedPrice, updatedDesc, updatedImage, prodId)
  
  product.save()
  .then( result => {
    console.log("updated Product");
    res.redirect('/products');
  })
  .catch(err =>{
    console.log(err);
  })
  
}
exports.getEditProduct = (req,res,next)=>{
  const editMode = req.query.edit;
  
  if(!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.prodId;
  
  Product.findByPk(prodId)
  .then(product => {
   
    if(!product){
      return res.redirect('/');
    }
    res.render("admin/edit-product",{
      pageTitle: "Edit Product",
      path: '/admin/edit-product',
      editing: editMode,
      product:product
    });
  }).catch(err => {
    console.log(err);
  }) 
}
exports.postAddProduct =  (req, res, next)=>{
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(title, price, description, imageUrl) ;
  product.save()
  .then(result => {
    //console.log(result)
    console.log('created product');
    res.redirect('/');
  })
  .catch(err => {
    console.log(err);
  })
}

exports.getProducts = (req,res)=>{
  Product.fetchAll()
  .then(products => {
    res.render('admin/products', {
      products: products,
      path: "/admin/products",
      pageTitle: "Admin products"
    });
  }).catch(err => {
    console.log(err);
  });
}
exports.postDeleteProduct = (req,res,next)=>{
  const prodId = req.body.prodId;
  Product.deleteById(prodId)
  .then(result => {
    console.log('Deleted')
    res.redirect('/admin/products');

  }).catch(err => {
    console.log(err)
  })

}