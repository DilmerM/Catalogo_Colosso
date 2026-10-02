import './CollageBackground.css';

export default function CollageBackground({ configImages, imageFit = 'cover' }) {
  // If no images are provided, don't render anything
  if (!configImages || configImages.length === 0) return null;

  // We need enough items to fill the masonry grid (e.g., ~40 items)
  // If the user provided fewer images, we loop through them to fill the spaces.
  const displayCount = 40;
  const images = Array.from({ length: displayCount }).map((_, i) => configImages[i % configImages.length]);

  return (
    <div className="hero-collage-bg">
      <div className="collage-grid">
        {images.map((src, i) => {
          // Assign different sizes to create an organic masonry feel
          let sizeClass = 'size-small'; // 1x1 (base size, fillers)
          
          if (i % 12 === 0) {
            sizeClass = 'size-large'; // 3x3 (occasional large focal points)
          } else if (i % 3 === 0) {
            sizeClass = 'size-medium'; // 2x2 (frequent medium sizes)
          }

          return (
            <div className={`collage-item ${sizeClass}`} key={i}>
              <img src={src} alt="" style={{ objectFit: imageFit }} />
            </div>
          );
        })}
      </div>
      <div className="collage-overlay"></div>
    </div>
  );
}
