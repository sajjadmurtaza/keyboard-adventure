import { looksLikeCameraExfiltration, type DressUpNetworkProbe } from "@/lib/dressUp/privacy";

export type NetworkSpy = {
  requests: DressUpNetworkProbe[];
  restore: () => void;
};

/**
 * Test helper: wrap window.fetch and record outbound requests.
 * Production Magic Dress-Up never installs this — unit/e2e only.
 */
export function installDressUpNetworkSpy(): NetworkSpy {
  const requests: DressUpNetworkProbe[] = [];
  const original = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const method = (init?.method ?? "GET").toUpperCase();
    let bodyKind: DressUpNetworkProbe["bodyKind"] = "unknown";
    const body = init?.body;
    if (typeof Blob !== "undefined" && body instanceof Blob) bodyKind = "blob";
    else if (body instanceof ArrayBuffer) bodyKind = "arraybuffer";
    else if (typeof FormData !== "undefined" && body instanceof FormData) bodyKind = "formdata";
    else if (typeof body === "string") {
      try {
        JSON.parse(body);
        bodyKind = "json";
      } catch {
        bodyKind = "text";
      }
    }
    requests.push({ url, method, bodyKind });
    return original(input, init);
  };

  return {
    requests,
    restore: () => {
      window.fetch = original;
    },
  };
}

export function assertNoCameraExfiltration(requests: DressUpNetworkProbe[]): void {
  for (const req of requests) {
    if (looksLikeCameraExfiltration(req)) {
      throw new Error(`Suspicious dress-up network request: ${req.method} ${req.url}`);
    }
  }
}
