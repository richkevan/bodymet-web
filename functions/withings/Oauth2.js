const { onCall } = require("firebase-functions/v2/https")

const  { log } = require("firebase-functions/logger")
const qs = require("qs")
 const axios = require("axios")
 const CryptoJS = require("crypto-js")
 const sha256 = require("crypto-js/sha256")
 

const withingsAxios = axios.create({
   baseURL: process.env.WITHINGS_API_ENDPOINT,
   headers: { "Content-Type": "application/x-www-form-urlencoded"}
 })

exports.withingsReqToken = (admin, firestoreDB) => onCall(
  async (request) => {
    log(request.data)
    const params = qs.stringify({
      action: "requesttoken",
      grant_type: "authorization_code",
      client_id: process.env.WITHINGS_CLIENT_ID,
      client_secret: process.env.WITHINGS_CLIENT_SECRET,
      code: request.data.code,
      redirect_uri: process.env.WITHINGS_REDIRECT_URI,
      mode: "demo"
    })
    log(params)
    const response = await withingsAxios.post('v2/oauth2', params)
    log("DATA: ", response.data)
      firestoreDB
      .doc(`withing_authorization/${request.data.uid}`)
      .set({
        withings_id: response.data.body.userid,
        refresh_token: response.data.body.refresh_token,
        access_token: response.data.body.access_token,
        created_at: new Date(Date.now()),
        expires_at: new Date(Date.now() + (response.data.body.expires_in * 1000))
    })
    return response.data.body   
  }
)

exports.withingsGetnonce = (firestoreDB) => onCall(
  async (request) => {
    const timeStamp = Math.floor(Date.now()/1000)
    const string = `getnonce,${process.env.WITHINGS_CLIENT_ID},${timeStamp}`
    console.log(string)
    const hash = CryptoJS.HmacSHA256(string, process.env.WITHINGS_CLIENT_SECRET).toString()
    
    const params = qs.stringify({
      action: "getnonce",
      client_id: process.env.WITHINGS_CLIENT_ID,
      timestamp: timeStamp,
      signature: hash
    })
    const response = await withingsAxios.post('v2/signature',params)

    log("DATA: ", response.data,)
    return {nonce:response.data.body.nonce, signature:hash}
  }
)

// exports.withingsRefreshAccessToken = (firestoreDB) => onCall(
//   async (request) => {
//     const docRef = firestoreDB.collection("withing_authorization").doc(request.data.uid)
    
//     docRef.get()
//     .then((doc) => {
//       if (doc.exists && doc.data().expires_at < Date.now()) {
//         return doc.data().access_token
//       } else {
//         const params = qs.stringify({
//           action: "requesttoken",
//           grant_type: "refresh_token",
//           client_id: process.env.WITHINGS_CLIENT_ID,
//           client_secret: process.env.WITHINGS_CLIENT_SECRET,
//           refresh_token: doc.data().refresh_token,
//         })
//         const response =  withingsAxios.post('v2/oauth2', params)
//         log("DATA: ", response.data)
//         firestoreDB
//         .doc(`withing_authorization/${request.data.uid}`)
//         .set({
//           withings_id: response.data.body.userid,
//           refresh_token: response.data.body.refresh_token,
//           access_token: response.data.body.access_token,
//           created_at: new Date(Date.now()),
//           expires_at: new Date(Date.now() + (response.data.body.expires_in * 1000))
//         })
//         return response.data.body.access_token
//       }
//     })
//     .catch((err) => {
//       log(err)
//     })
//   })


exports.withingsRefreshAccessToken = async (firestoreDB,uid) => {
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