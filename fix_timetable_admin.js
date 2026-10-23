const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require('./firestore.indexes.json')) // Wait, we don't have service account key
});
