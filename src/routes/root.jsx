import { createBrowserRouter } from "react-router-dom"
import App from "../App"
import { TopRoutes } from "./top-level"
import FourZeroFour from "../pages/404"

export const Root = createBrowserRouter([
  {
    label: "Root",
    path: "/",
    element: <App />,
    children: TopRoutes,
    errorElement: <FourZeroFour />
  }
])