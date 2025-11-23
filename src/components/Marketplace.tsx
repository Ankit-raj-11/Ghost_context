import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction, Inputs } from "@mysten/sui/transactions";
import "./Marketplace.css";

interface GhostContextNFT {
  id: string;
  title: string;
  walrusBlobId: string;
  encryptionKey: string;
  iv: string;
  category: string;
  owner: string;
  version: string;
  isListed?: boolean;
  pricePerQuery?: string;
}

const Marketplace = () => {
  const [contexts, setContexts] = useState<GhostContextNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const signAndExecuteTransaction = useSignAndExecuteTransaction({
    mutationKey: ["marketplace-purchase"],
  });

  const ghostContextPackageId = import.meta.env.VITE_GHOSTCONTEXT_PACKAGE_ID as string | undefined;
  const registryObjectId = import.meta.env.VITE_GHOSTCONTEXT_REGISTRY_ID as string | undefined;

  useEffect(() => {
    loadMarketplace();
  }, []);

  const handlePurchaseAccess = async (context: GhostContextNFT) => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    if (!ghostContextPackageId || !registryObjectId) {
      alert("Missing contract configuration");
      return;
    }

    const queries = prompt("How many queries would you like to purchase?", "10");
    if (!queries || isNaN(parseInt(queries))) return;

    const queryCount = parseInt(queries);
    const pricePerQueryNum = parseInt(context.pricePerQuery || "0");
    const totalCost = pricePerQueryNum * queryCount;
    const totalPrice = totalCost / 1_000_000_000; // Convert MIST to SUI

    if (!confirm(`Purchase ${queryCount} queries for ${totalPrice.toFixed(4)} SUI?`)) {
      return;
    }

    try {
      setPurchasing(context.id);
      console.log("🛒 Purchasing access to:", context.title);

      // Get registry shared version
      const registryObj = await suiClient.getObject({
        id: registryObjectId,
        options: { showOwner: true },
      });
      const registrySharedVersion = (registryObj.data?.owner as any)?.Shared?.initial_shared_version;

      if (!registrySharedVersion) {
        throw new Error("Could not get registry shared version");
      }

      // Get fresh context object to get current shared version
      const contextObj = await suiClient.getObject({
        id: context.id,
        options: { showOwner: true },
      });
      
      const contextSharedVersion = (contextObj.data?.owner as any)?.Shared?.initial_shared_version;
      console.log("Context shared version:", contextSharedVersion);

      if (!contextSharedVersion) {
        throw new Error("Could not get context shared version");
      }

      // Build transaction
      const tx = new Transaction();
      
      const contextArg = Inputs.SharedObjectRef({
        objectId: context.id,
        initialSharedVersion: contextSharedVersion,
        mutable: true,
      });

      const registryArg = Inputs.SharedObjectRef({
        objectId: registryObjectId,
        initialSharedVersion: registrySharedVersion,
        mutable: true,
      });

      // Split coins for payment
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(totalCost)]);

      tx.moveCall({
        target: `${ghostContextPackageId}::ghostcontext::purchase_queries`,
        arguments: [
          tx.object(contextArg),
          tx.pure.u64(queryCount),
          coin,
          tx.object(registryArg),
        ],
      });

      const response = await signAndExecuteTransaction.mutateAsync({
        transaction: tx,
        chain: "sui:testnet",
      });

      console.log("✅ Purchase successful:", response.digest);
      alert(`Purchase successful! You now have ${queryCount} queries. Check your wallet for the QueryReceipt NFT with encryption keys.`);
      
      // Reload marketplace to update stats
      await loadMarketplace();
    } catch (error: any) {
      console.error("Purchase failed:", error);
      alert(`Purchase failed: ${error.message || "Unknown error"}`);
    } finally {
      setPurchasing(null);
    }
  };

  const loadMarketplace = async () => {
    if (!ghostContextPackageId) {
      console.error("Missing package ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 Loading marketplace from blockchain...");
      console.log("Package ID:", ghostContextPackageId);
      
      // Query all ContextCreated events to find all NFTs
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${ghostContextPackageId}::ghostcontext::ContextCreated`
        },
        limit: 50,
      });

      console.log("📦 Found events:", events.data.length);

      // Parse events to get context details
      const contextPromises = events.data.map(async (event: any) => {
        const contextId = event.parsedJson.id;
        
        try {
          // Fetch the actual NFT object to get current state
          const nftObject = await suiClient.getObject({
            id: contextId,
            options: {
              showContent: true,
              showOwner: true,
            },
          });

          if (nftObject.data?.content?.dataType === "moveObject") {
            const fields = (nftObject.data.content as any).fields;
            
            console.log(`Context ${contextId} fields:`, fields);
            
            return {
              id: contextId,
              title: fields.title,
              walrusBlobId: fields.walrus_blob_id,
              encryptionKey: fields.encryption_key || "",
              iv: fields.iv || "",
              category: fields.category,
              owner: fields.owner,
              version: nftObject.data.version || "1",
              isListed: fields.is_listed,
              pricePerQuery: fields.price_per_query?.toString() || "0",
            };
          }
        } catch (error) {
          console.error(`Failed to fetch context ${contextId}:`, error);
          return null;
        }
      });

      const fetchedContexts = await Promise.all(contextPromises);
      const validContexts = fetchedContexts.filter((c) => c !== null) as GhostContextNFT[];
      
      console.log("✅ Loaded contexts:", validContexts.length);
      setContexts(validContexts);
    } catch (error) {
      console.error("Failed to load marketplace:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "General", "Technical", "Research", "Education"];

  const filteredContexts = filter === "All" 
    ? contexts 
    : contexts.filter(c => c.category === filter);

  return (
    <div className="marketplace-container">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">🌐 GhostContext Marketplace</h1>
          <p className="page-subtitle">Browse and access encrypted knowledge contexts</p>
        </div>

      <div className="marketplace-content">
        <aside className="marketplace-sidebar">
          <h3>Categories</h3>
          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="marketplace-stats">
            <h3>Stats</h3>
            <div className="stat-item">
              <span>Total Contexts</span>
              <strong>{contexts.length}</strong>
            </div>
            <div className="stat-item">
              <span>Your Contexts</span>
              <strong>
                {contexts.filter(c => c.owner === currentAccount?.address).length}
              </strong>
            </div>
          </div>
        </aside>

        <main className="marketplace-main">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading marketplace...</p>
            </div>
          ) : contexts.length === 0 ? (
            <div className="empty-state">
              <h2>📭 No Contexts Yet</h2>
              <p>Be the first to mint a GhostContext NFT!</p>
              <a href="/" className="btn-primary">
                Go to Home
              </a>
            </div>
          ) : (
            <div className="context-grid">
              {filteredContexts.map((context) => (
                <div key={context.id} className="context-card">
                  <div className="context-header">
                    <div className="context-badges">
                      <span className="context-category">{context.category}</span>
                      {context.owner === currentAccount?.address && (
                        <span className="owner-badge">Your NFT</span>
                      )}
                      <span className={`status-badge-inline ${context.isListed ? "status-listed" : "status-unlisted"}`}>
                        {context.isListed ? "● Listed" : "○ Unlisted"}
                      </span>
                    </div>
                    <button className="context-bookmark" title="Bookmark">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </button>
                  </div>
                  
                  <h3>{context.title}</h3>
                  
                  {context.isListed && context.pricePerQuery && (
                    <div className="context-price-box">
                      <span className="context-price-label">Price per Query</span>
                      <span className="context-price-value">
                        {(parseInt(context.pricePerQuery) / 1_000_000_000).toFixed(4)} SUI
                      </span>
                    </div>
                  )}
                  
                  <div className="context-details">
                    <div className="detail-row">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                      <span className="detail-label">Blob ID:</span>
                      <span className="detail-value">
                        <code>{context.walrusBlobId.substring(0, 16)}...</code>
                      </span>
                    </div>
                    <div className="detail-row">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span className="detail-label">Owner:</span>
                      <span className="detail-value">
                        <code>{context.owner.substring(0, 8)}...</code>
                      </span>
                    </div>
                  </div>

                  <div className="context-actions">
                    {context.owner === currentAccount?.address ? (
                      <button className="btn-secondary" disabled>
                        You Own This
                      </button>
                    ) : context.isListed && context.pricePerQuery ? (
                      <button 
                        className="btn-primary"
                        onClick={() => handlePurchaseAccess(context)}
                        disabled={purchasing === context.id}
                      >
                        {purchasing === context.id ? "Purchasing..." : "Purchase Access"}
                      </button>
                    ) : (
                      <button className="btn-secondary" disabled>
                        Not For Sale
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      </div>
    </div>
  );
};

export default Marketplace;
