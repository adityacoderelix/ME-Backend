require('dotenv').config();
const AWS = require('aws-sdk');

const spacesEndpoint = new AWS.Endpoint(`https://${process.env.REGION}.digitaloceanspaces.com`);

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});

module.exports = s3;