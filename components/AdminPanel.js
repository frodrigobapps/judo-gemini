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

      // Genera nombre limpio (evita "undefined")
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`

      // 1. Subir el archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('private_content') // El nombre de tu bucket privado
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 2. Obtener una URL firmada (signed URL) para acceso temporal
      const { data, error: signedUrlError } = await supabase.storage
        .from('private_content')
        .createSignedUrl(fileName, 3600) // URL válida por 1 hora

      if (signedUrlError) throw signedUrlError
      const signedUrl = data.signedUrl

      // 3. Insertar el nuevo contenido en la base de datos
      const { error: insertError } = await supabase
        .from('content')
        .insert({
          title,
          description,
          file_url: signedUrl, // ✅ Guardamos la URL firmada
          content_type: file.type,
          is_published: true, // Publicar inmediatamente
        })

      if (insertError) throw insertError

      alert('¡Contenido subido con éxito!')
      // Limpiar el formulario y refrescar la lista de contenido en el dashboard
      setTitle('')
      setDescription('')
      setFile(null)
      document.querySelector('input[type="file"]').value = ""
      onContentUploaded() // Llama a la función del padre para refrescar

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
