import { useNavigate } from "react-router-dom";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Home, Store, ShoppingBag, Lock, Bot, DollarSign, Cloud, ArrowRight, Sparkles } from "lucide-react";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();

  return (
    <div className="landing-container">
      {/* Modern Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-logo">
            <span className="landing-logo-icon">👻</span>
            <span className="landing-logo-text">GhostContext</span>
          </div>
          
          <div className="landing-nav-links">
            <button onClick={() => navigate("/home")} className="landing-nav-link">
              <Home size={18} />
              <span>Home</span>
            </button>
            <button onClick={() => navigate("/marketplace")} className="landing-nav-link">
              <Store size={18} />
              <span>Marketplace</span>
            </button>
            <button onClick={() => navigate("/my-purchases")} className="landing-nav-link">
              <ShoppingBag size={18} />
              <span>Purchases</span>
            </button>
          </div>

          <div className="landing-nav-actions">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="landing-hero-container">
          <div className="landing-hero-badge">
            <Sparkles size={16} />
            <span>Powered by Sui & Walrus</span>
          </div>
          
          <h1 className="landing-hero-title">
            Decentralized Marketplace for
            <span className="landing-hero-gradient"> Encrypted AI Knowledge</span>
          </h1>
          
          <p className="landing-hero-subtitle">
            Upload, encrypt, and monetize your documents with blockchain-powered access control. 
            Buy and chat with encrypted knowledge contexts using local AI.
          </p>

          <div className="landing-hero-actions">
            {currentAccount ? (
              <>
                <button 
                  className="landing-btn-primary"
                  onClick={() => navigate("/home")}
                >
                  <span>Start Creating</span>
                  <ArrowRight size={20} />
                </button>
                <button 
                  className="landing-btn-secondary"
                  onClick={() => navigate("/marketplace")}
                >
                  Browse Marketplace
                </button>
              </>
            ) : (
              <div className="landing-connect-prompt">
                <p className="landing-connect-text">Connect your wallet to get started</p>
                <ConnectButton />
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="landing-features">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <Lock size={24} />
              </div>
              <h3 className="landing-feature-title">Encrypted Storage</h3>
              <p className="landing-feature-text">
                AES-256-GCM encryption with keys stored securely on-chain
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <Bot size={24} />
              </div>
              <h3 className="landing-feature-title">AI-Powered Chat</h3>
              <p className="landing-feature-text">
                Chat with your documents using local AI models
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <DollarSign size={24} />
              </div>
              <h3 className="landing-feature-title">Monetize Knowledge</h3>
              <p className="landing-feature-text">
                Sell access to your encrypted content as NFTs
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <Cloud size={24} />
              </div>
              <h3 className="landing-feature-title">Decentralized</h3>
              <p className="landing-feature-text">
                Built on Sui blockchain and Walrus storage
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-content">
            <div className="landing-footer-section">
              <div className="landing-footer-logo">
                <span className="landing-logo-icon">👻</span>
                <span className="landing-logo-text">GhostContext</span>
              </div>
              <p className="landing-footer-description">
                Decentralized encrypted knowledge marketplace powered by blockchain technology
              </p>
            </div>
            
            <div className="landing-footer-section">
              <h4 className="landing-footer-heading">Quick Links</h4>
              <button onClick={() => navigate("/home")} className="landing-footer-link">
                Home
              </button>
              <button onClick={() => navigate("/marketplace")} className="landing-footer-link">
                Marketplace
              </button>
              <button onClick={() => navigate("/my-purchases")} className="landing-footer-link">
                My Purchases
              </button>
            </div>

            <div className="landing-footer-section">
              <h4 className="landing-footer-heading">Technology</h4>
              <a 
                href="https://sui.io" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="landing-footer-link"
              >
                Sui Blockchain
              </a>
              <a 
                href="https://walrus.site" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="landing-footer-link"
              >
                Walrus Storage
              </a>
            </div>
          </div>
          
          <div className="landing-footer-bottom">
            <p>© 2024 GhostContext. Built with ❤️ on Sui</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
