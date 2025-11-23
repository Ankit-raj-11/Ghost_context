# 🔐 Seal Integration Guide for GhostContext

## Overview

Seal provides threshold encryption for GhostContext, ensuring documents are encrypted at rest on Walrus and only decryptable by authorized users.

---

## ✅ Fixed Issue: TTL Error

### Problem
```
❌ UserError: Invalid TTL 60, must be between 1 and 30
```

### Solution
Changed session key TTL from 60 minutes to **30 minutes** (maximum allowed by Seal).

```typescript
// Before
ttlMin: 60  // ❌ Invalid

// After
ttlMin: 30  // ✅ Maximum allowed (1-30 range)
```

---

## 🔑 Session Key Limits

Seal enforces strict TTL (Time To Live) limits for session keys:

| Parameter | Min | Max | Current Setting |
|-----------|-----|-----|-----------------|
| `ttlMin` | 1 minute | 30 minutes | **30 minutes** |

**Why 30 minutes?**
- Maximum security window
- Enough time for document upload/chat
- Forces re-authentication for extended sessions
- Balances security vs UX

**To adjust:** Edit `SESSION_TTL_MINUTES` constant in `seal.ts`

---

## 🏗️ Architecture

### Encryption Flow
```
User Document
    ↓
Seal.encrypt() → Encrypted Blob
    ↓
Upload to Walrus → Blob ID
    ↓
Store Blob ID in Sui NFT → Context NFT
```

### Decryption Flow
```
User wants to chat
    ↓
Create Session Key (sign with wallet)
    ↓
Fetch from Walrus (Blob ID)
    ↓
Seal.decrypt() with Session Key
    ↓
Feed to Local LLM → Answer
```

---

## 📝 API Reference

### `encryptContext()`
Encrypt text data using Seal.

```typescript
const { encryptedBlob, policyId } = await encryptContext(
  textData: string,        // Data to encrypt
  userAddress: string,     // Sui wallet address
  sealPackageId: string    // Seal contract ID
);
```

**Returns:**
- `encryptedBlob`: Blob ready for Walrus upload
- `policyId`: Policy identifier (user's address)

**Example:**
```typescript
import { encryptContext } from './ghostcontext/seal';

const { encryptedBlob, policyId } = await encryptContext(
  "The treasure is buried under the palm tree.",
  "0xabc123...",
  process.env.VITE_SEAL_PACKAGE_ID
);
```

---

### `createSessionKey()`
Create a session key for decryption (requires wallet signature).

```typescript
const sessionKey = await createSessionKey(
  userAddress: string,     // Sui wallet address
  walletSigner: {          // Wallet object
    signPersonalMessage: (args) => Promise<{ signature: string }>
  },
  sealPackageId: string    // Seal contract ID
);
```

**Session Duration:** 30 minutes (max allowed)

**Example:**
```typescript
import { createSessionKey } from './ghostcontext/seal';

const sessionKey = await createSessionKey(
  currentAccount.address,
  currentAccount,
  process.env.VITE_SEAL_PACKAGE_ID
);
```

---

### `decryptContext()`
Decrypt Seal-encrypted data using a session key.

```typescript
const decryptedText = await decryptContext(
  encryptedJsonString: string,  // JSON string from Walrus
  sessionKey: SessionKey        // Valid session key
);
```

**Throws:** Error if session expired or invalid

**Example:**
```typescript
import { decryptContext } from './ghostcontext/seal';

const decryptedText = await decryptContext(
  walrusContent,
  sessionKey
);
```

---

## 🔄 Complete Workflow Example

### Upload & Encrypt
```typescript
import { encryptContext } from './ghostcontext/seal';
import { uploadToWalrus } from './ghostcontext/walrus';

// 1. Prepare document
const documentText = "Secret content...";

// 2. Encrypt with Seal
const { encryptedBlob, policyId } = await encryptContext(
  documentText,
  userWalletAddress,
  sealPackageId
);

// 3. Upload to Walrus
const blobId = await uploadToWalrus(encryptedBlob);

// 4. Store blob ID (in NFT or database)
console.log(`Encrypted document stored: ${blobId}`);
```

### Fetch & Decrypt
```typescript
import { createSessionKey, decryptContext } from './ghostcontext/seal';
import { fetchFromWalrus } from './ghostcontext/walrus';

// 1. Create session key (user signs)
const sessionKey = await createSessionKey(
  userWalletAddress,
  wallet,
  sealPackageId
);

// 2. Fetch encrypted data from Walrus
const encryptedData = await fetchFromWalrus(blobId);

// 3. Decrypt with session key
const decryptedText = await decryptContext(
  encryptedData,
  sessionKey
);

// 4. Use in RAG pipeline
await ragEngine.ingest(decryptedText);
```

---

## ⚠️ Common Errors

### 1. Invalid TTL
```
UserError: Invalid TTL 60, must be between 1 and 30
```
**Solution:** TTL is now fixed to 30 minutes (max allowed)

### 2. Session Expired
```
Error: Could not unlock GhostContext. Session key may be invalid or expired.
```
**Solution:** Create a new session key (user must re-sign)

### 3. Missing Package ID
```
Error: Seal package id missing. Set VITE_SEAL_PACKAGE_ID.
```
**Solution:** Set environment variable:
```bash
VITE_SEAL_PACKAGE_ID=0xYourPackageId
```

### 4. Wallet Not Connected
```
Error: Cannot read property 'signPersonalMessage' of undefined
```
**Solution:** Connect wallet before creating session key

---

## 🔐 Security Best Practices

### ✅ DO
- ✅ Create new session key for each document access
- ✅ Let session keys expire (don't extend)
- ✅ Store blob IDs in Sui NFTs for access control
- ✅ Verify wallet ownership before decryption
- ✅ Clear decrypted data from memory after use

### ❌ DON'T
- ❌ Store session keys permanently
- ❌ Share session keys between users
- ❌ Use expired session keys
- ❌ Store decrypted data in localStorage
- ❌ Log sensitive decrypted content

---

## 🧪 Testing

Test your Seal integration:

```typescript
import { encryptContext, createSessionKey, decryptContext } from './ghostcontext/seal';

async function testSealIntegration() {
  // Test data
  const secret = "The vault code is 1234";
  
  // 1. Encrypt
  const { encryptedBlob, policyId } = await encryptContext(
    secret,
    userAddress,
    sealPackageId
  );
  console.log('✅ Encryption successful');
  
  // 2. Create session
  const sessionKey = await createSessionKey(
    userAddress,
    wallet,
    sealPackageId
  );
  console.log('✅ Session key created');
  
  // 3. Decrypt
  const blobText = await encryptedBlob.text();
  const decrypted = await decryptContext(blobText, sessionKey);
  
  // 4. Verify
  if (decrypted === secret) {
    console.log('✅ Encryption/decryption cycle successful!');
  } else {
    console.error('❌ Content mismatch!');
  }
}
```

---

## 📊 Performance

| Operation | Time | Notes |
|-----------|------|-------|
| Encrypt | ~100-500ms | Depends on data size |
| Create Session Key | ~1-3s | Requires wallet signature |
| Decrypt | ~200-800ms | Depends on data size |

**Optimization Tips:**
- Chunk large documents
- Cache session keys (within TTL)
- Parallelize multiple decryptions
- Use WebWorkers for heavy encryption

---

## 🎯 Next Steps

1. **✅ Seal Integration Working** ← You are here
2. **🔗 Connect Sui Smart Contract** - NFT minting for access control
3. **🎨 Build Upload UI** - User-friendly document upload
4. **💬 Integrate with Chat** - Decrypt-on-demand for queries
5. **💰 Add Pay-Per-Query** - Monetize private documents

---

## 📚 Resources

- [Seal Documentation](https://docs.mystenlabs.com/seal)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [GhostContext Architecture](./PROJECT_SUMMARY.md)
- [Walrus Integration](./WALRUS_TESTING.md)

---

## 🐛 Debug Tips

Enable verbose logging:
```typescript
// In seal.ts, add more console.logs
console.log('Session key:', sessionKey);
console.log('Encrypted object:', encryptedObject);
```

Check Sui transaction status:
```typescript
import { getFullnodeUrl } from "@mysten/sui/client";
const sui = new SuiClient({ url: getFullnodeUrl("testnet") });
const txDetails = await sui.getTransactionBlock({ digest: txHash });
```

---

Made with 🔐 for GhostContext


