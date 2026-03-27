import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, BookOpenCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = user
    ? user.role === "teacher"
      ? [{ to: "/teacher", label: "Dashboard" }]
      : [
          { to: "/courses", label: "Courses" },
          { to: "/register", label: "Register" },
        ]
    : [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? (user.role === "teacher" ? "/teacher" : "/courses") : "/"} className="flex items-center gap-2 font-bold text-lg text-white">
          <GraduationCap className="w-6 h-6 text-primary-500" />
          <span>SCR Portal</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === link.to
                  ? "bg-primary-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-3 ml-3 pl-3 border-l border-slate-700">
              {/* Role badge */}
              <div className="flex items-center gap-1.5 text-sm">
                {user.role === "teacher" ? (
                  <BookOpenCheck className="w-4 h-4 text-violet-400" />
                ) : (
                  <GraduationCap className="w-4 h-4 text-primary-400" />
                )}
                <span className="text-slate-300 hidden sm:block">{user.name || user.username}</span>
              </div>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors text-sm"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 btn-primary text-sm px-4 py-1.5"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
