const userModel = require("../model/userModel");
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('../config/config');
const cookie=require('cookie-parser');
const crypto=require('crypto');
const transporter=require('../config/nodemailer');

//User register Controller 
const userRegister=async(req,res)=>{
    try{
        const {firstName,lastName,email,password,mobileNo}=req.body;
    const EmailExists=await userModel.findOne({email});
    if(EmailExists){
        return res.status(409).json({
            message:"User already exists"
        })
    }
    const passwordHash=await bcrypt.hash(password,12); 
    const users=await userModel.create({
        firstName,lastName,email,password:passwordHash,mobileNo
    });
    const accessToken=jwt.sign({id:users._id},config.ACCESS_TOKEN,{expiresIn:'15m'});
    const refreshToken=jwt.sign({id:users._id},config.REFRESH_TOKEN,{expiresIn:'7d'});
    res.cookie('UserRefreshToken',refreshToken,{
        httpOnly:true,
        secure:true
    })
    res.status(201).json({
        message:"User registered"
    })
    }
    catch(err){
        return res.status(500).json({
            message:err.message
        })
    }
    
}

//User login Controller
const userLogin=async(req,res)=>{
    try{
        const {email,password}=req.body;
    const users=await userModel.findOne({email});
    if(!users){
        return res.status(409).json({
            message:"Invalid Email or Password"
        })
    }
    const passwordMatch= await bcrypt.compare(password,users.password);
    if(!passwordMatch){
        return res.status(401).json({
            message:"Invalid Email or Password"
        })
    }
    const accessToken=jwt.sign({id:users._id},config.ACCESS_TOKEN,{expiresIn:'15m'});
    const refreshToken=jwt.sign({id:users._id},config.REFRESH_TOKEN,{expiresIn:'7d'});
    res.cookie('UserLoginRefreshToken',refreshToken,{
        httpOnly:true
    })
    return res.status(201).json({
        message:"Login Successfully",
        data:{
            accessToken
        }
    })
    }
    catch(err){
        return res.status(500).json({
            message:err.message
        })
    }
}

//Forgot Password Controller
const userForgotPassword=async(req,res)=>{
    const {email}=req.body;
   const users= await userModel.findOne({email});
   if(!users){
    return res.status(404).json({
        message:"User Not found"
    })
   }
   const resetToken=crypto.randomBytes(32).toString('hex');
   const hashedToken=crypto.createHash('sha256').update(resetToken).digest('hex');
   users.passwordResetToken=hashedToken;
   users.passwordResetExpires = Date.now() + 15 * 60 * 1000;
   await users.save();
   const resetUrl=`http://localhost:5173/reset-password/${resetToken}`;
   const mailSent=await transporter.sendMail({
    from:config.EMAIL_USER,
    to:users.email,
    subject:"Password reset request",
    html:`<h2>Forgot Password?</h2>
        <p>Click the link below to reset your password.</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 15 minutes.</p>`
   })
          return res.status(200).json({
            message: "Password reset link sent successfully"
        });
}

//ResetPassword
const resetPassword=async(req,res)=>{
    const {token,password}=req.body;
    if(!password || password.length>=6){
        return res.status(400).json({
            message:"Password mustb be 6 character"
        })}
    const hashedToken=crypto.createHash('sha256').update(token).digest('hex');
    const users=await userModel.findOne({
            passwordResetToken:hashedToken,
            passwordResetExpires:{ $gt:Date.now()}
        })
        if(!users){
            return res.status(400).json({
                message:"Invalid token"
            })
        }
        users.password=await bcrypt.hash(password,12);
        users.passwordResetToken = undefined;
        users.passwordResetExpires = undefined;
        await users.save();
        return res.status(200).json({
            message:"password reset successfully"
        })    
}

//changePassword it is incomplete
const changePassword=async(req,res)=>{
    const {oldPassword,newPassword,confirmPassword}=req.body;
    if(!oldPassword || !newPassword || !confirmPassword){
        return res.status(400).json({
            message:"All Fields are Required"
        })
    }
    if(newPassword.length<6){
        return res.status(400).json({
            message:"Password must be atleast 6 characters"
        })
    }
    if(newPassword !==confirmPassword){
        return res.status(400).json({
            message:"Password do not match"
        })
    }
    const users=await userModel.findById(req.users.id);
    if(!users){
        return res.status(404).json({
            message:"User not Found"
        })
    }
    const comparePassword=await bcrypt.compare(oldPassword,users.password);
    if(!comparePassword){
        return res.status(400).json({
            message:"Old Password is incorrect"
        })
    }
    const isSame=await bcrypt.compare(newPassword,users.password);
    if(isSame){
        return res.status(400).json({
            message:"New Password must be Different From Old Password"
        })
    }
    users.password=await bcrypt.hash(newPassword,12);
    await users.save();
    return res.status(200).json({
        message:"Password Changed"
    })


}

module.exports={userRegister,userLogin,userForgotPassword,resetPassword,changePassword};