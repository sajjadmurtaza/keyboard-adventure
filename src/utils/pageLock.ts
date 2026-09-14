export function isLocalHostName(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

export function shouldLockPageTools(hostname: string): boolean {
  return !isLocalHostName(hostname);
}

export function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
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
