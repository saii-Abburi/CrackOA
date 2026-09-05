import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

// ── SQL Sample Table sub-schema ─────────────────────────────────────────────
const sampleTableSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    columns: { type: [String], default: [] },
    rows: { type: [[mongoose.Schema.Types.Mixed]], default: [] },
  },
  { _id: false }
);

// ── SQL Test Case sub-schema ────────────────────────────────────────────────
const sqlTestCaseSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true },
    inputData: { type: String, default: null },    // contextual description of input state
    expectedOutput: { type: String, default: null }, // expected result set (text/markdown)
  },
  { _id: false }
);

// ── SQL-Specific Metadata sub-schema ────────────────────────────────────────
// Populated only when domain === 'sql'; null/absent for DSA problems.
const sqlMetaSchema = new mongoose.Schema(
  {
    schemaDescription: { type: String, default: null }, // Table definitions (markdown/text)
    sampleTables: { type: [sampleTableSchema], default: [] },
    expectedOutput: { type: String, default: null },    // Expected result set (text/markdown)
    explanation: { type: String, default: null },       // Solution walkthrough
    referenceQuery: { type: String, default: null },    // Admin-only reference SQL
    testCases: { type: [sqlTestCaseSchema], default: [] },
    constraints: { type: [String], default: [] },
  },
  { _id: false }
);

// ── Main Problem Schema ──────────────────────────────────────────────────────
const problemSchema = new mongoose.Schema(
  {
    // ── Domain / Type ──────────────────────────────────────────────────────
    // Controls which problem type this document represents.
    // Adding new domains in the future (e.g., 'system-design', 'linux') only
    // requires extending this enum — no schema restructuring needed.
    domain: {
      type: String,
      enum: {
        values: ['dsa', 'sql'],
        message: 'Domain must be dsa or sql.',
      },
      default: 'dsa',
      index: true,
    },

    // ── Shared Fields ─────────────────────────────────────────────────────
    leetcodeId: {
      type: Number,
      // Optional — DSA problems have it, SQL problems typically do not.
      // sparse: true ensures uniqueness is enforced only where the field exists.
      min: 1,
      default: null,
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
    // Companies are DSA-specific; SQL problems may have an empty array.
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
    hints: {
      type: [String],
      default: [],
    },
    // DSA-only: code snippets per language from LeetCode
    codeSnippets: [
      {
        lang: String,
        langSlug: String,
        code: String,
      },
    ],
    stats: {
      totalAccepted: String,
      totalSubmission: String,
      acRate: String,
    },

    // ── SQL-Specific Metadata ───────────────────────────────────────────────
    // Only present when domain === 'sql'. Null/absent for DSA records.
    sqlMeta: {
      type: sqlMetaSchema,
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

// ── Indexes ──────────────────────────────────────────────────────────────────
problemSchema.index({ title: 'text' });              // Full-text search on title
problemSchema.index({ difficulty: 1 });
problemSchema.index({ frequency: -1 });
problemSchema.index({ acceptanceRate: 1 });
problemSchema.index({ companies: 1 });
problemSchema.index({ topics: 1 });
problemSchema.index({ domain: 1, difficulty: 1 });   // Domain + difficulty compound
problemSchema.index({ domain: 1, topics: 1 });        // Domain + topic compound
// Sparse unique index on leetcodeId: enforces uniqueness only for docs that have it
problemSchema.index({ leetcodeId: 1 }, { unique: true, sparse: true });

// ── Pre-save: auto-generate slug ─────────────────────────────────────────────
problemSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = slugify(this.title);
  }
  next();
});

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
