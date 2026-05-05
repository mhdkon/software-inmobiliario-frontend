import React, { useState } from 'react';

const RegisterView = ({ registerForm, setRegisterForm, handleRegister, errorMessage, setView }) => {
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          <h2>Crear cuenta</h2>
          <p className="login-description">Únete a nuestra comunidad inmobiliaria</p>

          <form onSubmit={handleRegister} className="login-form">
            <div className={`form-group-enhanced ${nameFocused ? 'focused' : ''} ${registerForm.name ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">▪</span>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  required
                  className="input-field"
                />
                <label className="input-label">Nombre</label>
              </div>
              <div className="input-line"></div>
            </div>

            <div className={`form-group-enhanced ${emailFocused ? 'focused' : ''} ${registerForm.email ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">✓</span>
                <input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="input-field"
                />
                <label className="input-label">Email</label>
              </div>
              <div className="input-line"></div>
            </div>

            <div className={`form-group-enhanced ${passwordFocused ? 'focused' : ''} ${registerForm.password ? 'filled' : ''}`}>
              <div className="input-wrapper">
                <span className="input-icon">◆</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  minLength="6"
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
              <span className="button-text">Registrarse</span>
              <span className="button-icon">→</span>
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p>¿Ya tienes cuenta? <button onClick={() => setView('login')} className="link-button-enhanced">Inicia sesión aquí</button></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterView;