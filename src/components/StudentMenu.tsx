import React from 'react';
import { OrderDetails } from '../types';
import { useMenuAndCart } from '../hooks/useMenuAndCart';
import { usePayment } from '../hooks/usePayment';
import { QueuePulseBanner } from './student/QueuePulseBanner';
import { CategoryFilterBar } from './student/CategoryFilterBar';
import { MenuGrid } from './student/MenuGrid';
import { StudentCartArea } from './student/StudentCartArea';

interface StudentMenuProps {
  onOrderCompleted: (order: OrderDetails) => void;
  onNavigateToTrack: (tokenId: string) => void;
  onCartCountChange?: (count: number) => void;
}

export const StudentMenu: React.FC<StudentMenuProps> = ({
  onOrderCompleted,
  onCartCountChange
}) => {
  const {
    queueInfo,
    selectedCategory,
    setSelectedCategory,
    cart,
    setCart,
    isLoading,
    categories,
    filteredItems,
    addToCart,
    removeFromCart,
    totalCartAmount,
    totalCartQuantity
  } = useMenuAndCart(onCartCountChange);

  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    isProcessingPayment,
    paymentError,
    paymentConfig,
    paymentMethod,
    setPaymentMethod,
    testCardNumber,
    setTestCardNumber,
    testUpiId,
    setTestUpiId,
    handleProceedToPayment,
    handleCheckoutClick
  } = usePayment(cart, setCart, onOrderCompleted);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <QueuePulseBanner queueInfo={queueInfo} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <CategoryFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <MenuGrid
            items={filteredItems}
            cart={cart}
            isLoading={isLoading}
            onAdd={addToCart}
            onRemove={removeFromCart}
          />
        </div>

        <StudentCartArea
          cart={cart}
          totalCartAmount={totalCartAmount}
          totalCartQuantity={totalCartQuantity}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onCheckout={handleCheckoutClick}
          liveMode={paymentConfig?.liveMode ?? false}
          isProcessingPayment={isProcessingPayment}
          isCheckoutOpen={isCheckoutOpen}
          setIsCheckoutOpen={setIsCheckoutOpen}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          testCardNumber={testCardNumber}
          setTestCardNumber={setTestCardNumber}
          testUpiId={testUpiId}
          setTestUpiId={setTestUpiId}
          paymentError={paymentError}
          onConfirmPayment={handleProceedToPayment}
        />
      </div>
    </div>
  );
};
