const db = require("../utils/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils/responseHelper");

const JWT_SECRET = process.env.JWT_SECRET || "yourSuperSecretKey"; // Replace for production

exports.login = async (req, res) => {
  const { emailAdress, password } = req.body;

  if (!emailAdress || !password) {
    return sendResponse(res, 400, "Email and password are required");
  }

  try {
    const [rows] = await db.execute(
      "SELECT * FROM `user` WHERE emailAdress = ?",
      [emailAdress]
    );

    if (rows.length === 0) {
      return sendResponse(res, 404, "User not found");
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, "Invalid password");
    }

    // Optional: Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Exclude password from returned data
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      emailAdress: user.emailAdress,
      phoneNumber: user.phoneNumber,
      roles: user.roles,
      street: user.street,
      city: user.city,
      token,
    };

    return sendResponse(res, 200, "Login successful", userData);
  } catch (err) {
    console.error(err);
    return sendResponse(res, 500, "Database error");
  }
};
