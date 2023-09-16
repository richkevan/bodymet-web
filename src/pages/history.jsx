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
        setData(bloodPressure)
        break;
      case "heartrate":
        setData(heartRate)
        break;
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

  const avgHR = (data) => {
    let sum = 0
    data.forEach((doc) => {
      sum += doc.hr
    })
    return sum / data.length
  }

  const avgDiastolic = (data) => {
    let sum = 0
    data.forEach((doc) => {
      sum += doc.diastolic
    })
    return sum / data.length
  }

  const avgSystolic = (data) => {
    let sum = 0
    data.forEach((doc) => {
      sum += doc.systolic
    })
    return sum / data.length
  }

  const avgWeight = (data) => {
    let sum = 0
    data.forEach((doc) => {
      sum += parseFloat(doc[1])
    })
    return sum / data.length
  }

  return (
    <>
      <p>History</p>
      {type === "bloodpressure"  && <p>Average BP: {`${Math.round(avgSystolic(data))}/${Math.round(avgDiastolic(data))}`}</p>}
      {type === "heartrate" && <p>Average HR: {Math.round(avgHR(data))}</p>}
      {type === "weight" && <p>Average Weight: {avgWeight(data).toFixed(2)} kgs</p>}
      <div className="flex flex-col gap-2 overflow-y-scroll">
      {data.map((doc) => {
      return (
        <Card>
        <Text>{new Date(doc.date * 1000).toUTCString()}</Text>
        <div className="flex flex-row gap-4">
        {(type === "bloodpressure") && <Hearthistory doc={doc} />}
        {type === "weight" && <WeightHistory doc={doc} />}
        {type === "heartrate" && <Metric>{doc.hr} BPM</Metric>}
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