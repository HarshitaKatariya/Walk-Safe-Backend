const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://walksafe-44d43-default-rtdb.asia-southeast1.firebasedatabase.app/" 
})

module.exports = admin;