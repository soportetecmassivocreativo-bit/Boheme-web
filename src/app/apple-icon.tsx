import { ImageResponse } from 'next/og';

export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
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
                    border: '6px solid #F59E0B',
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
                        marginTop: '-18px',
                    }}
                >
                    <span
                        style={{
                            fontSize: 98,
                            fontWeight: 900,
                            lineHeight: 1,
                        }}
                    >
                        B
                    </span>
                    <span
                        style={{
                            fontSize: 52,
                            color: '#D86A33',
                            marginLeft: '6px',
                        }}
                    >
                        ♥
                    </span>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '16px',
                        right: '16px',
                        height: '42px',
                        borderRadius: '14px',
                        background: '#D86A33',
                        border: '2px solid #FFC99C',
                        color: '#FFFFFF',
                        fontSize: '21px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: '1.5px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    BOHEME
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
