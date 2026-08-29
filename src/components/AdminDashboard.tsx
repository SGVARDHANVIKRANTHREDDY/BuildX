import React from 'react';
import { MenuItem } from '../types';
import { useAdminDashboardState } from '../hooks/useAdminDashboardState';
import { AdminLoginForm } from './admin/AdminLoginForm';
import { AdminTopBar } from './admin/AdminTopBar';
import { FeedbackBanner } from './admin/FeedbackBanner';
import { KitchenDemandStrip } from './admin/KitchenDemandStrip';
import { OrderQueueTable } from './admin/OrderQueueTable';
import { AdminSidePanel } from './admin/AdminSidePanel';
import { OrderHistoryModal } from './admin/OrderHistoryModal';

interface AdminDashboardProps {
  onLoginStatusChange: (isLoggedIn: boolean) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLoginStatusChange }) => {
  const s = useAdminDashboardState(onLoginStatusChange);

  if (s.isCheckingSession) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-ink-400 text-xs font-semibold">
        Checking session…
      </div>
    );
  }

  if (!s.isAuthenticated) {
    return (
      <AdminLoginForm
        username={s.username}
        password={s.password}
        onUsernameChange={s.setUsername}
        onPasswordChange={s.setPassword}
        loginError={s.loginError}
        isLoggingIn={s.isLoggingIn}
        onSubmit={s.handleLogin}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <AdminTopBar
        autoRefresh={s.autoRefresh}
        onToggleAutoRefresh={() => s.setAutoRefresh(!s.autoRefresh)}
        onRefreshNow={s.fetchAdminOrders}
        onLogout={s.handleLogout}
        isChangingPassword={s.isChangingPassword}
        changePasswordError={s.changePasswordError}
        changePasswordSuccess={s.changePasswordSuccess}
        onClearChangePasswordState={() => { s.setChangePasswordError(null); s.setChangePasswordSuccess(false); }}
        onChangePassword={s.handleChangePassword}
        onOpenHistory={s.openHistory}
      />

      <FeedbackBanner feedback={s.actionFeedback} onDismiss={() => s.setActionFeedback(null)} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-ink-200 shadow-xs overflow-hidden">
          <KitchenDemandStrip demand={s.kitchenDemand} />
          <OrderQueueTable
            orders={s.orders}
            filterStatus={s.filterStatus}
            onFilterChange={s.setFilterStatus}
            stats={s.stats}
            isUpdatingStatus={s.isUpdatingStatus}
            onUpdateStatus={s.handleUpdateStatus}
          />
        </div>

        <AdminSidePanel
          stats={s.stats}
          menuItems={s.menuItems}
          isAddItemOpen={s.isAddItemOpen}
          onToggleAddItem={() => { s.setIsAddItemOpen(!s.isAddItemOpen); s.setAddItemError(null); }}
          newItemName={s.newItemName}
          newItemCategory={s.newItemCategory}
          newItemPrice={s.newItemPrice}
          addItemError={s.addItemError}
          isSavingNewItem={s.isSavingNewItem}
          onNewItemNameChange={s.setNewItemName}
          onNewItemCategoryChange={s.setNewItemCategory}
          onNewItemPriceChange={s.setNewItemPrice}
          onAddNewItem={s.handleAddNewItem}
          editingNoteId={s.editingNoteId}
          tempNote={s.tempNote}
          onTempNoteChange={s.setTempNote}
          onToggleAvailability={s.handleToggleAvailability}
          onStartEditNote={(item: MenuItem) => { s.setEditingNoteId(item.item_id); s.setTempNote(item.restock_note || ''); }}
          onSaveNote={s.handleSaveRestockNote}
        />
      </div>

      <OrderHistoryModal
        isOpen={s.isHistoryOpen}
        onClose={s.closeHistory}
        orders={s.historyOrders}
        page={s.historyPage}
        totalPages={s.historyTotalPages}
        total={s.historyTotal}
        isLoading={s.isHistoryLoading}
        error={s.historyError}
        onGoToPage={s.goToHistoryPage}
      />
    </div>
  );
};
