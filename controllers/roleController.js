import express from "express";
const router = express.Router();
import Role from "../models/Role.js";
import { Snowflake } from "@theinternetfolks/snowflake";

const getRoles = async(req,res)=>{
    const roles = await Role.find().select(['-_id', '-__v']);

    const len = roles.length;
    const perPage = 1;

    const returnobj = {
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": 1
            },
            "data": roles
        }
    }

    res.json(returnobj).status(200);
}

const getRolesWithPage = async(req,res)=>{
    const p = req.params.page;
    let roles = await Role.find().select(['-_id', '-__v']);
    const len = roles.length;
    const perPage = 1;

    let obj = {}
    for (let i = 0; i < roles.length; i += perPage) {
        const page = roles.slice(i, i + perPage);
        obj[i] = page;
    }

    const returnobj = {
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": p-'0' || 1
            },
            "data": obj[p-1]
        }
    }

    res.json(returnobj).status(200);
}

const postRoles = async(req,res)=>{
    console.log('inside', Snowflake.generate());
    const { name } = req.body;

    if (name.length < 2) {
        return res.json({
            "status": false,
            "errors": [
                {
                    "param": "name",
                    "message": "Name should be at least 2 characters.",
                    "code": "INVALID_INPUT"
                }
            ]
        }).status(401);
    }

    const snow_id = Snowflake.generate({ timestamp: new Date() });

    const newObj = {
        name: name,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: snow_id
    }

    const newRole = new Role(newObj)

    await newRole.save();

    return res.json({
        "status": true,
        "content": {
            "data": newObj
        }
    }).status(201);
}

export default {getRoles, getRolesWithPage, postRoles};