'use client'

import { useState } from 'react'
import { createClient } from '@/util/supabase/client'
import toast from 'react-hot-toast'

interface EditBlogFormProps {
  id: string
  initialTitle: string
  initialContent: string
  onCancel: () => void
  onSuccess: () => void
}

export default function EditBlogForm({
  id,
  initialTitle,
  initialContent,
  onCancel,
  onSuccess,
}: EditBlogFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [updating, setUpdating] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    const { error } = await supabase
      .from('blogs')
      .update({ title, content })
      .eq('id', id)

    setUpdating(false)

    if (error) {
      toast.error('Failed to update blog')
    } else {
      toast.success('Blog updated')
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border border-gray-400 rounded"
        placeholder="Title"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 border border-gray-400 rounded h-24"
        placeholder="Content"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={updating}
          className="px-4 py-1 bg-blue-600 text-white rounded"
        >
          {updating ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1 bg-gray-400 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
