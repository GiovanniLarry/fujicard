import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productsAPI, { categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('Home component rendered');

  const fetchData = async () => {
    try {
      console.log('Fetching home page data...');
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ featured: 'true', limit: 8 }),
        categoriesAPI.getAll()
      ]);
      console.log('Featured products response:', productsRes.data);
      console.log('Categories response:', categoriesRes.data);
      
      if (categoriesRes.data && categoriesRes.data.categories) {
        console.log('Setting categories:', categoriesRes.data.categories.length, 'categories');
        setCategories(categoriesRes.data.categories);
      } else {
        console.log('No categories data in response');
        setCategories([]);
      }
      
      setFeaturedProducts(productsRes.data.products);
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

  useEffect(() => {
    console.log('Home useEffect triggered');
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Home component state:', { 
      loading, 
      categoriesCount: categories.length, 
      productsCount: featuredProducts.length 
    });
  }, [loading, categories.length, featuredProducts.length]);

  useEffect(() => {
    console.log('Home useEffect triggered');
    
    // Test API connectivity first
    fetch('http://localhost:5000/api/categories')
      .then(response => {
        console.log('API test response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('API test data:', data);
      })
      .catch(error => {
        console.error('API test error:', error);
      });
    
    fetchData();
  }, []);

  console.log('Home component state:', { 
    loading, 
    categoriesCount: categories.length, 
    productsCount: featuredProducts.length 
  });

  const testimonials = [
    {
      name: "James K.",
      location: "London, UK",
      rating: 5,
      text: "Absolutely fantastic service! My Japanese Pokemon cards arrived in perfect condition. Will definitely order again!",
      date: "2 days ago"
    },
    {
      name: "Sarah M.",
      location: "Manchester, UK",
      rating: 5,
      text: "Best place to buy authentic Japanese cards. The packaging was incredible and shipping was super fast.",
      date: "1 week ago"
    },
    {
      name: "Tom R.",
      location: "Birmingham, UK",
      rating: 5,
      text: "Found rare One Piece cards I couldn't find anywhere else. Great prices and excellent customer service!",
      date: "2 weeks ago"
    },
    {
      name: "Emily L.",
      location: "Edinburgh, UK",
      rating: 5,
      text: "The Yu-Gi-Oh cards were exactly as described. Trusted shop buyer protection gave me peace of mind.",
      date: "3 weeks ago"
    }
  ];

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
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Buyer Protection</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          {loading ? (
            <div className="loading">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="no-categories">
              <p>No categories available</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                Debug: Categories array is empty. Check console for API errors.
              </p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map(category => {
                console.log('Rendering category:', category);
                return (
                  <Link 
                    key={category.id} 
                    to={`/products?category=${category.id}`}
                    className="category-card"
                    onClick={() => console.log('Category clicked:', category.name, 'ID:', category.id)}
                  >
                    <div className="category-image">
                      <img 
                        src={category.image || category.image_url} 
                        alt={category.name} 
                        onError={(e) => {
                          console.log('Image failed to load for category:', category.name);
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/200x200?text=${encodeURIComponent(category.name)}`;
                        }} 
                      />
                    </div>
                    <div className="category-info">
                      <h3>{category.name}</h3>
                      <span>{category.productCount || 0} Products</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

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
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
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
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
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
              <p>We bring you quality products. This means 99.99%* sealed and official Japanese products only. *We check to ensure that our products are genuine, but there is a slight possibility of an oversight on our part. If there is any issue with the box, please let us know.</p>
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
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{testimonial.name.charAt(0)}</div>
                  <div className="author-info">
                    <span className="author-name">{testimonial.name}</span>
                    <span className="author-location">{testimonial.location}</span>
                  </div>
                  <span className="testimonial-date">{testimonial.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
