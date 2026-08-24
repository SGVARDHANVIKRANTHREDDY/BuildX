import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header, ActiveTab } from './components/Header';
import { StudentMenu } from './components/StudentMenu';
import { TrackOrder } from './components/TrackOrder';
import { NowServingDisplay } from './components/NowServingDisplay';
import { AdminDashboard } from './components/AdminDashboard';
import { ConcurrencyDemo } from './components/ConcurrencyDemo';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { OrderDetails } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('menu');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(
    Boolean(localStorage.getItem('canteen_admin_jwt'))
  );
  const [activeTokenToTrack, setActiveTokenToTrack] = useState<string>('');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<OrderDetails | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);

  const handleOrderCompleted = (order: OrderDetails) => {
    setLastCompletedOrder(order);
    setActiveTokenToTrack(order.token_id);
    setCartCount(0);
  };

  const handleTrackFromConfirmation = (tokenId: string) => {
    setLastCompletedOrder(null);
    setActiveTokenToTrack(tokenId);
    setActiveTab('track');
  };

  return (
    <div className="min-h-screen text-ink-900 flex flex-col font-sans">

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        cartCount={cartCount}
      />


      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'menu' && (
              <StudentMenu
                onOrderCompleted={handleOrderCompleted}
                onNavigateToTrack={(tokenId) => {
                  setActiveTokenToTrack(tokenId);
                  setActiveTab('track');
                }}
                onCartCountChange={setCartCount}
              />
            )}

            {activeTab === 'track' && (
              <TrackOrder
                initialTokenId={activeTokenToTrack}
                onNavigateToMenu={() => setActiveTab('menu')}
              />
            )}

            {activeTab === 'display' && (
              <NowServingDisplay />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                onLoginStatusChange={(status) => setIsAdminLoggedIn(status)}
              />
            )}

            {activeTab === 'concurrency' && (
              <ConcurrencyDemo />
            )}
          </motion.div>
        </AnimatePresence>
      </main>


      {lastCompletedOrder && (
        <OrderConfirmationModal
          order={lastCompletedOrder}
          onClose={() => setLastCompletedOrder(null)}
          onTrack={handleTrackFromConfirmation}
        />
      )}

    </div>
  );
}
