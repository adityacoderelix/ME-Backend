const authController = {
    verifyToken: (req, res) => {
      try {
        // The authMiddleware has already verified the token
        // and attached the user to the request object
        res.status(200).json({
          success: true,
          code: 'AUTH_TOKEN_VALID',
          message: 'Token is valid',
          user: req.user,
          statusCode: 200,
          requestType: "VERIFY_AUTH"
        });
      } catch (error) {
        console.error('Verify Token Error:', error);
        res.status(500).json({
        requestType: "VERIFY_AUTH",
          success: false,
          code: 'AUTH_VERIFICATION_ERROR',
          message: 'An error occurred while verifying the token',
          statusCode: 500,
        });
      }
    },
  };
  
  module.exports = authController;
  
  