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

  const deletePhoto = async (id) => {
    await api.delete(`/photos/${id}`)
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  return { photos, loading, error, refetch: fetchPhotos, deletePhoto }
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
