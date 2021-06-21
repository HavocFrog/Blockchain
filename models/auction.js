const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  rate:{
    type: String,
    required: true
  },
  energy:{
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Auction = mongoose.model('Auction', AuctionSchema);

module.exports = Auction;
