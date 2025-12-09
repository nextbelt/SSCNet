// Centralized Dashboard Theme Configuration
// This file controls styling for both Supplier and Buyer dashboards
// PREMIUM SAAS THEME - Modern, Glassmorphism, Professional

export const dashboardTheme = {
  // Color Palette - Mapped to Tailwind Config
  colors: {
    // Primary Colors - Blue/Cyan
    bluePrimary: '#0ea5e9', // primary-500
    blueSecondary: '#0284c7', // primary-600
    blueTertiary: '#0369a1', // primary-700
    darkGray: '#0f172a', // secondary-900
    midGray: '#64748b', // secondary-500
    goldPrimary: '#0ea5e9',  // Map gold to primary
    goldSecondary: '#0284c7', // Map gold secondary to primary dark

    // Background Colors
    backgroundDark: '#ffffff',
    backgroundPrimary: '#f8fafc', // secondary-50
    backgroundSecondary: '#f1f5f9', // secondary-100
    backgroundTertiary: '#e2e8f0', // secondary-200

    // State Colors
    success: '#10b981', // emerald-500
    warning: '#f59e0b', // amber-500
    error: '#ef4444', // red-500
    info: '#3b82f6', // blue-500

    // Opacity variations
    blueOpacity: {
      5: 'rgba(14, 165, 233, 0.05)',
      10: 'rgba(14, 165, 233, 0.10)',
      20: 'rgba(14, 165, 233, 0.20)',
      30: 'rgba(14, 165, 233, 0.30)',
      50: 'rgba(14, 165, 233, 0.50)',
    },
    blackOpacity: {
      20: 'rgba(15, 23, 42, 0.04)',
      50: 'rgba(15, 23, 42, 0.06)',
      80: 'rgba(15, 23, 42, 0.08)',
    }
  },

  // Navigation Styling
  navigation: {
    // Fixed 3-column layout classes
    container: 'glass fixed top-0 left-0 right-0 z-50 border-b border-white/20',
    innerContainer: 'max-w-7xl mx-auto px-6',
    flexContainer: 'flex justify-between items-center h-16',

    // Logo section
    logoSection: 'w-64',
    logoButton: 'flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group',
    logoBox: 'w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform',
    logoText: 'text-white font-bold text-sm',
    brandText: 'text-xl font-bold text-secondary-900 tracking-tight',

    // Navigation buttons
    navButtonsContainer: 'flex-1 flex justify-center gap-2',
    navButton: 'px-4 py-2 text-secondary-600 hover:text-primary-600 font-medium text-sm hover:bg-secondary-50 rounded-xl transition-all',
    navButtonActive: 'px-4 py-2 text-primary-700 font-medium text-sm bg-primary-50 border border-primary-100 rounded-xl shadow-sm',

    // Right section
    rightSection: 'w-64 flex justify-end items-center gap-4',

    // Bell notification
    bellButton: 'relative p-2.5 text-secondary-600 hover:text-primary-600 hover:bg-secondary-50 rounded-xl transition-all',
    bellDot: 'absolute top-2.5 right-2.5 w-2 h-2 bg-accent-500 rounded-full ring-2 ring-white',

    // Account dropdown
    accountButton: 'flex items-center gap-2 px-3 py-2 text-secondary-700 hover:text-primary-600 hover:bg-secondary-50 rounded-xl transition-all cursor-pointer text-sm font-medium border border-transparent hover:border-secondary-200',
    accountMenu: 'absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl shadow-glass py-2 z-50',
    accountMenuItem: 'w-full px-4 py-3 text-left text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 transition-all flex items-center gap-3 text-sm font-medium',
    accountMenuItemLogout: 'w-full px-4 py-3 text-left text-accent-600 hover:bg-accent-50 transition-all flex items-center gap-3 text-sm font-medium',
    accountMenuSeparator: 'my-1 border-t border-secondary-100',
  },

  // Background Decorations
  decorativeBackground: {
    container: 'fixed inset-0 pointer-events-none overflow-hidden bg-secondary-50',
    dotPattern: {
      className: 'absolute top-0 left-0 w-full h-full opacity-[0.03]',
      style: {
        backgroundImage: 'radial-gradient(circle, #0ea5e9 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }
    },
    orb1: 'absolute top-0 right-0 w-[800px] h-[800px] bg-primary-200/20 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3',
    orb2: 'absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-200/10 rounded-full blur-3xl opacity-60 -translate-x-1/3 translate-y-1/3',
  },

  // Main Content Area
  mainContent: {
    container: 'max-w-7xl mx-auto px-6 py-8 pt-24 relative z-10',
    spacingContainer: 'space-y-8',
  },

  // Cards and Containers
  cards: {
    primary: 'bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-glass',
    secondary: 'bg-secondary-50/50 border border-secondary-200/50 rounded-xl',
    hover: 'hover:shadow-glass-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer',
    padding: {
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8',
    }
  },

  // Buttons
  buttons: {
    primary: 'px-6 py-2.5 bg-primary-600 text-white font-semibold text-sm rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 active:scale-[0.98]',
    secondary: 'px-6 py-2.5 bg-white border border-secondary-200 text-secondary-700 text-sm rounded-xl hover:bg-secondary-50 hover:border-secondary-300 transition-all shadow-sm active:scale-[0.98]',
    outlined: 'px-6 py-2.5 border border-primary-600 text-primary-600 text-sm rounded-xl hover:bg-primary-50 transition-all active:scale-[0.98]',
    danger: 'px-6 py-2.5 bg-accent-600 text-white font-semibold text-sm rounded-xl hover:bg-accent-700 transition-all shadow-lg shadow-accent-600/20 active:scale-[0.98]',
    disabled: 'px-6 py-2.5 bg-secondary-100 text-secondary-400 text-sm rounded-xl cursor-not-allowed',

    // Button sizes
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
  },

  // Form Elements
  forms: {
    label: 'block text-sm font-medium text-secondary-700 mb-2',
    input: 'w-full px-4 py-3 bg-white/50 border border-secondary-200 text-secondary-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-secondary-400 text-sm transition-all',
    textarea: 'w-full px-4 py-3 bg-white/50 border border-secondary-200 text-secondary-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-secondary-400 resize-none text-sm transition-all',
    select: 'w-full px-4 py-3 bg-white/50 border border-secondary-200 text-secondary-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm transition-all',
    checkbox: 'w-4 h-4 text-primary-600 bg-white border-secondary-300 rounded focus:ring-primary-500',
    radio: 'w-4 h-4 text-primary-600 bg-white border-secondary-300 focus:ring-primary-500',
  },

  // Typography
  typography: {
    heading1: 'text-5xl font-bold text-secondary-900 tracking-tight font-display',
    heading2: 'text-4xl font-bold text-secondary-900 tracking-tight font-display',
    heading3: 'text-3xl font-bold text-secondary-900 tracking-tight font-display',
    heading4: 'text-2xl font-bold text-secondary-900 tracking-tight font-display',
    body: 'text-secondary-700 text-base',
    bodyLarge: 'text-lg text-secondary-700',
    bodySmall: 'text-sm text-secondary-500',
    caption: 'text-xs text-secondary-400',

    // Special text
    blueText: 'text-primary-600',
    blueGradient: 'text-gradient',
    platinum: 'text-secondary-900',
    steel: 'text-secondary-600',
    silver: 'text-secondary-400',
    goldText: 'text-primary-600',
  },

  // Sub-Navigation Tabs
  tabs: {
    container: 'border-b border-secondary-200 mb-8',
    nav: '-mb-px flex space-x-8',
    tab: 'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all border-transparent text-secondary-500 hover:text-secondary-900 hover:border-secondary-300',
    tabActive: 'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all border-primary-500 text-primary-600',
  },

  // Badges and Tags
  badges: {
    primary: 'px-3 py-1 bg-primary-50 text-primary-700 border border-primary-100 rounded-full text-xs font-medium',
    success: 'px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-medium',
    warning: 'px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-medium',
    error: 'px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-full text-xs font-medium',
    info: 'px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium',
    neutral: 'px-3 py-1 bg-secondary-100 text-secondary-600 border border-secondary-200 rounded-full text-xs font-medium',
  },

  // Tables
  tables: {
    container: 'overflow-x-auto rounded-xl border border-secondary-200',
    table: 'w-full',
    header: 'bg-secondary-50 border-b border-secondary-200',
    headerCell: 'px-6 py-4 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider',
    row: 'border-b border-secondary-100 hover:bg-secondary-50/50 transition-colors last:border-0',
    cell: 'px-6 py-4 text-sm text-secondary-700',
  },

  // Modals and Overlays
  modals: {
    overlay: 'fixed inset-0 bg-secondary-900/20 backdrop-blur-sm z-50 flex items-center justify-center',
    container: 'bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-fadeIn',
    header: 'border-b border-secondary-100 px-8 py-6',
    body: 'px-8 py-6',
    footer: 'border-t border-secondary-100 px-8 py-6 flex justify-end gap-3',
  },

  // Loading States
  loading: {
    spinner: 'animate-spin text-primary-600',
    skeleton: 'animate-pulse bg-secondary-100 rounded-xl',
    overlay: 'absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10',
  },

  // Hero Sections
  hero: {
    container: 'bg-gradient-to-br from-white to-secondary-50 border border-white/50 rounded-3xl p-12 mb-8 shadow-glass relative overflow-hidden',
    title: 'text-5xl font-bold text-secondary-900 mb-4 tracking-tight font-display',
    subtitle: 'text-xl text-secondary-500 mb-8 max-w-2xl',
    card: 'bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-glass border border-white/50',
  },

  // Search and Filters
  search: {
    container: 'flex gap-4 mb-8',
    inputWrapper: 'flex-1 relative',
    input: 'w-full pl-12 pr-4 py-3 bg-white/80 border border-secondary-200 text-secondary-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 placeholder-secondary-400 text-sm shadow-sm transition-all',
    icon: 'absolute left-4 top-3.5 text-secondary-400',
    button: 'px-6 py-3 bg-white border border-secondary-200 text-secondary-700 rounded-xl hover:bg-secondary-50 hover:border-secondary-300 transition-all flex items-center gap-2 text-sm font-medium shadow-sm',
    filterButton: 'px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all font-medium text-sm',
  },

  // Animations
  animations: {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },

  // Spacing
  spacing: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },

  // Shadows
  shadows: {
    small: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    glass: 'shadow-glass',
    glassLg: 'shadow-glass-lg',
  },

  // Analytics Components
  analytics: {
    // Metric Cards
    metricCard: {
      blue: 'bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass p-6 border border-white/50 hover:-translate-y-1 transition-all duration-300',
      success: 'bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass p-6 border border-white/50 hover:-translate-y-1 transition-all duration-300',
      warning: 'bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass p-6 border border-white/50 hover:-translate-y-1 transition-all duration-300',
      info: 'bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass p-6 border border-white/50 hover:-translate-y-1 transition-all duration-300',
      error: 'bg-white/80 backdrop-blur-xl rounded-2xl shadow-glass p-6 border border-white/50 hover:-translate-y-1 transition-all duration-300',
    },

    // Icon containers
    iconContainer: {
      gold: 'p-3 bg-primary-50 text-primary-600 rounded-xl',
      success: 'p-3 bg-green-50 text-green-600 rounded-xl',
      warning: 'p-3 bg-amber-50 text-amber-600 rounded-xl',
      info: 'p-3 bg-blue-50 text-blue-600 rounded-xl',
      error: 'p-3 bg-red-50 text-red-600 rounded-xl',
    },

    // Gradient backgrounds
    gradientCard: {
      blue: 'bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary-100',
      gray: 'bg-gradient-to-br from-secondary-50 to-white rounded-2xl border border-secondary-100',
      green: 'bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100',
      gold: 'bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100',
      purple: 'bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100',
    },

    // Insight/Alert cards
    insightCard: {
      success: 'p-4 border-l-4 border-green-500 bg-green-50/50 rounded-r-xl',
      info: 'p-4 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-xl',
      warning: 'p-4 border-l-4 border-amber-500 bg-amber-50/50 rounded-r-xl',
      gold: 'p-4 border-l-4 border-primary-500 bg-primary-50/50 rounded-r-xl',
      error: 'p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-xl',
    },

    // Progress bars
    progressBar: {
      container: 'w-20 h-2 bg-secondary-100 rounded-full overflow-hidden',
      fill: {
        gold: 'h-full bg-primary-500 rounded-full',
        success: 'h-full bg-green-500 rounded-full',
        warning: 'h-full bg-amber-500 rounded-full',
        error: 'h-full bg-red-500 rounded-full',
        info: 'h-full bg-blue-500 rounded-full',
      }
    },

    // Numbered badges
    numberedBadge: {
      blue: 'w-6 h-6 bg-primary-50 border border-primary-100 rounded-full flex items-center justify-center flex-shrink-0',
      green: 'w-6 h-6 bg-green-50 border border-green-100 rounded-full flex items-center justify-center flex-shrink-0',
      cyan: 'w-6 h-6 bg-cyan-50 border border-cyan-100 rounded-full flex items-center justify-center flex-shrink-0',
      gold: 'w-6 h-6 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center flex-shrink-0',
      red: 'w-6 h-6 bg-red-50 border border-red-100 rounded-full flex items-center justify-center flex-shrink-0',
    },

    // Number text inside badges
    numberText: {
      blue: 'text-xs font-bold text-primary-600',
      green: 'text-xs font-bold text-green-600',
      cyan: 'text-xs font-bold text-cyan-600',
      gold: 'text-xs font-bold text-amber-600',
      red: 'text-xs font-bold text-red-600',
    },

    // Trend indicators
    trendUp: 'text-green-600 flex items-center gap-1 text-sm font-medium',
    trendDown: 'text-red-600 flex items-center gap-1 text-sm font-medium',
    trendNeutral: 'text-secondary-500 flex items-center gap-1 text-sm font-medium',

    // Stat cards with colored text
    statValue: {
      gold: 'text-3xl font-bold text-primary-600 font-display',
      success: 'text-3xl font-bold text-green-600 font-display',
      warning: 'text-3xl font-bold text-amber-600 font-display',
      error: 'text-3xl font-bold text-red-600 font-display',
      info: 'text-3xl font-bold text-blue-600 font-display',
      platinum: 'text-3xl font-bold text-secondary-900 font-display',
    },
  },
};

// Helper function to get badge style based on status
export const getStatusBadgeClass = (status: string): string => {
  const statusLower = status.toLowerCase();

  if (statusLower.includes('active') || statusLower.includes('approved') || statusLower.includes('complete') || statusLower.includes('verified')) {
    return dashboardTheme.badges.success;
  }
  if (statusLower.includes('pending') || statusLower.includes('review') || statusLower.includes('progress')) {
    return dashboardTheme.badges.warning;
  }
  if (statusLower.includes('reject') || statusLower.includes('failed') || statusLower.includes('inactive') || statusLower.includes('cancelled')) {
    return dashboardTheme.badges.error;
  }
  if (statusLower.includes('draft') || statusLower.includes('submitted')) {
    return dashboardTheme.badges.info;
  }
  return dashboardTheme.badges.neutral;
};

// Helper function to combine classes
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export default dashboardTheme;
