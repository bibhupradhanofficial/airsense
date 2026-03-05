# 🌬️ AirSense

AirSense is a modern, high-performance Air Quality Index (AQI) monitoring platform designed to provide real-time, actionable insights to both citizens and city administrators. 

Built with **Next.js 15**, **Supabase**, and **Tailwind CSS**, AirSense delivers a premium, data-driven experience with beautiful visualizations and a responsive interface.

## 🚀 Key Features

### 👤 For Citizens
- **Real-time AQI Tracking**: Interactive maps and dashboards showing current air quality data.
- **GPS-First Experience**: Seamlessly find AQI data for your current location with automatic geocoding.
- **Smart Search**: Quickly find air quality information for any city or area.
- **Historical Analysis**: View trends and patterns over time with interactive charts.

### 🛠️ For Administrators
- **Admin Roles**: Sophisticated role-based access control (Super Admin & City Admin).
- **Data Management**: Tools for manual data refresh and monitoring.
- **Invite System**: Secure onboarding for new administrators via unique invite codes.
- **Comprehensive Dashboard**: High-level overview of city-wide air quality metrics.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [Mapbox GL JS](https://www.mapbox.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

## 🏗️ Project Structure

```text
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication flows (Login/Register)
│   ├── (citizen)/        # Citizen portal pages
│   ├── (dashboard)/      # Admin dashboard pages
│   └── api/              # Backend API routes
├── components/           # Reusable UI components
│   ├── citizen/          # Citizen-specific components
│   ├── dashboard/        # Admin-specific components
│   ├── maps/             # Mapbox integrations
│   ├── shared/           # Common UI elements
│   └── ui/               # Base shadcn/ui components
├── lib/                  # Utility functions and shared logic
├── store/                # Zustand client-state stores
├── types/                # TypeScript definitions
└── supabase/             # Database migrations and configuration
```

## 🏁 Getting Started

### Prerequisites
- Node.js 18+ 
- A Supabase project
- A Mapbox API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.local.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.local.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
