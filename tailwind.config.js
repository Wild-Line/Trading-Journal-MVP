/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Modern color palette
        'dark-bg': '#0B0F19',           // Midnight Blue-Black
        'dark-surface': '#121826',       // Card Background / Panels
        'dark-border': '#1e2536',        // Slightly lighter border
        
        // Primary colors
        'primary-purple': '#9945FF',     // Primary Purple
        'primary-green': '#14F195',      // Primary Green
        'midpoint-blue': '#3A7BD5',      // Midpoint Blue
        
        // Supporting colors
        'accent-pink': '#FF6BE1',        // Accent Pink
        'muted-cyan': '#00D1D1',         // Muted Cyan
        
        // Legacy colors (keeping for compatibility)
        'accent-blue': '#3A7BD5',        // Using midpoint blue
        'accent-purple': '#9945FF',      // Using primary purple
        'accent-green': '#14F195',       // Using primary green
        'accent-red': '#ef4444',
        'accent-orange': '#f59e0b',
        
        // Text colors
        'text-primary': '#FFFFFF',       // Pure white
        'text-secondary': '#A0AEC0',     // Muted grey
      },
      backgroundImage: {
        // Solana-inspired primary gradients
        'gradient-primary': 'linear-gradient(135deg, #9945FF 0%, #3A7BD5 50%, #14F195 100%)',
        'gradient-solana': 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #121826 0%, #1e2536 100%)',
        
        // Card gradients with Solana theme
        'gradient-card': 'linear-gradient(135deg, #121826 0%, #0B0F19 100%)',
        'gradient-card-hover': 'linear-gradient(135deg, #1e2536 0%, #121826 100%)',
        
        // Individual Solana color gradients
        'gradient-purple': 'linear-gradient(135deg, #9945FF 0%, #7c3aed 100%)',
        'gradient-green': 'linear-gradient(135deg, #14F195 0%, #10b981 100%)',
        'gradient-blue': 'linear-gradient(135deg, #3A7BD5 0%, #2563eb 100%)',
        'gradient-pink': 'linear-gradient(135deg, #FF6BE1 0%, #ec4899 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #00D1D1 0%, #06b6d4 100%)',
        
        // Legacy gradients (updated with new colors)
        'gradient-red': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        
        // Solana-themed multi-color gradients
        'gradient-rainbow': 'linear-gradient(135deg, #9945FF 0%, #3A7BD5 25%, #14F195 50%, #00D1D1 75%, #FF6BE1 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FF6BE1 0%, #9945FF 50%, #3A7BD5 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #00D1D1 0%, #3A7BD5 50%, #9945FF 100%)',
        'gradient-forest': 'linear-gradient(135deg, #14F195 0%, #10b981 50%, #059669 100%)',
        
        // Radial gradients with Solana colors
        'gradient-radial': 'radial-gradient(ellipse at center, #9945FF 0%, #0B0F19 100%)',
        'gradient-radial-green': 'radial-gradient(ellipse at center, #14F195 0%, #0B0F19 100%)',
        'gradient-radial-blue': 'radial-gradient(ellipse at center, #3A7BD5 0%, #0B0F19 100%)',
        
        // Background mesh gradients
        'gradient-mesh': 'conic-gradient(from 0deg at 50% 50%, #9945FF, #3A7BD5, #14F195, #FF6BE1, #9945FF)',
        'gradient-bg': 'radial-gradient(ellipse at top, #121826 0%, #0B0F19 100%)',
      },
    },
  },
  plugins: [],
}
