import Link from 'next/link'

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="bg-surface flex items-center justify-center min-h-screen">
        <div className="text-center space-y-md p-lg">
          <h1 className="text-4xl font-bold text-primary">404</h1>
          <h2 className="text-xl font-medium text-on-surface">Page Not Found</h2>
          <p className="text-on-surface-variant max-w-xs mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-primary text-on-primary px-lg py-sm rounded-xl font-bold mt-md"
          >
            Go back home
          </Link>
        </div>
      </body>
    </html>
  )
}
