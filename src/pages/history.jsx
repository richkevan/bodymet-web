import { useContext, useEffect, useState } from "react"
import { useFirebaseAuth } from "../firebase/firebase-auth"
import { useParams } from "react-router-dom"
import { getBPMMeasure, getWeightMeasure } from "../firebase/firebase-firestore"
import { Card, Metric, Text } from "@tremor/react"
import Hearthistory from "../components/history/hearthistory"
import WeightHistory from "../components/history/weighthistory"
import { userMeasurements } from "../context/user_measurements"
import { useNavigate } from "react-router"
import { measureType } from "../context/measure_type"

const History = () => {
  const {user} = useFirebaseAuth()
  const {measureRef} = useContext(measureType)
  const {bloodPressure, heartRate, weight, temperature} = useContext(userMeasurements)
  const {type} = useParams()
  const [data, setData] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    console.log("weight: ", weight)
    console.log("bloodpressure: ", bloodPressure)
    console.log("heartRate: ", heartRate)
    console.log("temperature: ", temperature)
    switch (type) {
      case "bloodpressure":
      case "heartrate":
        
          setData(bloodPressure)
        break
      case "weight":
        setData(weight)
        break;
      case "temperature":
        setData(temperature)
        break
      default:
        console.log("default")
        navigate("/dashboard")
        break
    }
  }, [bloodPressure, heartRate, weight, temperature])

  return (
    <>
      <p>History</p>
    {
      data ? 
      <div className="flex flex-col gap-2">
      {data.map((doc) => {
      return (
        <Card>
        <Text>{new Date(doc.date * 1000).toUTCString()}</Text>
        <div className="flex flex-row gap-4">
        {(type === "bloodpressure" || type === "heartrate") && <Hearthistory doc={doc} />}
        {type === "weight" && <WeightHistory doc={doc} />}
        </div>
        </Card>
      )
      })} 
      </div>: <p>No data</p>
    }
    </>
  )
}

export default History