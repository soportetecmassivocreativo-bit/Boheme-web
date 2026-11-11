import { ImageResponse } from 'next/og';

export const size = {
    width: 64,
    height: 64,
};
export const contentType = 'image/png';

export default function Icon() {
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
                    border: '3px solid #F59E0B',
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
                        marginTop: '-10px',
                    }}
                >
                    <span
                        style={{
                            fontSize: 34,
                            fontWeight: 900,
                            lineHeight: 1,
                        }}
                    >
                        B
                    </span>
                    <span
                        style={{
                            fontSize: 18,
                            color: '#D86A33',
                            marginLeft: '2px',
                        }}
                    >
                        ♥
                    </span>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '3px',
                        left: '5px',
                        right: '5px',
                        height: '17px',
                        borderRadius: '6px',
                        background: '#D86A33',
                        border: '1px solid #FFC99C',
                        color: '#FFFFFF',
                        fontSize: '8.5px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        letterSpacing: '0.5px',
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
