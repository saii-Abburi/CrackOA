import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { testimonials } from '../data/landingData.js';

export default function Testimonials() {
  return (
    <section className="py-24" aria-labelledby="testimonials-heading">
      <div className="container-xl">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="section-badge mb-5">Testimonials</span>
          <h2 id="testimonials-heading" className="section-heading">
            Built for developers who are{' '}
            <span className="text-gradient-accent">serious</span> about getting better.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.article
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="card flex flex-col"
              aria-label={`Testimonial from ${t.name}`}
            >
              <Quote className="w-6 h-6 text-accent/60 mb-4 shrink-0" aria-hidden="true" />
              <p className="text-text-secondary text-sm leading-relaxed flex-1 mb-6 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                  <span className="text-accent text-xs font-bold">{t.initials}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-text-muted text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
