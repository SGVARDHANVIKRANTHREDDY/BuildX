import { useAdminAuth } from './useAdminAuth';
import { useActionFeedback } from './useActionFeedback';
import { useAdminOrders } from './useAdminOrders';
import { useAdminMenu } from './useAdminMenu';
import { useOrderHistory } from './useOrderHistory';

export function useAdminDashboardState(onLoginStatusChange: (isLoggedIn: boolean) => void) {
  const auth = useAdminAuth(onLoginStatusChange);
  const feedback = useActionFeedback();
  const ordersState = useAdminOrders(auth.isAuthenticated, auth.handleLogout, feedback.showFeedback);
  const menuState = useAdminMenu(auth.isAuthenticated, feedback.showFeedback);
  const history = useOrderHistory(auth.isAuthenticated);

  return { ...auth, ...feedback, ...ordersState, ...menuState, ...history };
}
