import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingBag,
  RefreshCw,
  ReceiptText,
  AlertCircle,
} from "lucide-react";

import {
  getWalletTransactions,
} from "../../../services/sellerWalletService";


const Transactions = () => {

  const [
    transactions,
    setTransactions,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =====================================
     LOAD TRANSACTIONS
  ===================================== */

  const loadTransactions = async (
    isRefresh = false
  ) => {

    try {

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data =
        await getWalletTransactions();

      console.log(
        "WALLET TRANSACTIONS:",
        data
      );

      if (data.success) {

        setTransactions(
          data.transactions || []
        );

      } else {

        setError(
          data.message ||
          "Failed to load transactions"
        );

      }

    } catch (error) {

      console.error(
        "Transactions Error:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to load transactions"
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  useEffect(() => {

    loadTransactions();

  }, []);


  /* =====================================
     FORMAT MONEY
  ===================================== */

  const formatMoney = (
    amount
  ) => {

    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };


  /* =====================================
     TYPE ICON
  ===================================== */

  const getIcon = (
    type
  ) => {

    switch (type) {

      case "SALE":

        return (
          <ShoppingBag
            size={19}
            className="text-green-600"
          />
        );

      case "COMMISSION":

        return (
          <ReceiptText
            size={19}
            className="text-orange-600"
          />
        );

      case "REFUND":

        return (
          <ArrowDownToLine
            size={19}
            className="text-red-600"
          />
        );

      case "WITHDRAWAL":

        return (
          <ArrowUpFromLine
            size={19}
            className="text-blue-600"
          />
        );

      default:

        return (
          <ReceiptText
            size={19}
          />
        );

    }

  };


  /* =====================================
     TYPE LABEL
  ===================================== */

  const getTypeLabel = (
    type
  ) => {

    switch (type) {

      case "SALE":
        return "Sale";

      case "COMMISSION":
        return "Commission";

      case "REFUND":
        return "Refund";

      case "WITHDRAWAL":
        return "Withdrawal";

      case "SETTLEMENT":
        return "Settlement";

      case "ADJUSTMENT":
        return "Adjustment";

      default:
        return type || "Transaction";

    }

  };


  /* =====================================
     AMOUNT STYLE
  ===================================== */

  const isDebit = (
    type
  ) => {

    return [
      "COMMISSION",
      "REFUND",
      "WITHDRAWAL",
    ].includes(type);

  };


  /* =====================================
     LOADING
  ===================================== */

  if (loading) {

    return (

      <div className="p-6">

        <div className="animate-pulse space-y-4">

          {[1, 2, 3, 4].map(
            (item) => (

              <div
                key={item}
                className="h-20 rounded-xl bg-gray-200"
              />

            )
          )}

        </div>

      </div>

    );

  }


  return (

    <div className="min-h-screen bg-gray-50 p-4 md:p-6">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">

          <Link
            to="/seller/wallet"
            className="rounded-lg border bg-white p-2 hover:bg-gray-100"
          >

            <ArrowLeft
              size={20}
            />

          </Link>

          <div>

            <h1 className="text-2xl font-bold">
              Wallet Transactions
            </h1>

            <p className="text-sm text-gray-500">
              Your seller wallet activity
            </p>

          </div>

        </div>


        <button
          onClick={() =>
            loadTransactions(true)
          }
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (

        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">

          <div className="flex gap-3">

            <AlertCircle
              className="text-red-600"
              size={20}
            />

            <p className="text-sm text-red-700">
              {error}
            </p>

          </div>

        </div>

      )}


      {/* =====================================
          EMPTY
      ===================================== */}

      {transactions.length === 0 ? (

        <div className="rounded-xl border bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

            <ReceiptText
              size={25}
              className="text-gray-500"
            />

          </div>

          <h2 className="mt-4 text-xl font-semibold">
            No transactions yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            Your wallet transactions will appear
            here when earnings, commissions,
            refunds, or withdrawals are recorded.
          </p>

        </div>

      ) : (

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          {/* DESKTOP HEADER */}

          <div className="hidden grid-cols-12 gap-4 border-b bg-gray-50 px-5 py-4 text-sm font-medium text-gray-500 md:grid">

            <div className="col-span-3">
              Transaction
            </div>

            <div className="col-span-2">
              Order
            </div>

            <div className="col-span-2">
              Date
            </div>

            <div className="col-span-2">
              Status
            </div>

            <div className="col-span-2">
              Balance
            </div>

            <div className="col-span-1 text-right">
              Amount
            </div>

          </div>


          {/* TRANSACTIONS */}

          <div>

            {transactions.map(
              (transaction) => {

                const debit =
                  isDebit(
                    transaction.type
                  );

                return (

                  <div
                    key={
                      transaction._id
                    }
                    className="border-b p-5 last:border-b-0 md:grid md:grid-cols-12 md:items-center md:gap-4"
                  >

                    {/* TRANSACTION */}

                    <div className="col-span-3 flex items-center gap-3">

                      <div className="rounded-lg bg-gray-100 p-2">

                        {getIcon(
                          transaction.type
                        )}

                      </div>

                      <div>

                        <p className="font-medium">
                          {getTypeLabel(
                            transaction.type
                          )}
                        </p>

                        <p className="text-xs text-gray-500">
                          {transaction.description ||
                            "Wallet transaction"}
                        </p>

                      </div>

                    </div>


                    {/* ORDER */}

                    <div className="mt-4 col-span-2 md:mt-0">

                      <p className="text-xs text-gray-500 md:hidden">
                        Order
                      </p>

                      <p className="text-sm">

                        {transaction.orderId?._id
                          ? `#${transaction.orderId._id}`
                          : "—"}

                      </p>

                    </div>


                    {/* DATE */}

                    <div className="mt-4 col-span-2 md:mt-0">

                      <p className="text-xs text-gray-500 md:hidden">
                        Date
                      </p>

                      <p className="text-sm">

                        {transaction.createdAt
                          ? new Date(
                              transaction.createdAt
                            ).toLocaleString(
                              "en-IN"
                            )
                          : "—"}

                      </p>

                    </div>


                    {/* STATUS */}

                    <div className="mt-4 col-span-2 md:mt-0">

                      <p className="text-xs text-gray-500 md:hidden">
                        Status
                      </p>

                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                        {transaction.status}
                      </span>

                    </div>


                    {/* BALANCE */}

                    <div className="mt-4 col-span-2 md:mt-0">

                      <p className="text-xs text-gray-500 md:hidden">
                        Balance After
                      </p>

                      <p className="text-sm font-medium">

                        ₹
                        {formatMoney(
                          transaction.balanceAfter
                        )}

                      </p>

                    </div>


                    {/* AMOUNT */}

                    <div className="mt-4 col-span-1 text-left md:mt-0 md:text-right">

                      <p className="text-xs text-gray-500 md:hidden">
                        Amount
                      </p>

                      <p
                        className={`font-semibold ${
                          debit
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >

                        {debit
                          ? "-"
                          : "+"}

                        ₹
                        {formatMoney(
                          transaction.amount
                        )}

                      </p>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>

      )}

    </div>

  );

};


export default Transactions;