const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/user');
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator');

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
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    // console.log(errors.array());
    return res.status(422).render('auth/signup',{
      path: "/signup",
      pageTitle: "Sign up",
      errorMessage: errors.array()[0].msg
    })
  }
  
    bcrypt.hash(password, 12).then(hashedPassword => {
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
};

exports.getReset = (req,res,next) => {
  let message = req.flash('error');
    if(message[0]){
      message = message[0];
    }else{
      message = null;
    }
  res.render('auth/reset',{
    path: "/reset",
    pageTitle: "reset",
    errorMessage: message
  })
}

exports.postReset = (req,res,next) => {
    crypto.randomBytes(32, (err, buffer)=> {
      if(err){
        console.log(err);
        return res.redirect('/reset');
      }
      const token = buffer.toString('hex');
      User.findOne({email:req.body.email})
      .then(user => {
        if(!user){
          req.flash('error', "No account with that email found");
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExp = Date.now() + 3600000;
        return user.save().then(result => {
          req.flash('success', `a link was sent to ${req.body.email} to reset password`);
          res.redirect('/');
          
          transporter.sendMail({
            to:req.body.email,
            from: 'shop@node-comlete.com',
            subject: "Password Reset",
            html: `
            <p> You Requested a password reset</p>
            <p> Click this <a href="http://127.0.0.1:3000/reset/${token}">link</a> to reset password</p>
            `
          })
        }).catch(err => console.log(err));
      })
      .catch(err => console.log(err));
    });
}

exports.getNewPass = (req,res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExp: { $gt: Date.now()}})
  .then(user => {
    let message = req.flash('error');
    if(message[0]){
      message = message[0];
    }else{
      message = null;
    }
    res.render('auth/new-password',{
    path: "/new-password",
    pageTitle: "Reset Password",
    errorMessage: message,
    passwordToken:token,
    userId: user._id.toString()
    })
  })
  .catch(err => console.log(err));
  
}

exports.postNewPass = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  // console.log(`ID: ${userId}\nTOKEN:${token}`);
  let resetUser;
  User.findOne({resetToken: token, resetTokenExp: {$gt: Date.now()} , _id: userId})
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExp = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => console.log(err));
}