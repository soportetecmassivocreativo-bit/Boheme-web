import { ImageResponse } from 'next/og';

export const size = {
    width: 64,
    height: 64,
};
export const contentType = 'image/png';

export default function Icon() {
    const vercelEnv = process.env.VERCEL_ENV;
    const isProd = vercelEnv === 'production';
    const isDev = vercelEnv === 'preview' || vercelEnv === 'development';
    const badgeLabel = isProd ? '' : isDev ? 'DEV' : 'LOC';
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
                    borderRadius: '16px',
                    border: `3px solid ${accentColor}`,
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
                        marginTop: badgeLabel ? '-10px' : '0px',
                    }}
                >
                    <span
                        style={{
                            fontSize: badgeLabel ? 34 : 40,
                            fontWeight: 900,
                            lineHeight: 1,
                        }}
                    >
                        B
                    </span>
                    <span
                        style={{
                            fontSize: badgeLabel ? 18 : 22,
                            color: '#FFC99C',
                            marginLeft: '2px',
                        }}
                    >
                        ♥
                    </span>
                </div>

                {badgeLabel && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '3px',
                            left: '5px',
                            right: '5px',
                            height: '17px',
                            borderRadius: '6px',
                            background: accentColor,
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 900,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            letterSpacing: '1px',
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
