// Redis
const redis = require('redis');

var rClient = redis.createClient();

// Connect to Redis
rClient.on('connect', function() {
  console.log('Connected to Redis');
});

// Export connection
module.exports = exports = rClient;