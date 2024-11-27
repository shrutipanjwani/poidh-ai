"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import abi from "../constants/abi/abi";
import Button from "./Button";

const contractAddress = "0xb502c5856F7244DccDd0264A541Cc25675353D39";

export default function BountyForm() {
  const { user } = usePrivy();
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

  const generateBounty = async () => {
    setLoadingGenerate(true);
    try {
      const response = await fetch('/api/generate-bounty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idea: prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate bounty');
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

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.createSoloBounty(
        generatedBounty.title,
        generatedBounty.description,
        {
          value: ethers.utils.parseEther(amount)
        }
      );

      const receipt = await tx.wait();
      
      const bountyCreatedEvent = receipt.events?.find(
        (event: any) => event.event === "BountyCreated"
      );
      
      if (bountyCreatedEvent) {
        const id = bountyCreatedEvent.args.id.toString();
        setBountyId(id);
        setTxSuccess(true);
        setPrompt("");
        setAmount("");
        setGeneratedBounty(null);
      }
      
    } catch (error) {
      console.error("Error creating bounty:", error);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your bounty idea..."
          className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <h3 className="font-semibold mb-2">Generated Title</h3>
            <p className="bg-gray-50 p-3 rounded">{generatedBounty.title}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Generated Description</h3>
            <p className="bg-gray-50 p-3 rounded">{generatedBounty.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Chain
              </label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="base">Base</option>
                <option value="ethereum">Ethereum</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
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
                href={`https://poidh.xyz/base/bounty/${bountyId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View your bounty →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 