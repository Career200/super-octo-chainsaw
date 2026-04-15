import { useStore } from "@nanostores/preact";

import { STAT_LABELS, type StatName } from "@scripts/combat/stats";
import { $cyberEffects, type CyberEffects } from "@stores/cyber-effects";
import {
  $notes,
  addContact,
  type Contact,
  removeContact,
  setFreeformNote,
  updateContact,
} from "@stores/notes";
import { tabStore } from "@stores/ui";

import { ConfirmPopover } from "../shared/ConfirmPopover";
import { Panel } from "../shared/Panel";
import { TabStrip } from "../shared/TabStrip";
import { useDebouncedCallback } from "../shared/useDebouncedCallback";
import { usePopoverState } from "../shared/usePopoverState";

// --- Effects View ---

function formatStat(stat: string, val: number) {
  const label = STAT_LABELS[stat as StatName] ?? stat.toUpperCase();
  return `${label} ${val > 0 ? "+" : ""}${val}`;
}

function formatSkill(skill: string, val: number) {
  return `${skill} ${val > 0 ? "+" : ""}${val}`;
}

function BonusLine({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <p class="effects-bonus-line">
      <span class="text-soft">{label}:</span>{" "}
      {items.join(",\u2002")}
    </p>
  );
}

function EffectBlock({
  label,
  effects,
}: {
  label: string;
  effects: CyberEffects["majorEffects"];
}) {
  if (!effects.length) return null;
  return (
    <div class="effects-block">
      <p class="effects-block-label text-soft">{label}</p>
      {effects.map((e) => (
        <p key={e.key} class="effects-block-item">{e.text}</p>
      ))}
    </div>
  );
}

const EffectsView = ({ effects }: { effects: CyberEffects }) => {
  const skillOverrides = Object.entries(effects.skillOverrides).map(
    ([skill, val]) => `${skill} =${val}`,
  );
  const statOverrides = Object.entries(effects.statOverrides).map(
    ([stat, val]) => {
      const label = STAT_LABELS[stat as StatName] ?? stat.toUpperCase();
      return `${label} =${val}`;
    },
  );
  const statBonuses = Object.entries(effects.statBonuses).map(([s, v]) =>
    formatStat(s, v!),
  );
  if (effects.initiativeBonus) {
    statBonuses.push(`Init ${effects.initiativeBonus > 0 ? "+" : ""}${effects.initiativeBonus}`);
  }
  const skillBonuses = Object.entries(effects.skillBonuses).map(([s, v]) =>
    formatSkill(s, v),
  );

  const hasAny =
    skillOverrides.length ||
    statOverrides.length ||
    statBonuses.length ||
    skillBonuses.length ||
    effects.majorEffects.length ||
    effects.minorEffects.length;

  if (!hasAny) {
    return <p class="empty-message">No active cyber effects.</p>;
  }

  return (
    <div class="effects-view">
      <BonusLine label="Skill overrides" items={skillOverrides} />
      <BonusLine label="Stat overrides" items={statOverrides} />
      <BonusLine label="Stat bonuses" items={statBonuses} />
      <BonusLine label="Skill bonuses" items={skillBonuses} />
      <EffectBlock label="Major" effects={effects.majorEffects} />
      <EffectBlock label="Minor" effects={effects.minorEffects} />
    </div>
  );
};

// --- Contact Card ---

const ContactCard = ({ contact }: { contact: Contact }) => {
  const {
    ref: deleteBtnRef,
    open: confirmOpen,
    setOpen: setConfirmOpen,
  } = usePopoverState();

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

export const NotesPanel = ({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) => {
  const notes = useStore($notes);
  const effects = useStore($cyberEffects);
  const tab = useStore(tabStore("notes-tab", "notes"));

  const debouncedSetFreeform = useDebouncedCallback(setFreeformNote, 300);

  return (
    <Panel
      id="notes-panel"
      title="Notes"
      expanded={expanded}
      onToggle={onToggle}
      headerActions={
        <TabStrip
          persist="notes-tab"
          tabs={[
            { id: "notes", label: "Notes" },
            { id: "contacts", label: "Contacts" },
            { id: "effects", label: "Effects" },
          ]}
        />
      }
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
      {tab === "effects" && <EffectsView effects={effects} />}
      {tab === "contacts" && (
        <div>
          {notes.contacts.length === 0 ? (
            <p class="empty-message">No contacts yet.</p>
          ) : (
            notes.contacts.map((c) => <ContactCard key={c.id} contact={c} />)
          )}
          <button class="btn-ghost notes-add-btn" onClick={() => addContact()}>
            + Add Contact
          </button>
        </div>
      )}
    </Panel>
  );
};
