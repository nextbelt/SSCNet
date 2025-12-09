// Apple AI Minimalist Theme Configuration
// Pure Apple aesthetic with AI enhancements

export type ThemeName = 'apple';

export const ACTIVE_THEME: ThemeName = 'apple';

export const themes = {
  apple: {
    name: 'Apple AI Intelligence',
    colors: {
      // Core Apple Colors - Minimal Set
      blue: '#0071e3',       // Primary interactive
      blueHover: '#0077ed',  // Hover state
      blueDark: '#06c',      // Dark mode accent
      
      // Grays - Apple's signature neutrals
      black: '#1d1d1f',      // Headlines
      gray: '#6e6e73',       // Body text
      grayLight: '#86868b',  // Placeholder
      bgLight: '#f5f5f7',    // Backgrounds
      border: '#d2d2d7',     // Borders
      
      // AI Enhancement
      cyan: '#00a8e8',       // AI accent (minimal use)
    },
    
    // Minimal class definitions - rely on Tailwind defaults
    classes: {
      text: 'text-[#1d1d1f]',
      textSecondary: 'text-[#6e6e73]',
      textBlue: 'text-[#0071e3]',
      
      button: 'bg-[#0071e3]/90 text-white hover:bg-[#0071e3]',
      buttonOutline: 'border border-[#d2d2d7] text-[#6e6e73] hover:bg-[#f5f5f7]',
      
      card: 'bg-white border-[#d2d2d7]',
      
      gradient: 'bg-gradient-to-r from-[#0071e3] via-[#00a8e8] to-[#0077ed]',
    }
  }
};

export const theme = themes[ACTIVE_THEME];

export default theme;
