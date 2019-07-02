exports.get404 = (req,res,next)=>{
  res.status(404).render("404", {pageTitle: "Page not found",
  isAuthenticated: req.session.isLoggedIn,
  path:"/404"
});
}

exports.get500 = (req,res,next)=>{
  res.status(500).render("500", {pageTitle: "Error",
  isAuthenticated: req.session.isLoggedIn,
  path:"/500",
  isAuthenticated:req.session.isLoggedIn
});
}