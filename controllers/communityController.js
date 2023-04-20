import express from "express";
const router = express.Router();
import Community from "../models/Community.js";
import Member from "../models/Member.js";
import { Snowflake } from "@theinternetfolks/snowflake";
import verifyToken from "../middleware/verify.js";
import User from "../models/User.js";
import slug from "slug";
import Role from "../models/Role.js";

const getCommunity = async(req,res)=>{
    const communities = await Community.aggregate([
        {
            $lookup: {
                localField: 'owner',
                foreignField: 'id',
                from: 'users',
                as: 'owner'
            }
        },
        { $unwind: '$owner' },
        {
            $project: {
                "owner.id": 1,
                "owner.name": 1,
                "_id": 0,
                "id": 1,
                "name": 1,
                "slug": 1,
                "createdAt": 1,
                "updatedAt": 1,
            }
        }
    ]);

    // console.log(communities);

    return res.status(200).json({
        "status": true,
        "content": {
            "meta": {
                "total": 3,
                "pages": 1,
                "page": 1
            },
            "data": communities
        }
    })
}

const getCommunityWithPage = async(req,res)=>{
    const p = req.params.page;
    const communities = await Community.aggregate([
        {
            $lookup: {
                localField: 'owner',
                foreignField: 'id',
                from: 'users',
                as: 'owner'
            }
        },
        { $unwind: '$owner' },
        {
            $project: {
                "owner.id": 1,
                "owner.name": 1,
                "_id": 0,
                "id": 1,
                "name": 1,
                "slug": 1,
                "createdAt": 1,
                "updatedAt": 1,
            }
        }
    ]);

    const len = communities.length;
    const perPage = 1;

    let obj = {}
    for (let i = 0; i < communities.length; i += perPage) {
        const page = communities.slice(i, i + perPage);
        obj[i] = page;
    }

    // console.log(communities);

    return res.status(200).json({
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": p-'0' || 1
            },
            "data": obj[p-1]
        }
    })
}

const getMember = async(req,res)=>{
    const id = req.params.id;

    const communityMembers = await Member.aggregate([
        {
            $match: {
                $and: [{ 'community': id }]
            }
        },
        {
            $lookup: {
                localField: 'user',
                foreignField: 'id',
                from: 'users',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $lookup: {
                localField: 'role',
                foreignField: 'id',
                from: 'roles',
                as: 'role'
            }
        },
        { $unwind: '$role' },
        {
            $project: {
                "user.id": 1,
                "user.name": 1,
                "role.id": 1,
                "role.name": 1,
                "_id": 0,
                "id": 1,
                "name": 1,
                "slug": 1,
                "createdAt": 1,
                "community": 1,
            }
        }
    ]);

    const len = communityMembers.length;
    const perPage = len;

    return res.status(200).json({
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": 1
            },
            "data": communityMembers
        }
    })
}

const getMemberWithPage = async(req,res)=>{
    const id = req.params.id;
    const p = req.params.page;

    const communityMembers = await Member.aggregate([
        {
            $match: {
                $and: [{ 'community': id }]
            }
        },
        {
            $lookup: {
                localField: 'user',
                foreignField: 'id',
                from: 'users',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $lookup: {
                localField: 'role',
                foreignField: 'id',
                from: 'roles',
                as: 'role'
            }
        },
        { $unwind: '$role' },
        {
            $project: {
                "user.id": 1,
                "user.name": 1,
                "role.id": 1,
                "role.name": 1,
                "_id": 0,
                "id": 1,
                "name": 1,
                "slug": 1,
                "createdAt": 1,
                "community": 1,
            }
        }
    ]);

    const len = communityMembers.length;
    const perPage = 1;

    let obj = {}
    for (let i = 0; i < communityMembers.length; i += perPage) {
        const page = communityMembers.slice(i, i + perPage);
        obj[i] = page;
    }

    return res.status(200).json({
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": p-'0' || 1
            },
            "data": obj[p-1]
        }
    })
}

const getCommunityOwned = async(req,res)=>{
    const communityOwner = await Community.find({ owner: req.user_id }).select(['-_id', '-__v']);

    const len = communityOwner.length;  
    const perPage = len;

    return res.status(200).json({
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": 1
            },
            "data": communityOwner
        }
    })
}

const getCommunityOwnedWithPage = async(req,res)=>{
    const p = req.params.page;
    const communityOwner = await Community.find({ owner: req.user_id }).select(['-_id', '-__v']);

    const len = communityOwner.length;  
    const perPage = 1;

    let obj = {}
    for (let i = 0; i < communityOwner.length; i += perPage) {
        const page = communityOwner.slice(i, i + perPage);
        obj[i] = page;
    }

    return res.status(200).json({
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": p-'0' || 1
            },
            "data": obj[p-1]
        }
    })
}

const getCommunityMember = async(req,res)=>{
    const communityList = await Member.aggregate([
        {
            $match: {
                $and: [{ 'user': req.user_id }]
            }
        },
        {
            $lookup: {
                localField: 'community',
                foreignField: 'id',
                from: 'communities',
                as: 'communities'
            }
        },
        { $unwind: '$communities' },
        {
            $lookup: {
                localField: 'communities.owner',
                foreignField: 'id',
                from: 'users',
                as: 'owner'
            }
        },
        { $unwind: '$owner' },
        {
            $project: {
                "owner.id": 1,
                "owner.name": 1,
                "_id": 0,
                "communities.id": 1,
                "communities.name": 1,
                "communities.slug": 1,
                "communities.createdAt": 1,
                "communities.updatedAt": 1,
            }
        }
    ])

    let returnObj = [];
    returnObj = communityList.map((community) => {
        const temp = community.communities;
        return { ...temp, owner: community.owner }
    })

    const len = returnObj.length;  
    const perPage = len;

    return res.status(200).json({
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": 1
            },
            "data": returnObj
        }
    })
}

const getCommunityMemberWithPage = async(req,res)=>{
    const p = req.params.page;
    const communityList = await Member.aggregate([
        {
            $match: {
                $and: [{ 'user': req.user_id }]
            }
        },
        {
            $lookup: {
                localField: 'community',
                foreignField: 'id',
                from: 'communities',
                as: 'communities'
            }
        },
        { $unwind: '$communities' },
        {
            $lookup: {
                localField: 'communities.owner',
                foreignField: 'id',
                from: 'users',
                as: 'owner'
            }
        },
        { $unwind: '$owner' },
        {
            $project: {
                "owner.id": 1,
                "owner.name": 1,
                "_id": 0,
                "communities.id": 1,
                "communities.name": 1,
                "communities.slug": 1,
                "communities.createdAt": 1,
                "communities.updatedAt": 1,
            }
        }
    ])

    let returnObj = [];
    returnObj = communityList.map((community) => {
        const temp = community.communities;
        return { ...temp, owner: community.owner }
    })

    const len = returnObj.length;  
    const perPage = 1;

    let obj = {}
    for (let i = 0; i < returnObj.length; i += perPage) {
        const page = returnObj.slice(i, i + perPage);
        obj[i] = page;
    }

    return res.status(200).json({
        "status": true,
        "content": {
            "meta": {
                "total": len,
                "pages": Math.ceil(len / perPage),
                "page": p-'0' || 1
            },
            "data": obj[p-1]
        }
    })
}

const postCommunity = async(req,res)=>{
    const { name } = req.body;
    const slugName = slug(name);
    const snow_id_commmunity = Snowflake.generate({ timestamp: new Date() });
    const snow_id_member = Snowflake.generate({ timestamp: new Date() });
    const snow_id_role = Snowflake.generate({ timestamp: new Date() });

    const user = await User.findOne({ email: req.user });
    const exists = await Community.findOne({ slug: slugName });

    if (exists) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "name",
                    "message": "Name should be unique! ",
                    "code": "INVALID_INPUT"
                }
            ]
        })
    }

    if (!(name.length >= 2)) {
        return res.status(400).json({
            "status": false,
            "errors": [
                {
                    "param": "name",
                    "message": "Name should be at least 2 characters.",
                    "code": "INVALID_INPUT"
                }
            ]
        })
    }

    const newCommunity = new Community({
        id: snow_id_commmunity,
        name: name,
        owner: user.id,
        slug: slugName,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    await newCommunity.save();

    const newMember = new Member({
        community: snow_id_commmunity,
        id: snow_id_member,
        role: snow_id_role,
        user: user.id,
        createdAt: new Date()
    })

    await newMember.save();

    
    const role = await Role.findOne({name: 'Community Admin'});
    if(!role) {
        const newRole = new Role({
            id: snow_id_role,
            name: 'Community Admin',
            createdAt: new Date(),
            updatedAt: new Date()
        })
    
        await newRole.save();
    }
    else {
        role.updatedAt = new Date();
        await role.save();
    }

    return res.status(201).json({
        "status": true,
        "content": {
            "data": newCommunity
        }
    })
}

export default {postCommunity, getCommunity, getCommunityWithPage, getCommunityMember, getCommunityMemberWithPage, getCommunityOwned, getCommunityOwnedWithPage, getMember, getMemberWithPage}