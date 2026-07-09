const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const userController = require('../controller/userController')

router.post('/signUp', userController.signup)
router.post('/login', userController.login)
router.post('/google-login', userController.googleLogin)
router.post('/forget', userController.forgetpassword)
router.post('/forgetotp', userController.forgetotp)
router.post('/reset', userController.resetpassword)
router.get('/getalluser',auth, userController.getalluser)
router.patch("/theme", auth, userController.theme);
router.get("/theme", auth, userController.getTheme);


module.exports = router;


