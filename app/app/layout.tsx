import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'
import Link from 'next/link'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  console.log('App layout - User:', user?.email, 'Error:', error)

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/app" className="text-xl font-semibold hover:text-indigo-600 transition-colors">
                אפליקציית מתכונים
              </Link>
              <Link
                href="/app/recipes"
                className="text-sm text-gray-700 hover:text-indigo-600 transition-colors"
              >
                המתכונים שלי
              </Link>
              <Link
                href="/app/recipes/new"
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
              >
                + מתכון חדש
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
