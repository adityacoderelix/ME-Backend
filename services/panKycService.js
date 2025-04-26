// services/externalAPIService.js
const axios = require('axios');
const FormData = require('form-data');

const OCR_API = 'https://api.digitap.ai/ocr/v1/pan';
const STATUS_API = 'https://svc.digitap.ai/validation/kyc/v1/pan_basic';
const AUTH_HEADER = 'Basic MTUyMjI5MjI6UU94Z3pSZEFtS3lnZUNDUnJPUUtJem1HcVd0OTBlc2Y=';

exports.performOCR = async (imageBase64, clientRefId) => {
  const form = new FormData();
  form.append('imageUrl', imageBase64);
  form.append('clientRefId', clientRefId);

  try {
    const response = await axios.post(OCR_API, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: AUTH_HEADER
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`OCR API Error: ${error.response?.data || error.message}`);
  }
};

exports.performStatusCheck = async (requestData) => {
  try {
    const response = await axios.post(STATUS_API, requestData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: AUTH_HEADER
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`Status API Error: ${error.response?.data || error.message}`);
  }
};