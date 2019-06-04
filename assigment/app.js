const express = require('express');

const app = express()


app.use("/users", (req,res,next)=>{
  console.log("Middleware for /user route");
  res.send("<p>You've reached the users page");
});

// app.use('/', (req,res,next)=>{
//   console.log("first middlemare");
//   next();
// });

app.use("/",(req,res,next)=>{
  console.log("Second middlemare");
  res.send("<h5>Hello There</h5>");
});

app.listen(3000, ()=>(console.log("now running server...")));