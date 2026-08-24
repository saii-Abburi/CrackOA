import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
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
    language: {
      type: String,
      required: true,
      default: 'cpp',
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compile Error', 'Runtime Error'],
      default: 'Accepted',
    },
    runtime: {
      type: Number, // in ms
      default: 48,
    },
    memory: {
      type: Number, // in MB
      default: 16.4,
    },
    passedTestCases: {
      type: Number,
      default: 3,
    },
    totalTestCases: {
      type: Number,
      default: 3,
    },
    errorOutput: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ user: 1, problem: 1, createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
