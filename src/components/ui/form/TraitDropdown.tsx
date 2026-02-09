import React, { useState, useRef, useCallback, useEffect, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface TraitDropdownProps {
    label: string;
    description?: string;
    field: string;
    icon: LucideIcon;
    options: string[];
    value: string[];
    onChange: (field: string, values: string[]) => void;
}

export const TraitDropdown = ({ label, description, field, icon: Icon, options, value, onChange }: TraitDropdownProps) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);
    const [portalStyle, setPortalStyle] = useState<CSSProperties>({});

    const updatePortalPosition = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setPortalStyle({
            position: 'fixed',
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
            zIndex: 12000,
        });
    }, []);

    useEffect(() => {
        if (!open) return;
        updatePortalPosition();
        const handleResize = () => updatePortalPosition();
        const handleScroll = () => updatePortalPosition();
        const handleClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (containerRef.current?.contains(target)) return;
            if (portalRef.current?.contains(target)) return;
            setOpen(false);
        };
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true);
        document.addEventListener('mousedown', handleClick);
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [open, updatePortalPosition]);

    const toggleOption = (option: string) => {
        const next = value.includes(option) ? value.filter((v) => v !== option) : [...value, option];
        onChange(field, next);
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
                <Icon className="w-3.5 h-3.5 text-gold" />
                <span className="font-semibold uppercase tracking-wide">{label}</span>
            </div>
            {description && <p className="text-[10px] text-white/40 mb-1">{description}</p>}

            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm text-white/80 hover:border-gold/60 transition flex items-center gap-2"
            >
                <span className="flex-1 truncate">
                    {value.length ? value.join(', ') : 'Wybierz z listy'}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {createPortal(
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[10000] pointer-events-none"
                        >
                            <motion.div
                                ref={portalRef}
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                style={portalStyle}
                                className="rounded-2xl border border-white/15 bg-gray-950 shadow-2xl pointer-events-auto"
                            >
                                <div className="py-1 max-h-52 overflow-y-auto custom-scrollbar">
                                    {options.map((option) => {
                                        const selected = value.includes(option);
                                        return (
                                            <label
                                                key={option}
                                                className="flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/5 cursor-pointer select-none"
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleOption(option)}
                                                    className="h-4 w-4 rounded border-white/30 bg-transparent checked:bg-gold checked:border-gold focus:ring-gold transition-colors"
                                                />
                                                <span className="flex-1">{option}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-[10px] uppercase tracking-wide text-white/60">
                                    <button type="button" onClick={() => onChange(field, options)} className="hover:text-gold transition-colors">
                                        zaznacz wszystkie
                                    </button>
                                    <button type="button" onClick={() => onChange(field, [])} className="hover:text-red-400 transition-colors">
                                        wyczyść
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};
