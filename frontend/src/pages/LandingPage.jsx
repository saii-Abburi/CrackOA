import Hero from '../components/Hero.jsx';
import PlatformCapabilities from '../components/landing/PlatformCapabilities.jsx';
import ProblemSolvingExperience from '../components/landing/ProblemSolvingExperience.jsx';
import ProgressAnalytics from '../components/landing/ProgressAnalytics.jsx';
import CompanySection from '../components/CompanySection.jsx';
import CustomSheetsSection from '../components/landing/CustomSheetsSection.jsx';
import PremiumSection from '../components/landing/PremiumSection.jsx';
import BuiltForDevelopers from '../components/landing/BuiltForDevelopers.jsx';
import FAQ from '../components/FAQ.jsx';
import FinalCTA from '../components/FinalCTA.jsx';
import SEO from '../components/SEO.jsx';

export default function LandingPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CodeRank",
    "url": typeof window !== 'undefined' ? window.location.origin : "https://coderank.dev",
    "description": "Company-wise DSA and SQL preparation platform. Practice frequently asked coding and SQL interview questions from top tech companies, track your progress, and prepare smarter.",
  };

  return (
    <main id="main-content">
      <SEO
        title="CodeRank — Practice Company-wise DSA & SQL — Track Your Coding Progress"
        description="Stop solving random problems. Practice company-wise DSA and SQL problems ranked by frequency, track your progress, and focus on what actually gets asked in coding interviews at Google, Amazon, Microsoft, and more."
        structuredData={structuredData}
      />
      <Hero />
      <PlatformCapabilities />
      <ProblemSolvingExperience />
      <ProgressAnalytics />
      <CompanySection />
      <CustomSheetsSection />
      <PremiumSection />
      <BuiltForDevelopers />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
