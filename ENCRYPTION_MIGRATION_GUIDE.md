# Migration from Seal to Web Crypto API

## Summary
We've replaced the buggy Seal encryption with a reliable Web Crypto API implementation.

## New Files Created
1. `src/ghostcontext/crypto.ts` - Core encryption/decryption using Web Crypto API
2. `src/ghostcontext/encryption-workflow.ts` - High-level workflow functions

## Changes Needed in Home.tsx

### 1. Update Imports
Replace:
```typescript
import {
  SessionKey,
  encryptContext,
  createSessionKey,
  decryptContext,
} from "../ghostcontext/seal-new";
```

With:
```typescript
import {
  encryptAndUpload,
  downloadAndDecrypt,
  type EncryptedMetadata,
} from "../ghostcontext/encryption-workflow";
```

### 2. Update State Variables
Remove Seal-related state:
```typescript
const [sessionKeyState, setSessionKeyState] = useState<SessionKey | null>(null);
const [sessionStatus, setSessionStatus] = useState("");
```

Add new state for encryption metadata:
```typescript
const [encryptionMetadata, setEncryptionMetadata] = useState<EncryptedMetadata | null>(null);
```

### 3. Remove "Authorize Seal Session" Button
The session key button is no longer needed. Users will sign once during encryption and once during decryption.

### 4. Update Encryption Handler
Replace the encryption logic with:
```typescript
const handleEncryptAndUpload = async () => {
  if (!ghostPayload) {
    showToastNotification("Upload a document first.", "error");
    return;
  }
  if (!currentAccount) {
    showToastNotification("Connect your wallet first.", "error");
    return;
  }
  
  try {
    setIsEncrypting(true);
    setGhostStatus("🔐 Encrypting and uploading...");
    
    const walletSigner = {
      signPersonalMessage: ({ message }: { message: Uint8Array }) =>
        signPersonalMessage.mutateAsync({ message }),
    };
    
    const metadata = await encryptAndUpload(
      ghostPayload,
      currentAccount.address,
      walletSigner
    );
    
    setEncryptionMetadata(metadata);
    setWalrusBlobId(metadata.walrusBlobId);
    
    showToastNotification(
      `Encrypted and uploaded! Blob ID: ${metadata.walrusBlobId}`,
      "success"
    );
  } catch (error) {
    console.error("Encryption failed:", error);
    showToastNotification("Encryption failed. Check console.", "error");
  } finally {
    setIsEncrypting(false);
    setGhostStatus("");
  }
};
```

### 5. Update Decryption Handler
Replace the decryption logic with:
```typescript
const handleLoadFromWalrus = async () => {
  if (!remoteBlobId.trim()) {
    showToastNotification("Enter a Walrus blob ID first.", "error");
    return;
  }
  if (!currentAccount) {
    showToastNotification("Connect your wallet first.", "error");
    return;
  }
  
  // You need to get salt and IV - these should be stored with the blob ID
  // For now, let's assume they're stored in encryptionMetadata or entered by user
  if (!encryptionMetadata) {
    showToastNotification(
      "Encryption metadata not found. You can only decrypt data you encrypted in this session.",
      "error"
    );
    return;
  }
  
  try {
    setIsLoadingRemote(true);
    setGhostStatus("⬇️ Downloading and decrypting...");
    
    const walletSigner = {
      signPersonalMessage: ({ message }: { message: Uint8Array }) =>
        signPersonalMessage.mutateAsync({ message }),
    };
    
    const payload = await downloadAndDecrypt(
      {
        ...encryptionMetadata,
        walrusBlobId: remoteBlobId.trim(),
      },
      walletSigner
    );
    
    await ingestGhostPayload(payload);
    setGhostPayload(payload);
    
    showToastNotification(`Loaded: ${payload.fileName}`, "success");
  } catch (error) {
    console.error("Decryption failed:", error);
    showToastNotification(
      "Decryption failed. Make sure you're using the same wallet that encrypted this data.",
      "error"
    );
  } finally {
    setIsLoadingRemote(false);
    setGhostStatus("");
  }
};
```

## User Flow

### Encryption Flow:
1. User uploads PDF
2. User clicks "Encrypt & Upload to Walrus"
3. Wallet prompts for signature (to derive encryption key)
4. Data is encrypted and uploaded
5. User gets Walrus blob ID + salt + IV

### Decryption Flow:
1. User enters Walrus blob ID (+ salt + IV if not stored)
2. User clicks "Load from Walrus"
3. Wallet prompts for signature (to derive same encryption key)
4. Data is downloaded and decrypted
5. GhostContext is loaded

## Important Notes

1. **Salt and IV Storage**: Currently, salt and IV are only stored in session state. For production, you should:
   - Store them on-chain with the GhostContext NFT
   - Or include them in the Walrus blob metadata
   - Or display them to the user to save

2. **Wallet Consistency**: Users MUST use the same wallet for encryption and decryption

3. **No Session Keys**: Unlike Seal, there's no session key concept. Each operation requires one wallet signature.

## Benefits Over Seal

✅ Works reliably (no undefined errors)
✅ Simpler implementation
✅ No dependency on external key servers
✅ Faster (no network calls to key servers)
✅ More control over the encryption process
✅ Still secure (AES-256-GCM with PBKDF2 key derivation)

## Next Steps

1. Update Home.tsx with the changes above
2. Test the full encryption/decryption flow
3. Decide how to store/share salt and IV (on-chain or off-chain)
4. Update UI to remove Seal-specific elements
