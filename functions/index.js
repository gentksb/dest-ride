const functions = require('firebase-functions');
const firebase =require('firebase')
const admin = require('firebase-admin');
const axios = require('axios');
const app = admin.initializeApp(functions.config().firebase);
var db = admin.firestore();
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
    console.error(error);
    return response.status(500)
  })
});

exports.getSegmentsOfActivity = functions.https.onRequest((request, response) => {
  stravaAPI.get(`/activities/${request.query.activityId}`,{
    headers: makeStravaApiHeader(request.query.accessToken),
    params: {
      include_all_efforts: true
    }
  })
  .then((result) => {
    console.log(result);
    return response.status(200).send(result.data.segment_efforts);
  })
  .catch((error) => {
    console.error(error);
    return response.status(500)
  })
});

exports.listAthleteActivities = functions.https.onRequest((request, response) => {
  stravaAPI.get('/athlete/activities',{
    headers: makeStravaApiHeader(request.query.accessToken),
    params: {
      page:1,
      per_page:10
    }
  })
  .then((result) => {
    console.log(result);
    return response.status(200).send(result.data);
  })
  .catch((error) => {
    console.error(error);
    return response.status(500)
  })
});

exports.deathStride = functions.https.onRequest((request, response) => {
  //ローカルに渡したデータ書き換え対策のため、比較用タイムを再度取得
  stravaAPI.get(`/activities/${request.query.activityId}`,{
    headers: makeStravaApiHeader(request.query.accessToken),
    params: {
      include_all_efforts: true
    }
  })
    .then((result) => {
      let deathStrideResult = {}
      const battleSegment = Number(request.query.segmentId);
      const segment_efforts = result.data.segment_efforts;
      const challengerSegment = segment_efforts.filter(segment_effort => segment_effort.segment.id === battleSegment);

      //デストライド処理
      const kingData = db.collection('kingdata');
      const getkingRecord = kingData.where('segment_id','==', challengerSegment[0].id).get()
        .then( kingRecord => {
          console.log(kingRecord)
          console.log(`king:${kingRecord.king_name}(${kingRecord.elapsed_time}) vs challenger(${challengerSegment[0].elapsed_time})`)

          if (challengerSegment[0].elapsed_time > kingRecord.elapsed_time){
            deathStrideResult = {
              'result' : 'Win'
            };
          } if(challengerSegment[0].elapsed_time < kingRecord.elapsed_time){
            deathStrideResult = {
              'result' : 'Lose'
            }
          } else{
            console.warn(`king:${kingRecord.king_name}(${kingRecord.elapsed_time}) vs challenger(${challengerSegment[0].elapsed_time})`)
            deathStrideResult = {
              'result' : 'No Contest'
            }
          }
          
          return response.status(200).send(deathStrideResult)
        })
        .catch(err=>{
          console.error('FirestoreAccessError:',err)
          return response.status(500)
        })
      return
    })
    .catch((error) => {
      console.error('AxiosError:',error);
      return response.status(500)
    })
})


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