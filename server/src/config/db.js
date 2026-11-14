
const mongoose=require('mongoose');
const config = require('./config');
const connectDb=async()=>{
    try{
        await mongoose.connect(config.MONGO_URI);
        console.log("database connnected successfiully");
    }
    catch(err){
        console.log(err);
    }

}
module.exports=connectDb;