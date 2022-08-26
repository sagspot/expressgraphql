const authResolver = require('./auth');
const bookingResolver = require('./booking');
const eventsResolver = require('./events');

const rootReslover = { ...authResolver, ...bookingResolver, ...eventsResolver };

module.exports = rootReslover;
