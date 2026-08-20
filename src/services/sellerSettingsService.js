import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASIC_URL}/api/settings`;


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


/* =====================================
   GET SETTINGS
===================================== */

export const getSellerSettings =
  async () => {

    const response =
      await axios.get(
        API_URL,
        getAuthConfig()
      );

    return response.data;
  };


/* =====================================
   UPDATE SETTINGS
===================================== */

export const updateSellerSettings =
  async (data) => {

    const response =
      await axios.put(
        API_URL,
        data,
        getAuthConfig()
      );

    return response.data;
  };