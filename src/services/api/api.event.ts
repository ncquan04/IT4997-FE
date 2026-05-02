import { Contacts } from "../../shared/contacts";
import { apiService } from "./index";

const BASE = Contacts.EVENT_PATH;

// ─── Types ───────────────────────────────────────────────────────────────────

export type FilterOp =
  | "in"
  | "not_in"
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "exists"
  | "not_exists";

export const FILTER_OP_LABELS: Record<FilterOp, string> = {
  in: "In",
  not_in: "Not In",
  eq: "Equal",
  neq: "Not Equal",
  gt: "Greater Than",
  gte: "Greater or Equal",
  lt: "Less Than",
  lte: "Less or Equal",
  exists: "Exists",
  not_exists: "Not Exists",
};

export interface StepFilter {
  field: string;
  op: FilterOp;
  value?: any; // string | number | string[]
}

export interface FunnelStepDef {
  eventName: string;
  filters: StepFilter[];
}

export interface FunnelStep {
  step: string;
  index: number;
  count: number;
  rate: string;
  dropoff: string;
  filters: StepFilter[];
}

export interface FunnelResponse {
  steps: string[];
  from: string;
  to: string;
  totalUsers: number;
  funnel: FunnelStep[];
}

export interface FunnelQueryBody {
  steps: FunnelStepDef[];
  from?: number; // Unix ms
  to?: number; // Unix ms
}

// ─── Branching tree funnel ───────────────────────────────────────────────────

export interface FunnelTreeNodeDef {
  id: string;
  parentId: string | null;
  eventName: string;
  filters: StepFilter[];
}

export interface FunnelTreeNodeResult {
  id: string;
  parentId: string | null;
  step: string;
  count: number;
  depth: number;
  rate: string;
  dropoff: string;
  filters: StepFilter[];
}

export interface FunnelTreeResponse {
  nodes: FunnelTreeNodeResult[];
  totalUsers: number;
  from: string;
  to: string;
}

export interface FunnelTreeQueryBody {
  nodes: FunnelTreeNodeDef[];
  from?: number;
  to?: number;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

export const eventApi = {
  queryFunnel: (body: FunnelQueryBody) =>
    apiService.post<FunnelResponse>(`${BASE}/funnel`, body),

  queryFunnelTree: (body: FunnelTreeQueryBody) =>
    apiService.post<FunnelTreeResponse>(`${BASE}/funnel-tree`, body),

  getEventNames: () =>
    apiService.get<{ eventNames: string[] }>(`${BASE}/names`),

  getParamKeys: (eventName: string) =>
    apiService.get<{ paramKeys: string[] }>(`${BASE}/param-keys`, {
      params: { eventName },
    }),

  getParamValues: (eventName: string, field: string) =>
    apiService.get<{ values: any[] }>(`${BASE}/param-values`, {
      params: { eventName, field },
    }),
};
