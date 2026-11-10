import { z } from "zod";
import { nomeManifestSchema as legacySchema, type NomeManifest as LegacyManifest } from "./manifest-v1.ts";

const fields = legacySchema.shape;
const nodes = fields.structure.element;
const groupedNodes = (kind: "goal" | "rule" | "component") => z.array(nodes).max(100).refine(
  values => values.every(node => kind === "component" ? node.kind !== "goal" && node.kind !== "rule" : node.kind === kind),
  `Use ${kind === "component" ? "architecture component" : kind} nodes in this section.`,
);

/** Versioned storage format. App readers use a validated compatibility projection. */
const nomeV2Shape = z.object({
  $schema: z.literal("https://relocke.io/nome.schema.json").optional(),
  format: z.literal("relocke-nome/2"),
  reasoning: fields.reasoning,
  identity: z.object({
    id: fields.id, name: fields.title, location: fields.repository,
    discovery: fields.discovery.unwrap().omit({ problem: true, approach: true }).optional(),
  }).strict(),
  mission: fields.mission.extend({ goals: groupedNodes("goal") }).strict(),
  governance: z.object({
    reasoningPolicy: fields.reasoningPolicy,
    authority: fields.authority, responsibility: fields.responsibility, license: fields.license,
    ownership: fields.ownership, beneficiaries: fields.beneficiaries, changeProcess: fields.changeProcess,
    rules: groupedNodes("rule"), relationships: fields.governanceRelationships,
    arguments: fields.arguments, faq: fields.faq,
    antediluvian: fields.antediluvian, criteria: fields.criteria, recognition: fields.recognition,
  }).strict(),
  architecture: z.object({
    reasoningHarness: fields.reasoningHarness,
    approach: z.string().min(1).max(2000).regex(/\S/).optional(),
    build: fields.build, supportedChains: fields.supportedChains, targets: fields.targets,
    defaultTarget: fields.defaultTarget, components: groupedNodes("component"),
    relationships: fields.relationships, sideEffects: fields.sideEffects,
    files: fields.files, context: fields.context, agentContext: fields.agentContext,
    specification: z.literal("nome.skills.json").optional(),
  }).strict(),
}).strict();
export type NomeV2 = z.infer<typeof nomeV2Shape>;
export const nomeV2Schema = nomeV2Shape.superRefine((document, ctx) => {
  const result = legacySchema.safeParse(projectV2(document));
  if (!result.success) for (const issue of result.error.issues) ctx.addIssue({ code: "custom", message: issue.message });
  const declared = document.architecture.files.includes("nome.skills.json");
  if (declared !== Boolean(document.architecture.specification)) ctx.addIssue({ code: "custom", path: ["architecture", "specification"], message: "Declare nome.skills.json in files and specification together." });
});

/** Keep identity, authority and repository checks on the same validated fields. */
export function projectV2(document: NomeV2): LegacyManifest {
  const { goals, ...mission } = document.mission;
  const { identity, governance, architecture } = document;
  const projected: LegacyManifest = {
    ...(document.$schema ? { $schema: document.$schema } : {}),
    reasoning: document.reasoning, reasoningPolicy: governance.reasoningPolicy, reasoningHarness: architecture.reasoningHarness,
    format: "relocke-nome/1", id: identity.id, title: identity.name, repository: identity.location,
    ...(identity.discovery ? { discovery: { ...identity.discovery, ...(mission.problem ? { problem: mission.problem } : {}), ...(architecture.approach ? { approach: architecture.approach } : {}) } } : {}), mission,
    authority: governance.authority, responsibility: governance.responsibility, license: governance.license,
    ownership: governance.ownership, beneficiaries: governance.beneficiaries, changeProcess: governance.changeProcess, faq: governance.faq,
    governanceRelationships: governance.relationships,
    arguments: governance.arguments, antediluvian: governance.antediluvian,
    criteria: governance.criteria, recognition: governance.recognition,
    build: architecture.build, supportedChains: architecture.supportedChains, targets: architecture.targets,
    defaultTarget: architecture.defaultTarget, files: architecture.files,
    context: architecture.context, agentContext: architecture.agentContext,
    relationships: architecture.relationships, sideEffects: architecture.sideEffects,
    architectureApproach: architecture.approach,
    structure: [...goals, ...governance.rules, ...architecture.components],
  };
  return Object.fromEntries(Object.entries(projected).filter(([, value]) => value !== undefined)) as LegacyManifest;
}

export function organizeNome(manifest: LegacyManifest): NomeV2 {
  const value = legacySchema.parse(manifest);
  if (value.mission.problem && value.discovery?.problem && value.mission.problem !== value.discovery.problem) throw new Error("Resolve conflicting mission and discovery problem declarations before migration.");
  if (value.architectureApproach && value.discovery?.approach && value.architectureApproach !== value.discovery.approach) throw new Error("Resolve conflicting architecture and discovery approach declarations before migration.");
  const { problem, approach, ...discovery } = value.discovery ?? {};
  return nomeV2Schema.parse({
    $schema: "https://relocke.io/nome.schema.json", format: "relocke-nome/2",
    ...(value.reasoning ? { reasoning: value.reasoning } : {}),
    identity: { id: value.id, name: value.title, location: value.repository, discovery: value.discovery ? discovery : undefined },
    mission: { ...value.mission, ...(problem ? { problem } : {}), goals: value.structure.filter(node => node.kind === "goal") },
    governance: {
      reasoningPolicy: value.reasoningPolicy,
      authority: value.authority, responsibility: value.responsibility, license: value.license,
      ownership: value.ownership, beneficiaries: value.beneficiaries, changeProcess: value.changeProcess,
      rules: value.structure.filter(node => node.kind === "rule"), relationships: value.governanceRelationships,
      arguments: value.arguments, faq: value.faq, antediluvian: value.antediluvian,
      criteria: value.criteria, recognition: value.recognition,
    },
    architecture: {
      reasoningHarness: value.reasoningHarness,
      approach: value.architectureApproach ?? approach,
      build: value.build, supportedChains: value.supportedChains, targets: value.targets,
      defaultTarget: value.defaultTarget, files: value.files, context: value.context,
      agentContext: value.agentContext, relationships: value.relationships, sideEffects: value.sideEffects,
      components: value.structure.filter(node => node.kind !== "goal" && node.kind !== "rule"),
      ...(value.files.includes("nome.skills.json") ? { specification: "nome.skills.json" } : {}),
    },
  });
}
