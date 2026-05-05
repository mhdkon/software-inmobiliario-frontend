import React from 'react';

const AdminUsersView = ({ users, deleteUser, setView }) => (
  <div className="admin-users-container">
    <h2>Gestión de usuarios</h2>
    <button className="back-btn" onClick={() => setView('properties')}>← Volver</button>
    <div className="users-table">
      <table>
        <thead>
          <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role === 'admin' ? 'Administrador' : 'Usuario'}</td>
              <td>{user.role !== 'admin' && <button onClick={() => deleteUser(user.id)} className="delete-user-btn">Eliminar</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminUsersView;