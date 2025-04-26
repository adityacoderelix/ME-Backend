const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require('multer');
const AWS = require('aws-sdk');
require("dotenv").config();
const app = express();

// Middleware
app.use(cors());
app.options('*', cors()); // Handle preflight OPTIONS requests explicitly

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} received`);
  next();
});


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 500000,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET
});



// Global error handler middleware
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 413) {
    return res.status(413).json({
      status: 'error',
      message: 'Payload too large. Please reduce the size of your request.',
      details: {
        maxSize: '10mb',
        type: error.type,
        path: req.path
      }
    });
  }

  // Handle other types of errors
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      status: 'error',
      message: 'Request entity too large',
      details: {
        maxSize: '10mb',
        type: error.type,
        path: req.path
      }
    });
  }

    // Default error handler for unhandled errors
    console.error('Unhandled error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  });


// MongoDB connection function
const connectDB = async () => {
  try {
    await mongoose.connect(
      // "mongodb://localhost:27017/me"
      "mongodb+srv://admin:10VToU0WupyAbo4M@majestic-escape.nk49u.mongodb.net/master-db?retryWrites=true&w=majority&appName=Majestic-Escape&authSource=admin",
    );
    console.log("MongoDB connected");
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const accountsRoutes = require("./routes/accountsRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const blogRoutes = require("./routes/blogRoutes");
const registerRoutes = require("./routes/registerRoutes");
const propListingRoutes = require("./routes/propListingRoutes");
const loginRoutes = require("./routes/loginRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const hostProfileRoutes = require("./routes/hostProfileRoutes");
const hostUserRoutes = require("./routes/hostUserRoutes");
const guestRoutes = require("./routes/guestRoutes");
const bookingInterestRoutes = require("./routes/bookingInterestRoutes");
const kycRoutes = require("./routes/kycRoutes");
  const uploadRoutes = require("./routes/uploadRoutes");
  const adminRoutes = require("./routes/adminRoutes");



// const stayRoutes = require("./routes/stayRoutes");
const panKycRoutes = require("./routes/panKycRoutes");
const propertyRegistrationNoRoutes = require("./routes/propertyRegistrationNoRoutes");
// const voterKycRoutes = require("./routes/voterKycRoutes");
// const passportKycRoutes = require("./routes/passportKycRoutes");
// const gstKycRoutes = require("./routes/gstKycRoutes");
// const propertyRegistrationIdRoutes = require("./routes/propertyRegistrationIdRoutes");



// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    status: "Majestic Escape backend is live",
    server: "Majestic Escape Server",
  });
});

const upload = multer({ storage: multer.memoryStorage() });
app.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    console.log('Upload request received');
    const files = req.files; // Array of files
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Upload all files to DigitalOcean Spaces
    const uploadPromises = files.map(file => {
      const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ACL: 'public-read'
      };
      return s3.upload(params).promise();
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map(result => result.Location);

    console.log('Upload successful:', urls);
    res.json({ urls }); // Return array of URLs
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});


app.use("/api/v1/register", registerRoutes);
app.use("/api/v1/login", loginRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/prop-listing", propListingRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/host", hostProfileRoutes);
app.use("/api/v1/hosts", hostUserRoutes);
app.use("/api/v1/guests", guestRoutes);
app.use("/api/v1/booking-interest", bookingInterestRoutes);
app.use("/api/v1/accounts", accountsRoutes);
app.use("/api/v1/kyc", kycRoutes);

// app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/host-bank", uploadRoutes);
app.use("/api/v1/property-registration-no", propertyRegistrationNoRoutes);
// app.use("/api/v1/stay", stayRoutes);

app.use("/api/v1/admin", adminRoutes);


// KYC Routes
app.use("/api/v1/pan-kyc", panKycRoutes);
// app.use("/api/v1/voter-kyc", voterKycRoutes);
// app.use("/api/v1/passport-kyc", passportKycRoutes);
// app.use("/api/v1/gst-kyc", gstKycRoutes);
// app.use("/api/v1/property-registration-id", propertyRegistrationIdRoutes);


// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).json({
    success: false,
    code: "SERVER_ERROR",
    message: "An unexpected error occurred",
    statusCode: 500,
    requestType: "GLOBAL_ERROR_HANDLER",
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    status: "404",
    error: "Route not found",
  });
});

// Start Server
const PORT = process.env.PORT || 5005;
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

// Handle Unhandled Rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
