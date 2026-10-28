import { z } from "zod";

export const deploymentChains = ["vaulta", "wax", "telos", "xpr"] as const;
export const artifactIdSchema = z.string().uuid();
// Package-relative paths are retained privately. compiler-package maps them to
// the hosted compiler's flat filename protocol, never to server filesystem paths.
const packagePath = z.string().max(240).regex(/^(?:[A-Za-z0-9_-][A-Za-z0-9_.-]*\/)*[A-Za-z0-9_-][A-Za-z0-9_.+-]*$/)
  .refine(value => !value.includes(".."), "Use a package-relative path without traversal.");
const sourceFilename = packagePath.refine(value => /\.(?:c|cc|cpp|cxx)$/i.test(value), "Select a C/C++ entry point.");
const companionFilename = packagePath.refine(value => /\.(?:c|cc|cpp|cxx|h|hh|hpp|hxx|h\+\+)$/i.test(value), "Use a C/C++ source or header path.");
const defineSchema = z.object({
  name: z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/).max(120),
  value: z.string().max(240).regex(/^(?:-?\d+|[A-Za-z_][A-Za-z0-9_]*|"[A-Za-z0-9_.:/ -]*")$/,
    "Use an integer, identifier, or quoted string literal; not compiler flags or directives."),
}).strict();
const ricardianFileSchema = z.object({
  filename: z.string().max(120),
  source: z.string().min(1).max(120_000).refine(text => text.trim().length > 0),
}).strict();
const contractNameSchema = z.string().regex(/^[a-z1-5.]{1,12}$/);
const payingAccountSchema = z.string().regex(/^[a-z1-5.]{1,12}$/).refine(value => !value.endsWith("."));
export const compileProjectSchema = z.object({
  chain: z.enum(deploymentChains),
  mode: z.enum(["paid", "bootstrap"]).optional().describe("Omit mode for the normal website compile-and-deploy review. Explicit paid and bootstrap modes retain their legacy payment or maintenance eligibility checks."),
  contractName: contractNameSchema,
  payingAccount: payingAccountSchema.optional()
    .describe("Optional deployment RAM/bandwidth payer, preserved in the browser review. This is a preference, not payment authorization; live authority and funds are checked before signing."),
  filename: sourceFilename.describe("Package-relative C/C++ entry point. Other .cpp files must be included from it, not independent translation units."),
  source: z.string().min(1).max(120_000),
  files: z.array(z.object({ filename: companionFilename, source: z.string().min(1).max(120_000) }).strict()).max(31),
  defines: z.array(defineSchema).max(64).optional().describe("Explicit build-profile object-like defines. Quoted strings must include their C++ quotes. Never infer a chain profile."),
  ricardianFiles: z.array(ricardianFileSchema).max(2).optional().describe("Rendered <contractName>.contracts.md and/or <contractName>.clauses.md; include chain-specific documentation, not unrendered templates."),
}).strict().superRefine((input, ctx) => {
  const allFiles = [...input.files, ...(input.ricardianFiles ?? [])];
  if (new Set(input.defines?.map(define => define.name)).size !== (input.defines?.length ?? 0))
    ctx.addIssue({ code: "custom", message: "Duplicate build define." });
  if (new Set([input.filename, ...allFiles.map(file => file.filename)]).size !== allFiles.length + 1)
    ctx.addIssue({ code: "custom", message: "Duplicate compiler filename." });
  for (const file of input.ricardianFiles ?? []) {
    if (![`${input.contractName}.contracts.md`, `${input.contractName}.clauses.md`].includes(file.filename))
      ctx.addIssue({ code: "custom", message: "Ricardian filename must match contractName.contracts.md or contractName.clauses.md." });
  }
  if (new TextEncoder().encode(JSON.stringify(input)).length > 500_000)
    ctx.addIssue({ code: "custom", message: "Project exceeds the agent compiler limit." });
});
export type CompileProject = z.infer<typeof compileProjectSchema>;

/**
 * A browser may upload an already-built WASM/ABI pair. The ABI is deliberately
 * left as JSON here and canonicalized on the server with ReLockeQL before it
 * can become a deployment artifact. No model is involved in this boundary.
 */
export const uploadedDeploymentArtifactSchema = z.object({
  chain: z.enum(deploymentChains),
  contractName: contractNameSchema,
  wasmBase64: z.string().min(1).max(1_100_000),
  abi: z.unknown(),
  ricardianFiles: z.array(ricardianFileSchema).max(2).optional(),
  sourceProject: compileProjectSchema.optional(),
}).strict().superRefine((input, ctx) => {
  for (const file of input.ricardianFiles ?? []) {
    if (![`${input.contractName}.contracts.md`, `${input.contractName}.clauses.md`].includes(file.filename))
      ctx.addIssue({ code: "custom", message: "Ricardian filename must match contractName.contracts.md or contractName.clauses.md." });
  }
  if (input.sourceProject && (input.sourceProject.chain !== input.chain || input.sourceProject.contractName !== input.contractName))
    ctx.addIssue({ code: "custom", message: "Compiled artifact chain and contractName must match the source project." });
});
export type UploadedDeploymentArtifact = z.infer<typeof uploadedDeploymentArtifactSchema>;

export type DeploymentArtifact = {
  id: string; chain: typeof deploymentChains[number]; owner: string; expiresAt: number;
  contractName: string; sourceHash: string; wasmHash: string; abiHash: string;
  wasmHex: string; abiHex: string; wasmBytes: number; abiBytes: number;
  sourceProject?: CompileProject; abiJson?: string;
  /** Whether the immutable bytes came from the compiler or an authenticated upload. */
  origin?: "compiler" | "uploaded";
  ricardianFiles?: Array<z.infer<typeof ricardianFileSchema>>;
  compilation?: { feeUnits: string; retentionSeconds: number; mode?: "standard" | "paid" | "bootstrap" };
  buildStatus?: "staged" | "awaiting_payment" | "compiling" | "compiled" | "failed";
  diagnostics?: string;
};
export function artifactSummary(artifact: DeploymentArtifact) {
  const { id, chain, expiresAt, contractName, sourceHash, wasmHash, abiHash, wasmBytes, abiBytes } = artifact;
  return { id, chain, expiresAt, contractName, sourceHash, wasmHash, abiHash, wasmBytes, abiBytes, compilation: artifact.compilation, buildStatus: artifact.buildStatus, diagnostics: artifact.diagnostics,
    origin: artifact.origin ?? "compiler", hasSourceProject: Boolean(artifact.sourceProject), payingAccount: artifact.sourceProject?.payingAccount };
}
