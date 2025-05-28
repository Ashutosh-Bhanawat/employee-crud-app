const fs = require('fs');
const path = require('path');
const Employee = require("../models/employee.model");

// CREATE
exports.createEmployee = async (req, res) => {
  try {
    const {
      fullName, email, phone, dob, gender,
      department, isActive, address
    } = req.body;

    let skills = req.body.skills;
    if (typeof skills === "string") skills = [skills];

    const resumeFile = req.files?.resume?.[0]?.filename || "";
    const profileImageFile = req.files?.profileImage?.[0]?.filename || "";
    const galleryImages = req.files?.galleryImages?.map(f => f.filename) || [];

    const newEmployee = new Employee({
      fullName,
      email,
      phone,
      dob,
      gender,
      skills,
      department,
      resume: resumeFile,
      profileImage: profileImageFile,
      galleryImages, 
      isActive: isActive === "true" || isActive === true,
      address,
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: "Profile created successfully"
    });
  } catch (error) {
    console.error("Create Employee Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// UPDATE
exports.updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const {
      fullName, email, phone, dob, gender,
      department, isActive, address,
      existingImages = [],
      removedImages = []
    } = req.body;

    let skills = req.body.skills;
    if (typeof skills === "string") skills = [skills];

    const updateData = {
      fullName,
      email,
      phone,
      dob,
      gender,
      skills,
      department,
      isActive: isActive === "true" || isActive === true,
      address
    };

    // Resume/Profile update
    if (req.files?.resume) {
      updateData.resume = req.files.resume[0].filename;
    }

    if (req.files?.profileImage) {
      updateData.profileImage = req.files.profileImage[0].filename;
    }

    // Handle gallery updates
    const retained = Array.isArray(existingImages) ? existingImages : [existingImages];
    const removed = Array.isArray(removedImages) ? removedImages : [removedImages];
    const newGalleryImages = req.files?.newGalleryImages?.map(f => f.filename) || [];

    // Delete removed images from server
    removed.forEach(img => {
      const filePath = path.join(__dirname, '../uploads/', path.basename(img));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Final gallery list
    updateData.galleryImages = [...retained, ...newGalleryImages];

    const updated = await Employee.findByIdAndUpdate(employeeId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({ success: true, message: "Profile updated", data: updated });
  } catch (error) {
    console.error("Update Employee Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
