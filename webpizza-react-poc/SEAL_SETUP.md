# 🔐 Seal Encryption Setup Guide

## Understanding Seal Package ID

The **Seal Package ID** is the ID of **YOUR access policy package** that you deploy to Sui, not a pre-deployed Seal package. This package contains your `seal_approve` function that defines who can decrypt your encrypted data.

## Option 1: Deploy Your Own Access Policy Package (Recommended)

### Step 1: Create a Simple Access Policy

Create a Move file for your access policy. For GhostContext, you can use a simple policy that allows the owner to decrypt:

**File: `contracts/source/seal_policy.move`**

```move
module ghostcontext::seal_policy {
    use sui::tx_context::TxContext;

    /// Simple policy: Only the owner (policy ID = address) can decrypt
    public fun seal_approve(
        id: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Policy ID is the user's address
        // This allows the owner to decrypt their own data
        // You can add more complex logic here (NFT checks, time locks, etc.)
    }
}
```

### Step 2: Build and Deploy

```bash
cd contracts
sui move build
sui client publish --gas-budget 100000000
```

### Step 3: Get the Package ID

After deployment, you'll get a package ID. Add it to your `.env`:

```env
VITE_SEAL_PACKAGE_ID=0xYOUR_PACKAGE_ID_HERE
```

## Option 2: Use a Simple Example Package (For Testing)

If you want to test quickly, you can look for example packages in the Seal repository:

1. Check the [Seal Examples](https://github.com/MystenLabs/seal/tree/main/examples) directory
2. Look for pre-deployed test packages on testnet
3. Use a simple allowlist example if available

## Option 3: Use a Minimal Policy (Quick Start)

For GhostContext, since you're using the user's address as the policy ID, you can create a very simple policy:

```move
module ghostcontext::seal_policy {
    use sui::tx_context::TxContext;

    // Allow anyone with matching policy ID (user address) to decrypt
    public fun seal_approve(id: vector<u8>, ctx: &mut TxContext) {
        // No restrictions - policy ID must match user address
        // This is set in your encryptContext function
    }
}
```

## Current Implementation

Looking at your code in `src/ghostcontext/seal.ts`:

- **Policy ID** = User's address (line 29: `const policyId = userAddress;`)
- This means only the user who encrypted the data can decrypt it
- You need a `seal_approve` function that allows this

## Quick Setup Steps

1. **Add the Move module to your contract package:**

   ```bash
   # Add seal_policy.move to contracts/source/
   ```

2. **Update Move.toml** (if needed):

   ```toml
   [package]
   name = "ghostcontext"
   # ... existing config
   ```

3. **Build and deploy:**

   ```bash
   cd contracts
   sui move build
   sui client publish --gas-budget 100000000
   ```

4. **Get the package ID from the deployment output**

5. **Add to .env:**
   ```env
   VITE_SEAL_PACKAGE_ID=0xYOUR_DEPLOYED_PACKAGE_ID
   ```

## Testing Without Seal (Optional)

If you want to test the rest of your app first, you can temporarily comment out Seal encryption and use plain encryption, or deploy the Seal policy later.

## Resources

- **Seal Documentation**: https://seal-docs.wal.app/
- **Getting Started**: https://seal-docs.wal.app/GettingStarted/
- **Example Patterns**: https://seal-docs.wal.app/ExamplePatterns/
- **GitHub Repository**: https://github.com/MystenLabs/seal

## Important Notes

⚠️ **The Seal Package ID is YOUR package ID**, not a Mysten Labs package ID. You must deploy your own access policy package.

✅ For GhostContext, since you're using user addresses as policy IDs, a simple `seal_approve` function that accepts any ID will work (the encryption/decryption SDK handles the actual access control).
