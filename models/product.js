const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),'data',
 'products.json');
 
const getProductsFromFile = cb =>{
   fs.readFile(p, (err, fileContent)=>{
    if(err){
      return cb([]);
    }else{
      cb(JSON.parse(fileContent));
    }
    
  });

}


module.exports = class Product {
  constructor(id,title, imageUrl, description,price){
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;

  }
  save(){
    
    
    getProductsFromFile(products =>{
      if(this.id){
        const existingProductIndex = products.findIndex(prod => prod.id == this.id)
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProducts),err => {
          console.log(err);
        });
      }else{
        this.id = Math.random().toString();
      
      
        products.push(this);
        fs.writeFile(p, JSON.stringify(products),err => {
          console.log(err);
        });
      }
    });
  }
  static deleteProduct(id, cb){

    getProductsFromFile(products =>{
      
      const prodIndex = products.findIndex(p => p.id == id);
      const updatedProducts = products.filter(p => p.id !== id);

      fs.writeFile(p, JSON.stringify(updatedProducts),err => {
        if(err){
          cb(err, "Something went wrong")
        }else{
          //remove from cart
          cb(null, `${updatedProducts.title} was removed from the database`);
        }
      });
    })
  }
  static fetchAll(cb){
    getProductsFromFile(cb);
    
  }
  static findById(id, cb){
    getProductsFromFile(products =>{
      const product = products.find(p => {
        return p.id == id;
          
      });
      cb(product);
    });
  }
}