import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import AnnouncementSlider from '../components/AnnouncementSlider';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    console.log('Home useEffect triggered');
    fetchData();

    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching home page data...');

      // Fetch categories
      const categoriesResponse = await axios.get(`${API_URL}/categories`);
      console.log('Categories response:', categoriesResponse.data);

      // Fetch featured products - show more on mobile, limited on desktop
      const limit = isMobile ? 12 : 8;
      const productsResponse = await axios.get(`${API_URL}/products`, {
        params: { featured: 'true', limit }
      });
      console.log('Featured products response:', productsResponse.data);

      if (categoriesResponse.data && categoriesResponse.data.categories) {
        console.log('Setting categories:', categoriesResponse.data.categories.length, 'categories');
        setCategories(categoriesResponse.data.categories);
      } else {
        console.log('No categories data in response');
        setCategories([]);
      }

      if (productsResponse.data && productsResponse.data.products) {
        setFeaturedProducts(productsResponse.data.products);
      } else {
        setFeaturedProducts([]);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set empty arrays to prevent undefined errors
      setFeaturedProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowMoreFeatured = async () => {
    try {
      setLoading(true);
      const limit = isMobile ? 20 : 16; // Show more when "View More" is clicked
      const productsResponse = await axios.get(`${API_URL}/products`, {
        params: { featured: 'true', limit }
      });

      if (productsResponse.data && productsResponse.data.products) {
        setFeaturedProducts(productsResponse.data.products);
        setShowAllFeatured(true);
      }
    } catch (error) {
      console.error('Failed to fetch more featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayProducts = showAllFeatured ? featuredProducts : featuredProducts.slice(0, isMobile ? 6 : 4);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-animation">
          <div className="floating-card card-1"></div>
          <div className="floating-card card-2"></div>
          <div className="floating-card card-3"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">Trusted by 10,000+ Collectors</div>
            <h1>Your Premier Japanese Trading Card Destination</h1>
            <p>Discover authentic Pokemon, Yu-Gi-Oh!, One Piece cards and more. 99.99% sealed official Japanese products with buyer protection.</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary">Shop Now</Link>
              <Link to="/products?featured=true" className="btn btn-outline">Featured Cards</Link>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <span className="trust-stars">★★★★★</span>
                <span>Excellent on Trustpilot</span>
              </div>
              <div className="trust-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Buyer Protection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Announcement Slider */}
      <AnnouncementSlider />

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/products?featured=true" className="view-all">View All</Link>
          </div>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <>
              <div className="products-grid">
                {displayProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Show View More button on mobile if there are more products */}
              {isMobile && !showAllFeatured && featuredProducts.length > (isMobile ? 6 : 4) && (
                <div className="view-more-container">
                  <button
                    className="btn btn-outline view-more-btn"
                    onClick={handleShowMoreFeatured}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'View More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
              </div>
              <h3>Free UK Shipping</h3>
              <p>Free delivery on orders over £50</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3>Authentic Cards</h3>
              <p>100% genuine products guaranteed</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3>Expert Support</h3>
              <p>Dedicated customer service team</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
              </div>
              <h3>Easy Returns</h3>
              <p>30-day hassle-free returns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">We Contribute to Our Beautiful Collecting Hobby By:</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-check">✅</div>
              <h3>Being Reliable</h3>
              <p>We bring reliability to the next level. With our cooperation with Trusted Shops, your purchase is safeguarded by comprehensive buyer protection. Shop with confidence knowing your investment is secure.</p>
            </div>
            <div className="value-card">
              <div className="value-check">✅</div>
              <h3>Delivering Quality</h3>
              <p>We bring you quality products. This means 99.99%* sealed and official Japanese products only. *We check to ensure that our products are genuine, but there is a slight possibility of an oversight on our part. If there is any issue with box, please let us know.</p>
            </div>
            <div className="value-card">
              <div className="value-check">✅</div>
              <h3>Serving Unique & Exclusive Products</h3>
              <p>We can bring you all (exclusive) Japanese trading cards or related products that you want. So if you are looking for specific cards / products we are happy to assist you with this.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Customers Say</h2>
          <div className="trustpilot-header">
            <span className="tp-excellent">Excellent</span>
            <div className="tp-stars-large">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <span className="tp-based">Based on 500+ reviews</span>
            <span className="tp-logo">★ Trustpilot</span>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-header">
                  <div className="customer-info">
                    <h4>James K.</h4>
                    <div className="rating-location">
                      <div className="rating">★★★★★</div>
                      <div className="location-date">
                        <span className="location">London, UK</span>
                        <span className="date">2 days ago</span>
                      </div>
                    </div>
                  </div>
                  <p className="testimonial-text">Absolutely fantastic service! My Japanese Pokemon cards arrived in perfect condition. Will definitely order again!</p>
                </div>
              </div>
              <div className="testimonial-image">
                <img src="https://via.placeholder.com/60x60?text=Pokemon" alt="Pokemon cards" />
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-header">
                  <div className="customer-info">
                    <h4>Sarah M.</h4>
                    <div className="rating-location">
                      <div className="rating">★★★★★</div>
                      <div className="location-date">
                        <span className="location">Manchester, UK</span>
                        <span className="date">1 week ago</span>
                      </div>
                    </div>
                  </div>
                  <p className="testimonial-text">Best place to buy authentic Japanese cards. The packaging was incredible and shipping was super fast.</p>
                </div>
              </div>
              <div className="testimonial-image">
                <img src="https://via.placeholder.com/60x60?text=Yu-Gi-Oh" alt="Yu-Gi-Oh cards" />
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-header">
                  <div className="customer-info">
                    <h4>Tom R.</h4>
                    <div className="rating-location">
                      <div className="rating">★★★★★</div>
                      <div className="location-date">
                        <span className="location">Birmingham, UK</span>
                        <span className="date">2 weeks ago</span>
                      </div>
                    </div>
                  </div>
                  <p className="testimonial-text">Found rare One Piece cards I couldn't find anywhere else. Great prices and excellent customer service!</p>
                </div>
              </div>
              <div className="testimonial-image">
                <img src="https://via.placeholder.com/60x60?text=One Piece" alt="One Piece cards" />
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-header">
                  <div className="customer-info">
                    <h4>Emily L.</h4>
                    <div className="rating-location">
                      <div className="rating">★★★★★</div>
                      <div className="location-date">
                        <span className="location">Edinburgh, UK</span>
                        <span className="date">3 weeks ago</span>
                      </div>
                    </div>
                  </div>
                  <p className="testimonial-text">The Yu-Gi-Oh cards were exactly as described. Trusted shop buyer protection gave me peace of mind.</p>
                </div>
              </div>
              <div className="testimonial-image">
                <img src="https://via.placeholder.com/60x60?text=Yu-Gi-Oh" alt="Yu-Gi-Oh cards" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
