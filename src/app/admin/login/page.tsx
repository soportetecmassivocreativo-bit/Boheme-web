'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('admin@boheme.com');
    const [password, setPassword] = useState('boheme2026');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al iniciar sesión');
                setLoading(false);
                return;
            }

            // Redirect to admin dashboard
            router.push('/admin');
            router.refresh();
        } catch {
            setError('Error de conexión. Intenta nuevamente.');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FFF9F5] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-10 right-10 w-80 h-80 bg-[#FFC99C]/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#D86A33]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                {/* Brand Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block group mb-3">
                        <img 
                            src="/logo-wine.png" 
                            alt="BOHEME" 
                            className="h-16 w-auto mx-auto object-contain transition-transform group-hover:scale-105 drop-shadow-sm" 
                        />
                    </Link>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FFC99C] text-[#5F2142] text-xs font-black uppercase tracking-wider shadow-2xs">
                        <ShieldCheck size={14} className="text-[#D86A33]" />
                        <span>Panel de Administración</span>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#FFC99C]/50 relative">
                    <h1 className="text-2xl font-black text-[#5F2142] tracking-tight mb-1.5">
                        Iniciar Sesión
                    </h1>
                    <p className="text-xs text-gray-500 mb-6 font-medium">
                        Accede para gestionar productos, precios y categorías de BOHEME.
                    </p>

                    {error && (
                        <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-2">
                                Correo de Administrador
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={17} />
                                </span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@boheme.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm transition-all bg-[#FFF9F5]/40 text-[#5F2142] font-medium"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-black text-[#5F2142] uppercase tracking-wider mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={17} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-gray-200 focus:border-[#D86A33] focus:ring-2 focus:ring-[#D86A33]/20 outline-none text-sm transition-all bg-[#FFF9F5]/40 text-[#5F2142] font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#5F2142] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-6 rounded-full bg-[#5F2142] hover:bg-[#43142e] text-white font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#5F2142]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Entrar al Panel</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Quick Access Info for Local Dev */}
                    <div className="mt-6 pt-5 border-t border-gray-100 bg-[#FFF9F5] -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 rounded-b-3xl">
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-[#5F2142] mb-1">
                            <Sparkles size={12} className="text-[#D86A33]" />
                            <span>Credenciales de acceso inicial:</span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono space-y-0.5">
                            <div>Usuario: <strong className="text-[#5F2142]">admin@boheme.com</strong></div>
                            <div>Clave: <strong className="text-[#D86A33]">boheme2026</strong></div>
                        </div>
                    </div>
                </div>

                {/* Back to Home Link */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-xs font-black text-[#5F2142] hover:text-[#D86A33] transition-colors inline-flex items-center gap-1"
                    >
                        <span>← Regresar a la tienda</span>
                    </Link>
                </div>
            </div>
        </main>
    );
}
