import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';

export default function Header({ light, setLight, closeProduct, setShowMachines, products = [], openProduct }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  // Initialize Fuse
  const fuse = new Fuse(products, {
    keys: ['name', 'brand', 'kind', 'sub'],
    threshold: 0.4, // Fuzzy match tolerance
  });

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
    } else {
      const searchResults = fuse.search(searchQuery).map(result => result.item);
      setResults(searchResults.slice(0, 5)); // Limit to 5 results
    }
  }, [searchQuery, products]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (p) => {
    openProduct(p);
    setSearchQuery('');
    setIsFocused(false);
  };

  return (
    <header className="nav">
      <a onClick={() => { closeProduct && closeProduct(); setShowMachines && setShowMachines(false); }} className="brand" href="#inicio">IRON<span>/</span>FORM</a>

      <nav>
        <a onClick={() => { closeProduct && closeProduct(); setShowMachines && setShowMachines(false); }} href="#inicio">Inicio</a>
        <a onClick={() => { closeProduct && closeProduct(); setShowMachines && setShowMachines(false); }} href="#equipo-fuerza">Asesoría Gyms</a>
        <a onClick={() => { closeProduct && closeProduct(); setShowMachines && setShowMachines(false); }} href="#tienda">Suplementos</a>
        <a onClick={(e) => { e.preventDefault(); closeProduct && closeProduct(); setShowMachines && setShowMachines(true); window.scrollTo(0,0); }} href="#">Máquinas</a>
      </nav>

      <div className="nav-search-container" ref={searchRef}>
        <div className="nav-search-input-wrapper">
          <iconify-icon icon="mdi:magnify" className="search-icon"></iconify-icon>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="nav-search-input"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <iconify-icon icon="mdi:close-circle"></iconify-icon>
            </button>
          )}
        </div>
        
        {isFocused && searchQuery && (
          <div className="nav-search-results">
            {results.length > 0 ? (
              results.map(p => (
                <div key={p.id || p.name} className="search-result-item" onClick={() => handleResultClick(p)}>
                  <img src={p.image} alt={p.name} className="search-result-img" />
                  <div className="search-result-info">
                    <span className="search-result-name">{p.name}</span>
                    <span className="search-result-price">{p.price}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-result-empty">No se encontraron productos</div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
