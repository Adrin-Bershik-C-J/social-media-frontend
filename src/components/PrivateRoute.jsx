import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token"); // or use auth context

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
