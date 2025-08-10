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
        
        // Extended gradient colors
        'deep-indigo': '#3A0CA3',        // Deep Indigo
        'bright-cyan': '#00D1D1',        // Bright Cyan (same as muted-cyan)
        'teal-blue': '#0077B6',          // Teal Blue
        'solar-orange': '#FF7E36',       // Solar Orange
        'golden-yellow': '#FFD60A',      // Golden Yellow
        'hot-pink': '#FF6BE1',           // Hot Pink (same as accent-pink)
        'amethyst-purple': '#8E44AD',    // Amethyst Purple
        'lime-glow': '#B5FF3B',          // Lime Glow
        'electric-blue': '#00B4D8',      // Electric Blue
        'neon-magenta': '#FF2E9D',       // Neon Magenta
        
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
      gradientColorStops: {
        'primary-purple': '#9945FF',
        'primary-green': '#14F195',
        'midpoint-blue': '#3A7BD5',
        'accent-pink': '#FF6BE1',
        'muted-cyan': '#00D1D1',
        'deep-indigo': '#3A0CA3',
        'teal-blue': '#0077B6',
        'solar-orange': '#FF7E36',
        'golden-yellow': '#FFD60A',
        'amethyst-purple': '#8E44AD',
        'lime-glow': '#B5FF3B',
        'electric-blue': '#00B4D8',
        'neon-magenta': '#FF2E9D',
      },
      backgroundImage: {
        // Multi-color gradients
        'gradient-multi': 'linear-gradient(135deg, #9945FF 0%, #14F195 50%, #3A7BD5 100%)',
        'gradient-rainbow': 'linear-gradient(135deg, #9945FF 0%, #FF6BE1 25%, #00D1D1 50%, #14F195 75%, #3A7BD5 100%)',
        'gradient-vibrant': 'linear-gradient(135deg, #FF7E36 0%, #FFD60A 25%, #B5FF3B 50%, #00B4D8 75%, #FF2E9D 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #121826 0%, #1e2536 100%)',
        
        // Card gradients with Solana theme
        'gradient-card': 'linear-gradient(135deg, #121826 0%, #0B0F19 100%)',
        'gradient-card-hover': 'linear-gradient(135deg, #1e2536 0%, #121826 100%)',
        
        // Individual Solana color gradients
        'gradient-primary': 'linear-gradient(135deg, #9945FF 0%, #3A7BD5 100%)',
        'gradient-card': 'linear-gradient(135deg, #121826 0%, #1e2536 100%)',
        'gradient-accent': 'linear-gradient(135deg, #FF6BE1 0%, #9945FF 100%)',
        
        // Stat card gradient variations
        'gradient-blue-purple': 'linear-gradient(180deg, #3A0CA3 0%, #9945FF 100%)',
        'gradient-green-blue': 'linear-gradient(180deg, #00D1D1 0%, #0077B6 100%)',
        'gradient-orange-yellow': 'linear-gradient(180deg, #FF7E36 0%, #FFD60A 100%)',
        'gradient-pink-purple': 'linear-gradient(180deg, #FF6BE1 0%, #8E44AD 100%)',
        'gradient-aqua-lime': 'linear-gradient(180deg, #14F195 0%, #B5FF3B 100%)',
        'gradient-electric-magenta': 'linear-gradient(180deg, #00B4D8 0%, #FF2E9D 100%)',
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
