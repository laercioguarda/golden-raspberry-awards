const express = require('express')
const router = express.Router()

const {  getWinnersWithInterval } = require('../controller/awards.controller');

router.get('/awards/winners/intervals', getWinnersWithInterval);

module.exports = router