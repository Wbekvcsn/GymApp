
const express = require('express');
const adminRoute = require('../routes/adminRouter');
const userRouter = require('../routes/UserRouter');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/admin', adminRoute);
app.use('/api/user', userRouter);

module.exports = app;
