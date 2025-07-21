'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaUserCircle } from 'react-icons/fa'

interface User {
  email: string
  image?: string
  name?: string
}

interface NavbarProps {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(event.target)
      ) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between">
      {/* Left Logo */}
      <Link href="/" className="text-xl font-bold text-indigo-600">
        TeamJournals
      </Link>

      {/* Right Links */}
      <div className="flex items-center gap-4 relative">
        <Link href="/blogs" className="text-gray-700 hover:text-indigo-600 font-medium">
          Blogs
        </Link>

        {/* User Dropdown */}
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
              {user.image ? (
                <img
                  src={user.image}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border"
                />
              ) : (
                <FaUserCircle className="text-2xl text-gray-700" />
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-md z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  View Profile
                </Link>
                <form action="/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth"
            className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  )
}
