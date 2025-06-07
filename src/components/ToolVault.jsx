import React, { useState } from "react";
import { UploadCloud, Sparkles, Wallet } from "lucide-react";
import { WebBundlr } from "@bundlr-network/client";
import { ethers } from "ethers";
import "./App.css";

export default function ToolVault() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [bundlr, setBundlr] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      setStatus("Connecting wallet...");
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);

        setStatus("Initializing Bundlr...");
        const bundlrInstance = new WebBundlr("https://node1.bundlr.network", "ethereum", signer);
        await bundlrInstance.ready();
        setBundlr(bundlrInstance);
        setStatus(""); // Clear status after successful connection
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        setStatus("Failed to connect wallet. Please try again.");
        // Clear the failed state after a few seconds
        setTimeout(() => setStatus(""), 5000);
      }
    } else {
      setStatus("Please install MetaMask to use this feature.");
      setTimeout(() => setStatus(""), 5000);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setBundlr(null);
    setFile(null);
    setPreview(null);
    setUploadedUrl(null);
    setStatus("");
  };

  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Only create preview for images
      if (selectedFile.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null);
      }
      
      setStatus("");
      setUploadedUrl(null);
    }
  };

  const handleUploadToIrys = async () => {
    if (!file || !bundlr) {
      setStatus("Please select a file and connect your wallet first.");
      return;
    }

    setStatus("Uploading to Irys...");
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const buffer = Buffer.from(reader.result);
          const tx = await bundlr.upload(buffer, {
            tags: [{ name: "Content-Type", value: file.type }],
          });
          const url = `https://arweave.net/${tx.id}`;
          setUploadedUrl(url);
          setStatus("Upload successful! 🎉");
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          setStatus("Upload failed. Please try again.");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("File reading error:", error);
      setStatus("Failed to read file. Please try again.");
    }
  };

  const getStatusColor = () => {
    if (status.includes("successful") || status.includes("Connected")) return "#4ade80";
    if (status.includes("failed") || status.includes("Failed")) return "#ef4444";
    if (status.includes("Uploading") || status.includes("Connecting") || status.includes("Initializing")) return "#fbbf24";
    return "white";
  };

  return (
    <>
      <div className="top-bar">
        <img src="/logo.png" alt="Logo" className="logo-top-right" />
      </div>

      <div className="center-content">
        <div className="container">
          <div className="wallet-connect">
            {!walletAddress ? (
              <button onClick={connectWallet} className="connect-button">
                <Wallet className="icon" /> Connect Wallet
              </button>
            ) : (
              <div className="wallet-section">
                <div className="wallet-address">
                  <Wallet className="icon" style={{ marginRight: '8px' }} />
                  Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
                <button onClick={disconnectWallet} className="disconnect-button">
                  Disconnect
                </button>
              </div>
            )}
          </div>

          <div className="upload-card">
            <h2 className="card-title">
              <UploadCloud className="icon purple" /> Upload Your Tool
            </h2>

            <input 
              type="file" 
              onChange={handleUpload} 
              className="file-input"
              accept="*/*"
            />

            {file && (
              <div style={{ margin: '1rem 0', textAlign: 'left' }}>
                <p><strong>Selected file:</strong> {file.name}</p>
                <p><strong>File size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>File type:</strong> {file.type || 'Unknown'}</p>
              </div>
            )}

            {preview && (
              <div className="preview-section">
                <p className="preview-text">Preview:</p>
                <img src={preview} alt="Preview" className="preview-image" />
              </div>
            )}

            <button
              onClick={handleUploadToIrys}
              disabled={!file || !bundlr}
              className="upload-button"
            >
              <Sparkles className="icon" /> 
              {status.includes("Uploading") ? "Uploading..." : "Upload to Irys"}
            </button>

            {status && (
              <div 
                className="status-text" 
                style={{ color: getStatusColor() }}
              >
                {status}
              </div>
            )}

            {uploadedUrl && (
              <div className="link-section">
                <p className="link-label">Shareable Link:</p>
                <a 
                  href={uploadedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="upload-link"
                >
                  {uploadedUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="footer styled-footer">
        <p><strong>Powered by Irys</strong></p>
        <p>
          Built by{' '}
          <a href="https://x.com/muyi_eth" target="_blank" rel="noopener noreferrer">
            <img src="/twitter.svg" alt="Twitter" className="twitter-icon" />
           muyi_eth
          </a>
        </p>
      </footer>
    </>
  );
}