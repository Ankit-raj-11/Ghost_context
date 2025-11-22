# Testing Contract Signature

## The Problem

You deployed from `E:\lasthope\move` but we don't know what contract was there.

The error "ArityMismatch in command 0" means the number of arguments doesn't match.

## Current Frontend Call

```typescript
create_context(
  title,           // 1
  walrus_blob_id,  // 2
  encryption_key,  // 3
  iv,              // 4
  category,        // 5
  registry         // 6
)
```

## Possible Deployed Signatures

### Option A: NEW (with keys)
```move
create_context(
  title: vector<u8>,
  walrus_blob_id: vector<u8>,
  encryption_key: vector<u8>,
  iv: vector<u8>,
  category: vector<u8>,
  registry: &mut MarketplaceRegistry,
  ctx: &mut TxContext
)
```

### Option B: OLD (without keys)
```move
create_context(
  title: vector<u8>,
  walrus_blob_id: vector<u8>,
  category: vector<u8>,
  registry: &mut MarketplaceRegistry,
  ctx: &mut TxContext
)
```

## Solution

You need to check which contract was actually deployed from `E:\lasthope\move`.

### If it was the OLD contract:
Update frontend to remove encryption_key and iv arguments.

### If it was the NEW contract:
The frontend is already correct, but maybe the package ID is wrong.

## Quick Test

Try viewing the deployed package on Sui Explorer:
https://suiexplorer.com/object/0x7bb1869916ab70453bb935830d664cba9ea46889e69d42e20bfe025714da0bf8?network=testnet

Look at the module and see what functions are available.
