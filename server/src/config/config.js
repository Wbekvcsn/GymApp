const dotenv=require('dotenv');
dotenv.config();
const config={
    MONGO_URI:process.env.MONGO_URI,
    ACCESS_TOKEN:process.env.ACCESS_TOKEN,
    REFRESH_TOKEN:process.env.REFRESH_TOKEN,
    EMAIL_USER:process.env.EMAIL_USER,
    EMAIL_PASS:process.env.EMAIL_PASS
}
module.exports=config;