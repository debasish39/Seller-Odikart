import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Clock3,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Store,
} from "lucide-react";

import api from "../../services/api";


function PendingApproval() {

  const navigate =
    useNavigate();


  const [
    checking,
    setChecking,
  ] = useState(true);


  const [
    sellerStatus,
    setSellerStatus,
  ] = useState("pending");


  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     CHECK SELLER APPLICATION STATUS
  ===================================================== */

  const checkStatus =
    async () => {

      try {

        setError("");


        const response =
          await api.get(
            "/auth/me"
          );


        const user =
          response.data?.user;


        console.log(
          "======================================"
        );

        console.log(
          "📋 SELLER APPLICATION STATUS"
        );

        console.log(
          "Role:",
          user?.role
        );

        console.log(
          "Seller Status:",
          user?.sellerStatus
        );

        console.log(
          "KYC Status:",
          user?.sellerVerificationStatus
        );

        console.log(
          "======================================"
        );


        /* =================================================
           ROLE CHECK
        ================================================= */

        if (
          user?.role !==
          "seller"
        ) {

          navigate(
            "/",
            {
              replace: true,
            }
          );

          return;
        }


        const status =
          user?.sellerStatus ||
          "pending";


        setSellerStatus(
          status
        );


        /* =================================================
           APPROVED
        ================================================= */

        if (
          status === "approved"
        ) {

          const kycStatus =
            user?.sellerVerificationStatus ||
            user?.sellerInfo
              ?.verification
              ?.status ||
            "pending";


          if (
            kycStatus === "approved"
          ) {

            console.log(
              "✅ SELLER + KYC APPROVED"
            );


            navigate(
              "/seller/dashboard",
              {
                replace: true,
              }
            );

          } else {

            console.log(
              "⚠️ SELLER APPROVED BUT KYC INCOMPLETE"
            );


            navigate(
              "/seller/upload-documents",
              {
                replace: true,
              }
            );

          }


          return;
        }


        /* =================================================
           REJECTED
        ================================================= */

        if (
          status === "rejected"
        ) {

          console.log(
            "❌ SELLER APPLICATION REJECTED"
          );

          return;
        }


        /* =================================================
           PENDING
        ================================================= */

        console.log(
          "⏳ SELLER APPLICATION STILL PENDING"
        );


      } catch (requestError) {

        console.error(
          "❌ Seller status check failed:",
          requestError
        );


        if (
          requestError?.response?.status ===
          401
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );


          navigate(
            "/",
            {
              replace: true,
            }
          );


          return;
        }


        setError(
          "Unable to check your seller application status."
        );

      } finally {

        setChecking(
          false
        );

      }

    };


  /* =====================================================
     INITIAL CHECK + POLLING
  ===================================================== */

  useEffect(() => {

    checkStatus();


    const interval =
      setInterval(
        checkStatus,
        10000
      );


    return () => {

      clearInterval(
        interval
      );

    };

  }, []);


  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout =
    () => {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      navigate(
        "/",
        {
          replace: true,
        }
      );

    };


  /* =====================================================
     LOADING
  ===================================================== */

  if (
    checking
  ) {

    return (
      <div className="
        min-h-screen
        bg-[#f6f7f9]
        px-4
        py-10
      ">

        <div className="
          mx-auto
          flex
          min-h-[80vh]
          max-w-lg
          items-center
          justify-center
        ">

          <div className="
            w-full
            rounded-[28px]
            border
            border-zinc-200
            bg-white
            p-8
            text-center
            shadow-sm
          ">

            <div className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-zinc-100
            ">

              <span className="
                h-6
                w-6
                animate-spin
                rounded-full
                border-2
                border-zinc-200
                border-t-black
              " />

            </div>


            <h1 className="
              mt-6
              text-2xl
              font-bold
              text-zinc-950
            ">

              Checking application status...

            </h1>


            <p className="
              mt-3
              text-sm
              leading-6
              text-zinc-500
            ">

              Please wait while we check your
              seller application.

            </p>

          </div>

        </div>

      </div>
    );

  }


  /* =====================================================
     REJECTED
  ===================================================== */

  if (
    sellerStatus ===
    "rejected"
  ) {

    return (
      <div className="
        min-h-screen
        bg-[#f6f7f9]
        px-4
        py-10
      ">

        <div className="
          mx-auto
          flex
          min-h-[80vh]
          max-w-lg
          items-center
          justify-center
        ">

          <div className="
            w-full
            rounded-[28px]
            border
            border-zinc-200
            bg-white
            p-8
            text-center
            shadow-sm
          ">

            <div className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-red-50
              text-red-600
            ">

              <ShieldCheck
                size={28}
              />

            </div>


            <h1 className="
              mt-6
              text-2xl
              font-bold
              text-zinc-950
            ">

              Seller Application Rejected

            </h1>


            <p className="
              mt-3
              text-sm
              leading-6
              text-zinc-500
            ">

              Your seller application was not
              approved. Please review the rejection
              details and update your application.

            </p>


            <button
              type="button"
              onClick={
                logout
              }
              className="
                mt-7
                flex
                min-h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-black
                px-5
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-zinc-800
              "
            >

              <LogOut
                size={16}
              />

              Logout

            </button>

          </div>

        </div>

      </div>
    );

  }


  /* =====================================================
     PENDING
  ===================================================== */

  return (
    <div className="
      min-h-screen
      bg-[#f6f7f9]
      px-4
      py-10
    ">

      <div className="
        mx-auto
        flex
        min-h-[80vh]
        max-w-lg
        items-center
        justify-center
      ">

        <div className="
          w-full
          rounded-[28px]
          border
          border-zinc-200
          bg-white
          p-8
          text-center
          shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)]
          sm:p-10
        ">

          <div className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-amber-50
            text-amber-600
          ">

            <Clock3
              size={28}
            />

          </div>


          <div className="
            mt-6
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-amber-50
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-amber-700
          ">

            <span className="
              h-1.5
              w-1.5
              rounded-full
              bg-amber-500
            " />

            Under Review

          </div>


          <h1 className="
            mt-5
            text-2xl
            font-bold
            tracking-tight
            text-zinc-950
            sm:text-3xl
          ">

            Your Seller Application Is Under Review

          </h1>


          <p className="
            mt-4
            text-sm
            leading-6
            text-zinc-500
          ">

            Your seller application has been
            submitted successfully. Our team is
            reviewing your information.

          </p>


          <div className="
            mt-7
            rounded-2xl
            border
            border-zinc-200
            bg-zinc-50
            p-5
            text-left
          ">

            <div className="
              flex
              gap-3
            ">

              <div className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-black
                text-white
              ">

                <Store
                  size={18}
                />

              </div>


              <div>

                <p className="
                  text-sm
                  font-bold
                  text-zinc-900
                ">

                  Application submitted

                </p>


                <p className="
                  mt-1
                  text-xs
                  leading-5
                  text-zinc-500
                ">

                  We will notify you once your
                  seller application has been reviewed.

                </p>

              </div>

            </div>


            <div className="
              mt-5
              flex
              items-center
              gap-3
            ">

              <div className="
                h-2
                w-2
                rounded-full
                bg-amber-500
              " />

              <p className="
                text-xs
                font-semibold
                text-amber-700
              ">

                Waiting for admin approval

              </p>

            </div>

          </div>


          <div className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
            text-xs
            text-zinc-400
          ">

            <RefreshCw
              size={13}
            />

            Status checks automatically every
            10 seconds

          </div>


          {error && (

            <div className="
              mt-5
              rounded-xl
              bg-red-50
              px-4
              py-3
              text-xs
              font-medium
              text-red-700
            ">

              {error}

            </div>

          )}


          <button
            type="button"
            onClick={
              logout
            }
            className="
              mt-7
              flex
              min-h-12
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-5
              py-3
              text-sm
              font-bold
              text-zinc-800
              transition
              hover:border-zinc-300
              hover:bg-zinc-50
            "
          >

            <LogOut
              size={16}
            />

            Logout

          </button>

        </div>

      </div>

    </div>
  );
}


export default PendingApproval;