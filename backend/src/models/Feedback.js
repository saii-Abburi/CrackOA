import mongoose from 'mongoose';

/**
 * Feedback — stores user-submitted feedback from the feedback modal.
 * Admins can view all feedback from the admin panel.
 */

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = anonymous / unauthenticated
    },
    type: {
      type: String,
      enum: ['bug', 'feature', 'content', 'general'],
      required: [true, 'Feedback type is required.'],
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      required: [true, 'Subject is required.'],
      maxlength: [150, 'Subject cannot exceed 150 characters.'],
    },
    message: {
      type: String,
      trim: true,
      required: [true, 'Message is required.'],
      minlength: [10, 'Message must be at least 10 characters.'],
      maxlength: [2000, 'Message cannot exceed 2000 characters.'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    status: {
      type: String,
      enum: ['new', 'reviewed', 'archived'],
      default: 'new',
      index: true,
    },
    page: {
      // The page/URL where feedback was submitted (helpful for bug reports)
      type: String,
      trim: true,
      maxlength: [300, 'Page URL cannot exceed 300 characters.'],
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

feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ user: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
