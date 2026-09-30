"use client";

import { createContext, useContext, useState } from "react";

type ContactPopupContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ContactPopupContext = createContext<ContactPopupContextType>({
  open: false,
  setOpen: () => {},
});

export function ContactPopupProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <ContactPopupContext.Provider value={{ open, setOpen }}>
      {children}
    </ContactPopupContext.Provider>
  );
}

export function useContactPopup() {
  return useContext(ContactPopupContext);
}
