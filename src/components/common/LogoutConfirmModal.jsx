import React from 'react';

const LogoutConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay" onClick={onCancel}>
    <div className="modal logout-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <h3>Confirmar cierre de sesión</h3>
      </div>
      <div className="modal-body">
        <p>¿Estás seguro de que deseas cerrar sesión? Tendrás que iniciar sesión nuevamente para acceder.</p>
      </div>
      <div className="modal-buttons logout-buttons">
        <button onClick={onCancel} className="btn-cancel">Cancelar</button>
        <button onClick={onConfirm} className="btn-logout">Cerrar sesión</button>
      </div>
    </div>
  </div>
);

export default LogoutConfirmModal;