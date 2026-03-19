import React from 'react';
import './PaymentMethods.css';

const PaymentMethods = () => {
  const paymentMethods = [
    { id: 'wise', name: 'Wise Transfer', icon: '💳' },
    { id: 'apple', name: 'Apple Pay', icon: '🍎' },
    { id: 'zelle', name: 'Zelle', icon: '💰' },
    { id: 'chime', name: 'Chime', icon: '🏦' },
    { id: 'cashapp', name: 'Cash App', icon: '💵' },
    { id: 'email', name: 'Email Transfer', icon: '📧' }
  ];

  const handlePaymentMethod = (method) => {
    const message = `Hi! I would like to pay using ${method.name}. Please assist me with the payment process.`;
    const whatsappNumber = '819076098954';
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="payment-methods">
      <div className="payment-header">
        <h2>Payment Methods</h2>
        <p>We accept the following secure payment methods</p>
      </div>

      <div className="payment-grid">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="payment-card"
            onClick={() => handlePaymentMethod(method)}
          >
            <div className="payment-icon">
              <span className="icon">{method.icon}</span>
            </div>
            <div className="payment-info">
              <h3>{method.name}</h3>
              <p>Click to get payment details</p>
            </div>
            <div className="payment-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-footer">
        <div className="security-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Secure payments through WhatsApp</span>
        </div>
        <div className="contact-info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>WhatsApp: +237 6 96 88 94 57</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
