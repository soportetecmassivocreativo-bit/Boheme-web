'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { HERO_CONFIG } from '@/lib/heroConfig';

interface BohemeLoaderProps {
    onComplete?: () => void;
}

export default function BohemeLoader({ onComplete }: BohemeLoaderProps) {
    const { preloader, motion } = HERO_CONFIG;
    const [isDismissed, setIsDismissed] = useState(!preloader.enabled);

    const loaderRef = useRef<HTMLDivElement>(null);
    const logoRevealRef = useRef<HTMLDivElement>(null);
    const scanLineRef = useRef<HTMLDivElement>(null);
    const statusTextRef = useRef<HTMLParagraphElement>(null);
    const topCornerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!preloader.enabled || isDismissed) {
            onComplete?.();
            return;
        }

        const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const finishLoader = () => {
            setIsDismissed(true);
            onComplete?.();
        };

        // Safety fallback so loader never blocks interaction
        const safetyTimer = window.setTimeout(finishLoader, 4200);

        if (prefersReducedMotion) {
            const quickTimer = window.setTimeout(() => {
                if (loaderRef.current) {
                    gsap.to(loaderRef.current, {
                        opacity: 0,
                        duration: 0.3,
                        onComplete: () => {
                            window.clearTimeout(safetyTimer);
                            finishLoader();
                        },
                    });
                } else {
                    window.clearTimeout(safetyTimer);
                    finishLoader();
                }
            }, 350);

            return () => {
                window.clearTimeout(safetyTimer);
                window.clearTimeout(quickTimer);
            };
        }

        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            gsap.set(logoRevealRef.current, { clipPath: 'inset(0 100% 0 0)' });
            gsap.set(scanLineRef.current, { left: '0%', opacity: 0, scaleY: 0.4 });
            gsap.set(topCornerRef.current, { y: -12, opacity: 0 });
            gsap.set(statusTextRef.current, { y: 10, opacity: 0 });

            // 1. Entrance of top-left brand emblem and glowing scan line
            tl.to(
                topCornerRef.current,
                {
                    y: 0,
                    opacity: 1,
                    duration: motion.durations.fast,
                    ease: motion.easings.reveal,
                },
                0
            )
                .to(
                    statusTextRef.current,
                    {
                        y: 0,
                        opacity: 1,
                        duration: motion.durations.fast,
                        ease: motion.easings.reveal,
                    },
                    0.1
                )
                .to(
                    scanLineRef.current,
                    {
                        opacity: 1,
                        scaleY: 1,
                        duration: 0.25,
                        ease: motion.easings.reveal,
                    },
                    0.1
                )
                // 2. Synchronized light-beam sweep revealing the BOHEME logo
                .to(
                    logoRevealRef.current,
                    {
                        clipPath: 'inset(0 0% 0 0)',
                        duration: motion.durations.slow,
                        ease: 'power2.inOut',
                    },
                    0.28
                )
                .to(
                    scanLineRef.current,
                    {
                        left: '100%',
                        duration: motion.durations.slow,
                        ease: 'power2.inOut',
                    },
                    0.28
                )
                // 3. Fade out scan beam & pulse revealed logo subtly
                .to(scanLineRef.current, {
                    opacity: 0,
                    scaleY: 0.3,
                    duration: 0.22,
                    ease: motion.easings.reveal,
                })
                // 4. Lift the curtain up smoothly to unveil the Hero
                .to(
                    loaderRef.current,
                    {
                        yPercent: -100,
                        duration: 0.72,
                        ease: motion.easings.curtain,
                        delay: 0.18,
                        onComplete: () => {
                            window.clearTimeout(safetyTimer);
                            finishLoader();
                        },
                    }
                );
        }, loaderRef);

        return () => {
            window.clearTimeout(safetyTimer);
            ctx.revert();
        };
    }, [preloader.enabled, isDismissed, motion, onComplete]);

    if (isDismissed) return null;

    return (
        <div
            ref={loaderRef}
            role="status"
            aria-live="polite"
            aria-label="Cargando tienda BOHEME"
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none will-change-transform"
        >
            {/* Background image + rich plum & terracotta translucent overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={preloader.backgroundImageSrc}
                    alt={preloader.backgroundImageAlt}
                    className="w-full h-full object-cover scale-105 blur-[3px]"
                />
                <div
                    className="absolute inset-0 backdrop-blur-xs"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(67, 20, 46, 0.92) 0%, rgba(95, 33, 66, 0.88) 52%, rgba(216, 106, 51, 0.78) 100%)',
                    }}
                />
            </div>

            {/* Decorative flowing light ribbons (inspired by reference image light arcs) */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-35"
                viewBox="0 0 1440 900"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <path
                    d="M-100 120 C 320 260, 680 480, 1180 920"
                    stroke="url(#bohemeArc1)"
                    strokeWidth="2.5"
                />
                <path
                    d="M-60 60 C 380 220, 740 450, 1260 920"
                    stroke="url(#bohemeArc1)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                />
                <path
                    d="M1540 160 C 1080 340, 680 560, 180 940"
                    stroke="url(#bohemeArc2)"
                    strokeWidth="2"
                />
                <defs>
                    <linearGradient id="bohemeArc1" x1="0" y1="0" x2="1200" y2="900" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FFC99C" stopOpacity="0" />
                        <stop offset="50%" stopColor="#FFC99C" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#D86A33" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="bohemeArc2" x1="1440" y1="100" x2="200" y2="900" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#D86A33" stopOpacity="0" />
                        <stop offset="50%" stopColor="#FFC99C" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#5F2142" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Top-left emblem & badge (inspired by reference screenshot corner mark) */}
            <div
                ref={topCornerRef}
                className="absolute top-6 left-6 sm:top-8 sm:left-10 z-10 flex items-center gap-3"
            >
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-[#FFC99C]/40 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <img
                        src="/logo-peach.png"
                        alt=""
                        aria-hidden="true"
                        className="w-7 h-7 object-contain"
                    />
                </div>
                <span className="hidden sm:inline-block text-[11px] font-black tracking-[0.2em] uppercase text-[#FFC99C]/90">
                    {preloader.topBadgeText}
                </span>
            </div>

            {/* Center Logo + Laser Scan Sweep */}
            <div className="relative z-10 flex flex-col items-center px-6">
                <div
                    className="relative flex items-center justify-center"
                    style={{
                        width: 'min(82vw, 340px)',
                        height: '110px',
                    }}
                >
                    {/* Subtle ghost silhouette before scan passes */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                        <img
                            src={preloader.logoSrc}
                            alt=""
                            aria-hidden="true"
                            width={preloader.logoWidth}
                            height={preloader.logoHeight}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Revealed crisp BOHEME logo */}
                    <div
                        ref={logoRevealRef}
                        className="absolute inset-0 flex items-center justify-center will-change-[clip-path]"
                    >
                        <img
                            src={preloader.logoSrc}
                            alt={preloader.logoAlt}
                            width={preloader.logoWidth}
                            height={preloader.logoHeight}
                            fetchPriority="high"
                            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,201,156,0.45)]"
                        />
                    </div>

                    {/* Vertical glowing scan line */}
                    <div
                        ref={scanLineRef}
                        aria-hidden="true"
                        className="absolute -top-3 -bottom-3 w-[3px] -translate-x-1/2 pointer-events-none rounded-full"
                        style={{
                            background:
                                'linear-gradient(to bottom, transparent, #FFC99C, #D86A33, #FFC99C, transparent)',
                            boxShadow:
                                '0 0 14px #D86A33, 0 0 28px rgba(255, 201, 156, 0.95)',
                        }}
                    />
                </div>

                {/* Subtitle stitch pill */}
                <p
                    ref={statusTextRef}
                    className="mt-4 px-4 py-1.5 rounded-full bg-white/10 border border-dashed border-[#FFC99C]/50 text-[#FFF4EB] text-xs sm:text-sm font-bold tracking-wide shadow-sm"
                >
                    ✦ {preloader.loadingStatusText} ✦
                </p>
            </div>
        </div>
    );
}
