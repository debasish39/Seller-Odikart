import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function PendingApproval() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get("/auth/me");

        if (res.data.user.sellerStatus === "approved") {
          navigate("/seller/dashboard");
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkStatus();

    // Check every 10 seconds
    const interval = setInterval(checkStatus, 10000);

    return () => clearInterval(interval);
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <h1>Your Seller Account is Under Review</h1>

      <p>
        Your seller application has been submitted successfully.
      </p>

      <p>
        Please wait while our team reviews your application.
      </p>

      <p>
        Once approved, you will automatically get access to the Seller Dashboard.
      </p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default PendingApproval;