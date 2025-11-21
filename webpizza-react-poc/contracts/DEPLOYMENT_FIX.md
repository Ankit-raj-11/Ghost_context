# 🔧 Fixed: Duplicate Module Error

## Problem

The error "Duplicate module found: 0x0000000000000000000000000000000000000000000000000000000000000001::ascii" occurred because:

1. **Explicit Sui dependency** was added in `Move.toml`
2. **Sui automatically includes** framework dependencies (Sui, MoveStdlib, etc.)
3. This caused **duplicate modules** to be included

## Solution Applied

✅ **Removed the explicit Sui dependency** from `Move.toml`

Sui will now automatically include the framework dependencies, which is the recommended approach.

## Updated Move.toml

```toml
[package]
name = "ghostcontext"
version = "1.0.0"

# Sui framework dependencies are automatically included
# No need to explicitly add them to avoid duplicate module errors

[addresses]
ghostcontext = "0x0"
```

## Next Steps

1. **Clean build artifacts** (optional but recommended):

   ```bash
   cd contracts
   rm -rf build
   ```

2. **Build again**:

   ```bash
   sui move build
   ```

3. **Deploy**:
   ```bash
   sui client publish --gas-budget 100000000
   ```

## If You Still Get Errors

If you need to specify a specific framework version, you can use the published package instead:

```toml
[dependencies]
Sui = "1.61.0"  # Match your server version
```

But try without it first - the automatic inclusion should work!
