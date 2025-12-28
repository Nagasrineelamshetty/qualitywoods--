import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";

const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-amber-50 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center">
              <span className="text-3xl font-bold text-amber-1000">
                QUALITY WOODS
              </span>
            </Link>
          </div>

          {/* Desktop Admin Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/admin"
              className="flex items-center gap-2 text-amber-900 px-3 py-2 text-base font-medium hover:text-amber-900"
            >              
              Dashboard
            </Link>

            <Link
              to="/admin/products"
              className="flex items-center gap-2 text-amber-900 px-3 py-2 text-base font-medium hover:text-amber-900"
            >
              Products
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center gap-2 text-amber-900 px-3 py-2 text-base font-medium hover:text-amber-900"
            >              
              Orders
            </Link>

            <Link
              to="/admin/consultations"
              className="flex items-center gap-2 text-amber-900 px-3 py-2 text-base font-medium hover:text-amber-900"
            >
              Consultations
            </Link>

            {/* Admin Info */}
            {user && (
              <span className="text-amber-900 text-sm font-medium">
                Hi, {user.name} <span className="text-amber-700">(Admin)</span>
              </span>
            )}

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-amber-700 hover:text-amber-900"
            >
              <LogOut size={18} />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-amber-700 hover:text-amber-900 p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Admin Navigation */}
      {isOpen && (
        <div className="md:hidden bg-amber-50 border-t border-amber-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/admin"
              className="block px-3 py-2 text-base text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/products"
              className="block px-3 py-2 text-base text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md"
            >
              Products
            </Link>

            <Link
              to="/admin/orders"
              className="block px-3 py-2 text-base text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md"
            >
              Orders
            </Link>

            <Link
              to="/admin/consultations"
              className="block px-3 py-2 text-base text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md"
            >
              Consultations
            </Link>


            {/* Admin Info */}
            {user && (
              <div className="px-3 py-2 text-sm text-amber-900 font-medium">
                Hi, {user.name} <span className="text-amber-700">(Admin)</span>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-base text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
