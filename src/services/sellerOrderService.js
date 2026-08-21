import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASIC_URL}/api`;


const getAuthConfig = () => {

  const token =
    localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

};


/* =====================================
   GET SELLER ORDERS
===================================== */

export const getSellerOrders =
  async () => {

    const response =
      await axios.get(
        `${API_URL}/order/seller/orders`,
        getAuthConfig()
      );

    return response.data;
  };


/* =====================================
   GET SINGLE SELLER ORDER
===================================== */

export const getSellerOrder =
  async (orderId) => {

    const response =
      await axios.get(
        `${API_URL}/order/${orderId}`,
        getAuthConfig()
      );

    return response.data;
  };


/* =====================================
   UPDATE ORDER STATUS
===================================== */

export const updateOrderStatus =
  async (
    orderId,
    status
  ) => {

    const response =
      await axios.put(
        `${API_URL}/order/status/${orderId}`,
        {
          status,
        },
        getAuthConfig()
      );

    return response.data;
  };


/* =====================================
   GET SELLER ANALYTICS
===================================== */

export const getSellerAnalytics =
  async () => {

   

    const response =
      await axios.get(
        `${API_URL}/seller/orders/analytics`,
        getAuthConfig()
      );

   
    return response.data;
  };