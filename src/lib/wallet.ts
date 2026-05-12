import { BrowserProvider } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectMetaMask(): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask extension.");
  }
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return address.toLowerCase();
}

export function shortAddr(addr?: string | null) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function genReferralCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

const KEY = "orbexa_wallet";
export const walletStorage = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(KEY)),
  set: (v: string) => localStorage.setItem(KEY, v),
  clear: () => localStorage.removeItem(KEY),
};
