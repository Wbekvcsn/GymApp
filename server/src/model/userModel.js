const mongoose=require('mongoose');
const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength:2,
    },
    lastName:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        Lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    mobileNo:{
        type:String,
        required:true,
        unique:true
    },
      membershipPlan: {
        type: String,
        enum: ['Monthly', 'Quarterly', 'Yearly'],
        default: 'Monthly'
    },
    membershipStatus: {
        type: String,
        enum: ['Active', 'Inactive', 'Expired'],
        default: 'Active'
    },
    membershipStartDate: {
        type: Date,
        default: Date.now
    },
    membershipEndDate: {
        type: Date
    },
    passwordResetToken:{
        type:String,
    },
    passwordResetExpires:{
        type:Date
    }
},{timestamps:true});
const userModel=mongoose.model('users',userSchema);
module.exports=userModel;