import { useState } from "react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

function getNavLinkClass({ isActive }) {
  return [
    "block rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200",
    isActive
      ? "border-amber-300 bg-amber-100 text-amber-900 shadow-sm"
      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

export default function Navbar() {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    setMobileOpen(false);
    navigate("/");
  }

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 font-black text-slate-950">
              B
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-950">
                B HIVE
              </p>

              <p className="hidden text-xs text-slate-500 sm:block">
                Collaborative knowledge
              </p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink
              to="/articles"
              className={getNavLinkClass}
            >
              Explore
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink
                  to="/dashboard"
                  className={getNavLinkClass}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/my-articles"
                  className={getNavLinkClass}
                >
                  My Articles
                </NavLink>

                <NavLink
                  to="/my-contributions"
                  className={getNavLinkClass}
                >
                  Contributions
                </NavLink>
              </>
            )}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">
                  {user?.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Login
                </NavLink>

                <NavLink
                  to="/register"
                  className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                >
                  Join B HIVE
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() =>
              setMobileOpen((open) => !open)
            }
            className="rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-slate-200 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              <NavLink
                to="/articles"
                className={getNavLinkClass}
                onClick={closeMenu}
              >
                Explore
              </NavLink>

              {isAuthenticated && (
                <>
                  <NavLink
                    to="/dashboard"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    Dashboard
                  </NavLink>

                  <NavLink
                    to="/my-articles"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    My Articles
                  </NavLink>

                  <NavLink
                    to="/my-contributions"
                    className={getNavLinkClass}
                    onClick={closeMenu}
                  >
                    Contributions
                  </NavLink>
                </>
              )}
            </nav>

            <div className="mt-4 border-t border-slate-200 pt-4">
              {isAuthenticated ? (
                <>
                  <p className="mb-3 text-sm font-medium text-slate-600">
                    Signed in as{" "}
                    <span className="font-semibold text-slate-900">
                      {user?.name}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <NavLink
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Login
                  </NavLink>

                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-lg bg-amber-400 px-4 py-2 text-center text-sm font-bold text-slate-950 transition hover:bg-amber-300"
                  >
                    Join B HIVE
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}