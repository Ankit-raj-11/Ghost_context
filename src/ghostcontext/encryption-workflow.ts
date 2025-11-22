/**
 * Complete encryption workflow for GhostContext
 * Replaces Seal with Web Crypto API
 */

import { encryptData, decryptData } from "./crypto";
import { uploadToWalrus, fetchFromWalrusBytes } from "./walrus";
import {
  serializeGhostContextPayload,
  deserializeGhostContextPayload,
  type GhostContextPayload,
} from "../services/ghostcontext-payload";

export interface EncryptedMetadata {
  walrusBlobId: string;
  salt: string;
  iv: string;
  userAddress: string;
}

/**
 * Encrypt GhostContext payload and upload to Walrus
 */
export async function encryptAndUpload(
  payload: GhostContextPayload,
  userAddress: string,
  walletSigner: {
    signPersonalMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>;
  }
): Promise<EncryptedMetadata> {
  console.log("📦 Starting encryption and upload workflow");
  console.log("  File:", payload.fileName);
  console.log("  Chunks:", payload.chunks.length);
  
  // Serialize the payload
  const serialized = serializeGhostContextPayload(payload);
  console.log("  Serialized:", serialized.length, "characters");
  
  // Encrypt with Web Crypto API
  const { encryptedBlob, salt, iv } = await encryptData(serialized, walletSigner);
  console.log("  Encrypted successfully");
  
  // Upload to Walrus
  console.log("  Uploading to Walrus...");
  const walrusBlobId = await uploadToWalrus(encryptedBlob);
  console.log("  ✅ Uploaded to Walrus:", walrusBlobId);
  
  return {
    walrusBlobId,
    salt,
    iv,
    userAddress,
  };
}

/**
 * Download from Walrus and decrypt GhostContext payload
 */
export async function downloadAndDecrypt(
  metadata: EncryptedMetadata,
  walletSigner: {
    signPersonalMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>;
  }
): Promise<GhostContextPayload> {
  console.log("📥 Starting download and decryption workflow");
  console.log("  Blob ID:", metadata.walrusBlobId);
  
  // Download from Walrus
  const encryptedBytes = await fetchFromWalrusBytes(metadata.walrusBlobId);
  console.log("  Downloaded:", encryptedBytes.length, "bytes");
  
  // Decrypt
  const decrypted = await decryptData(
    encryptedBytes,
    metadata.salt,
    metadata.iv,
    walletSigner
  );
  console.log("  Decrypted successfully");
  
  // Deserialize
  const payload = deserializeGhostContextPayload(decrypted);
  console.log("  ✅ Loaded:", payload.fileName);
  
  return payload;
}
