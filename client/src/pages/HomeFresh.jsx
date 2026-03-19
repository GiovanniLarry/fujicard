import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

const API_URL = `http://${window.location.hostname}:5000/api`;

const HomeFresh = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      console.log('🔄 FRESH: Fetching home page data...');
      
      // Fetch categories
      const categoriesResponse = await axios.get(`${API_URL}/categories`);
      console.log('✅ FRESH: Categories response:', categoriesResponse.data);
      
      // Fetch featured products
      const productsResponse = await axios.get(`${API_URL}/products`, { 
        params: { featured: 'true', limit: 8 } 
      });
      console.log('✅ FRESH: Featured products response:', productsResponse.data);
      
      if (categoriesResponse.data && categoriesResponse.data.categories) {
        console.log('📦 FRESH: Setting categories:', categoriesResponse.data.categories.length, 'categories');
        setCategories(categoriesResponse.data.categories);
      } else {
        console.log('❌ FRESH: No categories data in response');
        setCategories([]);
      }
      
      if (productsResponse.data && productsResponse.data.products) {
        setFeaturedProducts(productsResponse.data.products);
      } else {
        setFeaturedProducts([]);
      }
      
    } catch (error) {
      console.error('❌ FRESH: Failed to fetch data:', error);
      console.error('❌ FRESH: Error details:', error.response?.data || error.message);
      // Set empty arrays to prevent undefined errors
      setFeaturedProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 FRESH: Home useEffect triggered');
    fetchData();
  }, []);

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
            <div className="hero-badge">✅ FRESH VERSION - Cache Cleared</div>
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
          <h2 className="section-title">🎯 Shop by Category</h2>
          {loading ? (
            <div className="loading">🔄 Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="no-categories">
              <p>❌ No categories available</p>
              <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                Debug: Categories array is empty. Check console for API errors.
              </p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map(category => {
                console.log('🎨 FRESH: Rendering category:', category);
                return (
                  <Link 
                    key={category.id} 
                    to={`/products?category=${category.id}`}
                    className="category-card"
                    onClick={() => console.log('🔗 FRESH: Category clicked:', category.name, 'ID:', category.id)}
                  >
                    <div className="category-image">
                      <img 
                        src={category.image || category.image_url} 
                        alt={category.name} 
                        onError={(e) => {
                          console.log('🖼️ FRESH: Image failed to load for category:', category.name);
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
            <h2 className="section-title">⭐ Featured Products</h2>
            <Link to="/products?featured=true" className="view-all">View All</Link>
          </div>
          {loading ? (
            <div className="loading">🔄 Loading products...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomeFresh;
