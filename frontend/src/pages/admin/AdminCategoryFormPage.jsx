import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { createCategory, getCategory, listCategories, updateCategory } from '../../api/categories'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { SelectField } from '../../components/ui/SelectField'
import { Spinner } from '../../components/ui/Spinner'
import { TextAreaField } from '../../components/ui/TextAreaField'
import { slugify } from '../../lib/slugify'

const emptyForm = { name: '', slug: '', description: '', parent_id: '' }

export function AdminCategoryFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!isEditing) return
    getCategory(id)
      .then((category) => {
        setForm({
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          parent_id: category.parent_id ? String(category.parent_id) : '',
        })
        setSlugTouched(true)
      })
      .catch(() => setError('No se pudo cargar la categoría.'))
      .finally(() => setLoading(false))
  }, [id, isEditing])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'name' && !slugTouched) {
      setForm((prev) => ({ ...prev, slug: slugify(value) }))
    }
    if (name === 'slug') setSlugTouched(true)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      parent_id: form.parent_id ? Number(form.parent_id) : null,
    }

    try {
      if (isEditing) {
        await updateCategory(id, payload)
      } else {
        await createCategory(payload)
      }
      navigate('/admin/categories')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar la categoría.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }

  const otherCategories = categories.filter((category) => String(category.id) !== id)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">
        {isEditing ? 'Editar categoría' : 'Nueva categoría'}
      </h1>

      <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <InputField id="name" name="name" label="Nombre" value={form.name} onChange={handleChange} required />
        <InputField id="slug" name="slug" label="Slug" value={form.slug} onChange={handleChange} required />
        <TextAreaField
          id="description"
          name="description"
          label="Descripción"
          value={form.description}
          onChange={handleChange}
        />

        <SelectField
          id="parent_id"
          name="parent_id"
          label="Categoría padre (opcional)"
          value={form.parent_id}
          onChange={handleChange}
        >
          <option value="">Ninguna</option>
          {otherCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>

        <Button type="submit" disabled={submitting} className="w-fit">
          {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear categoría'}
        </Button>
      </form>
    </div>
  )
}
