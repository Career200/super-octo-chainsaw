import { persistentAtom } from "@nanostores/persistent";

export interface Contact {
  id: string;
  name: string;
  note: string;
}

export interface NotesState {
  freeform: string;
  contacts: Contact[];
}

export const $notes = persistentAtom<NotesState>(
  "character-notes",
  { freeform: "", contacts: [] },
  {
    encode: JSON.stringify,
    decode: (raw: string): NotesState => {
      try {
        return JSON.parse(raw);
      } catch {
        return { freeform: "", contacts: [] };
      }
    },
  },
);

// --- Actions ---

export function setFreeformNote(text: string): void {
  const current = $notes.get();
  $notes.set({ ...current, freeform: text });
}

export function addContact(): string {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36);
  const current = $notes.get();
  $notes.set({
    ...current,
    contacts: [...current.contacts, { id, name: "", note: "" }],
  });
  return id;
}

export function updateContact(
  id: string,
  patch: Partial<Pick<Contact, "name" | "note">>,
): void {
  const current = $notes.get();
  $notes.set({
    ...current,
    contacts: current.contacts.map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    ),
  });
}

export function removeContact(id: string): void {
  const current = $notes.get();
  $notes.set({
    ...current,
    contacts: current.contacts.filter((c) => c.id !== id),
  });
}
