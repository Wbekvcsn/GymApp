
const app = require('./src/app/app');
const connectDb = require('./src/config/db');
const membershipExpiryCron = require('./src/config/membershipCron');

const port = 3000;

const startServer = async () => {
    try {
        await connectDb();

        console.log("Database Connected");

        membershipExpiryCron();

        app.listen(port, () => {
            console.log(`Server is running on ${port}`);
        });

    } catch (err) {
        console.log("Server Startup Error:", err.message);
    }
};

startServer();
