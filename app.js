const express = require('express');
const bodyParser = require("body-parser");
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const path =require('path');
const session = require('express-session');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const MongoDBStore = require('connect-mongodb-session')(session);
const User = require('./models/user');
const mongoose = require('mongoose');
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express();
const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: 'sessions'
});

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, "public")));

//load session middleware
//secret should be an enviroment variable
app.use(session({
  secret:"my secret",
   resave:false, saveUninitialized:false,
   store: store
  })
);

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
app.use(authRoutes);


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




