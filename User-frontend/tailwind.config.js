/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Color: Electric Blue (Represents trust and security globally)
        primary: '#2563EB',
        // Darker blue for hover states on primary buttons
        primaryHover: '#1D4ED8',
        
        // Success & Pricing Color: Trust Green (Perfect for prices, "Available" badges)
        success: '#10B981',
        // Darker green for hover states
        successHover: '#059669',
        
        // Background Colors
        // Very light gray for the main application background
        background: '#F9FAFB',
        // Pure white for content containers (Cards, Modals, Forms)
        surface: '#FFFFFF',
        
        // Typography Colors
        // Deep Charcoal for main text (Better readability than pure black)
        textMain: '#111827',
        // Muted gray for secondary descriptions, placeholders, and footer links
        textMuted: '#6B7280',
      },
    },
  },
  plugins: [],
};