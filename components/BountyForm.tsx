"use client";

import { useState } from "react";
import Button from "./Button";

export default function BountyForm() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedBounty, setGeneratedBounty] = useState<{
    title: string;
    description: string;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("base"); // base, ethereum, etc

  const generateBounty = async () => {
    setLoading(true);
    try {
      // Here you would call your AI endpoint
      // For now, let's simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setGeneratedBounty({
        title: "Sample Generated Title",
        description: "Sample generated description based on your prompt...",
      });
    } catch (error) {
      console.error("Error generating bounty:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!generatedBounty) return;

    try {
      // Here you would call the contract to create the bounty
      console.log("Creating bounty:", {
        ...generatedBounty,
        amount,
        chain,
      });
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
                <option value="ethereum">Ethereum</option>
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
