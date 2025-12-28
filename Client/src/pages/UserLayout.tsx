import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ChatbotWidget from "../components/ChatbotWidget";

const UserLayout = () => {
  const location = useLocation();

  // Hide footer only on home page (same logic you had earlier)
  const hideFooter = location.pathname === "/";

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* User Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}

      {/* Chatbot */}
      <ChatbotWidget />
    </div>
  );
};

export default UserLayout;
