import { createHash } from "node:crypto";
import { parseNomeManifest } from "../nomos/manifest.ts";
import type { NomeManifest } from "../nomos/manifest.ts";
import { NomeError, type Contribution, type Source } from "./schema.ts";

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => [key, canonical(item)]));
  return value;
}
export const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
export function directAuthority(publicKey: string, authority: { threshold: number; keys: Array<{ key: string; weight: number }> }) {
  // One key must independently meet the threshold; duplicate keys never add weight.
  return Number.isSafeInteger(authority.threshold) && authority.threshold > 0 &&
    authority.keys.filter(item => item.key === publicKey).length === 1 &&
    authority.keys.some(item => item.key === publicKey && Number.isSafeInteger(item.weight) && item.weight >= authority.threshold);
}
export function validateEdits(manifest: NomeManifest, documents: Array<{ filename: string; source: string }>, contribution: Contribution) {
  const files = new Map(documents.map(file => [file.filename, file.source]));
  for (const edit of contribution.edits) files.set(edit.path, edit.content);
  const replacement = contribution.edits.find(edit => edit.path === "nome.json");
  const next = replacement ? parseNomeManifest(replacement.content) : manifest;
  if (manifest.authority && !next.authority) throw new NomeError("An accepted authority policy cannot be removed; propose replacement maintainers instead.");
  if (next.id !== manifest.id || JSON.stringify(next.repository) !== JSON.stringify(manifest.repository)) throw new NomeError("A proposal cannot replace the Nome identity or repository.");
  for (const edit of contribution.edits) {
    if (edit.path !== "nome.json" && (!next.files.includes(edit.path) || edit.path.startsWith("discussion/"))) throw new NomeError("Edits must be declared project documents, separate from discussion records.");
  }
  if (next.files.some(path => !files.has(path))) throw new NomeError("Every declared project file must exist after the proposal.");
  return next;
}
export function selectSources(sources: Source[], question: string, limit = 8) {
  const terms = [...new Set(question.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? [])];
  return sources.map((source, index) => ({ source, index, score: terms.reduce((score, term) => score + (source.title.toLowerCase().includes(term) ? 4 : 0) + (source.text.toLowerCase().includes(term) ? 1 : 0), 0) }))
    .sort((a, b) => b.score - a.score || a.index - b.index).slice(0, limit).map(({ source }) => {
      const position = terms.map(term => source.text.toLowerCase().indexOf(term)).find(index => index >= 0) ?? 0;
      const start = Math.max(0, position - 400);
      return { ...source, text: source.text.slice(start, start + 3500) };
    });
}
