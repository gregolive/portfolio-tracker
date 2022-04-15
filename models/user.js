const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: 5,
      maxLength: 40,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
  }
);

// Virtual for user's handle
UserSchema
.virtual('handle')
.get(function () {
  return '@' + this.username;
});

// Virtual for user's URL
UserSchema
.virtual('url')
.get(function () {
  return '/user/' + this.username;
});

module.exports = mongoose.model('User', UserSchema);
