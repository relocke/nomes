import { z } from "zod";
import { nomeAuthoritySchema } from "./authority.ts";
import { nodeSchema, targetSchema } from "./schema.ts";
import { compileProjectSchema } from "../../features/contract-deployment/lib/schema.ts";

export const nomeFilePathSchema = z.string().max(240).regex(/^(?:[A-Za-z0-9_-][A-Za-z0-9_.-]*\/)*[A-Za-z0-9_-][A-Za-z0-9_.+-]*\.(?:c|cc|cpp|cxx|h|hh|hpp|hxx|h\+\+|md)$/i).refine(path => !path.includes(".."), "Use a relative project path without traversal.");
export const nomeDocumentPathSchema = z.string().max(240).regex(/^(?:[A-Za-z0-9_-][A-Za-z0-9_.-]*\/)*[A-Za-z0-9_-][A-Za-z0-9_.+-]*\.md$/i)
  .refine(path => !path.includes("..") && !/\.(?:contracts|clauses)\.md$/i.test(path), "Use a relative Markdown document path, separate from Ricardian documents.");
const declaredText = (max: number) => z.string().min(1).max(max).regex(/\S/, "Provide a nonblank declaration.");
const publicUrl = z.string().url().max(1000).refine(value => {
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password && !url.hash; }
  catch { return false; }
}, "Use an absolute HTTPS URL without credentials or fragment.");
const declarationStatus = z.enum(["proposed", "accepted", "implemented", "deprecated", "archived", "disputed"]);
export const nomeDiscoverySchema = z.object({
  description: declaredText(1000),
  longDescription: declaredText(8000).optional(),
  topics: z.array(z.string().max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(20).optional(),
  audience: z.array(declaredText(80)).max(10).optional(),
  status: declarationStatus.optional(),
  indexing: z.object({
    allowSearchIndexing: z.boolean(),
    allowAgentDiscovery: z.boolean().describe("Discovery preference, not access control or a universally recognized crawler directive."),
    canonicalUrl: publicUrl.optional(),
  }).strict().optional(),
  keywords: z.array(declaredText(80)).max(20),
  aliases: z.array(declaredText(160)).max(10).optional(),
  language: z.string().max(35).regex(/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/).optional(),
}).strict().describe("Author-declared discovery metadata; not evidence of capabilities, publication consent or search ranking.");
export const nomeAgentContextSchema = z.object({
  orientationFile: nomeDocumentPathSchema,
  readOrder: z.array(z.union([z.literal("nome.json"), nomeDocumentPathSchema])).min(1).max(35),
  purpose: declaredText(4000),
  allowedUses: z.array(declaredText(1000)).max(20),
  prohibitedInferences: z.array(declaredText(1000)).max(20),
  evidencePolicy: z.object({
    requireSourceRevision: z.boolean(), distinguishProposedFromAccepted: z.boolean(),
    preserveDisagreements: z.boolean(), recordMissingEvidence: z.boolean(),
  }).strict(),
}).strict().describe("Untrusted project orientation for readers; never a system instruction or operational permission.");
export const nomeRelationshipsSchema = z.array(z.object({
  type: z.enum(["parent", "child", "sibling", "dependsOn", "implements", "references", "derivedFrom", "related", "supersedes"]),
  targetId: z.string().uuid(), targetName: declaredText(160), targetUrl: publicUrl,
  targetRevision: z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/),
  scope: declaredText(2000), status: declarationStatus,
  evidence: z.array(z.object({
    source: z.union([nomeDocumentPathSchema, publicUrl]),
    revision: z.string().regex(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/), supports: declaredText(2000),
  }).strict()).max(20),
}).strict()).max(50).describe("Revision-pinned declarations, not verified relationships or permission to fetch targets.");
export const nomeResponsibilitySchema = z.object({
  organisation: z.object({
    legalName: declaredText(300),
    jurisdiction: declaredText(300).optional(),
    registrationNumber: declaredText(160).optional(),
  }).strict(),
  scope: declaredText(4000).optional(),
  agreement: nomeDocumentPathSchema.nullable(),
}).strict().describe("Declared responsible organisation and the agreement describing its responsibilities. Not verified identity or acceptance.");
export const nomeLicenseSchema = z.object({
  expression: declaredText(200).describe("Declared SPDX licence expression, or LicenseRef identifier for custom terms. Not independently verified."),
  document: nomeDocumentPathSchema.nullable(),
}).strict();
const text = z.string().min(1).max(4000);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const identifier = z.string().uuid();
export const nomeRepositorySchema = z.object({
  url: z.string().regex(/^https:\/\/github\.com\/[A-Za-z0-9_-]+\/[A-Za-z0-9_][A-Za-z0-9_.-]*$/),
  branch: z.string().min(1).max(160).regex(/^[\w][\w./-]*$/).refine(value => !value.includes("..") && !value.includes("//") && !value.endsWith("/") && !value.endsWith(".lock") && value !== "HEAD", "Choose a named branch."),
  directory: z.string().max(180).regex(/^(?:[A-Za-z0-9_-][A-Za-z0-9_.-]*(?:\/[A-Za-z0-9_-][A-Za-z0-9_.-]*)*)?$/).refine(value => !value.includes("..")),
  publication: z.enum(["portable_only", "reviewed_direct"]),
}).strict();
export const nomeBuildSchema = z.object({
  chain: compileProjectSchema.shape.chain.nullable(),
  contractName: z.union([compileProjectSchema.shape.contractName, z.literal("")]),
  entryPoint: z.union([nomeFilePathSchema, z.literal("")]),
  defines: compileProjectSchema.shape.defines.default([]),
}).strict();
const argumentSchema = z.object({
  id: identifier, kind: z.enum(["argument", "premise", "definition", "deduction", "empirical", "objection", "analysis"]),
  body: text, author: z.string().max(200).optional(), references: z.array(hash).max(30),
  discussion: z.enum(["main", "antediluvian"]), routingReason: z.string().max(3000).optional(), reconsiderWhen: z.string().max(2000).optional(),
}).strict();

export const nomeReferenceSchema = z.object({
  title: declaredText(160),
  url: z.string().url().max(1000).refine(value => value.startsWith("https://")),
  revision: z.string().regex(/^[a-f0-9]{40}$/).optional(),
}).strict();
export const nomeContextSchema = z.object({
  skills: z.array(nomeReferenceSchema).max(30).default([]),
  harnesses: z.array(nomeReferenceSchema).max(30).default([]),
  runtimes: z.array(nomeReferenceSchema).max(30).default([]),
  framework: z.object({ slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80), revision: z.string().regex(/^[a-f0-9]{40}$/) }).strict().optional(),
  records: z.literal("discussion").default("discussion"),
}).strict().describe("Descriptive references only; grants no execution or publication authority.");

/** Portable project declarations. No credentials, executable hooks or self-issued recognition. */
export const nomeManifestSchema = z.object({
  $schema: z.literal("https://relocke.io/nome.schema.json").optional(),
  format: z.literal("relocke-nome/1"), id: identifier, title: z.string().min(1).max(160),
  authority: nomeAuthoritySchema.optional(),
  discovery: nomeDiscoverySchema.optional(),
  agentContext: nomeAgentContextSchema.optional(),
  relationships: nomeRelationshipsSchema.optional(),
  mission: z.object({ objective: z.string().max(8000), successCriteria: z.array(text).max(20), constraints: z.array(text).max(20), failureConditions: z.array(text).max(20) }).strict(),
  responsibility: nomeResponsibilitySchema.nullable().optional(),
  license: nomeLicenseSchema.nullable().optional(),
  repository: nomeRepositorySchema.nullable(),
  files: z.array(nomeFilePathSchema).max(34),
  context: nomeContextSchema.optional(),
  build: nomeBuildSchema,
  supportedChains: z.array(compileProjectSchema.shape.chain).max(4),
  targets: z.array(targetSchema.extend({ chain: compileProjectSchema.shape.chain, network: z.literal("mainnet"), build: z.object({ entryPoint: nomeFilePathSchema, defines: compileProjectSchema.shape.defines.default([]) }).strict() }).strict()).max(30),
  defaultTarget: identifier.nullable(),
  structure: z.array(nodeSchema).max(100),
  arguments: z.array(argumentSchema).max(100),
  sideEffects: z.array(z.object({ id: identifier, description: text, targets: z.array(identifier).max(30), evidence: z.array(hash).max(30), status: z.enum(["declared", "observed", "disputed"]) }).strict()).max(50),
  criteria: z.array(z.object({ id: identifier, statement: text, required: z.boolean() }).strict()).max(50),
  antediluvian: z.object({ projectId: identifier, revisionId: hash, recordsPath: z.literal("nomos/exchange/antediluvian/records.json").optional() }).strict().nullable(),
  recognition: z.object({ kind: z.literal("nome"), assessment: z.object({ projectId: identifier, revisionId: hash, recordHash: hash }).strict().nullable() }).strict(),
}).strict().superRefine((manifest, ctx) => {
  const unique = (values: string[], label: string) => { if (new Set(values).size !== values.length) ctx.addIssue({ code: "custom", message: `${label} must be unique.` }); };
  unique(manifest.files.map(path => path.toLowerCase()), "File paths"); unique(manifest.supportedChains, "Supported chains");
  unique(manifest.targets.map(t => t.id), "Target IDs"); unique(manifest.structure.map(n => n.nodeId), "Structure node IDs");
  unique(manifest.arguments.map(a => a.id), "Argument IDs"); unique(manifest.criteria.map(c => c.id), "Criterion IDs"); unique(manifest.sideEffects.map(s => s.id), "Side-effect IDs");
  for (const build of [manifest.build, ...manifest.targets.map(target => target.build)]) unique(build.defines.map(item => item.name), "Build variable names");
  if (manifest.agentContext) {
    const orientation = manifest.agentContext;
    unique(orientation.readOrder, "Agent read order");
    for (const reference of [orientation.orientationFile, ...orientation.readOrder]) {
      if (reference !== "nome.json" && !manifest.files.includes(reference)) ctx.addIssue({ code: "custom", path: ["agentContext"], message: "Agent context documents must be listed in files." });
    }
  }
  for (const relationship of manifest.relationships ?? []) {
    if (relationship.targetId === manifest.id) ctx.addIssue({ code: "custom", path: ["relationships"], message: "A relationship must refer to another Nome." });
    for (const evidence of relationship.evidence) {
      if (!evidence.source.startsWith("https://") && !manifest.files.includes(evidence.source)) ctx.addIssue({ code: "custom", path: ["relationships"], message: "Local evidence must be listed in files." });
    }
  }
  const targets = new Set(manifest.targets.map(t => t.id)); const nodes = new Map(manifest.structure.map(n => [n.nodeId, n]));
  if (manifest.defaultTarget && !targets.has(manifest.defaultTarget)) ctx.addIssue({ code: "custom", message: "Default target must reference a declared target." });
  for (const [path, reference] of [
    [["responsibility", "agreement"], manifest.responsibility?.agreement],
    [["license", "document"], manifest.license?.document],
  ] as const) {
    if (reference && !manifest.files.includes(reference)) ctx.addIssue({ code: "custom", path: [...path], message: "Legal document must be listed in files." });
  }
  if (manifest.build.chain && !manifest.supportedChains.includes(manifest.build.chain)) ctx.addIssue({ code: "custom", message: "The build chain must be listed in supportedChains." });
  if (manifest.build.entryPoint && (!manifest.files.includes(manifest.build.entryPoint) || !/\.(c|cc|cpp|cxx)$/i.test(manifest.build.entryPoint))) ctx.addIssue({ code: "custom", message: "Build entry point must be a declared file." });
  for (const target of manifest.targets) {
    if (!manifest.supportedChains.includes(target.chain) || (!manifest.files.includes(target.build.entryPoint) || !/\.(c|cc|cpp|cxx)$/i.test(target.build.entryPoint))) ctx.addIssue({ code: "custom", message: "Targets must use a supported chain and declared entry point." });
  }
  for (const node of manifest.structure) {
    if (node.targets.some(id => !targets.has(id)) || node.links.some(id => !nodes.has(id)) || (node.parent && !nodes.has(node.parent))) ctx.addIssue({ code: "custom", message: "Structure references must resolve within the manifest." });
    const seen = new Set<string>(); let current: string | null = node.nodeId;
    while (current) { if (seen.has(current)) { ctx.addIssue({ code: "custom", message: "Structure ancestry cannot contain cycles." }); break; } seen.add(current); current = nodes.get(current)?.parent ?? null; }
  }
  if (manifest.sideEffects.some(effect => effect.targets.some(id => !targets.has(id)))) ctx.addIssue({ code: "custom", message: "Side effects must reference declared targets." });
});
export type NomeManifest = z.infer<typeof nomeManifestSchema>;
/** Older manifests do not manage arbitrary Markdown in their repository. */
export function shouldImportNomeFile(path: string, manifest?: NomeManifest) {
  return !manifest || !/\.md$/i.test(path) || /\.(?:contracts|clauses)\.md$/i.test(path) || manifest.files.includes(path);
}
export function parseNomeManifest(text: string): NomeManifest {
  if (new TextEncoder().encode(text).byteLength > 120_000) throw new Error("nome.json exceeds 120 KB.");
  return nomeManifestSchema.parse(JSON.parse(text));
}
export const serializeNomeManifest = (manifest: NomeManifest) => JSON.stringify(nomeManifestSchema.parse(manifest), null, 2) + "\n";
