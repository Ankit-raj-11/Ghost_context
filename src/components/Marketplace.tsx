import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";
import "./Marketplace.css";

interface GhostContextNFT {
  id: string;
  title: string;
  walrusBlobId: string;
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
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const ghostContextPackageId = import.meta.env.VITE_GHOSTCONTEXT_PACKAGE_ID as string | undefined;

  useEffect(() => {
    loadMarketplace();
  }, []);

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
            return {
              id: contextId,
              title: fields.title,
              walrusBlobId: fields.walrus_blob_id,
              category: fields.category,
              owner: fields.owner,
              version: nftObject.data.version || "1",
              isListed: fields.is_listed,
              pricePerQuery: fields.price_per_query,
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
      <header className="marketplace-header">
        <div className="header-content">
          <h1>🌐 GhostContext Marketplace</h1>
          <p>Browse and access encrypted knowledge contexts</p>
          <ConnectButton />
        </div>
      </header>

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
                    <span className="context-category">{context.category}</span>
                    {context.owner === currentAccount?.address && (
                      <span className="owner-badge">Your NFT</span>
                    )}
                  </div>
                  
                  <h3>{context.title}</h3>
                  
                  <div className="context-details">
                    <div className="detail-row">
                      <span>Blob ID:</span>
                      <code>{context.walrusBlobId.substring(0, 20)}...</code>
                    </div>
                    <div className="detail-row">
                      <span>Owner:</span>
                      <code>{context.owner.substring(0, 10)}...</code>
                    </div>
                    {context.isListed && context.pricePerQuery && (
                      <div className="detail-row">
                        <span>Price/Query:</span>
                        <strong>{(parseInt(context.pricePerQuery) / 1_000_000_000).toFixed(2)} SUI</strong>
                      </div>
                    )}
                    <div className="detail-row">
                      <span>Status:</span>
                      <span className={context.isListed ? "status-listed" : "status-unlisted"}>
                        {context.isListed ? "🟢 Listed" : "⚪ Not Listed"}
                      </span>
                    </div>
                  </div>

                  <div className="context-actions">
                    {context.owner === currentAccount?.address ? (
                      <button className="btn-secondary" disabled>
                        You Own This
                      </button>
                    ) : context.isListed ? (
                      <button className="btn-primary">
                        Purchase Access
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
  );
};

export default Marketplace;
