import Hero from '../components/Hero.jsx';
import DashboardPreview from '../components/DashboardPreview.jsx';
import CompanyStrip from '../components/CompanyStrip.jsx';
import ProblemSection from '../components/ProblemSection.jsx';
import SolutionSection from '../components/SolutionSection.jsx';
import Features from '../components/Features.jsx';
import CompanySection from '../components/CompanySection.jsx';
import HowItWorks from '../components/HowItWorks.jsx';
import Stats from '../components/Stats.jsx';
import ProblemsPreview from '../components/ProblemsPreview.jsx';
import ProgressSection from '../components/ProgressSection.jsx';
import Testimonials from '../components/Testimonials.jsx';
import FAQ from '../components/FAQ.jsx';
import FinalCTA from '../components/FinalCTA.jsx';
import SEO from '../components/SEO.jsx';

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CodeRank",
    "url": typeof window !== 'undefined' ? window.location.origin : "https://coderank.dev",
    "description": "Company-wise DSA preparation platform. Practice frequently asked coding interview questions from top tech companies.",
  };

  return (
    <main id="main-content">
      <SEO 
        title="CodeRank - Company-wise DSA Preparation & Coding Interviews"
        description="Master data structures and algorithms with company-specific DSA sheets. Practice the most frequently asked coding interview questions at Amazon, Google, Microsoft, and more."
        structuredData={structuredData}
      />
      <Hero />
      <DashboardPreview />
      <CompanyStrip />
      <ProblemSection />
      <SolutionSection />
      <Features />
      <CompanySection />
      <HowItWorks />
      <Stats />
      <ProblemsPreview />
      <ProgressSection />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
