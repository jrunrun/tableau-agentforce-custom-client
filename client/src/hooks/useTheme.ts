import { createContext, useContext } from "react";
import { Theme, ThemeConfig } from "../types";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const themeConfig: ThemeConfig = {
  dark: {
    primary: "bg-black",
    primaryHover: "hover:bg-gray-800",
    primaryText: "text-white",
    secondary: "bg-gray-100",
    secondaryHover: "hover:bg-gray-200",
    secondaryText: "text-gray-800",
    border: "border-gray-200",
    inputBg: "bg-gray-50",
    messageBubble: {
      user: "bg-black text-gray-300 border border-transparent",
      ai: "bg-gray-100 text-gray-800 border border-gray-200",
      system: "bg-slate-200 text-slate-700 border border-gray-200",
    },
  },
  light: {
    primary: "bg-[#1F4973]",
    primaryHover: "hover:bg-[#1a1a1b]",
    primaryText: "text-white",
    secondary: "bg-gray-50",
    secondaryHover: "hover:bg-gray-100",
    secondaryText: "text-gray-900",
    border: "border-gray-200",
    inputBg: "bg-white",
    messageBubble: {
      user: "bg-[#1F4973] text-white",
      ai: "bg-gray-100 text-gray-800 border border-gray-200",
      system: "bg-slate-200 text-slate-700 border border-gray-200",
    },
  },
} as const;
