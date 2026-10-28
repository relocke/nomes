import { z } from "zod";

export const nomeIdentitySchema = z.object({
  chain: z.enum(["vaulta", "wax", "telos", "xpr"]),
  account: z.string().regex(/^[a-z1-5.]{1,12}$/),
  permission: z.string().regex(/^[a-z1-5.]{1,12}$/),
}).strict();
export const nomeAuthoritySchema = z.object({
  version: z.literal(1),
  maintainers: z.array(nomeIdentitySchema).min(1).max(20),
}).strict().refine(value => new Set(value.maintainers.map(item => `${item.chain}:${item.account}@${item.permission}`)).size === value.maintainers.length, "Duplicate maintainer.");
export function permitsIdentity(authority: z.infer<typeof nomeAuthoritySchema>, identity: z.infer<typeof nomeIdentitySchema>) {
  return authority.maintainers.some(item => item.chain === identity.chain && item.account === identity.account && item.permission === identity.permission);
}
