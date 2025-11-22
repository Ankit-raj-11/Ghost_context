# Required Changes to Home.tsx

## Step 1: Update Imports (Line ~16)

**Remove this line:**
```typescript
import { encryptData, decryptData } from "../ghostcontext/crypto";
```

**Add this line:**
```typescript
import {
  encryptAndUpload,
  downloadAndDecrypt,
  type EncryptedMetadata,
} from "../ghostcontext/encryption-workflow";
```

## Step 2: Remove Seal-related imports (Line ~22)
**Remove:**
```typescript
import { deserializeSealObject } from "../ghostcontext/seal-serialization";
```

## Step 3: Update State Variables (Around line 70-75)

**Remove these lines:**
```typescript
const [sessionKeyState, setSessionKeyState] = useState<SessionKey | null>(null);
const [sessionStatus, setSessionStatus] = useState("");
```

**Add this line:**
```typescript
const [encryptionMetadata, setEncryptionMetadata] = useState<EncryptedMetadata | null>(null);
```

## Step 4: Remove sealPackageId (Around line 95)
**Remove:**
```typescript
const sealPackageId = import.meta.env.VITE_SEAL_PACKAGE_ID as string | undefined;
```

## Step 5: Find and Replace Encryption Function

Search for a function that handles encryption (might be called `handleEncryptAndUpload`, `handleSealAndUpload`, or similar).

**Replace it with:**
```typescript
const handleEncryptAndUpload = async () => {
  if (!ghostPayload) {
    showToastNotification("Upload a document before encrypting.", "error");
    return;
  }
  if (!currentAccount) {
    showToastNotification("Connect a Sui wallet first.", "error");
    return;
  }
  
  try {
    setIsEncrypting(true);
    setGhostStatus("🔐 Encrypting with your wallet...");
    
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
    setPolicyId(currentAccount.address);
    
    // Update payload with metadata
    setGhostPayload({
      ...ghostPayload,
      walrusBlobId: metadata.walrusBlobId,
      policyId: currentAccount.address,
    });
    
    showToastNotification(
      `Context encrypted & uploaded! Blob ID: ${metadata.walrusBlobId.substring(0, 20)}...`,
      "success"
    );
  } catch (error: any) {
    console.error("Encryption failed:", error);
    showToastNotification(
      `Encryption failed: ${error.message || "Unknown error"}`,
      "error"
    );
  } finally {
    setIsEncrypting(false);
    setGhostStatus("");
  }
};
```

## Step 6: Find and Replace Decryption Function

Search for a function that handles decryption from Walrus (might be called `handleLoadFromWalrus` or similar).

**Replace it with:**
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
  if (!encryptionMetadata) {
    showToastNotification(
      "Encryption metadata not found. You can only decrypt data you encrypted in this session. For production, store salt/IV on-chain or with the blob.",
      "error"
    );
    return;
  }
  
  try {
    setIsLoadingRemote(true);
    setGhostStatus("⬇️ Downloading from Walrus...");
    
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
    
    setGhostStatus("📦 Loading context...");
    await ingestGhostPayload(payload);
    setGhostPayload(payload);
    setWalrusBlobId(remoteBlobId.trim());
    setPolicyId(payload.policyId || currentAccount.address);
    
    showToastNotification(
      `GhostContext "${payload.fileName}" loaded successfully!`,
      "success"
    );
  } catch (error: any) {
    console.error("Failed to load GhostContext:", error);
    showToastNotification(
      `Failed to load: ${error.message || "Make sure you're using the same wallet that encrypted this data."}`,
      "error"
    );
  } finally {
    setIsLoadingRemote(false);
    setGhostStatus("");
  }
};
```

## Step 7: Remove Session Key Function

Search for and **DELETE** the function that creates session keys (might be called `handleCreateSealSession` or similar). This is no longer needed.

## Step 8: Update UI - Remove "Authorize Seal Session" Button

In the JSX/return section, find and remove the button that says "Authorize Seal Session" or similar. Users no longer need to create session keys.

## Step 9: Update Button Labels

Find the button that triggers encryption and update its label:
- Change from: "Seal & Upload to Walrus"
- Change to: "Encrypt & Upload to Walrus"

## Testing the Changes

After making these changes:

1. **Refresh the browser** (Ctrl+Shift+R)
2. **Connect your wallet**
3. **Upload a PDF**
4. **Click "Encrypt & Upload to Walrus"**
   - Wallet will prompt for signature
   - Data will be encrypted and uploaded
   - You'll get a Blob ID
5. **Click "Load from Walrus"** with the same Blob ID
   - Wallet will prompt for signature again
   - Data will be decrypted and loaded

## Important Notes

- Users MUST use the SAME wallet for encryption and decryption
- Currently, salt/IV are only stored in session state
- For production, you should store salt/IV on-chain with the GhostContext NFT
- Each encrypt/decrypt operation requires ONE wallet signature (no session keys)

## If You Get Stuck

The new encryption system is much simpler than Seal:
- No session keys
- No key servers
- No complex setup
- Just: wallet signature → derive key → encrypt/decrypt

All the complex logic is handled in `src/ghostcontext/crypto.ts` and `src/ghostcontext/encryption-workflow.ts`.
