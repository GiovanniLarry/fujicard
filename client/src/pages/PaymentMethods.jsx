import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PaymentMethods from '../components/PaymentMethods';
import './PaymentMethodsPage.css';

const PaymentMethodsPage = () => {
  return (
    <div className="payment-methods-page">
      <Header />
      <main className="payment-main">
        <div className="container">
          <PaymentMethods />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentMethodsPage;
