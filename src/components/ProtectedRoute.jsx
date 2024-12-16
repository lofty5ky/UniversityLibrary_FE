import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" />; 
  }

  try {
    const { roles } = JSON.parse(atob(token.split(".")[1]));
    if (allowedRoles.some((role) => roles.includes(role))) {
      return children; 
    } else {
      return <Navigate to="/403" />; 
    }
  } catch (error) {
    console.error("Token không hợp lệ:", error);
    return <Navigate to="/" />;
  }
};

export default ProtectedRoute;