import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ['not_started', 'attempted', 'solved'],
        message: 'Status must be not_started, attempted, or solved',
      },
      default: 'not_started',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    solvedAt: {
      type: Date,
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

// Compound unique index: one progress record per user per problem
userProgressSchema.index({ user: 1, problem: 1 }, { unique: true });

// Index for fetching all progress for a user efficiently
userProgressSchema.index({ user: 1, status: 1 });

// Pre-save: set solvedAt when status changes to "solved"
userProgressSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'solved' && !this.solvedAt) {
    this.solvedAt = new Date();
  }
  if (this.isModified('status') && this.status !== 'solved') {
    this.solvedAt = null;
  }
  next();
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
