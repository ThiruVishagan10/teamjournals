import Authform from '@/components/Auth/Authform'
import React, { Suspense } from 'react'

export default function page() {
  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden">
      <Suspense fallback={<div>Loading...</div>}>
        <Authform />
      </Suspense>
    </div>
  )
}