import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@mysten/dapp-kit";
import { Home, Store, ShoppingBag, Menu, X, MessageSquare, Lock } from "lucide-react";
import "./Navbar.css";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: "Home", path: "/home", icon: Home },
  { name: "Chat", path: "/chat", icon: MessageSquare },
  { name: "Vault", path: "/vault", icon: Lock },
  { name: "Marketplace", path: "/marketplace", icon: Store },
  { name: "My Purchases", path: "/my-purchases", icon: ShoppingBag },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">👻</span>
          <span className="navbar-logo-text">GhostContext</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-link ${isActive(item.path) ? "navbar-link-active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Wallet Connect */}
        <div className="navbar-actions">
          <ConnectButton />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar-mobile-menu ${isOpen ? "navbar-mobile-menu-open" : ""}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`navbar-mobile-link ${isActive(item.path) ? "navbar-mobile-link-active" : ""}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <div className="navbar-mobile-wallet">
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
};
