"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Gray", value: "#666666" },
  { label: "Red", value: "#e53e3e" },
  { label: "Orange", value: "#F48721" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Product description...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlMode, setHtmlMode] = useState(false);
  const [rawHtml, setRawHtml] = useState(value);
  const skipSync = useRef(false);

  // Sync external value into editor on mount / when value changes from outside
  useEffect(() => {
    if (!htmlMode && editorRef.current && !skipSync.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value, htmlMode]);

  const emitChange = useCallback(() => {
    if (editorRef.current) {
      skipSync.current = true;
      onChange(editorRef.current.innerHTML);
      skipSync.current = false;
    }
  }, [onChange]);

  const exec = useCallback(
    (command: string, arg?: string) => {
      editorRef.current?.focus();
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      document.execCommand(command, false, arg);
      emitChange();
    },
    [emitChange]
  );

  const handleInput = () => {
    if (!skipSync.current) emitChange();
  };

  const handleLinkInsert = () => {
    const url = prompt("Enter URL (e.g. https://example.com):");
    if (url?.trim()) exec("createLink", url.trim());
  };

  const switchToHtml = () => {
    setRawHtml(editorRef.current?.innerHTML || "");
    setHtmlMode(true);
  };

  const switchToRich = () => {
    if (editorRef.current) {
      skipSync.current = true;
      editorRef.current.innerHTML = rawHtml;
      skipSync.current = false;
      onChange(rawHtml);
    }
    setHtmlMode(false);
  };

  const handleRawHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawHtml(e.target.value);
    onChange(e.target.value);
  };

  const tbBtn =
    "px-2 py-1 rounded hover:bg-gray-200 text-gray-700 transition-colors text-sm leading-none select-none cursor-pointer";

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#800000] transition-colors bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }} className={tbBtn} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }} className={tbBtn} title="Italic">
          <em>I</em>
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }} className={tbBtn} title="Underline">
          <u>U</u>
        </button>

        <span className="w-px h-4 bg-gray-300 mx-1 inline-block" />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "<h2>"); }} className={tbBtn} title="Heading 2">
          H2
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "<h3>"); }} className={tbBtn} title="Heading 3">
          H3
        </button>

        <span className="w-px h-4 bg-gray-300 mx-1 inline-block" />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }} className={tbBtn} title="Bullet List">
          • List
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }} className={tbBtn} title="Numbered List">
          1. List
        </button>

        <span className="w-px h-4 bg-gray-300 mx-1 inline-block" />

        {/* Color swatches */}
        <span className="text-xs text-gray-400 mr-0.5">Color:</span>
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={`Text color: ${c.label}`}
            onMouseDown={(e) => { e.preventDefault(); exec("foreColor", c.value); }}
            className="w-4 h-4 rounded-full border border-gray-300 hover:scale-125 transition-transform"
            style={{ backgroundColor: c.value }}
          />
        ))}

        <span className="w-px h-4 bg-gray-300 mx-1 inline-block" />

        <button type="button" onMouseDown={(e) => { e.preventDefault(); handleLinkInsert(); }} className={tbBtn} title="Insert Link">
          Link
        </button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }} className={tbBtn} title="Clear Formatting">
          Clear
        </button>

        {/* HTML mode toggle — flush right */}
        <button
          type="button"
          onClick={htmlMode ? switchToRich : switchToHtml}
          className={`ml-auto text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
            htmlMode
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
          }`}
        >
          {htmlMode ? "Rich Text" : "&lt;HTML&gt;"}
        </button>
      </div>

      {/* Editor area */}
      {htmlMode ? (
        <textarea
          value={rawHtml}
          onChange={handleRawHtmlChange}
          className="w-full outline-none font-mono text-xs text-gray-800 bg-gray-900 text-green-400 p-3 resize-y"
          style={{ minHeight: 180, fontSize: 12, lineHeight: 1.6 }}
          placeholder="<p>Enter raw HTML here...</p>"
          spellCheck={false}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning
          className="outline-none rte-content"
          style={{ minHeight: 180, padding: "12px 14px", fontSize: 14, lineHeight: 1.7, color: "#333" }}
          data-placeholder={placeholder}
        />
      )}

      <style>{`
        .rte-content:empty:before {
          content: attr(data-placeholder);
          color: #aaa;
          pointer-events: none;
        }
        .rte-content h2 { font-size: 1.25em; font-weight: 700; margin: 0.5em 0; }
        .rte-content h3 { font-size: 1.1em; font-weight: 600; margin: 0.5em 0; }
        .rte-content ul { list-style-type: disc; padding-left: 1.5em; margin: 0.4em 0; }
        .rte-content ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.4em 0; }
        .rte-content a { color: #800000; text-decoration: underline; }
        .rte-content p { margin: 0.3em 0; }
      `}</style>
    </div>
  );
}
