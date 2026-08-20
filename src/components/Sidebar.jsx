import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Wallet,
  Settings,
  Store,
  X,
  Headphones,
  ChevronRight,
} from "lucide-react";

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const menuItems = [
    {
      name: "Dashboard",
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
      name: "Analytics",
      path: "/seller/analytics",
      icon: BarChart3,
    },
    {
      name: "Wallet",
      path: "/seller/wallet",
      icon: Wallet,
    },
  ];

  const accountItems = [
    {
      name: "Settings",
      path: "/seller/settings",
      icon: Settings,
    },
  ];

  const handleNavigation = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-all duration-300 lg:hidden",
          sidebarOpen
            ? "visible opacity-100"
            : "invisible opacity-0",
        ].join(" ")}
      />

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[285px] flex-col",
          "border-r border-zinc-200 bg-white",
          "shadow-[12px_0_40px_rgba(0,0,0,0.08)]",
          "transition-transform duration-300",
          "lg:sticky lg:top-0 lg:z-30 lg:h-screen",
          "lg:w-[250px] lg:translate-x-0 lg:shadow-none",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div
          className="
            flex
            h-[68px]
            shrink-0
            items-center
            justify-between
            border-b
            border-zinc-100
            px-4
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-black
                text-white
              "
            >
              <Store size={18} />
            </div>

            <div>
              <p className="text-[15px] font-bold">
                Odikart
              </p>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Seller Center
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-zinc-400
              hover:bg-zinc-100
              lg:hidden
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p
            className="
              mb-2
              px-3
              text-[9px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-zinc-400
            "
          >
            Workspace
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    [
                      "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5",
                      "text-[13px] font-semibold transition-all",
                      "active:scale-[0.98]",
                      isActive
                        ? "bg-black text-white shadow-sm"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-black",
                          isActive
                            ? "opacity-100"
                            : "opacity-0",
                        ].join(" ")}
                      />

                      <span
                        className={[
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          isActive
                            ? "bg-white text-black"
                            : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200",
                        ].join(" ")}
                      >
                        <Icon size={18} />
                      </span>

                      <span className="flex-1">
                        {item.name}
                      </span>

                      <ChevronRight
                        size={14}
                        className={[
                          "transition",
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-40",
                        ].join(" ")}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-7">
            <p
              className="
                mb-2
                px-3
                text-[9px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-zinc-400
              "
            >
              Account
            </p>

            {accountItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5",
                      "text-[13px] font-semibold transition-all",
                      isActive
                        ? "bg-black text-white"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={[
                          "flex h-10 w-10 items-center justify-center rounded-xl",
                          isActive
                            ? "bg-white text-black"
                            : "bg-zinc-100 text-zinc-500",
                        ].join(" ")}
                      >
                        <Icon size={18} />
                      </span>

                      <span>{item.name}</span>

                      <ChevronRight
                        size={14}
                        className="ml-auto opacity-40"
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Support */}
        <div className="border-t border-zinc-100 p-3">
          <div className="rounded-2xl bg-zinc-50 p-3">
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-black
                  text-white
                "
              >
                <Headphones size={16} />
              </div>

              <div>
                <p className="text-[11px] font-bold">
                  Need help?
                </p>

                <p className="text-[9px] text-zinc-400">
                  Seller support
                </p>
              </div>
            </div>

            <button
              type="button"
              className="
                mt-3
                w-full
                rounded-xl
                bg-black
                py-2.5
                text-[10px]
                font-bold
                text-white
                transition
                hover:bg-zinc-800
                active:scale-[0.98]
              "
            >
              Contact Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;