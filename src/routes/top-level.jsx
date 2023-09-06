import LoginForm from "../components/login";
import LogoutForm from "../components/logout";
import Dashboard from "../pages/dashboard";
import History from "../pages/history";
import Profile from "../pages/profile";
import ApiCallbackHandler from "../pages/callback"

import { getMeasureRef } from "../firebase/firebase-firestore";
import { defer } from "react-router";

export const TopRoutes = [
  {
    label: "Dashboard",
    path: "/dashboard",
    element: <Dashboard />,
    display: true,
    loader: async () =>
      await getMeasureRef()
      .then((response) => {
        return defer({
          response
        })
      })
      .catch((err) => {
        console.log(err)
        return ({error: err})
      })
  },
  {
    label: "History",
    path: "/history/:type",
    element: <History />,
    display: true
  },
  {
    label: "Profile",
    path: "/profile",
    element: <Profile />,
    display: true
  },
  {
    label: "",
    path: "/logout",
    element: <LogoutForm />,
    display: false
  },
  {
    label: "Login",
    path: "/login",
    element: <LoginForm />,
    display: false
  },
  {
    label: "Api Callback Handler",
    path: "api/callback",
    element: <ApiCallbackHandler />,
    display: false
  }
]