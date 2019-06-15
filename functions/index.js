const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios')

const stravaconfig = {
  access_token : "",
  client_id : functions.config().strava.clientid,
  client_secret : functions.config().strava.clientsecret,
  redirect_uri : functions.config().strava.redirecturi,
  code : "" ,
  scope : functions.config().strava.scope,
  }
const stravaAPI = axios.create({
  baseURL: functions.config().strava.apiurl ,
  headers:{
    'Authorization': `Bearer ${functions.config().strava.testaccesstoken}`
  }
})

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.getAthlete = functions.https.onRequest((request, response) => {
  stravaAPI.get('/athlete')
      .then((result) => {
        console.log(result);
        return response.send(result.data);
      })
      .catch((error) => {
        console.log(error);
      })
});