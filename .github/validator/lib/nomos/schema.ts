import { z } from "zod";
const id = z.string().uuid();
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const text = z.string().min(1).max(4000);
const path = z.string().min(1).max(180).regex(/^[a-zA-Z0-9_./-]+$/).refine(p => p.split("/").every(s => s && s !== "." && s !== ".." && !s.startsWith(".")));
export const scopeSchema = z.string().regex(/^(project|repository|node:[a-f0-9-]{36}|goal:[a-f0-9]{64})$/).max(80);
export const targetSchema = z.object({ id, name: z.string().min(1).max(100), chain: z.enum(["vaulta", "wax", "telos", "xpr", "jungle"]), network: z.enum(["mainnet", "testnet"]), account: z.string().regex(/^[a-z1-5.]{1,12}$/), contract: z.string().regex(/^[a-z1-5.]{1,12}$/) }).strict();
export const profileSchema = z.object({
  format: z.literal("nomos/1"), targets: z.array(targetSchema).min(1).max(30),
  repository: z.object({ url: z.string().regex(/^https:\/\/(github.com|bitbucket.org)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/), branch: z.string().min(1).max(200).regex(/^[a-zA-Z0-9_./-]+$/), directory: path, publication: z.enum(["reviewed_direct", "portable_only"]) }).strict(),
  criteria: z.array(z.object({ id, statement: text, required: z.boolean() }).strict()).max(50),
}).strict().refine(p => new Set(p.targets.map(t => t.id)).size === p.targets.length && new Set(p.criteria.map(c => c.id)).size === p.criteria.length, "Target and criterion identifiers must be unique.");
export const nodeSchema = z.object({
  type: z.literal("node"), nodeId: id, kind: z.enum(["goal", "vulnerability", "solution", "rule", "interaction", "dependency", "roadmap"]),
  title: z.string().min(1).max(160), description: text, parent: id.nullable(), links: z.array(id).max(30),
  supersedes: digest.optional(), evidence: z.array(digest).max(30), targets: z.array(id).max(30),
  interaction: z.object({ calls: text, assetFlows: text, authority: text, assumptions: z.array(text).max(20), sideEffects: z.array(text).max(20) }).strict().optional(),
  dependency: z.object({ projectId: id, revisionId: digest, rules: z.array(digest).max(30), interfaces: z.array(text).max(20), assumptions: z.array(text).max(20) }).strict().optional(),
  alignment: z.array(z.object({ rule: digest, ricardian: digest, source: digest, abi: digest.optional(), evidence: z.array(digest).max(20), status: z.enum(["proposed", "supported", "disputed"]) }).strict()).max(30).optional(),
}).strict().superRefine((n, ctx) => {
  if ((n.kind === "interaction") !== Boolean(n.interaction)) ctx.addIssue({ code: "custom", message: "Interaction nodes require interaction details, exclusively." });
  if (n.kind === "interaction" && n.targets.length < 2) ctx.addIssue({ code: "custom", message: "An interaction needs at least two participating targets." });
  if ((n.kind === "dependency") !== Boolean(n.dependency)) ctx.addIssue({ code: "custom", message: "Dependency nodes must pin a project and revision, exclusively." });
});
export const nomarchAssessmentSchema = z.object({
  type: z.literal("nomarch_assessment"), structure: z.array(digest).max(100),
  evaluations: z.array(z.object({ criterionId: id, outcome: z.enum(["satisfied", "failed", "needs_evidence"]), explanation: text, citations: z.array(digest).max(30) }).strict()).max(50),
  dependencies: z.array(z.object({ nodeId: id, revisionId: digest }).strict()).max(50),
  assumptions: z.array(text).max(30), residualRisks: z.array(text).max(30),
}).strict();
export const nomosContributionSchema = z.union([nodeSchema, z.object({ type: z.literal("assessment_request") }).strict(), z.object({ type: z.literal("counterexample"), challenges: digest, explanation: text }).strict(), nomarchAssessmentSchema]);
export type NomeProfile = z.infer<typeof profileSchema>;
export type NomeNode = z.infer<typeof nodeSchema>;
export type NomarchAssessment = z.infer<typeof nomarchAssessmentSchema>;
export const BRIDGE_PROFILE: NomeProfile = {
  format: "nomos/1", targets: [{ id: "b8100000-0000-4000-8000-000000000001", name: "Vaulta mainnet", chain: "vaulta", network: "mainnet", account: "proof.rloc", contract: "proof.rloc" }],
  repository: { url: "https://github.com/relocke/smart-contracts", branch: "main", directory: "proof.rloc", publication: "reviewed_direct" }, criteria: [],
};
