import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../services/api";

function ProtectedRoute({ children, role }) {

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {

    const fetchUser = async () => {

      try {

        const res = await api.get("/auth/me");

        setUser(res.data.user);

      } catch (error) {

        localStorage.removeItem("token");

      } finally {

        setLoading(false);

      }

    };

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }

  }, [token]);

  if (loading) return <h2>Loading...</h2>;

  if (!token) {
    return <Navigate to="/" />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  if (
    role === "seller" &&
    user.sellerStatus !== "approved"
  ) {
    return <Navigate to="/seller/pending" />;
  }

  return children;
}

export default ProtectedRoute;