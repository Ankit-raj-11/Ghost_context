/**
 * Web Crypto API based encryption/decryption
 * Uses wallet signature to derive encryption keys
 */

// Derive an encryption key from a wallet signature
async function deriveKeyFromSignature(signature: string, salt: Uint8Array): Promise<CryptoKey> {
  // Convert signature to bytes
  const signatureBytes = new TextEncoder().encode(signature);
  
  // Import as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    signatureBytes,
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // Derive AES-GCM key
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptData(
  data: string,
  walletSigner: {
    signPersonalMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>;
  }
): Promise<{ encryptedBlob: Blob; salt: string; iv: string }> {
  console.log("CRYPTO: Starting encryption");
  console.log("  Data length:", data.length);
  
  // Create a deterministic message for the wallet to sign
  const message = new TextEncoder().encode("GhostContext Encryption Key");
  
  console.log("  Requesting wallet signature...");
  const { signature } = await walletSigner.signPersonalMessage({ message });
  console.log("  Signature received");
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive encryption key from signature
  const key = await deriveKeyFromSignature(signature, salt);
  
  // Encrypt the data
  const dataBytes = new TextEncoder().encode(data);
  const encryptedBytes = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    dataBytes
  );
  
  console.log("  Encrypted:", encryptedBytes.byteLength, "bytes");
  
  return {
    encryptedBlob: new Blob([encryptedBytes], { type: "application/octet-stream" }),
    salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
    iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
  };
}

export async function decryptData(
  encryptedBytes: Uint8Array,
  salt: string,
  iv: string,
  walletSigner: {
    signPersonalMessage: (args: { message: Uint8Array }) => Promise<{ signature: string }>;
  }
): Promise<string> {
  console.log("CRYPTO: Starting decryption");
  console.log("  Encrypted data length:", encryptedBytes.length);
  
  // Sign the same message to derive the same key
  const message = new TextEncoder().encode("GhostContext Encryption Key");
  
  console.log("  Requesting wallet signature...");
  const { signature } = await walletSigner.signPersonalMessage({ message });
  console.log("  Signature received");
  
  // Convert salt and IV from hex
  const saltBytes = new Uint8Array(salt.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  const ivBytes = new Uint8Array(iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  // Derive the same key
  const key = await deriveKeyFromSignature(signature, saltBytes);
  
  // Decrypt
  try {
    const decryptedBytes = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      key,
      encryptedBytes
    );
    
    console.log("  Decrypted:", decryptedBytes.byteLength, "bytes");
    return new TextDecoder().decode(decryptedBytes);
  } catch (error) {
    console.error("  Decryption failed:", error);
    throw new Error("Decryption failed. Make sure you're using the same wallet that encrypted this data.");
  }
}
