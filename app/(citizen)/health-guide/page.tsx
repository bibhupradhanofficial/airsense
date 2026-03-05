'use client';

import React from 'react';
import { RiskAssessmentWidget } from '@/components/citizen/RiskAssessmentWidget';
import { PollutantEncyclopedia } from '@/components/citizen/PollutantEncyclopedia';
import { AQIScaleExplainer } from '@/components/citizen/AQIScaleExplainer';
import { MaskGuide } from '@/components/citizen/MaskGuide';
import { IAQTips } from '@/components/citizen/IAQTips';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, ShieldCheck, BookOpen } from 'lucide-react';

export default function HealthGuidePage() {
    return (
        <div className="container mx-auto max-w-6xl px-4 py-16 space-y-24">
            {/* Header Section */}
            <section className="text-center space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="flex justify-center">
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-teal-200 bg-teal-50 text-teal-700 font-bold flex items-center gap-2">
                        <Heart className="h-4 w-4 fill-teal-700" /> Public Health Resource
                    </Badge>
                </div>
                <h1 className="text-5xl font-black text-zinc-900 tracking-tight leading-tight">
                    Your Health Guide to <br /> <span className="text-teal-600">Pure Air</span>
                </h1>
                <p className="text-zinc-500 max-w-2xl mx-auto text-lg leading-relaxed">
                    Air quality impacts everyone differently. Learn how to protect yourself and your family with science-backed health strategies.
                </p>
            </section>

            {/* Risk Assessment Widget - Priority 1 */}
            <section className="space-y-4">
                <RiskAssessmentWidget />
            </section>

            {/* AQI Scale Explainer */}
            <section className="space-y-12">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Activity className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900">Measuring Impact</h2>
                    <p className="text-zinc-500 max-w-xl">Deep dive into what each AQI number really means for your daily life and planned activities.</p>
                </div>
                <AQIScaleExplainer />
            </section>

            {/* Pollutant Encyclopedia */}
            <section className="space-y-12 py-12 border-y border-zinc-100">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg shadow-zinc-500/20">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900">Pollutant Encyclopedia</h2>
                    <p className="text-zinc-500 max-w-xl">Knowledge is the first line of defense. Understand the sources and specific health risks of major pollutants.</p>
                </div>
                <PollutantEncyclopedia />
            </section>

            {/* Mask Guide */}
            <section className="space-y-4">
                <MaskGuide />
            </section>

            {/* IAQ Tips */}
            <section className="space-y-12 bg-zinc-50/50 p-12 rounded-[3rem] border border-zinc-100">
                <div className="text-center space-y-4 mb-8">
                    <Badge className="bg-zinc-200 text-zinc-700 hover:bg-zinc-200">Indoor Safety</Badge>
                    <h2 className="text-4xl font-black text-zinc-900">Breathe Easy at Home</h2>
                    <p className="text-zinc-500 max-w-xl mx-auto">Indoor air can be 5x more polluted than outdoor air. Use these strategies to create a safe sanctuary.</p>
                </div>
                <IAQTips />
            </section>

            {/* Final CTA */}
            <section className="text-center py-20 bg-teal-600 rounded-[3.5rem] text-white space-y-8 relative overflow-hidden shadow-2xl shadow-teal-500/20">
                <div className="relative z-10 space-y-4">
                    <ShieldCheck className="h-16 w-16 mx-auto mb-6 text-teal-100 opacity-50" />
                    <h2 className="text-4xl font-black">Stay Informed. Stay Protected.</h2>
                    <p className="text-teal-50 max-w-lg mx-auto text-lg">
                        Enable real-time alerts to get notified when air quality drops in your area.
                    </p>
                    <div className="pt-4">
                        <button className="bg-white text-teal-700 font-black px-10 py-5 rounded-3xl hover:bg-teal-50 transition-all text-xl shadow-xl hover:scale-105 active:scale-95 duration-200">
                            Enable Real-time Alerts
                        </button>
                    </div>
                </div>
                {/* Abstract white bubbles for premium feel */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full -ml-32 -mt-32"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 blur-[80px] rounded-full -mr-40 -mb-40"></div>
            </section>
        </div>
    );
}
