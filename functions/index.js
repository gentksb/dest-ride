const functions = require('firebase-functions');
const firebase =require('firebase')
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();
const axios = require('axios');
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
const getActivityWithAllSegments = async (activityId,accessToken) =>{
  const ActivityWithAllSegments = await stravaAPI.get(`/activities/${activityId}`,{
    headers: makeStravaApiHeader(accessToken),
    params: {
      include_all_efforts: true
    }
  })
  return ActivityWithAllSegments.data
}

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const destrideSegmentArray = [10010182];
const isDestrideCourse = (inputSegment) =>{
  return destrideSegmentArray.includes(inputSegment.segment.id)
}

exports.getAthlete = functions.https.onRequest(async (request, response) => {
  try {
    const athelete = await stravaAPI.get('/athlete',{
      headers: makeStravaApiHeader(request.query.accessToken)
    })
    console.dir(athelete.data);
    return response.status(200).send(athelete.data);
  }
  catch (error) {
    console.error(error);
    return response.status(500)
  }
})

exports.getDeathStrideSegmentsOfActivity = functions.https.onRequest(async (request, response) => {
  try {
    const ActivityWithAllSegments = await getActivityWithAllSegments(request.query.activityId,request.query.accessToken)
    console.dir(ActivityWithAllSegments);
    const destrideSegments = ActivityWithAllSegments.segment_efforts.filter(isDestrideCourse);
    return response.status(200).send(destrideSegments);
  }
  catch(error){
    console.error(error);
    return response.status(500)
  }
})

exports.listAthleteActivities = functions.https.onRequest(async (request, response) => {
  try {
    const AthleteActivities = await stravaAPI.get('/athlete/activities',{
      headers: makeStravaApiHeader(request.query.accessToken),
      params: {
        page:1,
        per_page:10
      }
    })
    console.dir(AthleteActivities.data);
    return response.status(200).send(AthleteActivities.data);
  }
  catch(error) {
    console.error(error);
    return response.status(500)
  }
})

exports.deathStride = functions.https.onRequest(async (request, response) => {
    try {
      //ローカルに渡したデータ書き換え対策のため、比較用タイムを再度取得
      const verifiedActiviryWithAllSegments = await getActivityWithAllSegments(request.query.activityId,request.query.accessToken)
      let deathStrideResult = {}
      const battleSegment = Number(request.query.segmentId);
      const segment_efforts = verifiedActiviryWithAllSegments.segment_efforts;
      const challengerSegment = segment_efforts.filter(segment_effort => segment_effort.segment.id === battleSegment);

      //デストライド処理
      const kingDataRef = await firestore.collection('kingdata').where('segment_id','==', battleSegment);
      const kingsSegment = await kingDataRef.get();
      kingsSegment.forEach( (kingRecord) => {
        if (challengerSegment[0].elapsed_time < kingRecord.data().elapsed_time){
          deathStrideResult = {
            'result' : 'Win'
          }
          return response.status(200).send(deathStrideResult)
        } if(challengerSegment[0].elapsed_time > kingRecord.data().elapsed_time){
          deathStrideResult = {
            'result' : 'Lose'
          }
          return response.status(200).send(deathStrideResult)
        } else{
          console.warn(`king:${kingRecord.data().king_name}(${kingRecord.data().elapsed_time}) vs challenger(${challengerSegment[0].elapsed_time})`)
          deathStrideResult = {
            'result' : 'No Contest'
          }
          return response.status(200).send(deathStrideResult)
        }
      });
    }
    catch(error) {
      console.error(error);
      return response.status(500)
    }
})


//API認可
exports.stravaAuth = functions.https.onRequest((request, response) => {
  response.redirect(`${stravaconfig.auth_url}?client_id=${stravaconfig.client_id}&redirect_uri=${stravaconfig.redirect_uri}&response_type=code&scope=${stravaconfig.scope}&state=${stravaconfig.state}`)
});

exports.stravaAuthCallback = functions.https.onRequest(async (request, response) => {
  if(request.query['state'] !== stravaconfig.state){
    console.error('State Unmatch Error')
  }else{
    try {
      const Authentication = await axios.post(stravaconfig.token_url ,{
        client_id: stravaconfig.client_id,
        client_secret: stravaconfig.client_secret,
        code: request.query['code'],
        grant_type: 'authorization_code',
        state : stravaconfig.state
      })
        return response.redirect(`/?token=${Authentication.data.access_token}`);
    }
    catch(error){
      console.log(error);
    }
  }
});
