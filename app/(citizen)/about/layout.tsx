import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About AirSense | How It Works, Data Sources & Team",
    description: "Learn how AirSense monitors air quality across Indian cities using satellite data, meteorological APIs, and AI-powered source detection to generate actionable policy recommendations.",
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
