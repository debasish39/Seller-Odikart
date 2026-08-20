import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Clock3,
  IndianRupee,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import {
  getSellerWallet,
} from "../../../services/sellerWalletService";


const Wallet = () => {

  const [wallet, setWallet] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================
  // LOAD WALLET
  // =====================================

  const loadWallet = async () => {

    try {

      setLoading(true);
      setError("");

      console.log(
        "💰 Loading seller wallet..."
      );

      const data =
        await getSellerWallet();

      console.log(
        "💰 Wallet response:",
        data
      );

      if (data?.success) {

        setWallet(
          data.wallet
        );

      } else {

        setError(
          data?.message ||
          "Unable to load wallet"
        );

      }

    } catch (error) {

      console.error(
        "❌ Wallet error:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Unable to load wallet"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadWallet();

  }, []);


  // =====================================
  // FORMAT MONEY
  // =====================================

  const money = (value) => {

    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (

      <div className="
        min-h-screen
        bg-gray-50
        p-4
        sm:p-6
        lg:p-8
      ">

        <div className="
          mx-auto
          max-w-7xl
          animate-pulse
        ">

          <div className="
            h-8
            w-52
            rounded
            bg-gray-200
          "/>

          <div className="
            mt-6
            h-52
            rounded-2xl
            bg-gray-200
          "/>

          <div className="
            mt-6
            grid
            gap-4
            sm:grid-cols-3
          ">

            <div className="
              h-28
              rounded-xl
              bg-gray-200
            "/>

            <div className="
              h-28
              rounded-xl
              bg-gray-200
            "/>

            <div className="
              h-28
              rounded-xl
              bg-gray-200
            "/>

          </div>

        </div>

      </div>

    );

  }


  // =====================================
  // ERROR
  // =====================================

  if (error) {

    return (

      <div className="
        min-h-screen
        bg-gray-50
        p-4
        sm:p-6
      ">

        <div className="
          mx-auto
          max-w-xl
          rounded-2xl
          border
          border-red-200
          bg-red-50
          p-6
        ">

          <div className="
            flex
            gap-3
          ">

            <AlertCircle
              className="
                shrink-0
                text-red-600
              "
            />

            <div>

              <h2 className="
                font-semibold
                text-red-800
              ">

                Unable to load wallet

              </h2>

              <p className="
                mt-1
                text-sm
                text-red-700
              ">

                {error}

              </p>


              <button
                onClick={loadWallet}
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  font-medium
                  text-white
                "
              >

                <RefreshCw
                  size={16}
                />

                Try Again

              </button>

            </div>

          </div>

        </div>

      </div>

    );

  }


  // =====================================
  // BALANCES
  // =====================================

  const available =
    Number(
      wallet?.availableBalance || 0
    );

  const pending =
    Number(
      wallet?.pendingBalance || 0
    );

  const lifetime =
    Number(
      wallet?.lifetimeEarnings || 0
    );

  const withdrawn =
    Number(
      wallet?.totalWithdrawn || 0
    );

  const commission =
    Number(
      wallet?.totalCommission || 0
    );

  const refunds =
    Number(
      wallet?.totalRefunds || 0
    );


  // =====================================
  // UI
  // =====================================

  return (

    <div className="
      min-h-screen
      bg-gray-50
      p-4
      sm:p-6
      lg:p-8
    ">

      <div className="
        mx-auto
        max-w-7xl
      ">


        {/* =================================
            HEADER
        ================================= */}

        <div className="
          mb-6
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          <div>

            <h1 className="
              text-2xl
              font-bold
              text-gray-900
              sm:text-3xl
            ">

              Wallet

            </h1>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">

              Manage your seller earnings
              and settlements.

            </p>

          </div>


          <button
            onClick={loadWallet}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-gray-700
              shadow-sm
              hover:bg-gray-50
            "
          >

            <RefreshCw
              size={17}
            />

            Refresh

          </button>

        </div>


        {/* =================================
            MAIN BALANCE
        ================================= */}

        <div className="
          overflow-hidden
          rounded-2xl
          bg-black
          text-white
          shadow-lg
        ">

          <div className="
            grid
            lg:grid-cols-2
          ">


            {/* LEFT */}

            <div className="
              p-6
              sm:p-8
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <div className="
                  rounded-xl
                  bg-white/10
                  p-3
                ">

                  <WalletIcon
                    size={24}
                  />

                </div>


                <div>

                  <p className="
                    text-sm
                    text-gray-400
                  ">

                    Available to withdraw

                  </p>

                  <p className="
                    text-xs
                    text-gray-500
                  ">

                    Seller wallet

                  </p>

                </div>

              </div>


              <div className="
                mt-7
              ">

                <p className="
                  text-4xl
                  font-bold
                  tracking-tight
                  sm:text-5xl
                ">

                  ₹{money(
                    available
                  )}

                </p>

                <p className="
                  mt-2
                  text-sm
                  text-gray-400
                ">

                  Money currently available
                  for settlement.

                </p>

              </div>


              <Link
                to="/seller/wallet/withdraw"
                className="
                  mt-7
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-black
                  transition
                  hover:bg-gray-100
                  sm:w-auto
                "
              >

                Withdraw Money

                <ArrowUpRight
                  size={18}
                />

              </Link>

            </div>


            {/* RIGHT */}

            <div className="
              border-t
              border-white/10
              bg-white/5
              p-6
              sm:p-8
              lg:border-l
              lg:border-t-0
            ">

              <div className="
                flex
                items-center
                gap-3
              ">

                <Clock3
                  size={20}
                  className="
                    text-yellow-400
                  "
                />

                <div>

                  <p className="
                    text-sm
                    text-gray-400
                  ">

                    Pending settlement

                  </p>

                  <p className="
                    mt-1
                    text-2xl
                    font-bold
                  ">

                    ₹{money(
                      pending
                    )}

                  </p>

                </div>

              </div>


              <div className="
                mt-8
                rounded-xl
                border
                border-white/10
                p-4
              ">

                <div className="
                  flex
                  items-center
                  justify-between
                ">

                  <span className="
                    text-sm
                    text-gray-400
                  ">

                    Lifetime earnings

                  </span>

                  <span className="
                    font-semibold
                  ">

                    ₹{money(
                      lifetime
                    )}

                  </span>

                </div>


                <div className="
                  mt-4
                  flex
                  items-center
                  justify-between
                ">

                  <span className="
                    text-sm
                    text-gray-400
                  ">

                    Total withdrawn

                  </span>

                  <span className="
                    font-semibold
                  ">

                    ₹{money(
                      withdrawn
                    )}

                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =================================
            SUMMARY
        ================================= */}

        <div className="
          mt-6
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        ">


          {/* EARNINGS */}

          <div className="
            rounded-xl
            border
            bg-white
            p-5
            shadow-sm
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Lifetime Earnings

                </p>

                <p className="
                  mt-2
                  text-2xl
                  font-bold
                ">

                  ₹{money(
                    lifetime
                  )}

                </p>

              </div>


              <div className="
                rounded-xl
                bg-green-100
                p-3
                text-green-700
              ">

                <ArrowDownLeft
                  size={21}
                />

              </div>

            </div>

            <p className="
              mt-3
              text-xs
              text-gray-500
            ">

              Total seller earnings
              after completed sales.

            </p>

          </div>


          {/* COMMISSION */}

          <div className="
            rounded-xl
            border
            bg-white
            p-5
            shadow-sm
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Marketplace Commission

                </p>

                <p className="
                  mt-2
                  text-2xl
                  font-bold
                ">

                  ₹{money(
                    commission
                  )}

                </p>

              </div>


              <div className="
                rounded-xl
                bg-orange-100
                p-3
                text-orange-700
              ">

                <IndianRupee
                  size={21}
                />

              </div>

            </div>

            <p className="
              mt-3
              text-xs
              text-gray-500
            ">

              Commission retained by
              the marketplace.

            </p>

          </div>


          {/* REFUNDS */}

          <div className="
            rounded-xl
            border
            bg-white
            p-5
            shadow-sm
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <div>

                <p className="
                  text-sm
                  text-gray-500
                ">

                  Total Refunds

                </p>

                <p className="
                  mt-2
                  text-2xl
                  font-bold
                ">

                  ₹{money(
                    refunds
                  )}

                </p>

              </div>


              <div className="
                rounded-xl
                bg-red-100
                p-3
                text-red-700
              ">

                <ArrowUpRight
                  size={21}
                />

              </div>

            </div>

            <p className="
              mt-3
              text-xs
              text-gray-500
            ">

              Amount returned due to
              refunds or adjustments.

            </p>

          </div>

        </div>


        {/* =================================
            QUICK ACTIONS
        ================================= */}

        <div className="
          mt-6
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
        ">


          {/* WITHDRAW */}

          <Link
            to="/seller/wallet/withdraw"
            className="
              group
              rounded-xl
              border
              bg-white
              p-5
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:shadow-md
            "
          >

            <div className="
              flex
              items-center
              justify-between
            ">

              <div className="
                flex
                items-center
                gap-4
              ">

                <div className="
                  rounded-xl
                  bg-blue-100
                  p-3
                  text-blue-700
                ">

                  <CreditCard
                    size={22}
                  />

                </div>


                <div>

                  <h3 className="
                    font-semibold
                    text-gray-900
                  ">

                    Withdraw Funds

                  </h3>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                  ">

                    Transfer available earnings
                    to your bank.

                  </p>

                </div>

              </div>


              <ChevronRight
                size={20}
                className="
                  text-gray-400
                  transition
                  group-hover:translate-x-1
                "
              />

            </div>

          </Link>


          {/* TRANSACTIONS */}

          <Link
            to="/seller/wallet/transactions"
            className="
              group
              rounded-xl
              border
              bg-white
              p-5
              shadow-sm
              transition
              hover:-translate-y-0.5
              hover:shadow-md
            "
          >

            <div className="
              flex
              items-center
              justify-between
            ">

              <div className="
                flex
                items-center
                gap-4
              ">

                <div className="
                  rounded-xl
                  bg-purple-100
                  p-3
                  text-purple-700
                ">

                  <WalletIcon
                    size={22}
                  />

                </div>


                <div>

                  <h3 className="
                    font-semibold
                    text-gray-900
                  ">

                    Wallet Transactions

                  </h3>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                  ">

                    View sales, withdrawals
                    and adjustments.

                  </p>

                </div>

              </div>


              <ChevronRight
                size={20}
                className="
                  text-gray-400
                  transition
                  group-hover:translate-x-1
                "
              />

            </div>

          </Link>

        </div>


        {/* =================================
            SECURITY
        ================================= */}

        <div className="
          mt-6
          rounded-xl
          border
          border-green-200
          bg-green-50
          p-5
        ">

          <div className="
            flex
            gap-3
          ">

            <ShieldCheck
              size={22}
              className="
                mt-0.5
                shrink-0
                text-green-600
              "
            />

            <div>

              <h3 className="
                font-semibold
                text-green-900
              ">

                Secure seller wallet

              </h3>

              <p className="
                mt-1
                text-sm
                leading-6
                text-green-800
              ">

                Your wallet balance is controlled
                by secure backend transactions.
                Sales are credited after delivery,
                while withdrawals are tracked
                separately through settlement
                transactions.

              </p>

            </div>

          </div>

        </div>


      </div>

    </div>

  );

};


export default Wallet;