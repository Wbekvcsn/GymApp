const express=require('express');
const {adminRegister,adminLogin,getAllUsers,createMembershipPlan,getMembershipPlans,updateMembershipPlan,deleteMembershipPlan,getDashboardStats,getRecentUsers,getPaymentStats,getRecentPayments,getAllPayments,deactivateUser,updateUser,getAdminProfile,updateAdminProfile,refreshAdminToken,adminLogout} = require('../controller/adminController');
const {adminRegisterValidation,adminLoginValidation} = require('../validation/adminValidation');
const adminMiddleware = require('../middlewares/adminMiddleware');
const adminRoute=express.Router();
const { changeAdminPassword } = require('../controller/adminController');

const { adminChangePasswordValidation } = require('../validation/adminValidation');
adminRoute.post('/register',adminRegisterValidation,adminRegister);
adminRoute.post('/login',adminLoginValidation,adminLogin);
adminRoute.post('/refresh-token', refreshAdminToken);
adminRoute.get('/users', adminMiddleware, getAllUsers);
adminRoute.post('/membership-plan', adminMiddleware, createMembershipPlan);
adminRoute.get('/membership-plans', adminMiddleware, getMembershipPlans);
adminRoute.put('/membership-plan/:id',adminMiddleware,updateMembershipPlan);
adminRoute.delete(
    '/membership-plan/:id',
    adminMiddleware,
    deleteMembershipPlan
);
adminRoute.get(
    '/dashboard-stats',
    adminMiddleware,
    getDashboardStats
);
adminRoute.get(
    '/recent-users',
    adminMiddleware,
    getRecentUsers
);
adminRoute.get(
    '/payment-stats',
    adminMiddleware,
    getPaymentStats
);
adminRoute.get(
    '/recent-payments',
    adminMiddleware,
    getRecentPayments
);
adminRoute.get(
    '/payments',
    adminMiddleware,
    getAllPayments
);
adminRoute.patch('/users/:id/deactivate', adminMiddleware, deactivateUser);
adminRoute.put('/users/:id', adminMiddleware, updateUser);
adminRoute.get('/profile', adminMiddleware, getAdminProfile);

adminRoute.put('/profile', adminMiddleware, updateAdminProfile);
adminRoute.put(
    '/change-password',
    adminMiddleware,
    adminChangePasswordValidation,
    changeAdminPassword
);
adminRoute.post('/logout', adminMiddleware, adminLogout);

module.exports=adminRoute;
