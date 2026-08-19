import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

const problemSchema = new mongoose.Schema(
  {
    leetcodeId: {
      type: Number,
      required: [true, 'LeetCode ID is required'],
      unique: true,
      min: 1,
    },
    title: {
      type: String,
      required: [true, 'Problem title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
    },
    acceptanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    frequency: {
      type: Number,
      min: 0,
      default: 0,
    },
    leetcodeUrl: {
      type: String,
      trim: true,
      default: null,
    },
    topics: {
      type: [String],
      default: [],
    },
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
    ],
    description: {
      type: String,
      default: null,
    },
    solutionUrl: {
      type: String,
      trim: true,
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

// Indexes for efficient querying
problemSchema.index({ title: 'text' }); // Full-text search on title
problemSchema.index({ difficulty: 1 });
problemSchema.index({ frequency: -1 });
problemSchema.index({ acceptanceRate: 1 });
problemSchema.index({ companies: 1 });
problemSchema.index({ topics: 1 });

// Pre-save: auto-generate slug
problemSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title);
  }
  next();
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
