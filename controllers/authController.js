import express from "express";
import User from "../models/User.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const getMe = async(req,res)=>{
    const user = await User.findOne({ email: req.user }).select(['-_id', '-__v', '-password']);

    return res.status(200).json({
        "status": true,
        "content": {
            "data": user
        }
    })
}

const signIn = async(req,res)=>{
    const { email, password } = req.body;

    let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

    if (!email.match(emailRegex)) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "email",
                    "message": "Please provide a valid email address.",
                    "code": "INVALID_INPUT"
                }
            ]
        })
    }

    const exists = await User.findOne({ email: email }).select(['-_id', '-__v']);

    if (exists) {
        const checkPassword = await bcrypt.compare(password, exists.password);

        if (!checkPassword) {
            return res.status(400).json({
                "status": false,
                "errors": [
                    {
                        "param": "password",
                        "message": "The credentials you provided are invalid.",
                        "code": "INVALID_CREDENTIALS"
                    }
                ]
            })
        }

        const access_token = jwt.sign(
            {
                "user": {
                    "email": exists.email,
                    "id": exists.id
                }
            },
            `${process.env.ACCESS_TOKEN_SECRET}`,
            { expiresIn: '10m' }
        );

        var data = Object.assign({}, exists)._doc;
        delete data.password;

        return res.status(200).json({
            "status": true,
            "content": {
                "data": data,
                "meta": {
                    "access_token": access_token,
                }
            }
        })
    }
}

const signup = async(req,res)=>{
    console.log('inside', Snowflake.generate());
    const { name, email, password } = req.body;

    let emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

    if (!email.match(emailRegex)) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "email",
                    "message": "Email should be a valid one!",
                    "code": "INVALID_INPUT"
                }
            ]
        })
    }

    if (!(name.length >= 2 && password.length >= 6)) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "name",
                    "message": "Name should be at least 2 characters.",
                    "code": "INVALID_INPUT"
                },
                {
                    "param": "password",
                    "message": "Password should be at least 6 characters.",
                    "code": "INVALID_INPUT"
                }
            ]
        })
    }

    const exists = await User.findOne({ email: email });

    if (exists) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "email",
                    "message": "User with this email address already exists!",
                    "code": "RESOURCE_EXISTS"
                }
            ]
        })
    }

    const snow_id = Snowflake.generate({ timestamp: new Date() });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newObj = {
        id: snow_id,
        name: name,
        email: email,
        password: hashedPassword,
        createdAt: new Date()
    };

    const newUser = new User(newObj)

    await newUser.save();

    const access_token = jwt.sign(
        {
            "user": {
                "email": newUser.email,
                "id": newObj.id
            }
        },
        `${process.env.ACCESS_TOKEN_SECRET}`,
        { expiresIn: '10m' }
    );


    const { "password": _, ...data } = newObj;

    return res.status(201).json({
        "status": true,
        "content": {
            "data": data,
            "meta": {
                "access_token": access_token,
            }
        }
    })
}

export default {getMe, signIn, signup}