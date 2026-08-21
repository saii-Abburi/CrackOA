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
      required: [true, 'A blog must be associated with a problem'],
      unique: true, // Assuming one primary blog per problem
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
// Note: slug and problem are already uniquely indexed by unique: true
blogSchema.index({ published: 1 });
blogSchema.index({ publishedAt: -1 });

// Note: Topics and Difficulty are not included here as per instructions, 
// they will be populated from the associated Problem.

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
