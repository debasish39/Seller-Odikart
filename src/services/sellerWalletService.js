import axios from "axios";

const API_URL =
  "http://localhost:5000/api/wallet";


// =====================================
// AUTH CONFIG
// =====================================

const getAuthConfig = () => {

  const token =
    localStorage.getItem("token");

  return {
    headers: {
      Authorization:
        `Bearer ${token}`,
    },
  };

};


// =====================================
// GET SELLER WALLET
// =====================================

export const getSellerWallet =
  async () => {

    const response =
      await axios.get(
        API_URL,
        getAuthConfig()
      );

    return response.data;

  };


// =====================================
// GET WALLET TRANSACTIONS
// =====================================

export const getWalletTransactions =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/transactions`,
        getAuthConfig()
      );

    return response.data;

  };


// =====================================
// CREATE WITHDRAWAL
// =====================================

export const createWithdrawal =
  async (withdrawalData) => {

    console.log(
      "================================="
    );

    console.log(
      "💸 CREATE WITHDRAWAL API"
    );

    console.log(
      "Request:",
      withdrawalData
    );

    console.log(
      "================================="
    );


    const response =
      await axios.post(

        `${API_URL}/withdraw`,

        withdrawalData,

        getAuthConfig()

      );


    console.log(
      "✅ Withdrawal response:",
      response.data
    );


    return response.data;

  };