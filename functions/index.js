const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const app = admin.initializeApp();
const stravaconfig = {
  client_id : functions.config().strava.clientid,
  client_secret : functions.config().strava.clientsecret,
  redirect_uri : functions.config().strava.redirecturi,
  scope : functions.config().strava.scope,
  token_url: functions.config().strava.tokenurl,
  auth_url: functions.config().strava.oauthurl,
  state : 'dest-ride'
  }
const makeStravaApiHeader = (accessToken) => {
  return {'Authorization': `Bearer ${accessToken}`}
  }
const stravaAPI = axios.create({
  baseURL: functions.config().strava.apiurl
})


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.getAthlete = functions.https.onRequest((request, response) => {
  stravaAPI.get('/athlete',{
    headers: makeStravaApiHeader(request.query.accessToken)
  })
  .then((result) => {
    console.log(result);
    return response.status(200).send(result.data);
  })
  .catch((error) => {
    console.log(error);
  })
});

exports.listAthleteActivities = functions.https.onRequest((request, response) => {
  stravaAPI.get('/athlete/activities',{
    headers: makeStravaApiHeader(request.query.accessToken),
    params: {
      page:1,
      per_page:10,
      access_token: request.query.accessToken
    }
  })
  .then((result) => {
    console.log(result);
    return response.status(200).send(result.data);
  })
  .catch((error) => {
    console.log(error);
  })
});

//API認可
exports.stravaAuth = functions.https.onRequest((request, response) => {
  response.redirect(`${stravaconfig.auth_url}?client_id=${stravaconfig.client_id}&redirect_uri=${stravaconfig.redirect_uri}&response_type=code&scope=${stravaconfig.scope}&state=${stravaconfig.state}`)
});

exports.stravaAuthCallback = functions.https.onRequest((request, response) => {
  if(request.query['state'] !== stravaconfig.state){
    console.error('State Unmatch Error')
  }else{
    axios.post(stravaconfig.token_url ,{
        client_id: stravaconfig.client_id,
        client_secret: stravaconfig.client_secret,
        code: request.query['code'],
        grant_type: 'authorization_code',
        state : stravaconfig.state
    })
    .then((result) => {
      console.log(result.data);
        return response.redirect(`/?token=${result.data.access_token}`);
    })
    .catch((error) => {
      console.log(error);
    })
  }
});