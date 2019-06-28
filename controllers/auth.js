const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/user');
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.EMAIL_KEY
  }
}));

exports.getLogin = (req,res,next) => {
    let message = req.flash('error');
    if(message[0]){
      message = message[0];
    }else{
      message = null;
    }
    console.log(req.session.isLoggedIn);
    res.render('auth/login',{
      path: "/login",
      pageTitle: "Login",
      errorMessage: message
    })
}

exports.postLogin = (req,res,next) => {
  const {email, password} = req.body;
  User.findOne({email: email})
  .then(user => {
    if(!user){
      req.flash('error', "Invalid email or password.");
      return res.redirect('/login');
    };
    bcrypt.compare(password,user.password)
    .then(doMatch => {
      if(doMatch){
        req.session.isLoggedIn = true;
        req.session.user = user;
        return req.session.save((err) => {
        console.log(err);
        return res.redirect('/');
        });
      }
      req.flash('error', "Invalid email or password.");
      console.log('Email / Password is incorrect');
      res.redirect('/login');
    })
    .catch(err => {
      console.log(err);
      res.redirect('/login')
    })
    
    
  })
  .catch(err =>{
    console.log(err);
  });
}

exports.postLogout = (req,res,next) => {
  req.session.destroy(err => {
    console.log(err)
    res.redirect('/')
  });
}
exports.getSignup = (req,res,next) => {
  let message = req.flash('error');
  if(message[0]){
    message = message[0];
  }else{
    message = null;
  }
  res.render('auth/signup',{
    path: "/signup",
    pageTitle: "Sign up",
    errorMessage: message
  })
};

exports.postSignup = (req,res,next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  if(password !== confirmPassword){
    req.flash('error', "Passwords do not match.");
    console.log("Passwords do not match");
    return res.redirect('/signup');
  }
  User.findOne({email:email})
  .then(userDoc => {
    if(userDoc){
      console.log("Email is taken");
      req.flash('error', "There is an account associated with this email already.");
      return res.redirect('/signup');
    }
    return bcrypt.hash(password, 12).then(hashedPassword => {
      const user = new User({
        email:email,
        password:hashedPassword,
        cart: { items: []}
    
      });
      return user.save();
    }).then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Sign up Complete',
        html: '<h1> You succesfully signed up!</h1>'
      }); 
    })
    .catch(err => console.log(err));
    
  })
  .catch(err => console.log("my error:" + err));

  
};