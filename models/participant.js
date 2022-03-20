const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  
  email: {
    type: String,
  },
  eventname: {
    type: String,
  },
  
  
 
});

module.exports = mongoose.model('Participant', productSchema);

