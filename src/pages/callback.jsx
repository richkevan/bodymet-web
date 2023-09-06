import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { withingsGetMeasure, withingsGetActivity, withingsGetWorkouts, getWithingsReqToken, withingsGetUserGoals } from "../firebase/firebase-functions"
import {useFirebaseAuth} from "../firebase/firebase-auth"
import { useNavigate } from "react-router-dom"

const ApiCallbackHandler = () => {
  const [params, setSearchParams] = useSearchParams()
  const [withings, setWithings] = useState()
  const {user} = useFirebaseAuth()
  const navigation = useNavigate()

  useEffect(() => {
    if (user && params.get("code")) {
      getWithingsReqToken({code: params.get("code"), uid: user.uid})
      .then(async (response) => {
        console.log(response)
        await withingsGetMeasure({uid: user?.uid})
        await withingsGetActivity({uid: user?.uid})
        await withingsGetWorkouts({uid: user?.uid})
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        navigation("/dashboard")
      })
    }
  }, [params, user])

  // const getgoals = async () => {
  //   const goals = await withingsGetUserGoals({uid: user.uid})
  //   console.log("GOALS: ", goals)
  // }

    
  

  return (
    <>
    </>
  )
}

export default ApiCallbackHandler