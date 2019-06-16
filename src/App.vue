<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span class="font-weight-light">Wellcome to 闇ロード界</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="info" v-on:click="getStravaAthleteInfo">Get your Strava Info!</v-btn>
    </v-toolbar>

    <v-content>
      <v-btn color="info" v-on:click="stravaAuth">Start with Strava</v-btn>
      <div>{{ userdata }}</div>
    </v-content>
  </v-app>
</template>

<script>
import axios from 'axios'

const API = axios.create({
  baseURL: '/api/'
})

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      userdata: '',
      accessToken: ''
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
        console.log(response);
        this.userdata = response.data;
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
