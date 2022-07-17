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
     const url='mongodb+srv://sangeetha:PF9EugZe9cQK2GEN@cluster0.cxlnuak.mongodb.net/?retryWrites=true&w=majority'
    
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
