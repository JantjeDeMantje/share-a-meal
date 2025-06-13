const bcrypt = require("bcryptjs");
const db = require("../utils/db");
const { sendResponse } = require("../utils/responseHelper");

exports.getAllUsers = async (req, res) => {
  // Extract possible filter fields from query parameters
  const { isActive, firstName, lastName, emailAdress } = req.query;

  // Start with base SQL
  let sql = 'SELECT id, firstName, lastName, emailAdress, isActive, phoneNumber, roles, street, city FROM `user` WHERE 1=1';
  const params = [];

  // Dynamically add filters if present
  if (isActive !== undefined) {
    sql += ' AND isActive = ?';
    params.push(isActive);
  }

  if (firstName) {
    sql += ' AND firstName LIKE ?';
    params.push(`%${firstName}%`);
  }

  if (lastName) {
    sql += ' AND lastName LIKE ?';
    params.push(`%${lastName}%`);
  }

  if (emailAdress) {
    sql += ' AND emailAdress LIKE ?';
    params.push(`%${emailAdress}%`);
  }

    try {
      const [users] = await db.execute(
        sql, params 
      );
  
      return sendResponse(res, 200, "List of all users", users);
    } catch (err) {
      console.error(err);
      return sendResponse(res, 500, "Database error");
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
