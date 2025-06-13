const bcrypt = require("bcryptjs");
const db = require("../utils/db");
const { sendResponse } = require("../utils/responseHelper");

exports.getAllUsers = async (req, res) => {
    try {
      const [users] = await db.execute(
        'SELECT id, firstName, lastName, isActive, emailAdress, phoneNumber, roles, street, city FROM `user`'
      );
  
      return sendResponse(res, 200, 'List of all users', users);
    } catch (err) {
      console.error(err);
      return sendResponse(res, 500, 'Database error');
    }
  };

exports.register = async (req, res) => {
  const {
    firstName,
    lastName,
    street,
    city,
    emailAdress,
    password,
    phoneNumber,
    roles,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !emailAdress ||
    !password ||
    !street ||
    !city
  ) {
    return sendResponse(res, 400, "Missing required fields");
  }

  try {
    const [existing] = await db.execute(
      "SELECT * FROM `user` WHERE emailAdress = ?",
      [emailAdress]
    );

    if (existing.length > 0) {
      return sendResponse(res, 409, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO user 
        (firstName, lastName, isActive, emailAdress, password, phoneNumber, roles, street, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName,
        lastName,
        1,
        emailAdress,
        hashedPassword,
        phoneNumber || "-",
        roles || "editor,guest",
        street,
        city,
      ]
    );

    const newUser = {
      id: result.insertId,
      firstName,
      lastName,
      isActive: 1,
      emailAdress,
      phoneNumber: phoneNumber || "-",
      roles: roles || "editor,guest",
      street,
      city,
    };

    return sendResponse(res, 201, "User successfully registered", newUser);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Database error");
  }
};



