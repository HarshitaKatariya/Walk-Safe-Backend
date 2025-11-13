const express = require('express');
const router = express.Router();
const { addReview } = require('../models/addReview');
const { zones } = require('../models/zones');

router.post('/user/addReview', addReview);
router.get('/zones',zones)

module.exports = router;