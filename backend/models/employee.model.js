const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  skills: [{ type: String }],
  department: { type: String, required: true },
  resume: { type: String },
  profileImage: { type: String, },
  galleryImages: [ {type: String} ],
  isActive: { type: Boolean, default: false },
  address: { type: String , required : true},
});

module.exports = mongoose.model('Employee', employeeSchema);
