import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['paragraph', 'heading', 'code', 'unordered-list', 'ordered-list', 'quote', 'image', 'callout', 'table'],
    },
    content: {
      type: mongoose.Schema.Types.Mixed, // Can be string, array of strings (for lists), or custom objects
      required: true,
    },
    level: {
      type: Number, // For headings
    },
    language: {
      type: String, // For code blocks
    },
    calloutType: {
      type: String, // For callouts (e.g., TIP, IMPORTANT, WARNING, KEY IDEA)
    },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      default: null,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
    },
    content: {
      sections: [sectionSchema],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    coverImage: {
      type: String,
      trim: true,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Meta title cannot exceed 100 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [300, 'Meta description cannot exceed 300 characters'],
    },
    keywords: {
      type: [String],
      default: [],
    },
    readingTime: {
      type: Number,
      min: 1,
      default: 5,
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── Coding Solution Fields ──────────────────────────────────────────
    blogType: {
      type: String,
      enum: ['GENERAL_ARTICLE', 'CODING_SOLUTION'],
      default: 'GENERAL_ARTICLE',
    },
    platform: {
      type: String,
      enum: ['LeetCode', 'GeeksforGeeks', 'Codeforces', 'HackerRank', 'CodeChef', 'Other'],
      default: null,
    },
    problemUrl: {
      type: String,
      trim: true,
      default: null,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: null,
    },
    intuition: {
      type: String,
      default: null,
    },
    approach: {
      type: String,
      default: null,
    },
    timeComplexity: {
      type: String,
      trim: true,
      default: null,
    },
    spaceComplexity: {
      type: String,
      trim: true,
      default: null,
    },
    code: {
      type: String,
      default: null,
    },
    codeLanguage: {
      type: String,
      default: 'cpp',
    },
    tags: {
      type: [String],
      default: [],
    },
    rawMarkdown: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
blogSchema.index({ published: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ blogType: 1, published: 1, publishedAt: -1 });
blogSchema.index({ difficulty: 1 });
blogSchema.index({ platform: 1 });
blogSchema.index({ tags: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
