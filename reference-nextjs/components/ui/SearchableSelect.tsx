"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select",
  disabled = false,
  hasError = false,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const select = useCallback(
    (opt: string) => {
      onChange(opt);
      setOpen(false);
      setQuery("");
    },
    [onChange]
  );

  const clear = useCallback(() => {
    onChange("");
    setOpen(false);
    setQuery("");
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search box when dropdown opens
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const borderColor = hasError ? "#f87171" : open ? "#800000" : "#e0e0e0";

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((p) => !p);
        }}
        style={{
          width: "100%",
          height: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "0 12px",
          background: disabled ? "#f9f9f9" : "white",
          border: `1px solid ${borderColor}`,
          borderRadius: 6,
          fontSize: 14,
          color: value ? "#333" : "#aaa",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "border-color 0.15s",
          boxSizing: "border-box",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || placeholder}
        </span>
        {open ? (
          <ChevronUp size={16} style={{ color: "#800000", flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} style={{ color: "#999", flexShrink: 0 }} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e0e0e0",
            borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            zIndex: 9999,
            overflow: "hidden",
          }}
        >
          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Search size={14} style={{ color: "#aaa", flexShrink: 0 }} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 13,
                color: "#333",
                background: "transparent",
              }}
            />
          </div>

          {/* Option list */}
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {/* Clear / placeholder option */}
            <button
              type="button"
              onClick={clear}
              style={{
                display: "block",
                width: "100%",
                padding: "9px 14px",
                textAlign: "left",
                fontSize: 13,
                color: "#aaa",
                background: "white",
                border: "none",
                cursor: "pointer",
                borderBottom: "1px solid #f5f5f5",
              }}
            >
              {placeholder}
            </button>

            {filtered.length === 0 ? (
              <p style={{ padding: "12px 14px", fontSize: 13, color: "#aaa" }}>No results found</p>
            ) : (
              filtered.map((opt) => {
                const active = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => select(opt)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "9px 14px",
                      textAlign: "left",
                      fontSize: 13,
                      color: active ? "#fff" : "#333",
                      background: active ? "#800000" : "white",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#fff8f0";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLButtonElement).style.background = "white";
                    }}
                  >
                    {opt}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
