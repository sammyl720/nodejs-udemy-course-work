const express = require('express');
const bodyParser = require("body-parser");
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const path =require('path');
const flash = require('connect-flash');
const session = require('express-session');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const User = require('./models/user');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();
const port = process.env.PORT || 3000;
const app = express();
const store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: 'sessions'
});

const isAuth = require('./middleware/is-auth');
const shopController = require('./controllers/shop');

const csrfProtection = csrf();


app.set("view engine", "ejs");
app.set("views", "views");

const fileFilter = (req,file,cb) => {
  if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
    cb(null, true);
  }else{
    cb(null,false)
  }
}
const fileStorage = multer.diskStorage({
    destination:(req, file, cb) =>{
      cb(null, "images")
    },
    filename:(req,file, cb) => {
      cb(null, new Date().getMilliseconds().toString() + "-" + file.originalname);
    }
});

app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));

app.use(express.static(path.join(__dirname, "public")));
app.use("/images",express.static(path.join(__dirname, "images")));

//load session middleware
//secret should be an enviroment variable
app.use(session({
  secret:"my secret",
   resave:false, saveUninitialized:false,
   store: store
  })
);


app.use((req,res,next) => {
    if(!req.session.user){
      return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
      if(!user){
        return next()
      }
      req.user = user;
      next();
    })
    .catch(err =>{
      next(new Error(err));
    });

});

app.use(flash());
app.use((req,res, next)=> {
  res.locals.isAuthenticated = req.session.isLoggedIn; 
  next();
});

app.post('/create-order', isAuth,  shopController.postOrder);

app.use(csrfProtection);

app.use((req,res, next)=> {
  res.locals.csrfToken = req.csrfToken();
  next();
});




app.use("/admin",adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req,res,next) => {
  res.status(500).render("500", {
    pageTitle: "Error",
    isAuthenticated: req.session.isLoggedIn,
    path:"/500",
    isAuthenticated:req.session.isLoggedIn
  });
});

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true})
.then(result => {
  app.listen(3000,  ()=> console.log('server running!'));
})
.catch(err => console.log(err));




