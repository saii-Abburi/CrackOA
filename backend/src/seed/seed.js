/**
 * Seed script for Company-wise DSA Sheet.
 * Run with: npm run seed
 *
 * Seeds:
 *  - 10 companies
 *  - 30 realistic DSA problems with company associations
 *  - 1 admin user
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { slugify } from '../utils/slugify.js';
dotenv.config();

import connectDB from '../config/db.js';
import Company from '../models/Company.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';

// ─────────────────────────────────────────────
// COMPANY DATA
// ─────────────────────────────────────────────
const companiesData = [
  {
    name: 'Google',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png',
    description: 'Multinational technology company specializing in internet-related services and products.',
  },
  {
    name: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1280px-Amazon_logo.svg.png',
    description: 'Multinational technology company focusing on e-commerce, cloud computing, and AI.',
  },
  {
    name: 'Microsoft',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/1024px-Microsoft_logo.svg.png',
    description: 'Multinational corporation producing computer software, consumer electronics, and related services.',
  },
  {
    name: 'Meta',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1280px-Meta_Platforms_Inc._logo.svg.png',
    description: 'Technology conglomerate owning Facebook, Instagram, and WhatsApp.',
  },
  {
    name: 'Apple',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/832px-Apple_logo_black.svg.png',
    description: 'Multinational corporation designing consumer electronics, software, and services.',
  },
  {
    name: 'Adobe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Adobe_Corporate_Logo.png/1280px-Adobe_Corporate_Logo.png',
    description: 'Software company specializing in creative, marketing, and document management solutions.',
  },
  {
    name: 'Uber',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/2560px-Uber_logo_2018.svg.png',
    description: 'Technology company offering ride-hailing, food delivery, and freight services.',
  },
  {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/1280px-Netflix_2015_logo.svg.png',
    description: 'Subscription streaming service and production company.',
  },
  {
    name: 'Flipkart',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Flipkart_logo.svg/1280px-Flipkart_logo.svg.png',
    description: 'Indian e-commerce company headquartered in Bangalore.',
  },
  {
    name: 'Atlassian',
    logo: 'https://wac-cdn.atlassian.com/assets/img/favicons/atlassian/apple-touch-icon.png',
    description: 'Australian software company developing products for teams and developers.',
  },
];

// ─────────────────────────────────────────────
// PROBLEM DATA (will inject company ObjectIds later)
// ─────────────────────────────────────────────
const getProblemsData = (companyMap) => [
  {
    leetcodeId: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    acceptanceRate: 49.1,
    frequency: 95.2,
    leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
    topics: ['Array', 'Hash Table'],
    companies: [companyMap['Google'], companyMap['Amazon'], companyMap['Microsoft'], companyMap['Meta'], companyMap['Apple']],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    solutionUrl: null,
  },
  {
    leetcodeId: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    acceptanceRate: 33.8,
    frequency: 88.4,
    leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Microsoft'], companyMap['Adobe']],
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
  },
  {
    leetcodeId: 42,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    acceptanceRate: 59.2,
    frequency: 82.1,
    leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    topics: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Meta'], companyMap['Microsoft']],
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
  },
  {
    leetcodeId: 53,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    acceptanceRate: 49.5,
    frequency: 85.3,
    leetcodeUrl: 'https://leetcode.com/problems/maximum-subarray/',
    topics: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    companies: [companyMap['Amazon'], companyMap['Apple'], companyMap['Microsoft'], companyMap['Google']],
    description: 'Given an integer array nums, find the subarray with the largest sum and return its sum.',
  },
  {
    leetcodeId: 56,
    title: 'Merge Intervals',
    difficulty: 'Medium',
    acceptanceRate: 46.3,
    frequency: 84.7,
    leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/',
    topics: ['Array', 'Sorting'],
    companies: [companyMap['Google'], companyMap['Meta'], companyMap['Microsoft'], companyMap['Uber']],
    description: 'Given an array of intervals, merge all overlapping intervals and return an array of the non-overlapping intervals.',
  },
  {
    leetcodeId: 146,
    title: 'LRU Cache',
    difficulty: 'Medium',
    acceptanceRate: 42.1,
    frequency: 87.6,
    leetcodeUrl: 'https://leetcode.com/problems/lru-cache/',
    topics: ['Hash Table', 'Linked List', 'Design'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Microsoft'], companyMap['Meta'], companyMap['Uber']],
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
  },
  {
    leetcodeId: 200,
    title: 'Number of Islands',
    difficulty: 'Medium',
    acceptanceRate: 57.5,
    frequency: 83.9,
    leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
    topics: ['Array', 'DFS', 'BFS', 'Matrix', 'Union Find'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Microsoft'], companyMap['Netflix']],
    description: 'Given an m x n 2D binary grid, return the number of islands.',
  },
  {
    leetcodeId: 207,
    title: 'Course Schedule',
    difficulty: 'Medium',
    acceptanceRate: 45.6,
    frequency: 80.2,
    leetcodeUrl: 'https://leetcode.com/problems/course-schedule/',
    topics: ['DFS', 'BFS', 'Graph', 'Topological Sort'],
    companies: [companyMap['Google'], companyMap['Uber'], companyMap['Flipkart'], companyMap['Amazon']],
    description: 'Given numCourses and prerequisites, determine if you can finish all courses.',
  },
  {
    leetcodeId: 124,
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'Hard',
    acceptanceRate: 38.2,
    frequency: 79.8,
    leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/',
    topics: ['Dynamic Programming', 'Tree', 'DFS', 'Binary Tree'],
    companies: [companyMap['Google'], companyMap['Amazon'], companyMap['Meta'], companyMap['Microsoft']],
    description: 'Find the maximum path sum in a binary tree. The path does not need to pass through the root.',
  },
  {
    leetcodeId: 127,
    title: 'Word Ladder',
    difficulty: 'Hard',
    acceptanceRate: 37.4,
    frequency: 76.3,
    leetcodeUrl: 'https://leetcode.com/problems/word-ladder/',
    topics: ['Hash Table', 'String', 'BFS'],
    companies: [companyMap['Google'], companyMap['Amazon'], companyMap['Microsoft']],
    description: 'Given beginWord, endWord, and a wordList, return the number of words in the shortest transformation sequence.',
  },
  {
    leetcodeId: 15,
    title: '3Sum',
    difficulty: 'Medium',
    acceptanceRate: 33.2,
    frequency: 81.4,
    leetcodeUrl: 'https://leetcode.com/problems/3sum/',
    topics: ['Array', 'Two Pointers', 'Sorting'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Meta'], companyMap['Adobe']],
    description: 'Given an integer array nums, return all triplets [nums[i], nums[j], nums[k]] that sum to zero.',
  },
  {
    leetcodeId: 23,
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    acceptanceRate: 51.3,
    frequency: 78.9,
    leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
    topics: ['Linked List', 'Divide and Conquer', 'Heap', 'Merge Sort'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Microsoft'], companyMap['Uber']],
    description: 'Merge k sorted linked lists and return it as one sorted list.',
  },
  {
    leetcodeId: 33,
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    acceptanceRate: 39.4,
    frequency: 77.5,
    leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    topics: ['Array', 'Binary Search'],
    companies: [companyMap['Amazon'], companyMap['Microsoft'], companyMap['Apple'], companyMap['Atlassian']],
    description: 'Given a rotated sorted array, search for a target value.',
  },
  {
    leetcodeId: 46,
    title: 'Permutations',
    difficulty: 'Medium',
    acceptanceRate: 73.6,
    frequency: 72.1,
    leetcodeUrl: 'https://leetcode.com/problems/permutations/',
    topics: ['Array', 'Backtracking'],
    companies: [companyMap['Google'], companyMap['Microsoft'], companyMap['Meta']],
    description: 'Given an array nums of distinct integers, return all the possible permutations.',
  },
  {
    leetcodeId: 49,
    title: 'Group Anagrams',
    difficulty: 'Medium',
    acceptanceRate: 65.2,
    frequency: 74.8,
    leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
    topics: ['Array', 'Hash Table', 'String', 'Sorting'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Facebook'], companyMap['Uber']].filter(Boolean),
    description: 'Given an array of strings, group the anagrams together.',
  },
  {
    leetcodeId: 70,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    acceptanceRate: 51.7,
    frequency: 70.4,
    leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
    topics: ['Math', 'Dynamic Programming', 'Memoization'],
    companies: [companyMap['Amazon'], companyMap['Adobe'], companyMap['Flipkart']],
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?',
  },
  {
    leetcodeId: 72,
    title: 'Edit Distance',
    difficulty: 'Medium',
    acceptanceRate: 53.5,
    frequency: 69.7,
    leetcodeUrl: 'https://leetcode.com/problems/edit-distance/',
    topics: ['String', 'Dynamic Programming'],
    companies: [companyMap['Google'], companyMap['Amazon'], companyMap['Atlassian']],
    description: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.',
  },
  {
    leetcodeId: 76,
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    acceptanceRate: 41.2,
    frequency: 73.3,
    leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Meta'], companyMap['Uber']],
    description: 'Given two strings s and t, return the minimum window substring of s that contains all characters of t.',
  },
  {
    leetcodeId: 84,
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    acceptanceRate: 43.7,
    frequency: 68.9,
    leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/',
    topics: ['Array', 'Stack', 'Monotonic Stack'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Microsoft']],
    description: 'Given an array of integers heights representing the histogram bar heights, return the area of the largest rectangle in the histogram.',
  },
  {
    leetcodeId: 98,
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    acceptanceRate: 32.1,
    frequency: 75.6,
    leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
    topics: ['Tree', 'DFS', 'Binary Search Tree', 'Binary Tree'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Microsoft'], companyMap['Apple']],
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree.',
  },
  {
    leetcodeId: 102,
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    acceptanceRate: 65.3,
    frequency: 72.8,
    leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    topics: ['Tree', 'BFS', 'Binary Tree'],
    companies: [companyMap['Amazon'], companyMap['Microsoft'], companyMap['Meta']],
    description: 'Given the root of a binary tree, return the level order traversal of its nodes values.',
  },
  {
    leetcodeId: 128,
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    acceptanceRate: 47.2,
    frequency: 71.4,
    leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    topics: ['Array', 'Hash Table', 'Union Find'],
    companies: [companyMap['Google'], companyMap['Amazon'], companyMap['Meta'], companyMap['Atlassian']],
    description: 'Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.',
  },
  {
    leetcodeId: 138,
    title: 'Copy List with Random Pointer',
    difficulty: 'Medium',
    acceptanceRate: 55.4,
    frequency: 68.2,
    leetcodeUrl: 'https://leetcode.com/problems/copy-list-with-random-pointer/',
    topics: ['Hash Table', 'Linked List'],
    companies: [companyMap['Amazon'], companyMap['Microsoft'], companyMap['Adobe']],
    description: 'A linked list of length n is given such that each node contains an additional random pointer. Construct a deep copy of the list.',
  },
  {
    leetcodeId: 141,
    title: 'Linked List Cycle',
    difficulty: 'Easy',
    acceptanceRate: 49.7,
    frequency: 69.5,
    leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/',
    topics: ['Hash Table', 'Linked List', 'Two Pointers'],
    companies: [companyMap['Amazon'], companyMap['Microsoft'], companyMap['Google'], companyMap['Uber']],
    description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
  },
  {
    leetcodeId: 212,
    title: 'Word Search II',
    difficulty: 'Hard',
    acceptanceRate: 38.9,
    frequency: 65.7,
    leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/',
    topics: ['Array', 'String', 'Backtracking', 'Trie', 'Matrix'],
    companies: [companyMap['Google'], companyMap['Amazon'], companyMap['Microsoft']],
    description: 'Given an m x n board of characters and a list of strings words, return all words on the board.',
  },
  {
    leetcodeId: 215,
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    acceptanceRate: 64.8,
    frequency: 76.4,
    leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    topics: ['Array', 'Divide and Conquer', 'Sorting', 'Heap', 'Quickselect'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Meta'], companyMap['Apple']],
    description: 'Given an integer array nums and an integer k, return the kth largest element in the array.',
  },
  {
    leetcodeId: 238,
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    acceptanceRate: 65.5,
    frequency: 77.3,
    leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
    topics: ['Array', 'Prefix Sum'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Microsoft'], companyMap['Adobe']],
    description: 'Given an integer array nums, return an array answer such that answer[i] is the product of all elements of nums except nums[i].',
  },
  {
    leetcodeId: 295,
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    acceptanceRate: 51.1,
    frequency: 67.8,
    leetcodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/',
    topics: ['Two Pointers', 'Design', 'Sorting', 'Heap', 'Data Stream'],
    companies: [companyMap['Google'], companyMap['Amazon'], companyMap['Meta']],
    description: 'The MedianFinder class finds the median from a data stream.',
  },
  {
    leetcodeId: 297,
    title: 'Serialize and Deserialize Binary Tree',
    difficulty: 'Hard',
    acceptanceRate: 55.6,
    frequency: 64.2,
    leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
    topics: ['String', 'Tree', 'DFS', 'BFS', 'Design', 'Binary Tree'],
    companies: [companyMap['Google'], companyMap['Amazon'], companyMap['Uber'], companyMap['Atlassian']],
    description: 'Design an algorithm to serialize and deserialize a binary tree.',
  },
  {
    leetcodeId: 347,
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    acceptanceRate: 64.2,
    frequency: 74.1,
    leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
    topics: ['Array', 'Hash Table', 'Divide and Conquer', 'Sorting', 'Heap', 'Bucket Sort'],
    companies: [companyMap['Amazon'], companyMap['Google'], companyMap['Apple'], companyMap['Netflix']],
    description: 'Given an integer array nums and an integer k, return the k most frequent elements.',
  },
];

// ─────────────────────────────────────────────
// ADMIN USER
// ─────────────────────────────────────────────
const adminUser = {
  name: 'Admin',
  email: 'admin@dsasheet.com',
  password: 'admin123456',
  role: 'admin',
};

// ─────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────
const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Company.deleteMany({}),
      Problem.deleteMany({}),
      User.deleteMany({ role: 'admin' }),
    ]);

    // Seed companies
    console.log('🏢 Seeding companies...');
    const insertedCompanies = await Company.create(
      companiesData.map((c) => ({
        ...c,
        slug: slugify(c.name),
      }))
    );

    // Build name → _id map
    const companyMap = {};
    insertedCompanies.forEach((c) => {
      companyMap[c.name] = c._id;
    });

    console.log(`   ✅ ${insertedCompanies.length} companies seeded.`);

    // Seed problems
    console.log('📝 Seeding problems...');
    const problemsData = getProblemsData(companyMap);
    const insertedProblems = await Problem.create(
      problemsData.map((p) => ({
        ...p,
        slug: slugify(p.title),
        companies: p.companies.filter(Boolean),
      }))
    );

    console.log(`   ✅ ${insertedProblems.length} problems seeded.`);

    // Update company totalProblems counts
    console.log('📊 Updating company problem counts...');
    for (const company of insertedCompanies) {
      const count = await Problem.countDocuments({ companies: company._id });
      await Company.findByIdAndUpdate(company._id, { totalProblems: count });
    }
    console.log('   ✅ Company problem counts updated.');

    // Seed admin user
    console.log('👤 Seeding admin user...');
    await User.create(adminUser);
    console.log(`   ✅ Admin user created: ${adminUser.email} / ${adminUser.password}`);

    console.log('\n🎉 Seed completed successfully!\n');

    // Print summary
    const totalCompanies = await Company.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalUsers = await User.countDocuments();

    console.log('📈 Database Summary:');
    console.log(`   Companies: ${totalCompanies}`);
    console.log(`   Problems : ${totalProblems}`);
    console.log(`   Users    : ${totalUsers}`);
    console.log('\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error — database may already be seeded.');
    }
    process.exit(1);
  }
};

seed();
