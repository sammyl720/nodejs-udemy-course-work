const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),'data',
 'cart.json');
 

module.exports = class Cart {
  static addProduct(id, productPrice){
    //fetch the previous cart
    fs.readFile(p, (err, fileContent)=>{
        let cart = {products: [], totalPrice: 0}
        if(!err){
          cart =  JSON.parse(fileContent);
        }else{
          console.log("error")
        }
        //analyze the cart => find existing product
        const existingProductIndex = cart.products.findIndex(prod => prod.id == id)
        const existingProduct = cart.products[existingProductIndex];
        let updatedProduct;
        if(existingProduct){
          //add new product/ increase quantity
          updatedProduct = {...existingProduct};
          updatedProduct.qty = updatedProduct.qty +1;
          cart.products = [...cart.products]
          cart.products[existingProductIndex] = updatedProduct;
        }else{
          updatedProduct = {id:id, qty:1};
          cart.products =[...cart.products, updatedProduct];
        }
        //update cart total price
        cart.totalPrice = cart.totalPrice + +productPrice;
        fs.writeFile(p, JSON.stringify(cart),(err)=>{
          console.log(err)
        });
    });
    
    
  }
  // static deleteProduct(id, prodPrice){
  //   fs.readFile(p, (err, fileContent)=>{
  //     if(err){
  //         return;
  //     }
  //     // const updatedCart = {...cart};
  //     // cart.totalPrice 
  //   })
  // }

}