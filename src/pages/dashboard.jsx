import { Suspense, useContext, useEffect, useState } from "react"
import { Card, Text, Metric, ProgressBar } from "@tremor/react"
import { useFirebaseAuth } from "../firebase/firebase-auth"
import { BarChart, XAxis, YAxis, Tooltip, Bar, Cell, LineChart, Line, ResponsiveContainer } from "recharts"
import { NavLink } from "react-router-dom"
import { userMeasurements } from "../context/user_measurements"
import { measureType } from "../context/measure_type"

const Dashboard = () => {
  const {user} = useFirebaseAuth()
  const {measureRef} = useContext(measureType)
  const {bloodPressure, heartRate, weight, temperature} = useContext(userMeasurements)
  const [bpmRange, setBPMRange] = useState(180)
  const [hrRange, setHRRange] = useState(180)
  const [weightRange, setWeightRange] = useState(180)

  const handleWeightRange = (event) => {
    setWeightRange(event.target.value)
  }

  const handleBPMRange = (event) => {
    setBPMRange(event.target.value)
  }

  const handleHRRange = (event) => {
    setHRRange(event.target.value)
  }

  const dataFormatted = (number) => `${number[0]}/${number[1]} mm Hg`

  return (
    <>
    <p>Dashboard</p>
    <Suspense fallback={<div>Loading...</div>}>
    <div className="flex flex-col gap-2">
    <div className="flex flex-row flex-wrap gap-4">
    <Card className="w-1/4">
      <Text>Age</Text>
      <Metric>40</Metric>
    </Card>
    <Card className="w-1/4">
        <Text>Height</Text>
        <Metric>6' 2"</Metric>
    </Card>
    <Card className="w-1/4">
      <Text>Weight</Text>
      <Metric>265 Lbs.</Metric>
    </Card>
    <Card className="w-1/4">
      <Text>Sex</Text>
      <Metric>Male</Metric>
    </Card>
    <Card className="w-1/4">
      <Text>Activity Level</Text>
      <Metric>Active</Metric>
        <Text>More active than 70% of users</Text>
        <ProgressBar value={70} />
    </Card>
    <Card className="w-1/4">
      <Text>Goal</Text>
      <Metric>Weight Loss</Metric>
    </Card>
    </div>
    <div className="flex flex-col gap-2">
     <Card className=" h-[45vh]">
     <div className="flex flex-row gap-2">
        <Text>Blood Pressure Trends</Text>
        <button value={7} onClick={handleBPMRange}>7 Days</button>
        <button value={30} onClick={handleBPMRange}>30 Days</button>
        <button value={90} onClick={handleBPMRange}>90 Days</button>
        <button value={180} onClick={handleBPMRange}>6 Months</button>
        <NavLink to={"/history/bloodpressure"}>Full History</NavLink>
        </div>
        <ResponsiveContainer>
          <BarChart width={1200} height={300} data={bloodPressure.filter((BPM) => (BPM.date > new Date(Date.now() - 1000*60*60*24
        *bpmRange)))} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
            <XAxis dataKey="date" tickFormatter={(tick) => {
          return new Date(tick).toLocaleDateString().slice(0, -5)
          + "/" + new Date(tick).getFullYear().toString().slice(2,4)
        }}/>
            <YAxis type="number"  domain={[40, 160]}/>
            <Tooltip formatter={dataFormatted} contentStyle={{background: "#282c34"}}/>
            <Bar dataKey="bp">
              {bloodPressure.filter((BPM) => (BPM.date > new Date(Date.now() - 1000*60*60*24
        *bpmRange))).map((entry, index) => {
                return <Cell fill={`${entry.color}`} />
              })}
            </Bar>
          </BarChart>
      </ResponsiveContainer>
      </Card>
      <Card className=" h-[35vh]">
        
        <div className="flex flex-row gap-2">
        <Text>Heart Rate Trends</Text>
        <button value={7} onClick={handleHRRange}>7 Days</button>
        <button value={30} onClick={handleHRRange}>30 Days</button>
        <button value={90} onClick={handleHRRange}>90 Days</button>
        <button value={180} onClick={handleHRRange}>6 Months</button>
        <NavLink to={"/history/heartrate"}>Full History</NavLink>
        </div>
      <ResponsiveContainer>
        <LineChart data={heartRate.filter((hr) => (hr.date > new Date(Date.now() - 1000*60*60*24
        *hrRange)))} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
          <XAxis dataKey="date" tickFormatter={(tick) => {
          return new Date(tick).toLocaleDateString().slice(0, -5)
          + "/" + new Date(tick).getFullYear().toString().slice(2,4)
        }}/>
          <YAxis />
          <Tooltip formatter={(value) => `${value} bpm`} contentStyle={{background: "#282c34"}}/>
          <Line type="monotone" dataKey="hr" stroke="green" />
        </LineChart>
      </ResponsiveContainer>
      </Card>
    </div>
    </div>
    <div>
      <Card className=" h-[35vh]">
      <div className="flex flex-row gap-2">
        <Text>Weight Trends</Text>
        <button value={7} onClick={handleWeightRange}>7 Days</button>
        <button value={30} onClick={handleWeightRange}>30 Days</button>
        <button value={90} onClick={handleWeightRange}>90 Days</button>
        <button value={180} onClick={handleWeightRange}>6 Months</button>
        <NavLink to={"/history/weight"}>Full History</NavLink>
        </div>
        <ResponsiveContainer>
        <LineChart data={weight.filter((whgt) => (whgt.date > new Date(Date.now() - 1000*60*60*24
        *weightRange)))} margin={{top: 20, right:5, bottom: 20, left: 5}}>
        <XAxis dataKey={'date'}  tickFormatter={(tick) => {
          return new Date(tick).toLocaleDateString().slice(0, -5)
          + "/" + new Date(tick).getFullYear().toString().slice(2,4)
        }}/>
        <YAxis />
        <Tooltip formatter={(value) => `${value} kgs`} contentStyle={{background: "#282c34"}}/>
        <Line type="montone" dataKey="1" stroke="green"/>
        </LineChart>
        </ResponsiveContainer>
      </Card>
    </div> 
    </Suspense>
    </>
  )
}

export default Dashboard