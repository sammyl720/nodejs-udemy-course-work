const User = require('../models/user');
exports.getLogin = (req,res,next) => {
    console.log(req.session.isLoggedIn);
    res.render('auth/login',{
      path: "/login",
      isAuthenticated:false,

      pageTitle: "Login"
    })
}

exports.postLogin = (req,res,next) => {
  User.findById('5d101735dfc83446b832a027')
  .then(user => {
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save((err) => {
      if(err){
        console.log(err)
      }
      res.redirect('/');
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