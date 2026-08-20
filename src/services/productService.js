import axios from "axios";

const API_URL = `${import.meta.env.VITE_BASIC_URL}/api/products`;
/* =====================================
   CREATE PRODUCT
===================================== */

export const createProduct = async (formData) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API_URL}/create`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // DO NOT manually set Content-Type.
        // Axios will set multipart/form-data boundary.
      },
    }
  );

  return response.data;
};
// =====================================
// GET SELLER PRODUCTS
// =====================================

export const getSellerProducts = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/seller/my-products`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// GET SINGLE PRODUCT
// =====================================

export const getProduct = async (productId) => {
  const response = await axios.get(
    `${API_URL}/${productId}`
  );

  return response.data;
};

// =====================================
// UPDATE PRODUCT
// =====================================

export const updateProduct = async (
  productId,
  data
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/${productId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// DELETE PRODUCT
// =====================================

export const deleteProduct = async (
  productId
) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `${API_URL}/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// SUBMIT PRODUCT
// =====================================

export const submitProduct = async (
  productId
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/${productId}/submit`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// UPDATE VARIANT STOCK
// =====================================

export const updateVariantStock = async (
  data
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/stock`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// ADMIN - GET ALL PRODUCTS
// =====================================

export const getAdminProducts = async (
  params = {}
) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/admin/all`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// ADMIN - GET PENDING PRODUCTS
// =====================================

export const getPendingProducts = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/admin/pending`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// ADMIN - APPROVE PRODUCT
// =====================================

export const approveProduct = async (
  productId
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/admin/${productId}/approve`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// ADMIN - REJECT PRODUCT
// =====================================

export const rejectProduct = async (
  productId,
  reason
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/admin/${productId}/reject`,
    {
      reason,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// =====================================
// ADMIN - BLOCK PRODUCT
// =====================================

export const blockProduct = async (
  productId,
  reason
) => {
  const token = localStorage.getItem("token");

  const response = await axios.put(
    `${API_URL}/admin/${productId}/block`,
    {
      reason,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};