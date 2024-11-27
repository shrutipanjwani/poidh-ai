"use client";

import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  degen,
} from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { http } from "viem";

export const wagmiConfig = createConfig({
  chains: [baseSepolia, base, arbitrum, arbitrumSepolia, degen],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [degen.id]: http(),
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClientProvider = ({ children }: any) => {
  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;

  const defaultChain =
    process.env.NODE_ENV === "production" ? base : baseSepolia;

  const queryClient = new QueryClient();

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "wallet", "google", "farcaster"],
        supportedChains: [base, baseSepolia, arbitrum, arbitrumSepolia, degen],
        // Customize Privy's appearance in your app
        appearance: {
          theme: "#0e1016",
          accentColor: "#0055FF",
          //   logo: "",
          walletList: ["metamask", "rainbow"],
        },
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          noPromptOnSignature: true,
        },
        defaultChain: defaultChain,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default ClientProvider;
