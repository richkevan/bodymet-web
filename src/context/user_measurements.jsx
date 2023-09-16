import { createContext, useEffect, useState } from 'react'
import { getBPMMeasure, getTemperatureMeasure, getWeightMeasure } from '../firebase/firebase-firestore'
import { useFirebaseAuth } from '../firebase/firebase-auth'

export const userMeasurements = createContext()

const UserMeasurementsProvider = ({children}) => {
  const {user} = useFirebaseAuth()
  const [bloodPressure, setBloodPressure] = useState([])
  const [weight, setWeight] = useState([])
  const [temperature, setTemperature] = useState([])
  const [heartRate, setHeartRate] = useState([])
  const [activities, setActivities] = useState([])
  const [workouts, setWorkouts] = useState([])
  

  const setColor = async (systolic, diastolic) => {
  
    switch (true) {
      case systolic > 130 || diastolic > 80:
        return "red"
      case systolic > 120 && diastolic < 80:
        return "orange"
      case systolic < 120 || diastolic < 80:
        return "green"
      case systolic < 90 || diastolic < 60:
        return "cyan"
      default:
        return "green"
    }
  }

  useEffect(() => {
      console.log("USER: ", user)
      if (!user) return
      if (bloodPressure.length > 0 || heartRate.length > 0 || weight.length > 0) return
      console.log("USER EXISTS AND METRIC LENGTH IS 0")
      getBPMMeasure(user?.uid)
      .then((response) => {
        response.sort((a,b) => a.date - b.date)
        response.forEach(async (doc) => {
          let color = await setColor(doc.measures[1].value, doc.measures[0].value)
          setBloodPressure((prev) => [...prev, {
            bp:[doc.measures[1].value,doc.measures[0].value], 
            diastolic:doc.measures[0].value, 
            systolic:doc.measures[1].value, 
            date: new Date(doc.date * 1000),
            color: color
          }])
          setHeartRate((prev) => [...prev, {
            hr:doc.measures[2].value,
            date: new Date(doc.date * 1000)
          }])
        })
      })
      getWeightMeasure(user?.uid)
      .then((response) => {
        response.sort((a,b) => a.date - b.date)
        response.forEach((doc) => {
          let measure = doc.measures.map((measure) => {
            return {[measure.withing_measurement_type_value]: measure.value.toFixed(2)}
          })
          setWeight((prev) => [...prev, Object.assign({
            date: new Date(doc.date * 1000)
            
          }, ...measure)])
        })
      })
      getTemperatureMeasure(user?.uid)
      .then((response) => {
        setTemperature(response)
      })
  }, [user, window.location.pathname])

  return (
    <userMeasurements.Provider value={{bloodPressure, weight, temperature, heartRate, activities, workouts}}>
      {children}
    </userMeasurements.Provider>
  )
}

export default UserMeasurementsProvider