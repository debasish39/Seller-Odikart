import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import AOS from "aos";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/seller/dashboard") {
      return {
        title: "Dashboard",
        subtitle: "Overview",
      };
    }

    if (path.startsWith("/seller/products")) {
      return {
        title: "Products",
        subtitle: "Manage your products",
      };
    }

    if (path.startsWith("/seller/orders")) {
      return {
        title: "Orders",
        subtitle: "Manage your orders",
      };
    }

    if (path.startsWith("/seller/analytics")) {
      return {
        title: "Analytics",
        subtitle: "Store performance",
      };
    }

    if (path.startsWith("/seller/wallet")) {
      return {
        title: "Wallet",
        subtitle: "Balance & earnings",
      };
    }

    if (path.startsWith("/seller/settings")) {
      return {
        title: "Settings",
        subtitle: "Account preferences",
      };
    }

    return {
      title: "Seller Center",
      subtitle: "Manage your store",
    };
  };

  const page = getPageInfo();

  const initials =
    `${user?.firstName || ""}${user?.lastName || ""}`
      .trim()
      .slice(0, 2)
      .toUpperCase() || "S";

  return (
    <header
      className="
        sticky
        top-0
        z-50
        w-full
        border-b
        border-zinc-200/70
        bg-white/90
        backdrop-blur-2xl
        supports-[backdrop-filter]:bg-white/75
      "
    >
      <div
        className="
          mx-auto
          flex
          h-[64px]
          w-full
          items-center
          justify-between
          px-3
          sm:h-[68px]
          sm:px-5
          lg:px-7
        "
      >
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <div className="flex min-w-0 items-center gap-3">
          {/* App Logo */}
          {/* <button
            type="button"
            onClick={() => navigate("/seller/dashboard")}
            aria-label="Go to dashboard"
            className="
              hidden
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-zinc-950
              text-sm
              font-black
              text-white
              shadow-sm
              transition
              hover:bg-zinc-800
              active:scale-95
              sm:flex
            "
          >
            O
          </button> */}

          {/* Page Information */}
          <div className="min-w-0">
            {/* Mobile title */}
            <div className="flex items-center gap-2 sm:hidden">
              <h1
                className="
                  truncate
                  text-[16px]
                  font-bold
                  tracking-tight
                  text-zinc-950
                "
              >
                {page.title}
              </h1>
            </div>

            {/* Desktop title */}
            <h1
              className="
                hidden
                text-[15px]
                font-bold
                tracking-tight
                text-zinc-950
                sm:block
              "
            >
              {page.title}
            </h1>

            <p
              className="
                mt-0.5
                hidden
                text-[11px]
                font-medium
                text-zinc-400
                sm:block
              "
            >
              {page.subtitle}
            </p>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification */}
          <button
            type="button"
            onClick={() => {
              // Add notification navigation here later
            }}
            aria-label="Notifications"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-zinc-500
              transition-all
              duration-200
              hover:bg-zinc-100
              hover:text-zinc-950
              active:scale-95
              sm:h-11
              sm:w-11
            "
          >
            <Bell
              size={19}
              strokeWidth={1.9}
            />

            {/* Notification badge */}
            <span
              className="
                absolute
                right-[8px]
                top-[7px]
                flex
                h-[7px]
                w-[7px]
                items-center
                justify-center
                rounded-full
                bg-red-500
                ring-2
                ring-white
              "
            />
          </button>

          {/* Separator */}
          <div
            className="
              hidden
              h-7
              w-px
              bg-zinc-200
              sm:block
            "
          />

          {/* =================================================
              MOBILE PROFILE
          ================================================== */}

          <button
            type="button"
            onClick={() => navigate("/seller/settings")}
            aria-label="Open profile settings"
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-zinc-900
              to-zinc-600
              text-[11px]
              font-bold
              text-white
              shadow-sm
              ring-2
              ring-white
              transition-all
              active:scale-95
              sm:hidden
            "
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.firstName || "Seller"}
                className="
                  h-full
                  w-full
                  rounded-full
                  object-cover
                "
              />
            ) : (
              initials
            )}
          </button>

          {/* =================================================
              DESKTOP PROFILE
          ================================================== */}

          <button
            type="button"
            onClick={() => navigate("/seller/settings")}
            className="
              group
              hidden
              items-center
              gap-2.5
              rounded-2xl
              px-2
              py-1.5
              text-left
              transition
              hover:bg-zinc-50
              sm:flex
            "
          >
            {/* Avatar */}
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-gradient-to-br
                from-zinc-900
                to-zinc-600
                text-[11px]
                font-bold
                text-white
                shadow-sm
              "
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user?.firstName || "Seller"}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                initials
              )}
            </div>

            {/* User details */}
            <div className="hidden min-w-0 md:block">
              <p
                className="
                  max-w-[120px]
                  truncate
                  text-xs
                  font-bold
                  text-zinc-900
                "
              >
                {user?.firstName || "Seller"}
                {user?.lastName
                  ? ` ${user.lastName}`
                  : ""}
              </p>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  font-medium
                  text-zinc-400
                "
              >
                Seller Account
              </p>
            </div>

            <ChevronDown
              size={14}
              className="
                hidden
                text-zinc-400
                transition
                group-hover:text-zinc-700
                md:block
              "
            />
          </button>

          {/* =================================================
              DESKTOP LOGOUT
          ================================================== */}

          <button
            type="button"
            onClick={logout}
            aria-label="Logout"
            className="
              hidden
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-zinc-200
              px-3
              text-zinc-500
              transition-all
              duration-200
              hover:border-red-200
              hover:bg-red-50
              hover:text-red-600
              active:scale-95
              sm:flex
            "
          >
            <LogOut size={16} />

            <span
              className="
                text-xs
                font-semibold
              "
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE QUICK ACTION BAR
      ====================================================== */}

      {/* <div
        className="
          flex
          h-10
          items-center
          border-t
          border-zinc-100
          px-3
          sm:hidden
        "
      >
        <div className="flex min-w-0 flex-1 items-center">
          <span
            className="
              truncate
              text-[11px]
              font-medium
              text-zinc-400
            "
          >
            {page.subtitle}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate("/seller/settings")}
          className="
            flex
            shrink-0
            items-center
            gap-1
            rounded-lg
            px-2
            py-1
            text-[10px]
            font-semibold
            text-zinc-500
            transition
            hover:bg-zinc-100
            hover:text-zinc-900
            active:scale-95
          "
        >
          <Settings size={13} />
          Settings
        </button>
      </div> */}
    </header>
  );
}

export default Navbar;