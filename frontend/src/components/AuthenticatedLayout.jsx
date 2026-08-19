import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';

/**
 * Layout wrapper that shows the sidebar when the user is authenticated.
 * Always provides consistent top-padding for the navbar.
 */
export default function AuthenticatedLayout({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // No sidebar, but still add navbar offset
    return (
      <div className="min-h-screen pt-16">
        <main id="main-content">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex">
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
