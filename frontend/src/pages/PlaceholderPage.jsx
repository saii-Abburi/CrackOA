import { Link } from 'react-router-dom';
import { Code2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import SEO from '../components/SEO.jsx';

/**
 * Generic placeholder page used for routes not yet implemented.
 * Dynamically routes logged-in users back to their Dashboard and guests to the Landing page.
 */
export default function PlaceholderPage({ title, description }) {
  const { isAuthenticated } = useAuth();
  const targetRoute = isAuthenticated ? '/dashboard' : '/';
  const buttonLabel = isAuthenticated ? 'Back to Dashboard' : 'Back to Home';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <SEO 
        title={`${title} - CodeRank`} 
        description={description} 
        noindex={true}
      />
      <div className="w-12 h-12 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mb-6">
        <Code2 className="w-6 h-6 text-accent" aria-hidden="true" />
      </div>
      <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-3">Coming Soon</p>
      <h1 className="text-3xl font-bold text-white mb-3">{title}</h1>
      <p className="text-text-secondary text-base max-w-sm mb-8">{description}</p>
      <Link to={targetRoute} className="btn-primary">
        {buttonLabel} <ArrowRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
