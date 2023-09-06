import { Metric } from "@tremor/react"
import { useContext, useEffect, useState } from "react"
import { measureType } from "../../context/measure_type"


const WeightHistory = ({doc}) => {
  const {measureRef} = useContext(measureType)

  useEffect(() => {
    console.log("WEIGHT HISTORY: ", measureRef.refrences)
  }, [measureRef])

    return (
        <div>
            <h1>Weight History</h1>
            {measureRef?.references && Object.keys(doc).map((key) => {
                if (key !== "date") {
              return (
                <Metric key={key}>
                    {measureRef.references.filter((measure) => measure.value == parseInt(key))[0].description}: {doc[key]}
                </Metric>
              )}
            })}
        </div>
    )
}

export default WeightHistory