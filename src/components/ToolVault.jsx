import React, { useState } from "react";
import { UploadCloud, Sparkles, Wallet } from "lucide-react";
import { WebBundlr } from "@bundlr-network/client";
import { ethers } from "ethers";
import "./App.css"

export default function ToolVault() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [bundlr, setBundlr] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const bundlrInstance = new WebBundlr("https://node1.bundlr.network", "ethereum", signer);
      await bundlrInstance.ready();
      setBundlr(bundlrInstance);
    } else {
      alert("Please install MetaMask to use this feature.");
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadToIrys = async () => {
    if (!file || !bundlr) return;
    setStatus("Uploading...");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const buffer = Buffer.from(reader.result);
        const tx = await bundlr.upload(buffer, {
          tags: [{ name: "Content-Type", value: file.type }],
        });
        const url = `https://arweave.net/${tx.id}`;
        setUploadedUrl(url);
        setStatus("Upload successful!");
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      setStatus("Upload failed.");
    }
  };

  return (
    <div className="container">
      <div className="wallet-connect">
        {!walletAddress ? (
          <button onClick={connectWallet} className="connect-button">
            <Wallet className="icon" /> Connect Wallet
          </button>
        ) : (
          <span className="wallet-address">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        )}
      </div>

      <div className="upload-card">
        <h2 className="card-title">
          <UploadCloud className="icon purple" /> Upload Your Tool
        </h2>

        <input type="file" onChange={handleUpload} className="file-input" />

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
          <Sparkles className="icon" /> Upload to Irys
        </button>

        {status && <p className="status-text">{status}</p>}

        {uploadedUrl && (
          <div className="link-section">
            <p className="link-label">Shareable Link:</p>
            <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="upload-link">
              {uploadedUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
