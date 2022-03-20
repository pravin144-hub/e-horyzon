const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  
  officialBody: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  startdate: {
    type: String,
    required: true
  },
  enddate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  co_name1: {
    type: String,
    required: true
  },
  co_mobile1: {
    type: Number,
    required: true
  },
  co_name2: {
    type: String,
    required: true
  },
  co_mobile2: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    
  },
  description: {
    type: String,
    required: true
  },
 
});

module.exports = mongoose.model('Events', productSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       // Update the product
//       dbOp = db
//         .collection('products')
//         .updateOne({ _id: this._id }, { $set: this });
//     } else {
//       dbOp = db.collection('products').insertOne(this);
//     }
//     return dbOp
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         console.log(products);
//         return products;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next()
//       .then(product => {
//         console.log(product);
//         return product;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static deleteById(prodId) {
//     const db = getDb();
//     return db
//       .collection('products')
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then(result => {
//         console.log('Deleted');
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }
// }

// module.exports = Product;
