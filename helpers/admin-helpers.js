var db=require("../config/connection");
var collection=require("../config/collections");
var objectId = require('mongodb').ObjectID
const bcryptjs=require('bcryptjs');
const { response } = require("express");
const collections = require("../config/collections");
var objectId=require("mongodb").ObjectId;
const { ObjectId } = require("mongodb");

module.exports={
   
    doLogin:function(adminData){
        return new Promise(async function(resolve,reject){
            let loginStatus=false;
            let response={};
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if(admin){
                // bcryptjs.compare(adminData.Password,admin.Password).then((status)=>{
                //     if(status){
                        console.log("Login Success");
                        response.admin=admin;
                        response.status=true;
                        console.log("Responce contains: "+response);
                        resolve(response)
                //     }else{
                //         console.log("Login Failed");
                //         resolve({status:false})
                //     }
                // })

            }
            else{
                console.log("Login Failed user does not exist");
               resolve({status:false})
            }
        })
    },
    getUserOrders:(user)=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
            resolve(orders)
        })
    },
    getAllUsers:(user)=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find({}).toArray()
            resolve(users)
        })
    }
}