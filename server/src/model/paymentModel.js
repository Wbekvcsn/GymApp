const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'membershipplans',
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Success', 'Failed'],
        default: 'Success'
    }
}, { timestamps: true });

const paymentModel = mongoose.model('payments', paymentSchema);

module.exports = paymentModel;