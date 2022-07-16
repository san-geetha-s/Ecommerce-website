require('dotenv').config()
const mongoClient=require('mongodb').MongoClient

const state={
    db:null
}

module.exports.connect=function(done){
//     const url=`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.qvpmm.mongodb.net/shopping?retryWrites=true&w=majority`
//    const url=' mongodb+srv://sangeetha:<password>@cluster0.cxlnuak.mongodb.net/?retryWrites=true&w=majority'
    const url = 'mongodb://localhost:27017';
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
