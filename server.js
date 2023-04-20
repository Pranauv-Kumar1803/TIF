import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import roleRouter from './routes/roleRouter.js';
import memberRouter from './routes/memberRouter.js';
import authRouter from './routes/authRouter.js';
import communityRouter from './routes/communityRouter.js';

const app = express();

// middleware
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true}));

// routes
app.use('/v1/role',roleRouter);
app.use('/v1/member',memberRouter);
app.use('/v1/auth',authRouter);
app.use('/v1/community',communityRouter);

// main
app.get('/',(req,res)=>{
    res.send('hello there!');
})

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.r1pjs.mongodb.net/?retryWrites=true&w=majority`).then(()=>{
    app.listen(5500,()=>{
        console.log('database connected and server started in port 5500');
    })
})
