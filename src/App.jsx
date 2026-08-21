import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

/* ================================
   AUTH
================================ */

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifySignupOTP from "./pages/auth/VerifySignupOTP";
import LoginOTP from "./pages/auth/LoginOTP";
import VerifyLoginOTP from "./pages/auth/VerifyLoginOTP";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetOTP from "./pages/auth/VerifyResetOTP";
import ResetPassword from "./pages/auth/ResetPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";

/* ================================
   SELLER ONBOARDING
================================ */

import CompleteSellerProfile from "./pages/auth/CompleteSellerProfile";
import UploadSellerDocuments from "./pages/auth/UploadSellerDocuments";
import PendingApproval from "./pages/seller/PendingApproval";

/* ================================
   SELLER
================================ */

import Dashboard from "./pages/seller/Dashboard";
import SellerLayout from "./layouts/SellerLayout";

import Products from "./pages/seller/products/Products";
import ProductDetails from "./pages/seller/products/ProductDetails";
import EditProduct from "./pages/seller/products/EditProduct";
import ProductStock from "./pages/seller/products/ProductStock";
import AddProduct from "./pages/seller/AddProduct";
import NotFound from "./pages/NotFound.jsx";

/* ================================
   SELLER VERIFICATION PROTECTION
================================ */

import VerifiedSellerRoute from "./components/seller/VerifiedSellerRoute";

/* ================================
   SELLER ORDERS
================================ */

import Orders from "./pages/orders/Orders";
import SellerOrderDetails from "./pages/orders/SellerOrderDetails";

/* ================================
   SELLER ANALYTICS
================================ */

import Analytics from "./pages/seller/Analytics";

/* ================================
   SELLER WALLET
================================ */

import Wallet from "./pages/seller/wallet/Wallet";
import Transactions from "./pages/seller/wallet/Transactions";
import Withdraw from "./pages/seller/wallet/Withdraw";

/* ================================
   SELLER SETTINGS
================================ */

import Settings from "./pages/seller/Settings";

/* ================================
   PROTECTION
================================ */

import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================
            AUTH ROUTES
        ===================================== */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-signup-otp"
          element={<VerifySignupOTP />}
        />

        <Route
          path="/login-otp"
          element={<LoginOTP />}
        />

        <Route
          path="/verify-login-otp"
          element={<VerifyLoginOTP />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-reset-otp"
          element={<VerifyResetOTP />}
        />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* =====================================
            SELLER ONBOARDING
        ===================================== */}

        <Route
          path="/seller/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteSellerProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/upload-documents"
          element={
            <ProtectedRoute>
              <UploadSellerDocuments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/pending"
          element={
            <ProtectedRoute>
              <PendingApproval />
            </ProtectedRoute>
          }
        />


        {/* =====================================
            SELLER APPLICATION
        ===================================== */}

        <Route
          path="/seller"
          element={
            <ProtectedRoute>
              <SellerLayout />
            </ProtectedRoute>
          }
        >

          {/* =====================================
              DASHBOARD
          ===================================== */}

          <Route
            path="dashboard"
            element={<Dashboard />}
          />


          {/* =====================================
              PRODUCTS
          ===================================== */}

          <Route
            path="products"
            element={<Products />}
          />

          {/* =====================================
              ADD PRODUCT
              VERIFIED SELLER ONLY
          ===================================== */}

          <Route
            path="products/add"
            element={
              <VerifiedSellerRoute>
                <AddProduct />
              </VerifiedSellerRoute>
            }
          />

          {/* =====================================
              PRODUCT DETAILS
          ===================================== */}

          <Route
            path="products/:id"
            element={<ProductDetails />}
          />

          {/* =====================================
              EDIT PRODUCT
          ===================================== */}

          <Route
            path="products/:id/edit"
            element={<EditProduct />}
          />

          {/* =====================================
              PRODUCT STOCK
          ===================================== */}

          <Route
            path="products/:id/stock"
            element={<ProductStock />}
          />


          {/* =====================================
              SELLER ORDERS
          ===================================== */}

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="orders/:id"
            element={<SellerOrderDetails />}
          />


          {/* =====================================
              ANALYTICS
          ===================================== */}

          <Route
            path="analytics"
            element={<Analytics />}
          />


          {/* =====================================
              WALLET
          ===================================== */}

          <Route
            path="wallet"
            element={<Wallet />}
          />

          <Route
            path="wallet/transactions"
            element={<Transactions />}
          />

          <Route
            path="wallet/withdraw"
            element={<Withdraw />}
          />


          {/* =====================================
              SETTINGS
          ===================================== */}

          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>

      {/* 404 route - MUST be last */}
      <Route path="*" element={<NotFound />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;