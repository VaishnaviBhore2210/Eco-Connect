
import './Footer.css';

const Footer = () => {
  return (
    <footer className="eco-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-icon">🌱</span>
            <div>
              <h2>EcoConnect</h2>
              <p>Waste less. Empower more.</p>
            </div>
          </div>

          <p className="footer-description">
            Connecting urban waste generators with rural women's
            cooperatives for a cleaner, greener future.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h3>Quick Links</h3>
            <a href="/">Home</a>
            <a href="/#about">About Us</a>
            <a href="/#how-it-works">How It Works</a>
            <a href="/#contact">Contact</a>
          </div>

          <div className="footer-column">
            <h3>Get Involved</h3>
            <a href="/login">Donate Waste</a>
            <a href="/login">Join as a Cooperative</a>
            <a href="/login">Track Our Impact</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} EcoConnect · Building a
          sustainable tomorrow 🌱
        </p>
      </div>
    </footer>
  );
};

export default Footer;
