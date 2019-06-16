const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios') //getAthlete
const passport = require('passport') //stravaAuth
const StravaStrategy = require('passport-strava').Strategy; //stravaAuth

const app = admin.initializeApp();
const stravaconfig = {
  client_id : functions.config().strava.clientid,
  client_secret : functions.config().strava.clientsecret,
  redirect_uri : functions.config().strava.redirecturi,
  scope : functions.config().strava.scope,
  targetUrl: functions.config().strava.apiurl
  }
const makeStravaApiHeader = (accessToken) => {
  return {'Authorization': `Bearer ${accessToken}`}
  }
const stravaAPI = axios.create({
  baseURL: functions.config().strava.apiurl ,
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
    return response.send(result.data);
  })
  .catch((error) => {
    console.log(error);
  })
});

//認証
passport.use(new StravaStrategy(
  {
  clientID: stravaconfig.client_id,
  clientSecret: stravaconfig.client_secret,
  callbackURL: stravaconfig.redirect_uri,
  scope: stravaconfig.scope
  },
  (accessToken, refreshToken, profile, cb) => {
    //ユーザーDBを作るならここで作成
    console.log(profile)
    return profile,refreshToken,accessToken
  }
));

exports.stravaAuth = functions.https.onRequest(
  passport.authenticate('strava')
);