const bcrypt = require('bcryptjs');
const db = require('../utils/db');

exports.register = async (req, res) => {
  const {
    firstName, lastName, street, city,
    emailAdress, password, phoneNumber, roles
  } = req.body;

  // Basic validation
  if (!firstName || !lastName || !emailAdress || !password || !street || !city) {
    return res.status(400).json({
      status: 400,
      message: 'Missing required fields',
      data: {}
    });
  }

  try {
    // Check if user already exists
    const [existing] = await db.execute(
      'SELECT * FROM `user` WHERE emailAdress = ?',
      [emailAdress]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        status: 409,
        message: 'Email already in use',
        data: {}
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.execute(
      `INSERT INTO user 
        (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        1, // isActive
        emailAdress,
        hashedPassword,
        phoneNumber || '-',
        roles || 'editor,guest',
        street,
        city
      ]
    );

    // Build response object
    const newUser = {
      id: result.insertId,
      firstName,
      lastName,
      isActive: 1,
      emailAdress,
      phoneNumber: phoneNumber || '-',
      roles: roles || 'editor,guest',
      street,
      city
    };

    return res.status(201).json({
      status: 201,
      message: 'User successfully registered',
      data: newUser
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: 'Database error',
      data: {}
    });
  }
};


