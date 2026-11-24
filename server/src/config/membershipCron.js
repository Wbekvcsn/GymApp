const cron = require('node-cron');
const userModel = require('../model/userModel');

const membershipExpiryCron = () => {

    cron.schedule('0 0 * * *', async () => {
        try {
            const result = await userModel.updateMany(
                {
                    membershipStatus: 'Active',
                    membershipEndDate: { $lte: new Date() }
                },
                {
                    $set: {
                        membershipStatus: 'Expired'
                    }
                }
            );

            console.log(
                `${result.modifiedCount} memberships expired`
            );

        } catch (err) {
            console.log("Membership Expiry Error:", err.message);
        }
    }, {
        timezone: 'Asia/Kolkata'
    });

};

module.exports = membershipExpiryCron;