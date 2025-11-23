import { useState, useEffect, useRef } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Upload, Lock, Coins, List } from "lucide-react";
import { RagEngine } from "../services/rag-engine";
import { LlmClient } from "../services/llm-client";
import { Embedder } from "../services/embedder";
import { VectorStore } from "../services/vector-store";
import { PdfParser } from "../services/pdf-parser";
import { Transaction, Inputs } from "@mysten/sui/transactions";
import {
  encryptAndUpload,
  type EncryptedMetadata,
} from "../ghostcontext/encryption-workflow";
import {
  createGhostContextPayload,
  type GhostContextPayload,
} from "../services/ghostcontext-payload";
import "./Vault.css";

const Vault = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [ghostPayload, setGhostPayload] = useState<GhostContextPayload | null>(null);
  const [walrusBlobId, setWalrusBlobId] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionMetadata, setEncryptionMetadata] = useState<EncryptedMetadata | null>(null);
  const [contextTitle, setContextTitle] = useState("");
  const [contextCategory, setContextCategory] = useState("General");
  const [pricePerQuery, setPricePerQuery] = useState("1");
  const [mintedContextId, setMintedContextId] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [registrySharedVersion, setRegistrySharedVersion] = useState<string | null>(null);
  const [contextSharedVersion, setContextSharedVersion] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const signAndExecuteTransaction = useSignAndExecuteTransaction({
    mutationKey: ["vault-sign"],
  });

  const ghostContextPackageId = import.meta.env.VITE_GHOSTCONTEXT_PACKAGE_ID as string | undefined;
  const registryObjectId = import.meta.env.VITE_GHOSTCONTEXT_REGISTRY_ID as string | undefined;

  const ragRef = useRef<RagEngine | null>(null);

  useEffect(() => {
    const llm = new LlmClient();
    const embedder = new Embedder();
    const vectorStore = new VectorStore();
    const parser = new PdfParser();
    ragRef.current = new RagEngine(llm, embedder, vectorStore, parser);
  }, []);

  useEffect(() => {
    if (!registryObjectId) return;
    suiClient
      .getObject({ id: registryObjectId, options: { showOwner: true } })
      .then((result) => {
        const sharedVersion = (result.data?.owner as any)?.Shared?.initial_shared_version;
        if (sharedVersion) {
          setRegistrySharedVersion(sharedVersion);
        }
      })
      .catch((error) => console.error("Failed to fetch registry shared version", error));
  }, [registryObjectId, suiClient]);

  const fetchContextSharedVersion = async (objectId: string) => {
    try {
      const response = await suiClient.getObject({
        id: objectId,
        options: { showOwner: true },
      });
      const sharedVersion = (response.data?.owner as any)?.Shared?.initial_shared_version;
      if (sharedVersion) {
        setContextSharedVersion(sharedVersion);
      }
    } catch (error) {
      console.error("Failed to fetch context shared version", error);
    }
  };

  const showToastNotification = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadFileName(file.name);
    setUploadProgress(0);
    setUploadStatus("Starting...");

    try {
      const rag = ragRef.current;
      if (!rag) throw new Error("RAG engine not initialized");

      setUploadStatus("📖 Parsing PDF...");
      setUploadProgress(10);

      const chunks = await rag.parser.parseFile(file);
      setGhostPayload(
        createGhostContextPayload(file.name, chunks, {
          category: contextCategory,
        })
      );
      setContextTitle(file.name.replace(/\.[^/.]+$/, ""));
      setWalrusBlobId("");
      setMintedContextId("");
      setContextSharedVersion(null);
      setUploadProgress(30);
      setUploadStatus(`✂️ Split into ${chunks.length} chunks`);

      const totalChunks = chunks.length;
      for (const [index] of chunks.entries()) {
        const chunkNum = index + 1;
        setUploadStatus(`🔢 Processing chunk ${chunkNum}/${totalChunks}...`);
        setUploadProgress(30 + Math.floor((index / totalChunks) * 60));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      setUploadProgress(100);
      setUploadStatus("✅ Complete!");
      showToastNotification(`Document "${file.name}" processed successfully!`, "success");
    } catch (error) {
      console.error("❌ Processing error:", error);
      showToastNotification("Error processing document", "error");
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleEncryptAndUpload = async () => {
    if (!ghostPayload) {
      showToastNotification("Upload a document first.", "error");
      return;
    }
    if (!currentAccount) {
      showToastNotification("Connect your wallet first.", "error");
      return;
    }

    try {
      setIsEncrypting(true);
      const metadata = await encryptAndUpload(ghostPayload, currentAccount.address);
      console.log("🔐 Encryption metadata:", metadata);
      console.log("🔑 Encryption key:", metadata.encryptionKey);
      console.log("🔑 IV:", metadata.iv);
      setEncryptionMetadata(metadata);
      setWalrusBlobId(metadata.walrusBlobId);
      setGhostPayload({
        ...ghostPayload,
        walrusBlobId: metadata.walrusBlobId,
        policyId: currentAccount.address,
      });
      showToastNotification("Context encrypted & uploaded to Walrus!", "success");
    } catch (error: any) {
      console.error("Encryption failed:", error);
      showToastNotification(`Encryption failed: ${error.message}`, "error");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleMintContext = async () => {
    if (!currentAccount || !ghostContextPackageId || !registryObjectId || !registrySharedVersion) {
      showToastNotification("Missing configuration or wallet not connected.", "error");
      return;
    }
    if (!walrusBlobId || !encryptionMetadata) {
      showToastNotification("Encrypt and upload to Walrus first.", "error");
      return;
    }

    try {
      setIsMinting(true);
      const title = contextTitle || ghostPayload?.fileName || "GhostContext";
      const tx = new Transaction();
      const registryArg = Inputs.SharedObjectRef({
        objectId: registryObjectId,
        initialSharedVersion: registrySharedVersion,
        mutable: true,
      });

      console.log("🪙 Minting with keys:");
      console.log("  - Encryption Key:", encryptionMetadata.encryptionKey);
      console.log("  - IV:", encryptionMetadata.iv);
      console.log("  - Walrus Blob:", walrusBlobId);

      tx.moveCall({
        target: `${ghostContextPackageId}::ghostcontext::create_context`,
        arguments: [
          tx.pure.string(title),
          tx.pure.string(walrusBlobId),
          tx.pure.string(encryptionMetadata.encryptionKey),
          tx.pure.string(encryptionMetadata.iv),
          tx.pure.string(contextCategory || "General"),
          tx.object(registryArg),
        ],
      });

      const response = await signAndExecuteTransaction.mutateAsync({
        transaction: tx,
        chain: "sui:testnet",
      });

      const txDetails = await suiClient.waitForTransaction({
        digest: response.digest,
        options: { showEvents: true },
      });

      const createdEvent = txDetails.events?.find(
        (event: any) => event.type === `${ghostContextPackageId}::ghostcontext::ContextCreated`
      );
      const parsedEvent = createdEvent?.parsedJson as Record<string, any> | undefined;
      const contextId = parsedEvent?.id as string | undefined;

      if (contextId) {
        setMintedContextId(contextId);
        await fetchContextSharedVersion(contextId);
      }

      showToastNotification("GhostContext NFT minted successfully!", "success");
    } catch (error) {
      console.error("Mint failed", error);
      showToastNotification("Minting failed. Check console.", "error");
    } finally {
      setIsMinting(false);
    }
  };

  const handleListContext = async () => {
    if (!currentAccount || !ghostContextPackageId) {
      showToastNotification("Missing configuration.", "error");
      return;
    }
    if (!mintedContextId || !contextSharedVersion) {
      showToastNotification("Mint a context first.", "error");
      return;
    }

    let parsedPrice: bigint;
    try {
      parsedPrice = BigInt(pricePerQuery || "1");
    } catch {
      showToastNotification("Price must be a positive integer.", "error");
      return;
    }

    if (parsedPrice <= 0n) {
      showToastNotification("Price must be > 0.", "error");
      return;
    }

    try {
      const tx = new Transaction();
      const contextArg = Inputs.SharedObjectRef({
        objectId: mintedContextId,
        initialSharedVersion: contextSharedVersion,
        mutable: true,
      });

      tx.moveCall({
        target: `${ghostContextPackageId}::ghostcontext::list_context`,
        arguments: [tx.object(contextArg), tx.pure.u64(parsedPrice)],
      });

      await signAndExecuteTransaction.mutateAsync({
        transaction: tx,
        chain: "sui:testnet",
      });

      showToastNotification("Context listed for sale!", "success");
    } catch (error) {
      console.error("List failed", error);
      showToastNotification("Failed to list context.", "error");
    }
  };

  return (
    <div className="vault-container">
      <div className="vault-content">
        <div className="vault-header">
          <h1 className="vault-title">🛡️ GhostContext Vault</h1>
          <p className="vault-subtitle">
            Encrypt your documents and mint them as NFTs on the blockchain
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="vault-card">
          <div className="vault-card-header">
            <Lock size={24} />
            <h2>Wallet Connection</h2>
          </div>
          <p className="vault-card-description">
            Connect your Sui wallet to encrypt and mint NFTs
          </p>
          <ConnectButton />
          {currentAccount && (
            <div className="status-badge" style={{ marginTop: "var(--spacing-md)" }}>
              ✅ Connected: {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </div>
          )}
        </div>

        {/* Step 1: Upload Document */}
        <div className="vault-card">
          <div className="vault-card-header">
            <Upload size={24} />
            <h2>Step 1: Upload Document</h2>
          </div>
          <p className="vault-card-description">
            Upload a PDF document to process and encrypt
          </p>

          {!uploading && !ghostPayload && (
            <label htmlFor="vaultFileInput" className="vault-upload-area">
              <input
                type="file"
                id="vaultFileInput"
                accept=".pdf"
                onChange={onFileUpload}
                disabled={uploading}
              />
              <div className="upload-icon">📎</div>
              <p className="upload-text">Click to choose PDF file</p>
              <p className="upload-hint">Your document will be processed locally</p>
            </label>
          )}

          {uploading && (
            <div>
              <p style={{ marginBottom: "var(--spacing-md)", fontWeight: "var(--font-medium)" }}>
                📄 Processing: {uploadFileName}
              </p>
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="progress-text">{uploadStatus}</p>
              </div>
            </div>
          )}

          {!uploading && ghostPayload && (
            <div>
              <div className="status-badge" style={{ marginBottom: "var(--spacing-md)" }}>
                ✅ Loaded: {ghostPayload.fileName}
              </div>
              <button
                className="btn-vault-secondary"
                onClick={() => {
                  setGhostPayload(null);
                  setWalrusBlobId("");
                  setMintedContextId("");
                  setContextSharedVersion(null);
                }}
              >
                🔄 Change Document
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Configure & Encrypt */}
        {ghostPayload && currentAccount && (
          <div className="vault-card">
            <div className="vault-card-header">
              <Lock size={24} />
              <h2>Step 2: Configure & Encrypt</h2>
            </div>
            <p className="vault-card-description">
              Set metadata and encrypt your document
            </p>

            <div className="vault-form">
              <div className="form-group">
                <label className="form-label">Context Title</label>
                <input
                  type="text"
                  value={contextTitle}
                  onChange={(e) => setContextTitle(e.target.value)}
                  placeholder="e.g. Ferrari Engine Manual"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  value={contextCategory}
                  onChange={(e) => setContextCategory(e.target.value)}
                  placeholder="General"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price Per Query (MIST)</label>
                <input
                  type="number"
                  min="1"
                  value={pricePerQuery}
                  onChange={(e) => setPricePerQuery(e.target.value)}
                  className="form-input"
                />
              </div>

              <button
                className="btn-vault-primary"
                onClick={handleEncryptAndUpload}
                disabled={isEncrypting}
              >
                {isEncrypting ? "Encrypting..." : "🔐 Encrypt & Upload to Walrus"}
              </button>

              {walrusBlobId && (
                <div className="status-badge" style={{ marginTop: "var(--spacing-md)" }}>
                  ✅ Uploaded to Walrus: {walrusBlobId.substring(0, 20)}...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Mint NFT */}
        {walrusBlobId && currentAccount && (
          <div className="vault-card">
            <div className="vault-card-header">
              <Coins size={24} />
              <h2>Step 3: Mint NFT</h2>
            </div>
            <p className="vault-card-description">
              Mint your encrypted document as an NFT
            </p>

            <button
              className="btn-vault-primary"
              onClick={handleMintContext}
              disabled={isMinting}
            >
              {isMinting ? "Minting..." : "🪙 Mint Context NFT"}
            </button>

            {mintedContextId && (
              <div className="status-badge" style={{ marginTop: "var(--spacing-md)" }}>
                ✅ Minted NFT: {mintedContextId.substring(0, 20)}...
              </div>
            )}
          </div>
        )}

        {/* Step 4: List for Sale */}
        {mintedContextId && contextSharedVersion && (
          <div className="vault-card">
            <div className="vault-card-header">
              <List size={24} />
              <h2>Step 4: List for Sale</h2>
            </div>
            <p className="vault-card-description">
              List your NFT on the marketplace
            </p>

            <button className="btn-vault-primary" onClick={handleListContext}>
              📢 List Context for Sale
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`toast ${toastType}`}>
          <span className="toast-icon">{toastType === "success" ? "✅" : "❌"}</span>
          <span className="toast-message">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Vault;
