import { useEffect } from "react"
import { useFirebaseAuth } from "../firebase/firebase-auth"
import { useNavigate } from "react-router"


const LogoutForm = () => {
  const {signOutUser} = useFirebaseAuth()
  const navigate = useNavigate()
  useEffect(() => {
    signOutUser()
    navigate("/")
  },[])

  return (
    <></>
  )
}

export default LogoutForm