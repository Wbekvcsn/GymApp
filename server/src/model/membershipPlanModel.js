const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
    planName: {
        type: String,
        required: true,
        enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
        unique: true
    },
    durationDays: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const membershipPlanModel = mongoose.models.membershipplans ||
    mongoose.model('membershipplans', membershipPlanSchema);

module.exports = membershipPlanModel;