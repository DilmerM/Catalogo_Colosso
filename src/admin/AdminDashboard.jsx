import { useState } from 'react';
import { supabase } from '../lib/supabase';
import AdminProductList from './AdminProductList';
import AdminProductForm from './AdminProductForm';
import AdminRestore from './AdminRestore';

export default function AdminDashboard({ session }) {
  const [activeTab, setActiveTab] = useState('ropa');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={`admin-dashboard ${isMobileMenuOpen ? 'mobile-sidebar-open' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          {!isSidebarCollapsed && <h3>Colosso Admin</h3>}
          <button className="admin-toggle-sidebar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <iconify-icon icon={isSidebarCollapsed ? "mdi:menu-right" : "mdi:menu-left"} style={{ fontSize: '24px' }}></iconify-icon>
          </button>
          <button className="admin-close-sidebar-mobile" onClick={() => setIsMobileMenuOpen(false)}>
            <iconify-icon icon="mdi:close" style={{ fontSize: '24px' }}></iconify-icon>
          </button>
        </div>
        <nav className="admin-nav">
          <button 
            className={activeTab === 'ropa' ? 'active' : ''} 
            onClick={() => { setActiveTab('ropa'); setIsMobileMenuOpen(false); setIsAdding(false); setEditingProduct(null); }}
            title="Ropa"
          >
            <iconify-icon icon="mdi:tshirt-crew-outline" style={{ fontSize: '20px' }}></iconify-icon> {!isSidebarCollapsed && <span>Ropa</span>}
          </button>
          <button 
            className={activeTab === 'suplementos' ? 'active' : ''} 
            onClick={() => { setActiveTab('suplementos'); setIsMobileMenuOpen(false); setIsAdding(false); setEditingProduct(null); }}
            title="Suplementos"
          >
            <iconify-icon icon="mdi:shaker-outline" style={{ fontSize: '20px' }}></iconify-icon> {!isSidebarCollapsed && <span>Suplementos</span>}
          </button>
          <button 
            className={activeTab === 'maquinas' ? 'active' : ''} 
            onClick={() => { setActiveTab('maquinas'); setIsMobileMenuOpen(false); setIsAdding(false); setEditingProduct(null); }}
            title="Máquinas"
          >
            <iconify-icon icon="mdi:dumbbell" style={{ fontSize: '20px' }}></iconify-icon> {!isSidebarCollapsed && <span>Máquinas</span>}
          </button>
          <button 
            className={activeTab === 'restore' ? 'active' : ''} 
            onClick={() => { setActiveTab('restore'); setIsMobileMenuOpen(false); setIsAdding(false); setEditingProduct(null); }}
            title="Restore Backup"
          >
            <iconify-icon icon="mdi:backup-restore" style={{ fontSize: '20px' }}></iconify-icon> {!isSidebarCollapsed && <span>Restore Backup</span>}
          </button>
          <button 
            className={activeTab === 'config' ? 'active' : ''} 
            onClick={() => { setActiveTab('config'); setIsMobileMenuOpen(false); setIsAdding(false); setEditingProduct(null); }}
            title="Configuración"
          >
            <iconify-icon icon="mdi:cog-outline" style={{ fontSize: '20px' }}></iconify-icon> {!isSidebarCollapsed && <span>Configuración</span>}
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          {!isSidebarCollapsed && <small>{session.user.email}</small>}
          <button onClick={handleLogout} className="admin-logout-btn" title="Cerrar Sesión">
            <iconify-icon icon="mdi:logout" style={{ fontSize: '20px' }}></iconify-icon> {!isSidebarCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
              <iconify-icon icon="mdi:menu" style={{ fontSize: '28px' }}></iconify-icon>
            </button>
            <h2>Gestión de {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          </div>
          {!isAdding && !editingProduct && activeTab !== 'config' && activeTab !== 'restore' && (
            <button className="admin-primary-btn" onClick={() => setIsAdding(true)}>+ Añadir Producto</button>
          )}
        </header>
        
        <div className="admin-content-area">
          {activeTab === 'config' ? (
            <div className="admin-empty-state">
              <p>Configuración de la app</p>
              <span>(En desarrollo)</span>
            </div>
          ) : activeTab === 'restore' ? (
            <AdminRestore />
          ) : isAdding || editingProduct ? (
            <AdminProductForm 
              category={activeTab} 
              productToEdit={editingProduct}
              onSaved={() => { setIsAdding(false); setEditingProduct(null); }} 
              onCancel={() => { setIsAdding(false); setEditingProduct(null); }} 
            />
          ) : (
            <AdminProductList 
              category={activeTab} 
              onEdit={(product) => setEditingProduct(product)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
