import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyAtsLninKgLQ_mmUSv32AWPuWILsTxM00w",
  authDomain: "practicum-timeslot-scheduler.firebaseapp.com",
  databaseURL: "https://practicum-timeslot-scheduler.firebaseio.com",
  projectId: "practicum-timeslot-scheduler",
  storageBucket: "",
  messagingSenderId: "266432819239"
};

firebase.initializeApp(config);

export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth