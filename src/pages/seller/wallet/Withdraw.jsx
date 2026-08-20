import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  IndianRupee,
  Info,
  Loader2,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";

import {
  getSellerWallet,
  createWithdrawal,
} from "../../../services/sellerWalletService";

const INITIAL_FORM = {
  amount: "",
  accountHolderName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifsc: "",
  bankName: "",
};

const Withdraw = () => {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showAccountNumber, setShowAccountNumber] = useState(false);

  const [form, setForm] = useState(INITIAL_FORM);

  const [touched, setTouched] = useState({});

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSellerWallet();

      console.log("SELLER WALLET:", data);

      if (data?.success) {
        setWallet(data.wallet || {});
      } else {
        setError(data?.message || "Failed to load wallet.");
      }
    } catch (err) {
      console.error("Wallet Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load wallet."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const availableBalance = useMemo(() => {
    return Number(wallet?.availableBalance || 0);
  }, [wallet]);

  const pendingBalance = useMemo(() => {
    return Number(wallet?.pendingBalance || 0);
  }, [wallet]);

  const lifetimeEarnings = useMemo(() => {
    return Number(wallet?.lifetimeEarnings || 0);
  }, [wallet]);

  const withdrawalAmount = useMemo(() => {
    return Number(form.amount || 0);
  }, [form.amount]);

  const formattedBalance = availableBalance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedPending = pendingBalance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedLifetime = lifetimeEarnings.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    let nextValue = value;

    if (name === "ifsc") {
      nextValue = value.toUpperCase().replace(/\s/g, "").slice(0, 11);
    }

    if (name === "accountNumber" || name === "confirmAccountNumber") {
      nextValue = value.replace(/\D/g, "");
    }

    if (name === "amount") {
      nextValue = value.replace(/[^\d.]/g, "");

      const decimalParts = nextValue.split(".");

      if (decimalParts.length > 2) {
        nextValue = `${decimalParts[0]}.${decimalParts.slice(1).join("")}`;
      }
    }

    setForm((previous) => ({
      ...previous,
      [name]: nextValue,
    }));

    setError("");
    setSuccess("");
  };

  const handleBlur = (event) => {
    const { name } = event.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));
  };

  const handleMaxAmount = () => {
    if (availableBalance <= 0) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      amount: availableBalance.toFixed(2),
    }));

    setTouched((previous) => ({
      ...previous,
      amount: true,
    }));

    setError("");
    setSuccess("");
  };

  const handleQuickAmount = (percentage) => {
    if (availableBalance <= 0) {
      return;
    }

    const amount = (availableBalance * percentage) / 100;

    setForm((previous) => ({
      ...previous,
      amount: amount.toFixed(2),
    }));

    setTouched((previous) => ({
      ...previous,
      amount: true,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!form.amount.trim()) {
      return "Please enter a withdrawal amount.";
    }

    if (withdrawalAmount <= 0) {
      return "Withdrawal amount must be greater than ₹0.";
    }

    if (withdrawalAmount > availableBalance) {
      return "Withdrawal amount cannot exceed your available balance.";
    }

    if (!form.accountHolderName.trim()) {
      return "Account holder name is required.";
    }

    if (form.accountHolderName.trim().length < 2) {
      return "Please enter a valid account holder name.";
    }

    if (!form.accountNumber.trim()) {
      return "Bank account number is required.";
    }

    if (form.accountNumber.length < 9 || form.accountNumber.length > 18) {
      return "Please enter a valid bank account number.";
    }

    if (!form.confirmAccountNumber.trim()) {
      return "Please confirm your bank account number.";
    }

    if (form.accountNumber !== form.confirmAccountNumber) {
      return "Bank account numbers do not match.";
    }

    if (!form.ifsc.trim()) {
      return "IFSC code is required.";
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim())) {
      return "Please enter a valid 11-character IFSC code.";
    }

    if (!form.bankName.trim()) {
      return "Bank name is required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    setTouched({
      amount: true,
      accountHolderName: true,
      accountNumber: true,
      confirmAccountNumber: true,
      ifsc: true,
      bankName: true,
    });

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const response = await createWithdrawal({
        amount: withdrawalAmount,
        accountHolderName: form.accountHolderName.trim(),
        accountNumber: form.accountNumber.trim(),
        ifsc: form.ifsc.trim().toUpperCase(),
        bankName: form.bankName.trim(),
      });

      console.log("WITHDRAWAL RESPONSE:", response);

      if (response?.success) {
        setSuccess(
          response.message ||
            "Your withdrawal request has been submitted successfully."
        );

        if (response.wallet) {
          setWallet((previous) => ({
            ...(previous || {}),
            ...response.wallet,
          }));
        }

        setForm(INITIAL_FORM);
        setTouched({});
        setShowAccountNumber(false);

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      } else {
        setError(
          response?.message || "Withdrawal request could not be submitted."
        );
      }
    } catch (err) {
      console.error("WITHDRAWAL ERROR:", err);
      console.error("Backend:", err?.response?.data);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to process withdrawal. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getFieldError = (field) => {
    if (!touched[field]) {
      return "";
    }

    if (field === "amount") {
      if (!form.amount.trim()) {
        return "Amount is required.";
      }

      if (withdrawalAmount <= 0) {
        return "Enter an amount greater than ₹0.";
      }

      if (withdrawalAmount > availableBalance) {
        return "Amount exceeds available balance.";
      }
    }

    if (field === "accountHolderName") {
      if (!form.accountHolderName.trim()) {
        return "Account holder name is required.";
      }

      if (form.accountHolderName.trim().length < 2) {
        return "Please enter a valid name.";
      }
    }

    if (field === "accountNumber") {
      if (!form.accountNumber.trim()) {
        return "Account number is required.";
      }

      if (form.accountNumber.length < 9 || form.accountNumber.length > 18) {
        return "Account number should contain 9–18 digits.";
      }
    }

    if (field === "confirmAccountNumber") {
      if (!form.confirmAccountNumber.trim()) {
        return "Please confirm your account number.";
      }

      if (form.accountNumber !== form.confirmAccountNumber) {
        return "Account numbers do not match.";
      }
    }

    if (field === "ifsc") {
      if (!form.ifsc.trim()) {
        return "IFSC code is required.";
      }

      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim())) {
        return "Enter a valid IFSC code.";
      }
    }

    if (field === "bankName") {
      if (!form.bankName.trim()) {
        return "Bank name is required.";
      }
    }

    return "";
  };

  const inputClass = (field) => {
    const fieldError = getFieldError(field);

    const base =
      "w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-100";

    if (fieldError) {
      return `${base} border-red-300 focus:border-red-500 focus:ring-red-500/10`;
    }

    return `${base} border-gray-200 focus:border-gray-900 focus:ring-gray-900/10`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 h-8 w-48 rounded-lg bg-gray-200" />

          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-80 rounded-3xl bg-gray-200" />

            <div className="h-80 rounded-3xl bg-gray-200" />
          </div>

          <div className="mt-6 h-[650px] rounded-3xl bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/seller/wallet"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-950"
              aria-label="Back to wallet"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                  Withdraw Funds
                </h1>

                <span className="hidden rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 sm:inline-flex">
                  Secure
                </span>
              </div>

              <p className="mt-1 text-sm text-gray-500">
                Transfer your seller earnings directly to your bank account.
              </p>
            </div>
          </div>

          <Link
            to="/seller/wallet"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <Wallet size={17} />
            Wallet
          </Link>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 size={19} className="text-green-600" />
            </div>

            <div className="min-w-0">
              <p className="font-semibold">Withdrawal request submitted</p>
              <p className="mt-1 text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertCircle size={19} className="text-red-600" />
            </div>

            <div className="min-w-0">
              <p className="font-semibold">Unable to continue</p>
              <p className="mt-1 text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Balance card */}
          <section className="relative overflow-hidden rounded-3xl bg-gray-950 p-6 text-white shadow-xl sm:p-8">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/5" />
            <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-white/[0.03]" />

            <div className="relative">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    Available to withdraw
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <IndianRupee size={27} className="text-gray-300" />

                    <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                      {formattedBalance}
                    </h2>
                  </div>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                  <Wallet size={25} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Info size={15} />
                    <span className="text-xs font-medium">
                      Pending balance
                    </span>
                  </div>

                  <p className="mt-2 text-lg font-semibold">
                    ₹{formattedPending}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <ArrowUpRight size={15} />
                    <span className="text-xs font-medium">
                      Lifetime earnings
                    </span>
                  </div>

                  <p className="mt-2 text-lg font-semibold">
                    ₹{formattedLifetime}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-green-400"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Your money is protected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Your withdrawal request is securely processed and the
                    amount remains pending until it is completed.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Withdrawal overview */}
          <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
              <CreditCard size={22} className="text-gray-800" />
            </div>

            <h2 className="text-lg font-bold text-gray-950">
              Withdrawal overview
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Review your balance and enter the bank details where you want
              your payout sent.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-sm text-gray-500">Available</span>
                <span className="font-semibold text-gray-950">
                  ₹{formattedBalance}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-sm text-gray-500">Pending</span>
                <span className="font-medium text-gray-700">
                  ₹{formattedPending}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    availableBalance > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {availableBalance > 0 ? "Ready to withdraw" : "No balance"}
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
        >
          {/* Form header */}
          <div className="border-b border-gray-100 px-6 py-6 sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white">
                <IndianRupee size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-950">
                  Withdrawal details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the amount and bank account information carefully.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 px-6 py-7 sm:px-8">
            {/* Amount */}
            <section>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-950">
                    How much do you want to withdraw?
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    You can withdraw up to ₹{formattedBalance}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleMaxAmount}
                  disabled={submitting || availableBalance <= 0}
                  className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
                >
                  Use maximum
                </button>
              </div>

              <div className="relative">
                <IndianRupee
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="amount"
                  name="amount"
                  type="text"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0.00"
                  disabled={submitting || availableBalance <= 0}
                  className={`${inputClass(
                    "amount"
                  )} py-4 pl-11 pr-4 text-lg font-semibold`}
                  autoComplete="off"
                />
              </div>

              {getFieldError("amount") ? (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {getFieldError("amount")}
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-500">
                  Available balance: ₹{formattedBalance}
                </p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAmount(25)}
                  disabled={submitting || availableBalance <= 0}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  25%
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAmount(50)}
                  disabled={submitting || availableBalance <= 0}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  50%
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAmount(100)}
                  disabled={submitting || availableBalance <= 0}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  100%
                </button>
              </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Bank section */}
            <section>
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                  <Building2 size={19} className="text-gray-800" />
                </div>

                <div>
                  <h3 className="font-bold text-gray-950">Bank account</h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter the account where your payout should be sent.
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* Account holder */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="accountHolderName"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Account holder name
                  </label>

                  <input
                    id="accountHolderName"
                    name="accountHolderName"
                    type="text"
                    value={form.accountHolderName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter name as registered with your bank"
                    disabled={submitting}
                    className={inputClass("accountHolderName")}
                    autoComplete="name"
                  />

                  {getFieldError("accountHolderName") && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {getFieldError("accountHolderName")}
                    </p>
                  )}
                </div>

                {/* Account number */}
                <div>
                  <label
                    htmlFor="accountNumber"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Account number
                  </label>

                  <div className="relative">
                    <input
                      id="accountNumber"
                      name="accountNumber"
                      type={showAccountNumber ? "text" : "password"}
                      inputMode="numeric"
                      value={form.accountNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter account number"
                      disabled={submitting}
                      className={`${inputClass("accountNumber")} pr-12`}
                      autoComplete="off"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowAccountNumber((previous) => !previous)
                      }
                      disabled={submitting}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
                      aria-label={
                        showAccountNumber
                          ? "Hide account number"
                          : "Show account number"
                      }
                    >
                      {showAccountNumber ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {getFieldError("accountNumber") && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {getFieldError("accountNumber")}
                    </p>
                  )}
                </div>

                {/* Confirm account number */}
                <div>
                  <label
                    htmlFor="confirmAccountNumber"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Confirm account number
                  </label>

                  <input
                    id="confirmAccountNumber"
                    name="confirmAccountNumber"
                    type="password"
                    inputMode="numeric"
                    value={form.confirmAccountNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Re-enter account number"
                    disabled={submitting}
                    className={inputClass("confirmAccountNumber")}
                    autoComplete="off"
                  />

                  {getFieldError("confirmAccountNumber") && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {getFieldError("confirmAccountNumber")}
                    </p>
                  )}
                </div>

                {/* IFSC */}
                <div>
                  <label
                    htmlFor="ifsc"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    IFSC code
                  </label>

                  <input
                    id="ifsc"
                    name="ifsc"
                    type="text"
                    value={form.ifsc}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="SBIN0001234"
                    maxLength={11}
                    disabled={submitting}
                    className={`${inputClass("ifsc")} uppercase`}
                    autoComplete="off"
                  />

                  {getFieldError("ifsc") ? (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {getFieldError("ifsc")}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">
                      11-character bank branch IFSC code.
                    </p>
                  )}
                </div>

                {/* Bank name */}
                <div>
                  <label
                    htmlFor="bankName"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Bank name
                  </label>

                  <input
                    id="bankName"
                    name="bankName"
                    type="text"
                    value={form.bankName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="State Bank of India"
                    disabled={submitting}
                    className={inputClass("bankName")}
                    autoComplete="organization"
                  />

                  {getFieldError("bankName") && (
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {getFieldError("bankName")}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Security notice */}
            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <ShieldCheck size={18} className="text-blue-700" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-blue-950">
                    Secure withdrawal
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-blue-800">
                    Please verify your bank details before submitting. Your
                    withdrawal will remain pending until it has been
                    successfully processed.
                  </p>
                </div>
              </div>
            </section>

            {/* Summary */}
            {withdrawalAmount > 0 &&
              withdrawalAmount <= availableBalance &&
              form.accountNumber &&
              form.confirmAccountNumber &&
              form.accountNumber === form.confirmAccountNumber && (
                <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-950">
                        Withdrawal summary
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Please review before submitting.
                      </p>
                    </div>

                    <CheckCircle2 size={20} className="text-green-600" />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-bold text-gray-950">
                        ₹
                        {withdrawalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-gray-500">Account holder</span>
                      <span className="max-w-[60%] truncate font-medium text-gray-900">
                        {form.accountHolderName || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Bank account</span>
                      <span className="font-medium text-gray-900">
                        •••• {form.accountNumber.slice(-4)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Bank</span>
                      <span className="max-w-[60%] truncate font-medium text-gray-900">
                        {form.bankName || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">IFSC</span>
                      <span className="font-medium uppercase text-gray-900">
                        {form.ifsc || "—"}
                      </span>
                    </div>
                  </div>
                </section>
              )}

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={submitting || availableBalance <= 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-gray-950/10 transition hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-950/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Processing withdrawal...
                  </>
                ) : (
                  <>
                    <Wallet size={19} />
                    Request withdrawal
                  </>
                )}
              </button>

              {availableBalance <= 0 && (
                <div className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
                  <Info size={14} />
                  You don't have enough available balance to withdraw.
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="py-6 text-center">
          <Link
            to="/seller/wallet"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950"
          >
            <ArrowLeft size={15} />
            Back to wallet
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;