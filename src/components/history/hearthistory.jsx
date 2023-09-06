import { Metric } from "@tremor/react"
import { useEffect } from "react"

const Hearthistory = ({doc}) => {

useEffect(() => {
  console.log("doc: ", doc)
}, [doc])
return (
  <>
  <Metric style={{background:doc.color}}>
  <span class="material-symbols-outlined text-3xl text-white">
  blood_pressure
  </span>
  {doc.systolic}/{doc.diastolic} mm Hg</Metric>
  </> 
)}

export default Hearthistory