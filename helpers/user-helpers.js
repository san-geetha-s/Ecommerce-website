var db = require('../config/connection')
var collection = require('../config/collections')
const bcryptjs = require('bcryptjs')
const { response } = require('express')
const { CART_COLLECTION } = require('../config/collections')
// const { Collection } = require('mongoose')
var objectId=require('mongodb').ObjectId
const Razorpay=require('razorpay')
const { realpathSync } = require('fs')
const { resolve } = require('path')
const { ObjectID, ObjectId } = require('bson')
var instance = new Razorpay({
     key_id: 'rzp_test_mGdcASfZgLyGXd',
      
     key_secret: 'f3Qm5X4bBZOfCSCvnqsPvfVu' 
    })

module.exports={
    doSignup:function(userData){
        return new Promise(async function(resolve,reject){
            userData.Password=await bcryptjs.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
              resolve(data.insertedId)  
            })

        })
       
    },
    doLogin:function(userData){
        return new Promise(async function(resolve,reject){
            let loginStatus=false;
            let response={};
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user){
                bcryptjs.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("Login Success");
                        response.user=user;
                        response.status=true;
                        console.log("Responce contains: "+response);
                        resolve(response)
                    }else{
                        console.log("Login Failed");
                        resolve({status:false})
                    }
                })
            }
            else{
                console.log("Login Failed user does not exist");
               resolve({status:false})
            }
        })
    },
    addToCart:(proId,userId)=>{
        let proObj={
            item:ObjectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=>product.item==proId)
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId),'products.item':ObjectId(proId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({user:ObjectId(userId)},
                {
                    
                        $push:{products:proObj}
                   
                }
                ).then((response)=>{
                 resolve()
                })
                }
            }
            else{
                let cartObj={
                    user:ObjectId(userId),
                    products:[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartProducts:(userId)=>{
         return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },

                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:"product"
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }

            ]).toArray()
            resolve(cartItems)
         })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart)},
                {
                    $pull:{products:{item:ObjectId(details.product)}}
                }
                ).then((response)=>{
                    resolve({removeProduct:true})
                })
                
            }else{
                db.get().collection(collection.CART_COLLECTION).updateOne({_id:ObjectId(details.cart),'products.item':ObjectId(details.product)},
                    {
                        $inc:{'products.$.quantity':details.count}
                    }
                    ).then((response)=>{
                        resolve({status:true})
                    })
            
            }
            
        })
    },
    getTotalAmount:(userId)=>{

        return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
               { $match:{user:ObjectId(userId)}},

               {
                   $unwind:'$products'
               },
               {
                   $project:{
                       item:'$products.item',
                       quantity:'$products.quantity',
                   }
                  },
                
                   
                      { $lookup:{
                           from:collection.PRODUCT_COLLECTION,
                           localField:'item',
                           foreignField:'_id',
                           as:'product'
                           }
                        
                   },
                   {
                       $project:{
                           item:1,quantity:1,product:{ $arrayElemAt:['$product',0]}
                       }
                   },
                   {
                       $group:{
                           _id:null,
                           total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                       }
                   }
                  
                  
              
            ]).toArray()
            console.log("total-------------"+total[0].total)
            resolve(total[0].total)
        })
    },
    placeOrder:(order,products,total)=>{
        return new Promise((resolve,response)=>{
            console.log(order,products,total);
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:ObjectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:total,
                status:status,
                date:new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:ObjectId(order.userId)})
                resolve(response.insertedId)
            })
        })
    },
    getCartProductList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            console.log("Products================="+cart.products);
            resolve(cart.products)
        })
    },
    getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userId)}).toArray()
            resolve(orders)
        })
    },
    getOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(orderId)}
                },

                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:"product"
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                }

            ]).toArray()
            console.log("<<<<<<<<<<<<<"+orderItems);
            resolve(orderItems)
         })
    },
    getProduct:(proId)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({'_id':ObjectId(proId)})
         resolve(product)
        })
    },
    



























    generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
           var options = {
               amount: total*100,  // amount in the smallest currency unit
               currency: "INR",
               receipt:""+orderId
             };
             instance.orders.create(options, function(err, order) {
                console.log("New Order:",order);
               resolve(order)
             });
        })
    },

    verifyPayment:(details)=>{
        return new Promise(async(resolve,reject)=>{
            const {
                createHmac
              } = await import('node:crypto');
           
           let hmac=createHmac('sha256', 'f3Qm5X4bBZOfCSCvnqsPvfVu')
           hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
           hmac=hmac.digest('hex')
           if(hmac===details['payment[razorpay_signature']){
               resolve()
           }
           else
           {
               reject()
           }


        })
       

    },
    changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
            {
                $set:{
                    status:'placed'
                }
            }
            
            ).then(()=>{
                resolve()
            })
        })
    }
}
