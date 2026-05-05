import React, { useState } from 'react';

const LoginView = ({ loginForm, setLoginForm, handleLogin, errorMessage, setView }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="logo-animated">●</div>
          <h1 className="logo-text">CasaDirecta360</h1>
          <p className="logo-subtitle">La mejor plataforma de inmuebles</p>
        </div>

        <div className="login-form-section">
          <h2>Iniciar sesión</h2>
          <p className="login-description">Accede a tu cuenta para continuar</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className={`form-group-enhanced ${emailFocused ? 'focused' : ''} ${loginForm.email ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">✓</span>
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="input-field"
                />
                <label className="input-label">Email</label>
              </div>
              <div className="input-line"></div>
            </div>

            <div className={`form-group-enhanced ${passwordFocused ? 'focused' : ''} ${loginForm.password ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">◆</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="input-field"
                />
                <label className="input-label">Contraseña</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '●' : '○'}
                </button>
              </div>
              <div className="input-line"></div>
            </div>

            {errorMessage && (
              <div className="error-alert">
                <span className="error-icon">!</span>
                <p>{errorMessage}</p>
              </div>
            )}

            <button type="submit" className="login-button-enhanced">
              <span className="button-text">Iniciar sesión</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>¿No tienes cuenta? <button onClick={() => setView('register')} className="link-button-enhanced">Regístrate aquí</button></p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;