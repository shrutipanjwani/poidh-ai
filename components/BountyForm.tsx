"use client";

import { useState } from "react";
import { ethers } from "ethers";
import abi from "../constants/abi/abi";
import Button from "./Button";

const contractAddress = "0xb502c5856F7244DccDd0264A541Cc25675353D39";

export default function BountyForm() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedBounty, setGeneratedBounty] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("base");

  const generateBounty = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!generatedBounty) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.createSoloBounty(
        generatedBounty.title,
        generatedBounty.description,
        {
          value: ethers.utils.parseEther(amount),
        }
      );

      await tx.wait();
      console.log("Bounty created successfully");
    } catch (error) {
      console.error("Error creating bounty:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your bounty idea... (e.g., 'I need a smart contract that handles token staking')"
          className="w-full h-32 p-4 text-gray-900 border rounded-lg focus:ring-2 focus:ring-gray-200 outline-none"
        />
        <Button
          onClick={generateBounty}
          disabled={!prompt || loading}
          className="w-full"
        >
          {loading ? "Generating..." : "Generate Bounty"}
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
                onChange={(e) => setChain(e.target.value)}
                className="w-full p-2 border rounded text-gray-700 outline-none"
              >
                <option value="base">Base</option>
                <option value="degen">Degen</option>
                <option value="degen">Arbitrum</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Amount (ETH)
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
            disabled={!amount || !chain}
            className="w-full"
          >
            Create Bounty
          </Button>
        </div>
      )}
    </div>
  );
}
