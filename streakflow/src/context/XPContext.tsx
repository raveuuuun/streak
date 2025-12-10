import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { config } from '@/constants/config';

interface XPContextType {
  totalXP: number;
  addXP: (amount: number) => Promise<void>;
  reloadXP: () => Promise<void>;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export const XPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    loadXP();
  }, []);

  const loadXP = async () => {
    try {
      const xp = await storage.get<number>('@streakflow:userXP');
      if (xp !== null && typeof xp === 'number') {
        setTotalXP(xp);
      } else {
        setTotalXP(0);
      }
    } catch (error) {
      console.error('Error loading XP:', error);
      setTotalXP(0);
    }
  };

  const addXP = async (amount: number) => {
    const newXP = totalXP + amount;
    setTotalXP(newXP);
    try {
      await storage.set('@streakflow:userXP', newXP);
    } catch (error) {
      console.error('Error saving XP:', error);
    }
  };

  const reloadXP = async () => {
    await loadXP();
  };

  return (
    <XPContext.Provider
      value={{
        totalXP,
        addXP,
        reloadXP,
      }}
    >
      {children}
    </XPContext.Provider>
  );
};

export const useXP = () => {
  const context = useContext(XPContext);
  if (context === undefined) {
    throw new Error('useXP must be used within an XPProvider');
  }
  return context;
};

