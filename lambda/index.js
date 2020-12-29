const Alexa = require('ask-sdk-core');
const generateRequests = require('./logic/createReminderRequest');

const messages = {
  WELCOME:
    'Welcome to the Reminders test API Demo Skill!  You can say "create a reminder" to create a reminder.  What would you like to do?',
  WHAT_DO_YOU_WANT: 'What would you like to do?',
  NOTIFY_MISSING_PERMISSIONS:
    "Please enable Reminder permissions in the Amazon Alexa app using the card I've sent to your Alexa app.",
  ERROR: 'Uh Oh. Looks like something went wrong.',
  API_FAILURE: 'There was an error with the Reminders API.',
  GOODBYE: 'Bye! Thanks for using the Reminders API Skill!',
  UNHANDLED: "This skill doesn't support that. Please ask something else.",
  HELP: 'You can use this skill by asking something like: create a reminder?',
  REMINDER_CREATED: 'OK, I will remind you in 30 seconds.',
  UNSUPPORTED_DEVICE: "Sorry, this device doesn't support reminders.",
  WELCOME_REMINDER_COUNT:
    'Welcome to the Reminders API Demo Skill.  The number of your reminders related to this skill is ',
  NO_REMINDER: "OK, I won't remind you."
};

const PERMISSIONS = ['alexa::alerts:reminders:skill:readwrite'];

// Session Attributes
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.
function getMemoryAttributes() {
  const memoryAttributes = {
    history: [],
    // The remaining attributes will be useful after DynamoDB persistence is configured
    launchCount: 0,
    lastUseTimestamp: 0,
    lastSpeechOutput: {},
    nextIntent: []
    // "favoriteColor":"",
    // "name":"",
    // "namePronounce":"",
    // "email":"",
    // "mobileNumber":"",
    // "city":"",
    // "state":"",
    // "postcode":"",
    // "birthday":"",
    // "bookmark":0,
    // "wishlist":[],
  };
  return memoryAttributes;
}

const maxHistorySize = 20; // remember only latest 20 intents

const LaunchRequest_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    const { responseBuilder } = handlerInput;
    const client = handlerInput.serviceClientFactory.getReminderManagementServiceClient();
    let timeStamp = new Date();
    // const { permissions } = handlerInput.requestEnvelope.context.System.user;
    // if (permissions && !permissions.consentToken) {
    //   return responseBuilder
    //     .speak(messages.NOTIFY_MISSING_PERMISSIONS)
    //     .withAskForPermissionsConsentCard(PERMISSIONS)
    //     .getResponse();
    // }
    try {
      const reminder = await generateRequests(timeStamp.toISOString(), "60", "Walk the Dog");

      if (!reminder) {
        return responseBuilder
          .speak('An error occurred with the prayer time a.p.i.')
          .getResponse();
      }

      console.log('requests: ', JSON.stringify(reminder));
      const reminderResponse = await client.createReminder(reminder);
      console.log('reminderRequestResponse: ',JSON.stringify(reminderResponse));

      return responseBuilder.withShouldEndSession(true).getResponse();
      // return responseBuilder.speak(messages.REMINDER_CREATED).getResponse();
    } catch (error) {
      console.log('error: ', error);
      return responseBuilder
        .speak('An error occurred creating the reminders')
        .getResponse();
    }
  }
};
// async handle(handlerInput) {
//   const requestEnvelope = handlerInput.requestEnvelope;
//   const responseBuilder = handlerInput.responseBuilder;
//   const consentToken = requestEnvelope.context.System.apiAccessToken;

//   console.log('consent token: ', consentToken);
//   const interfaces =
//     requestEnvelope.context.System.device.supportedInterfaces;

//   console.log('interfaces: ', interfaces);

//   const permissions = requestEnvelope.context.System.user.permissions;

//   console.log('permissions: ', permissions);

//   // return responseBuilder
//   //   .speak(messages.NOTIFY_MISSING_PERMISSIONS)
//   //   .withAskForPermissionsConsentCard(PERMISSIONS)
//   //   .getResponse();

//   try {
//     const client = handlerInput.serviceClientFactory.getReminderManagementServiceClient();
//     const remindersResponse = await client.getReminders();
//     console.log(JSON.stringify(remindersResponse));

//     // reminders are retained for 3 days after they 'remind' the customer before being deleted
//     const remindersCount = remindersResponse.totalCount;

//     console.log('total count: ', remindersCount);

//     let say =
//       'hello' +
//       ' and welcome to ' +
//       invocationName +
//       '! Say help to hear some options.';

//     let skillTitle = capitalize(invocationName);

//     return responseBuilder
//       .speak(say)
//       .reprompt('try again, ' + say)
//       .withStandardCard(
//         'Welcome!',
//         'Hello!\nThis is a card for your skill, ' + skillTitle,
//         welcomeCardImg.smallImageUrl,
//         welcomeCardImg.largeImageUrl
//       )
//       .getResponse();
//   } catch (error) {
//     console.log(`error message: ${error.message}`);
//     console.log(`error stack: ${error.stack}`);
//     console.log(`error status code: ${error.statusCode}`);
//     console.log(`error response: ${error.response}`);
//   }
// }
// };
// handle(handlerInput) {
//   const responseBuilder = handlerInput.responseBuilder;
//   const accessToken =
//     handlerInput.requestEnvelope.context.System.user.accessToken;

//   if (!accessToken) {
//     const speak =
//       'Please use the Alexa companion app to authenticate with your Amazon account to start using the skill.';
//     return responseBuilder.speak(speak).withLinkAccountCard().getResponse();
//   }

//   let say =
//     'hello' +
//     ' and welcome to ' +
//     invocationName +
//     '! Say help to hear some options.';

//   let skillTitle = capitalize(invocationName);

//   return responseBuilder
//     .speak(say)
//     .reprompt('try again, ' + say)
//     .withStandardCard(
//       'Welcome!',
//       'Hello!\nThis is a card for your skill, ' + skillTitle,
//       welcomeCardImg.smallImageUrl,
//       welcomeCardImg.largeImageUrl
//     )
//     .getResponse();
// }
// };

const ReadReminder_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' &&
      request.intent.name === 'ReadReminder'
    );
  },
  async handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    const accessToken =
      handlerInput.requestEnvelope.context.System.user.accessToken;

    const client = handlerInput.serviceClientFactory.getReminderManagementServiceClient();
    const reminders = await client.getReminders();
    console.log("Reminders details are : ", JSON.stringify(reminders));

    return responseBuilder.speak("Your details has been sent").getResponse();
  }
};

const AMAZON_CancelIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.CancelIntent'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Okay, talk to you later!')
      .withShouldEndSession(true)
      .getResponse();
  }
};

const AMAZON_StopIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.StopIntent'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Okay, talk to you later!')
      .withShouldEndSession(true)
      .getResponse();
  }
};

const AMAZON_HelpIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    let sampleIntent = randomElement(getCustomIntents());
    let say = 'You asked for help.';
    say +=
      ' Heres something you can ask me, ' + getSampleUtterance(sampleIntent);

    return handlerInput.responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  }
};

const AMAZON_NavigateHomeIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.NavigateHomeIntent'
    );
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;

    let say = 'Hello from AMAZON.NavigateHomeIntent. ';

    return responseBuilder
      .speak(say)
      .reprompt('try again, ' + say)
      .getResponse();
  }
};

const AMAZON_FallbackIntent_Handler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' &&
      request.intent.name === 'AMAZON.FallbackIntent'
    );
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    let previousSpeech = getPreviousSpeechOutput(sessionAttributes);

    return responseBuilder
      .speak(
        'Sorry I didnt catch what you said, ' +
          stripSpeak(previousSpeech.outputSpeech)
      )
      .reprompt(stripSpeak(previousSpeech.reprompt))
      .getResponse();
  }
};

const SessionEndedHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
    );
    return handlerInput.responseBuilder.getResponse();
  }
};

// 2. Constants ===========================================================================

// Here you can define static data, to be used elsewhere in your code.  For example:
//    const myString = "Hello World";
//    const myArray  = [ "orange", "grape", "strawberry" ];
//    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined; // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function randomElement(myArray) {
  return myArray[Math.floor(Math.random() * myArray.length)];
}

function stripSpeak(str) {
  return str.replace('<speak>', '').replace('</speak>', '');
}

function getCustomIntents() {
  const modelIntents = model.interactionModel.languageModel.intents;

  let customIntents = [];

  for (let i = 0; i < modelIntents.length; i++) {
    if (
      modelIntents[i].name.substring(0, 7) != 'AMAZON.' &&
      modelIntents[i].name !== 'LaunchRequest'
    ) {
      customIntents.push(modelIntents[i]);
    }
  }
  return customIntents;
}

function getSampleUtterance(intent) {
  return randomElement(intent.samples);
}

function getPreviousSpeechOutput(attrs) {
  if (attrs.lastSpeechOutput && attrs.history.length > 1) {
    return attrs.lastSpeechOutput;
  } else {
    return false;
  }
}

const LogRequestInterceptor = {
    process(handlerInput) {
        console.log("======== Request ==========");
        console.log(JSON.stringify(handlerInput, null, 2));
    }
}


const LogResponseInterceptor = {
    process(response) {
        console.log("======== Response ==========");
        console.log(JSON.stringify(response, null, 2));
    }
}

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest_Handler,
    ReadReminder_Handler,
    AMAZON_CancelIntent_Handler,
    AMAZON_HelpIntent_Handler,
    AMAZON_StopIntent_Handler,
    AMAZON_NavigateHomeIntent_Handler,
    AMAZON_FallbackIntent_Handler,
    SessionEndedHandler
  )
  .addRequestInterceptors(LogRequestInterceptor)
  .addResponseInterceptors(LogResponseInterceptor)
  .withApiClient(new Alexa.DefaultApiClient())
  .withCustomUserAgent('cookbook/reminders/v1')
  .lambda();
