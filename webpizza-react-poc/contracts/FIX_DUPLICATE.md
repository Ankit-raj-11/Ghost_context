# 🔧 Fix: Duplicate Module Error (genesis)

## Problem
The `Move.lock` file still contains old dependency references from when we had explicit Sui dependencies. Even though we removed them from `Move.toml`, the lock file causes conflicts with auto-included dependencies.

## Solution

You need to clean the lock file and build directory, then rebuild:

```bash
cd ~/ghost-context/webpizza-react-poc/contracts

# Remove old lock file and build artifacts
rm -f Move.lock
rm -rf build

# Rebuild (this will regenerate Move.lock without explicit dependencies)
sui move build
```

## Why This Happens

- `Move.lock` is auto-generated and caches dependency information
- When we removed explicit dependencies from `Move.toml`, the lock file wasn't updated
- Sui auto-includes framework dependencies, but the lock file still references them explicitly
- This causes duplicate modules during compilation

## After Cleaning

After running the commands above:
1. `Move.lock` will be regenerated without explicit Sui dependencies
2. Build will succeed without duplicates
3. You can then deploy: `sui client publish --gas-budget 100000000`

