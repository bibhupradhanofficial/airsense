'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';

interface LocationSearchProps {
    onSelect?: (location: { name: string }) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onSelect }) => {
    const [value, setValue] = React.useState('');

    const handleSearch = () => {
        if (value.trim() && onSelect) {
            onSelect({ name: value.trim() });
        }
    };

    return (
        <div className="relative w-full max-w-lg mx-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MapPin className="h-5 w-5 text-zinc-400" />
            </div>
            <Input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for your neighborhood or city..."
                className="h-14 w-full rounded-2xl border-none bg-white/90 pl-11 pr-12 text-black text-lg shadow-xl outline-none ring-teal-500/20 backdrop-blur-md transition-all focus:bg-white focus:ring-4"
            />
            <button
                onClick={handleSearch}
                className="absolute inset-y-2 right-2 flex items-center rounded-xl bg-teal-600 px-4 text-white hover:bg-teal-700 transition-colors"
            >
                <Search className="h-5 w-5" />
            </button>
        </div>
    );
};
