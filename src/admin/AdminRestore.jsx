import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { modalService } from '../lib/modalService.js';
import { toastService } from '../lib/toastService.js';

export default function AdminRestore() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('backups').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setBackups(data);
    }
    setLoading(false);
  };

  const handleCreateBackup = async () => {
    if (!(await modalService.confirm('¿Deseas crear un nuevo respaldo de la base de datos ahora?'))) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al crear backup');
      
      toastService.success('Respaldo creado exitosamente.');
      fetchBackups();
    } catch (err) {
      console.error(err);
      await modalService.alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (backup) => {
    const confirmMsg = `PELIGRO: Vas a restaurar la base de datos al estado del ${new Date(backup.created_at).toLocaleString()}.\n\nSe sobrescribirán TODOS los productos actuales. Esta acción es irreversible.\n\n¿Estás completamente seguro?`;
    if (!(await modalService.confirm(confirmMsg))) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup_id: backup.id })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al restaurar backup');
      
      toastService.success('¡Base de datos restaurada con éxito!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      await modalService.alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBackup = async (backup) => {
    if (!(await modalService.confirm(`¿Estás seguro de que deseas ELIMINAR el respaldo del ${new Date(backup.created_at).toLocaleString()}?\n\nEsto borrará permanentemente el archivo de la nube.`))) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/delete-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup_id: backup.id, file_url: backup.file_url })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al eliminar backup');
      
      toastService.success('Respaldo eliminado.');
      fetchBackups();
    } catch (err) {
      console.error(err);
      await modalService.alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#888' }}>Cargando respaldos...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className="admin-list-controls">
        <h2 style={{ margin: 0, fontSize: '20px' }}>Gestión de Respaldos (Backup & Restore)</h2>
        <button 
          onClick={handleCreateBackup} 
          className="admin-primary-btn" 
          disabled={actionLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <iconify-icon icon="mdi:cloud-upload-outline"></iconify-icon>
          {actionLoading ? 'Procesando...' : 'Crear Backup Ahora'}
        </button>
      </div>

      <div style={{ background: '#2a1a1a', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #4a2a2a', color: '#ffaaaa' }}>
        <strong>Nota sobre Imágenes:</strong> Cuando eliminas una imagen, se envía a la Papelera oculta en la nube. Al restaurar un backup viejo, el sistema intentará recuperar las imágenes de esa papelera automáticamente.
      </div>

      {backups.length === 0 ? (
        <div className="admin-empty-state">
          <iconify-icon icon="mdi:database-off-outline" style={{ fontSize: '48px', color: '#444' }}></iconify-icon>
          <p>No hay respaldos disponibles</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table className="admin-table" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Descripción</th>
                <th>Tamaño</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(backup => (
                <tr key={backup.id}>
                  <td>{new Date(backup.created_at).toLocaleString()}</td>
                  <td>{backup.description}</td>
                  <td>{backup.size_bytes ? `${(backup.size_bytes / 1024).toFixed(2)} KB` : 'Desconocido'}</td>
                  <td style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleRestore(backup)} 
                      className="admin-primary-btn"
                      style={{ background: '#d93225', padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      disabled={actionLoading}
                      title="Restaurar"
                    >
                      <iconify-icon icon="mdi:backup-restore"></iconify-icon> Restaurar
                    </button>
                    <button 
                      onClick={() => handleDeleteBackup(backup)} 
                      className="admin-secondary-btn"
                      style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      disabled={actionLoading}
                      title="Eliminar"
                    >
                      <iconify-icon icon="mdi:delete-outline"></iconify-icon>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
