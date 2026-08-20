import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  Lock,
  ShieldCheck,
} from "lucide-react";

function VerifiedSellerRoute({
  children,
}) {
  const location =
    useLocation();

  const [checking, setChecking] =
    useState(true);

  const [user, setUser] =
    useState(null);

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem(
          "user"
        );

      if (!storedUser) {
        setUser(null);
        setChecking(false);
        return;
      }

      const parsedUser =
        JSON.parse(
          storedUser
        );

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "VerifiedSellerRoute error:",
        error
      );

      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-black" />

          <span className="text-sm font-semibold text-zinc-600">
            Checking seller access...
          </span>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOT LOGGED IN
  |--------------------------------------------------------------------------
  */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ROLE
  |--------------------------------------------------------------------------
  */

  if (user.role !== "seller") {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /*
  |--------------------------------------------------------------------------
  | SELLER VERIFICATION
  |--------------------------------------------------------------------------
  */



const sellerApproved =
  user?.sellerStatus ===
  "approved";

const verificationApproved =
  user?.sellerInfo?.verification?.status ===
  "approved";

const verified =
  sellerApproved &&
  verificationApproved;



  /*
  |--------------------------------------------------------------------------
  | NOT VERIFIED
  |--------------------------------------------------------------------------
  */

  if (!verified) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-4 py-10">

        <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center">

          <div className="w-full rounded-[28px] border border-zinc-200 bg-white p-7 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)] sm:p-10">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-800">
              <Lock size={25} />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-950">
              Verification required
            </h1>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              You need an approved seller
              verification before you can
              add products.
            </p>

            <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-left">

              <div className="flex gap-3">

                <ShieldCheck
                  size={19}
                  className="shrink-0 text-amber-600"
                />

                <div>

                  <p className="text-sm font-bold text-amber-900">
                    Seller verification
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Upload your documents and
                    wait for admin approval.
                  </p>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                window.location.href =
                  "/seller/complete-profile"
              }
              className="mt-7 flex min-h-12 w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
            >
              Upload / Update Documents
            </button>

            <button
              type="button"
              onClick={() =>
                window.location.href =
                  "/seller/dashboard"
              }
              className="mt-3 flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 px-5 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
            >
              Back to Dashboard
            </button>

          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | VERIFIED
  |--------------------------------------------------------------------------
  */

  return children;
}

export default VerifiedSellerRoute;