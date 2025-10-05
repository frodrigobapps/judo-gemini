// components/MemberManagement.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    // Unir profiles con la tabla auth.users para obtener el email
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, auth_users:auth.users(email, created_at)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching members:', error);
    } else {
      setMembers(data);
    }
    setLoading(false);
  };

  const handleRoleChange = async (memberId, newRole) => {
    if (!confirm(`¿Estás seguro de cambiar el rol a ${newRole}?`)) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', memberId);

    if (error) {
      alert(`Error al cambiar el rol: ${error.message}`);
    } else {
      fetchMembers(); // Refrescar lista
    }
  };

  const handleDeleteMember = async (memberId, email) => {
    if (!confirm(`¿Estás seguro de ELIMINAR al usuario ${email}? Esta acción es irreversible.`)) return;
    
    // Llamar a la función RPC que creamos en el backend
    const { error: userError } = await supabase.rpc('delete_user_by_id', { user_id_in: memberId });
    
    if (userError) {
       alert(`Error al borrar usuario: ${userError.message}. Verifica la función RPC en Supabase.`);
    } else {
        alert(`Usuario ${email} eliminado correctamente.`);
    }
    
    fetchMembers();
  };

  if (loading) return <div className="admin-section">Cargando miembros...</div>;

  return (
    <div className="admin-section">
      <h3>Gestión de Miembros ({members.length})</h3>
      <table className="member-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.auth_users?.email || 'N/A'}</td>
              <td>{member.full_name || 'Sin Nombre'}</td>
              <td>
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                >
                  <option value="subscriber">Suscriptor</option>
                  <option value="admin">Administrador</option>
                </select>
              </td>
              <td>
                <button
                  onClick={() => handleDeleteMember(member.id, member.auth_users?.email)}
                  className="delete-button"
                  // Deshabilitar la eliminación si el usuario es el administrador actualmente logueado
                  disabled={member.id === supabase.auth.user()?.id}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberManagement;
