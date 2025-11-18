const admin = require('firebase-admin');
const serviceAccount = require('./soil-backend-firebase-adminsdk-fbsvc-640611e583.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;