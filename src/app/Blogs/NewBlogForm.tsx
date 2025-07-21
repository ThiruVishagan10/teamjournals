// src/components/Blogs/NewBlogForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/util/supabase/client'
import toast from 'react-hot-toast'

export default function NewBlogForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast.error('Not logged in')
      return
    }

    let imageUrl = ''

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('journal-images')
          .upload(filePath, imageFile)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          toast.error('Image upload failed')
          return
        }

        const { data: publicUrlData } = supabase.storage.from('journal-images').getPublicUrl(filePath)

        if (!publicUrlData?.publicUrl) {
          toast.error('Failed to retrieve image URL')
          return
        }

        imageUrl = publicUrlData.publicUrl
      }

      const { error: insertError } = await supabase.from('blogs').insert([
        {
          user_id: user.id,
          title,
          content,
          image_url: imageUrl || null,
        },
      ])

      if (insertError) {
        console.error('Insert error:', insertError)
        toast.error('Error creating blog')
        return
      }

      toast.success('Blog created!')
      setTitle('')
      setContent('')
      setImageFile(null)
      router.push('/blogs')
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error('Unexpected error occurred')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded shadow max-w-2xl mx-auto mt-6"
    >
      <h2 className="text-xl font-semibold text-black">Create a Blog Post</h2>
      <input
        type="text"
        placeholder="Title"
        className="w-full p-2 border-black text-black rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Write your blog..."
        className="w-full p-2 border-black text-black rounded h-32"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <label className="px-4 py-2 bg-gray-200 text-black rounded cursor-pointer hover:bg-gray-300">
          📁 Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
        {imageFile && <span className="text-sm text-gray-600">{imageFile.name}</span>}
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Publish
      </button>
    </form>
  )
}
