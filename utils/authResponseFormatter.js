// utils/responseFormatter.js
const formatResponse = (status, code, message, details = null) => ({
    status,  // "success" or "error"
    code,    // Specific error code like "USER_ALREADY_EXISTS"
    message, // User-friendly message
    details, // Additional context if needed
    timestamp: new Date().toISOString(),
    requestId: crypto.randomUUID() // For tracking specific requests
  });
  
  const ErrorCodes = {
    USER_EXISTS: 'USER_ALREADY_EXISTS',
    OTP_EXPIRED: 'OTP_EXPIRED',
    INVALID_OTP: 'INVALID_OTP',
    ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR'
  };