import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import CodeTabs from './CodeTabs';
import Callout from './Callout';
import ComplexityCard from './ComplexityCard';
import FormulaBlock from './FormulaBlock';

// Helper to generate heading slug ID for TOC anchors
function generateHeadingId(text) {
  if (typeof text !== 'string') text = String(text || '');
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper to render formatted inline text ($LaTeX$ formula, **bold**, *italic*, `code`)
function renderInlineFormatted(text) {
  if (typeof text !== 'string') return text;

  // Check for inline math $...$
  const parts = text.split(/(\$[^\$]+\$)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const mathExpr = part.slice(1, -1);
      return <FormulaBlock key={idx} formula={mathExpr} inline={true} />;
    }

    // Process inline formatting
    const tokens = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

    return tokens.map((token, tIdx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={tIdx} className="font-bold text-white">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return <em key={tIdx} className="italic text-[#E4E4E7]">{token.slice(1, -1)}</em>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={tIdx} className="px-1.5 py-0.5 rounded bg-[#151515] border border-white/10 text-[#FF5700] font-mono text-xs font-medium">
            {token.slice(1, -1)}
          </code>
        );
      }
      return token;
    });
  });
}

// Markdown Renderer Component Overrides
const markdownComponents = {
  h1({ children }) {
    const text = String(children);
    const id = generateHeadingId(text);
    return (
      <h1 id={id} className="text-[34px] sm:text-[40px] font-extrabold text-white mt-12 mb-5 pb-3 border-b border-white/10 tracking-tight leading-tight">
        {children}
      </h1>
    );
  },
  h2({ children }) {
    const text = String(children);
    const id = generateHeadingId(text);
    return (
      <h2 id={id} className="text-[26px] sm:text-[30px] font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
        <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
        {children}
      </h2>
    );
  },
  h3({ children }) {
    const text = String(children);
    const id = generateHeadingId(text);
    return (
      <h3 id={id} className="text-[20px] sm:text-[22px] font-bold text-white mt-8 mb-3">
        {children}
      </h3>
    );
  },
  p({ children }) {
    return (
      <p className="text-[17px] leading-[1.75] text-[#A1A1AA] mb-5 max-w-[760px]">
        {children}
      </p>
    );
  },
  code({ node, inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    if (!inline && match) {
      return <CodeBlock code={codeString} language={match[1]} />;
    }

    if (!inline && codeString.includes('\n')) {
      return <CodeBlock code={codeString} language="cpp" />;
    }

    return (
      <code className="px-1.5 py-0.5 rounded bg-[#151515] border border-white/10 text-[#FF5700] font-mono text-xs font-medium">
        {children}
      </code>
    );
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-[#FF5700] bg-[#121212] p-4 my-6 rounded-r-xl text-[#E4E4E7] italic font-medium">
        {children}
      </blockquote>
    );
  },
  ul({ children }) {
    return (
      <ul className="list-disc list-outside pl-6 mb-6 space-y-2 text-[16px] text-[#A1A1AA]">
        {children}
      </ul>
    );
  },
  ol({ children }) {
    return (
      <ol className="list-decimal list-outside pl-6 mb-6 space-y-2 text-[16px] text-[#A1A1AA]">
        {children}
      </ol>
    );
  },
  li({ children }) {
    return <li className="leading-relaxed">{children}</li>;
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-6 border border-white/10 rounded-xl bg-[#121212] shadow-lg">
        <table className="w-full text-left text-sm text-[#A1A1AA]">
          {children}
        </table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="bg-[#18181B] text-white uppercase text-xs tracking-wider border-b border-white/10">{children}</thead>;
  },
  th({ children }) {
    return <th className="px-4 py-3 font-bold text-[#FF5700]">{children}</th>;
  },
  td({ children }) {
    return <td className="px-4 py-3 border-b border-white/5">{children}</td>;
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#FF5700] hover:underline font-semibold"
      >
        {children}
      </a>
    );
  }
};

export default function BlogContent({ content }) {
  if (!content) return null;

  // --- CASE 1: Structured Educational DSA Document Model ---
  const isStructuredDSAModel =
    typeof content === 'object' &&
    (Array.isArray(content.approaches) || content.intuition || content.problemStatement || content.dryRun);

  if (isStructuredDSAModel) {
    const {
      problemStatement,
      examples,
      constraints,
      intuition,
      approaches = [],
      dryRun,
      edgeCases = [],
      commonMistakes = [],
      keyTakeaways = [],
    } = content;

    return (
      <div id="blog-content" className="space-y-10 text-[#A1A1AA] max-w-[760px]">
        {/* Problem Statement Section (if present in content object) */}
        {problemStatement && (
          <section id="problem-statement" className="space-y-4">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
              Problem Statement
            </h2>
            <p className="text-[17px] leading-[1.75] text-[#A1A1AA]">
              {renderInlineFormatted(problemStatement)}
            </p>

            {/* Examples */}
            {Array.isArray(examples) && examples.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-bold text-white">Examples</h3>
                {examples.map((ex, idx) => (
                  <div key={idx} className="p-4 bg-[#121212] border border-white/10 rounded-xl space-y-2 font-mono text-xs text-[#E4E4E7]">
                    <div className="font-bold text-[#FF5700]">Example {idx + 1}:</div>
                    {ex.input && <div><span className="text-[#71717A]">Input:</span> {ex.input}</div>}
                    {ex.output && <div><span className="text-[#71717A]">Output:</span> {ex.output}</div>}
                    {ex.explanation && <div><span className="text-[#71717A]">Explanation:</span> {ex.explanation}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {Array.isArray(constraints) && constraints.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-white mb-2">Constraints</h3>
                <ul className="list-disc list-outside pl-6 space-y-1 font-mono text-xs text-[#A1A1AA]">
                  {constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Intuition Section */}
        {intuition && (
          <section id={generateHeadingId(intuition.title || 'Understanding the Core Idea')}>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
              {intuition.title || 'Understanding the Core Idea'}
            </h2>
            {intuition.content && (
              <p className="text-[17px] leading-[1.75] text-[#A1A1AA] mb-4">
                {renderInlineFormatted(intuition.content)}
              </p>
            )}
            {Array.isArray(intuition.keyObservations) && intuition.keyObservations.length > 0 && (
              <div className="mt-4">
                <Callout
                  type="KEY IDEA"
                  content={
                    <ul className="list-disc pl-4 space-y-1">
                      {intuition.keyObservations.map((obs, i) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  }
                />
              </div>
            )}
          </section>
        )}

        {/* Approaches Array */}
        {approaches.map((app, idx) => {
          const title = app.title || `Approach ${idx + 1}`;
          const headingId = generateHeadingId(title);

          return (
            <section key={app.id || idx} id={headingId} className="space-y-5 pt-4">
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-white/10 flex-wrap">
                <h2 className="text-[26px] sm:text-[30px] font-bold text-white flex items-center gap-2.5">
                  <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
                  {title}
                </h2>
                {app.type && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      app.type === 'optimal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : app.type === 'better'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {app.type}
                  </span>
                )}
              </div>

              {/* Approach Intuition */}
              {app.intuition && (
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Intuition</h3>
                  <p className="text-[16px] leading-[1.7] text-[#A1A1AA]">
                    {renderInlineFormatted(app.intuition)}
                  </p>
                </div>
              )}

              {/* Algorithm / Steps */}
              {Array.isArray(app.algorithm) && app.algorithm.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Algorithm & Steps</h3>
                  <ol className="list-decimal list-outside pl-6 space-y-1.5 text-[15px] text-[#A1A1AA]">
                    {app.algorithm.map((step, sIdx) => (
                      <li key={sIdx} className="leading-relaxed">
                        {renderInlineFormatted(step)}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Multi-Language Code Viewer (CodeTabs) */}
              {app.code && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-base font-bold text-white">Implementation</h3>
                  <CodeTabs
                    codeMap={typeof app.code === 'string' ? { cpp: app.code } : app.code}
                  />
                </div>
              )}

              {/* Complexity Analysis */}
              {app.complexity && (
                <ComplexityCard
                  time={app.complexity.time || 'O(N)'}
                  space={app.complexity.space || 'O(1)'}
                />
              )}
            </section>
          );
        })}

        {/* Dry Run Section */}
        {dryRun && (
          <section id="dry-run" className="space-y-4 pt-4">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
              {dryRun.title || 'Dry Run'}
            </h2>
            {dryRun.content && (
              <p className="text-[17px] leading-[1.75] text-[#A1A1AA]">
                {renderInlineFormatted(dryRun.content)}
              </p>
            )}
            {Array.isArray(dryRun.steps) && dryRun.steps.length > 0 && (
              <div className="p-4 bg-[#121212] border border-white/10 rounded-xl space-y-2 font-mono text-xs text-[#E4E4E7]">
                {dryRun.steps.map((step, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#FF5700] font-bold">Step {i + 1}:</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Edge Cases Section */}
        {Array.isArray(edgeCases) && edgeCases.length > 0 && (
          <section id="edge-cases" className="space-y-3 pt-4">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
              Edge Cases to Consider
            </h2>
            <ul className="list-disc list-outside pl-6 space-y-2 text-[15px] text-[#A1A1AA]">
              {edgeCases.map((ec, i) => (
                <li key={i} className="leading-relaxed">
                  {renderInlineFormatted(ec)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Common Mistakes Section */}
        {Array.isArray(commonMistakes) && commonMistakes.length > 0 && (
          <section id="common-mistakes" className="space-y-3 pt-4">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
              Common Pitfalls & Mistakes
            </h2>
            <ul className="list-disc list-outside pl-6 space-y-2 text-[15px] text-[#A1A1AA]">
              {commonMistakes.map((cm, i) => (
                <li key={i} className="leading-relaxed">
                  {renderInlineFormatted(cm)}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Key Takeaways Section */}
        {Array.isArray(keyTakeaways) && keyTakeaways.length > 0 && (
          <section id="key-takeaways" className="space-y-3 pt-4">
            <h2 className="text-[26px] sm:text-[30px] font-bold text-white mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
              <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
              Key Takeaways
            </h2>
            <div className="p-4 bg-[#121212] border border-[#FF5700]/30 rounded-2xl space-y-2">
              <ul className="list-disc list-outside pl-6 space-y-2 text-[15px] text-white">
                {keyTakeaways.map((kt, i) => (
                  <li key={i} className="leading-relaxed">
                    {renderInlineFormatted(kt)}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    );
  }

  // --- CASE 2: Raw Markdown String ---
  if (typeof content === 'string') {
    return (
      <div id="blog-content" className="prose-container max-w-[760px] text-text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // --- CASE 3: Object with markdown field ---
  if (content.markdown && typeof content.markdown === 'string') {
    return (
      <div id="blog-content" className="prose-container max-w-[760px] text-[#A1A1AA]">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content.markdown}
        </ReactMarkdown>
      </div>
    );
  }

  // --- CASE 4: Structured Array of Sections (Legacy section format) ---
  if (Array.isArray(content.sections)) {
    return (
      <div id="blog-content" className="space-y-6 text-[#A1A1AA] max-w-[760px]">
        {content.sections.map((section, index) => {
          switch (section.type) {
            case 'paragraph':
              return (
                <p key={index} className="text-[17px] leading-[1.75] text-[#A1A1AA] mb-5">
                  {renderInlineFormatted(section.content)}
                </p>
              );

            case 'heading': {
              const text = typeof section.content === 'string' ? section.content : String(section.content || '');
              const id = generateHeadingId(text);
              const level = Number(section.level) || 2;

              if (level === 1) {
                return (
                  <h1 key={index} id={id} className="text-[34px] sm:text-[40px] font-extrabold text-white mt-12 mb-5 pb-3 border-b border-white/10 tracking-tight leading-tight">
                    {text}
                  </h1>
                );
              }
              if (level === 3) {
                return (
                  <h3 key={index} id={id} className="text-[20px] sm:text-[22px] font-bold text-white mt-8 mb-3">
                    {text}
                  </h3>
                );
              }
              if (level === 4) {
                return (
                  <h4 key={index} id={id} className="text-[17px] font-bold text-[#FF5700] mt-6 mb-2">
                    {text}
                  </h4>
                );
              }

              return (
                <h2 key={index} id={id} className="text-[26px] sm:text-[30px] font-bold text-white mt-10 mb-4 pb-2 border-b border-white/10 flex items-center gap-2.5">
                  <span className="w-1.5 h-6 rounded-full bg-[#FF5700] inline-block shrink-0" />
                  {text}
                </h2>
              );
            }

            case 'formula':
            case 'math':
              return (
                <FormulaBlock
                  key={index}
                  formula={typeof section.content === 'string' ? section.content : section.content?.formula || ''}
                  title={section.title || section.content?.title || 'Mathematical Relation'}
                />
              );

            case 'code':
              return (
                <CodeBlock
                  key={index}
                  code={typeof section.content === 'string' ? section.content : section.content?.code || ''}
                  language={section.language || section.content?.language || 'cpp'}
                />
              );

            case 'unordered-list':
              return (
                <ul key={index} className="list-disc list-outside pl-6 mb-6 space-y-2 text-[16px] text-[#A1A1AA]">
                  {Array.isArray(section.content) ? (
                    section.content.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        {renderInlineFormatted(item)}
                      </li>
                    ))
                  ) : (
                    <li className="leading-relaxed">{renderInlineFormatted(section.content)}</li>
                  )}
                </ul>
              );

            case 'ordered-list':
              return (
                <ol key={index} className="list-decimal list-outside pl-6 mb-6 space-y-2 text-[16px] text-[#A1A1AA]">
                  {Array.isArray(section.content) ? (
                    section.content.map((item, i) => (
                      <li key={i} className="leading-relaxed">
                        {renderInlineFormatted(item)}
                      </li>
                    ))
                  ) : (
                    <li className="leading-relaxed">{renderInlineFormatted(section.content)}</li>
                  )}
                </ol>
              );

            case 'quote':
              return (
                <blockquote key={index} className="border-l-4 border-[#FF5700] bg-[#121212] p-4 my-6 rounded-r-xl text-[#E4E4E7] italic font-medium">
                  "{renderInlineFormatted(section.content)}"
                </blockquote>
              );

            case 'image':
              return (
                <figure key={index} className="my-8 rounded-2xl overflow-hidden border border-white/10 bg-[#121212] p-2">
                  <img
                    src={section.content}
                    alt={section.caption || 'Illustration'}
                    className="rounded-xl w-full max-h-[500px] object-cover"
                    loading="lazy"
                  />
                  {section.caption && (
                    <figcaption className="text-center text-xs text-[#71717A] mt-3 italic font-medium">
                      {section.caption}
                    </figcaption>
                  )}
                </figure>
              );

            case 'callout':
              return (
                <Callout
                  key={index}
                  type={section.calloutType || 'TIP'}
                  content={renderInlineFormatted(section.content)}
                />
              );

            case 'complexity':
              return (
                <ComplexityCard
                  key={index}
                  time={typeof section.content === 'object' ? section.content.time : 'O(N)'}
                  space={typeof section.content === 'object' ? section.content.space : 'O(1)'}
                />
              );

            case 'table':
              return (
                <div key={index} className="overflow-x-auto my-6 border border-white/10 rounded-xl shadow-lg bg-[#121212]">
                  <table className="w-full text-left text-sm text-[#A1A1AA]">
                    <thead className="bg-[#18181B] text-white uppercase text-xs tracking-wider border-b border-white/10">
                      <tr>
                        {section.content?.headers?.map((h, i) => (
                          <th key={i} className="px-4 py-3 font-bold text-[#FF5700]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {section.content?.rows?.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3">{renderInlineFormatted(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    );
  }

  return null;
}
