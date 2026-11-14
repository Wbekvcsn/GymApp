const express=require('express');
const {adminRegister,adminLogin,getAllUsers} = require('../controller/adminController');
const {adminRegisterValidation,adminLoginValidation} = require('../validation/adminValidation');
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminRoute=express.Router();
adminRoute.post('/register',adminRegisterValidation,adminRegister);
adminRoute.post('/login',adminLoginValidation,adminLogin);
adminRoute.get('/users', adminMiddleware, getAllUsers);

module.exports=adminRoute;
