const fs = require("fs");
const path = require("path");
var express = require("express");
var bodyParser = require("body-parser");

const multer = require("multer");

const Participant = require("../models/participant");
const Winner = require("../models/winner");

var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var app = express();
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.json());

app.use(express.static("public"));
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

var participant_storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './data/invoices/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null,'Data'+ '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var participant_upload = multer({ //multer settings
                storage: participant_storage,
                fileFilter : function(req, file, callback) { //upload-class-file filter
                    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                        return callback(new Error('Wrong extension type'));
                    }
                    callback(null, true);
                }
            }).single('file');

exports.getparticipantUpload = (req,res,next) => {
    console.log("asdfghjkl")
}

/** API path that will upload the files */
exports.postparticipantUpload= (req, res, next) => {
    var exceltojson;
    participant_upload(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
        /** Multer gives us file info in req.file object */
        if(!req.file){
            res.json({error_code:1,err_desc:"No file passed"});
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders:true
            }, function(err,result){
                if(err) {
                    return res.json({error_code:1,err_desc:err, data: null});
                }
                res.json({error_code:0,err_desc:null, data: result});
                
                for(let i=0;i<result.length;i++){
                    
                    const data = {
                        email : result[i]['email'],
                        eventname : result[i]['eventname']
                    }
                   
               Participant.create(data).then((result) => {
                   res.redirect("/admin-panel")
               })
                    
                }
                
            });
        } catch (e){
            res.json({error_code:1,err_desc:"Corupted excel file"});
        }
    })
   
};

exports.getparticipantFile= (req, res, next) => {
   
    res.render("event/participantfile", {
        pageTitle: "Welcome",
        
    });

};

var winner_storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './data/invoices/')
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null,'Data'+ '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var winner_upload = multer({ //multer settings
                storage: winner_storage,
                fileFilter : function(req, file, callback) { //upload-class-file filter
                    if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                        return callback(new Error('Wrong extension type'));
                    }
                    callback(null, true);
                }
            }).single('file');

exports.getwinnerUpload = (req,res,next) => {
    console.log("asdfghjkl")
}

/** API path that will upload the files */
exports.postwinnerUpload= (req, res, next) => {
    var exceltojson;
    winner_upload(req,res,function(err){
        if(err){
             res.json({error_code:1,err_desc:err});
             return;
        }
        /** Multer gives us file info in req.file object */
        if(!req.file){
            res.json({error_code:1,err_desc:"No file passed"});
            return;
        }
        /** Check the extension of the incoming file and
         *  use the appropriate module
         */
        if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
            exceltojson = xlsxtojson;
        } else {
            exceltojson = xlstojson;
        }
        try {
            exceltojson({
                input: req.file.path,
                output: null, //since we don't need output.json
                lowerCaseHeaders:true
            }, function(err,result){
                if(err) {
                    return res.json({error_code:1,err_desc:err, data: null});
                }
                res.json({error_code:0,err_desc:null, data: result});
                
                for(let i=0;i<result.length;i++){
                    
                    const data = {
                        email : result[i]['email'],
                        eventname : result[i]['eventname'],
                        prize: result[i]['prize']
                    }
                   
               Winner.create(data).then((result) => {
                   res.redirect("/admin-panel")
               })
                    
                }
                
            });
        } catch (e){
            res.json({error_code:1,err_desc:"Corupted excel file"});
        }
    })
   
};

exports.getwinnerFile= (req, res, next) => {
   
    res.render("event/winnerfile", {
        pageTitle: "Welcome",
        
    });

};