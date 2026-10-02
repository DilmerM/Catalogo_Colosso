import { motion, useScroll, useTransform } from 'framer-motion';
import './GeometricShapes.css';

const shapeConfigs = {
  hero: [
    { type: 'shape-circle', color: 'color-red', size: '300px', top: '-100px', left: '-120px', scrollRange: [0, 800], yRange: [0, -150] },
    { type: 'shape-hexagon', color: 'color-grey', size: '150px', top: '20%', right: '-50px', rotation: 15, scrollRange: [0, 800], yRange: [0, -80] },
    { type: 'shape-plus', color: 'color-red', size: '80px', bottom: '15%', left: '10%', rotation: 45, scrollRange: [0, 800], yRange: [0, -200] },
    { type: 'shape-pill', color: 'color-lightgrey', size: '250px', height: '80px', bottom: '-20px', right: '-80px', rotation: -15, scrollRange: [0, 800], yRange: [0, -100] },
  ],
  shop: [
    { type: 'shape-triangle', color: 'color-red', size: '200px', top: '10%', right: '-80px', rotation: -30, scrollRange: [0, 1500], yRange: [0, -250] },
    { type: 'shape-circle', color: 'color-lightgrey', size: '400px', bottom: '20%', left: '-200px', scrollRange: [0, 1500], yRange: [0, -150] },
    { type: 'shape-star', color: 'color-grey', size: '120px', top: '60%', right: '5%', rotation: 20, scrollRange: [0, 1500], yRange: [0, -300] },
  ],
  cta: [
    { type: 'shape-hexagon', color: 'color-red', size: '280px', top: '-100px', left: '50%', rotation: 10, scrollRange: [0, 2500], yRange: [0, -200] },
    { type: 'shape-pill', color: 'color-grey', size: '180px', height: '60px', bottom: '10%', right: '-50px', rotation: 45, scrollRange: [0, 2500], yRange: [0, -300] },
    { type: 'shape-rect', color: 'color-lightgrey', size: '120px', height: '120px', top: '30%', left: '-40px', rotation: -20, scrollRange: [0, 2500], yRange: [0, -150] },
  ],
  map: [
    { type: 'shape-circle', color: 'color-red', size: '350px', top: '-150px', right: '-150px', scrollRange: [0, 3500], yRange: [0, -200] },
    { type: 'shape-triangle', color: 'color-grey', size: '160px', bottom: '20%', left: '-60px', rotation: 60, scrollRange: [0, 3500], yRange: [0, -120] },
    { type: 'shape-plus', color: 'color-lightgrey', size: '100px', top: '40%', right: '15%', rotation: 15, scrollRange: [0, 3500], yRange: [0, -250] },
  ],
  productDetail: [
    { type: 'shape-pill', color: 'color-red', size: '320px', height: '100px', top: '-20px', left: '-100px', rotation: 25, scrollRange: [0, 1200], yRange: [0, -150] },
    { type: 'shape-hexagon', color: 'color-grey', size: '180px', bottom: '10%', right: '-70px', rotation: -15, scrollRange: [0, 1200], yRange: [0, -250] },
    { type: 'shape-star', color: 'color-lightgrey', size: '90px', top: '45%', left: '5%', rotation: 45, scrollRange: [0, 1200], yRange: [0, -180] },
  ],
  machines: [
    { type: 'shape-rect', color: 'color-red', size: '400px', height: '150px', top: '5%', right: '-150px', rotation: -35, scrollRange: [0, 2000], yRange: [0, -200] },
    { type: 'shape-circle', color: 'color-grey', size: '200px', bottom: '30%', left: '-80px', scrollRange: [0, 2000], yRange: [0, -300] },
    { type: 'shape-triangle', color: 'color-lightgrey', size: '140px', top: '50%', right: '10%', rotation: 90, scrollRange: [0, 2000], yRange: [0, -150] },
  ]
};

const Shape = ({ config }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, config.scrollRange, config.yRange);

  return (
    <motion.div
      className={`geo-shape ${config.type} ${config.color}`}
      style={{
        width: config.size,
        height: config.height || config.size,
        top: config.top,
        bottom: config.bottom,
        left: config.left,
        right: config.right,
        rotate: config.rotation || 0,
        y
      }}
    />
  );
};

export default function GeometricShapes({ section = 'hero' }) {
  const shapes = shapeConfigs[section] || shapeConfigs.hero;
  
  return (
    <div className="geo-shapes">
      {shapes.map((config, i) => (
        <Shape key={i} config={config} />
      ))}
    </div>
  );
}
