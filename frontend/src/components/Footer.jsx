import { Link } from 'react-router-dom';
import { Code2, GitFork, Link2, X } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Problems', href: '/problems' },
    { label: 'Companies', href: '/companies' },
    { label: 'Topics', href: '/topics' },
    { label: 'Progress', href: '/dashboard' },
  ],
  Resources: [
    { label: 'DSA Roadmap', href: '#' },
    { label: 'Interview Prep', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
  ],
};

const socials = [
  { icon: GitFork, label: 'GitHub', href: '#' },
  { icon: Link2, label: 'LinkedIn', href: '#' },
  { icon: X, label: 'X / Twitter', href: '#' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary/30" role="contentinfo">
      <div className="container-xl py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group w-fit" aria-label="CodeRank home">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:bg-accent-hover transition-colors">
                <Code2 className="w-4 h-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-white font-bold text-lg">
                Code<span className="text-accent">Rank</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Focused DSA preparation for real-world technical interviews. Practice smarter, not harder.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-white text-sm font-semibold mb-4">{section}</p>
              <ul className="flex flex-col gap-2.5" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-text-secondary text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © 2026 CodeRank. Built for developers.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-3" aria-label="Social media links">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-9 h-9 rounded-lg border border-border bg-bg-card flex items-center justify-center
                           text-text-muted hover:text-white hover:border-border-subtle hover:bg-bg-elevated
                           transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <s.icon className="w-4 h-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
