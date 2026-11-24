const jwt = require('jsonwebtoken');
const config = require('../config/config');

const createToken = ({ AdminId, tokenVersion }) => {
    const accessToken = jwt.sign(
        {
            id: AdminId,
            role: 'admin',
            tokenVersion
        },
        config.ACCESS_TOKEN,
        {
            expiresIn: '15m'
        }
    );

    const refreshToken = jwt.sign(
        {
            id: AdminId,
            role: 'admin'
        },
        config.REFRESH_TOKEN,
        {
            expiresIn: '7d'
        }
    );

    return {
        accessToken,
        refreshToken
    };
};

module.exports = createToken;