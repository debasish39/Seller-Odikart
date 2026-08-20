import { useEffect, useMemo, useState } from "react";
import {
  getSellerSettings,
  updateSellerSettings,
} from "../../services/sellerSettingsService";

/* =========================================================
   ICONS
========================================================= */

const Icon = ({
  name,
  size = 20,
  strokeWidth = 1.8,
  className = "",
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className,
  };

  const icons = {
    user: (
      <svg {...common}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.7-4 3.3-6 8-6s7.3 2 8 6" />
      </svg>
    ),

    store: (
      <svg {...common}>
        <path d="M3 10h18" />
        <path d="M5 10v10h14V10" />
        <path d="M4 4h16l2 6H2l2-6Z" />
        <path d="M9 14h6v6H9z" />
      </svg>
    ),

    location: (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),

    business: (
      <svg {...common}>
        <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
        <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
        <path d="M9 21v-3h6v3" />
      </svg>
    ),

    truck: (
      <svg {...common}>
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </svg>
    ),

    bell: (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    ),

    link: (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2" />
        <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 7 20l1.2-1.2" />
      </svg>
    ),

    creditCard: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h3" />
      </svg>
    ),

    shield: (
      <svg {...common}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),

    wallet: (
      <svg {...common}>
        <path d="M4 6h16v14H4z" />
        <path d="M4 6V4h13" />
        <path d="M16 13h4" />
        <circle cx="16" cy="13" r=".5" />
      </svg>
    ),

    chart: (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 4-4 3 2 5-6" />
      </svg>
    ),

    settings: (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.1h2.6V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v2.6H20a1.7 1.7 0 0 0-1.6 1Z" />
      </svg>
    ),
    logout: (
  <svg {...common}>
    <path d="M9 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
    <path d="M14 8l4 4-4 4" />
    <path d="M18 12H9" />
  </svg>
),
    check: (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    ),

    alert: (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),

    lock: (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),

    save: (
      <svg {...common}>
        <path d="M5 4h12l2 2v14H5z" />
        <path d="M8 4v5h7V4" />
        <path d="M8 20v-6h8v6" />
      </svg>
    ),

    chevronRight: (
      <svg {...common}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    ),

    chevronLeft: (
      <svg {...common}>
        <path d="m15 18-6-6 6-6" />
      </svg>
    ),
  };

  return icons[name] || icons.settings;
};

/* =========================================================
   SETTINGS MENU
========================================================= */

const MENU = [
  {
    id: "profile",
    label: "Profile",
    description: "Personal information",
    icon: "user",
    group: "Account",
  },
  {
    id: "account",
    label: "Account",
    description: "Security & activity",
    icon: "settings",
    group: "Account",
  },
  {
    id: "verification",
    label: "Verification",
    description: "Seller verification",
    icon: "shield",
    group: "Account",
  },

  {
    id: "store",
    label: "Store",
    description: "Storefront settings",
    icon: "store",
    group: "Store",
  },
  {
    id: "address",
    label: "Address",
    description: "Business location",
    icon: "location",
    group: "Store",
  },
  {
    id: "shipping",
    label: "Shipping & returns",
    description: "Delivery and return preferences",
    icon: "truck",
    group: "Store",
  },

  {
    id: "business",
    label: "Business information",
    description: "Registered business details",
    icon: "business",
    group: "Payments & business",
  },
  {
    id: "wallet",
    label: "Wallet",
    description: "Balance and earnings",
    icon: "wallet",
    group: "Payments & business",
  },
  {
    id: "subscription",
    label: "Subscription",
    description: "Your seller plan",
    icon: "creditCard",
    group: "Payments & business",
  },

  {
    id: "notifications",
    label: "Notifications",
    description: "Email, SMS and push notifications",
    icon: "bell",
    group: "Preferences",
  },
  {
    id: "social",
    label: "Social links",
    description: "Connected social profiles",
    icon: "link",
    group: "Preferences",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Store performance",
    icon: "chart",
    group: "Preferences",
  },
];

/* =========================================================
   MOBILE SETTINGS HOME
========================================================= */

const MobileSettingsHome = ({
  settings,
  onSelect,
  onLogout,
}) => {
  const firstName = settings?.profile?.firstName || "";
  const lastName = settings?.profile?.lastName || "";

  const fullName =
    `${firstName} ${lastName}`.trim() || "Seller account";

  const email =
    settings?.profile?.email || "Manage your seller account";

  const image = settings?.profile?.image || "";

  const groups = [
    "Account",
    "Store",
    "Payments & business",
    "Preferences",
  ];
  
  return (
    <div className="lg:hidden">
      {/* =====================================================
          TITLE
      ====================================================== */}

      <div className="px-1 pb-5 pt-1">
        <h1 className="text-[28px] font-normal tracking-tight text-gray-950">
          Settings
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your seller account
        </p>
      </div>

      {/* =====================================================
          PROFILE
      ====================================================== */}

      <button
        type="button"
        onClick={() => onSelect("profile")}
        className="
          mb-7
          flex
          min-h-[82px]
          w-full
          items-center
          gap-4
          rounded-2xl
          bg-white
          px-4
          py-4
          text-left
          shadow-[0_1px_3px_rgba(0,0,0,0.04)]
          transition
          active:bg-gray-50
          active:scale-[0.995]
        "
      >
        <div
          className="
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            bg-gray-950
            text-base
            font-semibold
            text-white
          "
        >
          {image ? (
            <img
              src={image}
              alt={fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            `${firstName?.charAt(0) || "S"}${
              lastName?.charAt(0) || ""
            }`
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[16px] font-medium text-gray-950">
            {fullName}
          </h2>

          <p className="mt-0.5 truncate text-sm text-gray-500">
            {email}
          </p>

          <p className="mt-1 text-xs font-medium text-gray-400">
            Seller account
          </p>
        </div>

        <Icon
          name="chevronRight"
          size={19}
          className="shrink-0 text-gray-400"
        />
      </button>

      {/* =====================================================
          GROUPS
      ====================================================== */}

      <div className="space-y-7">
        {groups.map((group) => {
          const items = MENU.filter(
            (item) => item.group === group
          );

          return (
            <section key={group}>
              <h2
                className="
                  px-4
                  pb-2
                  text-[14px]
                  font-medium
                  text-gray-500
                "
              >
                {group}
              </h2>

              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  bg-white
                  shadow-[0_1px_3px_rgba(0,0,0,0.03)]
                "
              >
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={[
                      `
                      flex
                      min-h-[68px]
                      w-full
                      items-center
                      gap-4
                      px-4
                      text-left
                      transition
                      active:bg-gray-100
                      `,
                      index !== items.length - 1
                        ? "border-b border-gray-100"
                        : "",
                    ].join(" ")}
                  >
                    {/* Icon */}
                    <span
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-100
                        text-gray-600
                      "
                    >
                      <Icon
                        name={item.icon}
                        size={19}
                        strokeWidth={1.8}
                      />
                    </span>

                    {/* Text */}
                    <span className="min-w-0 flex-1">
                      <span
                        className="
                          block
                          truncate
                          text-[15px]
                          font-medium
                          text-gray-900
                        "
                      >
                        {item.label}
                      </span>

                      <span
                        className="
                          mt-0.5
                          block
                          truncate
                          text-[12px]
                          leading-5
                          text-gray-500
                        "
                      >
                        {item.description}
                      </span>
                    </span>

                    {/* Arrow */}
                    <Icon
                      name="chevronRight"
                      size={18}
                      className="shrink-0 text-gray-400"
                    />
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
{/* =====================================================
    LOGOUT
====================================================== */}

<div className="mt-7">
  <button
    type="button"
    onClick={onLogout}
    className="
      flex
      min-h-[60px]
      w-full
      items-center
      gap-4
      rounded-2xl
      bg-white
      px-4
      text-left
      shadow-[0_1px_3px_rgba(0,0,0,0.03)]
      transition
      active:bg-red-50
    "
  >
    <span
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        rounded-full
        bg-red-50
        text-red-600
      "
    >
      <Icon
        name="logout"
        size={19}
      />
    </span>

    <span className="min-w-0 flex-1">
      <span className="block text-[15px] font-medium text-red-600">
        Log out
      </span>

      <span className="mt-0.5 block text-[12px] text-gray-400">
        Sign out of your seller account
      </span>
    </span>

    <Icon
      name="chevronRight"
      size={18}
      className="text-gray-300"
    />
  </button>
</div>
      {/* Footer */}
      <div className="px-4 pb-6 pt-9 text-center">
        <p className="text-xs text-gray-400">
          Odikart Seller Center
        </p>

        <p className="mt-1 text-[11px] text-gray-300">
          Settings & preferences
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN SETTINGS
========================================================= */

const Settings = () => {
  const [settings, setSettings] = useState(null);

  // null = mobile settings home
  const [activeSection, setActiveSection] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const activeMenu = useMemo(
    () =>
      MENU.find(
        (item) => item.id === activeSection
      ) || null,
    [activeSection]
  );
const handleLogout = async () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("seller");

    sessionStorage.clear();

    window.location.href = "/login";
  } catch (error) {
    console.error("Logout Error:", error);

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("seller");

    sessionStorage.clear();

    window.location.href = "/login";
  }
};
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSellerSettings();

      if (data?.success) {
        setSettings(data.settings);
      } else {
        setError(
          data?.message ||
            "Failed to load settings"
        );
      }
    } catch (error) {
      console.error("Settings Error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load settings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  /* =======================================================
     UPDATE HELPERS
  ======================================================= */

  const updateProfile = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const updateStore = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      store: {
        ...prev.store,
        [field]: value,
      },
    }));
  };

  const updateAddress = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      store: {
        ...prev.store,
        address: {
          ...prev.store?.address,
          [field]: value,
        },
      },
    }));
  };

  const updateBusiness = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        [field]: value,
      },
    }));
  };

  const updateShipping = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value,
      },
    }));
  };

  const updateNotifications = (
    field,
    value
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const updateSocial = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const data = await updateSellerSettings({
        profile: {
          firstName:
            settings.profile?.firstName,
          lastName:
            settings.profile?.lastName,
          phone: settings.profile?.phone,
          image: settings.profile?.image,
        },

        store: {
          shopName:
            settings.store?.shopName,
          description:
            settings.store?.description,
          website:
            settings.store?.website,
          supportEmail:
            settings.store?.supportEmail,
          supportPhone:
            settings.store?.supportPhone,
          isOpen:
            settings.store?.isOpen,
          vacationMode:
            settings.store?.vacationMode,
          address:
            settings.store?.address,
        },

        business: {
          businessType:
            settings.business?.businessType,
          ownerName:
            settings.business?.ownerName,
          registrationNumber:
            settings.business?.registrationNumber,
        },

        shipping: {
          freeShipping:
            settings.shipping?.freeShipping,
          processingTime:
            settings.shipping?.processingTime,
          returnDays:
            settings.shipping?.returnDays,
        },

        notifications: {
          email:
            settings.notifications?.email,
          sms:
            settings.notifications?.sms,
          push:
            settings.notifications?.push,
        },

        socialLinks:
          settings.socialLinks,
      });

      if (data?.success) {
        setMessage(
          "Your settings have been saved successfully."
        );

        await loadSettings();
      } else {
        setError(
          data?.message ||
            "Failed to update settings"
        );
      }
    } catch (error) {
      console.error(
        "UPDATE SETTINGS ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update settings"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            Loading settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Getting your seller account ready...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (!settings) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] px-4 py-8">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Icon
              name="alert"
              size={24}
            />
          </div>

          <h2 className="mt-5 text-xl font-semibold text-gray-900">
            Unable to load settings
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error ||
              "Something went wrong while loading your settings."}
          </p>

          <button
            type="button"
            onClick={loadSettings}
            className="
              mt-6
              min-h-11
              w-full
              rounded-xl
              bg-gray-950
              px-5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              sm:w-auto
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     MOBILE SETTINGS HOME
  ======================================================= */

  if (!activeSection) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
        <div
          className="
            mx-auto
            w-full
            max-w-[700px]
            px-3
            pb-28
            pt-4
            sm:px-5
            lg:max-w-[1500px]
          "
        >
        <MobileSettingsHome
  settings={settings}
  onSelect={(section) => {
    setActiveSection(section);
    setMessage("");
    setError("");
  }}
  onLogout={handleLogout}
/>

          {/* Desktop fallback */}
          <div className="hidden lg:block">
            <DesktopSettingsLayout
              settings={settings}
              activeSection="profile"
              setActiveSection={setActiveSection}
              message={message}
              error={error}
              setMessage={setMessage}
              setError={setError}
              handleSave={handleSave}
              saving={saving}
              updateProfile={updateProfile}
              updateStore={updateStore}
              updateAddress={updateAddress}
              updateBusiness={updateBusiness}
              updateShipping={updateShipping}
              updateNotifications={
                updateNotifications
              }
              updateSocial={updateSocial}
            />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DETAIL VIEW
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-gray-900">
      <div
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-3
          pb-28
          pt-3
          sm:px-5
          sm:py-6
          lg:px-8
          lg:pb-8
          lg:pt-8
        "
      >
        {/* =================================================
            MOBILE HEADER
        ================================================== */}

        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setActiveSection(null);
              setMessage("");
              setError("");
            }}
            className="
              flex
              min-h-11
              items-center
              gap-1
              px-0
              text-sm
              font-medium
              text-gray-600
              active:text-gray-950
            "
          >
            <Icon
              name="chevronLeft"
              size={20}
            />

            Settings
          </button>

          <div className="mt-2 flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gray-950
                text-white
              "
            >
              <Icon
                name={activeMenu?.icon}
                size={19}
              />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-gray-950">
                {activeMenu?.label}
              </h1>

              <p className="truncate text-sm text-gray-500">
                {activeMenu?.description}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            DESKTOP HEADER
        ================================================== */}

        <header className="mb-7 hidden lg:block">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-gray-200
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-gray-600
                  shadow-sm
                "
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Seller dashboard
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-gray-950">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Manage your store, business information,
                seller account, notifications and preferences.
              </p>
            </div>
          </div>
        </header>

        {/* =================================================
            ALERTS
        ================================================== */}

        <div className="mb-5 space-y-3">
          {message && (
            <Alert
              type="success"
              message={message}
              onClose={() => setMessage("")}
            />
          )}

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError("")}
            />
          )}
        </div>

        {/* =================================================
            DESKTOP
        ================================================== */}

        <div className="hidden lg:block">
          <DesktopSettingsLayout
            settings={settings}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            message={message}
            error={error}
            setMessage={setMessage}
            setError={setError}
            handleSave={handleSave}
            saving={saving}
            updateProfile={updateProfile}
            updateStore={updateStore}
            updateAddress={updateAddress}
            updateBusiness={updateBusiness}
            updateShipping={updateShipping}
            updateNotifications={
              updateNotifications
            }
            updateSocial={updateSocial}
          />
        </div>

        {/* =================================================
            MOBILE DETAIL
        ================================================== */}

        <div className="lg:hidden">
          {message && (
            <div className="mb-4">
              <Alert
                type="success"
                message={message}
                onClose={() => setMessage("")}
              />
            </div>
          )}

          {error && (
            <div className="mb-4">
              <Alert
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            </div>
          )}

          <MobileSectionContent
            settings={settings}
            activeSection={activeSection}
            handleSave={handleSave}
            saving={saving}
            updateProfile={updateProfile}
            updateStore={updateStore}
            updateAddress={updateAddress}
            updateBusiness={updateBusiness}
            updateShipping={updateShipping}
            updateNotifications={
              updateNotifications
            }
            updateSocial={updateSocial}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MOBILE SECTION CONTENT
========================================================= */

const MobileSectionContent = ({
  settings,
  activeSection,
  handleSave,
  saving,
  updateProfile,
  updateStore,
  updateAddress,
  updateBusiness,
  updateShipping,
  updateNotifications,
  updateSocial,
}) => {
  if (activeSection === "profile") {
    return (
      <Section
        icon="user"
        title="Profile"
        description="Manage your personal seller information."
      >
        <div className="mb-5 rounded-2xl bg-gray-950 p-5 text-white">
          <div className="flex items-center gap-4">
            <Avatar
              name={`${settings.profile?.firstName || ""} ${
                settings.profile?.lastName || ""
              }`}
              image={settings.profile?.image}
            />

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                Seller profile
              </p>

              <h3 className="mt-1 truncate text-lg font-semibold">
                {settings.profile?.firstName ||
                settings.profile?.lastName
                  ? `${settings.profile?.firstName || ""} ${
                      settings.profile?.lastName || ""
                    }`.trim()
                  : "Your profile"}
              </h3>

              <p className="mt-1 truncate text-xs text-white/50">
                @{settings.profile?.username || "seller"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Input
            label="First Name"
            value={settings.profile?.firstName || ""}
            onChange={(e) =>
              updateProfile(
                "firstName",
                e.target.value
              )
            }
          />

          <Input
            label="Last Name"
            value={settings.profile?.lastName || ""}
            onChange={(e) =>
              updateProfile(
                "lastName",
                e.target.value
              )
            }
          />

          <Input
            label="Username"
            value={settings.profile?.username || ""}
            disabled
          />

          <Input
            label="Email"
            value={settings.profile?.email || ""}
            disabled
          />

          <Input
            label="Phone"
            value={settings.profile?.phone || ""}
            onChange={(e) =>
              updateProfile(
                "phone",
                e.target.value
              )
            }
          />

          <Input
            label="Profile Image URL"
            value={settings.profile?.image || ""}
            onChange={(e) =>
              updateProfile(
                "image",
                e.target.value
              )
            }
          />
        </div>

        <SaveButton
          onClick={handleSave}
          saving={saving}
        />
      </Section>
    );
  }

  if (activeSection === "store") {
    return (
      <Section
        icon="store"
        title="Store"
        description="Manage how customers see your store."
      >
        <div className="space-y-5">
          <Input
            label="Shop Name"
            value={settings.store?.shopName || ""}
            onChange={(e) =>
              updateStore(
                "shopName",
                e.target.value
              )
            }
          />

          <Input
            label="Shop Slug"
            value={settings.store?.shopSlug || ""}
            disabled
          />

          <Input
            label="Website"
            value={settings.store?.website || ""}
            onChange={(e) =>
              updateStore(
                "website",
                e.target.value
              )
            }
          />

          <Input
            label="Support Email"
            value={
              settings.store?.supportEmail || ""
            }
            onChange={(e) =>
              updateStore(
                "supportEmail",
                e.target.value
              )
            }
          />

          <Input
            label="Support Phone"
            value={
              settings.store?.supportPhone || ""
            }
            onChange={(e) =>
              updateStore(
                "supportPhone",
                e.target.value
              )
            }
          />

          <Input
            label="Shop Logo"
            value={settings.store?.shopLogo || ""}
            onChange={(e) =>
              updateStore(
                "shopLogo",
                e.target.value
              )
            }
          />

          <Input
            label="Shop Banner"
            value={
              settings.store?.shopBanner || ""
            }
            onChange={(e) =>
              updateStore(
                "shopBanner",
                e.target.value
              )
            }
          />

          <Textarea
            label="Store Description"
            rows={5}
            value={
              settings.store?.description || ""
            }
            onChange={(e) =>
              updateStore(
                "description",
                e.target.value
              )
            }
            placeholder="Tell customers about your store..."
          />

          <Toggle
            title="Store Open"
            description="Allow customers to purchase products from your store."
            checked={
              settings.store?.isOpen ?? true
            }
            onChange={(value) =>
              updateStore("isOpen", value)
            }
          />

          <Toggle
            title="Vacation Mode"
            description="Temporarily pause your store while keeping your seller account active."
            checked={
              settings.store?.vacationMode ?? false
            }
            onChange={(value) =>
              updateStore(
                "vacationMode",
                value
              )
            }
          />
        </div>

        <SaveButton
          onClick={handleSave}
          saving={saving}
        />
      </Section>
    );
  }

  if (activeSection === "address") {
    return (
      <Section
        icon="location"
        title="Address"
        description="Manage your business and store location."
      >
        <div className="space-y-5">
          <Input
            label="Street"
            value={
              settings.store?.address?.street ||
              ""
            }
            onChange={(e) =>
              updateAddress(
                "street",
                e.target.value
              )
            }
          />

          <Input
            label="City"
            value={
              settings.store?.address?.city ||
              ""
            }
            onChange={(e) =>
              updateAddress(
                "city",
                e.target.value
              )
            }
          />

          <Input
            label="State"
            value={
              settings.store?.address?.state ||
              ""
            }
            onChange={(e) =>
              updateAddress(
                "state",
                e.target.value
              )
            }
          />

          <Input
            label="Postcode"
            value={
              settings.store?.address?.postcode ||
              ""
            }
            onChange={(e) =>
              updateAddress(
                "postcode",
                e.target.value
              )
            }
          />

          <Input
            label="Country"
            value={
              settings.store?.address?.country ||
              ""
            }
            onChange={(e) =>
              updateAddress(
                "country",
                e.target.value
              )
            }
          />
        </div>

        <SaveButton
          onClick={handleSave}
          saving={saving}
        />
      </Section>
    );
  }

  if (activeSection === "business") {
    return (
      <Section
        icon="business"
        title="Business information"
        description="Manage your registered business details."
      >
        <div className="space-y-5">
          <Select
            label="Business Type"
            value={
              settings.business?.businessType ||
              ""
            }
            onChange={(e) =>
              updateBusiness(
                "businessType",
                e.target.value
              )
            }
            options={[
              "Individual",
              "Proprietorship",
              "Partnership",
              "LLP",
              "Private Limited",
            ]}
          />

          <Input
            label="Owner Name"
            value={
              settings.business?.ownerName ||
              ""
            }
            onChange={(e) =>
              updateBusiness(
                "ownerName",
                e.target.value
              )
            }
          />

          <Input
            label="GST Number"
            value={
              settings.business?.gstNumber ||
              ""
            }
            disabled
          />

          <Input
            label="PAN Number"
            value={
              settings.business?.panNumber ||
              ""
            }
            disabled
          />

          <Input
            label="Registration Number"
            value={
              settings.business
                ?.registrationNumber || ""
            }
            onChange={(e) =>
              updateBusiness(
                "registrationNumber",
                e.target.value
              )
            }
          />
        </div>

        <ReadOnlyNotice
          title="Protected KYC information"
          description="GST and PAN information are protected and cannot be changed from seller settings."
        />

        <SaveButton
          onClick={handleSave}
          saving={saving}
        />
      </Section>
    );
  }

  if (activeSection === "shipping") {
    return (
      <Section
        icon="truck"
        title="Shipping & returns"
        description="Configure your shipping and return policy."
      >
        <div className="space-y-5">
          <Toggle
            title="Free Shipping"
            description="Offer free shipping to customers."
            checked={
              settings.shipping?.freeShipping ??
              false
            }
            onChange={(value) =>
              updateShipping(
                "freeShipping",
                value
              )
            }
          />

          <Input
            type="number"
            min="0"
            label="Processing Time"
            suffix="days"
            value={
              settings.shipping?.processingTime ??
              2
            }
            onChange={(e) =>
              updateShipping(
                "processingTime",
                Number(e.target.value)
              )
            }
          />

          <Input
            type="number"
            min="0"
            label="Return Period"
            suffix="days"
            value={
              settings.shipping?.returnDays ??
              7
            }
            onChange={(e) =>
              updateShipping(
                "returnDays",
                Number(e.target.value)
              )
            }
          />
        </div>

        <SaveButton
          onClick={handleSave}
          saving={saving}
        />
      </Section>
    );
  }

  if (activeSection === "notifications") {
    return (
      <Section
        icon="bell"
        title="Notifications"
        description="Choose how Odikart communicates with you."
      >
        <div className="space-y-3">
          <Toggle
            title="Email Notifications"
            description="Receive seller notifications by email."
            checked={
              settings.notifications?.email ??
              true
            }
            onChange={(value) =>
              updateNotifications(
                "email",
                value
              )
            }
          />

          <Toggle
            title="SMS Notifications"
            description="Receive important alerts through SMS."
            checked={
              settings.notifications?.sms ??
              true
            }
            onChange={(value) =>
              updateNotifications(
                "sms",
                value
              )
            }
          />

          <Toggle
            title="Push Notifications"
            description="Receive notifications inside the application."
            checked={
              settings.notifications?.push ??
              true
            }
            onChange={(value) =>
              updateNotifications(
                "push",
                value
              )
            }
          />
        </div>

        <SaveButton
          onClick={handleSave}
          saving={saving}
        />
      </Section>
    );
  }

  if (activeSection === "social") {
    return (
      <Section
        icon="link"
        title="Social links"
        description="Connect your store's social profiles."
      >
        <div className="space-y-5">
          <Input
            label="Instagram"
            value={
              settings.socialLinks?.instagram ||
              ""
            }
            onChange={(e) =>
              updateSocial(
                "instagram",
                e.target.value
              )
            }
            prefix="@"
          />

          <Input
            label="Twitter / X"
            value={
              settings.socialLinks?.twitter ||
              ""
            }
            onChange={(e) =>
              updateSocial(
                "twitter",
                e.target.value
              )
            }
          />

          <Input
            label="LinkedIn"
            value={
              settings.socialLinks?.linkedin ||
              ""
            }
            onChange={(e) =>
              updateSocial(
                "linkedin",
                e.target.value
              )
            }
          />

          <Input
            label="GitHub"
            value={
              settings.socialLinks?.github ||
              ""
            }
            onChange={(e) =>
              updateSocial(
                "github",
                e.target.value
              )
            }
          />

          <Input
            label="Website"
            value={
              settings.socialLinks?.website ||
              ""
            }
            onChange={(e) =>
              updateSocial(
                "website",
                e.target.value
              )
            }
          />
        </div>

        <SaveButton
          onClick={handleSave}
          saving={saving}
        />
      </Section>
    );
  }

  if (activeSection === "subscription") {
    return (
      <Section
        icon="creditCard"
        title="Subscription"
        description="Your current Odikart seller plan."
      >
        <div className="mb-5 rounded-2xl bg-gray-950 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
            Current plan
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {settings.subscription?.plan ||
              "Free"}
          </h3>

          <p className="mt-1 text-sm text-white/50">
            Your seller subscription and marketplace limits.
          </p>

          <div className="mt-4">
            <StatusBadge
              value="Active"
              variant="success"
            />
          </div>
        </div>

        <StatsGrid columns="2">
          <InfoCard
            title="Plan"
            value={
              settings.subscription?.plan ||
              "Free"
            }
            icon="creditCard"
          />

          <InfoCard
            title="Commission"
            value={`${
              settings.subscription
                ?.commissionRate ?? 10
            }%`}
            icon="chart"
          />

          <InfoCard
            title="Maximum Products"
            value={
              settings.subscription
                ?.maxProducts ?? 100
            }
            icon="store"
          />

          <InfoCard
            title="Started"
            value={formatDate(
              settings.subscription?.startedAt
            )}
            icon="check"
          />
        </StatsGrid>

        <ReadOnlyNotice
          title="Subscription managed by Odikart"
          description="Subscription information is read-only from seller settings."
        />
      </Section>
    );
  }

  if (activeSection === "verification") {
    return (
      <Section
        icon="shield"
        title="Verification"
        description="Your marketplace verification status."
      >
        <div className="mb-5 rounded-2xl bg-emerald-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600">
              <Icon
                name="shield"
                size={19}
              />
            </div>

            <div>
              <p className="text-sm font-bold text-emerald-950">
                Verification status
              </p>

              <p className="mt-1 text-xs leading-5 text-emerald-800/70">
                Your verification details are controlled by the marketplace.
              </p>
            </div>
          </div>
        </div>

        <StatsGrid columns="2">
          <StatusCard
            title="Seller Status"
            value={
              settings.verification
                ?.sellerStatus || "none"
            }
          />

          <StatusCard
            title="Verification"
            value={
              settings.verification
                ?.verification?.status ||
              "pending"
            }
          />

          <InfoCard
            title="Applied"
            value={formatDate(
              settings.verification
                ?.sellerAppliedAt
            )}
            icon="check"
          />

          <InfoCard
            title="Approved"
            value={formatDate(
              settings.verification
                ?.sellerApprovedAt
            )}
            icon="shield"
          />
        </StatsGrid>

        {settings.verification
          ?.sellerRejectedReason && (
          <div className="mt-5 rounded-2xl bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-900">
              Rejection reason
            </p>

            <p className="mt-1 text-sm leading-6 text-red-700">
              {
                settings.verification
                  .sellerRejectedReason
              }
            </p>
          </div>
        )}

        <ReadOnlyNotice
          title="Verification is managed by Odikart"
          description="Seller verification information cannot be modified from this page."
        />
      </Section>
    );
  }

  if (activeSection === "wallet") {
    return (
      <Section
        icon="wallet"
        title="Wallet"
        description="Your seller wallet information."
      >
        <div className="mb-5 rounded-2xl bg-gray-950 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
            Available balance
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight">
            ₹
            {Number(
              settings.wallet
                ?.availableBalance || 0
            ).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <p className="mt-2 text-sm text-white/50">
            Current balance available in your seller wallet.
          </p>
        </div>

        <StatsGrid columns="2">
          <MoneyCard
            title="Available Balance"
            value={
              settings.wallet
                ?.availableBalance
            }
            highlight
          />

          <MoneyCard
            title="Pending Balance"
            value={
              settings.wallet
                ?.pendingBalance
            }
          />

          <MoneyCard
            title="Lifetime Earnings"
            value={
              settings.wallet
                ?.lifetimeEarnings
            }
          />

          <MoneyCard
            title="Total Withdrawn"
            value={
              settings.wallet
                ?.totalWithdrawn
            }
          />

          <MoneyCard
            title="Commission"
            value={
              settings.wallet
                ?.totalCommission
            }
          />

          <MoneyCard
            title="Refunds"
            value={
              settings.wallet
                ?.totalRefunds
            }
          />
        </StatsGrid>

        <ReadOnlyNotice
          title="Wallet is managed by Odikart"
          description="Financial information is read-only from seller settings."
        />
      </Section>
    );
  }

  if (activeSection === "analytics") {
    return (
      <Section
        icon="chart"
        title="Analytics"
        description="Your current store performance."
      >
        <StatsGrid columns="2">
          <InfoCard
            title="Products"
            value={
              settings.analytics
                ?.totalProducts ?? 0
            }
            icon="store"
          />

          <InfoCard
            title="Orders"
            value={
              settings.analytics
                ?.totalOrders ?? 0
            }
            icon="truck"
          />

          <MoneyCard
            title="Revenue"
            value={
              settings.analytics
                ?.totalRevenue
            }
            highlight
          />

          <MoneyCard
            title="Sales"
            value={
              settings.analytics
                ?.totalSales
            }
          />

          <InfoCard
            title="Reviews"
            value={
              settings.analytics
                ?.totalReviews ?? 0
            }
            icon="check"
          />

          <InfoCard
            title="Followers"
            value={
              settings.analytics
                ?.followers ?? 0
            }
            icon="user"
          />
        </StatsGrid>

        <ReadOnlyNotice
          title="Analytics are automatically calculated"
          description="Store performance data is read-only and updated by Odikart."
        />
      </Section>
    );
  }

  if (activeSection === "account") {
    return (
      <Section
        icon="settings"
        title="Account"
        description="Account status and activity."
      >
        <StatsGrid columns="2">
          <StatusCard
            title="Blocked"
            value={
              settings.account?.isBlocked
                ? "Yes"
                : "No"
            }
          />

          <StatusCard
            title="Deleted"
            value={
              settings.account?.isDeleted
                ? "Yes"
                : "No"
            }
          />

          <InfoCard
            title="Created"
            value={formatDate(
              settings.account?.createdAt
            )}
            icon="check"
          />

          <InfoCard
            title="Last Login"
            value={formatDate(
              settings.account?.lastLogin
            )}
            icon="user"
          />
        </StatsGrid>

        <div className="mt-5 rounded-2xl bg-amber-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
              <Icon
                name="lock"
                size={18}
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Security
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800/80">
                Password changes and account deletion should be handled through dedicated security endpoints.
              </p>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  return null;
};

/* =========================================================
   DESKTOP SETTINGS
========================================================= */

const DesktopSettingsLayout = ({
  settings,
  activeSection,
  setActiveSection,
  message,
  error,
  setMessage,
  setError,
  handleSave,
  saving,
  updateProfile,
  updateStore,
  updateAddress,
  updateBusiness,
  updateShipping,
  updateNotifications,
  updateSocial,
}) => {
  return (
    <div className="grid gap-5 lg:grid-cols-[270px_minmax(0,1fr)] xl:gap-7">
      {/* Sidebar */}
      <aside>
        <div className="sticky top-6 rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
          <div className="px-3 pb-3 pt-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
              Settings
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Manage your seller account
            </p>
          </div>

          <nav className="space-y-1">
            {MENU.map((item) => {
              const active =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(item.id);
                    setMessage("");
                    setError("");
                  }}
                  className={[
                    "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all",
                    active
                      ? "bg-gray-950 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-950",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      active
                        ? "bg-white/10 text-white"
                        : "bg-gray-100 text-gray-500",
                    ].join(" ")}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {item.label}
                    </span>

                    <span className="mt-0.5 block truncate text-[11px] text-gray-400">
                      {item.description}
                    </span>
                  </span>

                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-3 rounded-2xl bg-gray-50 p-3">
            <div className="flex gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm">
                <Icon
                  name="shield"
                  size={16}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-800">
                  Protected account
                </p>

                <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
                  Sensitive KYC information is protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0">
        <MobileSectionContent
          settings={settings}
          activeSection={activeSection}
          handleSave={handleSave}
          saving={saving}
          updateProfile={updateProfile}
          updateStore={updateStore}
          updateAddress={updateAddress}
          updateBusiness={updateBusiness}
          updateShipping={updateShipping}
          updateNotifications={updateNotifications}
          updateSocial={updateSocial}
        />
      </main>
    </div>
  );
};

/* =========================================================
   SECTION
========================================================= */

const Section = ({
  icon,
  title,
  description,
  children,
}) => {
  return (
    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-white">
            <Icon
              name={icon}
              size={20}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold tracking-tight text-gray-950 sm:text-xl">
              {title}
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </section>
  );
};

/* =========================================================
   INPUT
========================================================= */

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
  hint,
  placeholder,
  prefix,
  suffix,
  min,
}) => {
  return (
    <div className="min-w-0">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-gray-800">
          {label}
        </span>

        <div
          className={[
            "flex min-h-12 w-full overflow-hidden rounded-xl border bg-white transition-all",
            disabled
              ? "border-gray-200 bg-gray-50"
              : "border-gray-200 hover:border-gray-300 focus-within:border-gray-950 focus-within:ring-4 focus-within:ring-gray-100",
          ].join(" ")}
        >
          {prefix && (
            <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
              {prefix}
            </span>
          )}

          <input
            type={type}
            value={value ?? ""}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            className={[
              "min-w-0 flex-1 border-0 bg-transparent px-3.5 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:text-[15px]",
              disabled
                ? "cursor-not-allowed text-gray-400"
                : "",
            ].join(" ")}
          />

          {suffix && (
            <span className="flex items-center border-l border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-400">
              {suffix}
            </span>
          )}
        </div>
      </label>

      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
};

/* =========================================================
   TEXTAREA
========================================================= */

const Textarea = ({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}) => {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-800">
        {label}
      </span>

      <textarea
        rows={rows}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className="
          block
          w-full
          resize-y
          rounded-xl
          border
          border-gray-200
          bg-white
          px-3.5
          py-3
          text-sm
          text-gray-900
          outline-none
          transition
          placeholder:text-gray-400
          hover:border-gray-300
          focus:border-gray-950
          focus:ring-4
          focus:ring-gray-100
          sm:text-[15px]
        "
      />
    </label>
  );
};

/* =========================================================
   SELECT
========================================================= */

const Select = ({
  label,
  value,
  onChange,
  options,
}) => {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-gray-800">
        {label}
      </span>

      <select
        value={value}
        onChange={onChange}
        className="
          h-12
          w-full
          rounded-xl
          border
          border-gray-200
          bg-white
          px-3.5
          text-sm
          text-gray-900
          outline-none
          transition
          hover:border-gray-300
          focus:border-gray-950
          focus:ring-4
          focus:ring-gray-100
          sm:text-[15px]
        "
      >
        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};

/* =========================================================
   TOGGLE
========================================================= */

const Toggle = ({
  title,
  description,
  checked,
  onChange,
}) => {
  return (
    <label
      className="
        group
        flex
        w-full
        cursor-pointer
        items-center
        justify-between
        gap-4
        rounded-2xl
        border
        border-gray-200
        bg-white
        p-4
        transition
        hover:border-gray-300
        hover:bg-gray-50
        sm:p-5
      "
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-900">
          {title}
        </span>

        <span className="mt-1 block max-w-2xl text-xs leading-5 text-gray-500 sm:text-sm">
          {description}
        </span>
      </span>

      <span className="relative shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) =>
            onChange(e.target.checked)
          }
          className="peer sr-only"
        />

        <span className="block h-7 w-12 rounded-full bg-gray-200 transition-colors peer-checked:bg-gray-950">
          <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
        </span>
      </span>
    </label>
  );
};

/* =========================================================
   SAVE BUTTON
========================================================= */

const SaveButton = ({
  onClick,
  saving,
}) => {
  return (
    <div className="mt-7 border-t border-gray-100 pt-6">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="
          flex
          min-h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-gray-950
          px-5
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-gray-800
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-50
          sm:w-auto
        "
      >
        {saving ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Saving...
          </>
        ) : (
          <>
            <Icon
              name="save"
              size={17}
            />
            Save Changes
          </>
        )}
      </button>

      <p className="mt-2 text-center text-xs text-gray-400 sm:text-left">
        Changes are saved to your seller account.
      </p>
    </div>
  );
};

/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({
  title,
  value,
  icon = "check",
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500">
        <Icon
          name={icon}
          size={16}
        />
      </div>

      <p className="mt-4 text-xs font-medium text-gray-400">
        {title}
      </p>

      <p className="mt-1 break-words text-xl font-bold tracking-tight text-gray-950">
        {value ?? "—"}
      </p>
    </div>
  );
};

/* =========================================================
   MONEY CARD
========================================================= */

const MoneyCard = ({
  title,
  value,
  highlight = false,
}) => {
  return (
    <div
      className={[
        "min-w-0 rounded-2xl border p-4 sm:p-5",
        highlight
          ? "border-gray-950 bg-gray-950 text-white"
          : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <p
        className={[
          "text-xs font-medium",
          highlight
            ? "text-white/50"
            : "text-gray-400",
        ].join(" ")}
      >
        {title}
      </p>

      <p
        className={[
          "mt-2 break-words text-xl font-bold tracking-tight",
          highlight
            ? "text-white"
            : "text-gray-950",
        ].join(" ")}
      >
        ₹
        {Number(value || 0).toLocaleString(
          "en-IN",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}
      </p>
    </div>
  );
};

/* =========================================================
   STATUS CARD
========================================================= */

const StatusCard = ({
  title,
  value,
}) => {
  const normalized = String(
    value || ""
  ).toLowerCase();

  const positive =
    normalized === "approved" ||
    normalized === "verified" ||
    normalized === "active" ||
    normalized === "no";

  const negative =
    normalized === "rejected" ||
    normalized === "blocked" ||
    normalized === "deleted";

  return (
    <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
      <p className="text-xs font-medium text-gray-400">
        {title}
      </p>

      <div className="mt-4">
        <StatusBadge
          value={value || "—"}
          variant={
            positive
              ? "success"
              : negative
              ? "danger"
              : "warning"
          }
        />
      </div>
    </div>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  value,
  variant = "neutral",
}) => {
  const styles = {
    success:
      "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning:
      "bg-amber-50 text-amber-700 ring-amber-100",
    danger:
      "bg-red-50 text-red-700 ring-red-100",
    neutral:
      "bg-gray-100 text-gray-700 ring-gray-200",
  };

  return (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ring-inset",
        styles[variant],
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      <span className="truncate">
        {value}
      </span>
    </span>
  );
};

/* =========================================================
   STATS GRID
========================================================= */

const StatsGrid = ({
  columns = "3",
  children,
}) => {
  const columnClass =
    columns === "4"
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === "2"
      ? "sm:grid-cols-2"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      className={`grid min-w-0 gap-3 sm:gap-4 ${columnClass}`}
    >
      {children}
    </div>
  );
};

/* =========================================================
   READ ONLY NOTICE
========================================================= */

const ReadOnlyNotice = ({
  title = "Read-only information",
  description = "This information is controlled by Odikart and cannot be modified from seller settings.",
}) => {
  return (
    <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Icon
            name="lock"
            size={16}
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-blue-950">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-blue-700/80 sm:text-sm">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   ALERT
========================================================= */

const Alert = ({
  type,
  message,
  onClose,
}) => {
  const success = type === "success";

  return (
    <div
      className={[
        "flex items-start gap-3 rounded-2xl border p-4 shadow-sm",
        success
          ? "border-emerald-100 bg-emerald-50 text-emerald-800"
          : "border-red-100 bg-red-50 text-red-800",
      ].join(" ")}
      role="alert"
    >
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm",
          success
            ? "text-emerald-600"
            : "text-red-600",
        ].join(" ")}
      >
        <Icon
          name={
            success ? "check" : "alert"
          }
          size={17}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {success
            ? "Success"
            : "Something went wrong"}
        </p>

        <p className="mt-0.5 break-words text-xs leading-5 opacity-80 sm:text-sm">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1.5 text-current/50 hover:bg-white"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

/* =========================================================
   AVATAR
========================================================= */

const Avatar = ({
  name,
  image,
}) => {
  const initials =
    name
      ?.split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

  if (image) {
    return (
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/10 sm:h-20 sm:w-20">
        <img
          src={image}
          alt={name || "Seller"}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white sm:h-20 sm:w-20">
      {initials}
    </div>
  );
};

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export default Settings;