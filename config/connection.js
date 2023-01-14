require('dotenv').config()
const mongoClient=require('mongodb').MongoClient

const state={
    db:null
}

module.exports.connect=function(done){
//     const url=`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.qvpmm.mongodb.net/shopping?retryWrites=true&w=majority`
//    const url=' mongodb+srv://sangeetha:Q1hxvgIoeIKcuW7s@cluster0.cxlnuak.mongodb.net/shopping?retryWrites=true&w=majority'
//     const url = 'mongodb://0.0.0.0:27017';
//    const url= ' mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb'
     const url='mongodb+srv://sangeetha:KXwcrWJyEnL5SPUT@cluster0.cxlnuak.mongodb.net/shopping'
//      const url='mongodb://sangeetha:PF9EugZe9cQK2GEN@ac-ifhjpis-shard-00-00.cxlnuak.mongodb.net:27017,ac-ifhjpis-shard-00-01.cxlnuak.mongodb.net:27017,ac-ifhjpis-shard-00-02.cxlnuak.mongodb.net:27017/?ssl=true&replicaSet=atlas-knmzzh-shard-0&authSource=admin&retryWrites=true&w=majority'
//     const url= 'mongodb://localhost:27017';
   
    
    const dbname='shopping'


    mongoClient.connect(url,function(err,data){
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })

    
}

module.exports.get=function(){
    return state.db
}
