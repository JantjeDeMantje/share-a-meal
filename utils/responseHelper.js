function sendResponse(res, statusCode, message, data = {}) {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data
  });
}

export { sendResponse };