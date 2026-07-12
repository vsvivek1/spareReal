"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "firebase/auth";

import { auth } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/ground", label: "Browse" },
  { href: "/my-listings", label: "My Listings" },
  { href: "/my-requests", label: "My Requests" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
  { href: "/user/profile", label: "Profile" },
];

// Sell and Request are the two core actions of the marketplace, so
// they get dedicated, always-visible treatment instead of being just
// another link in the scrollable nav — twin FABs on the mobile tab
// bar, twin buttons pinned in the desktop header.
const primaryActions = [
  {
    href: "/add-spare",
    label: "Sell",
    icon: <path d="M12 5v14M5 12h14" />,
  },
  {
    href: "/make-request",
    label: "Request",
    icon: (
      <>
        <path d="M3 10v4a1 1 0 0 0 1 1h2l4 4V5L6 9H4a1 1 0 0 0-1 1Z" />
        <path d="M15 8a4 4 0 0 1 0 8" />
        <path d="M18 5a8 8 0 0 1 0 14" />
      </>
    ),
  },
];

const tabs = [
  {
    href: "/",
    label: "Home",
    fab: false,
    icon: (
      <path d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    ),
  },
  {
    href: "/ground",
    label: "Browse",
    fab: false,
    icon: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m20 20-3.8-3.8" />
      </>
    ),
  },
  { ...primaryActions[0], fab: true },
  { ...primaryActions[1], fab: true },
];

function TabIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

// Full-screen auth flows: user may already be phone-verified here (so
// useAuth().user is truthy) but hasn't finished onboarding yet, so the
// full app shell (bottom tab bar, drawer of interior links) must not
// render — it has nowhere valid to navigate to and can visually
// collide with the page's own submit button on small screens.
const AUTH_FLOW_ROUTES = ["/login", "/forgot-password", "/user/register"];

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthFlow = AUTH_FLOW_ROUTES.includes(pathname ?? "");
  const showAppShell = Boolean(user) && !isAuthFlow;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("gx-has-tabbar", showAppShell);
  }, [showAppShell]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <>
      <header className="gx-topbar">
        <Link href="/" className="gx-brand">
          <span className="gx-brand-badge">S</span>
          spareX
        </Link>

        {showAppShell && (
          <>
            <nav className="gx-nav-desktop">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    "gx-navlink" +
                    (isActive(link.href) ? " gx-navlink-active" : "")
                  }
                >
                  {link.label}
                </Link>
              ))}

              <button
                type="button"
                className="gx-navlink gx-navlink-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </nav>

            <div className="gx-primary-actions">
              <Link
                href="/add-spare"
                className="gx-primary-btn gx-primary-btn-sell"
              >
                <TabIcon>{primaryActions[0].icon}</TabIcon>
                Sell
              </Link>

              <Link
                href="/make-request"
                className="gx-primary-btn gx-primary-btn-request"
              >
                <TabIcon>{primaryActions[1].icon}</TabIcon>
                Request
              </Link>
            </div>

            <button
              type="button"
              className="gx-nav-toggle"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <TabIcon>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </TabIcon>
            </button>
          </>
        )}

        {!showAppShell && !user && (
          <>
            <nav className="gx-public-nav">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    "gx-navlink" +
                    (isActive(link.href) ? " gx-navlink-active" : "")
                  }
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="gx-public-actions">
              <Link href="/login" className="gx-btn-ghost">
                Login
              </Link>

              <Link href="/login" className="gx-signup-pill">
                Sign up
              </Link>
            </div>
          </>
        )}
      </header>

      {showAppShell && menuOpen && (
        <>
          <div
            className="gx-drawer-backdrop"
            onClick={() => setMenuOpen(false)}
          />

          <div className="gx-drawer">
            <div className="gx-drawer-head">
              <span className="gx-brand">
                <span className="gx-brand-badge">S</span>
                spareX
              </span>

              <button
                type="button"
                className="gx-drawer-close"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <TabIcon>
                  <path d="M6 6l12 12M18 6 6 18" />
                </TabIcon>
              </button>
            </div>

            <div className="gx-drawer-actions">
              <Link
                href="/add-spare"
                className="gx-primary-btn gx-primary-btn-sell"
              >
                <TabIcon>{primaryActions[0].icon}</TabIcon>
                Sell a spare
              </Link>

              <Link
                href="/make-request"
                className="gx-primary-btn gx-primary-btn-request"
              >
                <TabIcon>{primaryActions[1].icon}</TabIcon>
                Request a spare
              </Link>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "gx-drawer-link" +
                  (isActive(link.href) ? " gx-drawer-link-active" : "")
                }
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              className="gx-drawer-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </>
      )}

      {showAppShell && (
        <nav className="gx-tabbar">
          {tabs.map((tab) =>
            tab.fab ? (
              <Link
                key={tab.href}
                href={tab.href}
                className="gx-tab-item gx-tab-item-fab"
              >
                <span
                  className={
                    "gx-tab-fab-circle" +
                    (tab.label === "Request" ? " gx-tab-fab-circle-alt" : "")
                  }
                >
                  <TabIcon>{tab.icon}</TabIcon>
                </span>
                {tab.label}
              </Link>
            ) : (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  "gx-tab-item" +
                  (isActive(tab.href) ? " gx-tab-item-active" : "")
                }
              >
                <TabIcon>{tab.icon}</TabIcon>
                {tab.label}
              </Link>
            )
          )}

          <button
            type="button"
            className="gx-tab-item"
            onClick={() => setMenuOpen(true)}
          >
            <TabIcon>
              <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
              <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
            </TabIcon>
            More
          </button>
        </nav>
      )}
    </>
  );
}
