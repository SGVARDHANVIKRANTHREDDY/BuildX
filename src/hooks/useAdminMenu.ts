import { ActionFeedback } from './useActionFeedback';
import { useMenuItemsList } from './useMenuItemsList';
import { useAddMenuItemForm } from './useAddMenuItemForm';

export function useAdminMenu(
  authToken: string | null,
  showFeedback: (type: ActionFeedback['type'], message: string, duration?: number) => void
) {
  const list = useMenuItemsList(authToken, showFeedback);
  const addForm = useAddMenuItemForm(authToken, list.setMenuItems, showFeedback);

  return { ...list, ...addForm };
}
