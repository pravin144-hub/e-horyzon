const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  
  
 
});

module.exports = mongoose.model('Admin', productSchema);

