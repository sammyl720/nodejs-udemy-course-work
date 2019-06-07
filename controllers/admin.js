const Product = require('../models/product')


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
  const updatedProduct = new Product(prodId, updatedTitle, updatedImage, updatedDesc, updatedPrice);
  updatedProduct.save();
  res.redirect('/products');
}
exports.getEditProduct = (req,res,next)=>{
  const editMode = req.query.edit;
  if(!editMode){
    return res.redirect('/');
  }
  const prodId = req.params.prodId;
  Product.findById(prodId, product => {
    if(!product){
      return res.redirect('/');
    }
    res.render("admin/edit-product",{
      pageTitle: "Edit Product",
      path: '/admin/edit-product',
      editing: editMode,
      product:product
    });
  })
  
}
exports.postAddProduct =  (req, res, next)=>{
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(null,title, imageUrl, description, price);
  product.save();
  res.redirect('/');
}

exports.getProducts = (req,res)=>{
  Product.fetchAll(products => {
    res.render('admin/products', {
      products: products,
      path: "/admin/products",
      pageTitle: "Admin products"
    });
  });
}
exports.postDeleteProduct = (req,res,next)=>{
  const prodId = req.body.prodId;
  Product.deleteProduct(prodId, (err,message)=>{
    if(err){
      console.log(message)
      res.redirect('/products');
    }else{
      console.log(message);
      res.redirect('/');
    }
  })

}