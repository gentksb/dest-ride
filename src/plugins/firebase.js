import firebase from "firebase";

const config = {
  apiKey: "AIzaSyD-4YCTJev0CDdCES66jWnloCLbVuZfxw8",
  authDomain: "destride-d2da0.firebaseapp.com",
  databaseURL: "https://destride-d2da0.firebaseio.com",
  projectId: "destride-d2da0",
  storageBucket: "destride-d2da0.appspot.com",
  messagingSenderId: "734987339576",
  appId: "1:734987339576:web:571531f1780a8f5f"
};
firebase.initializeApp(config);
export const functions = firebase.functions();