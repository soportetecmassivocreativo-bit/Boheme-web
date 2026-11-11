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
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #5F2142 0%, #3E1229 100%)',
                    borderRadius: '16px',
                    border: '3px solid #F59E0B',
                    color: '#FFF9F5',
                    fontFamily: 'serif',
                }}
            >
                <span
                    style={{
                        fontSize: 38,
                        fontWeight: 900,
                        lineHeight: 1,
                    }}
                >
                    B
                </span>
                <span
                    style={{
                        fontSize: 20,
                        color: '#D86A33',
                        marginLeft: '3px',
                    }}
                >
                    ♥
                </span>
            </div>
        ),
        {
            ...size,
        }
    );
}
