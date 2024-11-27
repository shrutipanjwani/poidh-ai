"use client";

import truncateAddress from "@/utils/truncateAddress";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import React from "react";

const Header = () => {
  const router = useRouter();
  const { user } = usePrivy();

  const { login } = useLogin({
    onComplete: async (user, isNewUser, wasAlreadyAuthenticated) => {
      console.log(
        "User: ",
        user,
        "isNewUser: ",
        isNewUser,
        wasAlreadyAuthenticated
      );
      router.push("/");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const fullAddress = user?.wallet?.address;

  const getUserDisplayInfo = () => {
    if (user?.google) return { type: "google", value: user.google.email };
    if (user?.email) return { type: "email", value: user.email.address };
    if (user?.discord) return { type: "discord", value: user.discord.username };
    if (user?.twitter) return { type: "twitter", value: user.twitter.username };
    if (user?.farcaster)
      return {
        type: "farcaster",
        value: `${user.farcaster.username} - ${user.farcaster.fid}`,
      };
    return null;
  };

  const truncatedAddress = truncateAddress(fullAddress);

  const { logout } = useLogout({
    onSuccess: () => {
      router.push("/");
    },
  });

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="relative flex items-center gap-4">
        {user ? (
          <MenuButton>
            <div className="relative z-10">
              <div className="active:scale-95 select-none rounded-lg flex items-center justify-start gap-2 subpixel-antialiased focus:outline-highlight focus:ring-0 border whitespace-nowrap group h-9 min-w-[2rem] border-transparent bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray w-full px-2 py-2 font-polysans text-sm transition-all">
                <div style={{ width: "120px" }}>{truncatedAddress}</div>
              </div>
            </div>
          </MenuButton>
        ) : (
          <button onClick={() => login()}>
            <div className="relative z-10">
              <div className="active:scale-95 select-none rounded-lg flex items-center justify-start gap-2 subpixel-antialiased focus:outline-highlight focus:ring-0 border whitespace-nowrap group h-9 min-w-[2rem] border-transparent bg-white text-gray-900 hover:bg-gray-100 disabled:bg-gray-50 disabled:text-gray w-full px-2 py-2 font-polysans text-sm transition-all">
                <div style={{ width: "120px" }}>Sign In</div>
              </div>
            </div>
          </button>
        )}
      </div>

      <MenuItems className="absolute right-0 z-10 mt-2 origin-top-right divide-y divide-gray-800 rounded-md bg-black shadow-lg ring-1 ring-white ring-opacity-5 transition focus:outline-none">
        {user && getUserDisplayInfo() && (
          <div className="px-4 py-3 font-polysans">
            <p className="text-white text-sm">Signed in as</p>
            <p className="truncate text-sm text-gray-400">
              {getUserDisplayInfo()?.value}
            </p>
          </div>
        )}

        <div className="py-1">
          <MenuItem>
            <button
              type="button"
              className="bg-black text-gray-200
                  block w-full px-4 py-2 text-left text-sm"
              onClick={logout}
            >
              Sign out
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
};

export default Header;
