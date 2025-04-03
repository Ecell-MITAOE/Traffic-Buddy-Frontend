import { create } from 'zustand'

const useThemeStore = create((set) => ({
    currentTheme: "Dark",
    setTheme: (theme) => set({ currentTheme: theme })
}))

export const getCurrentTheme = () => useThemeStore.getState().currentTheme
export const setCurrentTheme = (theme) => useThemeStore.getState().setTheme(theme)

const Themes = {
  "Dark":{
    "bgPrimary": "#000000",    // --color-bg-primary: #000000;
    "bgSecondary": "#1f1f1f", // --color-bg-secondary: #1f1f1f;

    "primary":"#2f2f2f",     // --color-primary: #2f2f2f;
    "hovPrimary":"#404040",  // --color-primary-hov: #404040;

    "secondary":"#3956cc",    // --color-secondary: #3956cc;
    "hovSecondary":"#2944b1", // --color-secondary-hov: #2944b1;

    "borderPrimary":"#000000",   // --color-primary-border: #000000;
    "borderSecondary":"#22347d", // --color-secondary-border: #22347d;

    "tBase":"#f3f4f6",       // --color-text-base: #f3f4f6;
    "tSecondary":"#9ca3af", // --color-text-secondary: rgb(156 163 175);
    "tTrafficReports":"#fffc88", // --color-text-traffic-reports: #fffc88;

    "btnDisabled":"#6b7280",  // --color-button-disabled: #374151;
    "tDisabled":"#6b7280",    // --color-text-disabled: #6b7280;

    "cartGrid":"#4B5563" ,
    "cartAxis":"#9ca3af",
    "cartLine":"#669dbc",

    "COLORS":  ["#dd4c5f", 
      "#fffc88", 
      "#59c095", 
      "#8a063c", 
      "#fdb561", 
      "#669dbc", 
      "#a47f51", 
      "#b30a51", 
      "#049349", 
      "#fb92b6", 
      "#c4b396", 
      "#65cbd7"],
      
  },
  "Light":{}
}

export default Themes;