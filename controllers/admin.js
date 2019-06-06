const Product = require('../models/product')


exports.getAddProduct = (req,res,next)=>{
  res.render("admin/add-product",{
    pageTitle: "Add Product",
    path: '/admin/add-product',
    formsCss:true,
      productsCss:true,
      activeProduct:true
  });
}

exports.postAddProduct =  (req, res, next)=>{
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;
  const product = new Product(title, imageUrl, description, price);
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