import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

// Authentic loose looping doodle scribble path from Skiper 19 (reference stroke video)
const SKIPER19_DOODLE_RAW =
  'M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655';

function buildContinuousStroke(w, totalH, footerTop) {
  const isMobile = w < 768;
  const isTablet = w >= 768 && w < 1024;

  const rightMargin = isMobile ? w * 0.94 : isTablet ? w * 0.92 : w * 0.91;
  const leftMargin = isMobile ? w * 0.06 : isTablet ? w * 0.08 : w * 0.09;
  const midX = w * 0.5;

  let d = '';

  // 1. HERO ENTRANCE:
  // Starts off-screen top right, curves organically along the right side of Hero
  const startX = rightMargin + (isMobile ? 12 : 24);
  const startY = -25;
  d += `M ${startX.toFixed(1)} ${startY.toFixed(1)} `;

  // Curve through Hero: flows down the right side with an organic sweep
  d += `C ${(rightMargin - 15).toFixed(1)} 120, ${(rightMargin + 10).toFixed(1)} 260, ${(rightMargin - 20).toFixed(1)} 420 `;

  // Sweeps across the gap between Hero and About (Y ~ 480 - 620)
  d += `C ${(rightMargin - 60).toFixed(1)} 540, ${(midX + 120).toFixed(1)} 580, ${(midX - 20).toFixed(1)} 620 `;
  d += `C ${(leftMargin + 120).toFixed(1)} 660, ${(leftMargin - 10).toFixed(1)} 740, ${(leftMargin + 15).toFixed(1)} 860 `;

  // 2. ABOUT SECTION (totalH * 0.08 -> totalH * 0.26):
  // Flows down the left margin, then sweeps through the gap under About
  const yAboutMid = totalH * 0.16;
  const yAboutEnd = totalH * 0.25;

  d += `C ${(leftMargin - 20).toFixed(1)} ${(yAboutMid * 0.85).toFixed(1)}, ${(leftMargin + 10).toFixed(1)} ${(yAboutMid * 1.15).toFixed(1)}, ${(leftMargin + 25).toFixed(1)} ${yAboutMid.toFixed(1)} `;
  // Sweep under About across to the right side
  d += `C ${(leftMargin + 60).toFixed(1)} ${(yAboutEnd * 0.88).toFixed(1)}, ${(midX - 40).toFixed(1)} ${(yAboutEnd * 0.94).toFixed(1)}, ${(midX + 100).toFixed(1)} ${(yAboutEnd * 0.97).toFixed(1)} `;
  d += `C ${(rightMargin - 60).toFixed(1)} ${(yAboutEnd * 1.0).toFixed(1)}, ${(rightMargin + 15).toFixed(1)} ${(yAboutEnd * 1.04).toFixed(1)}, ${(rightMargin - 15).toFixed(1)} ${(yAboutEnd * 1.08).toFixed(1)} `;

  // 3. PROJECTS SHOWCASE (totalH * 0.26 -> totalH * 0.40):
  // Flows down the right margin of Projects, then sweeps under Projects
  const yProjMid = totalH * 0.33;
  const yProjEnd = totalH * 0.40;

  d += `C ${(rightMargin + 15).toFixed(1)} ${(yProjMid * 0.9).toFixed(1)}, ${(rightMargin - 25).toFixed(1)} ${(yProjMid * 1.1).toFixed(1)}, ${(rightMargin - 10).toFixed(1)} ${yProjMid.toFixed(1)} `;
  // Sweep under Projects across to left margin
  d += `C ${(rightMargin - 80).toFixed(1)} ${(yProjEnd * 0.92).toFixed(1)}, ${(midX + 80).toFixed(1)} ${(yProjEnd * 0.96).toFixed(1)}, ${(midX - 80).toFixed(1)} ${(yProjEnd * 0.98).toFixed(1)} `;
  d += `C ${(leftMargin + 80).toFixed(1)} ${(yProjEnd * 1.0).toFixed(1)}, ${(leftMargin - 15).toFixed(1)} ${(yProjEnd * 1.03).toFixed(1)}, ${(leftMargin + 20).toFixed(1)} ${(yProjEnd * 1.07).toFixed(1)} `;

  // 4. SKILLS & TIMELINE (totalH * 0.40 -> totalH * 0.69):
  // Flows down along the left margin of Skills & Education timeline
  const ySkills1 = totalH * 0.48;
  const ySkills2 = totalH * 0.58;
  const ySkillsEnd = totalH * 0.69;

  d += `C ${(leftMargin - 20).toFixed(1)} ${(ySkills1 * 0.92).toFixed(1)}, ${(leftMargin + 15).toFixed(1)} ${(ySkills1 * 1.08).toFixed(1)}, ${(leftMargin + 10).toFixed(1)} ${ySkills1.toFixed(1)} `;
  d += `C ${(leftMargin + 5).toFixed(1)} ${(ySkills2 * 0.94).toFixed(1)}, ${(leftMargin - 15).toFixed(1)} ${(ySkills2 * 1.06).toFixed(1)}, ${(leftMargin + 15).toFixed(1)} ${ySkills2.toFixed(1)} `;
  // Sweep under Skills across to the right margin
  d += `C ${(leftMargin + 60).toFixed(1)} ${(ySkillsEnd * 0.92).toFixed(1)}, ${(midX - 60).toFixed(1)} ${(ySkillsEnd * 0.96).toFixed(1)}, ${(midX + 80).toFixed(1)} ${(ySkillsEnd * 0.98).toFixed(1)} `;
  d += `C ${(rightMargin - 80).toFixed(1)} ${(ySkillsEnd * 1.0).toFixed(1)}, ${(rightMargin + 15).toFixed(1)} ${(ySkillsEnd * 1.03).toFixed(1)}, ${(rightMargin - 20).toFixed(1)} ${(ySkillsEnd * 1.07).toFixed(1)} `;

  // 5. EDUCATION & CONTACT APPROACH:
  const yEduMid = totalH * 0.78;
  const yContactApproach = footerTop - (isMobile ? 380 : 440);

  d += `C ${(rightMargin + 15).toFixed(1)} ${(yEduMid * 0.93).toFixed(1)}, ${(rightMargin - 30).toFixed(1)} ${(yEduMid * 1.07).toFixed(1)}, ${(rightMargin - 15).toFixed(1)} ${yEduMid.toFixed(1)} `;
  d += `C ${(rightMargin - 40).toFixed(1)} ${(yContactApproach * 0.94).toFixed(1)}, ${(rightMargin - 100).toFixed(1)} ${(yContactApproach * 1.01).toFixed(1)}, ${(midX + (isMobile ? 20 : 60)).toFixed(1)} ${yContactApproach.toFixed(1)} `;

  // 6. CONTACT & FOOTER: AUTHENTIC SKIPER 19 DOODLE SCRIBBLE:
  // Placed centered above the crowd canvas footer
  const doodleCenterY = footerTop - (isMobile ? 180 : 230);
  const doodleCenterX = isMobile ? w * 0.5 : w * 0.58;
  const doodleScale = isMobile
    ? Math.min(0.44, (w * 0.82) / 780)
    : Math.min(0.85, (w * 0.52) / 780);

  const rawCenterX = 880;
  const rawCenterY = 290;

  const transformPoint = (x, y) => ({
    x: doodleCenterX + (x - rawCenterX) * doodleScale,
    y: doodleCenterY + (y - rawCenterY) * doodleScale,
  });

  const matches = [...SKIPER19_DOODLE_RAW.matchAll(/([MC])\s*([^MC]+)/g)];
  let firstDoodlePoint = null;
  const doodleSegments = [];

  for (const m of matches) {
    const type = m[1];
    const nums = m[2].trim().split(/[\s,]+/).map(Number);
    if (type === 'M') {
      firstDoodlePoint = transformPoint(nums[0], nums[1]);
    } else if (type === 'C') {
      doodleSegments.push({
        p1: transformPoint(nums[0], nums[1]),
        p2: transformPoint(nums[2], nums[3]),
        p3: transformPoint(nums[4], nums[5]),
      });
    }
  }

  // Smooth tangent transition from Contact approach into the first doodle loop
  const transMidY = yContactApproach + (firstDoodlePoint.y - yContactApproach) * 0.5;
  d += `C ${(midX + 20).toFixed(1)} ${transMidY.toFixed(1)}, ${(firstDoodlePoint.x - 60).toFixed(1)} ${(firstDoodlePoint.y - 30).toFixed(1)}, ${firstDoodlePoint.x.toFixed(1)} ${firstDoodlePoint.y.toFixed(1)} `;

  // Append each segment of the authentic hand-drawn doodle
  for (const seg of doodleSegments) {
    d += `C ${seg.p1.x.toFixed(1)} ${seg.p1.y.toFixed(1)}, ${seg.p2.x.toFixed(1)} ${seg.p2.y.toFixed(1)}, ${seg.p3.x.toFixed(1)} ${seg.p3.y.toFixed(1)} `;
  }

  return d;
}

export default function ScrollStroke({ lenis }) {
  const [dims, setDims] = useState({ w: 1440, h: 7800, footerTop: 7400 });

  const recalculateDimensions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const w = window.innerWidth || document.documentElement.clientWidth || 1440;
    const appEl = document.querySelector('.app');
    const footerEl = document.querySelector('.footer');

    const totalH = appEl
      ? Math.max(appEl.offsetHeight, document.documentElement.scrollHeight)
      : Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);

    const footerTop = footerEl ? footerEl.offsetTop : totalH - 300;

    setDims({ w, h: totalH, footerTop });
  }, []);

  useEffect(() => {
    recalculateDimensions();

    const onResize = () => recalculateDimensions();
    window.addEventListener('resize', onResize);

    const t1 = setTimeout(recalculateDimensions, 400);
    const t2 = setTimeout(recalculateDimensions, 1200);
    const t3 = setTimeout(recalculateDimensions, 2800);

    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [recalculateDimensions]);

  // Framer Motion scroll progress
  const { scrollYProgress } = useScroll();

  // Butter-smooth spring tracking scroll position without jitter
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 38,
    mass: 0.15,
    restDelta: 0.0005,
  });

  // At scroll 0%: tip is revealed entering from the top edge (~0.02)
  // At scroll 100%: full continuous stroke and final looping doodle are completely revealed (1.0)
  const pathLength = useTransform(smoothProgress, [0, 1], [0.02, 1]);

  const pathD = useMemo(() => {
    return buildContinuousStroke(dims.w, dims.h, dims.footerTop);
  }, [dims.w, dims.h, dims.footerTop]);

  const isMobile = dims.w < 768;
  const strokeW = isMobile ? 14 : 20;

  return (
    <div className="scroll-stroke-container" aria-hidden="true">
      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        width="100%"
        height={dims.h}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="scroll-stroke-svg"
      >
        <motion.path
          d={pathD}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeW}
          style={{ pathLength }}
          className="scroll-stroke-path"
        />
      </svg>
    </div>
  );
}
