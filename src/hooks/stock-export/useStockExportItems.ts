import { useRef, useState } from "react";
import type {
  ImeiEntry,
  StockExportGroup,
} from "../../components/admin/stock-export-form/types";
import type { IImeiLookupResult } from "../../types/stock-export.types";

interface UseStockExportItemsParams {
  onLookupImei: (imei: string) => Promise<IImeiLookupResult | null>;
}

let _idCounter = 0;
const nextId = () => ++_idCounter;

const createEmptyEntry = (): ImeiEntry => ({
  id: nextId(),
  imei: "",
  status: "idle",
});

export const useStockExportItems = ({
  onLookupImei,
}: UseStockExportItemsParams) => {
  const [entries, setEntries] = useState<ImeiEntry[]>([createEmptyEntry()]);
  const lookupTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {},
  );

  const addEntry = () => {
    setEntries((prev) => [...prev, createEmptyEntry()]);
  };

  const removeEntry = (id: number) => {
    clearTimeout(lookupTimers.current[id]);
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      return next.length === 0 ? [createEmptyEntry()] : next;
    });
  };

  const handleImeiChange = (id: number, value: string) => {
    const trimmed = value.trim();

    if (lookupTimers.current[id]) clearTimeout(lookupTimers.current[id]);

    // Check duplicate among other resolved entries
    setEntries((prev) => {
      const isDuplicate =
        trimmed !== "" &&
        prev.some(
          (e) => e.id !== id && e.imei === trimmed && e.status === "found",
        );

      return prev.map((e) =>
        e.id !== id
          ? e
          : {
              ...e,
              imei: trimmed,
              status: isDuplicate
                ? "error"
                : trimmed === ""
                  ? "idle"
                  : "loading",
              error: isDuplicate ? "IMEI already added" : undefined,
              result: isDuplicate ? undefined : e.result,
            },
      );
    });

    if (trimmed === "") return;

    lookupTimers.current[id] = setTimeout(async () => {
      // Re-check duplicate before sending request
      setEntries((prev) => {
        const isDuplicate = prev.some(
          (e) => e.id !== id && e.imei === trimmed && e.status === "found",
        );
        if (isDuplicate) {
          return prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "error",
                  error: "IMEI already added",
                  result: undefined,
                }
              : e,
          );
        }
        return prev;
      });

      // Perform lookup (we read current state via callback below after async)
      const result = await onLookupImei(trimmed);

      setEntries((prev) => {
        const entry = prev.find((e) => e.id === id);
        // If IMEI field has changed since lookup started, discard result
        if (!entry || entry.imei !== trimmed) return prev;

        if (!result) {
          return prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "error",
                  error: "IMEI not found in this branch's inventory",
                  result: undefined,
                }
              : e,
          );
        }

        // Dedup: if another entry already has this IMEI resolved
        const alreadyFound = prev.some(
          (e) => e.id !== id && e.imei === trimmed && e.status === "found",
        );
        if (alreadyFound) {
          return prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: "error",
                  error: "IMEI already added",
                  result: undefined,
                }
              : e,
          );
        }

        return prev.map((e) =>
          e.id === id ? { ...e, status: "found", result, error: undefined } : e,
        );
      });
    }, 400);
  };

  // Derive grouped items from resolved entries
  const getGroups = (): StockExportGroup[] => {
    const groupMap = new Map<string, StockExportGroup>();
    for (const entry of entries) {
      if (entry.status !== "found" || !entry.result) continue;
      const key = `${entry.result.productId}__${entry.result.variantId}`;
      const existing = groupMap.get(key);
      if (existing) {
        existing.imeis.push(entry.imei);
      } else {
        groupMap.set(key, {
          productId: entry.result.productId,
          variantId: entry.result.variantId,
          productTitle: entry.result.product.title,
          variantName: entry.result.variant.variantName,
          imeis: [entry.imei],
        });
      }
    }
    return Array.from(groupMap.values());
  };

  // Build payload items (deduplicated by group)
  const buildItems = () =>
    getGroups().map((g) => ({
      productId: g.productId,
      variantId: g.variantId,
      imeiList: g.imeis,
    }));

  return {
    entries,
    addEntry,
    removeEntry,
    handleImeiChange,
    getGroups,
    buildItems,
  };
};
