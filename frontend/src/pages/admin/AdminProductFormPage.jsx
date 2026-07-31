import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listCategories } from '../../api/categories'
import { ApiError } from '../../api/client'
import {
  addProductImage,
  createProduct,
  deleteProductImage,
  getProduct,
  updateProduct,
} from '../../api/products'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/InputField'
import { SelectField } from '../../components/ui/SelectField'
import { Spinner } from '../../components/ui/Spinner'
import { TextAreaField } from '../../components/ui/TextAreaField'
import { slugify } from '../../lib/slugify'

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  sku: '',
  price: '',
  stock: '0',
  category_id: '',
  is_active: true,
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
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
    getProduct(id)
      .then((product) => {
        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          sku: product.sku,
          price: String(product.price),
          stock: String(product.stock),
          category_id: product.category_id ? String(product.category_id) : '',
          is_active: product.is_active,
        })
        setImages(product.images ?? [])
        setSlugTouched(true)
      })
      .catch(() => setError('No se pudo cargar el producto.'))
      .finally(() => setLoading(false))
  }, [id, isEditing])

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'name' && !slugTouched) {
      setForm((prev) => ({ ...prev, slug: slugify(value) }))
    }
    if (name === 'slug') setSlugTouched(true)
  }

  async function handleAddImage(imagePayload) {
    if (isEditing) {
      const savedImage = await addProductImage(id, imagePayload)
      setImages((prev) => [...prev, savedImage])
    } else {
      setImages((prev) => [...prev, imagePayload])
    }
  }

  async function handleRemoveImage(image, index) {
    if (isEditing && image.id) {
      await deleteProductImage(id, image.id)
    }
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      sku: form.sku,
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: form.category_id ? Number(form.category_id) : null,
      is_active: form.is_active,
    }

    try {
      if (isEditing) {
        await updateProduct(id, payload)
      } else {
        await createProduct({ ...payload, images })
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el producto.')
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-900">
        {isEditing ? 'Editar producto' : 'Nuevo producto'}
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
        <InputField id="sku" name="sku" label="SKU" value={form.sku} onChange={handleChange} required />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            label="Precio"
            value={form.price}
            onChange={handleChange}
            required
          />
          <InputField
            id="stock"
            name="stock"
            type="number"
            min="0"
            label="Stock"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>

        <SelectField id="category_id" name="category_id" label="Categoría" value={form.category_id} onChange={handleChange}>
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </SelectField>

        <ImageUploader images={images} onAdd={handleAddImage} onRemove={handleRemoveImage} />

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300"
          />
          Producto activo (visible en la tienda)
        </label>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting} className="w-fit">
            {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </form>
    </div>
  )
}
