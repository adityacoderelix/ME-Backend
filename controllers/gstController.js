const KycLogs = require("../models/KycLogs");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const OCR_API = process.env.OCR_API;
const STATUS_GST = process.env.STATUS_GST;
const AUTH_HEADER = process.env.AUTH_HEADER;
const CLIENT_ID = process.env.DIGITAP_CLIENT_ID;
const CLIENT_SECRET = process.env.DIGITAP_CLIENT_SECRET;
const getAuthHeader = () => {
  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  console.log("Header", Buffer.from(credentials).toString("base64"));

  return `Basic ${Buffer.from(credentials).toString("base64")}`;
};
function makeClientRefId(prefix) {
  let id = `${prefix}-${uuidv4()}`; // uuidv4 is 36 chars, prefix+dash ~ +4 -> < 45 OK usually
  return id.slice(0, 45);
}

async function performGstCheck(requestData) {
  try {
    const response = await axios.post(
      `${STATUS_GST}/gst-authentication`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
      }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data
      ? JSON.stringify(error.response.data.error, null, 2)
      : error.message;
    console.log("Gst not validated", errorMessage);
  }
}
exports.verifyGst = async (req, res) => {
  const { userId, name, number } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });
  console.log("super ma", userId, number);
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  console.log("super ma", user);
  const statusClientRefNum = makeClientRefId("STATUS");
  const statusLog = await KycLogs.create({
    userId,
    email: user.email,
    type: "Gst",
    requestData: {
      gstin: number,
    },
  });
  const statusResult = await performGstCheck(statusLog.requestData);
  statusLog.status = "success";
  statusLog.responseData = statusResult;
  await statusLog.save();
  console.log("marve", statusResult);
  return res.json({ success: true, statusResult });
};
