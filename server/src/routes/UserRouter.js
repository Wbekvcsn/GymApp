const express=require('express');
const {userRegister,userLogin, userForgotPassword, resetPassword, changePassword, refreshAccessToken,userLogout,getUserProfile,updateUserProfile,getCurrentMembership,purchaseMembership,verifyMembershipPayment,getAvailableMembershipPlans,getPaymentHistory} = require('../controller/userController');
const {userRegisterValidation,userLoginValidation} = require('../validation/userValidation');
const userMiddleware=require('../middlewares/userMiddleware');
const userRouter=express.Router();
userRouter.post('/register',userRegisterValidation,userRegister);
userRouter.post('/login',userLoginValidation,userLogin);
userRouter.post('/refresh-token', refreshAccessToken);
userRouter.post('/forgot-password',userForgotPassword);
userRouter.post('/reset-password',resetPassword);
userRouter.post('/change-password',userMiddleware,changePassword);
userRouter.post('/logout',userMiddleware,userLogout);
userRouter.get('/profile',userMiddleware,getUserProfile);
userRouter.put('/profile',userMiddleware,updateUserProfile);
userRouter.get('/current-membership', userMiddleware, getCurrentMembership);
userRouter.post('/purchase-membership', userMiddleware, purchaseMembership);
userRouter.post(
    '/verify-membership-payment',
    userMiddleware,
    verifyMembershipPayment
);
userRouter.get('/payment-history', userMiddleware, getPaymentHistory);
userRouter.get('/membership-plans', getAvailableMembershipPlans);

module.exports=userRouter;