# GhostContext Contract Deployment Guide

## Prerequisites

1. **Sui CLI** installed and configured
   ```bash
   # Install Sui CLI (if not already installed)
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
   ```

2. **Node.js dependencies** installed
   ```bash
   npm install
   ```

3. **Testnet SUI tokens** (at least 0.1 SUI)
   - Get from: https://discord.gg/sui (#testnet-faucet)
   - Command: `!faucet <your-address>`

## Contract Fixes Applied

✅ **Fixed Issues:**
1. Added `transfer_ownership` function to allow ownership transfers
2. Added `OwnershipTransferred` event for tracking ownership changes
3. Fixed function numbering consistency
4. Added proper comments for ownership enforcement

## Deployment Steps

### Step 1: Build the Contract

```bash
cd contracts
sui move build
```

This will compile the Move contract and create bytecode modules in `build/ghostcontext/bytecode_modules/`.

### Step 2: Deploy Using TypeScript Script

```bash
# From project root
npm run deploy
```

The script will:
- Connect to Sui testnet
- Verify your wallet address
- Check your balance
- Deploy the contract
- Save deployment info to `deployment-info.json`

### Step 3: Update Environment Variables

After deployment, update your `.env` file with the values from `deployment-info.json`:

```env
VITE_GHOSTCONTEXT_PACKAGE_ID=<package-id-from-deployment>
VITE_GHOSTCONTEXT_REGISTRY_ID=<registry-id-from-deployment>
VITE_SEAL_PACKAGE_ID=<your-seal-package-id>
```

## Contract Functions

### Owner Functions (require owner field match)
- `list_context` - List a context for sale
- `unlist_context` - Remove from marketplace
- `update_price` - Change the price per query
- `transfer_ownership` - Transfer ownership to another address

### Public Functions
- `create_context` - Create and share a new context NFT
- `purchase_queries` - Buy query credits for a listed context
- `consume_query` - Use one query from a receipt
- `consume_queries_batch` - Use multiple queries at once

## Important Notes

1. **Shared Objects**: `ContextNFT` and `MarketplaceRegistry` are shared objects, meaning anyone can read them, but only the owner (stored in the `owner` field) can modify listing settings.

2. **Ownership**: Ownership is tracked via the `owner` field in `ContextNFT`. The `transfer_ownership` function allows changing ownership.

3. **QueryReceipt**: This is an owned object, so only the owner can pass it as a mutable reference to `consume_query`.

4. **Registry**: The `MarketplaceRegistry` is created during `init()` and shared automatically. The deployment script will extract its ID from the deployment transaction.

## Troubleshooting

### Build Errors
- Ensure `move.toml` is properly configured
- Check that Sui framework dependencies are correct

### Deployment Errors
- Verify you have sufficient SUI balance (≥0.1 SUI)
- Check that the private key matches the expected address
- Ensure network connectivity to Sui testnet

### Runtime Errors
- Verify all environment variables are set correctly
- Check that the registry shared version is fetched correctly in the frontend

