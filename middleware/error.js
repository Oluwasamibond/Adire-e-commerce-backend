export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Duplicate Key Error
  if(err.code === 11000){
    const message = `This ${Object.keys(err.keyValue)} already exists. Please use another email!`;
    err = new handleAsyncError(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
