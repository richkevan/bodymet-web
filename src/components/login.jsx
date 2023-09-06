import { useState } from "react"
import { useFirebaseAuth } from "../firebase/firebase-auth"
import { useNavigate } from "react-router"

const LoginForm = () => {
  const {signInEmail, user} = useFirebaseAuth()
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    signInEmail({email:e.target[0].value, password: e.target[1].value})
    .then(() => {
      navigate("/dashboard")
    })
    .catch((err) => {
      console.log(err)
    })
      e.target[0].value = "";
      e.target[1].value = "";
  }
  return (
    <form className="flex flex-col gap-1.5" onSubmit={handleLogin}>
      <div className="flex flex-col gap-.5">
        <label htmlFor="email-login">Email</label>
        <input 
        name="email-login" 
        type="email" 
        placeholder="Email" 
        autoComplete="email"
          className="margin-start-auto"
        
        />
      </div>
      <div className="flex flex-col gap-.5">
        <label htmlFor="password-login">Password</label>
        <input 
        name="password-login" 
        type="password" 
        placeholder="Password" autoComplete="current-password"
          
        />
      </div>
      <button 
      type="submit"
      className="submit-button"
      >Login</button>
    </form>
  )
}

export default LoginForm