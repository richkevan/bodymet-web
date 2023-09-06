import { createContext, useContext, useEffect, useState } from "react"
import { firebaseApp } from "./firebase-app"
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser
} from "firebase/auth"

const firebaseAuth = getAuth(firebaseApp)

export const FirebaseAuthContext = createContext();

export const FirebaseAuthProvider = ({children}) => {
  const [firebaseUser, setFirebaseUser] = useState(firebaseAuth.currentUser)

  useEffect(() => {
   const subscribe = onAuthStateChanged(firebaseAuth, (user) => {
    setFirebaseUser(firebaseAuth.currentUser)
    if (user) {
      if (window.location.pathname === "/login" && user !== null) {
        window.location.pathname = "/dashboard"
      }
    } else {
      if (window.location.pathname !== "/login" && user === null) {
        window.location.pathname = "/login"
      }

    }
    return subscribe
   })
  },[firebaseAuth.currentUser])

  return (
    <FirebaseAuthContext.Provider value={firebaseUser}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}



export const useFirebaseAuth = () => {
  const user = useContext(FirebaseAuthContext)
  
  const signInEmail = ({email, password}) => {
    return signInWithEmailAndPassword(firebaseAuth, email, password)
  }
  
  const signUpUser = ({email, password}) => {
    return createUserWithEmailAndPassword(firebaseApp, email, password)
  }
  
  const signOutUser = () => {
    return signOut(firebaseAuth)
  }
  
  const deleteCurrentUser = () => {
    deleteUser()
  }

  return {
    user,
    signInEmail,
    signUpUser,
    signOutUser,
    deleteCurrentUser
  }
}
