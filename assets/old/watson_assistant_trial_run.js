const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const assistant = new AssistantV2({
  version: '2020-04-01', //found here   https://cloud.ibm.com/apidocs/assistant/assistant-v2?code=node#versioning
  authenticator: new IamAuthenticator({
    apikey: 'cxLrC9PR_4we-NvVDReaYEC1vgaGiPd2j0xOnMdvsysE',
  }),
  url: 'https://api.us-east.assistant.watson.cloud.ibm.com/instances/effbb87d-6c9e-4bbd-a646-cd633cbfb5b0',
});

assistant.createSession({
  assistantId: 'eb305ee2-4922-44e7-8168-3389856cc4ce'
})
  .then(res => {
    console.log(JSON.stringify(res.result, null, 2));

    assistant.message({
  assistantId: 'eb305ee2-4922-44e7-8168-3389856cc4ce',
  sessionId: res.result.session_id,
  input: {
    'text': 'Hello'
    }
  })
  .then(res => {
    console.log(JSON.stringify(res.result, null, 2));
  })
  .catch(err => {
    console.log(err);
  });

  })
  .catch(err => {
    console.log(err);
  });

