const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    ticker: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 5,
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
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  }
);

// Virtual for transaction's total
TransactionSchema
.virtual('total')
.get(function () {
  return (this.type === 'Buy') ? this.avg_price * this.shares : -(this.avg_price * this.shares);
});

// Virtual for transaction's URL
TransactionSchema
.virtual('url')
.get(function () {
  return '/transaction/' + this._id;
});

module.exports = mongoose.model('Transaction', TransactionSchema);
