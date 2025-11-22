# 🐋 Walrus Integration Testing Guide

## Quick Start

### Option 1: Visual Test Page (Recommended)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   ```
   http://localhost:3000/walrus-test
   ```

3. **Run tests:**
   - Click "⚡ Quick Test" for a fast verification
   - Or run individual tests to see detailed output
   - Or click "🚀 Run All Tests" for comprehensive testing

### Option 2: Browser Console

1. **Open your app in the browser**

2. **Open browser console** (F12)

3. **Import and run tests:**
   ```javascript
   // Quick test
   import { quickTest } from './src/ghostcontext/walrus-test';
   await quickTest();
   
   // Or run all tests
   import { runAllWalrusTests } from './src/ghostcontext/walrus-test';
   await runAllWalrusTests();
   ```

### Option 3: Programmatic Testing

Add this to any component:

```typescript
import { quickTest, runAllWalrusTests } from '../ghostcontext/walrus-test';

// In your component or useEffect
const testWalrus = async () => {
  try {
    await runAllWalrusTests();
    console.log('✅ All Walrus tests passed!');
  } catch (error) {
    console.error('❌ Walrus tests failed:', error);
  }
};
```

---

## What Was Fixed

### Previous Issues ❌
1. **Wrong endpoint**: `/v1/store` → Should be `/v1/blobs`
2. **Wrong aggregator URL**: `/v1/{blobId}` → Should be `/v1/blobs/{blobId}`
3. **Using axios**: Extra dependency, less browser-friendly
4. **No error handling**: Silent failures
5. **No logging**: Hard to debug

### Current Implementation ✅
1. **Correct endpoints**: `/v1/blobs` for upload/download
2. **Proper URL structure**: `/v1/blobs/{blobId}` for aggregator
3. **Native fetch**: No external dependencies
4. **Comprehensive logging**: See exactly what's happening
5. **Error handling**: Clear error messages
6. **TypeScript types**: Full type safety

---

## Test Suite Overview

### Test 1: Simple Text Upload
```
📝 Uploads: "The treasure is buried under the palm tree."
🔍 Verifies: Upload success, download success, content integrity
✅ Expected: Content matches exactly after round-trip
```

### Test 2: JSON Payload Upload
```
📦 Uploads: JSON object with secrets and metadata
🔍 Verifies: JSON serialization, parsing, secret preservation
✅ Expected: All JSON fields preserved correctly
```

### Test 3: Binary Data Upload
```
🔒 Uploads: XOR-encrypted binary data
🔍 Verifies: Binary handling, encryption/decryption cycle
✅ Expected: Decrypted content matches original
```

---

## Understanding the Output

### Successful Upload
```
📤 Uploading 45 bytes to Walrus...
🌐 Publisher: https://publisher.walrus-testnet.walrus.space
✅ File uploaded successfully!
📦 Blob ID: abc123xyz...
💰 Cost: 1234 MIST
```

### Successful Download
```
📥 Fetching blob from Walrus: abc123xyz...
🌐 Aggregator: https://aggregator.walrus-testnet.walrus.space
✅ Downloaded 45 characters from Walrus
```

### Error Example
```
❌ Upload failed: 500 - Internal Server Error
❌ Walrus Upload Error: Error: Walrus upload failed: 500
```

---

## Common Issues & Solutions

### Issue: "Network Error" or "Failed to fetch"

**Possible Causes:**
1. Walrus testnet is down
2. Browser CORS issues
3. Internet connection issues

**Solutions:**
1. Check Walrus testnet status
2. Verify you're using correct URLs
3. Check browser console for CORS errors
4. Try different browser

### Issue: "Blob ID not found"

**Possible Causes:**
1. Upload failed but error was swallowed
2. Blob expired (rare on testnet)
3. Wrong aggregator URL

**Solutions:**
1. Re-run upload and check for errors
2. Verify the blob ID is correct
3. Check aggregator URL format

### Issue: "Content mismatch"

**Possible Causes:**
1. Encoding issues
2. Binary data corruption
3. Network interruption

**Solutions:**
1. Check file encoding
2. Verify blob size matches
3. Re-upload and test again

---

## Integration with GhostContext

Once Walrus is working, here's how it integrates:

### 1. Upload Encrypted Document
```typescript
import { uploadToWalrus } from './ghostcontext';
import { encryptWithSeal } from './seal'; // Coming soon

// Encrypt document with Seal
const encrypted = await encryptWithSeal(documentData);

// Upload to Walrus
const blobId = await uploadToWalrus(encrypted);

// Store blob ID in Sui NFT
await mintContextNFT(blobId, metadata);
```

### 2. Fetch and Decrypt
```typescript
import { fetchFromWalrus } from './ghostcontext';
import { decryptWithSeal } from './seal'; // Coming soon

// Fetch from Walrus
const encrypted = await fetchFromWalrus(blobId);

// Decrypt with Seal
const decrypted = await decryptWithSeal(encrypted);

// Use in RAG pipeline
await ragEngine.ingest(decrypted);
```

### 3. Access Control
```typescript
// Check if user owns the NFT
const hasAccess = await checkNFTOwnership(walletAddress, blobId);

if (hasAccess) {
  const data = await fetchFromWalrus(blobId);
  // ... use data
}
```

---

## Next Steps

### ✅ Completed
- [x] Walrus upload/download working
- [x] Browser-compatible implementation
- [x] Comprehensive test suite
- [x] Visual test interface

### 🚧 In Progress (Your Next Tasks)
- [ ] Integrate Seal encryption
- [ ] Connect Sui smart contract
- [ ] Implement NFT-based access control
- [ ] Add pay-per-query mechanism

### 🎯 Future Enhancements
- [ ] Chunked uploads for large files
- [ ] Progress indicators for uploads
- [ ] Caching layer
- [ ] Multi-file support

---

## Verification Checklist

Before moving to the next phase, verify:

- [ ] Quick test passes (`quickTest()`)
- [ ] Test 1 (Simple Upload) passes
- [ ] Test 2 (JSON Upload) passes
- [ ] Test 3 (Binary Upload) passes
- [ ] Can see blob IDs in console
- [ ] Can access blobs via direct URL
- [ ] No CORS errors in console
- [ ] Upload/download times are reasonable

---

## Direct URL Testing

Once you have a blob ID, you can verify it directly:

```
https://aggregator.walrus-testnet.walrus.space/v1/blobs/YOUR_BLOB_ID
```

This should show your uploaded content in the browser.

---

## Support

If tests are still failing:

1. **Check test output carefully** - Error messages are detailed
2. **Try Quick Test first** - Simplest verification
3. **Test direct URL** - Verify Walrus is accessible
4. **Check browser console** - Look for CORS or network errors
5. **Verify endpoints** - Make sure URLs match documentation

---

## 🎉 Success Criteria

You know Walrus is working when:
- ✅ All tests show green checkmarks
- ✅ Blob IDs are returned successfully
- ✅ Content matches after round-trip
- ✅ Direct URL shows your content
- ✅ No errors in console

**Once this passes, you're ready to integrate Seal encryption! 🔐**

---

Made with 🍕 for GhostContext

