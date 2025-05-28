const express = require('express');
const app = express();
const employeeRoutes = require('./routes/employee.routes');
const cors = require('cors');
const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/employees', employeeRoutes);

module.exports = app;
