export const getImeiList = (imeiInputs: string[]): string[] =>
  imeiInputs.map((imei) => imei.trim()).filter(Boolean);

export const hasCommaSeparatedImei = (imeiInputs: string[]): boolean =>
  imeiInputs.some((imei) => imei.includes(","));

export const getDerivedQuantity = (imeiInputs: string[]): number =>
  getImeiList(imeiInputs).length;

export const getCellStringValue = (
  row: Record<string, unknown>,
  keys: string[],
): string => {
  for (const key of keys) {
    const value = row[key];
    if (value === undefined || value === null) continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
};

export const normalizeText = (value: string): string =>
  value.normalize("NFC").trim().toLowerCase();

export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  file.arrayBuffer();
