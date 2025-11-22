# Current Implementation Limitation

## ⚠️ Important: Using OLD Contract

Your deployed contract does **NOT** have encryption keys stored on-chain.

### Current Contract Structure (Deployed)

```move
public struct ContextNFT has key {
    id: UID,
    title: String,
    walrus_blob_id: String,
    // ❌ NO encryption_key field
    // ❌ NO iv field
    owner: address,
    is_listed: bool,
    price_per_query: u64,
    total_revenue: u64,
    total_queries_sold: u64,
    category: String,
}
```

### What This Means

✅ **Works:**
- Upload PDF and encrypt locally
- Upload encrypted blob to Walrus
- Mint NFT with blob ID
- List NFT for sale
- Purchase queries
- Decrypt in **same browser session** (keys stored in memory)

❌ **Doesn't Work:**
- Decrypt after page refresh (keys lost)
- Decrypt on different device
- Buyer cannot decrypt purchased content
- NFT is not transferable with decryption ability

### Current Flow

```
Creator:
1. Upload PDF → Encrypt with random key
2. Keys stored in browser memory (encryptionMetadata state)
3. Upload to Walrus → Get blob ID
4. Mint NFT → Only blob ID stored on-chain
5. List for sale

Buyer:
1. Purchase queries → Get QueryReceipt
2. ❌ Cannot decrypt because keys are NOT on-chain
3. ❌ Cannot access the content
```

---

## Solution: Deploy Updated Contract

To enable full functionality (Option A), you need to deploy the updated contract.

### Updated Contract (in your local file)

```move
public struct ContextNFT has key {
    id: UID,
    title: String,
    walrus_blob_id: String,
    encryption_key: String,  // ✅ NEW
    iv: String,              // ✅ NEW
    owner: address,
    is_listed: bool,
    price_per_query: u64,
    total_revenue: u64,
    total_queries_sold: u64,
    category: String,
}
```

### Deployment Steps

```bash
# 1. Clean and build
cd contracts
./DEEP_CLEAN.sh
sui move build

# 2. Deploy to testnet
sui client publish --gas-budget 100000000

# 3. Note the output:
# - PackageID: 0xNEW_PACKAGE_ID
# - Registry Object: 0xNEW_REGISTRY_ID

# 4. Update .env
VITE_GHOSTCONTEXT_PACKAGE_ID=0xNEW_PACKAGE_ID
VITE_GHOSTCONTEXT_REGISTRY_ID=0xNEW_REGISTRY_ID

# 5. Restart dev server
npm run dev
```

### After Deployment

Once deployed, the frontend will automatically:
- Store encryption keys on-chain when minting
- Buyers can decrypt purchased content
- NFTs are fully transferable
- Works across devices and sessions

---

## Current Workaround

For now, you can test the system with these limitations:

1. **Same Session Testing:**
   - Upload, encrypt, mint, list in one session
   - Don't refresh the page
   - Keys stay in memory

2. **Manual Key Management:**
   - Save encryption keys manually (copy from console)
   - Store them securely
   - Manually input them when needed

3. **Local Testing Only:**
   - Test the full flow without page refresh
   - Verify encryption/decryption works
   - Test marketplace browsing and purchase

---

## Next Steps

**Option 1: Deploy Updated Contract** (Recommended)
- Full functionality
- Keys stored on-chain
- Buyers can decrypt
- NFTs are transferable

**Option 2: Keep Current Contract**
- Limited functionality
- Keys only in memory
- Cannot decrypt after refresh
- Buyers cannot access content

---

**Current Status:** Frontend reverted to work with OLD contract
**Recommendation:** Deploy updated contract for full Option A functionality
