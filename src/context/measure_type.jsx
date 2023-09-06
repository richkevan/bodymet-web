import { createContext, useEffect, useState } from "react";
import { getMeasureRef } from "../firebase/firebase-firestore";


export const measureType = createContext()

const MeasureTypeProvider = ({children}) => {
  const [measureRef, setMeasureRef] = useState([])

  useEffect(() => {
    getMeasureRef()
    .then((response) => {
      console.log("MEASURE REF CONTEXT: ", response)
      setMeasureRef(response)
    })
    .catch((err) => {
      console.log(err)
    })
  }, [])

  return (
    <measureType.Provider value={{measureRef}}>
      {children}
    </measureType.Provider>
  )
}

export default MeasureTypeProvider