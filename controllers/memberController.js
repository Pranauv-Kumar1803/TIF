import express from "express";
import Community from "../models/Community.js";
import Member from "../models/Member.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import User from "../models/User.js";
import slug from "slug";
import Role from "../models/Role.js";


const postMember = async(req,res)=>{
    const { community, user, role } = req.body;

    const members = await Member.findOne({ user: user, community: community });

    if (members) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "message": "User is already added in the community.",
                    "code": "RESOURCE_EXISTS"
                }
            ]
        })
    }

    const existsCommunity = await Community.findOne({ id: community });

    if (!existsCommunity) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "community",
                    "message": "Community not found.",
                    "code": "RESOURCE_NOT_FOUND"
                }
            ]
        })
    }
    else {
        if (req.user_id !== existsCommunity.owner) {
            return res.status(400).json({
                "status": false,
                "errors": [
                    {
                        "message": "You are not authorized to perform this action.",
                        "code": "NOT_ALLOWED_ACCESS"
                    }
                ]
            })
        }
    }

    const existsUser = await User.findOne({ id: user });

    if (!existsUser) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "user",
                    "message": "User not found.",
                    "code": "RESOURCE_NOT_FOUND"
                }
            ]
        })
    }

    const existsRole = await Role.findOne({ id: role });

    if (!existsRole) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "role",
                    "message": "Role not found.",
                    "code": "RESOURCE_NOT_FOUND"
                }
            ]
        })
    }

    const snow_id = Snowflake.generate({ timestamp: new Date() });
    const obj = {
        id: snow_id,
        community: community,
        role: role,
        user: user,
        createdAt: new Date()
    }
    const newMember = new Member(obj);

    await newMember.save();

    return res.status(201).json({
        "status": true,
        "content": {
            "data": obj
        }
    })
}

const deleteMember = async(req,res)=>{
    const id = req.params.id;

    const member = await Member.aggregate([
        {
            $match: {
                $and: [{ 'user': req.user_id }]
            }
        },
        {
            $lookup: {
                localField: 'role',
                foreignField: 'id',
                from: 'roles',
                as: 'role'
            }
        },
        { $unwind: '$role' }
    ])

    if (!(member[0].role.name === 'Community Admin' || member[0].role.name === 'Community Moderator')) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "message": "You are not authorized to perform this action.",
                    "code": "NOT_ALLOWED_ACCESS"
                }
            ]
        })
    }

    const community = member[0].community;

    const memberToDelete = await Member.findOne({ id: id });

    if (!memberToDelete) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "message": "Member not found.",
                    "code": "RESOURCE_NOT_FOUND"
                }
            ]
        })
    }

    if (memberToDelete.community !== community) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "message": "Community not the same.",
                    "code": "DIFFERENT_COMMUNITY"
                }
            ]
        })
    }

    const del = await Member.findOneAndDelete({ id: id });

    return res.status(200).json({
        "status": true
    })
}

export default {postMember, deleteMember};