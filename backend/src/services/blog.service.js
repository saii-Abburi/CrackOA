import Blog from '../models/Blog.js';
import Problem from '../models/Problem.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import User from '../models/User.js';

/**
 * Get a paginated list of published blogs, with optional filtering.
 */
export const getBlogs = async ({ page = 1, limit = 12, search, topic, difficulty, problemId }) => {
  const skip = (page - 1) * limit;
  let problemFilter = {};
  
  if (topic) {
    problemFilter.topics = topic;
  }
  if (difficulty && difficulty !== 'All') {
    problemFilter.difficulty = difficulty;
  }
  
  let blogFilter = { published: true };
  
  // If search is provided, search by title (using regex for simple search)
  if (search) {
    blogFilter.title = { $regex: search, $options: 'i' };
  }
  
  if (problemId) {
    blogFilter.problem = problemId;
  }
  
  // If we have problem filters, we must restrict the blogs to those specific problems
  if (Object.keys(problemFilter).length > 0) {
    const matchingProblems = await Problem.find(problemFilter).select('_id');
    const problemIds = matchingProblems.map(p => p._id);
    
    blogFilter.problem = { $in: problemIds };
  }
  
  const [blogs, total] = await Promise.all([
    Blog.find(blogFilter)
      .populate('problem', 'title leetcodeId difficulty topics leetcodeUrl')
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(blogFilter),
  ]);
  
  return { blogs, total };
};

/**
 * Get a user's own submitted blogs (both published and pending).
 */
export const getUserBlogs = async ({ authorId, page = 1, limit = 12 }) => {
  const skip = (page - 1) * limit;
  const blogFilter = { author: authorId };

  const [blogs, total] = await Promise.all([
    Blog.find(blogFilter)
      .populate('problem', 'title leetcodeId difficulty topics leetcodeUrl')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(blogFilter),
  ]);

  return { blogs, total };
};

/**
 * Get a single blog by slug. Published blogs are visible to all; pending blogs are visible to author or admin.
 */
export const getBlogBySlug = async (slug, user = null) => {
  let filter = { slug };

  if (!user || user.role !== 'admin') {
    if (user) {
      filter.$or = [{ published: true }, { author: user._id }];
    } else {
      filter.published = true;
    }
  }

  const blog = await Blog.findOne(filter)
    .populate('problem', 'title leetcodeId difficulty topics leetcodeUrl')
    .populate('author', 'name email')
    .lean();

  return blog;
};

/**
 * Get related blogs.
 * Returns up to `limit` published blogs with similar topics/difficulty, excluding the current blog.
 */
export const getRelatedBlogs = async (currentBlog, limit = 4) => {
  if (!currentBlog || !currentBlog.problem) return [];

  const problemTopics = currentBlog.problem.topics || [];

  const relatedProblems = await Problem.find({
    _id: { $ne: currentBlog.problem._id },
    topics: { $in: problemTopics }
  }).select('_id');

  const problemIds = relatedProblems.map(p => p._id);

  const relatedBlogs = await Blog.find({
    _id: { $ne: currentBlog._id },
    published: true,
    problem: { $in: problemIds }
  })
    .populate('problem', 'title difficulty topics')
    .limit(limit)
    .lean();

  if (relatedBlogs.length < limit) {
    const additionalLimit = limit - relatedBlogs.length;
    const existingIds = [currentBlog._id, ...relatedBlogs.map(b => b._id)];

    const additionalBlogs = await Blog.find({
      _id: { $nin: existingIds },
      published: true
    })
      .populate('problem', 'title difficulty topics')
      .sort({ publishedAt: -1 })
      .limit(additionalLimit)
      .lean();

    return [...relatedBlogs, ...additionalBlogs];
  }

  return relatedBlogs;
};

// --- ADMIN & USER MANAGEMENT SERVICES ---

/**
 * Get all blogs (including unpublished) for admin table.
 */
export const getAdminBlogs = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    Blog.find()
      .populate('problem', 'title leetcodeId')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(),
  ]);

  return { blogs, total };
};

/**
 * Get a single blog by ID.
 */
export const getBlogById = async (id) => {
  return Blog.findById(id)
    .populate('problem', 'title leetcodeId')
    .populate('author', 'name email');
};

/**
 * Create a new blog.
 * Non-admins cannot publish directly — `published` will be set to `false`.
 */
export const createBlog = async (blogData, user) => {
  const isUserAdmin = user?.role === 'admin';

  const newBlogPayload = {
    ...blogData,
    author: user._id,
    published: isUserAdmin ? Boolean(blogData.published) : false,
  };

  if (newBlogPayload.published) {
    newBlogPayload.publishedAt = new Date();
  }

  const blog = new Blog(newBlogPayload);
  await blog.save();
  return blog;
};

/**
 * Update an existing blog.
 * Non-admins can only update their own blogs and cannot set `published = true` (edits reset published status to false).
 */
export const updateBlog = async (id, updateData, user) => {
  const blog = await Blog.findById(id);
  if (!blog) return { error: 'NOT_FOUND', message: 'Blog not found' };

  const isUserAdmin = user?.role === 'admin';
  const isAuthor = blog.author && blog.author.toString() === user._id.toString();

  if (!isUserAdmin && !isAuthor) {
    return { error: 'FORBIDDEN', message: 'You can only update your own blogs' };
  }

  // Non-admin edits force the blog back to pending approval
  if (!isUserAdmin) {
    updateData.published = false;
    updateData.publishedAt = null;
  } else if (updateData.published !== undefined) {
    if (updateData.published === true && !blog.published) {
      updateData.publishedAt = new Date();
    } else if (updateData.published === false) {
      updateData.publishedAt = null;
    }
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('problem', 'title leetcodeId')
    .populate('author', 'name email');

  return { blog: updatedBlog };
};

/**
 * Delete a blog.
 * Non-admins can only delete their own blogs.
 */
export const deleteBlog = async (id, user) => {
  const blog = await Blog.findById(id);
  if (!blog) return { error: 'NOT_FOUND', message: 'Blog not found' };

  const isUserAdmin = user?.role === 'admin';
  const isAuthor = blog.author && blog.author.toString() === user._id.toString();

  if (!isUserAdmin && !isAuthor) {
    return { error: 'FORBIDDEN', message: 'You can only delete your own blogs' };
  }

  await Blog.findByIdAndDelete(id);
  // Also clean up associated comments and reports
  await Promise.all([
    Comment.deleteMany({ blog: id }),
    Report.deleteMany({ blog: id }),
  ]);

  return { success: true };
};

// --- COMMENTS SERVICES ---

export const getBlogComments = async (blogId) => {
  return Comment.find({ blog: blogId })
    .populate('user', 'name email avatar role')
    .sort({ createdAt: -1 })
    .lean();
};

export const addBlogComment = async (blogId, userId, content) => {
  const comment = new Comment({
    blog: blogId,
    user: userId,
    content: content.trim(),
  });
  await comment.save();

  return Comment.findById(comment._id)
    .populate('user', 'name email avatar role')
    .lean();
};

export const deleteBlogComment = async (commentId, user) => {
  const comment = await Comment.findById(commentId);
  if (!comment) return { error: 'NOT_FOUND', message: 'Comment not found' };

  const isUserAdmin = user?.role === 'admin';
  const isAuthor = comment.user && comment.user.toString() === user._id.toString();

  if (!isUserAdmin && !isAuthor) {
    return { error: 'FORBIDDEN', message: 'You can only delete your own comments' };
  }

  await Comment.findByIdAndDelete(commentId);
  return { success: true };
};

// --- PERSISTENT LIKES SERVICES ---

export const toggleBlogLike = async (blogId, userId) => {
  const [blog, dbUser] = await Promise.all([
    Blog.findById(blogId),
    User.findById(userId),
  ]);

  if (!blog) return { error: 'NOT_FOUND', message: 'Blog not found' };
  if (!dbUser) return { error: 'NOT_FOUND', message: 'User not found' };

  if (!Array.isArray(dbUser.likedBlogs)) {
    dbUser.likedBlogs = [];
  }

  const likedIndex = dbUser.likedBlogs.findIndex(
    (id) => id.toString() === blogId.toString()
  );

  let isLiked = false;
  if (likedIndex > -1) {
    // Unlike
    dbUser.likedBlogs.splice(likedIndex, 1);
    blog.likesCount = Math.max(0, (blog.likesCount || 0) - 1);
    isLiked = false;
  } else {
    // Like
    dbUser.likedBlogs.push(blogId);
    blog.likesCount = (blog.likesCount || 0) + 1;
    isLiked = true;
  }

  await Promise.all([dbUser.save(), blog.save()]);

  return { liked: isLiked, likesCount: blog.likesCount, likedBlogs: dbUser.likedBlogs };
};

export const getUserLikedBlogs = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'likedBlogs',
      populate: { path: 'problem', select: 'title leetcodeId difficulty topics' },
    })
    .lean();

  if (!user) return [];
  return user.likedBlogs || [];
};

export const getBlogLikeStatus = async (blogId, userId) => {
  const blog = await Blog.findById(blogId).select('likesCount');
  if (!blog) return { error: 'NOT_FOUND', message: 'Blog not found' };

  let isLiked = false;
  if (userId) {
    const dbUser = await User.findById(userId).select('likedBlogs');
    if (dbUser && Array.isArray(dbUser.likedBlogs)) {
      isLiked = dbUser.likedBlogs.some((id) => id.toString() === blogId.toString());
    }
  }

  return { liked: isLiked, likesCount: blog.likesCount || 0 };
};

// --- REPORT & MODERATION SERVICES ---

export const createBlogReport = async (blogId, reporterId, reason) => {
  const blog = await Blog.findById(blogId);
  if (!blog) return { error: 'NOT_FOUND', message: 'Blog not found' };

  const report = new Report({
    blog: blogId,
    reporter: reporterId,
    reason: reason || 'Inappropriate or incorrect content',
  });
  await report.save();

  return report;
};

export const getAdminReports = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    Report.find()
      .populate({
        path: 'blog',
        select: 'title slug excerpt published author',
        populate: { path: 'author', select: 'name email' },
      })
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(),
  ]);

  return { reports, total };
};

export const updateAdminReportStatus = async (reportId, status) => {
  const report = await Report.findByIdAndUpdate(
    reportId,
    { status },
    { new: true }
  )
    .populate({
      path: 'blog',
      select: 'title slug',
    })
    .populate('reporter', 'name email');

  if (!report) return { error: 'NOT_FOUND', message: 'Report not found' };
  return { report };
};

