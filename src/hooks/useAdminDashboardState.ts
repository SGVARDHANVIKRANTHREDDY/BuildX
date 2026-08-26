import { useAdminAuth } from './useAdminAuth';
import { useActionFeedback } from './useActionFeedback';
import { useAdminOrders } from './useAdminOrders';
import { useAdminMenu } from './useAdminMenu';

export function useAdminDashboardState(onLoginStatusChange: (isLoggedIn: boolean) => void) {
  const auth = useAdminAuth(onLoginStatusChange);
  const feedback = useActionFeedback();
  const ordersState = useAdminOrders(auth.authToken, auth.handleLogout, feedback.showFeedback);
  const menuState = useAdminMenu(auth.authToken, feedback.showFeedback);

  return { ...auth, ...feedback, ...ordersState, ...menuState };
}
