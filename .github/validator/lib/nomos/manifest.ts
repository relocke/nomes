import { z } from "zod";
import { nomeManifestSchema as legacySchema, type NomeManifest } from "./manifest-v1.ts";
import { nomeV2Schema, organizeNome, projectV2 } from "./manifest-v2.ts";

// Existing runtime consumers retain their validated projection during migration.
export * from "./manifest-v1.ts";
export { nomeV2Schema, organizeNome } from "./manifest-v2.ts";
export const nomeDocumentSchema = z.union([legacySchema, nomeV2Schema]);

export function parseNomeManifest(source: string): NomeManifest {
  if (new TextEncoder().encode(source).byteLength > 120_000) throw new Error("nome.json exceeds 120 KB.");
  const value = nomeDocumentSchema.parse(JSON.parse(source));
  return value.format === "relocke-nome/2" ? legacySchema.parse(projectV2(value)) : value;
}

/** All explicit writes use the four-section format. Reads never rewrite files. */
export function serializeNomeManifest(manifest: NomeManifest): string {
  const source = JSON.stringify(organizeNome(manifest), null, 2) + "\n";
  parseNomeManifest(source);
  return source;
}
