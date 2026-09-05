// Shared data for the landing page — all values are illustrative demo data

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
  { id: 1, title: 'Two Sum', difficulty: 'Easy', frequency: 98, company: 'Google', topic: 'Arrays', status: 'solved' },
  { id: 146, title: 'LRU Cache', difficulty: 'Medium', frequency: 92, company: 'Amazon', topic: 'Design', status: 'progress' },
  { id: 200, title: 'Number of Islands', difficulty: 'Medium', frequency: 89, company: 'Microsoft', topic: 'Graphs', status: 'solved' },
  { id: 127, title: 'Word Ladder', difficulty: 'Hard', frequency: 84, company: 'Meta', topic: 'BFS', status: 'not_started' },
  { id: 42, title: 'Trapping Rain Water', difficulty: 'Hard', frequency: 82, company: 'Google', topic: 'Stack', status: 'progress' },
  { id: 56, title: 'Merge Intervals', difficulty: 'Medium', frequency: 79, company: 'Amazon', topic: 'Sorting', status: 'solved' },
  { id: 207, title: 'Course Schedule', difficulty: 'Medium', frequency: 76, company: 'Uber', topic: 'Graphs', status: 'not_started' },
  { id: 53, title: 'Maximum Subarray', difficulty: 'Easy', frequency: 73, company: 'Apple', topic: 'DP', status: 'solved' },
];

export const platformFeatures = [
  {
    icon: 'Building2',
    title: 'Company-wise Problems',
    description: 'Problems organized by the companies that ask them most frequently. Focus your prep on your target company.',
  },
  {
    icon: 'TrendingUp',
    title: 'Frequency Ranking',
    description: 'Every problem ranked by how often it appears in interviews. Prioritize what matters.',
  },
  {
    icon: 'CheckCircle2',
    title: 'Progress Tracking',
    description: 'Track solved, attempted, and remaining problems. See your company-wise and overall progress.',
  },
  {
    icon: 'SlidersHorizontal',
    title: 'Smart Filtering',
    description: 'Filter by company, difficulty, topic, and frequency to find exactly the right problems.',
  },
  {
    icon: 'FileText',
    title: 'Personal Notes',
    description: 'Save your approach, complexity analysis, edge cases, and revision notes per problem.',
  },
  {
    icon: 'BookOpen',
    title: 'Topic-based Practice',
    description: 'Master Arrays, Trees, Graphs, Dynamic Programming, and 15+ DSA topics systematically.',
  },
  {
    icon: 'PenLine',
    title: 'Blog & Editorials',
    description: 'Read and write coding editorials. Share approaches and learn from other developers.',
  },
];

// Keep the old features export for backward compat if anything references it
export const features = platformFeatures;

export const faqs = [
  {
    q: 'What is CodeRank?',
    a: 'CodeRank is a focused DSA preparation platform that organizes coding problems by company. Instead of solving random problems, you practice the questions your target company actually asks in interviews.',
  },
  {
    q: 'Who is CodeRank for?',
    a: 'CodeRank is for developers preparing for technical interviews at specific companies — whether you\'re targeting Google, Amazon, Microsoft, or any other company in our database.',
  },
  {
    q: 'How are problems organized?',
    a: 'Problems are grouped by company, then sortable by frequency, difficulty, and topic. Each problem shows how often it appears in that company\'s interviews, so you know what to prioritize.',
  },
  {
    q: 'Can I track my coding progress?',
    a: 'Yes. Each problem has a status (Not Started, Attempted, Solved) and your dashboard shows overall progress, company-wise completion, and activity tracking.',
  },
  {
    q: 'Can I add personal notes to problems?',
    a: 'Yes. Every problem has a notes field where you can save your approach, time/space complexity, edge cases, and anything useful for revision.',
  },
  {
    q: 'Which companies are included?',
    a: 'Currently: Google, Amazon, Microsoft, Meta, Apple, Adobe, Uber, Netflix, Atlassian, Flipkart, and more. New companies are added regularly.',
  },
  {
    q: 'Is CodeRank free to use?',
    a: 'The core problem set, company filters, progress tracking, and personal notes are completely free. No credit card required.',
  },
  {
    q: 'What topics can I practice?',
    a: 'Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, Greedy, Backtracking, Binary Search, Stack, Queue, Heap, and more — covering 15+ core DSA topics.',
  },
];

// Illustrative demo data for the custom sheets section
export const demoSheet = {
  title: 'Dynamic Programming',
  problems: [
    { title: 'Climbing Stairs', solved: true },
    { title: 'House Robber', solved: true },
    { title: 'Coin Change', solved: false },
    { title: 'Longest Increasing Subsequence', solved: false },
    { title: 'Edit Distance', solved: false },
    { title: 'Word Break', solved: false },
  ],
};
