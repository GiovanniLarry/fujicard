import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { ordersAPI } from '../services/api';
import './Checkout.css';
import './CheckoutPayment.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, refreshCart, clearCart } = useCart();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { formatPrice, convertPrice, getSymbol, currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [formData, setFormData] = useState({
    paymentMethod: 'wise',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const cancelOrderId = searchParams.get('order_id');
  const cancelStatus = searchParams.get('cancel');

  // Handle cancelled payments
  useEffect(() => {
    if (cancelStatus === 'true' && cancelOrderId) {
      const restoreCart = async () => {
        try {
          await ordersAPI.restoreCart(cancelOrderId);
          await refreshCart();
          alert('Payment was cancelled. Your items have been safely restored to your cart.');
          navigate('/cart', { replace: true });
        } catch (e) {
          console.error('Failed to restore cart:', e);
        }
      };
      restoreCart();
    }
  }, [cancelStatus, cancelOrderId, navigate, refreshCart]);

  const getPaymentIcon = (iconType) => {
    switch (iconType) {
      case 'card':
        return (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <img src="https://cdn.simpleicons.org/visa/1434CB" alt="Visa" style={{ height: '18px' }} />
            <img src="https://cdn.simpleicons.org/mastercard/EB001B" alt="Mastercard" style={{ height: '18px' }} />
          </div>
        );
      case 'payfast':
        return (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <img src="https://cdn.simpleicons.org/payfast/E12228" alt="PayFast" style={{ height: '22px' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/2628/2628206.png"; }} />
          </div>
        );
      case 'paystack':
        return (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Paystack_Logo.png" alt="Paystack" style={{ height: '18px', filter: 'brightness(1.5)' }} />
          </div>
        );
      case 'crypto':
        return (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <img src="https://cdn.simpleicons.org/bitcoin/F7931A" alt="BTC" style={{ height: '18px' }} />
            <img src="https://cdn.simpleicons.org/ethereum/3C3C3D" alt="ETH" style={{ height: '18px' }} />
            <img src="https://cdn.simpleicons.org/tether/168363" alt="USDT" style={{ height: '18px' }} />
          </div>
        );
      case 'wise':
        return (
          <img src="https://cdn.simpleicons.org/wise/9FE870" alt="Wise" style={{ height: '20px' }} />
        );
      case 'apple':
        return (
          <img src="https://cdn.simpleicons.org/applepay/000000" alt="Apple Pay" style={{ height: '24px' }} className="dark-invertible" />
        );
      case 'cashapp':
        return (
          <img src="https://cdn.simpleicons.org/cashapp/00D632" alt="Cash App" style={{ height: '24px' }} />
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        );
    }
  };

  const paymentMethods = [
    { id: 'apple', name: 'Apple Pay', shortName: 'Apple Pay', icon: 'apple', description: 'Fast and secure one-click checkout' },
    { id: 'payfast', name: 'PayFast Secure', shortName: 'PayFast', icon: 'payfast', description: 'Local Bank Transfer & EFT options' },
    { id: 'paystack', name: 'Paystack Payment', shortName: 'Paystack', icon: 'paystack', description: 'Cards · Bank · Transfer · USSD' },
    { id: 'cryptomus', name: 'Cryptocurrency', shortName: 'Crypto', icon: 'crypto', description: 'BTC · ETH · USDT · USDC · LTC' },
    { id: 'wise', name: 'Wise Transfer', shortName: 'Wise', icon: 'wise', description: 'Instant, low-fee international payments' },
    { id: 'cashapp', name: 'Cash App', shortName: 'Cash App', icon: 'cashapp', description: 'Seamless peer-to-peer sending' }
  ];

  const sendWhatsAppOrder = () => {
    const whatsappNumber = '819076098954';

    // Create highly professional and fully detailed order message
    let message = `Greetings!\n`;
    message += `I would like to place an order from Fuji Card Market. Below are the details of my request:\n\n`;

    // Client section
    message += `👤 *CLIENT INFORMATION*\n`;
    message += `• Name: ${user.firstName} ${user.lastName}\n`;
    message += `• Email: ${user.email}\n`;
    message += `• Location: ${user.address}, ${user.city}, ${user.country}\n\n`;

    // Payment Section
    message += `💳 *PREFERRED PAYMENT*\n`;
    message += `• Method: ${paymentMethods.find(m => m.id === formData.paymentMethod)?.name || formData.paymentMethod.toUpperCase()}\n\n`;

    // Items Section
    message += `📦 *ASSET SUMMARY*\n`;
    cart.items.forEach((item, index) => {
      // Correctly extract nested product properties and format the prices
      const productName = item.product?.name || item.name || 'Pokemon Card';
      const rawPrice = parseFloat(item.price || item.product?.price || 0);

      message += `[Item ${index + 1}] *${productName}*\n`;
      message += `   • Quantity: ${item.quantity}\n`;
      message += `   • Unit Price: ${getSymbol()}${convertPrice(rawPrice)}\n`;
      message += `   • Line Total: ${getSymbol()}${convertPrice(rawPrice * item.quantity)}\n\n`;
    });

    // Totals Section
    message += `──────────────\n`;
    message += `💰 *ORDER TOTAL*\n`;
    message += `• Subtotal: ${getSymbol()}${convertPrice(subtotal)}\n`;
    message += `• Shipping: ${getSymbol()}${convertPrice(shipping)}\n`;
    message += `• Grand Total: ${getSymbol()}${convertPrice(total)}\n`;
    message += `──────────────\n\n`;

    message += `I am ready to finalize this transaction. Please let me know how to proceed with the secure payment.\n`;
    message += `Thank you!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    // Navigate to order confirmation
    navigate('/order-confirmation/whatsapp');
  };

  if (authLoading) {
    return (
      <div className="checkout-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #e94560', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel your order? Your cart will be cleared.')) return;
    try {
      await clearCart();
    } catch (e) {
      // Cart clear failure shouldn't stop the redirect
    }
    navigate('/');
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="auth-required">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e94560" strokeWidth="1.5">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <h2>Account Required</h2>
            <p>Please log in or create an account to proceed with checkout</p>
            <div className="auth-buttons">
              <Link to="/login?redirect=/checkout" className="btn btn-primary">Login</Link>
              <Link to="/register?redirect=/checkout" className="btn btn-outline">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(cart.subtotal) || 0;
  const shipping = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + shipping;
  const MINIMUM_ORDER_AMOUNT = 500; // Minimum $500 required
  const canCheckout = subtotal >= MINIMUM_ORDER_AMOUNT;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Notify admin via WhatsApp after a crypto payment is initiated
  const sendCryptoWhatsApp = (orderId, coin, address) => {
    const waNumber = '819076098954';
    let message = `Hi! I just made a *Crypto Payment* on Fuji Card Market.\n\n`;
    message += `🪙 *Coin:* ${coin}\n`;
    message += `📬 *Sent to:* ${address}\n`;
    message += `📦 *Order ID:* ${orderId}\n`;
    message += `👤 *Name:* ${user.firstName} ${user.lastName}\n`;
    message += `📧 *Email:* ${user.email}\n\n`;
    message += `*Items:*\n`;
    cart.items.forEach(item => {
      message += `• ${item.product.name} x${item.quantity}\n`;
    });
    message += `\n💰 *Total:* R${total.toFixed(2)}\n\n`;
    message += `Please confirm receipt. TX Hash (if available): _______________`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if it's a WhatsApp payment method
      const whatsappMethods = ['wise', 'apple', 'zelle', 'chime', 'cashapp', 'email'];

      if (whatsappMethods.includes(formData.paymentMethod)) {
        // Send order via WhatsApp for new payment methods
        sendWhatsAppOrder();
      } else {
        // Handle card and cryptomus payments normally
        const orderData = {
          items: cart.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          })),
          shipping_address: {
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address,
            city: user.city,
            postcode: user.postcode,
            country: user.country,
            phone: user.phone,
            email: user.email
          },
          payment_method: formData.paymentMethod,
          subtotal: subtotal,
          shipping: shipping,
          total: total
        };

        if (formData.paymentMethod === 'cryptomus') {
          // Handle Cryptomus payment
          const cryptomusData = {
            order_id: `order_${Date.now()}`,
            amount: total,
            currency: 'USD',
            description: `Order from ${user.firstName} ${user.lastName}`,
            callback_url: `${window.location.origin}/api/payment/cryptomus/callback`,
            success_url: `${window.location.origin}/order-confirmation/cryptomus`,
            return_url: `${window.location.origin}/order-confirmation/cryptomus`
          };

          const response = await ordersAPI.createCryptomusPayment(cryptomusData);
          if (response.data.result?.url) {
            window.location.href = response.data.result.url;
          } else {
            throw new Error('Payment URL not received');
          }
        } else if (formData.paymentMethod === 'paystack') {
          // Create the order first
          const response = await ordersAPI.checkout(orderData);
          const order = response.data.order;

          // Trigger Paystack Popup
          const handler = window.PaystackPop.setup({
            key: 'pk_live_6b5d612a3ab5346e25e4b3a2ec7accc82590f9b7',
            email: user.email,
            amount: Math.round(total * 100), // convert to cents
            currency: 'ZAR', // assuming ZAR based on PayFast/Paystack context
            ref: order.id,
            callback: function (response) {
              // On success redirect
              navigate(`/order-confirmation/${order.id}`, { state: { order } });
              refreshCart();
            },
            onClose: function () {
              alert('Transaction cancelled');
              setLoading(false);
            }
          });
          handler.openIframe();
          return; // Exit here as popup handles the rest
        } else if (formData.paymentMethod === 'cryptomus') {
          // Create the order first
          const response = await ordersAPI.checkout(orderData);
          const order = response.data.order;
          // Then open WhatsApp with payment proof request
          const coinKeys = { BTC: 'bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap', ETH: '0x8101625364B48146ea92E1FEeB48fd90c852a215', USDT: '0x8101625364B48146ea92E1FEeB48fd90c852a215', USDC: '0x8101625364B48146ea92E1FEeB48fd90c852a215', LTC: 'ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66' };
          sendCryptoWhatsApp(order.id, selectedCoin, coinKeys[selectedCoin]);
          navigate(`/order-confirmation/${order.id}`, { state: { order } });
        } else if (formData.paymentMethod === 'payfast') {
          // Handle PayFast redirect
          const response = await ordersAPI.checkout(orderData);
          await refreshCart();

          const order = response.data.order;

          // Fetch PayFast payload
          const payfastRes = await ordersAPI.generatePayfastPayload(order.id);
          const { url, payload } = payfastRes.data;

          // Create dummy form and submit it
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = url;

          Object.keys(payload).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = payload[key];
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
        } else {
          // Regular card payment flow
          const response = await ordersAPI.checkout(orderData);
          await refreshCart();
          navigate(`/order-confirmation/${response.data.order.id}`, {
            state: { order: response.data.order }
          });
        }
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-checkout">
            <h2>Your cart is empty</h2>
            <p>Add some products to checkout</p>
            <Link to="/products" className="btn btn-primary">Shop Now</Link>
          </div>
        </div>
      </div>
    );
  }

  // Check minimum order amount
  if (!canCheckout && cart.items.length > 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="minimum-order-notice">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#e94560" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2>Minimum Order Amount Required</h2>
            <p className="minimum-message">
              We require a minimum order value of <strong>${MINIMUM_ORDER_AMOUNT}</strong> for wholesale purchases.
            </p>
            <div className="order-progress">
              <div className="progress-info">
                <span>Current Subtotal: <strong>{formatPrice(subtotal)}</strong></span>
                <span>Required: <strong>${formatPrice(MINIMUM_ORDER_AMOUNT)}</strong></span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min((subtotal / MINIMUM_ORDER_AMOUNT) * 100, 100)}%` }}
                />
              </div>
              <p className="remaining-amount">
                Add <strong>{formatPrice(MINIMUM_ORDER_AMOUNT - subtotal)}</strong> more to checkout
              </p>
            </div>
            <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Payment</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Confirm</span>
          </div>
        </div>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-section">
                <h2>Shipping Information</h2>
                <div className="shipping-address-summary">
                  <div className="address-display">
                    <h3>{user.firstName} {user.lastName}</h3>
                    <p>{user.address}</p>
                    <p>{user.city}, {user.postcode}</p>
                    <p>{user.country}</p>
                    <p>📧 {user.email}</p>
                    <p>📞 {user.phone}</p>
                  </div>
                  <Link to="/account" className="edit-address-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit Address
                  </Link>
                </div>

                <h2>Payment Information</h2>
                <p className="payment-notice">Choose your preferred payment method</p>

                <div className="payment-methods-single">
                  <h3>Choose Payment Method:</h3>
                  <div className="payment-options-inline" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '1rem' }}>
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          border: formData.paymentMethod === method.id ? '2px solid #ef4444' : '1px solid #e2e8f0',
                          background: formData.paymentMethod === method.id ? '#fff5f5' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minWidth: '130px',
                          justifyContent: 'center',
                          boxShadow: formData.paymentMethod === method.id ? '0 4px 12px rgba(239, 68, 68, 0.15)' : 'none',
                          transform: formData.paymentMethod === method.id ? 'scale(1.02)' : 'none'
                        }}
                      >
                        {getPaymentIcon(method.id)}
                        <span style={{
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          color: formData.paymentMethod === method.id ? '#ef4444' : '#64748b'
                        }}>
                          {method.shortName || method.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.paymentMethod === 'card' && (
                  <div className="card-payment-form">
                    <div className="form-group">
                      <label>Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date *</label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          value={formData.expiry}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          placeholder="123"
                          value={formData.cvv}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'cryptomus' && (() => {
                  // ── Coin configuration ─────────────────────────────────────
                  // To add real addresses/QR files later, just fill in address
                  // and set qr to e.g. '/eth-qr.png' once you provide them.
                  const coins = {
                    BTC: {
                      label: 'Bitcoin',
                      symbol: 'BTC',
                      color: '#f7931a',
                      address: 'bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap',
                      qr: '/btc-qr.png',
                      trustLink: 'https://link.trustwallet.com/send?address=bc1qhupxlhjaddepp62pdrlj682yhlt203qzu5spap&asset=c0',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="16" cy="16" r="16" fill="#f7931a" />
                          <path d="M22.1 14.3c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.6 2.6-1.3-.3.6-2.6-1.6-.4-.7 2.7-1-.3-2.2-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.3c0 .1.1.1.1.2l-1 3.8c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5 1.1.3-.7 2.7 1.6.4.7-2.7 1.3.3-.7 2.7 1.6.4.7-2.7c2.9.5 5-.2 5.9-2.7.7-2-.03-3.2-1.5-3.9.9-.3 1.6-.9 1.8-2.3zm-3.2 4.5c-.5 2-3.8.9-4.9.7l.9-3.4c1.1.3 4.5.8 4 2.7zm.5-4.5c-.4 1.9-3.3.9-4.2.7l.8-3.1c.9.2 3.8.7 3.4 2.4z" fill="white" />
                        </svg>
                      )
                    },
                    ETH: {
                      label: 'Ethereum',
                      symbol: 'ETH',
                      color: '#627eea',
                      address: '0x8101625364B48146ea92E1FEeB48fd90c852a215',
                      qr: '/eth-qr.png',
                      trustLink: 'https://link.trustwallet.com/send?address=0x8101625364B48146ea92E1FEeB48fd90c852a215&asset=c60',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="16" cy="16" r="16" fill="#627eea" />
                          <path d="M16 6l-6.5 10.2L16 19.6l6.5-3.4L16 6z" fill="white" opacity="0.8" />
                          <path d="M9.5 17.4L16 21l6.5-3.6-6.5 8.6-6.5-8.6z" fill="white" />
                        </svg>
                      )
                    },
                    USDT: {
                      label: 'Tether (USDT)',
                      symbol: 'USDT',
                      color: '#26a17b',
                      address: '0x8101625364B48146ea92E1FEeB48fd90c852a215',
                      qr: '/usdt-qr.png',
                      trustLink: 'https://link.trustwallet.com/send?asset=c60_t0xdAC17F958D2ee523a2206206994597C13D831ec7&address=0x8101625364B48146ea92E1FEeB48fd90c852a215',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="16" cy="16" r="16" fill="#26a17b" />
                          <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">₮</text>
                        </svg>
                      )
                    },
                    USDC: {
                      label: 'USD Coin (USDC)',
                      symbol: 'USDC',
                      color: '#2775ca',
                      address: '0x8101625364B48146ea92E1FEeB48fd90c852a215',
                      qr: '/usdc-qr.png',
                      trustLink: 'https://link.trustwallet.com/send?address=0x8101625364B48146ea92E1FEeB48fd90c852a215&asset=c60_t0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="16" cy="16" r="16" fill="#2775ca" />
                          <text x="16" y="21" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">$</text>
                        </svg>
                      )
                    },
                    LTC: {
                      label: 'Litecoin',
                      symbol: 'LTC',
                      color: '#bfbbbb',
                      address: 'ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66',
                      qr: '/ltc-qr.png',
                      trustLink: 'https://link.trustwallet.com/send?asset=c2&address=ltc1qhncs35rmy3kdcnj62vxnswa9ajgnk8f6yksn66',
                      icon: (
                        <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="16" cy="16" r="16" fill="#bfbbbb" />
                          <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">Ł</text>
                        </svg>
                      )
                    }
                  };

                  const coin = coins[selectedCoin];
                  const isReady = coin.address && !coin.address.startsWith('COMING_SOON');

                  return (
                    <div style={{
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                      border: `1px solid ${coin.color}44`,
                      borderRadius: '14px',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}>
                      {/* Coin Selector */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Select Cryptocurrency</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {Object.entries(coins).map(([key, c]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSelectedCoin(key)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '0.45rem 0.85rem',
                                borderRadius: '8px',
                                border: selectedCoin === key ? `2px solid ${c.color}` : '1px solid rgba(255,255,255,0.12)',
                                background: selectedCoin === key ? `${c.color}22` : 'rgba(255,255,255,0.04)',
                                color: selectedCoin === key ? c.color : '#94a3b8',
                                fontWeight: selectedCoin === key ? 700 : 500,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                transition: 'all 0.18s'
                              }}
                            >
                              {c.icon}
                              {c.symbol}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.15rem' }}>
                        {coin.icon}
                        <div>
                          <div style={{ color: coin.color, fontWeight: 700, fontSize: '1.05rem' }}>{coin.label} Payment</div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                            {isReady ? `Send ${coin.symbol} to the address below` : 'Address coming soon — check back shortly'}
                          </div>
                        </div>
                      </div>

                      {isReady ? (
                        <>
                          {/* QR Code */}
                          {coin.qr && (
                            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                              <img src={coin.qr} alt={`${coin.symbol} QR`}
                                style={{ width: '170px', height: '170px', borderRadius: '10px', border: `3px solid ${coin.color}66` }} />
                              <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.4rem' }}>Scan with Trust Wallet or any compatible wallet</div>
                            </div>
                          )}

                          {/* Address */}
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.35rem' }}>{coin.symbol} Address — <span style={{ color: '#64748b' }}>click to copy</span></div>
                            <div
                              onClick={() => { navigator.clipboard.writeText(coin.address); alert('Address copied!'); }}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: `1px solid ${coin.color}33`,
                                borderRadius: '8px', padding: '0.65rem 0.9rem',
                                fontFamily: 'monospace', fontSize: '0.78rem',
                                color: '#f1f5f9', wordBreak: 'break-all',
                                cursor: 'pointer', userSelect: 'all'
                              }}
                              title="Click to copy"
                            >
                              {coin.address}
                            </div>
                            <button
                              type="button"
                              onClick={() => { navigator.clipboard.writeText(coin.address); alert('Address copied!'); }}
                              style={{
                                marginTop: '0.5rem', width: '100%', padding: '0.55rem',
                                background: `${coin.color}22`, border: `1px solid ${coin.color}55`,
                                borderRadius: '8px', color: coin.color, fontWeight: 700,
                                fontSize: '0.85rem', cursor: 'pointer'
                              }}
                            >
                              📋 Copy {coin.symbol} Address
                            </button>
                          </div>

                          {/* Trust Wallet — mobile only notice */}
                          {coin.trustLink && (
                            <div style={{ marginBottom: '0.85rem' }}>
                              <a href={coin.trustLink} target="_blank" rel="noopener noreferrer"
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  gap: '0.5rem', width: '100%', padding: '0.65rem',
                                  background: 'linear-gradient(135deg, #3375bb, #1d4ed8)',
                                  borderRadius: '10px', color: '#fff', fontWeight: 700,
                                  textDecoration: 'none', fontSize: '0.88rem'
                                }}>
                                📱 Open in Trust Wallet App (Mobile Only)
                              </a>
                              <div style={{ color: '#64748b', fontSize: '0.73rem', textAlign: 'center', marginTop: '0.3rem' }}>
                                ⚠️ This button only works on a phone with the Trust Wallet app installed
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{
                          textAlign: 'center', padding: '1.5rem',
                          background: 'rgba(255,255,255,0.03)',
                          borderRadius: '10px', color: '#64748b', fontSize: '0.9rem'
                        }}>
                          ⏳ {coin.symbol} address will be available soon. Please use Bitcoin (BTC) or another available method.
                        </div>
                      )}

                      <p style={{ color: '#64748b', fontSize: '0.78rem', textAlign: 'center', margin: '0.75rem 0 0' }}>
                        After sending, place your order and share payment proof via WhatsApp.
                      </p>
                    </div>
                  );
                })()}

                {formData.paymentMethod === 'payfast' && (
                  <div className="payfast-payment-form">
                    <div className="crypto-info">
                      <p className="crypto-note">
                        You will be securely redirected to PayFast to complete your payment via Bank Transfer or EFT.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : formData.paymentMethod === 'card' ? 'Place Order' : ['cryptomus', 'payfast'].includes(formData.paymentMethod) ? 'Proceed to Payment' : 'Send Order via WhatsApp'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  style={{
                    marginTop: '0.75rem',
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    padding: '0.6rem 1.2rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.target.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseOut={e => { e.target.style.background = 'transparent'; }}
                >
                  🗑 Cancel Order & Clear Cart
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="form-section">
                <h2>Review Your Order</h2>

                <div className="review-section">
                  <h3>Shipping Address</h3>
                  <p>
                    {user.firstName} {user.lastName}<br />
                    {user.address}<br />
                    {user.city}, {user.postcode}<br />
                    {user.country}<br />
                    📧 {user.email}<br />
                    📞 {user.phone}
                  </p>
                </div>

                <div className="review-section">
                  <h3>Payment Method</h3>
                  {formData.paymentMethod === 'card' ? (
                    <p>Card ending in {formData.cardNumber.slice(-4) || '****'}</p>
                  ) : formData.paymentMethod === 'cryptomus' ? (
                    <p>Cryptomus - Cryptocurrency Payment</p>
                  ) : formData.paymentMethod === 'payfast' ? (
                    <p>PayFast - Bank Transfer / EFT</p>
                  ) : (
                    <p>{paymentMethods.find(m => m.id === formData.paymentMethod)?.name}</p>
                  )}
                </div>

                <div className="button-row" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : `Place Order - ${getSymbol()}${convertPrice(total)}`}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#ef4444',
                      borderRadius: '8px',
                      padding: '0.6rem 1.2rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => { e.target.style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseOut={e => { e.target.style.background = 'transparent'; }}
                  >
                    🗑 Cancel Order & Clear Cart
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item.id} className="summary-item">
                  <img
                    src={item.product.image || item.product.image_url}
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60x80?text=Card';
                    }}
                  />
                  <div className="summary-item-info">
                    <span className="summary-item-name">{item.product.name}</span>
                    <span className="summary-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="summary-item-price">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{getSymbol()}{convertPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `${getSymbol()}${convertPrice(shipping)}`}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>{getSymbol()}{convertPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
