const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  
  email: {
    type: String,
  },
  eventname: {
    type: String,
  },
 
  prize:{
      type:Number,
  }
  
 
});

module.exports = mongoose.model('Winner', productSchema);

