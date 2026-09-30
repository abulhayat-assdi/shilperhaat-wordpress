export interface ContactSettings {
  whatsappUrl: string;
  phoneNumber: string;
  messengerUrl: string;
  emailAddress: string;
  widgetEnabled: boolean;
  welcomeMessage: string;
  buttonPosition: "bottom-right" | "bottom-left";
}

// Used as fallback until the admin saves real values (stored in the
// site_content DB table under the "contact-widget" key).
export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  whatsappUrl: "https://wa.me/8801700000000",
  phoneNumber: "01700000000",
  messengerUrl: "https://m.me/shilperhaat",
  emailAddress: "info@shilperhaat.com",
  widgetEnabled: true,
  welcomeMessage: "আমাদের সাথে যোগাযোগ করুন",
  buttonPosition: "bottom-right",
};

export async function fetchContactSettings(): Promise<ContactSettings> {
  try {
    const res = await fetch("/api/site-content/contact-widget");
    const json = await res.json();
    if (json.value) {
      return { ...DEFAULT_CONTACT_SETTINGS, ...(json.value as Partial<ContactSettings>) };
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_CONTACT_SETTINGS;
}

export async function saveContactSettings(settings: ContactSettings): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/site-content/contact-widget", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: settings }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function formatWhatsAppUrl(rawUrlOrNumber?: string, message?: string): string {
  const msgParam = message ? `?text=${encodeURIComponent(message)}` : "";
  if (!rawUrlOrNumber) return `https://wa.me/${msgParam}`;

  const trimmed = rawUrlOrNumber.trim();
  if (!trimmed) return `https://wa.me/${msgParam}`;

  // If it contains placeholder X's or dummy values like 8801XXXXXXXXX, return default or basic wa.me format
  if (trimmed.includes("X") || trimmed.includes("x")) {
    return `https://wa.me/8801700000000${msgParam}`;
  }

  // If it's already a full HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const digits = trimmed.replace(/[^0-9]/g, "");
    if (digits.length >= 8) {
      let waNumber = digits;
      if (digits.startsWith("01") && digits.length === 11) {
        waNumber = `88${digits}`;
      } else if (digits.startsWith("1") && digits.length === 10) {
        waNumber = `880${digits}`;
      }
      return `https://wa.me/${waNumber}${msgParam}`;
    }
    const sep = trimmed.includes("?") ? "&" : "?";
    return message ? `${trimmed}${sep}text=${encodeURIComponent(message)}` : trimmed;
  }

  // If it's a raw number string
  const digits = trimmed.replace(/[^0-9]/g, "");
  if (!digits) return `https://wa.me/${msgParam}`;

  let waNumber = digits;
  if (digits.startsWith("01") && digits.length === 11) {
    waNumber = `88${digits}`;
  } else if (digits.startsWith("1") && digits.length === 10) {
    waNumber = `880${digits}`;
  }

  return `https://wa.me/${waNumber}${msgParam}`;
}

export function formatPhoneUrl(rawPhone?: string): string {
  if (!rawPhone) return "tel:";
  const trimmed = rawPhone.trim();
  if (trimmed.includes("X") || trimmed.includes("x")) {
    return "tel:01700000000";
  }
  const cleanPhone = trimmed.replace(/[\s\-\(\)]/g, "");
  return `tel:${cleanPhone}`;
}

