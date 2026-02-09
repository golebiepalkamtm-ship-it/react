import { motion } from 'framer-motion';
import { ChangeEvent } from 'react';

interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
    icon?: any;
    delay?: number;
    highlighted?: boolean;
    maxLength?: number;
    className?: string;
    multiline?: boolean;
    rows?: number;
}

export const InputField = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = 'text',
    required = false,
    icon: Icon,
    delay = 0,
    highlighted = false,
    maxLength,
    className = '',
    multiline = false,
    rows = 4,
}: InputFieldProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
        className={`group ${highlighted ? 'p-4 rounded-2xl border-2 border-gold/30 bg-gold/5' : ''} ${className}`}
    >
        <label className={`block text-sm font-medium mb-2 transition-colors ${highlighted ? 'text-gold font-semibold' : 'text-white/70 group-focus-within:text-gold'}`}>
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-gold transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
            )}

            {multiline ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    rows={rows}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 hover:border-white/30 resize-none`}
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-3 rounded-xl bg-white/5 border border-white/20 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none text-white placeholder-white/40 transition-all duration-200 hover:bg-white/10 hover:border-white/30`}
                />
            )}
        </div>
    </motion.div>
);
