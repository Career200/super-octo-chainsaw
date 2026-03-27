import { useState } from "preact/hooks";

export function useEditToggle(currentId: string | null, canEdit: boolean) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = canEdit && editingId === currentId;
  const toggleEdit = () => setEditingId(editing ? null : currentId);
  return { editing, toggleEdit };
}
