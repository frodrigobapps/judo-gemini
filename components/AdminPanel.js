// components/AdminPanel.js
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminPanel({ onContentUploaded }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !file) {
      alert('El título y el archivo son obligatorios.')
      return
    }

    try {
      setUploading(true)
      const fileName = `${Date.now()}_${file.name}`
      
      // 1. Subir el archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('private_content') // El nombre de tu bucket privado
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Obtener la URL pública (o firmada) del archivo subido
      const { data: { publicUrl } } = supabase.storage
        .from('private_content')
        .getPublicUrl(fileName)

      // 3. Insertar el nuevo contenido en la base de datos
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title,
          description,
          file_url: publicUrl,
          content_type: file.type,
          is_published: true, // Publicar inmediatamente
        })
      
      if (insertError) throw insertError

      alert('¡Contenido subido con éxito!')
      // Limpiar el formulario y refrescar la lista de contenido en el dashboard
      setTitle('')
      setDescription('')
      setFile(null)
      document.querySelector('input[type="file"]').value = "";
      onContentUploaded(); // Llama a la función del padre para refrescar

    } catch (error) {
      console.error('Error subiendo contenido:', error)
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="admin-panel">
      <h2>Panel de Administrador</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <input
          type="text"
          placeholder="Título del contenido"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Subiendo...' : 'Subir Contenido'}
        </button>
      </form>
    </div>
  )
}
