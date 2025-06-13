// middleware/checkOwnership.js
const { sendResponse } = require('../utils/responseHelper');

module.exports = (req, res, next) => {
    const userIdFromToken = req.userId;
    const userIdFromParams = parseInt(req.params.id, 10);

  
    if (userIdFromToken !== userIdFromParams) {
      return res.status(403).json({
        status: 403,
        message: 'Not allowed to modify this user',
        data: {}
      });
    }
    next();
  };
