import { ImageResponse } from 'next/og';

export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
    const vercelEnv = process.env.VERCEL_ENV;
    const isProd = vercelEnv === 'production';
    const isDev = vercelEnv === 'preview' || vercelEnv === 'development';
    const badgeLabel = isProd ? '' : isDev ? 'DEV' : 'LOCAL';
    const accentColor = isProd ? '#D86A33' : isDev ? '#D86A33' : '#059669';

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #5F2142 0%, #3E1229 100%)',
                    borderRadius: '40px',
                    border: `6px solid ${accentColor}`,
                    position: 'relative',
                    color: '#FFF9F5',
                    fontFamily: 'serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: badgeLabel ? '-18px' : '0px',
                    }}
                >
                    <span
                        style={{
                            fontSize: badgeLabel ? 98 : 112,
                            fontWeight: 900,
                            lineHeight: 1,
                        }}
                    >
                        B
                    </span>
                    <span
                        style={{
                            fontSize: badgeLabel ? 52 : 60,
                            color: '#FFC99C',
                            marginLeft: '6px',
                        }}
                    >
                        ♥
                    </span>
                </div>

                {badgeLabel && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '18px',
                            right: '18px',
                            height: '42px',
                            borderRadius: '14px',
                            background: accentColor,
                            color: '#FFFFFF',
                            fontSize: '24px',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            letterSpacing: '2px',
                            fontFamily: 'sans-serif',
                        }}
                    >
                        {badgeLabel}
                    </div>
                )}
            </div>
        ),
        {
            ...size,
        }
    );
}
