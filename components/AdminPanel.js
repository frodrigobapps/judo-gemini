// components/AdminPanel.js (MODIFICADO)
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import MemberManagement from './MemberManagement'; // Importar gestión de miembros

const AdminPanel = ({ content, onContentUploaded, refreshContent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Estado para edición
  const [activeTab, setActiveTab] = useState('content'); // Nuevo estado para pestañas

  // --- Funciones CRUD de Contenido ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleNewContentSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      alert('El título y el archivo son obligatorios.');
      return;
    }
    // ... (Tu lógica de subida y guardado anterior) ...
  };

  const handleEditContent = (item) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    const { error } = await supabase
      .from('content')
      .update({ title, description, is_published: true })
      .eq('id', editingItem.id);

    if (error) {
      alert(`Error al actualizar: ${error.message}`);
    } else {
      setEditingItem(null);
      setTitle('');
      setDescription('');
      refreshContent();
    }
  };

  const handleDeleteContent = async (itemId) => {
    if (!confirm('¿Seguro que quieres eliminar este contenido?')) return;

    const { error } = await supabase.from('content').delete().eq('id', itemId);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
    } else {
      // Nota: Idealmente, también se debe eliminar el archivo de Storage aquí.
      refreshContent();
    }
  };

  return (
    <div className="admin-panel">
      <h2>Panel de Administrador</h2>
      
      <div className="tabs-navigation">
        <button onClick={() => setActiveTab('content')} className={activeTab === 'content' ? 'active' : ''}>
          Gestión de Contenido
        </button>
        <button onClick={() => setActiveTab('members')} className={activeTab === 'members' ? 'active' : ''}>
          Gestión de Miembros
        </button>
      </div>

      {activeTab === 'members' && (
        <MemberManagement />
      )}

      {activeTab === 'content' && (
        <div className="content-management">
          <h3>{editingItem ? 'Editar Contenido' : 'Subir Nuevo Contenido'}</h3>
          
          <form onSubmit={editingItem ? handleSaveEdit : handleNewContentSubmit} className="admin-form">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {!editingItem && <input type="file" onChange={handleFileChange} />}
            
            <button type="submit" disabled={uploading}>
              {uploading ? 'Procesando...' : editingItem ? 'Guardar Cambios' : 'Subir y Publicar'}
            </button>
            {editingItem && (
                <button type="button" onClick={() => setEditingItem(null)} className="secondary-button">
                    Cancelar Edición
                </button>
            )}
          </form>

          {/* Listado de Contenido para Editar/Eliminar */}
          <div className="content-list-admin">
            <h4>Contenido Publicado ({content.length})</h4>
            {content.map((item) => (
                <div key={item.id} className="content-item-admin">
                    <span>{item.title}</span>
                    <div>
                        <button onClick={() => handleEditContent(item)} className="edit-button">Editar</button>
                        <button onClick={() => handleDeleteContent(item.id)} className="delete-button">Eliminar</button>
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
