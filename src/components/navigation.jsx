import { NavLink } from "react-router-dom";
import { TopRoutes } from "../routes/top-level";

const Navigation = () => {

  return (
    <div className="flex flex-row gap-1 mx-2 align-end">
      {TopRoutes.map((route) => (
        <div key={route.label}>
          {route.display && <NavLink to={route.path}>{route.label}</NavLink>}
        </div>
      ))}
      <NavLink to="/logout" id="logout">logout</NavLink>
    </div>
  )
}

export default Navigation