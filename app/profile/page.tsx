import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import UserProfile from '@/components/profile/user-profile'

export default function ProfilePage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-background pt-20">
        <UserProfile />
      </main>
      <Footer />
    </>
  )
}
