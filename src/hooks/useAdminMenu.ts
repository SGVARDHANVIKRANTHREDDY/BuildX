import { ActionFeedback } from './useActionFeedback';
import { useMenuItemsList } from './useMenuItemsList';
import { useAddMenuItemForm } from './useAddMenuItemForm';

export function useAdminMenu(
  isAuthenticated: boolean,
  showFeedback: (type: ActionFeedback['type'], message: string, duration?: number) => void
) {
  const list = useMenuItemsList(isAuthenticated, showFeedback);
  const addForm = useAddMenuItemForm(isAuthenticated, list.setMenuItems, showFeedback);

  return { ...list, ...addForm };
}
