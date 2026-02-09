
import React, { useEffect, useState } from 'react';
import { ScrollTrigger } from '@/lib/gsapConfig';
import { AnimationController } from '@/lib/MotionSystem';

export const DebugOverlay = () => {
    const [metrics, setMetrics] = useState({
        scrollY: 0,
        lenisProgress: 0,
        triggers: 0
    });

    useEffect(() => {
        const update = () => {
            setMetrics({
                scrollY: window.scrollY,
                lenisProgress: AnimationController.getInstance().getScrollProgress(),
                triggers: ScrollTrigger.getAll().length
            });
        };

        const interval = setInterval(update, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-4 right-4 z-[9999] bg-black/80 text-green-400 p-4 rounded font-mono text-xs pointer-events-none border border-green-500/50">
            <div>Native ScrollY: {metrics.scrollY.toFixed(0)}</div>
            <div>Lenis Progress: {metrics.lenisProgress.toFixed(4)}</div>
            <div>Active Triggers: {metrics.triggers}</div>
            <div className="mt-2 text-[10px] text-white/50">
                Animation System Active
            </div>
        </div>
    );
};
