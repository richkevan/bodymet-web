const { initializeApp } = require("firebase-admin/app")
const admin = require("firebase-admin")
const { getFirestore } = require("firebase-admin/firestore")
const { withingsReqToken, withingsGetnonce } = require("./withings/Oauth2")
const { withingsGetMeasure, withingsGetActivity, withingsGetWorkouts } = require("./withings/measure")
const { withingsGetUserGoals } = require("./withings/user")

initializeApp()
const firestoreDB = getFirestore()
firestoreDB.settings({
  ignoreUndefinedProperties: true,
})

// Withings API
exports.withingsreqtoken = withingsReqToken(admin, firestoreDB)
// exports.withingsrefreshtoken = withingsRefreshAccessToken(firestoreDB)
exports.withingsgetnonce = withingsGetnonce(firestoreDB)

exports.withingsgetmeasures = withingsGetMeasure(firestoreDB)
exports.withingsgetactivity = withingsGetActivity(firestoreDB)
exports.withingsgetworkouts = withingsGetWorkouts(firestoreDB)

exports.withingsgetusergoals = withingsGetUserGoals(firestoreDB)