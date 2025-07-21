'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createClient } from '@/util/supabase/client'
import EditBlogForm from './EditBlogForm'

interface Blog {
  id: string
  title: string
  content: string
  created_at: string
}

const PAGE_SIZE = 5

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const blogsRef = useRef<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const observerRef = useRef<HTMLDivElement | null>(null)
  const supabase = createClient()
  const resetRef = useRef(false)
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)

  useEffect(() => {
    blogsRef.current = blogs
  }, [blogs])

  const fetchBlogs = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      toast.error('Error fetching blogs')
    } else {
      const newBlogs = (data || []).filter(
        (newBlog) =>
          !blogsRef.current.some((existing) => existing.id === newBlog.id)
      )
      setBlogs((prev) => [...prev, ...newBlogs])
      if (!data || data.length < PAGE_SIZE) setHasMore(false)
    }

    setLoading(false)
  }, [page, supabase])

  useEffect(() => {
    if (resetRef.current) {
      resetRef.current = false
      return
    }
    fetchBlogs()
  }, [fetchBlogs])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 1.0 }
    )

    if (observerRef.current) observer.observe(observerRef.current)

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current)
    }
  }, [hasMore, loading])

  const handleRefresh = () => {
    resetRef.current = true
    setBlogs([])
    setPage(0)
    setHasMore(true)
    setTimeout(fetchBlogs, 100)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    if (error) {
      toast.error('Error deleting blog')
    } else {
      toast.success('Blog deleted successfully')
      handleRefresh()
    }
  }

  return (
    <div className="space-y-4 mt-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-2">
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="text-sm text-blue-500 hover:underline"
          >
            🔄 Refresh
          </button>
          <Link
            href="/blogs/newblogs"
            className="text-sm text-green-500 hover:underline"
          >
            ➕ Create Blog
          </Link>
        </div>
      </div>

      {blogs.length === 0 && !loading ? (
        <p className="text-gray-400 text-sm">No blog posts yet.</p>
      ) : (
        blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-gray-100 text-black p-4 rounded shadow space-y-2"
          >
            {editingBlogId === blog.id ? (
              <EditBlogForm
                id={blog.id}
                initialTitle={blog.title}
                initialContent={blog.content}
                onCancel={() => setEditingBlogId(null)}
                onSuccess={() => {
                  setEditingBlogId(null)
                  handleRefresh()
                }}
              />
            ) : (
              <>
                <h3 className="text-lg font-semibold">{blog.title}</h3>
                <p className="text-sm whitespace-pre-wrap">{blog.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(blog.created_at).toLocaleString()}
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setEditingBlogId(blog.id)}
                    className="text-sm text-yellow-600 hover:underline"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}

      <div ref={observerRef} className="h-12 flex justify-center items-center">
        {loading && <p className="text-gray-500">Loading more blogs...</p>}
        {!hasMore && !loading && (
          <p className="text-gray-400 text-sm">No more blogs to load.</p>
        )}
      </div>
    </div>
  )
}
