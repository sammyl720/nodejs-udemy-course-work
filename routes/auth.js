const express = require('express');
const authController = require('../controllers/auth')
const { check, body } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup',
 [check('email')
 .isEmail()
 .withMessage('Please enter a valid email.')
 .custom((value, {req}) => {
  //  if(value === 'test@test.com'){
  //    throw new Error('This email address is forbidden');
  //  }
  //  return true;
  return User.findOne({email:value})
  .then(userDoc => {
    if(userDoc){
      return Promise.reject("There is an account associated with this email already.");
    }
  });
 }),
 body('password', "Please enter a password with only numbers and letters and at least 5 characters long")
 .isLength({min:5})
 .isAlphanumeric(),
 body('confirmPassword')
 .custom((value, {req}) => {
   if(value !== req.body.password){
     throw new Error('Passwords have to Match')
   }
   return true;
 })
]
  ,authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPass);

router.post('/new-password', authController.postNewPass);

module.exports = router;