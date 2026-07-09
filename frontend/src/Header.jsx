import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useTheme from "./useTheme";

function Header() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const { theme, changeTheme } = useTheme();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  if (!token) {
    return null;
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <div className="app-header">
      <div className="header-inner">
        <Link className="header-brand" to="/tasks">
          TaskManager
        </Link>

        <nav className="header-links">
          <Link className="nav-link" to="/tasks">
            Home
          </Link>

          <Link className="nav-link" to="/inactive">
            Deleted Tasks
          </Link>
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            title={theme === "light" ? "Dark mode" : "Light mode"}
            onClick={() =>
              changeTheme(theme === "light" ? "dark" : "light")
            }
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 13.1A7.5 7.5 0 0 1 10.9 3a8.8 8.8 0 1 0 10.1 10.1Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4.2V2m0 20v-2.2M4.2 12H2m20 0h-2.2M6.5 6.5 5 5m14 14-1.5-1.5m0-11L19 5M5 19l1.5-1.5" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            )}
          </button>

          <div className="profile-menu">
            <button
              className="profile-button"
              type="button"
              aria-label="Open user profile menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              {userInitial}
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-summary">
                  <div className="profile-avatar">{userInitial}</div>
                  <div>
                    <p className="profile-name">{currentUser?.name || "User"}</p>
                    <p className="profile-role">{currentUser?.role || "User"}</p>
                  </div>
                </div>

                <p className="profile-email">{currentUser?.email}</p>

                <Link className="profile-menu-item" to="/reset" onClick={() => setProfileOpen(false)}>
                  Reset Password
                </Link>

                <button className="profile-menu-item profile-menu-danger" type="button" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
