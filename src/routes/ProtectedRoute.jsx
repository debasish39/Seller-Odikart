import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import api from "../services/api";


function ProtectedRoute({
  children,

  role,

  requireKyc = false,

  /*
   * Used only for /seller/pending
   *
   * A logged-in seller can access this page
   * even when sellerStatus is pending/rejected.
   */
  allowPendingSeller = false,
}) {

  const location =
    useLocation();


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    user,
    setUser,
  ] = useState(null);


  /* =====================================================
     FETCH CURRENT USER
  ===================================================== */

  useEffect(() => {

    const token =
      localStorage.getItem(
        "token"
      );


    console.log(
      "================================"
    );

    console.log(
      "🔐 PROTECTED ROUTE"
    );

    console.log(
      "Path:",
      location.pathname
    );

    console.log(
      "Token exists:",
      Boolean(token)
    );

    console.log(
      "Required role:",
      role
    );

    console.log(
      "Require KYC:",
      requireKyc
    );

    console.log(
      "Allow pending seller:",
      allowPendingSeller
    );

    console.log(
      "================================"
    );


    if (!token) {

      setUser(null);

      setLoading(false);

      return;

    }


    const fetchUser =
      async () => {

        try {

          const response =
            await api.get(
              "/auth/me"
            );


          const currentUser =
            response.data?.user;


          console.log(
            "========== /auth/me =========="
          );

          console.log(
            "Current user:",
            currentUser
          );

          console.log(
            "Role:",
            currentUser?.role
          );

          console.log(
            "Seller status:",
            currentUser?.sellerStatus
          );

          console.log(
            "KYC status:",
            currentUser?.sellerVerificationStatus
          );

          console.log(
            "Active mode:",
            currentUser?.activeMode
          );

          console.log(
            "==============================="
          );


          if (!currentUser) {

            throw new Error(
              "User information was not returned"
            );

          }


          localStorage.setItem(
            "user",
            JSON.stringify(
              currentUser
            )
          );


          setUser(
            currentUser
          );


        } catch (error) {

          console.error(
            "❌ /auth/me failed:",
            error
          );


          if (
            error?.response?.status === 401 ||
            error?.response?.status === 403
          ) {

            localStorage.removeItem(
              "token"
            );

            localStorage.removeItem(
              "user"
            );

            setUser(null);

          }

        } finally {

          setLoading(false);

        }

      };


    fetchUser();

  }, [
    location.pathname,
    role,
    requireKyc,
    allowPendingSeller,
  ]);


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (
      <div className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f7f8fa]
      ">

        <div className="
          rounded-2xl
          bg-white
          px-6
          py-5
          shadow-sm
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <span className="
              h-5
              w-5
              animate-spin
              rounded-full
              border-2
              border-slate-200
              border-t-slate-900
            " />

            <span className="
              text-sm
              font-semibold
              text-slate-600
            ">

              Checking authentication...

            </span>

          </div>

        </div>

      </div>
    );

  }


  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (!user) {

    return (
      <Navigate
        to="/"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );

  }


  /* =====================================================
     BLOCKED
  ===================================================== */

  if (user.isBlocked) {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );


    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /* =====================================================
     DELETED
  ===================================================== */

  if (user.isDeleted) {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );


    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /* =====================================================
     ROLE
  ===================================================== */

  if (
    role &&
    user.role !== role
  ) {

    console.warn(
      "❌ WRONG ROLE",
      {
        expected: role,
        actual: user.role,
      }
    );


    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /* =====================================================
     SELLER
  ===================================================== */

  if (
    role === "seller"
  ) {

    console.log(
      "🏪 SELLER ROUTE CHECK"
    );


    console.log(
      "Seller status:",
      user.sellerStatus
    );


    /*
    |--------------------------------------------------------------------------
    | PENDING SELLER PAGE
    |
    | This route is allowed to render for a seller
    | whose application is not approved yet.
    |--------------------------------------------------------------------------
    */

    if (
      allowPendingSeller
    ) {

      console.log(
        "✅ Pending seller page allowed"
      );


      /*
       * Do NOT run the normal seller approval
       * redirect here.
       */

      return children;

    }


    /* ===================================================
       NORMAL SELLER APPROVAL
    =================================================== */

    if (
      user.sellerStatus !==
      "approved"
    ) {

      console.warn(
        "❌ SELLER APPLICATION NOT APPROVED:",
        user.sellerStatus
      );


  

    }


    console.log(
      "✅ SELLER APPLICATION APPROVED"
    );


    /* ===================================================
       KYC
    =================================================== */

    if (
      requireKyc
    ) {

      const kycStatus =
        user.sellerVerificationStatus ||
        user.sellerInfo
          ?.verification
          ?.status ||
        "pending";


      console.log(
        "🔎 KYC CHECK"
      );

      console.log(
        "KYC status:",
        kycStatus
      );


      if (
        kycStatus !==
        "approved"
      ) {

        console.warn(
          "❌ KYC NOT APPROVED"
        );


        return (
          <Navigate
            to="/seller/upload-documents"
            replace
            state={{
              from:
                location.pathname,

              kycStatus,
            }}
          />
        );

      }


      console.log(
        "✅ KYC APPROVED"
      );

    }

  }


  /* =====================================================
     ACCESS GRANTED
  ===================================================== */

  console.log(
    "✅ PROTECTED ROUTE ACCESS GRANTED"
  );


  return children;

}


export default ProtectedRoute;