import { Link } from "react-router";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-gray-900"
          >
            <span className="text-blue-600">Odi</span>
            <span className="text-purple-600">kart</span>
          </Link>

          <Link
            to="/"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        {/* Page heading */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.7}
              stroke="currentColor"
              className="h-7 w-7 text-purple-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-gray-500">
            Your privacy is important to us. This Privacy Policy explains how
            Odikart collects, uses, protects, and handles your information.
          </p>

          <p className="mt-3 text-sm text-gray-400">
            Last updated: August 22, 2026
          </p>
        </div>

        {/* Content */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-blue-500/5">
          <div className="p-6 sm:p-10 lg:p-12">
            <PolicySection title="1. Introduction">
              <p>
                Welcome to Odikart Seller. This Privacy Policy explains how
                Odikart ("we", "us", or "our") collects, uses, stores, and
                protects information when you use the Odikart Seller
                application and related services.
              </p>

              <p>
                By using Odikart Seller, you agree to the practices described
                in this Privacy Policy.
              </p>
            </PolicySection>

            <PolicySection title="2. Information We Collect">
              <p>
                When you use Odikart Seller, we may collect information
                necessary to provide and improve our services.
              </p>

              <h3 className="mt-5 font-semibold text-gray-900">
                Account Information
              </h3>

              <ul>
                <li>Seller name and business name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Business address</li>
                <li>Account login information</li>
              </ul>

              <h3 className="mt-5 font-semibold text-gray-900">
                Business Information
              </h3>

              <ul>
                <li>Store information</li>
                <li>Product information</li>
                <li>Product prices and inventory</li>
                <li>Order and transaction information</li>
              </ul>

              <h3 className="mt-5 font-semibold text-gray-900">
                Device Information
              </h3>

              <p>
                We may collect basic technical information such as device
                type, operating system, application version, IP address, and
                diagnostic information.
              </p>
            </PolicySection>

            <PolicySection title="3. How We Use Your Information">
              <p>We may use collected information to:</p>

              <ul>
                <li>Create and manage your seller account</li>
                <li>Process and manage orders</li>
                <li>Manage products and inventory</li>
                <li>Provide customer and seller support</li>
                <li>Improve application performance</li>
                <li>Detect fraud, abuse, and security issues</li>
                <li>Send important service notifications</li>
                <li>Comply with applicable legal requirements</li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Payment Information">
              <p>
                If payments are processed through third-party payment
                providers, payment information may be handled directly by
                those providers.
              </p>

              <p>
                Odikart does not store complete payment card information unless
                explicitly stated otherwise and required for the service.
              </p>
            </PolicySection>

            <PolicySection title="5. Information Sharing">
              <p>
                We do not sell your personal information. We may share
                information with trusted service providers when necessary to
                operate our platform, process transactions, provide hosting,
                analytics, security, or customer support.
              </p>

              <p>
                We may also disclose information when required by applicable
                law, regulation, legal process, or to protect the rights and
                safety of Odikart, sellers, customers, or others.
              </p>
            </PolicySection>

            <PolicySection title="6. Data Security">
              <p>
                We use reasonable technical and organizational measures to
                protect your information against unauthorized access,
                alteration, disclosure, or destruction.
              </p>

              <p>
                However, no method of electronic transmission or storage is
                completely secure, and we cannot guarantee absolute security.
              </p>
            </PolicySection>

            <PolicySection title="7. Data Retention">
              <p>
                We retain information only for as long as reasonably necessary
                to provide our services, maintain business records, resolve
                disputes, prevent fraud, and comply with legal obligations.
              </p>
            </PolicySection>

            <PolicySection title="8. Your Rights">
              <p>
                Depending on applicable laws, you may have rights to access,
                correct, update, or delete certain personal information.
              </p>

              <p>
                You may contact us if you want to request access to or deletion
                of your information.
              </p>
            </PolicySection>

            <PolicySection title="9. Account Deletion">
              <p>
                You may request deletion of your Odikart Seller account and
                associated personal information by contacting our support team.
              </p>

              <p>
                Some information may need to be retained where required by
                law, accounting requirements, fraud prevention, or legitimate
                business purposes.
              </p>
            </PolicySection>

            <PolicySection title="10. Children's Privacy">
              <p>
                Odikart Seller is intended for business users and is not
                directed toward children. We do not knowingly collect personal
                information from children.
              </p>
            </PolicySection>

            <PolicySection title="11. Third-Party Services">
              <p>
                Our services may use third-party providers for hosting,
                analytics, authentication, payments, notifications, or other
                platform functionality.
              </p>

              <p>
                These providers may process information according to their own
                privacy policies and applicable laws.
              </p>
            </PolicySection>

            <PolicySection title="12. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. When
                changes are made, we will update the "Last updated" date on
                this page.
              </p>
            </PolicySection>

            <PolicySection title="13. Contact Us">
              <p>
                If you have questions about this Privacy Policy or how your
                information is handled, please contact Odikart support.
              </p>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-5">
                <p className="font-semibold text-gray-900">
                  Odikart Support
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Email: support@odikart.com
                </p>
              </div>
            </PolicySection>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-purple-600"
          >
            <span>←</span>
            Back to Odikart
          </Link>
        </div>
      </main>
    </div>
  );
}

function PolicySection({ title, children }) {
  return (
    <section className="border-b border-gray-100 py-8 first:pt-0 last:border-b-0">
      <h2 className="text-xl font-bold tracking-tight text-gray-900">
        {title}
      </h2>

      <div className="mt-4 space-y-4 text-sm leading-7 text-gray-600 sm:text-base">
        {children}
      </div>

      <style>{`
        ul {
          list-style: disc;
          padding-left: 1.5rem;
        }

        li {
          margin-top: 0.5rem;
        }
      `}</style>
    </section>
  );
}