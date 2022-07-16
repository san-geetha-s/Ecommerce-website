var express = require('express');
const{render,route}=require("../app")
const hbs = require('express-handlebars')
const fileUpload = require('express-fileupload')
const path = require('path')
const app = express();
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const productHelper = require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
const adminHelpers=require('../helpers/admin-helpers')
const multer = require('multer');
const { response } = require('express');
const { resourceUsage } = require('process');
const e = require('express');
const verifyALogin=function(req,res,next){
  if(req.session.admin){
    next()
  }else{
    res.redirect("/adminLogin")
  }
}

/* GET users listing. */












router.get('/',verifyALogin,function(req, res, next) {
  let admin=req.session.admin
  productHelpers.getAllproducts().then(function(products){
    console.log(products);
    
    res.render('admin/view-products',{admin:true,products,admin})
  })
  
});

router.get("/add-product",verifyALogin,function(req,res,next){
  res.render('admin/add-product',{admin:true})
})

router.post("/add-product",function(req,res){
  console.log(req.body);
  console.log("Price is in string or not "+(req.body.Price));
  req.body.Price=parseInt(req.body.Price)

  productHelpers.addProduct(req.body,function(id){
    let image=req.files.Image;
    console.log(id);
    image.mv('./public/product-images/'+id+'.jpg',function(err,done){
      if(!err){
        res.render('admin/add-product',{admin:true})
      }
      else{
        console.log(err);
      }
    })
    
  })
})


router.get("/delete-product/:id",function(req,res){
  let proId=req.params.id
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
})

router.get("/edit-product/:id",verifyALogin,async function(req,res,next){
  let product=await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{admin:true,product})
})

router.post("/edit-product/:id",function(req,res){
  let id=req.params.id
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect("/admin")
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
     
    }
  })
})


router.get('/adminLogin',function(req,res){
  if(req.session.admin){
    res.redirect("/")
  }
  else{
    res.render("admin/login",{"loginErr":req.session.adminLoginErr})
    req.session.adminLoginErr=false
  }
 
})


router.post('/adminLogin',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
      console.log("Admin in successfully loged in>>>>>>>>>>><<<<<<<<<<");
      req.session.admin=response.admin
      req.session.admin.loggedIn=true
      res.redirect('/admin')
    }
    else{
      req.session.adminLoginErr=true
      res.redirect('/admin/adminLogin') 
    }
  })
})

router.get("/adminLogout",function(req,res){
  req.session.admin=null
  res.redirect("/admin/adminLogin")
})

router.get("/allOrders",verifyALogin,async function(req,res){
  let orders = await adminHelpers.getUserOrders(req.session)
  res.render("admin/all-orders",{admin:req.session.admin, orders})
})

router.get("/allUsers",verifyALogin,async (req,res)=>{
  let users=await adminHelpers.getAllUsers(req.session)
  res.render("admin/all-users",{admin:true,users})
})


module.exports = router;