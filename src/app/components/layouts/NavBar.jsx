"use client";

import { useState } from "react";
import "./navbar.css";

import Logo from "./Logo";
import Menu from "./Menu";
import Notifications from "./Notifications";
import CurrentUser from "./CurrentUser";
import AuthButtons from "./AuthButtons";
import { useAuth } from "@/app/context/AuthContext";
import { useUser } from "@/app/context/UserContext";

export default function Navbar() {
  const { currentUser, logout, loading } = useAuth();
  const { user } = useUser();
  const [notificationIndicator] = useState(true);

  if (loading) return null;
  if (!currentUser) {
    return (
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-left">
            <Logo />
            <Menu />
          </div>
          <div className="navbar-right">
            <AuthButtons />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Logo />
          <Menu />
        </div>
        <div className="navbar-right">
          <Notifications notificationIndicator={notificationIndicator} />
          <CurrentUser
            currentUser={currentUser}
            avatar={user?.avatar}
            logout={logout}
          />
        </div>
      </div>
    </nav>
  );
}
