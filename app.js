const express = require('express');
const bodyParser = require("body-parser");
// const hbs = require('express-handlebars')
const adminData = require('./routes/admin');
const path =require('path');
const shopRoutes = require('./routes/shop');
const port = process.env.PORT || 3000;
const app = express();


// app.engine('hbs', hbs({
//   defaultLayout:'main-layout',
//   extname: 'hbs'
// }));
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static(path.join(__dirname, "public")));
app.use("/admin",adminData.routes);
app.use(shopRoutes);

app.use((req,res,next)=>{
  res.status(404).render("404", {pageTitle: "Page not found"});
})

app.listen(port, ()=>{
  console.log(`Server started on port ${port}`);
})
