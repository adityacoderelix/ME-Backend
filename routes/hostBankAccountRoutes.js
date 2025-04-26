const express = require("express")
const router = express.Router()
const bankAccountController = require("../controllers/bankAccountController")
const authMiddleware = require("../middleware/authMiddleware") 

router.use(authMiddleware)

router.put("/update", bankAccountController.updateBankAccountDetails)
router.get("/", bankAccountController.getBankAccountDetails)

module.exports = router

