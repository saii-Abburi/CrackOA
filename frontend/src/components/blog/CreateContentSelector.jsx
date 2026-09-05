import { FileText, Code2, X } from 'lucide-react';

/**
 * CreateContentSelector — Modal that lets the user choose between
 * creating a General Article or a Coding Solution.
 */
export default function CreateContentSelector({ onSelect, onClose }) {
  const options = [
    {
      type: 'GENERAL_ARTICLE',
      icon: FileText,
      title: 'General Article',
      description: 'Write a free-form blog post using the visual section builder. Best for tutorials, guides, and educational content.',
      accent: 'accent',
      border: 'border-accent/30',
      bg: 'bg-accent/5',
      hoverBorder: 'hover:border-accent/60',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      type: 'CODING_SOLUTION',
      icon: Code2,
      title: 'Coding Solution',
      description: 'Structured LeetCode-style editorial with dedicated sections for intuition, approach, complexity, and code.',
      accent: 'emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      hoverBorder: 'hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#121215] border border-white/15 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-[#1A1A20]">
          <div>
            <h2 className="text-xl font-bold text-white">Create Content</h2>
            <p className="text-xs text-text-muted mt-1">Choose the type of content you want to publish</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className={`group text-left p-5 rounded-2xl border ${opt.border} ${opt.bg} ${opt.hoverBorder} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/30`}
            >
              <div className={`w-12 h-12 rounded-xl ${opt.iconBg} flex items-center justify-center mb-4`}>
                <opt.icon className={`w-6 h-6 ${opt.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{opt.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
