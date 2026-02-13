import { useState, useRef, useCallback } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import {
  $notes,
  setFreeformNote,
  addContact,
  updateContact,
  removeContact,
  type Contact,
} from "@stores/notes";
import { Panel } from "../shared/Panel";
import { ConfirmPopover } from "../shared/ConfirmPopover";

type NotesTab = "notes" | "contacts";

// --- Debounce helper ---

function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  return useCallback(
    ((...args: any[]) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), delay);
    }) as T,
    [fn, delay],
  );
}

// --- Contact Card ---

const ContactCard = ({ contact }: { contact: Contact }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  const debouncedUpdate = useDebouncedCallback(
    (patch: Partial<Pick<Contact, "name" | "note">>) =>
      updateContact(contact.id, patch),
    300,
  );

  return (
    <div class="contact-card">
      <div class="contact-header">
        <input
          type="text"
          placeholder="Name"
          value={contact.name}
          onInput={(e) =>
            debouncedUpdate({ name: (e.target as HTMLInputElement).value })
          }
        />
        <button
          ref={deleteBtnRef}
          class="btn-ghost-danger btn-sm"
          onClick={() => setConfirmOpen(true)}
        >
          Delete
        </button>
        <ConfirmPopover
          anchorRef={deleteBtnRef}
          open={confirmOpen}
          message={`Delete ${contact.name || "this contact"}?`}
          confirmText="Delete"
          cancelText="Keep"
          type="danger"
          onConfirm={() => {
            removeContact(contact.id);
            setConfirmOpen(false);
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
      <textarea
        class="contact-note"
        placeholder="Notes..."
        value={contact.note}
        onInput={(e) =>
          debouncedUpdate({ note: (e.target as HTMLTextAreaElement).value })
        }
      />
    </div>
  );
};

// --- Notes Panel ---

export const NotesPanel = () => {
  const notes = useStore($notes);
  const [tab, setTab] = useState<NotesTab>("notes");

  const debouncedSetFreeform = useDebouncedCallback(setFreeformNote, 300);

  return (
    <Panel
      id="notes-panel"
      title="Notes"
      headerActions={
        <span class="tab-strip" onClick={(e) => e.stopPropagation()}>
          <button
            class={tab === "notes" ? "active" : ""}
            onClick={() => setTab("notes")}
          >
            Notes
          </button>
          <button
            class={tab === "contacts" ? "active" : ""}
            onClick={() => setTab("contacts")}
          >
            Contacts
          </button>
        </span>
      }
      defaultExpanded
    >
      {tab === "notes" && (
        <textarea
          class="notes-textarea"
          value={notes.freeform}
          placeholder="Type in anything..."
          onInput={(e) =>
            debouncedSetFreeform((e.target as HTMLTextAreaElement).value)
          }
        />
      )}
      {tab === "contacts" && (
        <div>
          {notes.contacts.length === 0 ? (
            <p class="empty-message">No contacts yet.</p>
          ) : (
            notes.contacts.map((c) => <ContactCard key={c.id} contact={c} />)
          )}
          <button
            class="btn-ghost notes-add-btn"
            onClick={() => addContact()}
          >
            + Add Contact
          </button>
        </div>
      )}
    </Panel>
  );
};
