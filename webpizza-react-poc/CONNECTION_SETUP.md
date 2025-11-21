# 🔗 GhostContext Contract Connection Setup

## ✅ Configuration Complete

Your deployed Sui smart contract has been connected to the frontend application.

### Environment Variables Configured

The following environment variables have been set in `.env`:

```env
VITE_GHOSTCONTEXT_PACKAGE_ID=0x7bb1869916ab70453bb935830d664cba9ea46889e69d42e20bfe025714da0bf8
VITE_GHOSTCONTEXT_REGISTRY_ID=0x6904ac9eab9c8011e50503c98ff6eda8b900fce8a10c4242d751658e59769fff
```

### Deployment Information

- **Package ID**: `0x7bb1869916ab70453bb935830d664cba9ea46889e69d42e20bfe025714da0bf8`
- **Registry Object ID**: `0x6904ac9eab9c8011e50503c98ff6eda8b900fce8a10c4242d751658e59769fff`
- **Registry Shared Version**: `349180993` (auto-fetched by frontend)
- **Network**: Sui Testnet
- **Transaction**: `6p3upN1qetcWNheC3LStH84DWdVCvnptqXFb8gFrd2eK`

### How It Works

1. **Automatic Registry Fetch**: The frontend automatically fetches the registry shared version when the app loads (see `Home.tsx` lines 227-241)

2. **Contract Functions Available**:

   - `create_context` - Mint a new GhostContext NFT
   - `list_context` - List a context for sale
   - `unlist_context` - Remove from marketplace
   - `update_price` - Change the price per query
   - `purchase_queries` - Buy query credits
   - `consume_query` - Use a query from a receipt
   - `transfer_ownership` - Transfer ownership

3. **Frontend Integration**:
   - The `handleMintContext` function uses the package ID and registry ID
   - All contract calls are made through `@mysten/dapp-kit`
   - Events are parsed to extract context IDs

### Next Steps

1. **Restart Development Server**:

   ```bash
   # Stop the current server (Ctrl+C) and restart
   npm run dev
   ```

2. **Test the Connection**:

   - Connect your Sui wallet (testnet)
   - Upload a document
   - Encrypt and upload to Walrus
   - Try minting a GhostContext NFT

3. **Optional: Seal Package ID**:
   If you want to use Seal encryption, add to `.env`:
   ```env
   VITE_SEAL_PACKAGE_ID=your_seal_package_id_here
   ```

### Troubleshooting

If the registry shared version isn't being fetched:

1. Check browser console for errors
2. Verify the registry object ID is correct
3. Ensure you're connected to Sui testnet
4. Check that the SuiClient is properly initialized

### Explorer Links

- **Transaction**: https://suiexplorer.com/txblock/6p3upN1qetcWNheC3LStH84DWdVCvnptqXFb8gFrd2eK?network=testnet
- **Package**: https://suiexplorer.com/object/0x7bb1869916ab70453bb935830d664cba9ea46889e69d42e20bfe025714da0bf8?network=testnet
- **Registry**: https://suiexplorer.com/object/0x6904ac9eab9c8011e50503c98ff6eda8b900fce8a10c4242d751658e59769fff?network=testnet

---

✅ **Everything is now connected and ready to use!**
