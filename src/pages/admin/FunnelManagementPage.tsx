import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReactFlow,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  Background,
  Controls,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  eventApi,
  FILTER_OP_LABELS,
  type FunnelTreeNodeDef,
  type FunnelTreeNodeResult,
  type StepFilter,
  type FilterOp,
} from "../../services/api/api.event";

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Constants                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

const ALL_OPS = Object.keys(FILTER_OP_LABELS) as FilterOp[];
const MULTI_VALUE_OPS = new Set<FilterOp>(["in", "not_in"]);
const NO_VALUE_OPS = new Set<FilterOp>(["exists", "not_exists"]);

let _nextId = 1;
const makeId = () => `n-${_nextId++}`;

type TreeNode = FunnelTreeNodeDef & { _id: string };

const mkNode = (
  parentId: string | null,
  eventName = "",
  filters: StepFilter[] = [],
): TreeNode => {
  const _id = makeId();
  return { _id, id: _id, parentId, eventName, filters };
};

/* ─── Preset funnels (flat tree arrays) ───────────────────────────────────── */

const buildPreset = (
  defs: { parentIdx: number | null; eventName: string }[],
): TreeNode[] => {
  const nodes: TreeNode[] = [];
  for (const d of defs) {
    const parentId = d.parentIdx === null ? null : nodes[d.parentIdx]._id;
    nodes.push(mkNode(parentId, d.eventName));
  }
  return nodes;
};

const PRESETS: Record<string, () => TreeNode[]> = {
  "Purchase Funnel": () =>
    buildPreset([
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "view_product" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 2, eventName: "begin_checkout" },
      { parentIdx: 3, eventName: "purchase" },
    ]),
  "Search \u2192 Buy": () =>
    buildPreset([
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "search" },
      { parentIdx: 1, eventName: "view_product" },
      { parentIdx: 2, eventName: "add_to_cart" },
      { parentIdx: 3, eventName: "purchase" },
    ]),
  "Cart vs Wishlist": () =>
    buildPreset([
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "view_product" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 1, eventName: "wishlist" },
      { parentIdx: 2, eventName: "begin_checkout" },
      { parentIdx: 4, eventName: "purchase" },
    ]),
  "Multi-path Conversion": () =>
    buildPreset([
      { parentIdx: null, eventName: "page_view" },
      { parentIdx: 0, eventName: "view_product" },
      { parentIdx: 0, eventName: "search" },
      { parentIdx: 1, eventName: "add_to_cart" },
      { parentIdx: 2, eventName: "view_product" },
      { parentIdx: 3, eventName: "purchase" },
      { parentIdx: 4, eventName: "add_to_cart" },
      { parentIdx: 6, eventName: "purchase" },
    ]),
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Tree helpers                                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */

const getChildren = (nodes: TreeNode[], parentId: string | null) =>
  nodes.filter((n) => n.parentId === parentId);

const getDescendantIds = (nodes: TreeNode[], nodeId: string): string[] => {
  const ids: string[] = [nodeId];
  const stack = [nodeId];
  while (stack.length) {
    const pid = stack.pop()!;
    for (const n of nodes) {
      if (n.parentId === pid) {
        ids.push(n._id);
        stack.push(n._id);
      }
    }
  }
  return ids;
};

const getDepth = (nodes: TreeNode[], nodeId: string): number => {
  let d = 0;
  let cur = nodes.find((n) => n._id === nodeId);
  while (cur?.parentId) {
    d++;
    cur = nodes.find((n) => n._id === cur!.parentId);
  }
  return d;
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  React Flow — Funnel chart nodes                                           */
/* ═══════════════════════════════════════════════════════════════════════════ */

type StepNodeData = {
  label: string;
  count: number;
  depth: number;
  rate: string;
  dropoff: string;
  hasParent: boolean;
  hasChildren: boolean;
  isRoot: boolean;
};

const STEP_W = 220;
const STEP_H = 72;

const ACCENT = "#db4444";
const ACCENT_LIGHT = "#db444418";

const StepNode = memo(({ data }: NodeProps<Node<StepNodeData>>) => {
  const { label, count, rate, dropoff, hasParent, hasChildren, isRoot } = data;
  return (
    <div
      className="rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing select-none bg-white"
      style={{ width: STEP_W, borderColor: ACCENT + "40" }}
    >
      {hasParent && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            width: 8,
            height: 8,
            background: ACCENT,
            border: `2px solid ${ACCENT}`,
            top: -4,
          }}
        />
      )}
      {hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            width: 8,
            height: 8,
            background: ACCENT,
            border: `2px solid ${ACCENT}`,
            bottom: -4,
          }}
        />
      )}
      {/* Accent top bar */}
      <div className="h-1 rounded-t-lg" style={{ background: ACCENT }} />
      <div className="px-3.5 py-2.5">
        <p
          className="text-[11px] font-medium uppercase tracking-wide truncate"
          style={{ color: ACCENT }}
        >
          {label}
        </p>
        <div className="flex items-end justify-between mt-1">
          <span className="text-xl font-bold text-gray-800 leading-none">
            {count.toLocaleString()}
          </span>
          {!isRoot && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              <span className="text-emerald-600">{rate}%</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">-{dropoff}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
StepNode.displayName = "StepNode";

const flowNodeTypes = { step: StepNode };

/* ─── Tree layout algorithm ───────────────────────────────────────────────── */

const H_GAP = 50;
const V_GAP = 70;
const LEVEL_H = STEP_H + V_GAP;

type LayoutPos = { x: number; y: number };

function computeTreeLayout(results: FunnelTreeNodeResult[]) {
  const childrenMap = new Map<string | "ROOT", FunnelTreeNodeResult[]>();

  for (const r of results) {
    const key = r.parentId ?? "ROOT";
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(r);
  }

  const root = results.find((r) => r.parentId === null);
  if (!root) return { nodes: [] as Node[], edges: [] as Edge[] };

  const widthCache = new Map<string, number>();
  const calcWidth = (id: string): number => {
    if (widthCache.has(id)) return widthCache.get(id)!;
    const ch = childrenMap.get(id) || [];
    if (ch.length === 0) {
      widthCache.set(id, STEP_W);
      return STEP_W;
    }
    const w =
      ch.reduce((s, c) => s + calcWidth(c.id), 0) + H_GAP * (ch.length - 1);
    widthCache.set(id, w);
    return w;
  };
  calcWidth(root.id);

  const positions = new Map<string, LayoutPos>();
  const assignPos = (id: string, x: number, y: number) => {
    const w = widthCache.get(id) || STEP_W;
    positions.set(id, { x: x + w / 2 - STEP_W / 2, y });
    const ch = childrenMap.get(id) || [];
    let sx = x;
    for (const c of ch) {
      assignPos(c.id, sx, y + LEVEL_H);
      sx += (widthCache.get(c.id) || STEP_W) + H_GAP;
    }
  };
  assignPos(root.id, 0, 0);

  const flowNodes: Node[] = [];
  const flowEdges: Edge[] = [];

  for (const r of results) {
    const pos = positions.get(r.id);
    if (!pos) continue;
    const ch = childrenMap.get(r.id) || [];

    flowNodes.push({
      id: r.id,
      type: "step",
      position: pos,
      data: {
        label: r.step,
        count: r.count,
        depth: r.depth,
        rate: r.rate,
        dropoff: r.dropoff,
        hasParent: r.parentId !== null,
        hasChildren: ch.length > 0,
        isRoot: r.parentId === null,
      },
    });

    for (const c of ch) {
      flowEdges.push({
        id: `e-${r.id}-${c.id}`,
        source: r.id,
        target: c.id,
        type: "default",
        style: { stroke: ACCENT + "60", strokeWidth: 2 },
      });
    }
  }

  return { nodes: flowNodes, edges: flowEdges };
}

const FunnelFlowChart = ({
  results,
  queryKey,
}: {
  results: FunnelTreeNodeResult[];
  queryKey: number;
}) => {
  const { nodes, edges } = useMemo(() => computeTreeLayout(results), [results]);
  const maxDepth = results.reduce((m, r) => Math.max(m, r.depth), 0);
  const flowHeight = Math.max(420, (maxDepth + 1) * LEVEL_H + 100);

  return (
    <div
      style={{ height: flowHeight, width: "100%" }}
      className="rounded-lg overflow-hidden"
    >
      <ReactFlow
        key={queryKey}
        defaultNodes={nodes}
        defaultEdges={edges}
        nodeTypes={flowNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#e2e8f0"
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Tag Input                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

const TagInput = ({
  values,
  suggestions,
  onChange,
  placeholder,
}: {
  values: string[];
  suggestions: any[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) => {
  const [input, setInput] = useState("");
  const listId = useMemo(
    () => `tag-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  const addTag = (val: string) => {
    const v = val.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border border-gray-200 rounded-lg px-2.5 py-1.5 min-w-45 bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition">
      {values.map((v, i) => (
        <span
          key={`${v}-${i}`}
          className="inline-flex items-center gap-1 bg-indigo-500 text-white text-xs font-medium rounded-md px-2 py-0.5"
        >
          {v}
          <button
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="hover:text-indigo-200 text-[10px] leading-none ml-0.5"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        type="text"
        list={listId}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag(input);
          }
        }}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={values.length === 0 ? placeholder || "Type + Enter" : ""}
        className="flex-1 min-w-20 text-xs outline-none bg-transparent py-0.5"
      />
      <datalist id={listId}>
        {suggestions
          .filter((s) => !values.includes(String(s)))
          .map((s) => (
            <option key={String(s)} value={String(s)} />
          ))}
      </datalist>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Filter Row                                                                */
/* ═══════════════════════════════════════════════════════════════════════════ */

const FilterRow = ({
  filter,
  paramKeys,
  onUpdate,
  onRemove,
  onLoadValues,
  valueSuggestions,
}: {
  filter: StepFilter;
  paramKeys: string[];
  onUpdate: (f: StepFilter) => void;
  onRemove: () => void;
  onLoadValues: (field: string) => void;
  valueSuggestions: any[];
}) => {
  const needsNoValue = NO_VALUE_OPS.has(filter.op);
  const needsMulti = MULTI_VALUE_OPS.has(filter.op);

  return (
    <div className="flex flex-wrap items-center gap-2 py-1.5">
      <input
        type="text"
        list="param-keys-list"
        value={filter.field}
        onChange={(e) => {
          onUpdate({ ...filter, field: e.target.value });
          if (e.target.value) onLoadValues(e.target.value);
        }}
        placeholder="field"
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs w-36 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
      />
      <datalist id="param-keys-list">
        {paramKeys.map((k) => (
          <option key={k} value={k} />
        ))}
      </datalist>

      <select
        value={filter.op}
        onChange={(e) => {
          const newOp = e.target.value as FilterOp;
          const nf = { ...filter, op: newOp };
          if (NO_VALUE_OPS.has(newOp)) {
            nf.value = undefined;
          } else if (
            MULTI_VALUE_OPS.has(newOp) &&
            !Array.isArray(filter.value)
          ) {
            nf.value = filter.value ? [String(filter.value)] : [];
          } else if (
            !MULTI_VALUE_OPS.has(newOp) &&
            Array.isArray(filter.value)
          ) {
            nf.value = filter.value[0] || "";
          }
          onUpdate(nf);
        }}
        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition bg-white"
      >
        {ALL_OPS.map((op) => (
          <option key={op} value={op}>
            {FILTER_OP_LABELS[op]}
          </option>
        ))}
      </select>

      {!needsNoValue &&
        (needsMulti ? (
          <TagInput
            values={Array.isArray(filter.value) ? filter.value.map(String) : []}
            suggestions={valueSuggestions}
            onChange={(vals) => onUpdate({ ...filter, value: vals })}
            placeholder="add values..."
          />
        ) : (
          <input
            type="text"
            value={filter.value ?? ""}
            onChange={(e) => onUpdate({ ...filter, value: e.target.value })}
            onFocus={() => filter.field && onLoadValues(filter.field)}
            list="param-values-list"
            placeholder="value"
            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs w-36 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
          />
        ))}

      <button
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 p-1 rounded transition"
        title="Remove filter"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Tree Node Card                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */

const TreeNodeCard = ({
  node,
  depth,
  siblingIndex,
  siblingCount,
  eventNames,
  onUpdate,
  onRemove,
  onAddChild,
  onMove,
}: {
  node: TreeNode;
  depth: number;
  siblingIndex: number;
  siblingCount: number;
  eventNames: string[];
  onUpdate: (n: TreeNode) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
}) => {
  const [paramKeys, setParamKeys] = useState<string[]>([]);
  const [valueSuggestions, setValueSuggestions] = useState<
    Record<string, any[]>
  >({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (node.eventName) {
      eventApi
        .getParamKeys(node.eventName)
        .then((r) => setParamKeys(r.paramKeys))
        .catch(() => {});
    }
  }, [node.eventName]);

  const loadValues = useCallback(
    (field: string) => {
      if (valueSuggestions[field] || !node.eventName) return;
      eventApi
        .getParamValues(node.eventName, field)
        .then((r) =>
          setValueSuggestions((prev) => ({ ...prev, [field]: r.values })),
        )
        .catch(() => {});
    },
    [node.eventName, valueSuggestions],
  );

  const addFilter = () =>
    onUpdate({
      ...node,
      filters: [...node.filters, { field: "", op: "in", value: [] }],
    });

  const updateFilter = (idx: number, f: StepFilter) => {
    const filters = [...node.filters];
    filters[idx] = f;
    onUpdate({ ...node, filters });
  };

  const removeFilter = (idx: number) =>
    onUpdate({
      ...node,
      filters: node.filters.filter((_, i) => i !== idx),
    });

  const isRoot = depth === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15 }}
      className="relative"
      style={{ paddingLeft: depth * 24 }}
    >
      {/* Depth connector line */}
      {depth > 0 && (
        <div
          className="absolute top-0 bottom-0 border-l border-gray-200"
          style={{ left: (depth - 1) * 24 + 11 }}
        />
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          {/* Depth badge */}
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 rounded w-5 h-5 flex items-center justify-center shrink-0">
            {depth}
          </span>

          {/* Event name input */}
          <div className="flex-1">
            <input
              type="text"
              list={`ev-${node._id}`}
              value={node.eventName}
              onChange={(e) => onUpdate({ ...node, eventName: e.target.value })}
              placeholder="Event name..."
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm font-medium w-full max-w-[200px] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
            />
            <datalist id={`ev-${node._id}`}>
              {eventNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>

          {/* Filter count */}
          {node.filters.length > 0 && (
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
              {node.filters.length}f
            </span>
          )}

          {/* Chevron: expand filters */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
            title={expanded ? "Collapse" : "Expand filters"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Add child */}
          <button
            onClick={() => onAddChild(node._id)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            title="Add child step"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
          </button>

          {/* Move up */}
          {siblingCount > 1 && siblingIndex > 0 && (
            <button
              onClick={() => onMove(node._id, "up")}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
              title="Move up"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          )}

          {/* Move down */}
          {siblingCount > 1 && siblingIndex < siblingCount - 1 && (
            <button
              onClick={() => onMove(node._id, "down")}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"
              title="Move down"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}

          {/* Remove */}
          {!isRoot && (
            <button
              onClick={() => onRemove(node._id)}
              className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
              title="Remove (and children)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
        </div>

        {/* Filters panel */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-50"
            >
              <div className="px-3 py-2.5 bg-gray-50/50">
                {node.filters.length > 0 && (
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                    Filters
                  </p>
                )}
                {node.filters.map((f, fi) => (
                  <FilterRow
                    key={fi}
                    filter={f}
                    paramKeys={paramKeys}
                    onUpdate={(nf) => updateFilter(fi, nf)}
                    onRemove={() => removeFilter(fi)}
                    onLoadValues={loadValues}
                    valueSuggestions={valueSuggestions[f.field] || []}
                  />
                ))}
                <button
                  onClick={addFilter}
                  className="mt-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
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
                  Add filter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Recursive Tree Builder                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

const TreeBuilder = ({
  nodes,
  parentId,
  eventNames,
  onUpdate,
  onRemove,
  onAddChild,
  onMove,
}: {
  nodes: TreeNode[];
  parentId: string | null;
  eventNames: string[];
  onUpdate: (n: TreeNode) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onMove: (id: string, dir: "up" | "down") => void;
}) => {
  const children = getChildren(nodes, parentId);

  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {children.map((child, i) => {
          const depth = getDepth(nodes, child._id);
          return (
            <div key={child._id}>
              <TreeNodeCard
                node={child}
                depth={depth}
                siblingIndex={i}
                siblingCount={children.length}
                eventNames={eventNames}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddChild={onAddChild}
                onMove={onMove}
              />
              {/* Recurse into children */}
              <TreeBuilder
                nodes={nodes}
                parentId={child._id}
                eventNames={eventNames}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddChild={onAddChild}
                onMove={onMove}
              />
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  Main Page                                                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

const FunnelManagementPage = () => {
  const [eventNames, setEventNames] = useState<string[]>([]);
  const [nodes, setNodes] = useState<TreeNode[]>(PRESETS["Purchase Funnel"]());
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [results, setResults] = useState<FunnelTreeNodeResult[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [queryKey, setQueryKey] = useState(0);

  useEffect(() => {
    eventApi
      .getEventNames()
      .then((r) => setEventNames(r.eventNames))
      .catch(() => {});
  }, []);

  /* ─── Node operations ──────────────────────────────────────────────────── */

  const updateNode = useCallback((updated: TreeNode) => {
    setNodes((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes((prev) => {
      const toRemove = new Set(getDescendantIds(prev, nodeId));
      return prev.filter((n) => !toRemove.has(n._id));
    });
  }, []);

  const addChild = useCallback((parentId: string) => {
    setNodes((prev) => [...prev, mkNode(parentId)]);
  }, []);

  const moveSibling = useCallback((nodeId: string, dir: "up" | "down") => {
    setNodes((prev) => {
      const node = prev.find((n) => n._id === nodeId);
      if (!node) return prev;
      const siblings = prev.filter((n) => n.parentId === node.parentId);
      const sibIdx = siblings.findIndex((s) => s._id === nodeId);
      const swapIdx = dir === "up" ? sibIdx - 1 : sibIdx + 1;
      if (swapIdx < 0 || swapIdx >= siblings.length) return prev;
      const swapNode = siblings[swapIdx];
      const mainA = prev.findIndex((n) => n._id === nodeId);
      const mainB = prev.findIndex((n) => n._id === swapNode._id);
      const next = [...prev];
      [next[mainA], next[mainB]] = [next[mainB], next[mainA]];
      return next;
    });
  }, []);

  const applyPreset = useCallback((name: string) => {
    const fn = PRESETS[name];
    if (fn) {
      setNodes(fn());
      setResults([]);
    }
  }, []);

  /* ─── Query ─────────────────────────────────────────────────────────────── */

  const validNodeCount = nodes.filter((n) => n.eventName.trim()).length;

  const runQuery = useCallback(async () => {
    if (validNodeCount < 2) return;
    setLoading(true);
    try {
      const body = {
        nodes: nodes
          .filter((n) => n.eventName.trim())
          .map((n) => ({
            id: n._id,
            parentId: n.parentId,
            eventName: n.eventName,
            filters: n.filters,
          })),
        from: fromDate ? new Date(fromDate).getTime() : undefined,
        to: toDate ? new Date(toDate + "T23:59:59").getTime() : undefined,
      };
      const res = await eventApi.queryFunnelTree(body);
      setResults(res.nodes);
      setTotalUsers(res.totalUsers);
      setQueryKey((k) => k + 1);
    } catch (err) {
      console.error("Funnel tree query failed:", err);
    } finally {
      setLoading(false);
    }
  }, [nodes, fromDate, toDate, validNodeCount]);

  /* ─── Stats helpers ─────────────────────────────────────────────────────── */

  const leafNodes = useMemo(() => {
    const parentIds = new Set(results.map((r) => r.id));
    return results.filter((r) => !results.some((c) => c.parentId === r.id));
  }, [results]);

  const branchCount = useMemo(() => {
    return results.filter(
      (r) => results.filter((c) => c.parentId === r.id).length > 1,
    ).length;
  }, [results]);

  /* ─── Render ────────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Funnel Analysis
            </h1>
            <p className="text-gray-500 mt-1">
              Build branching funnel trees to compare multiple conversion paths
              side-by-side.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runQuery}
            disabled={validNodeCount < 2 || loading}
            className="flex items-center justify-center gap-2 bg-button2 hover:bg-hoverButton text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    opacity="0.25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Run Query
              </>
            )}
          </motion.button>
        </div>

        {/* Controls bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3"
        >
          <span className="text-sm font-medium text-gray-600 shrink-0">
            Time range
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
          />
          <span className="text-gray-400 text-sm">&rarr;</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 outline-none transition"
          />

          <div className="hidden sm:block w-px h-6 bg-gray-200 mx-2" />

          <span className="text-sm font-medium text-gray-600 shrink-0">
            Presets
          </span>
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
            >
              {name}
            </button>
          ))}
        </motion.div>

        {/* Tree builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Funnel Tree
            </h2>
            <span className="text-xs text-gray-400">
              {nodes.length} node{nodes.length !== 1 ? "s" : ""} &bull; Click
              &ldquo;+&rdquo; on any step to branch
            </span>
          </div>

          <TreeBuilder
            nodes={nodes}
            parentId={null}
            eventNames={eventNames}
            onUpdate={updateNode}
            onRemove={removeNode}
            onAddChild={addChild}
            onMove={moveSibling}
          />
        </motion.div>

        {/* ─── Results ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* Funnel tree chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-base font-semibold text-gray-700 mb-4">
                  Conversion Tree
                </h3>
                <FunnelFlowChart results={results} queryKey={queryKey} />
              </div>

              {/* Step details table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-700">
                    Node Details
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80">
                        <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">
                          Depth
                        </th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">
                          Event
                        </th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">
                          Parent
                        </th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">
                          Filters
                        </th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">
                          Users
                        </th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">
                          Rate
                        </th>
                        <th className="text-right py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider">
                          Drop
                        </th>
                        <th className="text-left py-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider w-36">
                          Bar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {results.map((r) => {
                        const maxCount = results[0]?.count || 1;
                        const barW =
                          maxCount > 0 ? (r.count / maxCount) * 100 : 0;
                        const parentName = r.parentId
                          ? results.find((p) => p.id === r.parentId)?.step ||
                            "\u2014"
                          : "\u2014";
                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-bold text-white rounded-full w-5 h-5 inline-flex items-center justify-center bg-gray-500">
                                {r.depth}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-gray-700">
                              {r.step}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-xs">
                              {parentName}
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-500 max-w-[180px]">
                              {r.filters && r.filters.length > 0
                                ? r.filters.map((f, fi) => (
                                    <span
                                      key={fi}
                                      className="inline-block bg-gray-100 rounded-md px-1.5 py-0.5 mr-1 mb-0.5"
                                    >
                                      {f.field}{" "}
                                      <span className="text-gray-400">
                                        {FILTER_OP_LABELS[f.op]}
                                      </span>{" "}
                                      {!NO_VALUE_OPS.has(f.op) && (
                                        <span className="font-medium">
                                          {Array.isArray(f.value)
                                            ? f.value.join(", ")
                                            : String(f.value ?? "")}
                                        </span>
                                      )}
                                    </span>
                                  ))
                                : "\u2014"}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-gray-700">
                              {r.count.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                              {r.rate}%
                            </td>
                            <td className="py-3 px-4 text-right text-red-500 font-medium">
                              {r.parentId === null ? "\u2014" : `${r.dropoff}%`}
                            </td>
                            <td className="py-3 px-4">
                              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${barW}%` }}
                                  transition={{
                                    duration: 0.6,
                                    delay: r.depth * 0.1,
                                  }}
                                  className="h-full rounded-full bg-gray-400"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No funnel data yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Build your funnel tree above and click &quot;Run Query&quot; to
              analyze conversion paths.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FunnelManagementPage;
