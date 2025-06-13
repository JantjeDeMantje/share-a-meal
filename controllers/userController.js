const bcrypt = require('bcryptjs');
const db = require('../utils/db');

exports.register = async (req, res) => {
  const {
    firstName, lastName, street, city,
    emailAdress, password, phoneNumber, roles
  } = req.body;

  if (!firstName || !lastName || !emailAdress || !password || !street || !city) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [existing] = await db.execute(
      'SELECT * FROM `user` WHERE emailAdress = ?',
      [emailAdress]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
};

