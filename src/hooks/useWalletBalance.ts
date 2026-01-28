import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface WalletData {
  balance: number;
  minimumBalanceMet: boolean;
  isLoading: boolean;
  error: string | null;
}

interface WalletTransaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  balance_after: number;
  created_at: string;
}

const MINIMUM_BALANCE = 50;

export const useWalletBalance = () => {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    minimumBalanceMet: false,
    isLoading: true,
    error: null,
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  const fetchWalletBalance = useCallback(async () => {
    try {
      setWalletData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setWalletData({
          balance: 0,
          minimumBalanceMet: false,
          isLoading: false,
          error: "Not authenticated",
        });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      const balance = profile?.wallet_balance || 0;
      setWalletData({
        balance,
        minimumBalanceMet: balance >= MINIMUM_BALANCE,
        isLoading: false,
        error: null,
      });

      // Fetch recent transactions
      const { data: txns } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (txns) {
        setTransactions(txns as WalletTransaction[]);
      }
    } catch (error: any) {
      console.error("Error fetching wallet balance:", error);
      setWalletData(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to fetch balance",
      }));
    }
  }, []);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  const hasSufficientBalance = useCallback((amount: number) => {
    return walletData.balance >= amount;
  }, [walletData.balance]);

  const getBalanceAfterHold = useCallback((holdAmount: number) => {
    return Math.max(0, walletData.balance - holdAmount);
  }, [walletData.balance]);

  return {
    ...walletData,
    transactions,
    refresh: fetchWalletBalance,
    hasSufficientBalance,
    getBalanceAfterHold,
    minimumRequired: MINIMUM_BALANCE,
  };
};
