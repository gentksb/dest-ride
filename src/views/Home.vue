<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span class="font-weight-light">Destride web</span>
      </v-toolbar-title>
    </v-toolbar>

    <v-content>
      <div v-if="!userdata">
        <a href="../stravaAuth"><img src="../assets/btn_strava_connectwith_orange.svg"></a>
      </div>
      <div class="main_block" v-else>
        <div class="profile_box">
          <div class="profile_image">
            <img v-bind:src="userdata.profile_medium">
          </div>
          Login as <b>{{ userdata.username }}</b>
        </div>
        <div class="activitylist">
          <v-btn @click="listRecentActivities" color="info">デストライド可能なアクティビティを取得する</v-btn>
          <h2>最近のアクティビティ</h2>
          <table class="activityList">
            <tr>
              <td>Name</td><td>Distance</td><td>Type</td>
            </tr>
            <tr v-for="activity in recentActivities" v-bind:key="activity.external_id">
              <td>{{activity.name}}</td><td>{{activity.average_speed}}</td><td>{{activity.distance/1000}}km</td><td>{{activity.type}}</td><td><v-btn @click="getSegmentsOfActivity(activity.id)">Get Segments</v-btn></td>
            </tr>
          </table>
        </div>
      </div>  

      <div class="destride" v-if="segmentList">
        <h2>デストライドできるセグメント</h2>
        <table class="segmentList">
          <tr>
            <td>Name</td><td>date</td>
          </tr>
          <tr v-for="segment in segmentList" v-bind:key="segment.id">
            <td>{{segment.name}}</td><td>{{segment.start_date_local}}</td><td><v-btn @click="deathStride(segment.id,segment.activity.id)">デストライドする</v-btn></td>
          </tr>
        </table>
      </div>

      <div v-if="alartMessage">
        <v-alert class="alart" type="success" :value="true">
          {{ alartMessage }}
        </v-alert>
      </div>

      <div class="poweredby">
        <img src="../assets/api_logo_pwrdBy_strava_horiz_light.svg">
      </div>
    </v-content>
  </v-app>
</template>

<script>
import axios from 'axios'
import firebase from 'firebase'

const API = axios.create({
  baseURL: '/api/'
})

const destrideSegmentArray = [63488041626];

const isDestrideCourse = (inputSegment) =>{
  return destrideSegmentArray.includes(inputSegment.id)
}

export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      userdata: '',
      recentActivities:{},
      accessToken: '',
      segmentList: '',
      alartMessage: ''
    }
  },
  created: function(){
    if(!this.$route.query.token){
      return
    }
    else{
      this.accessToken = this.$route.query.token;
      this.getStravaAthleteInfo();
    }
  },
  methods: {
    getStravaAthleteInfo: function(){
      const accessToken = this.accessToken
      API.get('/Athlete', {
        params: {
          accessToken
        }
      })
      .then((response) => {
        this.userdata = response.data;
      })
      .catch((error) => {
        console.log(error);
      })
    },
    listRecentActivities: function(){
      const accessToken = this.accessToken
      API.get('/listRecentActivities',{
        params:{
          accessToken
        }
      })      
      .then((response) => {
        this.recentActivities = response.data;
      })
      .catch((error) => {
        console.log(error);
      })
    },
    getSegmentsOfActivity: function(activityId){
      const accessToken = this.accessToken
      API.get('/getSegmentsOfActivity',{
        params:{
          accessToken,
          activityId
        }
      })      
      .then((response) => {
        this.segmentList = response.data.filter(isDestrideCourse);
      })
      .catch((error) => {
        console.log(error);
      })
    },
    deathStride: function(segmentId,activityId){
      const accessToken = this.accessToken
      API.get('/deathStride',{
        params:{
          accessToken,
          segmentId,
          activityId
        }
      })      
      .then((response) => {
        console.log(response.data)
        this.alartMessage = response.data;
      })
      .catch((error) => {
        console.log(error);
      })
    },
    stravaAuth: function(){
      axios.get('/stravaAuth')
    } 
  }
}
</script>

<style>
  .poweredby {
    width: 30%;
    position:fixed;
    bottom: 0px;
    right:0px;
  }
</style>
