// Shared placeholder data for the landing page

export const companies = [
  { name: 'Google', slug: 'google', total: 120, solved: 34, color: '#4285F4' },
  { name: 'Amazon', slug: 'amazon', total: 145, solved: 41, color: '#FF9900' },
  { name: 'Microsoft', slug: 'microsoft', total: 110, solved: 29, color: '#00A4EF' },
  { name: 'Meta', slug: 'meta', total: 95, solved: 18, color: '#0866FF' },
  { name: 'Apple', slug: 'apple', total: 80, solved: 21, color: '#A2AAAD' },
  { name: 'Adobe', slug: 'adobe', total: 72, solved: 15, color: '#FF0000' },
  { name: 'Uber', slug: 'uber', total: 65, solved: 12, color: '#000000' },
  { name: 'Netflix', slug: 'netflix', total: 58, solved: 9, color: '#E50914' },
  { name: 'Atlassian', slug: 'atlassian', total: 48, solved: 7, color: '#0052CC' },
  { name: 'Flipkart', slug: 'flipkart', total: 55, solved: 11, color: '#2874F0' },
];

export const problems = [
  { id: 1, title: 'Two Sum', difficulty: 'Easy', frequency: 98, company: 'Google', status: 'solved' },
  { id: 146, title: 'LRU Cache', difficulty: 'Medium', frequency: 92, company: 'Amazon', status: 'progress' },
  { id: 200, title: 'Number of Islands', difficulty: 'Medium', frequency: 89, company: 'Microsoft', status: 'solved' },
  { id: 127, title: 'Word Ladder', difficulty: 'Hard', frequency: 84, company: 'Meta', status: 'not_started' },
  { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard', frequency: 82, company: 'Google', status: 'progress' },
  { id: 56, title: 'Merge Intervals', difficulty: 'Medium', frequency: 79, company: 'Amazon', status: 'solved' },
  { id: 207, title: 'Course Schedule', difficulty: 'Medium', frequency: 76, company: 'Uber', status: 'not_started' },
  { id: 53, title: 'Maximum Subarray', difficulty: 'Easy', frequency: 73, company: 'Apple', status: 'solved' },
];

export const features = [
  {
    icon: 'Building2',
    title: 'Company-wise Problems',
    description: 'See the problems frequently asked by your target companies, curated and verified.',
  },
  {
    icon: 'TrendingUp',
    title: 'Frequency Ranking',
    description: 'Prioritize high-frequency problems instead of treating every question equally.',
  },
  {
    icon: 'SlidersHorizontal',
    title: 'Smart Filtering',
    description: 'Filter by company, difficulty, topic, and frequency to find exactly what you need.',
  },
  {
    icon: 'CheckCircle2',
    title: 'Progress Tracking',
    description: 'Know exactly what you\'ve solved, what\'s in progress, and what remains.',
  },
  {
    icon: 'FileText',
    title: 'Personal Notes',
    description: 'Save your approaches, mistakes, edge cases, and interview insights per problem.',
  },
  {
    icon: 'BookOpen',
    title: 'Topic-based Practice',
    description: 'Master Arrays, Trees, Graphs, Dynamic Programming, Greedy, and more.',
  },
];

export const stats = [
  { value: 500, suffix: '+', label: 'Curated Problems' },
  { value: 20, suffix: '+', label: 'Top Companies' },
  { value: 15, suffix: '+', label: 'DSA Topics' },
  { value: 100, suffix: '%', label: 'Focused Preparation' },
];

export const testimonials = [
  {
    quote:
      'I stopped wasting time deciding what to solve. The company-wise breakdown made my preparation much more focused and intentional.',
    name: 'Alex Chen',
    role: 'Software Engineer',
    company: 'Joined Microsoft',
    initials: 'AC',
  },
  {
    quote:
      'The frequency data is what makes this different. I knew exactly which problems to prioritize in my last two weeks before the interview.',
    name: 'Priya Sharma',
    role: 'Backend Engineer',
    company: 'Joined Uber',
    initials: 'PS',
  },
  {
    quote:
      'Progress tracking and personal notes kept me consistent over two months. Much better than random YouTube playlists and scattered notes.',
    name: 'Jordan Lee',
    role: 'Full Stack Developer',
    company: 'Joined Adobe',
    initials: 'JL',
  },
];

export const faqs = [
  {
    q: 'What is a company-wise DSA sheet?',
    a: 'A company-wise DSA sheet organizes coding problems by the companies known to frequently ask them in technical interviews. Instead of solving random problems, you focus on what a specific company has historically tested.',
  },
  {
    q: 'How are problems organized?',
    a: 'Problems are grouped by company, then sortable by frequency, difficulty, acceptance rate, and topic. Each problem shows how often it appears in that company\'s interviews, so you know what to prioritize.',
  },
  {
    q: 'Can I filter problems by company?',
    a: 'Yes. You can select any company from the list — Google, Amazon, Microsoft, Meta, Apple, and more — and see only the problems associated with that company, with frequency data.',
  },
  {
    q: 'Can I track which problems I\'ve solved?',
    a: 'Yes. Each problem has a status that you can set: Not Started, Attempted, or Solved. Your overall and company-wise progress is tracked and shown on your dashboard.',
  },
  {
    q: 'Can I add personal notes?',
    a: 'Yes. Each problem has a personal notes field where you can save your approach, time/space complexity, edge cases you missed, or anything useful for revision.',
  },
  {
    q: 'Is the platform free?',
    a: 'The core problem set and company filters are completely free. You can track progress and add notes without any payment.',
  },
  {
    q: 'Which companies are included?',
    a: 'Currently: Google, Amazon, Microsoft, Meta, Apple, Adobe, Uber, Netflix, Atlassian, and Flipkart. More companies are added regularly based on community feedback.',
  },
];
