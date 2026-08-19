import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { faqs } from '../data/landingData.js';

function FAQItem({ faq, isOpen, onToggle, index }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full flex items-start justify-between gap-4 py-5 text-left group
                   focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-1 focus:ring-offset-bg-primary rounded"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className={`text-sm font-semibold transition-colors duration-200 pr-2 ${isOpen ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}>
          {faq.q}
        </span>
        <span className="shrink-0 mt-0.5">
          {isOpen ? (
            <Minus className="w-4 h-4 text-accent" aria-hidden="true" />
          ) : (
            <Plus className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" aria-hidden="true" />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            role="region"
            aria-labelledby={`faq-question-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-text-secondary text-sm leading-relaxed pb-5 pr-8">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 bg-bg-secondary/30" aria-labelledby="faq-heading">
      <div className="container-xl">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left — heading */}
          <div className="lg:w-1/3 shrink-0">
            <span className="section-badge mb-5">FAQ</span>
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Common <span className="text-gradient-accent">questions</span>, answered.
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Can't find what you're looking for? Reach us at{' '}
              <a href="mailto:hello@coderank.io" className="text-accent hover:text-accent-hover transition-colors">
                hello@coderank.io
              </a>
            </p>
          </div>

          {/* Right — accordion */}
          <div className="flex-1">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                index={i}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
