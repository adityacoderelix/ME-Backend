const s3 = require('../config/digitalOcean.config');

exports.generatePresignedUrl = (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    const params = {
      Bucket: process.env.SPACE_NAME,
      Key: `uploads/${Date.now()}_${fileName}`,
      ContentType: fileType,
      ACL: 'public-read',
      Expires: 60 * 15 // 15 minutes
    };

    s3.getSignedUrl('putObject', params, (err, url) => {
      if (err) {
        console.error('Presigned URL error:', err);
        return res.status(500).json({ error: 'Error generating presigned URL' });
      }
      res.json({ url });
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};