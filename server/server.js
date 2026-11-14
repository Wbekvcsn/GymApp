const app=require('./src/app/app');
const connectDb = require('./src/config/db');
let port=3000;
connectDb();
app.listen(port,()=>{
    console.log(`Server is running on ${port}`);
})