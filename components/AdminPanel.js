// components/AdminPanel.js
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import MemberManagement from './MemberManagement';

const AdminPanel = ({ content, refreshContent, onContentUploaded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // Pestañas

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

    try {
      setUploading(true);
      const fileName = `${Date.now()}_${file.name}`;
      
      // 1. Subir el archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('private_content')
        .upload(fileName, file);

      if (uploadError) throw uploadError

      // 2. Insertar el nuevo contenido en la base de datos (con la ruta del archivo)
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title,
          description,
          file_url: fileName, // Guardamos la ruta del archivo, NO la URL pública
          content_type: file.type,
          is_published: true,
        });
      
      if (insertError) throw insertError

      alert('¡Contenido subido con éxito!');
      setTitle('');
      setDescription('');
      setFile(null);
      document.querySelector('input[type="file"]').value = "";
      onContentUploaded();

    } catch (error) {
      console.error('Error subiendo contenido:', error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
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

    // Aquí se necesita un paso extra para borrar el archivo de storage si se desea
    const itemToDelete = content.find(item => item.id === itemId);
    if (itemToDelete && itemToDelete.file_url) {
        // Borrar el archivo de Storage (opcional, pero recomendado)
        // await supabase.storage.from('private_content').remove([itemToDelete.file_url]);
    }

    const { error } = await supabase.from('content').delete().eq('id', itemId);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
    } else {
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
