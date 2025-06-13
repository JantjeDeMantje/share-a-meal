const bcrypt = require("bcryptjs");
const db = require("../utils/db");
const { sendResponse } = require("../utils/responseHelper");

// Get all users with optional filters
exports.getAllUsers = async (req, res) => {
  // Extract possible filter fields from query parameters
  const { isActive, firstName, lastName, emailAdress } = req.query;

  // Start with base SQL
  let sql =
    "SELECT id, firstName, lastName, emailAdress, isActive, phoneNumber, roles, street, city FROM `user` WHERE 1=1";
  const params = [];

  // Dynamically add filters if present
  if (isActive !== undefined) {
    sql += " AND isActive = ?";
    params.push(isActive);
  }

  if (firstName) {
    sql += " AND firstName LIKE ?";
    params.push(`%${firstName}%`);
  }

  if (lastName) {
    sql += " AND lastName LIKE ?";
    params.push(`%${lastName}%`);
  }

  if (emailAdress) {
    sql += " AND emailAdress LIKE ?";
    params.push(`%${emailAdress}%`);
  }

  try {
    const [users] = await db.execute(sql, params);

    return sendResponse(res, 200, "List of all users", users);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Database error");
  }
};

//Register a new user
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

//Update a user
exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id);
  const {
    firstName,
    lastName,
    emailAdress,
    phoneNumber,
    street,
    city,
    isActive,
    roles,
  } = req.body;

  try {
    // Fetch the current data of the user
    const [currentData] = await db.execute(
      "SELECT * FROM `user` WHERE id = ?",
      [userId]
    );

    if (currentData.length === 0) {
      return sendResponse(res, 404, "User not found");
    }

    const oldData = currentData[0];
    delete oldData.password; // Remove password from old data for security

    // Perform the update
    const sql = `
      UPDATE \`user\`
      SET firstName = ?, lastName = ?, emailAdress = ?, phoneNumber = ?, street = ?, city = ?, isActive = ?, roles = ?
      WHERE id = ?
    `;
    const params = [
      firstName,
      lastName,
      emailAdress,
      phoneNumber,
      street,
      city,
      isActive ? 1 : 0,
      roles,
      userId,
    ];

    const [result] = await db.execute(sql, params);

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, "User not found or nothing to update");
    }

    // Prepare the updated data
    const updatedData = {
      id: userId,
      firstName,
      lastName,
      emailAdress,
      phoneNumber,
      street,
      city,
      isActive: isActive ? 1 : 0,
      roles,
    };

    return sendResponse(res, 200, "User updated successfully", {
      oldData,
      updatedData,
    });
  } catch (err) {
    console.error("Database error:", err);
    return sendResponse(res, 500, "Database error", err);
  }
};

exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    // Check if user exists
    const [rows] = await db.execute("SELECT * FROM `user` WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return sendResponse(res, 404, "User not found");
    }

    // Delete the user
    const [result] = await db.execute("DELETE FROM `user` WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return sendResponse(res, 404, "User not found or already deleted");
    }

    return sendResponse(res, 200, "User deleted successfully");
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Database error");
  }
};
