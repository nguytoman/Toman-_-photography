import { useState, useEffect } from 'react'
import api from '../api/client'

export function usePhotos(albumId = null) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPhotos = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = albumId ? { album: albumId } : {}
      const { data } = await api.get('/photos', { params })
      setPhotos(data)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPhotos() }, [albumId])

  const deletePhoto = async (filename) => {
    await api.delete('/photos', { data: { filename } })
    setPhotos((prev) => prev.filter((p) => p.filename !== filename))
  }

  return { photos, loading, error, refetch: fetchPhotos, deletePhoto }
}

export function useWebProjects() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    api.get('/webprojects').then(({ data }) => setProjects(data)).catch(() => {})
  }, [])

  return { projects }
}

export function useAlbums() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAlbums = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/albums')
      setAlbums(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAlbums() }, [])

  return { albums, loading, refetch: fetchAlbums }
}
