const express = require('express');
const router = express.Router();
const { getExperts, getCategories, getExpertById } = require('../controllers/expertController');

router.get('/get/v1', getExperts);
router.get('/categories/v1', getCategories);
router.get('/:id/v1', getExpertById);

module.exports = router;
