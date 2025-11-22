import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Marketplace from './components/Marketplace';
import MyPurchases from './components/MyPurchases';
import PrivacyPolicy from './components/PrivacyPolicy';
import CookiePolicy from './components/CookiePolicy';
import WalrusTest from './components/WalrusTest';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/my-purchases" element={<MyPurchases />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/walrus-test" element={<WalrusTest />} />
      </Routes>
    </Router>
  );
}

export default App;

