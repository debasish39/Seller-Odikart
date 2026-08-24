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

import ProtectRoute from "./routes/ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================================================
            AUTH ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={
            <Login />
          }
        />

        <Route
          path="/login"
          element={
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            <Register />
          }
        />

        <Route
          path="/verify-signup-otp"
          element={
            <VerifySignupOTP />
          }
        />

        <Route
          path="/login-otp"
          element={
            <LoginOTP />
          }
        />

        <Route
          path="/verify-login-otp"
          element={
            <VerifyLoginOTP />
          }
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />

        <Route
          path="/verify-reset-otp"
          element={
            <VerifyResetOTP />
          }
        />

        <Route
          path="/reset-password"
          element={
            <ResetPassword />
          }
        />

        <Route
          path="/privacy-policy"
          element={
            <PrivacyPolicy />
          }
        />


        {/* =====================================================
            SELLER ONBOARDING

            IMPORTANT:
            These routes require:
              - Login
              - Seller role
              - Seller application approved

            They DO NOT require KYC approval.
        ===================================================== */}

        <Route
          path="/seller/complete-profile"
          element={
            <ProtectRoute
              role="seller"
              requireKyc={false}
            >
              <CompleteSellerProfile />
            </ProtectRoute>
          }
        />


        <Route
          path="/seller/upload-documents"
          element={
            <ProtectRoute
              role="seller"
              requireKyc={false}
            >
              <UploadSellerDocuments />
            </ProtectRoute>
          }
        />


        {/* =====================================================
            SELLER PENDING

            This page is for seller application approval.

            KYC is not required here because a pending seller
            may need to see this page.
        ===================================================== */}
<Route
  path="/seller/pending"
  element={
    <ProtectRoute
      role="seller"
      allowPendingSeller={true}
      requireKyc={false}
    >
      <PendingApproval />
    </ProtectRoute>
  }
/>

        {/* =====================================================
            SELLER PORTAL

            IMPORTANT:
            requireKyc={true}

            Therefore:
              seller approved + KYC approved
                    → allowed

              seller approved + KYC pending
                    → /seller/upload-documents

              seller approved + KYC rejected
                    → /seller/upload-documents

              seller not approved
                    → /seller/pending
        ===================================================== */}

        <Route
          path="/seller"
          element={
            <ProtectRoute
              role="seller"
              requireKyc={true}
            >
              <SellerLayout />
            </ProtectRoute>
          }
        >

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="dashboard"
            element={
              <Dashboard />
            }
          />


          {/* =================================================
              PRODUCTS
          ================================================= */}

          <Route
            path="products"
            element={
              <Products />
            }
          />


          {/* =================================================
              ADD PRODUCT

              Backend should ALSO verify seller + KYC.
          ================================================= */}

          <Route
            path="products/add"
            element={
              <AddProduct />
            }
          />


          {/* =================================================
              PRODUCT DETAILS
          ================================================= */}

          <Route
            path="products/:id"
            element={
              <ProductDetails />
            }
          />


          {/* =================================================
              EDIT PRODUCT
          ================================================= */}

          <Route
            path="products/:id/edit"
            element={
              <EditProduct />
            }
          />


          {/* =================================================
              STOCK
          ================================================= */}

          <Route
            path="products/:id/stock"
            element={
              <ProductStock />
            }
          />


          {/* =================================================
              ORDERS
          ================================================= */}

          <Route
            path="orders"
            element={
              <Orders />
            }
          />


          <Route
            path="orders/:id"
            element={
              <SellerOrderDetails />
            }
          />


          {/* =================================================
              ANALYTICS
          ================================================= */}

          <Route
            path="analytics"
            element={
              <Analytics />
            }
          />


          {/* =================================================
              WALLET
          ================================================= */}

          <Route
            path="wallet"
            element={
              <Wallet />
            }
          />


          <Route
            path="wallet/transactions"
            element={
              <Transactions />
            }
          />


          <Route
            path="wallet/withdraw"
            element={
              <Withdraw />
            }
          />


          {/* =================================================
              SETTINGS
          ================================================= */}

          <Route
            path="settings"
            element={
              <Settings />
            }
          />

        </Route>


        {/* =====================================================
            404
        ===================================================== */}

        <Route
          path="*"
          element={
            <NotFound />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;