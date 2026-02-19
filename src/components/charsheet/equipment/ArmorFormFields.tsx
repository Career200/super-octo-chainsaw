import { BODY_PARTS, PART_ABBREV, type BodyPartName } from "@scripts/armor/core";

interface Props {
  bodyParts: BodyPartName[];
  onBodyPartsChange?: (parts: BodyPartName[]) => void;
  type: "soft" | "hard";
  onTypeChange?: (type: "soft" | "hard") => void;
  spMax: number;
  onSpMaxChange?: (sp: number) => void;
  ev: number;
  onEvChange?: (ev: number) => void;
}

export function ArmorFormFields({
  bodyParts,
  onBodyPartsChange,
  type,
  onTypeChange,
  spMax,
  onSpMaxChange,
  ev,
  onEvChange,
}: Props) {
  const togglePart = (part: BodyPartName) => {
    if (!onBodyPartsChange) return;
    if (bodyParts.includes(part)) {
      onBodyPartsChange(bodyParts.filter((p) => p !== part));
    } else {
      onBodyPartsChange([...bodyParts, part]);
    }
  };

  return (
    <div class="armor-form-row">
      {BODY_PARTS.map((part) => {
        const active = bodyParts.includes(part);
        return (
          <button
            key={part}
            type="button"
            class={`coverage-badge coverage-badge-toggle${active ? " active" : ""}`}
            disabled={!onBodyPartsChange}
            onClick={() => togglePart(part)}
          >
            {PART_ABBREV[part]}
          </button>
        );
      })}
      <select
        class="input armor-form-select"
        value={type}
        disabled={!onTypeChange}
        onChange={
          onTypeChange
            ? (e) =>
                onTypeChange(
                  (e.target as HTMLSelectElement).value as "soft" | "hard",
                )
            : undefined
        }
      >
        <option value="soft">Soft</option>
        <option value="hard">Hard</option>
      </select>
      <input
        type="number"
        class="input armor-form-num"
        value={spMax}
        disabled={!onSpMaxChange}
        onInput={
          onSpMaxChange
            ? (e) => {
                const raw = (e.target as HTMLInputElement).value;
                if (raw === "") { onSpMaxChange(0); return; }
                const v = parseInt(raw, 10);
                if (!isNaN(v)) onSpMaxChange(Math.max(0, v));
              }
            : undefined
        }
        min="0"
        placeholder="SP"
        title="SP"
      />
      <input
        type="number"
        class="input armor-form-num"
        value={ev}
        disabled={!onEvChange}
        onInput={
          onEvChange
            ? (e) => {
                const raw = (e.target as HTMLInputElement).value;
                if (raw === "") { onEvChange(0); return; }
                const v = parseInt(raw, 10);
                if (!isNaN(v)) onEvChange(Math.max(0, v));
              }
            : undefined
        }
        min="0"
        placeholder="EV"
        title="EV"
      />
    </div>
  );
}
