'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { getAQIDisplay } from '@/lib/aqi-utils';

interface HealthAdvisoryProps {
    aqi: number;
    source?: string;
}

export const HealthAdvisory: React.FC<HealthAdvisoryProps> = ({ aqi, source }) => {
    const display = getAQIDisplay(aqi);

    const getAdvisoryMessage = () => {
        if (aqi <= 50) return "Ideal conditions for outdoor activities. Enjoy the fresh air!";
        if (aqi <= 100) return "Air quality is acceptable. Sensitive individuals should monitor symptoms.";
        if (aqi <= 150) {
            if (source === 'Traffic') return "Vehicular pollution is elevated. Avoid major roads for exercise.";
            return "Sensitive groups should reduce prolonged outdoor exertion.";
        }
        if (aqi <= 200) {
            const base = "Everyone may begin to experience health effects.";
            if (source === 'Traffic') return `${base} Vehicular pollution is high. Avoid outdoor exercise between 7-10 AM and 5-8 PM. Wear an N95 mask if outdoors.`;
            if (source === 'Industrial') return `${base} Industrial emissions are high nearby. Keep windows closed and use air purifiers.`;
            return `${base} Limit outdoor activities.`;
        }
        return "Health alert: everyone may experience more serious health effects. Stay indoors.";
    };

    const Icon = aqi > 200 ? ShieldAlert : aqi > 100 ? AlertTriangle : Info;

    return (
        <div className="space-y-4">
            <Alert
                className="border-none shadow-sm"
                style={{ backgroundColor: `${display.color}15`, borderLeft: `4px solid ${display.color}` }}
            >
                <Icon className="h-5 w-5" style={{ color: display.color }} />
                <AlertTitle className="font-bold ml-2" style={{ color: display.color }}>
                    Health Advisory for {display.category}
                </AlertTitle>
                <AlertDescription className="mt-2 text-zinc-700 leading-relaxed ml-2">
                    {getAdvisoryMessage()}
                </AlertDescription>
            </Alert>

            {aqi > 100 && (
                <Alert className="bg-orange-50 border-orange-200">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <AlertTitle className="text-orange-800 font-bold ml-2">Sensitive Groups Alert</AlertTitle>
                    <AlertDescription className="text-orange-700 ml-2">
                        Children, elderly, and those with respiratory conditions like asthma should stay indoors or wear protection.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};
