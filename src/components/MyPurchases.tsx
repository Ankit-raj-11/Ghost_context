import { useState, useEffect } from "react";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { decryptData } from "../ghostcontext/crypto";
import { fetchFromWalrusBytes } from "../ghostcontext/walrus";
import { deserializeGhostContextPayload } from "../services/ghostcontext-payload";
import "./MyPurchases.css";

interface QueryReceipt {
  id: string;
  contextId: string;
  walrusBlobId: string;
  encryptionKey: string;
  iv: string;
  queriesPurchased: number;
  queriesRemaining: number;
  purchasedAt: string;
  contextTitle?: string;
}

const MyPurchases = () => {
  const [receipts, setReceipts] = useState<QueryReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingReceipt, setLoadingReceipt] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const navigate = useNavigate();

  const ghostContextPackageId = import.meta.env.VITE_GHOSTCONTEXT_PACKAGE_ID as string | undefined;

  useEffect(() => {
    console.log("🔍 MyPurchases - Package ID:", ghostContextPackageId);
    console.log("🔍 Expected NEW package:", "0x6344fd2b687d7d3fa1c10f0a334dc0d8b2c9297be53e04595f308f211d5aa0f6");
    console.log("🔍 OLD package (should NOT be this):", "0x7bb1869916ab70453bb935830d664cba9ea46889e69d42e20bfe025714da0bf8");
  }, []);

  useEffect(() => {
    if (currentAccount) {
      loadMyReceipts();
    }
  }, [currentAccount]);

  const loadMyReceipts = async () => {
    if (!currentAccount || !ghostContextPackageId) return;

    try {
      setLoading(true);
      console.log("📥 Loading your purchases...");

      // Get all objects owned by user
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        options: {
          showType: true,
          showContent: true,
        },
      });

      console.log("Found owned objects:", ownedObjects.data.length);

      // Filter for QueryReceipts
      const receiptPromises = ownedObjects.data
        .filter((obj) => {
          const type = obj.data?.type;
          return type?.includes("QueryReceipt");
        })
        .map(async (obj) => {
          if (obj.data?.content?.dataType === "moveObject") {
            const fields = (obj.data.content as any).fields;
            
            console.log("Receipt fields:", fields);

            // Try to get context title
            let contextTitle = "Unknown Context";
            try {
              const contextObj = await suiClient.getObject({
                id: fields.context_id,
                options: { showContent: true },
              });
              if (contextObj.data?.content?.dataType === "moveObject") {
                const contextFields = (contextObj.data.content as any).fields;
                contextTitle = contextFields.title;
              }
            } catch (error) {
              console.error("Failed to fetch context title:", error);
            }

            return {
              id: obj.data.objectId,
              contextId: fields.context_id,
              walrusBlobId: fields.walrus_blob_id,
              encryptionKey: fields.encryption_key || "",
              iv: fields.iv || "",
              queriesPurchased: parseInt(fields.queries_purchased),
              queriesRemaining: parseInt(fields.queries_remaining),
              purchasedAt: fields.purchased_at,
              contextTitle,
            };
          }
          return null;
        });

      const fetchedReceipts = await Promise.all(receiptPromises);
      const validReceipts = fetchedReceipts.filter((r) => r !== null) as QueryReceipt[];

      console.log("✅ Loaded receipts:", validReceipts.length);
      setReceipts(validReceipts);
    } catch (error) {
      console.error("Failed to load receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAndChat = async (receipt: QueryReceipt) => {
    try {
      setLoadingReceipt(receipt.id);
      console.log("🔓 Loading purchased context:", receipt.contextTitle);
      console.log("Receipt data:", receipt);
      console.log("Encryption key:", receipt.encryptionKey);
      console.log("IV:", receipt.iv);
      console.log("Walrus blob ID:", receipt.walrusBlobId);

      if (!receipt.encryptionKey || !receipt.iv) {
        throw new Error("Receipt is missing encryption keys. This might be an old receipt from before keys were stored on-chain.");
      }

      // Download encrypted blob from Walrus
      console.log("📥 Downloading from Walrus:", receipt.walrusBlobId);
      const encryptedBytes = await fetchFromWalrusBytes(receipt.walrusBlobId);

      // Decrypt using keys from receipt
      console.log("🔐 Decrypting with receipt keys...");
      const decrypted = await decryptData(
        encryptedBytes,
        receipt.encryptionKey,
        receipt.iv
      );

      // Deserialize payload
      const payload = deserializeGhostContextPayload(decrypted);
      console.log("✅ Loaded:", payload.fileName);

      // Store in sessionStorage to pass to Home
      sessionStorage.setItem("loadedContext", JSON.stringify({
        payload,
        receiptId: receipt.id,
        queriesRemaining: receipt.queriesRemaining,
      }));

      // Navigate to home with chat
      navigate("/?loadContext=true");
    } catch (error: any) {
      console.error("Failed to load context:", error);
      alert(`Failed to load: ${error.message}`);
    } finally {
      setLoadingReceipt(null);
    }
  };

  if (!currentAccount) {
    return (
      <div className="purchases-container">
        <div className="page-container">
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <h2 className="empty-state-title">Wallet Not Connected</h2>
            <p className="empty-state-text">Please connect your wallet to view your purchases.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="purchases-container">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">📚 My Purchases</h1>
          <p className="page-subtitle">Your purchased GhostContext access</p>
        </div>

        <div className="purchases-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your purchases...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="empty-state">
            <h2>📭 No Purchases Yet</h2>
            <p>You haven't purchased any contexts yet.</p>
            <button onClick={() => navigate("/marketplace")} className="btn-primary">
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="receipts-grid">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="receipt-card">
                <div className="receipt-header">
                  <h3>{receipt.contextTitle}</h3>
                  {receipt.queriesRemaining > 0 ? (
                    <span className="badge-active">Active</span>
                  ) : (
                    <span className="badge-expired">Expired</span>
                  )}
                </div>

                <div className="receipt-details">
                  <div className="detail-row">
                    <span>Queries Remaining:</span>
                    <strong>{receipt.queriesRemaining} / {receipt.queriesPurchased}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Receipt ID:</span>
                    <code>{receipt.id.substring(0, 20)}...</code>
                  </div>
                  <div className="detail-row">
                    <span>Blob ID:</span>
                    <code>{receipt.walrusBlobId.substring(0, 20)}...</code>
                  </div>
                </div>

                <div className="receipt-actions">
                  {!receipt.encryptionKey || !receipt.iv ? (
                    <button className="btn-secondary" disabled title="This receipt is from the old contract without encryption keys">
                      ⚠️ No Keys (Old Receipt)
                    </button>
                  ) : receipt.queriesRemaining > 0 ? (
                    <button
                      className="btn-primary"
                      onClick={() => handleLoadAndChat(receipt)}
                      disabled={loadingReceipt === receipt.id}
                    >
                      {loadingReceipt === receipt.id ? "Loading..." : "🔓 Load & Chat"}
                    </button>
                  ) : (
                    <button className="btn-secondary" disabled>
                      No Queries Left
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MyPurchases;
