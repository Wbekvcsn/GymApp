const jwt=require('jsonwebtoken');
const config=require('../config/config');
const createToken=({AdminId})=>{
    const accessToken=jwt.sign({id:AdminId},config.ACCESS_TOKEN,{expiresIn:'15min'});
    const refreshToken=jwt.sign({id:AdminId},config.REFRESH_TOKEN,{expiresIn:'7d'});
    return {accessToken,refreshToken}
}
module.exports=createToken;