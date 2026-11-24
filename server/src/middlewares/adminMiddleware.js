
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const adminModel = require('../model/adminModel');

const adminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Access token required'
            });
        }

        const accessToken = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            accessToken,
            config.ACCESS_TOKEN
        );

        if (decoded.role !== 'admin') {
            return res.status(403).json({
                message: 'Admin access only'
            });
        }

        const admin = await adminModel.findById(decoded.id);

        if (!admin || !admin.isactive) {
            return res.status(403).json({
                message: 'Admin not authorized'
            });
        }

        // Check whether this access token belongs to the current session version
        if (decoded.tokenVersion !== admin.tokenVersion) {
            return res.status(401).json({
                message: 'Session expired. Please login again.'
            });
        }

        req.admin = admin;

        next();

    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired access token'
        });
    }
};

module.exports = adminMiddleware;
