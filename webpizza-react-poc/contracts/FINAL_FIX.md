# ✅ Final Fix for Duplicate Module Error

## Problem
The auto-inclusion of Sui dependencies is conflicting, causing duplicate `genesis` module errors.

## Solution
I've updated `Move.toml` to **explicitly specify** the Sui framework dependency. This prevents the auto-inclusion mechanism from creating duplicates.

## Updated Move.toml
```toml
[package]
name = "ghostcontext"
version = "1.0.0"

[dependencies]
# Explicitly specify Sui framework to avoid auto-inclusion conflicts
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
ghostcontext = "0x0"
```

## Steps to Fix

Run these commands on Ubuntu:

```bash
cd ~/ghost-context/webpizza-react-poc/contracts

# 1. Complete cleanup
rm -rf build
rm -f Move.lock

# 2. Rebuild (will fetch dependencies fresh)
sui move build
```

## Why This Works

- **Explicit dependency** tells Sui exactly which framework version to use
- **No auto-inclusion conflict** - we're explicitly managing dependencies
- **Fresh fetch** - removing Move.lock forces Sui to re-resolve dependencies correctly

## If It Still Fails

1. **Check Sui version**: `sui --version`
2. **Update Sui CLI** if version is old
3. **Try with skip flag**: `sui move build --skip-fetch-latest-git-deps`

The explicit dependency approach should resolve the duplicate module issue.

