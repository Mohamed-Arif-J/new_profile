import { gsap } from 'gsap';
import React, { useEffect, useRef } from 'react';

// Two-tone palettes used to tint each peep in dark mode.
// `ink` replaces the black line-art / dark clothing, `fill` replaces the white areas.
const DARK_PALETTE = [
  { ink: [139, 92, 246], fill: [254, 243, 199] }, // violet + cream
  { ink: [6, 182, 212], fill: [255, 228, 230] }, // cyan + blush
  { ink: [236, 72, 153], fill: [224, 242, 254] }, // pink + sky
  { ink: [249, 115, 22], fill: [236, 252, 203] }, // orange + lime
  { ink: [16, 185, 129], fill: [254, 249, 195] }, // emerald + butter
  { ink: [59, 130, 246], fill: [255, 237, 213] }, // blue + peach
  { ink: [234, 179, 8], fill: [237, 233, 254] }, // amber + lavender
  { ink: [239, 68, 68], fill: [204, 251, 241] }, // red + mint
  { ink: [20, 184, 166], fill: [252, 231, 243] }, // teal + rose
  { ink: [168, 85, 247], fill: [220, 252, 231] }, // purple + green
];

const CrowdCanvas = ({
  src = '/images/peeps/all-peeps.png',
  rows = 15,
  cols = 7,
  className = '',
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = {
      src,
      rows,
      cols,
    };

    // UTILS
    const randomRange = (min, max) => min + Math.random() * (max - min);
    const randomIndex = (array) => (randomRange(0, array.length) | 0);
    const removeFromArray = (array, i) => array.splice(i, 1)[0];
    const removeItemFromArray = (array, item) =>
      removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = (array) =>
      removeFromArray(array, randomIndex(array));
    const getRandomFromArray = (array) => array[randomIndex(array) | 0];

    const stage = {
      width: 0,
      height: 0,
    };

    // TWEEN FACTORIES
    const resetPeep = ({ stage, peep }) => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const peepH = peep.height * (peep.baseScale || 1);
      const peepW = peep.width * (peep.baseScale || 1);

      // Adjust vertical distribution relative to container height
      const maxOffset = Math.min(50, stage.height * 0.18);
      const offsetY = maxOffset - (maxOffset * 2.2) * gsap.parseEase('power2.in')(Math.random());
      const startY = stage.height - peepH + offsetY;
      let startX;
      let endX;

      if (direction === 1) {
        startX = -peepW;
        endX = stage.width + peepW * 0.5;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peepW;
        endX = -peepW * 0.5;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return {
        startX,
        startY,
        endX,
      };
    };

    const normalWalk = ({ peep, props }) => {
      const { startX, startY, endX } = props;
      const xDuration = randomRange(9, 16);
      const yDuration = 0.24;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.65, 1.35));
      tl.to(
        peep,
        {
          duration: xDuration,
          x: endX,
          ease: 'none',
        },
        0,
      );
      tl.to(
        peep,
        {
          duration: yDuration,
          repeat: Math.floor(xDuration / yDuration),
          yoyo: true,
          y: startY - 8,
        },
        0,
      );

      return tl;
    };

    const walks = [normalWalk];

    // FACTORY FUNCTIONS
    const createPeep = ({ image, rect }) => {
      const peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        drawArgs: [],
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        baseScale: 1,
        walk: null,
        setRect: (r) => {
          peep.rect = r;
          peep.width = r[2];
          peep.height = r[3];
          peep.drawArgs = [peep.image, ...r, 0, 0, peep.width, peep.height];
        },
        render: (c, source) => {
          c.save();
          c.translate(peep.x, peep.y);
          c.scale(peep.scaleX * (peep.baseScale || 1), peep.baseScale || 1);
          c.drawImage(
            source || peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.width,
            peep.height,
          );
          c.restore();
        },
      };

      peep.setRect(rect);
      return peep;
    };

    // MAIN
    const img = document.createElement('img');
    const allPeeps = [];
    const availablePeeps = [];
    const crowd = [];
    let colorSprite = null;
    let currentSource = img;
    let loaded = false;

    const isDarkTheme = () =>
      document.documentElement.getAttribute('data-theme') === 'dark';

    // Builds a tinted copy of the sprite sheet: every peep cell gets its own palette,
    // mapping luminance (black -> ink, white -> fill) while preserving alpha.
    const buildColorSprite = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return img;
      octx.drawImage(img, 0, 0);

      let imageData;
      try {
        imageData = octx.getImageData(0, 0, w, h);
      } catch {
        return img;
      }

      const { rows: r, cols: c } = config;
      const cellW = w / r;
      const cellH = h / c;
      const cellPalette = Array.from(
        { length: r * c },
        (_, i) => DARK_PALETTE[(i * 7 + ((i / r) | 0) * 3) % DARK_PALETTE.length],
      );

      const data = imageData.data;
      for (let y = 0; y < h; y++) {
        const rowOffset = Math.min(c - 1, (y / cellH) | 0) * r;
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          if (data[idx + 3] === 0) continue;
          const p = cellPalette[rowOffset + Math.min(r - 1, (x / cellW) | 0)];
          const l = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
          data[idx] = p.ink[0] + (p.fill[0] - p.ink[0]) * l;
          data[idx + 1] = p.ink[1] + (p.fill[1] - p.ink[1]) * l;
          data[idx + 2] = p.ink[2] + (p.fill[2] - p.ink[2]) * l;
        }
      }

      octx.putImageData(imageData, 0, 0);
      return off;
    };

    const applyTheme = () => {
      if (!loaded) return;
      if (isDarkTheme()) {
        if (!colorSprite) colorSprite = buildColorSprite();
        currentSource = colorSprite;
      } else {
        currentSource = img;
      }
    };

    const createPeeps = () => {
      const { rows: r, cols: c } = config;
      const { naturalWidth: width, naturalHeight: height } = img;
      const total = r * c;
      const rectWidth = width / r;
      const rectHeight = height / c;

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          createPeep({
            image: img,
            rect: [
              (i % r) * rectWidth,
              ((i / r) | 0) * rectHeight,
              rectWidth,
              rectHeight,
            ],
          }),
        );
      }
    };

    const addPeepToCrowd = () => {
      const peep = removeRandomFromArray(availablePeeps);
      if (!peep) return null;

      const walk = getRandomFromArray(walks)({
        peep,
        props: resetPeep({
          stage,
          peep,
        }),
      }).eventCallback('onComplete', () => {
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      peep.walk = walk;
      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);

      return peep;
    };

    const initCrowd = () => {
      const peepScale = stage.height < 420 ? Math.min(1, Math.max(0.42, stage.height / 360)) : 1;
      allPeeps.forEach((p) => {
        p.baseScale = peepScale;
      });

      while (availablePeeps.length) {
        const p = addPeepToCrowd();
        if (p && p.walk) {
          p.walk.progress(Math.random());
        }
      }
    };

    const removePeepFromCrowd = (peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    const render = () => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      const dpr = window.devicePixelRatio || 1;
      ctx.scale(dpr, dpr);

      crowd.forEach((peep) => {
        peep.render(ctx, currentSource);
      });

      ctx.restore();
    };

    const resize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      stage.width = canvas.clientWidth || window.innerWidth || 1200;
      stage.height = canvas.clientHeight || 220;
      canvas.width = stage.width * dpr;
      canvas.height = stage.height * dpr;

      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });

      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      initCrowd();
    };

    const init = () => {
      loaded = true;
      createPeeps();
      applyTheme();
      resize();
      gsap.ticker.add(render);
    };

    img.onload = init;
    img.src = config.src;

    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      themeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(render);
      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });
    };
  }, [src, rows, cols]);

  return (
    <canvas
      ref={canvasRef}
      className={`crowd-canvas ${className}`}
      aria-label="Animated crowd illustration"
    />
  );
};

const Skiper39 = () => {
  return (
    <div className="relative h-full w-full bg-white text-black">
      <div className="top-22 absolute left-1/2 grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-black">
        <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-white after:to-black after:content-['']">
          Crowd Canvas
        </span>
      </div>
      <div className="absolute bottom-0 h-full w-screen">
        <CrowdCanvas src="/images/peeps/all-peeps.png" rows={15} cols={7} />
      </div>
    </div>
  );
};

export { CrowdCanvas, Skiper39 };
export default CrowdCanvas;
