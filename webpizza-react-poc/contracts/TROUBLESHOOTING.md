# 🔧 Troubleshooting: Duplicate Module Error (genesis)

## Persistent Issue

Even after cleaning `Move.lock` and `build/`, you're still getting:

```
Duplicate module found: 0x0000000000000000000000000000000000000000000000000000000000000003::genesis
```

## Root Cause

This typically happens when:

1. **Sui CLI version mismatch** - Your CLI version doesn't match the framework version
2. **Cached dependencies** - Sui has cached old dependency information
3. **Build artifacts** - Old compiled modules in build directory

## Solutions (Try in Order)

### Solution 1: Deep Clean + Rebuild

```bash
cd ~/ghost-context/webpizza-react-poc/contracts

# Complete cleanup
rm -rf build
rm -f Move.lock

# Rebuild with skip flag
sui move build --skip-fetch-latest-git-deps
```

### Solution 2: Update Sui CLI

Your Sui CLI might be outdated. Update it:

```bash
# Check current version
sui --version

# Update to latest testnet version
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Or if using package manager
# For Ubuntu/Debian, check: https://docs.sui.io/build/install
```

### Solution 3: Use Published Package Dependencies

Instead of auto-including, explicitly use published packages:

**Update `Move.toml`:**

```toml
[package]
name = "ghostcontext"
version = "1.0.0"

[dependencies]
Sui = "1.61.0"  # Match your Sui CLI version

[addresses]
ghostcontext = "0x0"
```

Then:

```bash
rm -rf build
rm -f Move.lock
sui move build
```

### Solution 4: Check Sui Config

Check if there are conflicting Sui configurations:

```bash
# Check Sui config location
sui client envs

# Check active environment
sui client active-env

# If needed, reset config
rm -rf ~/.sui/sui_config
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet
```

### Solution 5: Manual Dependency Resolution

If all else fails, try building with explicit framework path:

```toml
[package]
name = "ghostcontext"
version = "1.0.0"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "framework/testnet" }

[addresses]
ghostcontext = "0x0"
```

But make sure to clean first:

```bash
rm -rf build Move.lock
sui move build
```

## Quick Diagnostic Commands

```bash
# Check Sui version
sui --version

# Check what Sui sees
sui move build --verbose

# Check for cached files
find . -name "*.mv" -type f
find . -name "Move.lock" -type f

# Check build directory structure
ls -la build/ghostcontext/bytecode_modules/dependencies/ 2>/dev/null || echo "No build dir"
```

## Most Likely Fix

Based on the error, try **Solution 3** first (using published package version). This explicitly tells Sui which framework version to use and avoids auto-inclusion conflicts.

```bash
# 1. Update Move.toml with explicit version
# 2. Clean everything
rm -rf build Move.lock
# 3. Rebuild
sui move build
```
