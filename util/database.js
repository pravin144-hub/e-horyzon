// const mongodb = require("mongodb");
// const MongoClient = mongodb.MongoClient;

// const mongoConnect = (callback) => {
//     MongoClient.connect(
//             "mongodb+srv://ravib_05:ravichandran@cluster0.pgad7.mongodb.net/node_practice?retryWrites=true&w=majority"
//         )
//         .then((result) => {
//             console.log(result);
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// };

// module.exports = mongoConnect;

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoClient.connect(
            "mongodb+srv://ravib_05:ravichandran@cluster0.pgad7.mongodb.net/node_practice?retryWrites=true&w=majority"
        )
        .then((client) => {
            console.log("Connected!");
            _db = client.db();
            callback();
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;