const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PortfolioSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 100,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
    },
  }
);

// Virtual for portfolio's URL
PortfolioSchema
.virtual('url')
.get(function () {
  return '/portfolio/' + this._id;
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
