import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import PriceRange from '../components/PriceRange';
import './Products.css';

const API_URL = window.location.hostname === 'localhost' 
  ? `http://${window.location.hostname}:5000/api` 
  : `http://${window.location.hostname}:5000/api`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  console.log('Products component - category:', category, 'search:', search);

  // Memoize functions to prevent re-renders
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams.entries());
      console.log('Fetching products with params:', params);
      const response = await axios.get(`${API_URL}/products`, { params });
      console.log('Products API response:', response.data);
      setProducts(response.data.products || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Failed to fetch products:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Show error message to user
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/products/filters/options`, { 
        params: { category } 
      });
      setFilterOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
    fetchFilterOptions();
  }, [fetchProducts, fetchFilterOptions]); // Use memoized functions as dependencies

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) delete newFilters[key];
    setFilters(newFilters);
    
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePriceRangeChange = (range) => {
    const newParams = new URLSearchParams(searchParams);
    if (range.min > 0) {
      newParams.set('minPrice', range.min.toString());
    } else {
      newParams.delete('minPrice');
    }
    if (range.max < 1000000) {
      newParams.set('maxPrice', range.max.toString());
    } else {
      newParams.delete('maxPrice');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSortChange = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('sort', value);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    if (category) newParams.set('category', category);
    if (search) newParams.set('search', search);
    setSearchParams(newParams);
    setFilters({});
  };

  const getCategoryTitle = () => {
    const titles = {
      pokemon: 'Pokemon Cards',
      yugioh: 'Yu-Gi-Oh! Cards',
      onepiece: 'One Piece Cards',
      newarrivals: 'New Arrivals',
      specialrare: 'Special & Rare Cards',
      promo: 'Promo Cards',
      sealed: 'Sealed Products',
      accessories: 'Accessories'
    };
    return titles[category] || 'All Products';
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <div className="header-left">
            <h1>{search ? `Search: "${search}"` : getCategoryTitle()}</h1>
            <span className="product-count">{pagination.totalProducts || 0} products</span>
          </div>
          <div className="header-right">
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="4" y1="18" x2="4" y2="18"></line>
                <line x1="18" y1="21" x2="12" y2="21"></line>
              </svg>
              <span className="filter-text">Filters</span>
            </button>
            <button 
              className="mobile-close-btn"
              onClick={() => setShowFilters(false)}
              aria-label="Close filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="6"></line>
                <line x1="18" y1="18" x2="6" y2="18"></line>
              </svg>
            </button>
            <select 
              className="sort-select"
              value={searchParams.get('sort') || ''}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="">Sort by</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="clear-filters" onClick={clearFilters}>
                Clear All
              </button>
              <button 
                className="filter-close-btn"
                onClick={() => setShowFilters(false)}
                aria-label="Close filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="6"></line>
                  <line x1="18" y1="18" x2="6" y2="18"></line>
                </svg>
              </button>
            </div>

            {filterOptions.categories?.length > 0 && (
              <div className="filter-group">
                <h4>Category</h4>
                <select 
                  value={searchParams.get('category') || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            )}

            {filterOptions.rarities?.length > 0 && (
              <div className="filter-group">
                <h4>Rarity</h4>
                <select 
                  value={searchParams.get('rarity') || ''}
                  onChange={(e) => handleFilterChange('rarity', e.target.value)}
                >
                  <option value="">All Rarities</option>
                  {filterOptions.rarities.map(rarity => (
                    <option key={rarity} value={rarity}>{rarity}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="filter-group">
              <h4>Price Range</h4>
              <PriceRange 
                onFilterChange={handlePriceRangeChange}
                maxPrice={1000000}
              />
            </div>
          </aside>

          <main className="products-main">
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  Debug: Check browser console for API errors
                </p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      disabled={pagination.currentPage === 1}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                    >
                      Previous
                    </button>
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <button 
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
