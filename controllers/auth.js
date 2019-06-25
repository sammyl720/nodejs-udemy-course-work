
exports.getLogin = (req,res,next) => {
    console.log(req.session.isLoggedIn);
    res.render('auth/login',{
      path: "/login",
      isAuthenticated:false,

      pageTitle: "Login"
    })
}

exports.postLogin = (req,res,next) => {
  req.session.isLoggedIn = true;
  res.redirect('/');
}