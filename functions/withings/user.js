const { onCall } = require("firebase-functions/v2/https");
const { log } = require("firebase-functions/logger");
const qs = require("qs");
const axios = require("axios");

const withingsAxios = axios.create({
  baseURL: process.env.WITHINGS_API_ENDPOINT
})

const withingsRefreshAccessToken = async (firestoreDB,uid) => {
  let tokenPromise = new Promise((resolve, reject) => {
    const docRef = firestoreDB.collection("withing_authorization").doc(uid)
    docRef.get()
    .then(async (doc) => {
      log("DOC: ", doc.data().expires_at.seconds*1000, "NOW: ", Date.now(), "DATE EXPIRED: ", doc.data().expires_at.seconds*1000 < Date.now())
      if (doc.exists && doc.data().expires_at.seconds * 1000 > Date.now()) {
        log("Returning token firestore access token")
        resolve(doc.data())
      } else {
        const params = qs.stringify({
          action: "requesttoken",
          grant_type: "refresh_token",
          client_id: process.env.WITHINGS_CLIENT_ID,
          client_secret: process.env.WITHINGS_CLIENT_SECRET,
          refresh_token: doc.data().refresh_token,
        })
        log("PARAMS: ", params)
        const response = await withingsAxios.post('v2/oauth2', params)
        log("REFRESH TOKEN DATA: ", response)
        firestoreDB
        .doc(`withing_authorization/${uid}`)
        .set({
          withings_id: response.data.body.userid,
          refresh_token: response.data.body.refresh_token,
          access_token: response.data.body.access_token,
          created_at: new Date(Date.now()),
          expires_at: new Date(Date.now() + (response.data.body.expires_in * 1000))
        })
        log("REFRESH TOKEN: ", response.data)
        resolve(response.data.body)
      }
    })
    .catch((err) => {
      log(err)
    })
  })
  return tokenPromise
}


exports.withingsGetUserGoals = (firestoreDB) => onCall(
  async (request) => {
    const token = await withingsRefreshAccessToken(firestoreDB, request.data.uid)
    log("TOKEN: ", token)
    const params = qs.stringify({
      action: "getgoals",
    })
    log("PARAMS: ", params)
    const response = await withingsAxios.post('v2/user', params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token.access_token}`},
    })
    log("USER GOALS: ", response.data)
    return response.data
  }
)