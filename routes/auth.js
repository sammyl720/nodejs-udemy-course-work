const express = require('express');
const authController = require('../controllers/auth')
const { check, body } = require('express-validator');
const User = require('../models/user');
const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login',
  [check('email')
  .isEmail()
  .withMessage('Please enter a valid email')
  .normalizeEmail(),
  check('password', 'Password must be at least five characters with letters and numbers')
  .isLength({min:5})
  .isAlphanumeric()
  .trim()
],
 authController.postLogin);

router.get('/signup', authController.getSignup);

router.post('/signup',
 [check('email')
 .isEmail()
 .withMessage('Please enter a valid email.')
 .custom((value, {req}) => {
   if(value === 'test@test.com'){
     throw new Error('This email address is forbidden');
   }
  return User.findOne({email:value})
  .then(userDoc => {
    if(userDoc){
      return Promise.reject("There is an account associated with this email already.");
    }
  });
 }).normalizeEmail(),
 body('password', "Please enter a password with only numbers and letters and at least 5 characters long")
 .isLength({min:5})
 .isAlphanumeric()
 .trim(),
 body('confirmPassword')
 .isLength({min:5})
 .isAlphanumeric()
 .custom((value, {req}) => {
   if(value !== req.body.password){
     throw new Error('Passwords have to Match')
   }
   return true;
 }).trim()
]
  ,authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPass);

router.post('/new-password', authController.postNewPass);

module.exports = router;