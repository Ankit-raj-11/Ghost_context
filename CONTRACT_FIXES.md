# GhostContext Contract Fixes & Deployment

## Issues Fixed

### 1. ✅ Ownership Transfer Issue
**Problem**: No way to transfer ownership of a `ContextNFT` after creation.

**Solution**: Added `transfer_ownership` function that:
- Verifies the caller is the current owner
- Updates the `owner` field
- Emits an `OwnershipTransferred` event

```move
public entry fun transfer_ownership(
    nft: &mut ContextNFT,
    new_owner: address,
    ctx: &mut TxContext
)
```

### 2. ✅ Missing Event Definition
**Problem**: `OwnershipTransferred` event was referenced but not defined.

**Solution**: Added the event struct:
```move
public struct OwnershipTransferred has copy, drop {
    context_id: address,
    old_owner: address,
    new_owner: address,
}
```

### 3. ✅ Function Numbering
**Problem**: Function numbering was inconsistent after adding new functions.

**Solution**: Renumbered all functions sequentially (1-8).

### 4. ✅ Access Control Documentation
**Problem**: `consume_query` didn't clearly explain ownership enforcement.

**Solution**: Added comment explaining that Sui enforces ownership for owned objects (`QueryReceipt` has `key` and `store` abilities).

## Contract Structure

### Shared Objects
- **ContextNFT**: Shared so anyone can read/purchase, but only owner can modify listing
- **MarketplaceRegistry**: Shared global registry for marketplace stats

### Owned Objects
- **QueryReceipt**: Owned by buyer, proves purchase and tracks remaining queries

### Access Control
- Owner functions check: `assert!(nft.owner == tx_context::sender(ctx), ENotOwner)`
- Receipt functions: Ownership enforced by Sui (only owner can pass mutable reference)

## Deployment Script

Created `scripts/deploy.ts` with:
- ✅ Private key import and verification
- ✅ Balance checking
- ✅ Contract compilation check
- ✅ Transaction execution
- ✅ Registry ID extraction
- ✅ Deployment info saving

## Files Created/Modified

### Created
- `webpizza-react-poc/contracts/move.toml` - Move package configuration
- `webpizza-react-poc/scripts/deploy.ts` - TypeScript deployment script
- `webpizza-react-poc/contracts/DEPLOY.md` - Deployment guide
- `webpizza-react-poc/CONTRACT_FIXES.md` - This file

### Modified
- `webpizza-react-poc/contracts/source/contract.move` - Fixed ownership issues
- `webpizza-react-poc/package.json` - Added deploy script and dependencies

## Deployment Instructions

1. **Build the contract**:
   ```bash
   cd contracts
   sui move build
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

3. **Update .env** with values from `deployment-info.json`:
   ```env
   VITE_GHOSTCONTEXT_PACKAGE_ID=<package-id>
   VITE_GHOSTCONTEXT_REGISTRY_ID=<registry-id>
   ```

## Testing Checklist

- [ ] Contract compiles without errors
- [ ] Deployment succeeds
- [ ] Registry ID is correctly extracted
- [ ] Ownership transfer works
- [ ] Listing/unlisting works
- [ ] Purchase flow works
- [ ] Query consumption works

## Notes

- The contract uses shared objects for `ContextNFT` to allow public read access while maintaining owner-only write access
- Ownership is tracked via the `owner` field, not Sui's native ownership (since it's shared)
- `QueryReceipt` is an owned object, so Sui automatically enforces ownership for consume functions

