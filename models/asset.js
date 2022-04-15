const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssetSchema = new Schema(
  {
    ticker: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 5,
      unique: true,
    },
  }
);

// Virtual for asset's URL
AssetSchema
.virtual('url')
.get(function () {
  return '/asset/' + this.ticker;
});

module.exports = mongoose.model('Asset', AssetSchema);
