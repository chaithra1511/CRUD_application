var express=require('express');
var app=express();

//bodyparser
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
//for mongodb
const MongoClient=require('mongodb').MongoClient;

//connecting server file for awt
let server=require('./server');
let config=require('./config');
let middleware=require('./middleware');
const response=require('express');
//database connection
const url='mongodb://127.0.0.1:27017';
const dbName='hospitalManagement';
let db

MongoClient.connect(url,{useUnifiedToology:true},(err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database:${url}`);
    console.log(`Database:${dbName}`);
});

//getting hospital details
app.get("/hospitalsdetails",middleware.checkToken,function(req,res){
    console.log("Fetching data from hospital collection");
    var data = db.collection('hospitalDetails').find().toArray()
         .then(result => res.send(result));
});

//getting ventilator details
app.get("/ventilatordetails",middleware.checkToken,function(req,res){
    console.log("Fetching data from ventilators collection");
    var data = db.collection('ventilatorsdetails').find().toArray()
         .then(result => res.send(result));
});

//searching ventilator by status
app.post('/searchventilatorbystatus',middleware.checkToken,(req,res)=>{
    var status=req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('ventilatorsdetails')
    .find({"status":status}).toArray().then(result=>res.json(result));
});

//searching ventilator by hospital name
app.post('/searchventilatorbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var ventilatordetails=db.collection('ventilatorsdetails')
    .find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

//search hospital by name
app.post('/searchhospitalbyname',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hospitaldetails=db.collection('hospitalDetails')
    .find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
});

//updating ventilator status
app.put('/updateventilator',middleware.checkToken,(req,res)=>{
    var ventid={ventilatorId:req.body.ventilatorId};
    console.log(ventid);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilatorsdetails").update(ventid,newvalues,function(err,result){
        res.json('1 document updated');
        if(err)throw err;
        //console.log("1 document updated");
    });
});


//adding ventilator
app.post('/addventilatorbyuser',middleware.checkToken,(req,res)=>{
    var hId=req.body.hId;
    var ventilatorId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    var item=
    {
        hId:hId,ventilatorId:ventilatorId,status:status,name:name
    };
    db.collection('ventilatorsdetails').insertOne(item,function(err,result){
        res.json('Item inserted');
    });
});

//deleting ventilator by ventilatorId
app.delete('/delete',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventilatorId;
    console.log(myquery);

    var myquery1={ventilatorId:myquery};
    db.collection('ventilatorsdetails').deleteOne(myquery1,function(err,obj)
    {
        if(err)throw err;
        res.json("1 document deleted");
    });

});
app.listen(3000);