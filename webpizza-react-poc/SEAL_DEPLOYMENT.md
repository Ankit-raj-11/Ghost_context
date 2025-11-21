# 🚀 Seal Policy Deployment Guide

## Quick Start

I've created a simple Seal access policy module for you at `contracts/source/seal_policy.move`. 

### Option 1: Deploy Both Modules Together (Easiest)

Since both `ghostcontext` and `seal_policy` are in the same package, you can deploy them together:

```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

**Important**: This will deploy a NEW package. You'll get a new package ID that includes both modules.

### Option 2: Deploy Seal Policy Separately (Recommended)

If you want to keep your existing GhostContext package ID, deploy the Seal policy as a separate package:

1. **Create a new Move.toml for Seal policy:**
   ```toml
   [package]
   name = "ghostcontext-seal"
   version = "1.0.0"

   [dependencies]
   Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

   [addresses]
   ghostcontext = "0x0"
   ```

2. **Copy seal_policy.move to a new directory:**
   ```bash
   mkdir contracts-seal
   # Copy Move.toml and seal_policy.move
   ```

3. **Deploy:**
   ```bash
   cd contracts-seal
   sui move build
   sui client publish --gas-budget 100000000
   ```

4. **Get the package ID from the output and add to .env:**
   ```env
   VITE_SEAL_PACKAGE_ID=0xYOUR_SEAL_PACKAGE_ID
   ```

## What the Seal Policy Does

The `seal_policy.move` module defines a simple access control:

- **Policy ID** = User's wallet address (set during encryption in `seal.ts`)
- **Access Control**: Only the user whose address matches the policy ID can decrypt
- **Future Enhancement**: You can add NFT checks, time locks, or subscription checks here

## Testing the Deployment

After deployment:

1. **Update .env** with the Seal package ID
2. **Restart your dev server**: `npm run dev`
3. **Test encryption**:
   - Upload a document
   - Click "Seal Encrypt + Upload"
   - Should encrypt and upload to Walrus successfully

## Troubleshooting

### "Seal package id missing" Error
- Make sure `VITE_SEAL_PACKAGE_ID` is set in `.env`
- Restart the dev server after updating `.env`

### "Access denied" during decryption
- Verify the policy ID (user address) matches the wallet address
- Check that the `seal_approve` function is deployed correctly

### Build Errors
- Make sure you're using the correct Sui framework version
- Check that `seal_policy.move` is in the correct location

## Next Steps

Once deployed, your GhostContext app will be able to:
- ✅ Encrypt documents with Seal
- ✅ Upload encrypted data to Walrus
- ✅ Decrypt data locally (only by the owner)
- ✅ Mint NFTs for encrypted contexts

## Resources

- Seal Documentation: https://seal-docs.wal.app/
- Seal Examples: https://github.com/MystenLabs/seal/tree/main/examples

