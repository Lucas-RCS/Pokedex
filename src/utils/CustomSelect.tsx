import { CaretDownIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// --------------- Custom Dropdown Select ---------------
export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
}) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateDropdownPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!open) return;
    updateDropdownPosition();

    const handleOutside = (e: MouseEvent) => {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open]);

  const handleToggle = () => {
    updateDropdownPosition();
    setOpen((v) => !v);
  };

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-white/20 font-bold text-slate-200 text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between gap-2 focus:outline-none focus:ring-1 focus:ring-white/20"
      >
        <span className="flex items-center gap-2.5 truncate">
          {selected?.color && (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 ring-1 ring-white/20"
              style={{ backgroundColor: selected.color }}
            />
          )}
          <span className="truncate">{selected?.label}</span>
        </span>
        <CaretDownIcon
          className={`shrink-0 text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
              zIndex: 9999,
            }}
            className="bg-slate-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto py-1.5 px-1.5 space-y-0.5 [scrollbar-width:thin] [scrollbar-color:#334155_transparent]">
              {options.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-150 flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-white/15 text-white"
                        : "text-slate-400 hover:bg-white/[0.07] hover:text-slate-200"
                    }`}
                  >
                    {opt.color ? (
                      <span
                        className="h-2 w-2 rounded-full shrink-0 ring-1 ring-white/20"
                        style={{ backgroundColor: opt.color }}
                      />
                    ) : (
                      isSelected && (
                        <span className="h-2 w-2 rounded-full shrink-0 bg-white/60" />
                      )
                    )}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
// ------------------------------------------------------
