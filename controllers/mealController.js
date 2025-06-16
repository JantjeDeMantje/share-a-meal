import db from "../utils/db.js";
import { sendResponse } from "../utils/responseHelper.js";
import { toMySqlDateTime } from "../utils/dateHelper.js";

const createMeal = async (req, res) => {
  const cookId = req.userId;
  const {
    name,
    description,
    price,
    dateTime,
    imageUrl,
    isActive = 1,
    isVega = 0,
    isVegan = 0,
    isToTakeHome = 1,
    maxAmountOfParticipants = 6,
    allergenes = "",
  } = req.body;

  const mysqlDateTime = dateTime ? toMySqlDateTime(dateTime) : undefined;

  const allergenesValue = Array.isArray(allergenes)
    ? allergenes.join(",")
    : allergenes || "";

  if (!name || !description || !price || !mysqlDateTime || !imageUrl) {
    return sendResponse(res, 400, "Missing required fields", {});
  }

  try {
    const sql = `
      INSERT INTO meal 
      (name, description, price, dateTime, imageUrl, isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, allergenes, cookId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      name,
      description,
      price,
      mysqlDateTime,
      imageUrl,
      isActive,
      isVega,
      isVegan,
      isToTakeHome,
      maxAmountOfParticipants,
      allergenesValue,
      cookId,
    ];

    const [result] = await db.execute(sql, values);

    const [newMeal] = await db.execute("SELECT * FROM meal WHERE id = ?", [
      result.insertId,
    ]);

    return sendResponse(res, 201, "Meal created successfully", newMeal[0]);
  } catch (err) {
    console.error("Error creating meal:", err);
    return sendResponse(res, 500, "Failed to create meal", {});
  }
};

const updateMeal = async (req, res) => {
  const mealId = req.params.id;
  const cookId = req.userId;
  const updateData = req.body;

  const { name, price, maxAmountOfParticipants } = updateData;

  if (!name || !price || !maxAmountOfParticipants) {
    return sendResponse(
      res,
      400,
      "Missing required fields: name, price or maxAmountOfParticipants",
      {}
    );
  }

  try {
    const [oldMealResult] = await db.execute(
      "SELECT * FROM meal WHERE id = ?",
      [mealId]
    );

    if (oldMealResult.length === 0) {
      return sendResponse(res, 404, "Meal not found", {});
    }

    const oldMeal = oldMealResult[0];

    if (oldMeal.cookId !== cookId) {
      return sendResponse(res, 403, "Not authorized to update this meal", {});
    }

    const fields = [];
    const values = [];

    for (const key in updateData) {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
      let val = updateData[key];
      if (key === "dateTime") val = toMySqlDateTime(val);
      fields.push(`${key} = ?`);
      values.push(val);
    }

    values.push(mealId);

    const sql = `UPDATE meal SET ${fields.join(", ")} WHERE id = ?`;
    await db.execute(sql, values);

    const [updatedMealResult] = await db.execute(
      "SELECT * FROM meal WHERE id = ?",
      [mealId]
    );
    const updatedMeal = updatedMealResult[0];

    return sendResponse(res, 200, "Meal updated successfully", {
      oldMeal,
      updatedMeal,
    });
  } catch (error) {
    console.error("Error updating meal:", error);
    return sendResponse(res, 500, "Internal server error", {});
  }
};

const getMealById = async (req, res) => {
  const mealId = req.params.id;

  try {
    const [meals] = await db.execute(
      `
      SELECT 
        meal.*, 
        user.id AS cookId, 
        user.firstName AS cookFirstName, 
        user.lastName AS cookLastName, 
        user.emailAdress AS cookEmail 
      FROM meal 
      LEFT JOIN user ON meal.cookId = user.id 
      WHERE meal.id = ?
      `,
      [mealId]
    );

    if (meals.length === 0) {
      return sendResponse(res, 404, "Meal not found", {});
    }

    return sendResponse(res, 200, "Meal found", meals[0]);
  } catch (error) {
    console.error("Error fetching meal:", error);
    return sendResponse(res, 500, "Internal server error", {});
  }
};

const getAllMeals = async (req, res) => {
  try {
    const [meals] = await db.execute(`
      SELECT 
        meal.*, 
        user.id AS cookId, 
        user.firstName AS cookFirstName, 
        user.lastName AS cookLastName, 
        user.emailAdress AS cookEmail 
      FROM meal 
      LEFT JOIN user ON meal.cookId = user.id
    `);

    return sendResponse(res, 200, "List of all meals", meals);
  } catch (error) {
    console.error("Error retrieving meals:", error);
    return sendResponse(res, 500, "Internal server error", {});
  }
};

const deleteMeal = async (req, res) => {
  const mealId = req.params.id;
  const userId = req.userId;

  try {
    const [meals] = await db.execute("SELECT * FROM meal WHERE id = ?", [
      mealId,
    ]);

    if (meals.length === 0) {
      return sendResponse(res, 404, "Meal not found", {});
    }

    const meal = meals[0];

    if (meal.cookId !== userId) {
      return sendResponse(
        res,
        403,
        "You are not allowed to delete this meal",
        {}
      );
    }

    await db.execute("DELETE FROM meal WHERE id = ?", [mealId]);

    return sendResponse(res, 200, "Meal successfully deleted", {
      deletedMealId: mealId,
    });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return sendResponse(res, 500, "Internal server error", {});
  }
};

const getMealsByCook = async (req, res) => {
  const userId = req.userId;

  try {
    const [meals] = await db.execute(
      `SELECT id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes
       FROM meal
       WHERE cookId = ? AND dateTime >= CURDATE()`,
      [userId]
    );

    return sendResponse(res, 200, "Meals fetched successfully", meals);
  } catch (error) {
    console.error("Error fetching meals by cook:", error);
    return sendResponse(res, 500, "Internal server error", {});
  }
};

const getMealsByUserId = async (req, res) => {
  const cookId = req.params.userId;

  try {
    const [meals] = await db.execute(
      `SELECT id, isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes
       FROM meal
       WHERE cookId = ? AND dateTime >= CURDATE()`,
      [cookId]
    );

    if (meals.length === 0) {
      return sendResponse(res, 404, "No meals found for this user", {});
    }

    return sendResponse(res, 200, "Meals fetched successfully", meals);
  } catch (error) {
    console.error("Error fetching meals by user:", error);
    return sendResponse(res, 500, "Internal server error", {});
  }
};

export default {
  createMeal,
  updateMeal,
  getMealById,
  getAllMeals,
  deleteMeal,
  getMealsByCook,
  getMealsByUserId,
};
