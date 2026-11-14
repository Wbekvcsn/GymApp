const adminModel=require('../model/adminModel');
const bcrypt=require('bcryptjs');
const createToken = require('../utils/auth.admin');
const cookie=require('cookie-parser');
const userModel=require('../model/userModel');
const adminRegister=async(req,res)=>{
    try{
    //admin register data
    const {name,email,password,phone,gymName,gymAddress}=req.body;

    //email already exists or not
    const isAlreadyExists=await adminModel.findOne({email});
    if(isAlreadyExists){
        return res.status(409).json({
            message:"Admin Already Exists"
        })
    }
    //password hash
    const passwordHash=await bcrypt.hash(password,12);
   
    //generate a token

    

     //admin store in database
    const admin=await adminModel.create({
        name,email,password:passwordHash,phone,gymName,gymAddress
    });
        const Tokens=createToken({AdminId:admin._id});
        res.cookie('refreshToken',Tokens.refreshToken,{
        httpOnly:true
    })
    
    return res.status(201).json({
        message:"Admin registerd",
        admin:{
            name,email,phone,gymName,gymAddress
        }
    })
  }
  catch(err){
    console.log("error in adminRegister",err.message);
  }


}
const adminLogin=async(req,res)=>{ 
 try{

    const {email,password}=req.body;
    //finding email
    const admin=await adminModel.findOne({email});
    if(!admin){
        return res.status(404).json({
            message:"Invalid Email or Password"
        })
    }
    //matching password
    const isMatch=await bcrypt.compare(password,admin.password);
    if(!isMatch){
        return res.status(401).json({
            message:"Invalid Email or Password"
        })
    }
    //generate tokens
    const Tokens=createToken({AdminId:admin._id});
    res.cookie('refreshToken',Tokens.refreshToken,{
        httpOnly:true
    })
    return res.status(200).json({
        message:"Login SuccessFully",
        accessToken: Tokens.accessToken
    })


 }
 catch(error){
    return res.status(500).json({
        message:error.message
    })
 }


}
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({})
            .select('-password -passwordResetToken -passwordResetExpires')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "All users fetched successfully",
            totalUsers: users.length,
            data: users
        });
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports={adminRegister,adminLogin,getAllUsers};