
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userModel = require('../model/userModel');

const userMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Access token required"
            });
        }

        const accessToken = authHeader.split(' ')[1];

        const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN);

        if (decoded.role !== 'user') {
            return res.status(403).json({
                message: "User not authorized"
            });
        }

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(403).json({
                message: "User not found"
            });
        }

        // Block deactivated users
        if (user.isDeleted) {
            return res.status(403).json({
                message: "Your account has been deactivated"
            });
        }

        req.user = user;

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired access token"
        });
    }
};

module.exports = userMiddleware;
