const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// POST /api/contact - Submit a clinic support inquiry or feedback
router.post('/', contactController.submitInquiry);

module.exports = router;
