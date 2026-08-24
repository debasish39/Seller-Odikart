import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import api from "../services/api";


function ProtectedRoute({
  children,
  role,
}) {

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState(null);


  useEffect(() => {

    const token =
      localStorage.getItem("token");


    if (!token) {

      setLoading(false);
      return;

    }


    const fetchUser = async () => {

      try {

        const response =
          await api.get("/auth/me");


        const currentUser =
          response.data?.user;


        console.log(
          "================================"
        );

        console.log(
          "🔐 PROTECTED ROUTE"
        );

        console.log(
          "Current User:",
          currentUser
        );

        console.log(
          "Role:",
          currentUser?.role
        );

        console.log(
          "Seller Status:",
          currentUser?.sellerStatus
        );

        console.log(
          "Seller Verification:",
          currentUser?.sellerVerificationStatus
        );

        console.log(
          "Active Mode:",
          currentUser?.activeMode
        );

        console.log(
          "================================"
        );


        setUser(currentUser);

      } catch (error) {

        console.error(
          "❌ /auth/me failed:",
          error
        );

        localStorage.removeItem(
          "token"
        );

        setUser(null);

      } finally {

        setLoading(false);

      }

    };


    fetchUser();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">

        <h2>
          Checking authentication...
        </h2>

      </div>
    );

  }


  /*
  |--------------------------------------------------------------------------
  | NO USER
  |--------------------------------------------------------------------------
  */

  if (!user) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ACCOUNT BLOCKED
  |--------------------------------------------------------------------------
  */

  if (user.isBlocked) {

    localStorage.removeItem(
      "token"
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ACCOUNT DELETED
  |--------------------------------------------------------------------------
  */

  if (user.isDeleted) {

    localStorage.removeItem(
      "token"
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ROLE CHECK
  |--------------------------------------------------------------------------
  */

  if (
    role &&
    user.role !== role
  ) {

    console.warn(
      "❌ Wrong role:",
      user.role
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /*
  |--------------------------------------------------------------------------
  | SELLER CHECK
  |--------------------------------------------------------------------------
  */

  if (role === "seller") {

    console.log(
      "🏪 SELLER AUTHORIZATION"
    );


    /*
     * Seller application
     */

    if (
      user.sellerStatus !==
      "approved"
    ) {

      console.warn(
        "❌ Seller application:",
        user.sellerStatus
      );

      return (
        <Navigate
          to="/seller/pending"
          replace
        />
      );

    }


    /*
     * Seller KYC
     */

    if (
      user.sellerVerificationStatus !==
      "approved"
    ) {

      console.warn(
        "❌ Seller KYC:",
        user.sellerVerificationStatus
      );

      return (
        <Navigate
          to="/seller/pending"
          replace
        />
      );

    }


    console.log(
      "✅ SELLER ACCESS APPROVED"
    );

  }


  return children;

}


export default ProtectedRoute;