import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-wedate-pink to-wedate-purple">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <h1 className="text-6xl font-bold text-white mb-6 text-center">
            💕 WeDate
          </h1>
          <p className="text-2xl text-white mb-12 text-center max-w-2xl">
            Find your perfect match. Swipe, Match, Chat.
          </p>
          
          <div className="flex gap-4 mb-8">
            <Link
              href="/auth/signup"
              className="px-8 py-4 bg-white text-wedate-pink font-semibold rounded-full hover:bg-opacity-90 transition-all shadow-lg"
            >
              Sign Up
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-wedate-pink transition-all"
            >
              Log In
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">👋</div>
              <h3 className="text-xl font-semibold text-white mb-2">Swipe</h3>
              <p className="text-white text-opacity-90">
                Browse profiles and swipe right if you're interested
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">💖</div>
              <h3 className="text-xl font-semibold text-white mb-2">Match</h3>
              <p className="text-white text-opacity-90">
                Get matched when both people like each other
              </p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-white mb-2">Chat</h3>
              <p className="text-white text-opacity-90">
                Start conversations with your matches
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
