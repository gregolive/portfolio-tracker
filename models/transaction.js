const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    shares: {
      type: Number,
      required: true,
    },
    avg_price: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Buy', 'Sell'],
      default: 'Buy',
    },
    portfolio: {
      type: Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
    },
  }
);

// Virtual for transaction's total
TransactionSchema
.virtual('total')
.get(function () {
  return this.price * this.price;
});

// Virtual for transaction's URL
TransactionSchema
.virtual('url')
.get(function () {
  return '/transaction/' + this._id;
});

module.exports = mongoose.model('Transaction', TransactionSchema);
