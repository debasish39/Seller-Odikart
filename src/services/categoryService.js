import axios from "axios";

const API_URL =
  "http://localhost:5000/api/";

/* =====================================
   GET PARENT CATEGORIES
===================================== */

export const getCategories = async () => {
  const response = await axios.get(
    `${API_URL}/category`
  );

  return response.data;
};

/* =====================================
   GET SUBCATEGORIES
===================================== */

export const getSubCategories = async (
  categoryId
) => {
  const response = await axios.get(
    `${API_URL}/category/${categoryId}/subcategories`
  );

  return response.data;
};