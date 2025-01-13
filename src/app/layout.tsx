import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Navbar } from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Worker Attendance System',
  description: 'Manage worker attendance and generate reports',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-gray-50`}>
        <Navbar />
        <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t py-4 text-center text-sm text-gray-600 bg-white">
          <div className="container mx-auto px-4">
            &copy; {new Date().getFullYear()} Worker Management System
          </div>
        </footer>
        <Toaster position="top-right" expand={true} richColors />
      </body>
    </html>
  )
}
