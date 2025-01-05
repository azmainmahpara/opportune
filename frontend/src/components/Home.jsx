import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import CategoryCarousel from './CategoryCarousel'
import HeroSection from './HeroSection'
import LatestJobs from './LatestJobs'
import ChatButton from './shared/ChatButton'
import Footer from './shared/Footer'
import Navbar from './shared/Navbar'

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, []);
  return (
<div
    style={{
      background: 'linear-gradient(90deg, rgba(246,249,251,1) 0%, rgba(204,233,250,1) 50%, rgba(255,255,255,1) 100%)',
      minHeight: '100vh', // Ensures the background covers the viewport height
    }}
  >      <Navbar />
      <HeroSection />
      <CategoryCarousel />
      <LatestJobs />
      <Footer />
      {user && <ChatButton />}
    </div>
  )
}

export default Home