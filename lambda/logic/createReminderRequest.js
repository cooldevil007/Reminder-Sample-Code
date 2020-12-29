const createReminderRequest = (timestamp, time, message) => {
    return {
      requestTime: timestamp,
      trigger: {
        type: 'SCHEDULED_RELATIVE',
        offsetInSeconds: time
      },
      alertInfo: {
        spokenInfo: {
          content: [
            {
              locale: 'en-US',
              text: message,
              ssml: `<speak>Your reminder is set for this skill ${message}.</speak>`
            }
          ]
        }
      },
      pushNotification: {
        status: 'ENABLED'
      }
    };
  };
  
  module.exports = createReminderRequest;
