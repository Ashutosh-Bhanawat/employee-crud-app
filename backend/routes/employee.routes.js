const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Employee = require("../models/employee.model");

const router = express.Router();


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


router.post(
  '/',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        dob,
        gender,
        skills,
        department,
        isActive,
        address
      } = req.body;

      const employee = new Employee({
        fullName,
        email,
        phone,
        dob,
        gender,
        skills: Array.isArray(skills) ? skills : [skills],
        department,
        isActive: isActive === 'true' || isActive === true,
        address,
        resume: req.files?.resume?.[0]?.filename || null,
        profileImage: req.files?.profileImage?.[0]?.filename || null,
        galleryImages: req.files?.galleryImages?.map(file => file.filename) || []
      });

      await employee.save();
      res.status(201).json(employee);
    } catch (err) {
      console.error('Error saving employee:', err);
      res.status(500).json({ error: 'Server error while saving employee' });
    }
  }
);


router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/:id', async (req, res) => {
  const id = req.params.id;
  const employee = await Employee.findById(id);
  if (!employee) return res.status(404).send('Employee not found');
  res.json(employee);
});


router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Employee.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.put(
  '/:id',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 },
    { name: 'newGalleryImages', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const {
        fullName,
        email,
        phone,
        dob,
        gender,
        skills,
        department,
        isActive,
        address,
        existingImages = [],
        removedImages = []
      } = req.body;

      const updateData = {
        fullName,
        email,
        phone,
        dob,
        gender,
        skills: Array.isArray(skills) ? skills : [skills],
        department,
        isActive: isActive === 'true' || isActive === true,
        address
      };

      
      if (req.files?.resume) {
        updateData.resume = req.files.resume[0].filename;
      }
      if (req.files?.profileImage) {
        updateData.profileImage = req.files.profileImage[0].filename;
      }

      
      const existing = Array.isArray(existingImages) ? existingImages : [existingImages];
      const toRemove = Array.isArray(removedImages) ? removedImages : [removedImages];
      const newGallery = req.files?.newGalleryImages?.map(file => file.filename) || [];

      
      toRemove.forEach(img => {
        const filePath = path.join(__dirname, '../uploads/', path.basename(img));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      
      updateData.galleryImages = [...existing, ...newGallery];

      const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updatedEmployee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.status(200).json(updatedEmployee);
    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);




module.exports = router;
