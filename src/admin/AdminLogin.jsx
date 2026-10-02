import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-logo">
          <img src="/legionarius-store.png" alt="Logo" style={{ width: '80px', filter: 'invert(1)' }} />
          <h2>Panel de Administración</h2>
        </div>
        
        <form onSubmit={handleLogin} className="admin-login-form">
          {errorMsg && <div className="admin-error-alert">{errorMsg}</div>}
          
          <div className="admin-form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required 
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <iconify-icon icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"} style={{ fontSize: '20px' }}></iconify-icon>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? 'Iniciando sesión...' : 'Entrar al Panel'}
          </button>
        </form>
        <div className="admin-login-footer">
          <a href="/">← Volver a la Tienda</a>
        </div>
      </div>
    </div>
  );
}
