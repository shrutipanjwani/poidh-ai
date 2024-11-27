"use client";

import { useState } from "react";
import { ethers } from "ethers";
import abi from "../constants/abi/abi";
import Button from "./Button";

const contractAddress = "0xb502c5856F7244DccDd0264A541Cc25675353D39";

interface ChainConfig {
  chainId: string;
  name: string;
  currency: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const CHAIN_CONFIG: Record<string, ChainConfig> = {
  base: {
    chainId: "0x2105",
    name: "Base",
    currency: "ETH",
    rpcUrl: "https://mainnet.base.org",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    }
  },
  degen: {
    chainId: "0x27BC86AA",
    name: "Degen",
    currency: "DEGEN",
    rpcUrl: "https://rpc.degen.tips",
    nativeCurrency: {
      name: "DEGEN",
      symbol: "DEGEN",
      decimals: 18
    }
  }
};

export default function BountyForm() {
  const [prompt, setPrompt] = useState("");
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [generatedBounty, setGeneratedBounty] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("base");
  const [txSuccess, setTxSuccess] = useState(false);
  const [bountyId, setBountyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateBounty = async () => {
    setLoadingGenerate(true);
    try {
      const response = await fetch("/api/generate-bounty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea: prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate bounty");
      }

      const bountyData = await response.json();
      setGeneratedBounty({
        title: bountyData.title,
        description: bountyData.description,
      });
    } catch (error) {
      console.error("Error generating bounty:", error);
      // Optionally add user-facing error handling here
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleSubmit = async () => {
    if (!generatedBounty) return;
    setTxSuccess(false);
    setLoadingSubmit(true);
    setError(null);

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to create bounties");
      }

      // Request account access if needed
      await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const currentContractAddress = chain === "degen" 
        ? "0x2445BfFc6aB9EEc6C562f8D7EE325CddF1780814" 
        : contractAddress;

      const contract = new ethers.Contract(currentContractAddress, abi, signer);

      const tx = await contract.createSoloBounty(
        generatedBounty.title,
        generatedBounty.description,
        {
          value: ethers.utils.parseEther(amount)
        }
      );

      try {
        const receipt = await tx.wait();
        const bountyCreatedEvent = receipt.events?.find(
          (event: any) => event.event === "BountyCreated"
        );

        if (bountyCreatedEvent) {
          const id = bountyCreatedEvent.args.id.toString();
          setBountyId(id);
          setTxSuccess(true);
          setAmount("");
          setPrompt("");
          setGeneratedBounty(null);
        }
      } catch (waitError: any) {
        if (waitError?.transactionHash) {
          setTxSuccess(true);
          setAmount("");
          setPrompt("");
          setGeneratedBounty(null);
          setBountyId('pending');
          console.log("Transaction successful:", waitError.transactionHash);
        } else {
          throw waitError;
        }
      }

    } catch (error: any) {
      console.error("Error creating bounty:", error);
      if (!error?.transactionHash) {
        setError(error?.message || "Failed to create bounty. Please try again.");
      } else {
        setTxSuccess(true);
        setAmount("");
        setPrompt("");
        setGeneratedBounty(null);
        setBountyId('pending');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const switchNetwork = async (selectedChain: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const chainConfig = CHAIN_CONFIG[selectedChain as keyof typeof CHAIN_CONFIG];
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainConfig.chainId }],
      });
      
      setChain(selectedChain);
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added to MetaMask
        try {
          const chainConfig = CHAIN_CONFIG[selectedChain as keyof typeof CHAIN_CONFIG];
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainConfig.chainId,
              chainName: chainConfig.name,
              rpcUrls: [chainConfig.rpcUrl],
              nativeCurrency: chainConfig.nativeCurrency
            }],
          });
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      }
      console.error('Error switching chain:', error);
    }
  };

  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChain = e.target.value;
    switchNetwork(selectedChain);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your bounty idea... (e.g., 'Post an image of your dog with a hat')"
          className="w-full h-32 p-4 text-gray-900 border rounded-lg focus:ring-2 focus:ring-gray-200 outline-none"
        />
        <Button
          onClick={generateBounty}
          disabled={!prompt || loadingGenerate}
          className="w-full"
        >
          {loadingGenerate ? "Generating..." : "Generate Bounty"}
        </Button>
      </div>

      {generatedBounty && (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Generated Title
            </h3>
            <p className="bg-gray-50 p-3 rounded text-gray-700">
              {generatedBounty.title}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Generated Description
            </h3>
            <p className="bg-gray-50 p-3 rounded text-gray-700">
              {generatedBounty.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-900 font-medium mb-2">
                Chain
              </label>
              <select
                value={chain}
                onChange={handleChainChange}
                className="w-full p-2 border rounded text-gray-700 outline-none"
              >
                <option value="base">Base</option>
                <option value="degen">Degen</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Amount ({CHAIN_CONFIG[chain as keyof typeof CHAIN_CONFIG].currency})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded text-gray-700"
                placeholder="0.1"
                step="0.01"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!amount || !chain || loadingSubmit}
            className="w-full"
          >
            {loadingSubmit ? "Processing..." : "Create Bounty"}
          </Button>

          {txSuccess && bountyId && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg">
              <p className="mb-2">Bounty created successfully!</p>
              <a 
                href={`https://poidh.xyz/${chain}/bounty/${bountyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View your bounty →
              </a>
            </div>
          )}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              <p className="mb-2">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
