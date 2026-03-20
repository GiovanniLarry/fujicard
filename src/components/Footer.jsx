import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Company Info */}
            <div className="footer-column">
              <h3 className="footer-title">FUJI CARD MARKET</h3>
              <p className="footer-description">
                Your premium destination for trading cards, sealed products, and accessories. 
                We contribute to the collecting hobby by being reliable, delivering quality, 
                and serving unique products.
              </p>
              <div className="trustpilot-footer">
                <div className="tp-stars">
                  <span>★★★★★</span>
                </div>
                <span className="tp-text">Excellent 4.9/5 based on 2,000+ reviews</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-column">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/products?category=pokemon">Pokemon Cards</Link></li>
                <li><Link to="/products?category=yugioh">Yu-Gi-Oh! Cards</Link></li>
                <li><Link to="/products?category=onepiece">One Piece Cards</Link></li>
                <li><Link to="/products?category=newarrivals">New Arrivals</Link></li>
                <li><Link to="/products?category=specialrare">Special & Rare</Link></li>
                <li><Link to="/products?category=promo">Promo Cards</Link></li>
              </ul>
            </div>

            {/* Products */}
            <div className="footer-column">
              <h4 className="footer-heading">Products</h4>
              <ul className="footer-links">
                <li><Link to="/products?category=sealed">Sealed Products</Link></li>
                <li><Link to="/products?category=accessories">Accessories</Link></li>
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products?featured=true">Featured Items</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="footer-column">
              <h4 className="footer-heading">Customer Service</h4>
              <ul className="footer-links">
                <li><Link to="/account">My Account</Link></li>
                <li><Link to="/cart">Shopping Cart</Link></li>
                <li><Link to="/checkout">Checkout</Link></li>
                <li><a href="#shipping">Shipping Info</a></li>
                <li><a href="#returns">Returns Policy</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div className="footer-column">
              <h4 className="footer-heading">Stay Connected</h4>
              <p className="footer-contact-text">Subscribe to get exclusive deals and updates!</p>
              <div className="social-links">
                <a href="#facebook" className="social-icon" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href="#twitter" className="social-icon" aria-label="Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="#instagram" className="social-icon" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">&copy; 2026 Fuji Card Market. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
