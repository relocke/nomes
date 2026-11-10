import { z } from "zod";

const id = z.string().uuid();
const text = z.string().trim().min(1).max(4000);
const ids = z.array(id).max(30);
const revision = z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/);
const https = z.string().url().max(1000).refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password && !url.hash;
}, "Use an HTTPS reference without credentials or fragment.");
const key = z.string().regex(/^[a-z][a-z0-9-]{0,79}$/);
export const reasoningTargetSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("mission"), field: z.enum(["objective", "goals", "axioms", "limitations"]), itemId: id.optional() }).strict(),
  z.object({ section: z.literal("governance"), field: z.enum(["authority", "rules", "changeProcess", "relationships"]), itemId: id.optional() }).strict(),
  z.object({ section: z.literal("architecture"), field: z.enum(["components", "targets", "supportedChains", "relationships"]), itemId: id.optional() }).strict(),
]);
export const reasoningNodeSchema = z.object({
  id, kind: z.enum(["axiom", "assumption", "argument", "objection", "evidence", "vulnerability"]),
  statement: text, targets: z.array(reasoningTargetSchema).min(1).max(20),
  premises: ids, supports: ids, challenges: ids, evidence: ids,
  status: z.enum(["declared", "disputed", "historical"]),
  explanation: text, reconsiderWhen: z.array(text).min(1).max(10),
  source: z.object({ url: https, revision, supports: text }).strict().optional(),
}).strict();
export const sharedReasoningSchema = z.object({ version: z.literal("1.0.0"), nodes: z.array(reasoningNodeSchema).max(100) }).strict();
export const reasoningPolicySchema = z.object({
  version: z.literal("1.0.0"), authoritySource: z.literal("/governance/authority"),
  publication: z.literal("explicit-user-approval"), adoption: z.literal("maintainer-review"),
  historicalRouting: z.literal("reference-existing-history"),
  truthPolicy: z.literal("consistency-is-not-empirical-proof"),
}).strict();
export const reasoningFunctionSchema = z.object({
  id: key,
  reference: z.object({ url: https, version: z.string().regex(/^\d+\.\d+\.\d+$/), revision, sha256: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  capability: z.literal("nome.reasoning.assess"),
  agents: z.array(key).min(1).max(10), targets: z.array(reasoningTargetSchema).min(1).max(20),
  effects: z.array(z.enum(["read-context", "respond", "reference-history", "prepare-candidate"])).min(1).max(4),
  limits: z.object({ maxContextBytes: z.number().int().min(1).max(64000), maxNodes: z.number().int().min(1).max(100), maxHistoryMessages: z.number().int().min(0).max(8) }).strict(),
}).strict().describe("Pinned declaration only. A host must independently register and authorize a capability; never execute repository code.");
export const reasoningHarnessSchema = z.object({ version: z.literal("1.0.0"), functions: z.array(reasoningFunctionSchema).max(30) }).strict();
export type SharedReasoning = z.infer<typeof sharedReasoningSchema>;
export type ReasoningHarness = z.infer<typeof reasoningHarnessSchema>;
export type ReasoningTarget = z.infer<typeof reasoningTargetSchema>;

type Context = {
  reasoning?: SharedReasoning; reasoningPolicy?: z.infer<typeof reasoningPolicySchema>; reasoningHarness?: ReasoningHarness;
  structure: Array<{ nodeId: string; kind: string }>; targets: Array<{ id: string }>;
  relationships?: Array<{ targetId: string }>; governanceRelationships?: Array<{ targetId: string }>;
  arguments: Array<{ id: string }>; files: string[];
};
export function validateReasoning(context: Context, ctx: z.RefinementCtx) {
  const issue = (message: string) => ctx.addIssue({ code: "custom", path: ["reasoning"], message });
  const unique = (values: string[], label: string) => { if (new Set(values).size !== values.length) issue(`${label} must be unique.`); };
  if ((context.reasoning || context.reasoningHarness) && !context.reasoningPolicy) issue("Shared reasoning requires a governance reasoning policy.");
  const nodes = context.reasoning?.nodes ?? [], byId = new Map(nodes.map(node => [node.id, node]));
  unique([...nodes.map(node => node.id), ...context.arguments.map(node => node.id)], "Reasoning and legacy argument IDs");
  function target(value: ReasoningTarget) {
    if (!value.itemId) return;
    const members = value.field === "goals" ? context.structure.filter(node => node.kind === "goal").map(node => node.nodeId)
      : value.field === "rules" ? context.structure.filter(node => node.kind === "rule").map(node => node.nodeId)
      : value.field === "components" ? context.structure.filter(node => node.kind !== "goal" && node.kind !== "rule").map(node => node.nodeId)
      : value.field === "targets" ? context.targets.map(node => node.id)
      : value.field === "relationships" ? (value.section === "governance" ? context.governanceRelationships : context.relationships)?.map(node => node.targetId) ?? [] : [];
    if (!members.includes(value.itemId)) issue("Reasoning item targets must resolve in their declared section and field.");
  }
  for (const node of nodes) {
    node.targets.forEach(target); unique(node.targets.map(value => JSON.stringify(value)), "Reasoning targets");
    for (const field of ["premises", "supports", "challenges", "evidence"] as const) {
      unique(node[field], `Reasoning ${field}`);
      for (const reference of node[field]) {
        if (!byId.has(reference) || reference === node.id) issue("Reasoning links must resolve to another shared node.");
        if (field === "evidence" && byId.get(reference)?.kind !== "evidence") issue("Evidence links must point to evidence nodes.");
        if (field === "premises" && !["axiom", "assumption", "argument"].includes(byId.get(reference)?.kind ?? "")) issue("Premises must point to axioms, assumptions or arguments.");
      }
    }
    if (node.kind === "evidence" && !node.source) issue("Evidence nodes require a revision-pinned source.");
  }
  const visiting = new Set<string>(), done = new Set<string>();
  function visit(id: string) {
    if (visiting.has(id)) { issue("Reasoning premise/support cycles are not permitted."); return; }
    if (done.has(id)) return;
    visiting.add(id);
    const node = byId.get(id);
    for (const reference of [...(node?.premises ?? []), ...nodes.filter(other => other.supports.includes(id)).map(other => other.id)]) visit(reference);
    visiting.delete(id); done.add(id);
  }
  nodes.forEach(node => visit(node.id));
  const functions = context.reasoningHarness?.functions ?? [];
  unique(functions.map(fn => fn.id), "Reasoning function IDs");
  if (functions.length && (!context.reasoning || !context.files.includes("nome.skills.json"))) issue("Reasoning functions require a shared graph and declared nome.skills.json agent catalogue.");
  for (const fn of functions) {
    fn.targets.forEach(target); unique(fn.agents, "Function agents"); unique(fn.effects, "Function effects");
    unique(fn.targets.map(value => JSON.stringify(value)), "Function targets");
  }
}
