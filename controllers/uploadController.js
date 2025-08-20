const s3 = require("../config/digitalOcean.config");

exports.uploadImages = async (req, res) => {
  try {
    console.log("Upload request received");
    const files = req.files; // Array of files
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Upload all files to DigitalOcean Spaces
    const uploadPromises = files.map((file) => {
      const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ACL: "public-read",
      };
      return s3.upload(params).promise();
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map((result) => result.Location);

    console.log("Upload successful:", urls);
    res.json({ urls }); // Return array of URLs
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};
exports.generatePresignedUrl = (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    const params = {
      Bucket: process.env.SPACE_NAME,
      Key: `uploads/${Date.now()}_${fileName}`,
      ContentType: fileType,
      ACL: "public-read",
      Expires: 60 * 15, // 15 minutes
    };

    s3.getSignedUrl("putObject", params, (err, url) => {
      if (err) {
        console.error("Presigned URL error:", err);
        return res
          .status(500)
          .json({ error: "Error generating presigned URL" });
      }
      res.json({ url });
    });
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
