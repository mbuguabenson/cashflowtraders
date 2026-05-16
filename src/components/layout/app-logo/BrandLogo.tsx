// ⚠️ PLACEHOLDER LOGO - REPLACE WITH YOUR BRAND ⚠️
// This is a generic template placeholder
// Replace this SVG with your own brand logo
// See: src/components/layout/app-logo/README.md for instructions

type TBrandLogoProps = {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
};

export const BrandLogo = ({ width = 140, height = 40, fill = 'currentColor', className = '' }: TBrandLogoProps) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox='0 0 140 40'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            className={className}
            aria-label='Cashflow Logo'
        >
            {/* Modern Flow Icon */}
            <g transform='translate(4, 4)'>
                {/* Outer circle flow */}
                <path
                    d='M16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30C23.732 30 30 23.732 30 16'
                    stroke={fill}
                    strokeWidth='3'
                    strokeLinecap='round'
                    opacity='0.8'
                />
                {/* Inner dollar flow line */}
                <path
                    d='M16 8V24M11 12H19C21 12 21 16 19 16H13C11 16 11 20 13 20H21'
                    stroke={fill}
                    strokeWidth='2.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            </g>

            {/* Cashflow Text */}
            <text
                x='42'
                y='26'
                fontFamily="'Outfit', 'Inter', sans-serif"
                fontSize='18'
                fontWeight='700'
                fill={fill}
                letterSpacing='-0.5'
            >
                Cashflow
            </text>
            <text
                x='42'
                y='34'
                fontFamily="'Inter', sans-serif"
                fontSize='8'
                fontWeight='500'
                fill={fill}
                opacity='0.6'
                letterSpacing='1'
            >
                TRADING ENGINE
            </text>
        </svg>
    );
};

// CUSTOMIZATION OPTIONS:
//
// Option 1: Replace SVG inline (Recommended for vector logos)
// --------------------------------------------------------
// Delete the placeholder SVG above and paste your logo's SVG code:
//
// export const BrandLogo = ({ width = 120, height = 32, fill = 'currentColor' }) => {
//     return (
//         <svg width={width} height={height} viewBox="0 0 120 32" fill="none">
//             {/* Your logo's SVG paths here */}
//             <path d="M..." fill={fill} />
//             <path d="M..." fill={fill} />
//         </svg>
//     );
// };
//
//
// Option 2: Use image file (For PNG/JPG logos)
// ---------------------------------------------
// 1. Place your logo in: public/logo.svg (or .png)
// 2. Replace this component with:
//
// export const BrandLogo = ({ width = 120, height = 32, className = '' }: TBrandLogoProps) => {
//     return (
//         <img
//             src="/logo.svg"
//             alt="Brand Logo"
//             width={width}
//             height={height}
//             className={className}
//         />
//     );
// };
//
//
// Option 3: Use external URL
// ---------------------------
// export const BrandLogo = ({ width = 120, height = 32 }: TBrandLogoProps) => {
//     return (
//         <img
//             src="https://yourdomain.com/logo.svg"
//             alt="Brand Logo"
//             width={width}
//             height={height}
//         />
//     );
// };
//
// For detailed instructions, see: src/components/layout/app-logo/README.md
