import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminDashboard({ session }) {
  const [activeTab, setActiveTab] = useState('ropa');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={`admin-dashboard ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h3>Colosso Admin</h3>
          <button className="admin-close-sidebar" onClick={() => setIsSidebarOpen(false)}>
            <iconify-icon icon="mdi:close" style={{ fontSize: '24px' }}></iconify-icon>
          </button>
        </div>
        <nav className="admin-nav">
          <button 
            className={activeTab === 'ropa' ? 'active' : ''} 
            onClick={() => { setActiveTab('ropa'); setIsSidebarOpen(false); }}
          >
            <iconify-icon icon="mdi:tshirt-crew-outline" style={{ fontSize: '20px' }}></iconify-icon> Ropa
          </button>
          <button 
            className={activeTab === 'suplementos' ? 'active' : ''} 
            onClick={() => { setActiveTab('suplementos'); setIsSidebarOpen(false); }}
          >
            <iconify-icon icon="mdi:shaker-outline" style={{ fontSize: '20px' }}></iconify-icon> Suplementos
          </button>
          <button 
            className={activeTab === 'maquinas' ? 'active' : ''} 
            onClick={() => { setActiveTab('maquinas'); setIsSidebarOpen(false); }}
          >
            <iconify-icon icon="mdi:dumbbell" style={{ fontSize: '20px' }}></iconify-icon> Máquinas
          </button>
          <button 
            className={activeTab === 'config' ? 'active' : ''} 
            onClick={() => { setActiveTab('config'); setIsSidebarOpen(false); }}
          >
            <iconify-icon icon="mdi:cog-outline" style={{ fontSize: '20px' }}></iconify-icon> Configuración
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <small>{session.user.email}</small>
          <button onClick={handleLogout} className="admin-logout-btn">Cerrar Sesión</button>
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-toggle" onClick={() => setIsSidebarOpen(true)}>
              <iconify-icon icon="mdi:menu" style={{ fontSize: '28px' }}></iconify-icon>
            </button>
            <h2>Gestión de {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          </div>
          <button className="admin-primary-btn">+ Añadir Producto</button>
        </header>
        
        <div className="admin-content-area">
          <div className="admin-empty-state">
            <p>Aún no hay productos en esta categoría.</p>
            <span>Pronto conectaremos esta tabla con la base de datos de Supabase.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
