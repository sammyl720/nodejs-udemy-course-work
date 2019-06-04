const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
const users = ["sam"];

app.get('/users',(req,res)=>{
  res.render('users', {users:users, pageTitle:"Users"});
});
app.get('/',(req,res)=>{

    res.render('add-user', { pageTitle:"Add User"});
  
});
app.post("/", (req,res)=>{
  users.push(req.body.name);
  res.redirect('/users');
});

app.listen(3000, ()=>{
  console.log('server running...');
});