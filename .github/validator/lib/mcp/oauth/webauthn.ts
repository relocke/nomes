import { createHash } from "node:crypto";
import { base58_to_binary } from "base58-js";
import { verifyAntelopeSignature } from "antelope-webauthn";

/** The library verifies ECDSA, not WebAuthn origin/RP/UV policy. Enforce those here. */
export async function verifyConnectionSignature(signature: string, publicKey: string, digest: string, origin: string, rpId: string) {
  try {
    if (!/^SIG_WA_[1-9A-HJ-NP-Za-km-z]+$/.test(signature) || signature.length > 8000 || !/^[a-f0-9]{64}$/.test(digest)) return false;
    const hostname = new URL(origin).hostname;
    if (hostname !== rpId && !hostname.endsWith(`.${rpId}`)) return false;
    const wire = Buffer.from(base58_to_binary(signature.slice(7)));
    if (wire.length < 108) return false;
    const bytes = wire.subarray(0, -4);
    const checksum = createHash("ripemd160").update(bytes).update("WA").digest().subarray(0, 4);
    if (!checksum.equals(wire.subarray(-4))) return false;
    let offset = 65;
    function vector() {
      let length = 0; let shift = 0; let byte: number;
      do {
        if (offset >= bytes.length || shift > 21) throw new Error("Invalid vector length");
        byte = bytes[offset++]; length += (byte & 0x7f) * 2 ** shift; shift += 7;
      } while (byte & 0x80);
      if (length > bytes.length - offset) throw new Error("Truncated vector");
      const result = bytes.subarray(offset, offset + length); offset += length; return result;
    }
    const authenticator = vector(); const clientBytes = vector();
    if (offset !== bytes.length || authenticator.length < 37) return false;
    // User presence and user verification are both mandatory for granting MCP access.
    if ((authenticator[32] & 0x05) !== 0x05) return false;
    if (!authenticator.subarray(0, 32).equals(createHash("sha256").update(rpId).digest())) return false;
    const client = JSON.parse(clientBytes.toString("utf8"));
    if (client.type !== "webauthn.get" || client.origin !== origin || (client.crossOrigin !== undefined && client.crossOrigin !== false)
      || client.challenge !== Buffer.from(digest, "hex").toString("base64url")) return false;
    return await verifyAntelopeSignature(signature, publicKey);
  } catch { return false; }
}
