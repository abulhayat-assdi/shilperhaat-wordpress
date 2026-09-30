'use client';

import { Search } from "lucide-react";

interface SearchBarProps {
  defaultValue: string;
}

export default function SearchBar({ defaultValue }: SearchBarProps) {
  return (
    <form method="get" className="relative w-full md:max-w-sm">
      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#aaa" }} />
      <input
        type="text"
        name="search"
        defaultValue={defaultValue}
        placeholder="Search products..."
        style={{
          width: "100%",
          paddingLeft: 36, paddingRight: 14,
          paddingTop: 9, paddingBottom: 9,
          borderRadius: 999,
          border: "1px solid #CCC",
          outline: "none",
          fontSize: 13,
          color: "#333",
          backgroundColor: "#fff",
          fontFamily: "'Open Sans', sans-serif",
        }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#800000"; }}
        onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "#CCC"; }}
      />
    </form>
  );
}
