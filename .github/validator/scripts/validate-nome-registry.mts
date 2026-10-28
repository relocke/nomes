import { execFileSync } from "node:child_process";
import { validateRegistryChange } from "../lib/nome-project/registry-validation.ts";
import { directAuthority } from "../lib/nome-project/policy.ts";
import { commitSchema } from "../lib/nome-project/schema.ts";

const [directory, base, head, branch] = process.argv.slice(2);
commitSchema.parse(base); commitSchema.parse(head);
if (!directory || !branch) throw new Error("Registry checkout, base, head and branch are required");
const git = (...args: string[]) => execFileSync("git", ["-C", directory, ...args], { encoding: "utf8", maxBuffer: 20_000_000 });
if (git("merge-base", base, head).trim() !== base) throw new Error("Proposal must descend from the current registry base");
function snapshot(sha: string) {
  const files = new Map<string, string>();
  let size = 0;
  for (const entry of git("ls-tree", "-rz", sha).split("\0").filter(Boolean)) {
    const match = /^(100644) blob [a-f0-9]{40}\t([A-Za-z0-9_./-]+)$/.exec(entry);
    if (!match || match[2].includes("..")) throw new Error("Registry must contain only regular safe-path files");
    const content = git("show", `${sha}:${match[2]}`);
    size += Buffer.byteLength(content);
    if (Buffer.byteLength(content) > 180_000 || size > 20_000_000) throw new Error("Registry size limit exceeded");
    files.set(match[2], content);
  }
  return files;
}
const endpoints = { vaulta: "https://eos.relocke.io", wax: "https://wax.relocke.io", telos: "https://telos.relocke.io", xpr: "https://proton.relocke.io" };
await validateRegistryChange({ base, head, branch, parent: git("rev-parse", `${head}^`).trim(), before: snapshot(base), after: snapshot(head), verifyAccount: async (identity, publicKey) => {
  const response = await fetch(`${endpoints[identity.chain]}/v1/chain/get_account`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ account_name: identity.account }), redirect: "error", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("Live account authority unavailable");
  const account = await response.json() as { permissions: Array<{ perm_name: string; required_auth: { threshold: number; keys: Array<{ key: string; weight: number }> } }> };
  const permission = account.permissions.find(item => item.perm_name === identity.permission);
  if (!permission || !directAuthority(publicKey, permission.required_auth)) throw new Error("Signing key does not satisfy current account permission");
} });
console.log("Signed Nome change verified against current blockchain authority and the accepted base policy.");
