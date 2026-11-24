
const userModel = require("../model/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const membershipPlanModel = require('../model/membershipPlanModel');
const paymentModel = require('../model/paymentModel');
const { transporter, sendWelcomeEmail } = require('../config/nodemailer');

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { id: userId, role: 'user' },
        config.ACCESS_TOKEN,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { id: userId, role: 'user' },
        config.REFRESH_TOKEN,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
};

const userRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, mobileNo } = req.body;

        const normalizedEmail = email.toLowerCase().trim();

        const EmailExists = await userModel.findOne({
            email: normalizedEmail
        });

        if (EmailExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const users = await userModel.create({
            firstName,
            lastName,
            email: normalizedEmail,
            password: passwordHash,
            mobileNo
        });

        const { accessToken, refreshToken } = generateTokens(users._id);

        users.refreshToken = refreshToken;
        await users.save();

        res.cookie('UserRefreshToken', refreshToken, cookieOptions);

        try {
            const userName = `${users.firstName} ${users.lastName}`;
            await sendWelcomeEmail(users.email, userName);
        } catch (emailError) {
            console.log("Welcome Email Error:", emailError.message);
        }

        return res.status(201).json({
            message: "User registered successfully",
            data: {
                accessToken
            }
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Email or Mobile Number already exists"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email.toLowerCase().trim();

        const users = await userModel.findOne({
            email: normalizedEmail
        });

        if (!users) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        if (users.isDeleted) {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact the administrator."
            });
        }

        const passwordMatch = await bcrypt.compare(password, users.password);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        const { accessToken, refreshToken } = generateTokens(users._id);

        users.refreshToken = refreshToken;
        await users.save();

        res.cookie('UserRefreshToken', refreshToken, cookieOptions);

        return res.status(200).json({
            message: "Login Successfully",
            data: {
                accessToken
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.UserRefreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token required"
            });
        }

        const decoded = jwt.verify(
            refreshToken,
            config.REFRESH_TOKEN
        );

        const users = await userModel.findById(decoded.id);

        if (!users || users.isDeleted || users.refreshToken !== refreshToken) {
            return res.status(401).json({
                message: "Invalid refresh token"
            });
        }

        const accessToken = jwt.sign(
            { id: users._id, role: 'user' },
            config.ACCESS_TOKEN,
            { expiresIn: '15m' }
        );

        return res.status(200).json({
            message: "Access token refreshed successfully",
            data: {
                accessToken
            }
        });

    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired refresh token"
        });
    }
};

const userForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const users = await userModel.findOne({ email });

        if (!users) {
            return res.status(200).json({
                message: "If the account exists, a password reset link will be sent"
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        users.passwordResetToken = hashedToken;
        users.passwordResetExpires = Date.now() + 15 * 60 * 1000;

        await users.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: config.EMAIL_USER,
            to: users.email,
            subject: "Password reset request",
            html: `
                <h2>Forgot Password?</h2>
                <p>Click the link below to reset your password.</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link expires in 15 minutes.</p>
            `
        });

        return res.status(200).json({
            message: "If the account exists, a password reset link will be sent"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password || password.length < 6) {
            return res.status(400).json({
                message: "Valid token and password of at least 6 characters are required"
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const users = await userModel.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!users) {
            return res.status(400).json({
                message: "Invalid or expired token"
            });
        }

        users.password = await bcrypt.hash(password, 12);
        users.passwordResetToken = undefined;
        users.passwordResetExpires = undefined;
        users.refreshToken = null;

        await users.save();

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "All Fields are Required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        const users = await userModel.findById(req.user._id);

        if (!users) {
            return res.status(404).json({
                message: "User not Found"
            });
        }

        const comparePassword = await bcrypt.compare(
            oldPassword,
            users.password
        );

        if (!comparePassword) {
            return res.status(400).json({
                message: "Old Password is incorrect"
            });
        }

        const isSame = await bcrypt.compare(
            newPassword,
            users.password
        );

        if (isSame) {
            return res.status(400).json({
                message: "New Password must be different from Old Password"
            });
        }

        users.password = await bcrypt.hash(newPassword, 12);
        users.refreshToken = null;

        await users.save();

        return res.status(200).json({
            message: "Password Changed Successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const userLogout = async (req, res) => {
    try {
        const users = await userModel.findById(req.user._id);

        if (!users) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        users.refreshToken = null;
        await users.save();

        res.clearCookie('UserRefreshToken', cookieOptions);

        return res.status(200).json({
            message: "Logout Successfully"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const users = await userModel.findById(req.user._id)
            .select('-password -refreshToken -passwordResetToken -passwordResetExpires');

        if (!users) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User Profile Fetched Successfully",
            data: users
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const { firstName, lastName, mobileNo } = req.body;

        const users = await userModel.findById(req.user._id);

        if (!users) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (firstName !== undefined) users.firstName = firstName;
        if (lastName !== undefined) users.lastName = lastName;
        if (mobileNo !== undefined) users.mobileNo = mobileNo;

        await users.save();

        return res.status(200).json({
            message: "Profile Updated Successfully",
            data: {
                firstName: users.firstName,
                lastName: users.lastName,
                email: users.email,
                mobileNo: users.mobileNo
            }
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Mobile Number already exists"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

const getCurrentMembership = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id)
            .select('membershipPlan membershipStatus membershipStartDate membershipEndDate');

        if (!user) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        return res.status(200).json({
            message: "Current Membership Fetched Successfully",
            data: user
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const purchaseMembership = async (req, res) => {
    try {
        const { planId } = req.body;

        const plan = await membershipPlanModel.findById(planId);

        if (!plan || !plan.isActive) {
            return res.status(404).json({
                message: "Membership Plan Not Found or Inactive"
            });
        }

        const amount = plan.price * 100;

        const order = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: `gym_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                planId: plan._id.toString()
            }
        });

        return res.status(201).json({
            message: "Payment Order Created Successfully",
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                plan: {
                    id: plan._id,
                    name: plan.planName,
                    durationDays: plan.durationDays,
                    price: plan.price
                }
            }
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const verifyMembershipPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "Payment details are required"
            });
        }

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid Payment Signature"
            });
        }

        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (
            payment.order_id !== razorpay_order_id ||
            payment.status !== 'captured'
        ) {
            return res.status(400).json({
                message: "Payment not completed or order mismatch"
            });
        }

        const order = await razorpay.orders.fetch(razorpay_order_id);

        if (
            order.notes.userId !== req.user._id.toString() ||
            payment.amount !== order.amount ||
            payment.currency !== order.currency ||
            order.currency !== 'INR'
        ) {
            return res.status(400).json({
                message: "Payment details do not match"
            });
        }

        const plan = await membershipPlanModel.findById(order.notes.planId);

        if (!plan || !plan.isActive) {
            return res.status(404).json({
                message: "Membership Plan Not Found or Inactive"
            });
        }

        if (payment.amount !== plan.price * 100) {
            return res.status(400).json({
                message: "Membership amount does not match"
            });
        }

        const existingPayment = await paymentModel.findOne({
            razorpayPaymentId: razorpay_payment_id
        });

        if (existingPayment) {
            return res.status(409).json({
                message: "Payment Already Processed"
            });
        }

        const users = await userModel.findById(req.user._id);

        if (!users || users.isDeleted) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        const startDate = new Date();
        const endDate = new Date(startDate);

        endDate.setDate(endDate.getDate() + plan.durationDays);

        users.membershipPlan = plan.planName;
        users.membershipStatus = 'Active';
        users.membershipStartDate = startDate;
        users.membershipEndDate = endDate;

        await users.save();

        await paymentModel.create({
            userId: users._id,
            planId: plan._id,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            amount: payment.amount / 100,
            status: 'Success'
        });

        return res.status(200).json({
            message: "Membership Activated Successfully",
            data: {
                membershipPlan: users.membershipPlan,
                membershipStatus: users.membershipStatus,
                membershipStartDate: users.membershipStartDate,
                membershipEndDate: users.membershipEndDate
            }
        });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: "Payment Already Processed"
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

const getAvailableMembershipPlans = async (req, res) => {
    try {
        const plans = await membershipPlanModel.find({
            isActive: true
        }).sort({ createdAt: -1 });

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

const getPaymentHistory = async (req, res) => {
    try {
        const payments = await paymentModel.find({
            userId: req.user._id
        })
            .populate('planId', 'planName durationDays')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Payment History Fetched Successfully",
            totalPayments: payments.length,
            data: payments
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    userRegister,
    userLogin,
    refreshAccessToken,
    userForgotPassword,
    resetPassword,
    changePassword,
    userLogout,
    getUserProfile,
    updateUserProfile,
    getCurrentMembership,
    purchaseMembership,
    verifyMembershipPayment,
    getAvailableMembershipPlans,
    getPaymentHistory
};
