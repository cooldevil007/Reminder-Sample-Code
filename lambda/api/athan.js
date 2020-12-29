const axios = require('axios');

const athan = axios.create({
  baseURL: 'https://api.aladhan.com/v1'
});

module.exports = athan;
