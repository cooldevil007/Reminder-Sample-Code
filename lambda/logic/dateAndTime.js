const moment = require('moment-timezone');

const subtractAndFormat = (momentTime, minutesToSubtract) =>
  momentTime
    .subtract(minutesToSubtract, 'minutes')
    .format('YYYY-MM-DDTHH:mm:ss');

const createMomentTime = (time) => {
  const [hour, minute] = time.split(':');
  return subtractAndFormat(
    moment().tz('America/Chicago').set({ hour, minute, seconds: '00' })
  );
};

const createMomentObject = (time) => moment(time);

module.exports = {
  createMomentObject,
  createMomentTime,
  subtractAndFormat
};
