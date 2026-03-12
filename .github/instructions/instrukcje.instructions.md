// Log the error
  logger.error('Unhandled error:', { 
    message: error.message, 
    stack: error.stack, 
    traceId, 
    path: req.originalUrl, 
    method: req.method 
  });
