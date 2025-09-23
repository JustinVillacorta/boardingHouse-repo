// Response utility functions
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

const sendError = (res, message, statusCode = 400, data = null) => {
  return sendResponse(res, statusCode, false, message, data);
};

const sendCreated = (res, message, data = null) => {
  return sendResponse(res, 201, true, message, data);
};

const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendResponse(res, 401, false, message);
};

const sendForbidden = (res, message = 'Access forbidden') => {
  return sendResponse(res, 403, false, message);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendResponse(res, 404, false, message);
};

const sendServerError = (res, message = 'Internal server error') => {
  return sendResponse(res, 500, false, message);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
  sendCreated,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendServerError,
};