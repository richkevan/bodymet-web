const { onCall } = require("firebase-functions/v2/https")
const  { log } = require("firebase-functions/logger")
const qs = require("qs")
const axios = require("axios")


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
      }
      if (!doc.exists || doc.data().expires_at.seconds * 1000 < Date.now()) {
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


exports.withingsGetMeasure = (firestoreDB) => onCall(
  async (request) => {
    
    const batch = firestoreDB.batch()

    const accessToken = await withingsRefreshAccessToken(firestoreDB, request.data.uid)
    log("ACCESS TOKEN: ", accessToken, accessToken.access_token)
    
    const measureData = async (offset) => {
    let measurments = []
    let paramsMeasure
    if (!offset) {
      paramsMeasure = qs.stringify({
        action: "getmeas",
        lastupdate: 0,
      })
    } else {
      paramsMeasure = qs.stringify({
        action: "getmeas",
        lastupdate: 0,
        offset: offset,
      })
    }

    const response = await withingsAxios.post('v2/measure', 
    paramsMeasure, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${accessToken.access_token}`},
    })
    log("RESPONSE: ", response.data)
    if (response.data.status === 0 && response.data.body.more) {
      measurments.push(...response.data.body.measuregrps)
      return await measureData(response.data.body.offset)
    } else if (response.data.status === 0) {
      measurments.push(...response.data.body.measuregrps)
      return measurments
    }
  }

  const measuregrpData = await measureData(null)
    if (measuregrpData) {
      measuregrpData.forEach((measuregrp) => {
          const measurementRef = firestoreDB.collection("Users").doc(request.data.uid).collection("withings_measure").doc(`${measuregrp.grpid}`)
          batch.set(measurementRef,{
            date: measuregrp.date,
            category: measuregrp.category,
            deviceid: measuregrp.deviceid,
            model: measuregrp.model,
            measures: measuregrp.measures.map(measure => (
              {
                withing_measurement_type_value: measure.type,
                value: measure.value * (10 ** measure.unit),
              })
            ),
            measure_types: measuregrp.measures.map(measure => (measure.type))
          })
        })
        await batch.commit()
        return "Success"
      }
    }
  )

exports.withingsGetActivity = (firestoreDB) => onCall(
  async (request) => {
    
      const batch = firestoreDB.batch()
      const accessToken = await withingsRefreshAccessToken(firestoreDB, request.data.uid)

      const getActivities = async (offset = null) => {
        let activities = []
        let paramsActivity 
        if (!offset) {
          paramsActivity = qs.stringify({
            action: "getactivity",
            lastupdate: 0,
            data_fields: "active,steps,distance,elevation,soft,moderate,intense,calories,totalcalories,hr_average,hr_min,hr_max,hr_zone_0,hr_zone_1,hr_zone_2,hr_zone_3"
          })
        } else {
          paramsActivity = qs.stringify({
            action: "getactivity",
            lastupdate: 0,
            offset: offset,
            data_fields: "active,steps,distance,elevation,soft,moderate,intense,calories,totalcalories,hr_average,hr_min,hr_max,hr_zone_0,hr_zone_1,hr_zone_2,hr_zone_3"
          })
        }

        const response = await withingsAxios.post('v2/measure',paramsActivity, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${accessToken.access_token}`},
        })

        if (response.data.status === 0 && response.data.body.more) {
          log("MORE: ", response.data.body.more, "OFFSET: ", response.data.body.offset)
          activities.push(...response.data.body.activities)
          return await getActivities(response.data.body.offset)
        } else if (response.data.status === 0) {
          log("NO MORE: ", response.data.body.more, "OFFSET: ", response.data.body.offset)
          activities.push(...response.data.body.activities)
          log("ACTIVITIES: ", activities)
          return activities
        }
      }
      
      const activityData = await getActivities(null)
      log("DATA: ", activityData)
      if (activityData) {
        activityData.forEach((activity) => {
          const activitiesRef = firestoreDB.collection("Users").doc(request.data.uid).collection("withings_activities").doc()
          batch.set(activitiesRef,{
            activity_duration: {
              soft: activity.soft,
              moderate: activity.moderate,
              intense: activity.intense,
              active: activity.active,
            },
            model: activity.model,
            timezone: activity.timezone,
            date: activity.date,
            activity_metrics: {
              distance: activity.distance,
              elevation: activity.elevation,
              steps: activity.steps,
            },
            activity_hr: {
              hr_average: activity?.hr_average,
              hr_min: activity.hr_min,
              hr_max: activity.hr_max,
              hr_zone_0: activity.hr_zone_0,
              hr_zone_1: activity.hr_zone_1,
              hr_zone_2: activity.hr_zone_2,
              hr_zone_3: activity.hr_zone_3,
              hr_zone_4: activity.hr_zone_4,
              hr_zone_5: activity.hr_zone_5,
            },
            calories: {
              calories: activity.calories,
              totalcalories: activity.totalcalories,
            },
          })
        })
      }
      await batch.commit()
        return "Success"
  })

exports.withingsGetWorkouts = (firestoreDB) => onCall(
  async (request) => {
      let workouts = []
      const batch = firestoreDB.batch()

      const accessToken = await withingsRefreshAccessToken(firestoreDB, request.data.uid)

      const workoutCall = async (offset = null) => {
        let paramsWorkouts = qs.stringify({
          action: "getworkouts",
          lastupdate: 0,
          // data: "calories,intensity,hr_average,hr_min,hr_max,hr_zone_1,hr_zone_2,hr_zone_3,,spo2_average,elevation,distance,steps"
        })
        if (offset) {
          paramsWorkouts = qs.stringify({
            action: "getworkouts",
            lastupdate: 0,
            offset: offset,
            // data: "calories,intensity,hr_average,hr_min,hr_max,hr_zone_1,hr_zone_2,hr_zone_3,,spo2_average,elevation,distance,steps"
          })
        }
        log("PARAMS: ", paramsWorkouts)

        let response  = await withingsAxios.post('v2/measure',paramsWorkouts, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${accessToken.access_token}`},
        })

        if (response.data.status === 0 && response.data.body.more) {
          workouts.push(...response.data.body.series)
           return await workoutCall(response.data.body.offset)
        } else if (response.data.status === 0 && !response.data.body.more) {
          workouts.push(...response.data.body.series)
          log("WORKOUTS: ", workouts)
          return workouts
        }
      }
      
      const workoutData = await workoutCall(null)
      log("WORKOUT DATA: ", workoutData)
      if (workoutData) {
      workoutData.forEach((workout) => {
        const workoutRef = firestoreDB.collection("Users").doc(request.data.uid).collection("withings_workouts").doc()
        batch.set(workoutRef,{
          date: workout.date,
          timezone: workout.timezone,
          model: workout.model,
          category: workout.category,
          startdate: workout.startdate,
          enddate: workout.enddate,
          workout_metrics: {
            hr: {
            hr_average: workout.hr_average,
            hr_min: workout.hr_min,
            hr_max: workout.hr_max,
            hr_zone_1: workout.hr_zone_1,
            hr_zone_2: workout.hr_zone_2,
            hr_zone_3: workout.hr_zone_3,
            },
            activity_metrics: {
              elevation: workout.elevation,
              distance: workout.distance,
              steps: workout.steps,
              intensity: workout?.intensity,
            },
            calories: workout.calories,
            spo2_average: workout?.spo2_average,
          },
        })
      })
    }
    await batch.commit()
    return "Success"
})