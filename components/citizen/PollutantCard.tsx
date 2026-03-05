'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getPollutantStatus } from '@/lib/aqi-utils';

interface PollutantCardProps {
    name: string;
    value: number;
    unit: string;
    description: string;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
    name,
    value,
    unit,
    description
}) => {
    const status = getPollutantStatus(name, value);

    const statusColors = {
        Safe: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        Elevated: 'bg-amber-100 text-amber-700 border-amber-200',
        High: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="flex flex-col items-center justify-between p-4 shadow-sm transition-all hover:shadow-md border-zinc-100">
                        <span className="text-sm font-medium text-zinc-500">{name}</span>
                        <div className="my-2 flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-zinc-900">{value}</span>
                            <span className="text-xs text-zinc-400">{unit}</span>
                        </div>
                        <Badge variant="outline" className={`font-medium ${statusColors[status]}`}>
                            {status}
                        </Badge>
                    </Card>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] bg-zinc-900 text-white border-zinc-700">
                    <p className="text-xs leading-relaxed">{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
