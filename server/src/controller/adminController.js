
const adminModel = require('../model/adminModel');
const bcrypt = require('bcryptjs');
const createToken = require('../utils/auth.admin');
const userModel = require('../model/userModel');
const paymentModel = require('../model/paymentModel');
const membershipPlanModel = require('../model/membershipPlanModel');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Hash refresh token before storing it in MongoDB
const hashRefreshToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

// Admin Registration
const adminRegister = async (req, res) => {
    try {
        const { name, email, password, phone, gymName, gymAddress } = req.body;

        const normalizedEmail = email.toLowerCase().trim();

        const isAlreadyExists = await adminModel.findOne({
            email: normalizedEmail
        });

        if (isAlreadyExists) {
            return res.status(409).json({
                message: "Admin Already Exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const admin = await adminModel.create({
            name,
            email: normalizedEmail,
            password: passwordHash,
            phone,
            gymName,
            gymAddress
        });

        const Tokens = createToken({
            AdminId: admin._id,
            tokenVersion: admin.tokenVersion ?? 0
        });

        admin.refreshToken = hashRefreshToken(Tokens.refreshToken);
        await admin.save();

        res.cookie('refreshToken', Tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(201).json({
            message: "Admin registered successfully",
            accessToken: Tokens.accessToken,
            admin: {
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                gymName: admin.gymName,
                gymAddress: admin.gymAddress
            }
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email.toLowerCase().trim();

        const admin = await adminModel.findOne({
            email: normalizedEmail
        });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        if (!admin.isactive) {
            return res.status(403).json({
                message: "Admin account is inactive"
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        const Tokens = createToken({
            AdminId: admin._id,
            tokenVersion: admin.tokenVersion ?? 0
        });

        admin.refreshToken = hashRefreshToken(Tokens.refreshToken);
        await admin.save();

        res.cookie('refreshToken', Tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(200).json({
            message: "Login Successfully",
            accessToken: Tokens.accessToken
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// Refresh Admin Access Token
const refreshAdminToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: 'Refresh token required'
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            config.REFRESH_TOKEN
        );

        if (decoded.role !== 'admin') {
            return res.status(403).json({
                message: 'Invalid refresh token'
            });
        }

        const admin = await adminModel.findById(decoded.id);

        if (!admin || !admin.isactive || !admin.refreshToken) {
            return res.status(401).json({
                message: 'Admin not authorized'
            });
        }

        const incomingTokenHash = hashRefreshToken(refreshToken);

        if (incomingTokenHash !== admin.refreshToken) {
            return res.status(401).json({
                message: 'Invalid refresh token'
            });
        }

        const Tokens = createToken({
            AdminId: admin._id,
            tokenVersion: admin.tokenVersion ?? 0
        });

        admin.refreshToken = hashRefreshToken(Tokens.refreshToken);
        await admin.save();

        res.cookie('refreshToken', Tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(200).json({
            message: 'Access token refreshed successfully',
            accessToken: Tokens.accessToken
        });

    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired refresh token'
        });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({
            isDeleted: { $ne: true }
        })
            .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All users fetched successfully",
            totalUsers: users.length,
            data: users
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            firstName,
            lastName,
            email,
            mobileNo,
            membershipPlan,
            membershipStatus
        } = req.body;

        const user = await userModel.findOne({
            _id: id,
            isDeleted: { $ne: true }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found or deactivated"
            });
        }

        if (firstName !== undefined) user.firstName = firstName;
        if (lastName !== undefined) user.lastName = lastName;
        if (email !== undefined) user.email = email;
        if (mobileNo !== undefined) user.mobileNo = mobileNo;

        if (membershipPlan !== undefined) {
            user.membershipPlan = membershipPlan;
        }

        if (membershipStatus !== undefined) {
            user.membershipStatus = membershipStatus;
        }

        await user.save();

        return res.status(200).json({
            message: "User updated successfully",
            data: user
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Email or mobile number already exists"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// Create Membership Plan
const createMembershipPlan = async (req, res) => {
    try {
        const { planName, durationDays, price, description } = req.body;

        const existingPlan = await membershipPlanModel.findOne({ planName });

        if (existingPlan) {
            return res.status(409).json({
                message: "Membership plan already exists"
            });
        }

        const plan = await membershipPlanModel.create({
            planName,
            durationDays,
            price,
            description
        });

        return res.status(201).json({
            message: "Membership Plan Created Successfully",
            data: plan
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Membership plan already exists"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// Get Membership Plans
const getMembershipPlans = async (req, res) => {
    try {
        const plans = await membershipPlanModel.find({})
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Membership Plans Fetched Successfully",
            totalPlans: plans.length,
            data: plans
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Update Membership Plan
const updateMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { planName, durationDays, price, description, isActive } = req.body;

        const updateData = {};

        if (planName !== undefined) updateData.planName = planName;
        if (durationDays !== undefined) updateData.durationDays = durationDays;
        if (price !== undefined) updateData.price = price;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;

        const updatedPlan = await membershipPlanModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedPlan) {
            return res.status(404).json({
                message: "Membership Plan Not Found"
            });
        }

        return res.status(200).json({
            message: "Membership Plan Updated Successfully",
            data: updatedPlan
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Membership plan already exists"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// Deactivate Membership Plan
const deleteMembershipPlan = async (req, res) => {
    try {
        const { id } = req.params;

        const plan = await membershipPlanModel.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!plan) {
            return res.status(404).json({
                message: "Membership Plan Not Found"
            });
        }

        return res.status(200).json({
            message: "Membership Plan Deactivated Successfully",
            data: plan
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
    try {
        const userFilter = {
            isDeleted: { $ne: true }
        };

        const totalUsers = await userModel.countDocuments(userFilter);

        const activeMemberships = await userModel.countDocuments({
            ...userFilter,
            membershipStatus: 'Active'
        });

        const inactiveMemberships = await userModel.countDocuments({
            ...userFilter,
            membershipStatus: 'Inactive'
        });

        const expiredMemberships = await userModel.countDocuments({
            ...userFilter,
            membershipStatus: 'Expired'
        });

        const totalPlans = await membershipPlanModel.countDocuments();

        const activePlans = await membershipPlanModel.countDocuments({
            isActive: true
        });

        return res.status(200).json({
            message: "Dashboard Statistics Fetched Successfully",
            data: {
                totalUsers,
                activeMemberships,
                inactiveMemberships,
                expiredMemberships,
                totalPlans,
                activePlans
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Recent Users
const getRecentUsers = async (req, res) => {
    try {
        const users = await userModel.find({
            isDeleted: { $ne: true }
        })
            .select('firstName lastName email mobileNo membershipStatus createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            message: "Recent Users Fetched Successfully",
            totalUsers: users.length,
            data: users
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Payment Statistics
const getPaymentStats = async (req, res) => {
    try {
        const totalPayments = await paymentModel.countDocuments({
            status: 'Success'
        });

        const revenue = await paymentModel.aggregate([
            {
                $match: {
                    status: 'Success'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]);

        const monthlyRevenue = await paymentModel.aggregate([
            {
                $match: {
                    status: 'Success'
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ]);

        return res.status(200).json({
            message: "Payment Statistics Fetched Successfully",
            data: {
                totalPayments,
                totalRevenue: revenue[0]?.totalRevenue || 0,
                monthlyRevenue
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Recent Payments
const getRecentPayments = async (req, res) => {
    try {
        const payments = await paymentModel.find({})
            .populate('userId', 'firstName lastName email')
            .populate('planId', 'planName durationDays')
            .sort({ createdAt: -1 })
            .limit(5);

        return res.status(200).json({
            message: "Recent Payments Fetched Successfully",
            totalPayments: payments.length,
            data: payments
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Get All Payments
const getAllPayments = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

        const skip = (page - 1) * limit;
        const { status } = req.query;

        const filter = {};

        if (status) {
            if (!['Success', 'Failed'].includes(status)) {
                return res.status(400).json({
                    message: "Invalid Payment Status. Use Success or Failed"
                });
            }

            filter.status = status;
        }

        const payments = await paymentModel.find(filter)
            .populate('userId', 'firstName lastName email')
            .populate('planId', 'planName durationDays')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPayments = await paymentModel.countDocuments(filter);

        return res.status(200).json({
            message: "All Payments Fetched Successfully",
            pagination: {
                totalPayments,
                currentPage: page,
                totalPages: Math.ceil(totalPayments / limit),
                limit
            },
            data: payments
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Deactivate User
const deactivateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await userModel.findOneAndUpdate(
            {
                _id: id,
                isDeleted: { $ne: true }
            },
            {
                $set: {
                    isDeleted: true,
                    refreshToken: null
                }
            },
            {
                new: true
            }
        ).select('-password -refreshToken');

        if (!user) {
            return res.status(404).json({
                message: "User not found or already deactivated"
            });
        }

        return res.status(200).json({
            message: "User deactivated successfully",
            data: user
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        const admin = req.admin;

        return res.status(200).json({
            message: "Admin Profile Fetched Successfully",
            data: {
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                gymName: admin.gymName,
                gymAddress: admin.gymAddress
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Update Admin Profile
const updateAdminProfile = async (req, res) => {
    try {
        const { name, email, phone, gymName, gymAddress } = req.body;

        const admin = req.admin;

        if (name !== undefined) admin.name = name.trim();
        if (email !== undefined) admin.email = email.trim().toLowerCase();
        if (phone !== undefined) admin.phone = phone.trim();
        if (gymName !== undefined) admin.gymName = gymName.trim();
        if (gymAddress !== undefined) admin.gymAddress = gymAddress.trim();

        await admin.save();

        return res.status(200).json({
            message: "Admin Profile Updated Successfully",
            data: {
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                gymName: admin.gymName,
                gymAddress: admin.gymAddress
            }
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// Change Admin Password
const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const admin = req.admin;

        const isMatch = await bcrypt.compare(
            currentPassword,
            admin.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Current password is incorrect'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: 'New password must be different from current password'
            });
        }

        admin.password = await bcrypt.hash(newPassword, 12);

        // Invalidate all previously issued access tokens
        admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;

        // Revoke existing refresh token
        admin.refreshToken = null;

        await admin.save();

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(200).json({
            message: 'Admin password changed successfully. Please login again.'
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// Admin Logout
const adminLogout = async (req, res) => {
    try {
        const admin = req.admin;

        // Invalidate all previously issued access tokens
        admin.tokenVersion = (admin.tokenVersion ?? 0) + 1;

        // Revoke refresh token
        admin.refreshToken = null;

        await admin.save();

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return res.status(200).json({
            message: 'Admin logged out successfully'
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    adminRegister,
    adminLogin,
    getAllUsers,
    createMembershipPlan,
    getMembershipPlans,
    updateMembershipPlan,
    deleteMembershipPlan,
    getDashboardStats,
    getRecentUsers,
    getPaymentStats,
    getRecentPayments,
    getAllPayments,
    deactivateUser,
    updateUser,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword,
    refreshAdminToken,
    adminLogout
};
