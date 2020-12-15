import firebase from "firebase/app";

import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXhgEkazF-1n8mnDmXNPWqPIRrxxXYask",
  authDomain: "classesfyi.firebaseapp.com",
  databaseURL: "https://classesfyi.firebaseio.com",
  projectId: "classesfyi",
  storageBucket: "classesfyi.appspot.com",
  messagingSenderId: "1033548753786",
  appId: "1:1033548753786:web:db5a4c4ab977af2fdd44c3",
};

const fire = firebase.initializeApp(firebaseConfig);

if (import.meta.env.MODE === "development") {
  console.warn("Running firebase client in dev mode");
  fire.auth().useEmulator("http://localhost:9099/");
  fire.firestore().useEmulator("localhost", 8080);
}

export default fire;
