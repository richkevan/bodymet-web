import { getFunctions, httpsCallable} from "firebase/functions"
import { firebaseApp } from "./firebase-app"

const functions = getFunctions(firebaseApp)

const getWithingsReqToken = httpsCallable(functions, "withingsreqtoken")
const withingsGetMeasure = httpsCallable(functions, "withingsgetmeasures")
const withingsGetActivity = httpsCallable(functions, "withingsgetactivity")
const withingsGetWorkouts = httpsCallable(functions, "withingsgetworkouts")

const withingsGetUserGoals = httpsCallable(functions, "withingsgetusergoals")

export {
  getWithingsReqToken,
  withingsGetMeasure,
  withingsGetActivity,
  withingsGetWorkouts,
  withingsGetUserGoals,
}