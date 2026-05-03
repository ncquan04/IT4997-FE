import { useState, type JSX } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "../../navigation";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Types                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

export interface SavedFunnel {
  id: string;
  name: string;
  description: string;
  steps: { eventName: string; parentIdx: number | null }[];
  icon: string; // emoji
  color: string; // tailwind bg class
  category: "sample" | "custom";
  createdAt: string;
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Sample Funnels                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

export const SAMPLE_FUNNELS: SavedFunnel[] = [
  {
    id: "purchase-funnel",
    name: "Purchase Funnel",
    description:
      "Track the full journey from page view → view product → add to cart → checkout → successful purchase",
    steps: [
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "view_product" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 2, eventName: "begin_checkout" },
      { parentIdx: 3, eventName: "purchase" },
    ],
    icon: "🛒",
    color: "bg-emerald-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "search-to-buy",
    name: "Search → Buy",
    description:
      "Analyze conversion from search to purchase: search → view product → add to cart → buy",
    steps: [
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "search" },
      { parentIdx: 1, eventName: "view_product" },
      { parentIdx: 2, eventName: "add_to_cart" },
      { parentIdx: 3, eventName: "purchase" },
    ],
    icon: "🔍",
    color: "bg-blue-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "cart-vs-wishlist",
    name: "Cart vs Wishlist",
    description:
      "Compare two behavior branches: users adding to cart vs adding to wishlist after viewing a product",
    steps: [
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "view_product" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 1, eventName: "add_to_wishlist" },
      { parentIdx: 2, eventName: "begin_checkout" },
      { parentIdx: 4, eventName: "purchase" },
    ],
    icon: "⚖️",
    color: "bg-violet-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "multi-path-conversion",
    name: "Multi-path Conversion",
    description:
      "Branching funnel: compare conversion between direct product viewers vs search-first users",
    steps: [
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "view_product" },
      { parentIdx: 0, eventName: "search" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 2, eventName: "view_product" },
      { parentIdx: 3, eventName: "purchase" },
      { parentIdx: 4, eventName: "add_to_cart" },
      { parentIdx: 6, eventName: "purchase" },
    ],
    icon: "🌳",
    color: "bg-amber-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "signup-to-purchase",
    name: "Sign Up → Purchase",
    description:
      "Track new signups: from account registration → view product → add to cart → first purchase",
    steps: [
      { parentIdx: null, eventName: "sign_up" },
      { parentIdx: 0, eventName: "view_product" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 2, eventName: "begin_checkout" },
      { parentIdx: 3, eventName: "purchase" },
    ],
    icon: "🆕",
    color: "bg-pink-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "category-browse-funnel",
    name: "Category Browse → Buy",
    description:
      "Analyze the journey from browsing categories → selecting a product → add to cart → checkout",
    steps: [
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "view_category" },
      { parentIdx: 1, eventName: "select_item" },
      { parentIdx: 2, eventName: "view_product" },
      { parentIdx: 3, eventName: "add_to_cart" },
      { parentIdx: 4, eventName: "purchase" },
    ],
    icon: "📂",
    color: "bg-cyan-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "cart-abandonment",
    name: "Cart Abandonment",
    description:
      "Measure cart abandonment rate: view_cart → begin_checkout → purchase (see drop-off at each step)",
    steps: [
      { parentIdx: null, eventName: "add_to_cart" },
      { parentIdx: 0, eventName: "view_cart" },
      { parentIdx: 1, eventName: "begin_checkout" },
      { parentIdx: 2, eventName: "purchase" },
    ],
    icon: "🚪",
    color: "bg-red-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "wishlist-conversion",
    name: "Wishlist → Purchase",
    description:
      "Track wishlist conversion: add to wishlist → view wishlist → add to cart → purchase",
    steps: [
      { parentIdx: null, eventName: "add_to_wishlist" },
      { parentIdx: 0, eventName: "view_wishlist" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 2, eventName: "begin_checkout" },
      { parentIdx: 3, eventName: "purchase" },
    ],
    icon: "💝",
    color: "bg-rose-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "coupon-effectiveness",
    name: "Coupon Effectiveness",
    description:
      "Measure coupon effectiveness: begin_checkout → apply_coupon → purchase",
    steps: [
      { parentIdx: null, eventName: "begin_checkout" },
      { parentIdx: 0, eventName: "apply_coupon" },
      { parentIdx: 1, eventName: "purchase" },
    ],
    icon: "🎟️",
    color: "bg-orange-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
  {
    id: "variant-selection-impact",
    name: "Variant Selection → Buy",
    description:
      "Analyze variant selection impact: view_product → select_variant → add_to_cart → purchase",
    steps: [
      { parentIdx: null, eventName: "view_product" },
      { parentIdx: 0, eventName: "select_variant" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 2, eventName: "begin_checkout" },
      { parentIdx: 3, eventName: "purchase" },
    ],
    icon: "🎨",
    color: "bg-indigo-500",
    category: "sample",
    createdAt: "2026-01-01",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Storage helpers                                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "saved_funnels";

export function getSavedFunnels(): SavedFunnel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFunnel(funnel: SavedFunnel) {
  const existing = getSavedFunnels();
  const idx = existing.findIndex((f) => f.id === funnel.id);
  if (idx >= 0) existing[idx] = funnel;
  else existing.push(funnel);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function deleteSavedFunnel(id: string) {
  const existing = getSavedFunnels().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Funnel Icon                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

const FUNNEL_ICONS: Record<
  string,
  { bg: string; stroke: string; path: JSX.Element }
> = {
  "purchase-funnel": {
    bg: "bg-emerald-50",
    stroke: "#10b981",
    path: (
      <>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
  },
  "search-to-buy": {
    bg: "bg-blue-50",
    stroke: "#3b82f6",
    path: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  "cart-vs-wishlist": {
    bg: "bg-violet-50",
    stroke: "#8b5cf6",
    path: (
      <>
        <path d="M16 3h5v5" />
        <path d="M8 3H3v5" />
        <line x1="21" y1="3" x2="14" y2="10" />
        <line x1="3" y1="3" x2="10" y2="10" />
        <path d="M21 21H3" />
        <path d="M12 12v9" />
      </>
    ),
  },
  "multi-path-conversion": {
    bg: "bg-amber-50",
    stroke: "#f59e0b",
    path: (
      <>
        <circle cx="12" cy="5" r="3" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="12" x2="6" y2="18" />
        <line x1="12" y1="12" x2="18" y2="18" />
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </>
    ),
  },
  "signup-to-purchase": {
    bg: "bg-pink-50",
    stroke: "#ec4899",
    path: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </>
    ),
  },
  "category-browse-funnel": {
    bg: "bg-cyan-50",
    stroke: "#06b6d4",
    path: (
      <>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </>
    ),
  },
  "cart-abandonment": {
    bg: "bg-red-50",
    stroke: "#ef4444",
    path: (
      <>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        <line x1="10" y1="9" x2="17" y2="9" />
      </>
    ),
  },
  "wishlist-conversion": {
    bg: "bg-rose-50",
    stroke: "#f43f5e",
    path: (
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    ),
  },
  "coupon-effectiveness": {
    bg: "bg-orange-50",
    stroke: "#f97316",
    path: (
      <>
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
      </>
    ),
  },
  "variant-selection-impact": {
    bg: "bg-indigo-50",
    stroke: "#6366f1",
    path: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
  },
};

const FunnelIcon = ({
  funnelId,
  emoji,
}: {
  funnelId: string;
  emoji: string;
}) => {
  const icon = FUNNEL_ICONS[funnelId];
  if (!icon) {
    return (
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-base">
        {emoji}
      </div>
    );
  }
  return (
    <div
      className={`w-9 h-9 rounded-lg ${icon.bg} flex items-center justify-center`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={icon.stroke}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon.path}
      </svg>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Funnel Card                                                               */
/* ═══════════════════════════════════════════════════════════════════════════ */

const FunnelCard = ({
  funnel,
  index,
  onSelect,
  onDelete,
}: {
  funnel: SavedFunnel;
  index: number;
  onSelect: () => void;
  onDelete?: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onSelect}
      className="group bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
    >
      {/* Icon */}
      <div className="mb-3">
        <FunnelIcon funnelId={funnel.id} emoji={funnel.icon} />
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-800 text-sm mb-1">
        {funnel.name}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
        {funnel.description}
      </p>

      {/* Step flow */}
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {funnel.steps.slice(0, 4).map((step, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-gray-600 bg-gray-100 rounded px-1.5 py-0.5">
              {step.eventName}
            </span>
            {idx < Math.min(funnel.steps.length - 1, 3) && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-300"
              >
                <polyline
                  points="9 18 15 12 9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        ))}
        {funnel.steps.length > 4 && (
          <span className="text-[10px] text-gray-400">
            +{funnel.steps.length - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">
          {funnel.steps.length} steps
          {funnel.category === "custom" &&
            ` • ${new Date(funnel.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
        </span>
        <div className="flex items-center gap-1.5">
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              title="Delete funnel"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
          <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
            Open →
          </span>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Page Component                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

const FunnelListPage = () => {
  const navigate = useNavigate();
  const [customFunnels, setCustomFunnels] =
    useState<SavedFunnel[]>(getSavedFunnels);

  const handleSelect = (funnel: SavedFunnel) => {
    navigate(`${AppRoutes.ADMIN_FUNNEL}/${funnel.id}`);
  };

  const handleCreateNew = () => {
    navigate(`${AppRoutes.ADMIN_FUNNEL}/new`);
  };

  const handleDelete = (id: string) => {
    deleteSavedFunnel(id);
    setCustomFunnels(getSavedFunnels());
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Funnel Analysis
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Select a template or create a custom funnel to analyze conversion
              paths.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-button2 hover:bg-hoverButton text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New Funnel
          </button>
        </div>

        {/* Saved Funnels */}
        {customFunnels.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
              Saved Funnels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {customFunnels.map((funnel, i) => (
                <FunnelCard
                  key={funnel.id}
                  funnel={funnel}
                  index={i}
                  onSelect={() => handleSelect(funnel)}
                  onDelete={() => handleDelete(funnel.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sample Funnels */}
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {SAMPLE_FUNNELS.map((funnel, i) => (
              <FunnelCard
                key={funnel.id}
                funnel={funnel}
                index={i}
                onSelect={() => handleSelect(funnel)}
              />
            ))}
          </div>
        </section>

        {/* Empty state */}
        {customFunnels.length === 0 && (
          <div className="mt-8 text-center py-6 border border-dashed border-gray-200 rounded-xl">
            <p className="text-sm text-gray-400">
              No saved funnels yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelListPage;
