'use client';
import CareerGuide from '@/app/components/Career-Guide';
import Hero from '@/app/components/Hero';
import ResumeAnalyzer from '@/app/components/resume-analyzer';
import { useAppData } from '@/context/AppContext';
import Loading from './components/loading';


const Home = () => {
  const {loading} = useAppData();

  if(loading) {
    return <Loading />
  }
  return (
    <div>
      <Hero />
      <CareerGuide />
      <ResumeAnalyzer />
    </div>
  )
}

export default Home;

