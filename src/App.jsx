import React, { useState, useEffect } from "react";
import { UploadCloud, Sparkles, Download, Share2, Wallet } from "lucide-react";
import { WebBundlr } from "@bundlr-network/client";
import { ethers } from "ethers";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col items-center py-12 px-6">
      <div className="mb-6 flex gap-4">
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
          >
            <Wallet className="w-5 h-5" /> Connect Wallet
          </button>
        ) : (
          <span className="text-sm text-green-400">Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
        )}
      </div>

      <div className="bg-white/10 border border-white/20 rounded-3xl p-8 max-w-xl w-full shadow-xl">
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-purple-400" /> Upload Your Tool
        </h2>

        <input
          type="file"
          onChange={handleUpload}
          className="w-full mb-4 text-white"
        />

        {preview && (
          <div className="mb-4">
            <p className="text-slate-300">Preview:</p>
            <img src={preview} alt="Preview" className="w-full h-64 object-contain bg-black/20 rounded-xl" />
          </div>
        )}

        <button
          onClick={handleUploadToIrys}
          disabled={!file || !bundlr}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl flex justify-center gap-2 hover:scale-105 transition"
        >
          <Sparkles className="w-5 h-5" /> Upload to Irys
        </button>

        {status && <p className="mt-4 text-slate-300">{status}</p>}

        {uploadedUrl && (
          <div className="mt-4">
            <p className="text-slate-400">Shareable Link:</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline break-all"
            >
              {uploadedUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
