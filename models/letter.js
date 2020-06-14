const mongoose = require('mongoose');

// Define Schemes
const letterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  completed: { type: String, default: false }
}, {
  timestamps: true
});

letterSchema.statics.create = function (payload) {
  // this === Model
  console.log(payload);
  const letter = new this(payload);
  // return Promise
  return letter.save();
};

// Find All
letterSchema.statics.findAll = function () {
  return this.find({});
};

// Find One by letterid
letterSchema.statics.findOneById = function (letterId) {
  return this.findOne({ _id: letterId });
};

// Update by letterid
letterSchema.statics.updateById = function (letterId, payload) {
  // { new: true }: return the modified document rather than the original. defaults to false
  return this.findOneAndUpdate({ _id: letterId }, payload, { new: true });
};

// Delete by letterid
letterSchema.statics.deleteById = function (letterId) {
  return this.remove({ _id: letterId });
};

// Create Model & Export
module.exports = mongoose.model('Letter', letterSchema);
