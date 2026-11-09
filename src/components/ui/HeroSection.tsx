'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Sparkles,
    ArrowRight,
    Truck,
    ShieldCheck,
    Heart,
} from 'lucide-react';
import { HERO_CONFIG } from '@/lib/heroConfig';
import { useCartStore } from '@/lib/store';
import BohemeLoader from './BohemeLoader';

gsap.registerPlugin(ScrollTrigger);

interface SparkParticle {
    id: number;
    angle: number;
    distance: number;
    symbol: '❤' | '✦' | '★';
    color: string;
}

export default function HeroSection() {
    const { motion, content, ctas, visuals, stickers } = HERO_CONFIG;
    const { items: cartItems, setCheckoutOpen } = useCartStore();

    // Loader & visibility state
    const [loaderDone, setLoaderDone] = useState(!HERO_CONFIG.preloader.enabled);
    const [isHeroVisible, setIsHeroVisible] = useState(true);
    const [isTabActive, setIsTabActive] = useState(true);

    // Rotating word state
    const [wordIndex, setWordIndex] = useState(0);
    const rotatingWordRef = useRef<HTMLSpanElement>(null);

    // Surprise interactive stamp state
    const [surpriseCount, setSurpriseCount] = useState(0);
    const [surpriseToast, setSurpriseToast] = useState<string | null>(null);
    const [particles, setParticles] = useState<SparkParticle[]>([]);
    const stampButtonRef = useRef<HTMLButtonElement>(null);
    const toastTimeoutRef = useRef<number | null>(null);

    // Refs for GSAP choreography & parallax
    const sectionRef = useRef<HTMLElement>(null);
    const topBadgeRef = useRef<HTMLDivElement>(null);
    const titleLine1Ref = useRef<HTMLSpanElement>(null);
    const titleLine2Ref = useRef<HTMLSpanElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaGroupRef = useRef<HTMLDivElement>(null);
    const trustRowRef = useRef<HTMLDivElement>(null);

    // Visual collage refs
    const collageStageRef = useRef<HTMLDivElement>(null);
    const mainCardRef = useRef<HTMLDivElement>(null);
    const satCard1Ref = useRef<HTMLDivElement>(null);
    const satCard2Ref = useRef<HTMLDivElement>(null);
    const sticker1Ref = useRef<HTMLDivElement>(null);
    const sticker2Ref = useRef<HTMLDivElement>(null);

    // Continuous floating timelines ref so we can pause/resume offscreen
    const ambientTimelinesRef = useRef<gsap.core.Tween[]>([]);

    // Compute longest rotating word length so the pill never shifts layout (CLS = 0)
    const longestWordChars = Math.max(
        ...content.rotatingWords.map((w) => w.length),
        10
    );

    const handleLoaderComplete = useCallback(() => {
        setLoaderDone(true);
    }, []);

    // 1. Observe Hero visibility & Tab visibility to pause infinite animations offscreen
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsHeroVisible(entry.isIntersecting);
            },
            { threshold: 0.05 }
        );
        observer.observe(el);

        const handleVisibilityChange = () => {
            setIsTabActive(document.visibilityState === 'visible');
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Pause / resume ambient floating tweens when offscreen or backgrounded
    useEffect(() => {
        const shouldPlay = isHeroVisible && isTabActive;
        ambientTimelinesRef.current.forEach((tween) => {
            if (shouldPlay) {
                tween.resume();
            } else {
                tween.pause();
            }
        });
    }, [isHeroVisible, isTabActive]);

    // 2. Main Entrance Choreography + Scroll Parallax + Cursor Parallax
    useEffect(() => {
        if (!loaderDone) return;

        const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const ctx = gsap.context(() => {
            if (prefersReducedMotion) {
                gsap.set(
                    [
                        topBadgeRef.current,
                        titleLine1Ref.current,
                        titleLine2Ref.current,
                        subtitleRef.current,
                        ctaGroupRef.current,
                        trustRowRef.current,
                        mainCardRef.current,
                        satCard1Ref.current,
                        satCard2Ref.current,
                        sticker1Ref.current,
                        sticker2Ref.current,
                    ],
                    { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 }
                );
                return;
            }

            // Orchestrated entrance sequence (total ~1.45s, stagger 90ms)
            const tl = gsap.timeline({
                defaults: { ease: motion.easings.reveal },
            });

            tl.fromTo(
                topBadgeRef.current,
                { y: 20, opacity: 0, scale: 0.94 },
                { y: 0, opacity: 1, scale: 1, duration: motion.durations.fast },
                0
            )
                .fromTo(
                    [titleLine1Ref.current, titleLine2Ref.current],
                    { yPercent: 105, opacity: 0, rotateX: 8 },
                    {
                        yPercent: 0,
                        opacity: 1,
                        rotateX: 0,
                        duration: motion.durations.base,
                        stagger: motion.stagger,
                    },
                    0.08
                )
                .fromTo(
                    subtitleRef.current,
                    { y: 24, opacity: 0 },
                    { y: 0, opacity: 1, duration: motion.durations.base },
                    0.26
                )
                .fromTo(
                    ctaGroupRef.current ? Array.from(ctaGroupRef.current.children) : [],
                    { y: 20, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: motion.durations.base * 0.85,
                        stagger: motion.stagger,
                    },
                    0.38
                )
                .fromTo(
                    trustRowRef.current,
                    { y: 14, opacity: 0 },
                    { y: 0, opacity: 1, duration: motion.durations.fast },
                    0.52
                )
                // Visual collage & stickers entrance
                .fromTo(
                    mainCardRef.current,
                    { y: 36, opacity: 0, scale: 0.94, rotation: -3 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        rotation: -1.5,
                        duration: motion.durations.base,
                    },
                    0.22
                )
                .fromTo(
                    [satCard1Ref.current, satCard2Ref.current],
                    { y: 28, opacity: 0, scale: 0.92 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: motion.durations.base * 0.9,
                        stagger: motion.stagger,
                    },
                    0.42
                )
                .fromTo(
                    [sticker1Ref.current, sticker2Ref.current],
                    { scale: 0.5, opacity: 0, rotation: -12 },
                    {
                        scale: 1,
                        opacity: 1,
                        rotation: 0,
                        duration: motion.durations.base * 0.85,
                        ease: motion.easings.playful,
                        stagger: motion.stagger,
                    },
                    0.58
                );

            // Desynchronized subtle floating tweens (amplitudes 4px - 7px, different periods)
            const float1 = gsap.to(sticker1Ref.current, {
                y: -6,
                rotation: 4,
                duration: 2.3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
            const float2 = gsap.to(sticker2Ref.current, {
                y: 5,
                rotation: -3,
                duration: 2.9,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 0.4,
            });
            const floatSat1 = gsap.to(satCard1Ref.current, {
                y: -5,
                duration: 3.1,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 0.2,
            });
            const floatSat2 = gsap.to(satCard2Ref.current, {
                y: 6,
                duration: 3.7,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                delay: 0.7,
            });

            ambientTimelinesRef.current = [float1, float2, floatSat1, floatSat2];

            // Scroll Parallax (both desktop & mobile, ultra-light transform only)
            gsap.to(collageStageRef.current, {
                yPercent: -6,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 0.5,
                },
            });
        }, sectionRef);

        // Desktop cursor parallax with quickTo (GPU transforms only)
        const stageEl = sectionRef.current;
        const canHover =
            typeof window !== 'undefined' &&
            window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
            !prefersReducedMotion;

        if (canHover && stageEl) {
            const mainX = gsap.quickTo(mainCardRef.current, 'x', { duration: 0.6, ease: 'power3.out' });
            const mainY = gsap.quickTo(mainCardRef.current, 'y', { duration: 0.6, ease: 'power3.out' });
            const st1X = gsap.quickTo(sticker1Ref.current, 'x', { duration: 0.5, ease: 'power3.out' });

            const handleMouseMove = (e: MouseEvent) => {
                const rect = stageEl.getBoundingClientRect();
                const relX = (e.clientX - rect.left) / rect.width - 0.5;
                const relY = (e.clientY - rect.top) / rect.height - 0.5;

                mainX(relX * 14);
                mainY(relY * 10);
                st1X(relX * 22);
            };

            const handleMouseLeave = () => {
                mainX(0);
                mainY(0);
                st1X(0);
            };

            stageEl.addEventListener('mousemove', handleMouseMove, { passive: true });
            stageEl.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                stageEl.removeEventListener('mousemove', handleMouseMove);
                stageEl.removeEventListener('mouseleave', handleMouseLeave);
                ambientTimelinesRef.current = [];
                ctx.revert();
            };
        }

        return () => {
            ambientTimelinesRef.current = [];
            ctx.revert();
        };
    }, [loaderDone, motion]);

    // 3. Rotating word interval (paused when offscreen or reduced motion)
    useEffect(() => {
        if (!loaderDone || !isHeroVisible || !isTabActive) return;

        const prefersReducedMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const interval = window.setInterval(() => {
            if (!rotatingWordRef.current) {
                setWordIndex((prev) => (prev + 1) % content.rotatingWords.length);
                return;
            }

            gsap.to(rotatingWordRef.current, {
                yPercent: -90,
                opacity: 0,
                duration: motion.durations.fast * 0.65,
                ease: 'power2.in',
                onComplete: () => {
                    setWordIndex((prev) => (prev + 1) % content.rotatingWords.length);
                    if (rotatingWordRef.current) {
                        gsap.fromTo(
                            rotatingWordRef.current,
                            { yPercent: 90, opacity: 0 },
                            {
                                yPercent: 0,
                                opacity: 1,
                                duration: motion.durations.fast,
                                ease: motion.easings.reveal,
                            }
                        );
                    }
                },
            });
        }, content.rotatingIntervalMs);

        return () => window.clearInterval(interval);
    }, [loaderDone, isHeroVisible, isTabActive, content.rotatingWords.length, content.rotatingIntervalMs, motion]);

    // 4. Interactive Surprise Detail: Quality Stamp Spin + Confetti Hearts Burst
    const handleQualityStampSurprise = () => {
        const nextCount = surpriseCount + 1;
        setSurpriseCount(nextCount);

        const messages = stickers.qualityStamp.surpriseMessages;
        const pickedMessage = messages[(nextCount - 1) % messages.length];
        setSurpriseToast(pickedMessage);

        if (toastTimeoutRef.current) {
            window.clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = window.setTimeout(() => {
            setSurpriseToast(null);
        }, 3200);

        if (stampButtonRef.current) {
            gsap.fromTo(
                stampButtonRef.current,
                { scale: 0.86, rotation: -18 },
                {
                    scale: 1,
                    rotation: 360,
                    duration: motion.durations.base,
                    ease: motion.easings.playful,
                }
            );
        }

        // Spawn 10 lightweight GPU-transformed particles
        const palette = ['#D86A33', '#5F2142', '#FFC99C'];
        const symbols: Array<'❤' | '✦' | '★'> = ['❤', '✦', '★'];
        const burst: SparkParticle[] = Array.from({ length: 10 }, (_, idx) => ({
            id: Date.now() + idx,
            angle: (idx * 36 + (idx % 2 === 0 ? 12 : -8)) * (Math.PI / 180),
            distance: 44 + (idx % 3) * 18,
            symbol: symbols[idx % symbols.length],
            color: palette[idx % palette.length],
        }));
        setParticles(burst);
    };

    // Animate particles when spawned
    useEffect(() => {
        if (particles.length === 0) return;
        const nodes = document.querySelectorAll('.boheme-surprise-particle');
        if (nodes.length === 0) return;

        gsap.fromTo(
            nodes,
            { x: 0, y: 0, scale: 0.4, opacity: 1 },
            {
                x: (i) => Math.cos(particles[i]?.angle || 0) * (particles[i]?.distance || 50),
                y: (i) => Math.sin(particles[i]?.angle || 0) * (particles[i]?.distance || 50) - 12,
                scale: 1.15,
                opacity: 0,
                rotation: (i) => (i % 2 === 0 ? 45 : -45),
                duration: 0.75,
                ease: motion.easings.reveal,
                onComplete: () => setParticles([]),
            }
        );
    }, [particles, motion.easings.reveal]);

    // Secondary CTA handler: uses existing cart/WhatsApp checkout flow if cart has items, or direct WhatsApp
    const handleSecondaryWhatsappCta = () => {
        if (cartItems.length > 0) {
            setCheckoutOpen(true);
            return;
        }
        const encoded = encodeURIComponent(ctas.secondary.defaultWhatsappMessage);
        window.open(
            `https://wa.me/${ctas.secondary.whatsappNumber}?text=${encoded}`,
            '_blank',
            'noopener,noreferrer'
        );
    };

    const currentWord = content.rotatingWords[wordIndex] || content.rotatingWords[0];

    return (
        <>
            {/* Preloader with BOHEME Logo & Laser Scan Sweep */}
            <BohemeLoader onComplete={handleLoaderComplete} />

            <section
                ref={sectionRef}
                aria-label="Bienvenida a BOHEME"
                className="relative pt-24 pb-4 sm:pt-28 sm:pb-6 lg:pt-32 lg:pb-8 overflow-hidden bg-[#FFF9F5]"
            >
                {/* Checkered Artisan Texture + Soft Ambient Glows */}
                <div className="absolute inset-0 bg-checkered-peach opacity-55 pointer-events-none" />
                <div
                    aria-hidden="true"
                    className="absolute -top-20 right-0 w-80 h-80 sm:w-[28rem] sm:h-[28rem] rounded-full bg-[#FFC99C]/45 blur-3xl pointer-events-none"
                />
                <div
                    aria-hidden="true"
                    className="absolute bottom-0 -left-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#D86A33]/15 blur-3xl pointer-events-none"
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                        {/* ================================================================
                            LEFT COLUMN: HIERARCHY (BADGE, DISPLAY TITLE, SUBTITLE, CTAS)
                            ================================================================ */}
                        <div className="lg:col-span-7 text-center lg:text-left">
                            {/* 1. Dotted Stitch Top Badge */}
                            <div
                                ref={topBadgeRef}
                                className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#FFF4EB] border-2 border-dashed border-[#D86A33] text-[#5F2142] text-[11px] sm:text-xs font-black tracking-wider uppercase mb-4 sm:mb-6 shadow-2xs"
                            >
                                <span className="w-2 h-2 rounded-full bg-[#D86A33] animate-ping" />
                                <span className="text-[#D86A33]" aria-hidden="true">✦</span>
                                <span>{content.topBadge}</span>
                                <span className="text-[#D86A33]" aria-hidden="true">✦</span>
                            </div>

                            {/* 2. Display Title with Line Reveal Mask & Accessible Rotating Word */}
                            <h1 className="text-[2.15rem] leading-[1.08] sm:text-5xl md:text-6xl xl:text-[4.1rem] font-black tracking-tight text-[#5F2142] mb-4 sm:mb-6">
                                {/* Full accessible title for screen readers */}
                                <span className="sr-only">{content.accessibleFullTitle}</span>

                                {/* Visual Animated Title */}
                                <span aria-hidden="true" className="block pt-2 pb-1.5">
                                    <span
                                        ref={titleLine1Ref}
                                        className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-2.5 gap-y-1.5 will-change-transform"
                                    >
                                        <span>{content.titlePrefix}</span>
                                        <span
                                            className="relative inline-flex items-center justify-center px-3.5 py-1 sm:px-4 sm:py-1 rounded-2xl bg-[#FFF4EB] border-2 border-dashed border-[#D86A33] text-[#D86A33] shadow-xs align-baseline"
                                            style={{ minWidth: `${longestWordChars + 1.5}ch` }}
                                        >
                                            <span
                                                ref={rotatingWordRef}
                                                className="inline-block text-center will-change-transform"
                                            >
                                                {currentWord}
                                            </span>
                                        </span>
                                    </span>
                                </span>

                                <span aria-hidden="true" className="block pt-1.5 pb-1.5">
                                    <span
                                        ref={titleLine2Ref}
                                        className="inline-block will-change-transform"
                                    >
                                        {content.titleConnector}{' '}
                                        <span className="relative inline-block text-[#D86A33] underline decoration-[#FFC99C] decoration-wavy decoration-3 underline-offset-4">
                                            {content.titleBrand}
                                        </span>
                                    </span>
                                </span>
                            </h1>

                            {/* 3. Subtitle */}
                            <p
                                ref={subtitleRef}
                                className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed font-medium"
                            >
                                {content.subtitle}
                            </p>

                            {/* 4. Primary CTA ("Explorar catálogo") */}
                            <div
                                ref={ctaGroupRef}
                                className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start"
                            >
                                <Link
                                    href={ctas.primary.href}
                                    className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-2.5 px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-black rounded-full text-white bg-[#D86A33] hover:bg-[#c25925] shadow-xl shadow-[#D86A33]/30 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D86A33]/40"
                                >
                                    {/* Subtle diagonal shine on hover */}
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
                                    />
                                    <span className="relative z-10">{ctas.primary.label}</span>
                                    <ArrowRight
                                        size={18}
                                        className="relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                </Link>
                            </div>

                            {/* 5. Trust Pills Row (Above the orange divider line, right below Explorar catálogo) */}
                            <div
                                ref={trustRowRef}
                                className="mt-4 sm:mt-5 pb-4 border-b border-[#FFC99C]/75 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 sm:gap-3"
                            >
                                {content.trustPills.map((pill, idx) => (
                                    <div
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#FFC99C]/80 text-xs font-bold text-[#5F2142] shadow-2xs"
                                    >
                                        {pill.icon === 'sparkles' && (
                                            <Sparkles size={13} className="text-[#D86A33] shrink-0" />
                                        )}
                                        {pill.icon === 'truck' && (
                                            <Truck size={13} className="text-[#D86A33] shrink-0" />
                                        )}
                                        {pill.icon === 'shield' && (
                                            <ShieldCheck size={13} className="text-[#D86A33] shrink-0" />
                                        )}
                                        <span>{pill.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ================================================================
                            RIGHT COLUMN: ATELIER COLLAGE + STICKERS + SURPRISE STAMP
                            ================================================================ */}
                        <div className="lg:col-span-5 relative">
                            <div
                                ref={collageStageRef}
                                className="relative mx-auto max-w-md lg:max-w-none pt-2 pb-2 sm:py-3 will-change-transform"
                            >
                                {/* Floating Sticker 1 (Interactive Surprise Stamp: 100% Calidad Boheme) */}
                                <div
                                    ref={sticker1Ref}
                                    className="absolute -top-2 right-2 sm:-top-4 sm:right-4 z-30 will-change-transform"
                                >
                                    <div className="relative">
                                        {/* Particle burst container */}
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                        >
                                            {particles.map((p) => (
                                                <span
                                                    key={p.id}
                                                    style={{ color: p.color }}
                                                    className="boheme-surprise-particle absolute text-sm font-black select-none"
                                                >
                                                    {p.symbol}
                                                </span>
                                            ))}
                                        </div>

                                        <button
                                            ref={stampButtonRef}
                                            type="button"
                                            onClick={handleQualityStampSurprise}
                                            aria-label={stickers.qualityStamp.ariaLabel}
                                            title="¡Tócame para buena onda en tu turno!"
                                            className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-[#D86A33] bg-[#FFF4EB] hover:bg-white p-2 flex flex-col items-center justify-center text-center shadow-xl -rotate-6 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D86A33]/40"
                                        >
                                            <span className="text-[9px] sm:text-[10px] font-black text-[#5F2142] uppercase tracking-tight leading-tight">
                                                {stickers.qualityStamp.topLine}
                                            </span>
                                            <span className="text-[#D86A33] font-black text-xs sm:text-sm tracking-tight">
                                                {stickers.qualityStamp.middleLine}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] font-black text-[#5F2142] uppercase tracking-tight">
                                                {stickers.qualityStamp.bottomLine}
                                            </span>
                                            <span className="mt-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#D86A33] text-white text-[9px] font-black shadow-2xs group-hover:scale-110 transition-transform">
                                                <Heart size={9} className="fill-current" />
                                                <span>{surpriseCount > 0 ? `+${surpriseCount}` : 'Tócame'}</span>
                                            </span>
                                        </button>

                                        {/* Surprise motivational toast */}
                                        {surpriseToast && (
                                            <div
                                                role="status"
                                                aria-live="polite"
                                                className="absolute -bottom-11 right-0 w-56 px-3 py-1.5 rounded-2xl bg-[#5F2142] text-white text-[11px] font-bold text-center shadow-xl border border-[#FFC99C] z-40"
                                            >
                                                {surpriseToast}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Floating Sticker 2: Washi Tape Top-Left */}
                                <div
                                    ref={sticker2Ref}
                                    aria-hidden="true"
                                    className="absolute top-2 left-2 sm:-left-3 z-20 pointer-events-none will-change-transform"
                                >
                                    <div className="washi-tape px-3.5 py-1.5 rounded-md text-[10px] sm:text-xs font-black text-[#5F2142] shadow-md border-l-3 border-[#D86A33]">
                                        {stickers.washiNote}
                                    </div>
                                </div>

                                {/* MAIN SHOWCASE PRODUCT CARD */}
                                <div
                                    ref={mainCardRef}
                                    className="relative z-10 bg-white rounded-[2rem] p-3 sm:p-4 border-2 border-[#FFC99C] shadow-2xl shadow-[#5F2142]/10 will-change-transform"
                                >
                                    <Link
                                        href={visuals.mainCard.href}
                                        className="group block relative aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF4EB] via-[#FFF9F5] to-[#FFC99C]/35 border border-[#FFC99C]/60"
                                    >
                                        <img
                                            src={visuals.mainCard.imageSrc}
                                            alt={visuals.mainCard.imageAlt}
                                            width={640}
                                            height={640}
                                            fetchPriority="high"
                                            decoding="async"
                                            className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${
                                                visuals.mainCard.imageFit === 'contain'
                                                    ? 'object-contain p-4 drop-shadow-xl'
                                                    : 'object-cover'
                                            }`}
                                        />

                                        {/* Top-left category pill inside main card */}
                                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-[#D86A33]/50 text-[#D86A33] text-[10px] font-black tracking-wider uppercase shadow-xs">
                                            {visuals.mainCard.badge}
                                        </span>

                                        {/* Bottom overlay info bar */}
                                        <div className="absolute inset-x-3 bottom-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#FFC99C]/80 shadow-lg flex items-center justify-between gap-2">
                                            <div>
                                                <div className="text-xs sm:text-sm font-black text-[#5F2142] leading-tight">
                                                    {visuals.mainCard.title}
                                                </div>
                                                <div className="text-[11px] text-gray-600 font-semibold">
                                                    {visuals.mainCard.subtitle}
                                                </div>
                                            </div>
                                            <span className="shrink-0 px-3 py-1.5 rounded-full bg-[#D86A33] text-white text-xs font-black shadow-xs group-hover:bg-[#5F2142] transition-colors">
                                                {visuals.mainCard.priceTag}
                                            </span>
                                        </div>
                                    </Link>
                                </div>

                                {/* SATELLITE MINI-CARDS GRID (Visible on Mobile & Desktop) */}
                                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-3 relative z-20">
                                    {visuals.satelliteCards.map((satCard, idx) => (
                                        <div
                                            key={satCard.id}
                                            ref={idx === 0 ? satCard1Ref : satCard2Ref}
                                            className="will-change-transform"
                                        >
                                            <Link
                                                href={satCard.href}
                                                className="group flex items-center gap-2.5 p-2.5 rounded-2xl bg-white/95 hover:bg-white border border-[#FFC99C] hover:border-[#D86A33] shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                                            >
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#FFF4EB] border border-[#FFC99C]/60 shrink-0">
                                                    <img
                                                        src={satCard.imageSrc}
                                                        alt={satCard.imageAlt}
                                                        width={112}
                                                        height={112}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className={`w-full h-full transition-transform duration-500 group-hover:scale-110 ${
                                                            satCard.imageFit === 'contain'
                                                                ? 'object-contain p-1'
                                                                : 'object-cover'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="block text-[9px] font-black text-[#D86A33] uppercase tracking-wider truncate">
                                                        {satCard.badge}
                                                    </span>
                                                    <div className="text-xs font-black text-[#5F2142] truncate">
                                                        {satCard.title}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-gray-500 truncate">
                                                        {satCard.priceTag}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
