const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  
  eventname: {
    type: String,
  },
  name: {
    type: String,
  },
   regno: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
  },
  dept: {
    type: String,
  },
  year: {
    type: Number,
  },
  section: {
    type: String,
  },

  
 
});

module.exports = mongoose.model('Register', productSchema);

