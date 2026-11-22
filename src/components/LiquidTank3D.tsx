import React, { useId } from 'react';
import { formatCompactDH } from '../data/daribatiData';

interface LiquidTank3DProps {
  currentDH: number;
  targetDH: number;
  personalAllocatedDH: number;
  totalTaxBillDH: number;
  accentTop?: string;
  accentBottom?: string;
  accentLight?: string;
  size?: 'main' | 'mini';
  isActive?: boolean;
}

export const LiquidTank3D: React.FC<LiquidTank3DProps> = ({
  currentDH,
  targetDH,
  personalAllocatedDH,
  totalTaxBillDH,
  accentTop = '#087E83',
  accentBottom = '#0A3D56',
  accentLight = '#2FC7CC',
  size = 'main',
  isActive = false,
}) => {
  const uid = useId().replace(/:/g, '');

  const actualTotalDH = currentDH + personalAllocatedDH;
  const actualPercent = Math.min(100, (actualTotalDH / Math.max(1, targetDH)) * 100);

  // Give tangible real-time visual rise when the user allocates their personal tax DH,
  // while always displaying the exact mathematical DH & % numbers alongside it.
  const personalVisualLift =
    personalAllocatedDH > 0 && totalTaxBillDH > 0
      ? Math.min(16, Math.max(2.5, (personalAllocatedDH / totalTaxBillDH) * 18))
      : 0;

  const displayFillPercent = Math.min(98.5, Math.max(8, actualPercent + personalVisualLift));

  const isMini = size === 'mini';
  const viewW = isMini ? 148 : 176;
  const viewH = isMini ? 156 : 196;

  // Cylindrical vessel coordinates
  const tankLeft = isMini ? 22 : 26;
  const tankWidth = isMini ? 84 : 102;
  const tankRight = tankLeft + tankWidth;
  const tankCenterX = tankLeft + tankWidth / 2;
  const rx = tankWidth / 2;
  const ry = isMini ? 9.5 : 12;

  const topRimY = isMini ? 20 : 24;
  const targetLineY = isMini ? 32 : 38; // 100% target water line
  const bottomBaseY = isMini ? 136 : 172;
  const usableHeight = bottomBaseY - targetLineY;

  // Surface Y position based on fill percentage
  const liquidSurfaceY = bottomBaseY - (displayFillPercent / 100) * usableHeight;
  const baseLiquidSurfaceY = bottomBaseY - (actualPercent / 100) * usableHeight;

  // Clip path for the interior of the 3D cylinder
  const cylinderInteriorPath = `
    M ${tankLeft + 1.5} ${topRimY}
    L ${tankLeft + 1.5} ${bottomBaseY}
    A ${rx - 1.5} ${ry - 1} 0 0 0 ${tankRight - 1.5} ${bottomBaseY}
    L ${tankRight - 1.5} ${topRimY}
    A ${rx - 1.5} ${ry - 1} 0 0 1 ${tankLeft + 1.5} ${topRimY}
    Z
  `;

  // Seamless repeating wave path (width = 2 * tankWidth)
  const waveSpan = tankWidth * 2;
  const frontWavePath = `
    M 0 6
    Q ${tankWidth * 0.25} 0, ${tankWidth * 0.5} 6
    T ${tankWidth} 6
    Q ${tankWidth * 1.25} 0, ${tankWidth * 1.5} 6
    T ${waveSpan} 6
    L ${waveSpan} ${usableHeight + 48}
    L 0 ${usableHeight + 48}
    Z
  `;

  const backWavePath = `
    M 0 7
    Q ${tankWidth * 0.25} 13, ${tankWidth * 0.5} 7
    T ${tankWidth} 7
    Q ${tankWidth * 1.25} 13, ${tankWidth * 1.5} 7
    T ${waveSpan} 7
    L ${waveSpan} ${usableHeight + 48}
    L 0 ${usableHeight + 48}
    Z
  `;

  return (
    <div className="relative flex items-center justify-center select-none">
      <svg
        width={viewW}
        height={viewH}
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="overflow-visible"
        role="img"
        aria-label={`Funding tank at ${actualPercent.toFixed(1)}% of ${formatCompactDH(targetDH)} target`}
      >
        <defs>
          <clipPath id={`tank-clip-${uid}`}>
            <path d={cylinderInteriorPath} />
          </clipPath>

          {/* Outer Glass Cylinder Wall Gradient */}
          <linearGradient id={`glass-body-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DCE7F2" stopOpacity="0.58" />
            <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <stop offset="50%" stopColor="#EBF2F8" stopOpacity="0.28" />
            <stop offset="82%" stopColor="#D6E3EF" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#9FB5CA" stopOpacity="0.52" />
          </linearGradient>

          {/* Liquid Vertical Depth Gradient */}
          <linearGradient id={`liquid-grad-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentLight} stopOpacity="0.96" />
            <stop offset="35%" stopColor={accentTop} stopOpacity="0.98" />
            <stop offset="100%" stopColor={accentBottom} stopOpacity="1" />
          </linearGradient>

          {/* Cylindrical Horizontal Depth Shading over Liquid */}
          <linearGradient id={`liquid-cyl-shade-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#081C2E" stopOpacity="0.34" />
            <stop offset="22%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="52%" stopColor="#FFFFFF" stopOpacity="0.02" />
            <stop offset="84%" stopColor="#081C2E" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#081C2E" stopOpacity="0.38" />
          </linearGradient>

          {/* Gold-Teal Personal Contribution Boost Layer */}
          <linearGradient id={`personal-surge-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.78" />
            <stop offset="40%" stopColor="#F5DC86" stopOpacity="0.92" />
            <stop offset="75%" stopColor="#2FC7CC" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#B89122" stopOpacity="0.82" />
          </linearGradient>

          {/* Specular Vertical Glass Highlight */}
          <linearGradient id={`specular-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Drop shadow beneath tank */}
          <radialGradient id={`floor-shadow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0F2942" stopOpacity={isActive ? '0.24' : '0.16'} />
            <stop offset="100%" stopColor="#0F2942" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground Shadow */}
        <ellipse
          cx={tankCenterX}
          cy={bottomBaseY + (isMini ? 10 : 12)}
          rx={rx + 6}
          ry={isMini ? 7 : 8.5}
          fill={`url(#floor-shadow-${uid})`}
        />

        {/* Back Cylinder Wall & Empty Interior */}
        <path
          d={`
            M ${tankLeft} ${topRimY}
            L ${tankLeft} ${bottomBaseY}
            A ${rx} ${ry} 0 0 0 ${tankRight} ${bottomBaseY}
            L ${tankRight} ${topRimY}
            Z
          `}
          fill={`url(#glass-body-${uid})`}
        />

        {/* Subtle Inner Rear Rim Curve */}
        <ellipse
          cx={tankCenterX}
          cy={topRimY}
          rx={rx}
          ry={ry}
          fill="#F1F6FA"
          fillOpacity="0.72"
          stroke="#B8C9D9"
          strokeWidth="1.2"
        />

        {/* Bottom Base Glass Dish */}
        <ellipse
          cx={tankCenterX}
          cy={bottomBaseY}
          rx={rx}
          ry={ry}
          fill="#CFDCE8"
          fillOpacity="0.5"
        />

        {/* Clipped Animated 3D Liquid Assembly */}
        <g clipPath={`url(#tank-clip-${uid})`}>
          {/* Smoothly translating liquid column group */}
          <g
            style={{
              transform: `translateY(${liquidSurfaceY - 6}px)`,
              transition: 'transform 580ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Back Wave Layer */}
            <g transform={`translate(${tankLeft}, 0)`}>
              <g className="liquid-wave-back">
                <path
                  d={backWavePath}
                  fill={accentBottom}
                  fillOpacity="0.48"
                />
              </g>
            </g>

            {/* Front Wave Layer */}
            <g transform={`translate(${tankLeft}, 0)`}>
              <g className="liquid-wave-front">
                <path
                  d={frontWavePath}
                  fill={`url(#liquid-grad-${uid})`}
                />
              </g>
            </g>

            {/* Personal Allocation Luminous Crest Strip (when user allocates DH) */}
            {personalAllocatedDH > 0 && (
              <rect
                x={tankLeft}
                y={4}
                width={tankWidth}
                height={Math.max(7, baseLiquidSurfaceY - liquidSurfaceY + 5)}
                fill={`url(#personal-surge-${uid})`}
                fillOpacity="0.62"
              />
            )}

            {/* Rising Bubbles when Personal DH is Allocated */}
            {personalAllocatedDH > 0 && (
              <g>
                <circle
                  cx={tankLeft + tankWidth * 0.28}
                  cy={38}
                  r={isMini ? 2 : 2.6}
                  fill="#FFFFFF"
                  className="liquid-bubble-1"
                />
                <circle
                  cx={tankLeft + tankWidth * 0.56}
                  cy={46}
                  r={isMini ? 1.6 : 2.1}
                  fill="#F7E59F"
                  className="liquid-bubble-2"
                />
                <circle
                  cx={tankLeft + tankWidth * 0.74}
                  cy={34}
                  r={isMini ? 1.8 : 2.3}
                  fill="#FFFFFF"
                  className="liquid-bubble-3"
                />
              </g>
            )}
          </g>

          {/* 3D Elliptical Liquid Meniscus Surface Ring */}
          <g
            style={{
              transform: `translateY(${liquidSurfaceY}px)`,
              transition: 'transform 580ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <ellipse
              cx={tankCenterX}
              cy={0}
              rx={rx - 1.5}
              ry={ry * 0.76}
              fill={personalAllocatedDH > 0 ? '#EED276' : accentLight}
              fillOpacity={personalAllocatedDH > 0 ? '0.68' : '0.52'}
              stroke="#FFFFFF"
              strokeOpacity="0.72"
              strokeWidth="1.2"
            />
          </g>

          {/* 3D Cylindrical Curvature Shading Overlay */}
          <rect
            x={tankLeft}
            y={topRimY}
            width={tankWidth}
            height={bottomBaseY - topRimY + ry}
            fill={`url(#liquid-cyl-shade-${uid})`}
            pointerEvents="none"
          />

          {/* Bottom Liquid Floor Ellipse Reflection */}
          <ellipse
            cx={tankCenterX}
            cy={bottomBaseY}
            rx={rx - 2}
            ry={ry - 1.5}
            fill={accentBottom}
            fillOpacity="0.55"
          />
        </g>

        {/* Glass Specular Vertical Reflections (gives 3D cylindrical realism) */}
        <rect
          x={tankLeft + tankWidth * 0.12}
          y={topRimY + ry * 0.5}
          width={tankWidth * 0.14}
          height={bottomBaseY - topRimY - ry * 0.5}
          rx={4}
          fill={`url(#specular-${uid})`}
          pointerEvents="none"
        />
        <rect
          x={tankRight - tankWidth * 0.14}
          y={topRimY + ry * 0.8}
          width={tankWidth * 0.05}
          height={bottomBaseY - topRimY - ry}
          rx={2}
          fill="#FFFFFF"
          fillOpacity="0.34"
          pointerEvents="none"
        />

        {/* Crisp Glass Cylinder Outline */}
        <path
          d={`
            M ${tankLeft} ${topRimY}
            L ${tankLeft} ${bottomBaseY}
            A ${rx} ${ry} 0 0 0 ${tankRight} ${bottomBaseY}
            L ${tankRight} ${topRimY}
          `}
          fill="none"
          stroke={isActive ? '#087E83' : '#9EB3C7'}
          strokeWidth={isActive ? '1.8' : '1.3'}
        />
        <ellipse
          cx={tankCenterX}
          cy={topRimY}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={isActive ? '#087E83' : '#9EB3C7'}
          strokeWidth={isActive ? '1.8' : '1.3'}
        />

        {/* Volumetric Measurement Ticks (25%, 50%, 75%) */}
        {[25, 50, 75].map((tick) => {
          const yPos = bottomBaseY - (tick / 100) * usableHeight;
          return (
            <line
              key={tick}
              x1={tankRight - 6}
              y1={yPos}
              x2={tankRight}
              y2={yPos}
              stroke="#647B92"
              strokeOpacity="0.65"
              strokeWidth="1"
            />
          );
        })}

        {/* Horizontal TARGET Line + Label near top of tank */}
        <line
          x1={tankLeft - 5}
          y1={targetLineY}
          x2={tankRight + (isMini ? 36 : 44)}
          y2={targetLineY}
          stroke="#0F2942"
          strokeWidth="1.25"
          strokeDasharray="3.5 2.5"
          strokeOpacity="0.82"
        />
        <circle
          cx={tankRight + 2}
          cy={targetLineY}
          r="2.2"
          fill="#0F2942"
        />
        <text
          x={tankRight + 6}
          y={targetLineY - 4}
          fill="#0F2942"
          fontSize={isMini ? '8' : '8.5'}
          fontWeight="700"
          fontFamily="Plus Jakarta Sans, sans-serif"
          letterSpacing="0.06em"
        >
          TARGET
        </text>
        <text
          x={tankRight + 6}
          y={targetLineY + 9}
          fill="#4A6178"
          fontSize={isMini ? '8' : '8.5'}
          fontWeight="600"
          fontFamily="IBM Plex Mono, monospace"
        >
          {formatCompactDH(targetDH)}
        </text>

        {/* Center-tank Percentage Readout */}
        <g pointerEvents="none">
          <rect
            x={tankCenterX - (isMini ? 24 : 28)}
            y={bottomBaseY - (isMini ? 35 : 42)}
            width={isMini ? 48 : 56}
            height={isMini ? 22 : 25}
            rx={6}
            fill="#0F2942"
            fillOpacity="0.78"
          />
          <text
            x={tankCenterX}
            y={bottomBaseY - (isMini ? 20.5 : 25.5)}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize={isMini ? '10.5' : '12'}
            fontWeight="700"
            fontFamily="IBM Plex Mono, monospace"
          >
            {actualPercent.toFixed(actualPercent % 1 === 0 ? 0 : 1)}%
          </text>
        </g>
      </svg>
    </div>
  );
};
