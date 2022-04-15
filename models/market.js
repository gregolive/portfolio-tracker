const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MarketSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 100,
      unique: true,
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
  }
);

// Virtual for asset's URL
MarketSchema
.virtual('url')
.get(function () {
  return '/market/' + this.name;
});

module.exports = mongoose.model('Market', MarketSchema);