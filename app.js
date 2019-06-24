const express = require('express');
const bodyParser = require("body-parser");
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const path =require('path');
const shopRoutes = require('./routes/shop');
// const {mongoConnect} = require('./util/database');
const User = require('./models/user');
const mongoose = require('mongoose');
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, "public")));

app.use((req,res,next) => {
    User.findById('5d101735dfc83446b832a027')
    .then(user => {
      console.log(user);
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

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
.then(result => {
  User.findOne().then(user => {
    if(!user){
      const user = new User({
        name: 'Sam',
        email: "sam.leider@hotmail.com",
        cart: {
          items: []
        }
      });
      user.save();
    }
    
  })
  
  
  app.listen(3000,  ()=> console.log('server running!'));
})
.catch(err => console.log(err));




