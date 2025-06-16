import db from "../utils/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/responseHelper.js";

const JWT_SECRET = process.env.JWT_SECRET || "yourSuperSecretKey";

const login = async (req, res) => {
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

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (err) {
      console.error("bcrypt error:", err, "user.password:", user.password);
      return sendResponse(res, 500, "Password verification failed");
    }

    if (!isMatch) {
      return sendResponse(res, 400, "Invalid password");
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

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

export default { login };
