const express = require('express');
const router = express.Router();
const { signup, signin, getUserById } = require("../controllers/authController");

router.post('/signup',signup);
router.post('/signin', signin);
router.get('/user/:uid',getUserById);

module.exports = router;