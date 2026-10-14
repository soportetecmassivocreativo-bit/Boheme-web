import React from 'react';

interface MarqueeTickerProps {
    variant?: 'orange' | 'orange-light' | 'peach';
    reverse?: boolean;
    items?: string[];
}

const DEFAULT_ITEMS = [
    "GORRITOS QUIRÚRGICOS",
    "LANYARDS PERSONALIZADOS",
    "ESTILO & COMODIDAD PRO",
    "ENVÍOS A TODA VENEZUELA",
    "100% HECHO CON AMOR",
    "ACCESORIOS MÉDICOS ÚNICOS"
];

export default function MarqueeTicker({ 
    variant = 'orange', 
    reverse = false, 
    items = DEFAULT_ITEMS 
}: MarqueeTickerProps) {
    const bgClasses = {
        orange: 'bg-[#D86A33] text-white border-y-2 border-[#5F2142]/20 shadow-xs',
        'orange-light': 'bg-[#FFF4EB] text-[#5F2142] border-y-2 border-[#D86A33]',
        peach: 'bg-[#FFF9F5] text-[#D86A33] border-y-2 border-[#D86A33]/60'
    }[variant];

    const starColor = {
        orange: 'text-[#FFC99C]',
        'orange-light': 'text-[#D86A33]',
        peach: 'text-[#5F2142]'
    }[variant];

    // Duplicate list 4 times for seamless continuous loop
    const loopedItems = [...items, ...items, ...items, ...items];

    return (
        <div className={`overflow-hidden py-3 select-none relative ${bgClasses}`}>
            <div className={reverse ? 'animate-marquee-reverse' : 'animate-marquee'}>
                {loopedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-6 px-4 font-black tracking-wider uppercase text-xs sm:text-sm md:text-base whitespace-nowrap">
                        <span>{item}</span>
                        <span className={`inline-block animate-spin-slow ${starColor}`}>✦</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
