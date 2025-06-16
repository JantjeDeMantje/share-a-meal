import bcrypt from "bcryptjs";
import db from "../utils/db.js";
import { sendResponse } from "../utils/responseHelper.js";
import {
  isValidEmail,
  isValidPassword,
  isValidPhoneNumber,
} from "../utils/validators.js";

const getAllUsers = async (req, res) => {
  const { isActive, firstName, lastName, emailAdress } = req.query;

  let sql =
    "SELECT id, firstName, lastName, emailAdress, isActive, phoneNumber, roles, street, city FROM `user` WHERE 1=1";
  const params = [];

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

const register = async (req, res) => {
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

  if (!isValidEmail(emailAdress)) {
    return sendResponse(res, 400, "Invalid email format");
  }
  if (!isValidPassword(password)) {
    return sendResponse(
      res,
      400,
      "Password must be at least 8 characters, contain a capital letter and a number"
    );
  }
  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    return sendResponse(res, 400, "Invalid phone number format");
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

const updateUser = async (req, res) => {
  const userId = Number(req.params.id);

  let {
    firstName,
    lastName,
    emailAdress,
    phoneNumber,
    street,
    city,
    isActive,
    roles,
  } = req.body;

  if (!emailAdress) {
    return sendResponse(res, 400, "emailAdress is verplicht", {});
  }

  if (!isValidEmail(emailAdress)) {
    return sendResponse(res, 400, "Invalid email format", {});
  }
  if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
    return sendResponse(res, 400, "Invalid phone number format", {});
  }

  firstName = firstName ?? null;
  lastName = lastName ?? null;
  phoneNumber = phoneNumber ?? null;
  street = street ?? null;
  city = city ?? null;
  isActive = typeof isActive === "undefined" ? null : isActive ? 1 : 0;
  roles = roles ?? null;

  try {
    const [oldRows] = await db.execute(
      "SELECT id, firstName, lastName, emailAdress, phoneNumber, street, city, isActive, roles FROM `user` WHERE id = ?",
      [userId]
    );
    if (oldRows.length === 0) {
      return sendResponse(res, 404, "User not found", {});
    }
    const oldData = oldRows[0];

    const sql = `
      UPDATE \`user\`
      SET firstName = ?, lastName = ?, emailAdress = ?, phoneNumber = ?,
          street = ?, city = ?, isActive = ?, roles = ?
      WHERE id = ?
    `;
    const params = [
      firstName,
      lastName,
      emailAdress,
      phoneNumber,
      street,
      city,
      isActive,
      roles,
      userId,
    ];

    const [result] = await db.execute(sql, params);
    if (result.affectedRows === 0) {
      return sendResponse(res, 404, "Nothing updated", {});
    }

    const updatedData = {
      id: userId,
      firstName,
      lastName,
      emailAdress,
      phoneNumber,
      street,
      city,
      isActive,
      roles,
    };

    return sendResponse(res, 200, "User updated successfully", {
      oldData,
      updatedData,
    });
  } catch (err) {
    console.error("Database error:", err);
    return sendResponse(res, 500, "Database error", {});
  }
};

const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id);

  try {
    const [rows] = await db.execute("SELECT * FROM `user` WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return sendResponse(res, 404, "User not found");
    }

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

export default {
  getAllUsers,
  register,
  updateUser,
  deleteUser,
};
