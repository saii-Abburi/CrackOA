import { motion } from 'framer-motion';

const companyNames = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
  'Adobe', 'Uber', 'Netflix', 'Atlassian', 'Flipkart',
];

export default function CompanyStrip() {
  return (
    <section className="py-16 border-y border-border" aria-label="Supported companies">
      <div className="container-xl">
        <motion.p
          className="text-center text-text-muted text-sm font-medium uppercase tracking-widest mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Prepare for the companies you want to work at
        </motion.p>

        <motion.div
          className="flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {companyNames.map((name) => (
            <motion.div
              key={name}
              className="px-5 py-2.5 rounded-lg border border-border bg-bg-card text-text-secondary text-sm font-medium
                         hover:text-white hover:border-border-subtle hover:bg-bg-elevated
                         transition-all duration-200 cursor-default select-none"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
            >
              {name}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
