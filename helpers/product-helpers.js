var db = require('../config/connection')
var collection=require('../config/collections')
const bcryptjs = require('bcryptjs')
const { response } = require('express')
// const { CART_COLLECTION } = require('../config/collections')
// const { Collection } = require('mongoose')
var objectId=require('mongodb').ObjectId
const Razorpay=require('razorpay')
const { realpathSync } = require('fs')
const { resolve } = require('path')
const { ObjectID, ObjectId } = require('bson')
// const{ObjectID}=require("mongodb")
// const collection=require('../config/collections')
// var objectId = require('mongodb').ObjectID

module.exports={
    addProduct:function(product,callback){
        console.log(product);
        db.get().collection('product').insertOne(product).then(function(data){
            callback(data.insertedId)
        })
    },
    getAllproducts:function(){
        return new Promise(async function(resolve,reject){
            let products=await  db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:function(proId){
        return new Promise(function(resolve,reject){
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then(function(response){
                // console.log(response);
                resolve(response)
            })
        })
    },
    getProductDetails:function(proId){
        return new Promise(function(resolve,reject){
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:function(proId,proDetails){
        return new Promise((function(resolve,reject){
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Category:proDetails.Category,
                    Price:proDetails.Price
                }
            }).then((response)=>{
                resolve()
            })
        }))
    }
}