export function isLocalHostName(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function shouldLockPageTools(hostname: string): boolean {
  return !isLocalHostName(hostname);
}

/** Inline in layout so Vercel cannot drop it from the Tailwind CSS bundle. */
export const NO_SELECT_CSS =
  "html,body,*{-webkit-user-select:none!important;user-select:none!important;-webkit-touch-callout:none}" +
  "img,svg,canvas{-webkit-user-drag:none}" +
  "input,textarea{-webkit-user-select:text!important;user-select:text!important;cursor:text}" +
  "button:not(:disabled),a,label,select,summary,.pressable,input[type=checkbox],input[type=range],input[type=radio]{cursor:pointer}" +
  "button:disabled{cursor:not-allowed}";

export function isEditableTarget(target: EventTarget | null): boolean {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return true;
  if (target instanceof Text) return isEditableTarget(target.parentElement);
  if (target instanceof Element) return Boolean(target.closest("input, textarea"));
  return false;
}

export function shouldBlockSelection(target: EventTarget | null): boolean {
  return !isEditableTarget(target);
}

export function isSelectAllShortcut(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
}): boolean {
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a";
}

export function isInspectShortcut(event: {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  if (event.key === "F12") return true;
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;
  if (mod && event.shiftKey && (key === "i" || key === "j" || key === "c" || key === "k")) {
    return true;
  }
  if (mod && event.altKey && key === "i") return true;
  if (mod && !event.shiftKey && key === "u") return true;
  return false;
}
