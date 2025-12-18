// const admin = require('firebase-admin');

// // Load service account from environment variable
// const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://walksafe-44d43-default-rtdb.asia-southeast1.firebasedatabase.app/"
// });

// module.exports = admin;


const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
  serviceAccount = require("../serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://walksafe-44d43-default-rtdb.asia-southeast1.firebasedatabase.app/",
});

module.exports = admin;
