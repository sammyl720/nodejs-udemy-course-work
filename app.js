const express = require('express');
const bodyParser = require("body-parser");
const sequelize = require('./util/database');
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const path =require('path');
const shopRoutes = require('./routes/shop');
const port = process.env.PORT || 3000;
const app = express();
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const Product = require('./models/product');
const User = require('./models/user');


app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, "public")));

app.use((req,res,next) => {
    User.findByPk(1)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err =>{
      console.log(err);
    });

});

app.use("/admin",adminRoutes);
app.use(shopRoutes);


app.use(errorController.get404);


Product.belongsTo(User, {
  constraints:true,
  onDelete:"CASCADE"
});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem })

sequelize
// .sync({force:true})
.sync()
.then(result => {
  //console.log(result)
  return User.findByPk(1);
})
.then(user => {
  if(!user){
    return User.create({
      name: 'Sam',
      email:'sam.leider@hotmail.com'
    });
  }
  return user;
})
.then(user => {
  // console.log(user);
  return user.getCart()
  .then(cart => {
    if(!cart){

      return user.createCart();
    }else{
      return cart;
    }
  }).catch(err => console.log(err))
  
  
  })
  .then(cart => {
    app.listen(port, ()=>{
      console.log(`Server started on port ${port}`);
  })
})
.catch(err => {
  console.log(err)
});


