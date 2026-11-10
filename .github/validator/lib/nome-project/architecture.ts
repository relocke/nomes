import { z } from "zod";
import type { ReasoningHarness } from "../nomos/reasoning.ts";

export const NOME_SKILLS_FILE = "nome.skills.json";
export const NOME_SKILLS_SCHEMA = "https://relocke.io/nomes/schema/skills-1.0.json";
const id = z.string().max(80).regex(/^[a-z][a-z0-9-]*$/);
const text = z.string().trim().min(1).max(2000);
const refs = z.array(id).max(50);
const https = z.string().url().max(1000).refine(value => {
  const url = new URL(value);
  return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash;
}, "Use a public HTTPS address without credentials, query or fragment.");
const file = z.string().max(240).regex(/^(?:[A-Za-z0-9_-][A-Za-z0-9_.-]*\/)*[A-Za-z0-9_-][A-Za-z0-9_.-]*\.md$/).refine(value => !value.includes(".."));
const reference = z.object({ url: https, revision: z.string().min(1).max(160), capability: id.optional() }).strict();
const base = { id, name: z.string().trim().min(1).max(160), description: text.optional() };
const configuration = z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_.-]{0,79}$/), z.union([z.string().max(1000), z.number().finite(), z.boolean(), z.null()])).superRefine((value, ctx) => {
  for (const key of Object.keys(value)) if (/secret|password|token|credential|private.?key|api.?key|access.?key|authorization|cookie|execution.?history|goal.?progress|receipt|balance|running.?task/i.test(key)) ctx.addIssue({ code: "custom", path: [key], message: "Keep authentication material in the harness secret store." });
});
const skill = z.object({ ...base, instructions: z.string().min(1).max(12000).optional(), instructionsFile: file.optional(), external: reference.optional(), tools: refs.optional(), services: refs.optional(), dependencies: refs.optional(), configuration: configuration.optional(), constraints: z.array(text).max(20).optional() }).strict();

/** Portable intent only. No observed balances, progress, receipts or executable hooks. */
export const nomeSkillsSchema = z.object({
  $schema: z.literal(NOME_SKILLS_SCHEMA).optional(), schemaVersion: z.literal("1.0"),
  name: z.string().trim().min(1).max(160), description: text.optional(), purpose: text,
  version: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/).optional(),
  goals: z.array(z.object({ ...base, outcome: text, successCriteria: z.array(text).max(20).optional(), dependencies: refs.optional() }).strict()).max(50).optional(),
  governance: z.object({ policySource: z.enum(["nome.json#/authority", "nome.json#/governance/authority"]).optional(), rules: z.array(text).max(30).optional(), approvals: z.array(text).max(20).optional() }).strict().optional(),
  agents: z.array(z.object({ ...base, role: text, responsibilities: z.array(text).max(20).optional(), goals: refs.optional(), workflows: refs.optional(), skills: refs.optional(), tools: refs.optional(), runtime: reference.optional() }).strict()).max(30).optional(),
  skills: z.array(skill).max(50).optional(),
  tools: z.array(z.object({ ...base, service: id.optional(), operation: text, effects: z.enum(["read", "write"]), approvals: z.array(text).max(20).optional() }).strict()).max(80).optional(),
  mcpServers: z.array(z.object({ ...base, connection: z.discriminatedUnion("transport", [
    z.object({ transport: z.enum(["streamable-http", "sse"]), url: https }).strict(),
    z.object({ transport: z.literal("stdio"), package: text }).strict(),
  ]), authentication: z.enum(["none", "harness-managed"]), external: reference.optional() }).strict()).max(30).optional(),
  blockchains: z.array(z.object({ ...base, namespace: text, chainId: text, relockeChain: z.enum(["vaulta", "wax", "telos", "xpr"]).optional(), accounts: z.array(z.object({ account: text, permission: text.optional() }).strict()).max(30).optional(), contracts: z.array(text).max(30).optional(), capabilities: z.array(text).max(30).optional() }).strict()).max(20).optional(),
  resources: z.array(z.object({ ...base, kind: z.enum(["compute", "financial", "storage", "other"]), requirements: z.array(text).max(20).optional(), blockchain: id.optional() }).strict()).max(30).optional(),
  policies: z.object({ constraints: z.array(text).max(30).optional(), requiredApprovals: z.array(text).max(30).optional(), externalCapabilities: z.literal("explicit-approval").optional() }).strict().optional(),
  workflows: z.array(z.object({ ...base, goals: refs, steps: z.array(z.object({ id, description: text, agent: id.optional(), skills: refs.optional(), tools: refs.optional(), resources: refs.optional(), blockchains: refs.optional(), dependsOn: refs.optional(), approvals: z.array(text).max(20).optional(), external: reference.optional() }).strict()).min(1).max(50) }).strict()).max(30).optional(),
  externalNomes: z.array(z.object({ ...base, specification: reference, purpose: text }).strict()).max(20).optional(),
  extensions: z.record(z.string().regex(/^[a-z0-9.-]+:[a-z][a-z0-9.-]*$/), configuration).optional(),
}).strict().superRefine((spec, ctx) => {
  const groups = { goals: spec.goals ?? [], agents: spec.agents ?? [], skills: spec.skills ?? [], tools: spec.tools ?? [], services: spec.mcpServers ?? [], blockchains: spec.blockchains ?? [], resources: spec.resources ?? [], workflows: spec.workflows ?? [], externalNomes: spec.externalNomes ?? [] };
  const seen = new Set<string>();
  for (const items of Object.values(groups)) for (const item of items) {
    if (seen.has(item.id)) ctx.addIssue({ code: "custom", message: `Duplicate component ID: ${item.id}` });
    seen.add(item.id);
  }
  const check = (values: string[] | undefined, group: keyof typeof groups, label: string) => {
    for (const value of values ?? []) if (!groups[group].some(item => item.id === value)) ctx.addIssue({ code: "custom", message: `${label}: missing ${group} reference ${value}` });
  };
  const cycles = (items: Array<{ id: string; dependencies?: string[] }>, label: string) => {
    const visiting = new Set<string>(), done = new Set<string>(), byId = new Map(items.map(item => [item.id, item]));
    function visit(key: string): void {
      if (visiting.has(key)) { ctx.addIssue({ code: "custom", message: `${label}: cyclic dependencies` }); return; }
      if (done.has(key)) return;
      visiting.add(key);
      for (const dependency of byId.get(key)?.dependencies ?? []) visit(dependency);
      visiting.delete(key); done.add(key);
    }
    for (const item of items) visit(item.id);
  };
  for (const goal of groups.goals) check(goal.dependencies, "goals", goal.id);
  for (const item of groups.skills) {
    if (!item.instructions && !item.instructionsFile && !item.external) ctx.addIssue({ code: "custom", message: `${item.id}: provide instructions or an instruction reference` });
    check(item.dependencies, "skills", item.id); check(item.tools, "tools", item.id); check(item.services, "services", item.id);
  }
  for (const agent of groups.agents) { check(agent.goals, "goals", agent.id); check(agent.workflows, "workflows", agent.id); check(agent.skills, "skills", agent.id); check(agent.tools, "tools", agent.id); }
  for (const tool of groups.tools) check(tool.service ? [tool.service] : [], "services", tool.id);
  for (const resource of groups.resources) check(resource.blockchain ? [resource.blockchain] : [], "blockchains", resource.id);
  for (const workflow of groups.workflows) {
    check(workflow.goals, "goals", workflow.id);
    const ids = new Set(workflow.steps.map(step => step.id));
    if (ids.size !== workflow.steps.length) ctx.addIssue({ code: "custom", message: `${workflow.id}: duplicate step IDs` });
    for (const step of workflow.steps) {
      check(step.agent ? [step.agent] : [], "agents", step.id); check(step.skills, "skills", step.id); check(step.tools, "tools", step.id); check(step.resources, "resources", step.id); check(step.blockchains, "blockchains", step.id);
      if (step.dependsOn?.some(key => !ids.has(key))) ctx.addIssue({ code: "custom", message: `${step.id}: missing step dependency` });
    }
    cycles(workflow.steps.map(step => ({ id: step.id, dependencies: step.dependsOn })), workflow.id);
  }
  cycles(groups.skills, "Skills"); cycles(groups.goals, "Goals");
});
export type NomeSkills = z.infer<typeof nomeSkillsSchema>;
export function parseNomeSkills(source: string): NomeSkills {
  if (new TextEncoder().encode(source).length > 120000) throw new Error("Nome architecture exceeds 120 KB.");
  return nomeSkillsSchema.parse(JSON.parse(source));
}
export const serializeNomeSkills = (spec: NomeSkills) => {
  const source = JSON.stringify(nomeSkillsSchema.parse(spec), null, 2) + "\n";
  parseNomeSkills(source);
  return source;
};

export function loadNomeArchitecture(files: Array<{ filename: string; source: string }>, declared: string[], reasoningHarness?: ReasoningHarness): NomeSkills | null {
  if (!declared.includes(NOME_SKILLS_FILE)) {
    if (reasoningHarness?.functions.length) throw new Error("Reasoning functions require an agent catalogue.");
    return null;
  }
  const source = files.find(file => file.filename === NOME_SKILLS_FILE)?.source;
  if (source === undefined) throw new Error("Declared Nome architecture is missing.");
  const spec = parseNomeSkills(source);
  for (const skill of spec.skills ?? []) if (skill.instructionsFile && (!declared.includes(skill.instructionsFile) || !files.some(file => file.filename === skill.instructionsFile))) throw new Error(`Missing declared instructions for ${skill.id}.`);
  for (const fn of reasoningHarness?.functions ?? []) for (const agent of fn.agents) {
    if (!spec.agents?.some(item => item.id === agent)) throw new Error(`Unknown reasoning agent: ${agent}`);
  }
  return spec;
}

/** Catalogue deliberately excludes skill instructions; load one skill on demand. */
export function discoverNomeArchitecture(spec: NomeSkills) {
  return { ...spec, skills: spec.skills?.map(({ instructions, ...skill }) => ({ ...skill, hasInlineInstructions: Boolean(instructions) })), capabilityStatus: "configured", executionAvailable: false };
}
export function loadNomeSkill(spec: NomeSkills, skillId: string, files: Array<{ filename: string; source: string }>) {
  const skill = spec.skills?.find(item => item.id === skillId);
  if (!skill) return null;
  return { ...skill, instructions: skill.instructions ?? files.find(file => file.filename === skill.instructionsFile)?.source, trust: "untrusted-project-content", executionAvailable: false };
}
