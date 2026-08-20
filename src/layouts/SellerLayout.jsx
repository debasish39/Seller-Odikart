import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-out-cubic",
      once: true,
      offset: 15,
    });
  }, []);

  const bottomItems = [
    {
      name: "Home",
      path: "/seller/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/seller/products",
      icon: Package,
    },
    {
      name: "Orders",
      path: "/seller/orders",
      icon: ShoppingCart,
    },
    {
      name: "Wallet",
      path: "/seller/wallet",
      icon: Wallet,
    },
    // {
    //   name: "Settings",
    //   path: "/seller/settings",
    //   icon: Settings,
    // },
  ];

  const isActive = (path) => {
    if (path === "/seller/dashboard") {
      return location.pathname === path;
    }

    if (path === "/seller/settings") {
      return (
        location.pathname.startsWith("/seller/settings") ||
        location.pathname.startsWith("/seller/analytics")
      );
    }

    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-zinc-950">
      {/* =================================================
          TOP APP BAR
      ================================================== */}

      <Navbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* =================================================
          DESKTOP SIDEBAR + CONTENT
      ================================================== */}

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* 
          IMPORTANT:
          Sidebar is rendered ONLY on desktop.
          It does not exist on mobile.
        */}
        <div className="hidden lg:block">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================== */}

        <main
          className="
            min-w-0
            flex-1
            overflow-x-hidden
            pb-24
            sm:pb-24
            lg:pb-8
          "
        >
          <div
            data-aos="fade-up"
            data-aos-duration="500"
            className="
              mx-auto
              w-full
              max-w-[1500px]
              px-3
              py-4
              sm:px-5
              sm:py-6
              lg:px-7
              lg:py-7
            "
          >
            <Outlet />
          </div>
        </main>
      </div>

      {/* =================================================
          MOBILE BOTTOM NAVIGATION
          
          Only visible below lg.
      ================================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-[100]
          block
          border-t
          border-zinc-200/80
          bg-white/95
          shadow-[0_-8px_30px_rgba(0,0,0,0.08)]
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[68px]
            w-full
            max-w-xl
            items-center
            justify-around
            px-1
            pb-[env(safe-area-inset-bottom)]
          "
        >
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => navigate(item.path)}
                className="
                  group
                  flex
                  h-full
                  min-w-0
                  flex-1
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  px-1
                  active:scale-95
                "
              >
                {/* Icon */}
                <span
                  className={[
                    "relative flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200",
                    active
                      ? "bg-black text-white shadow-sm"
                      : "text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-700",
                  ].join(" ")}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.3 : 1.9}
                  />

                  {/* Orders notification */}
                  {item.name === "Orders" && (
                    <span
                      className="
                        absolute
                        right-1
                        top-0.5
                        h-2
                        w-2
                        rounded-full
                        bg-red-500
                        ring-2
                        ring-white
                      "
                    />
                  )}
                </span>

                {/* Label */}
                <span
                  className={[
                    "truncate text-[10px] font-semibold",
                    active
                      ? "text-zinc-950"
                      : "text-zinc-400",
                  ].join(" ")}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default SellerLayout;