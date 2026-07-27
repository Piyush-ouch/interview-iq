import { CandidateProfile, PartnershipRequest } from "../models/candidateMatch.model.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";

// Curated seed pool for instant dynamic preview if DB users are limited
const SEED_CANDIDATES = [
  {
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    targetRole: "Full Stack Engineer",
    experienceLevel: "Mid Level (2-4 yrs)",
    difficultyTier: "Intermediate",
    strengths: ["React.js", "System Design", "Node.js"],
    skillGaps: ["PostgreSQL Optimization", "Kafka Streaming"],
    overallRating: 88.5,
    codingScore: 90,
    systemDesignScore: 88,
    communicationScore: 87,
    interviewsCompleted: 14,
    battlesWon: 9,
    badges: ["Top 5% Coder", "System Architect", "Streak 7"],
  },
  {
    name: "Sophia Chen",
    email: "sophia.chen@example.com",
    targetRole: "Backend Engineer",
    experienceLevel: "Senior (5+ yrs)",
    difficultyTier: "Advanced",
    strengths: ["Go", "Microservices", "Kubernetes"],
    skillGaps: ["Behavioral Leadership", "Frontend Performance"],
    overallRating: 92.4,
    codingScore: 94,
    systemDesignScore: 95,
    communicationScore: 88,
    interviewsCompleted: 22,
    battlesWon: 16,
    badges: ["Backend Guru", "Elite Tier", "System Architect"],
  },
  {
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    targetRole: "Frontend Engineer",
    experienceLevel: "Entry Level (0-1 yr)",
    difficultyTier: "Beginner",
    strengths: ["Tailwind CSS", "React UI", "TypeScript"],
    skillGaps: ["Data Structures", "State Machines"],
    overallRating: 79.2,
    codingScore: 78,
    systemDesignScore: 72,
    communicationScore: 87,
    interviewsCompleted: 8,
    battlesWon: 4,
    badges: ["Fast Learner", "UI Wizard"],
  },
  {
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    targetRole: "Full Stack Engineer",
    experienceLevel: "Mid Level (2-4 yrs)",
    difficultyTier: "Intermediate",
    strengths: ["GraphQL", "Database Indexing", "Express"],
    skillGaps: ["WebSockets", "Docker Containers"],
    overallRating: 86.0,
    codingScore: 85,
    systemDesignScore: 84,
    communicationScore: 89,
    interviewsCompleted: 11,
    battlesWon: 7,
    badges: ["Master Communicator", "Streak 5"],
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    targetRole: "AI / ML Engineer",
    experienceLevel: "Senior (5+ yrs)",
    difficultyTier: "Elite",
    strengths: ["Python PyTorch", "LLM Fine-Tuning", "Vector DBs"],
    skillGaps: ["Cloud Deployment", "CI/CD Pipelines"],
    overallRating: 95.8,
    codingScore: 97,
    systemDesignScore: 96,
    communicationScore: 94,
    interviewsCompleted: 29,
    battlesWon: 22,
    badges: ["AI Specialist", "Leaderboard Champion", "Elite Tier"],
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    targetRole: "Product Manager",
    experienceLevel: "Mid Level (2-4 yrs)",
    difficultyTier: "Intermediate",
    strengths: ["System Architecture", "Behavioral Pitch", "Metrics Analysis"],
    skillGaps: ["Algorithmic Complexity", "SQL Querying"],
    overallRating: 84.6,
    codingScore: 76,
    systemDesignScore: 89,
    communicationScore: 92,
    interviewsCompleted: 10,
    battlesWon: 5,
    badges: ["Strategy Ace", "Communication Star"],
  },
];

// Helper to seed or compute user profile stats
const getOrCreateUserProfile = async (userId) => {
  let profile = await CandidateProfile.findOne({ userId }).populate("userId", "name email");
  if (!profile) {
    const user = await User.findById(userId);
    const userInterviews = await Interview.find({ userId, status: "completed" });
    
    let avgScore = 80;
    if (userInterviews.length > 0) {
      avgScore = userInterviews.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / userInterviews.length;
    }

    profile = await CandidateProfile.create({
      userId,
      targetRole: "Full Stack Engineer",
      experienceLevel: "Mid Level (2-4 yrs)",
      difficultyTier: "Intermediate",
      strengths: ["Technical Communication", "Core Algorithms"],
      skillGaps: ["System Design", "High Concurrency"],
      overallRating: Math.round(avgScore * 10) / 10,
      interviewsCompleted: userInterviews.length,
      battlesWon: 2,
      badges: ["Active Practice", "Rising Star"],
    });
    profile = await CandidateProfile.findById(profile._id).populate("userId", "name email");
  }
  return profile;
};

// GET /api/matching/profile
export const getMyMatchingProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await getOrCreateUserProfile(userId);
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/matching/profile
export const updateMatchingProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { targetRole, experienceLevel, difficultyTier, strengths, skillGaps } = req.body;

    const profile = await CandidateProfile.findOneAndUpdate(
      { userId },
      {
        targetRole,
        experienceLevel,
        difficultyTier,
        strengths,
        skillGaps,
      },
      { new: true, upsert: true }
    ).populate("userId", "name email");

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/matching/candidates
export const getCandidateMatches = async (req, res) => {
  try {
    const userId = req.userId;
    const userProfile = await getOrCreateUserProfile(userId);

    // Fetch candidate profiles from DB excluding self
    let dbProfiles = await CandidateProfile.find({ userId: { $ne: userId } }).populate("userId", "name email");

    // Format combined list (DB profiles + Seed candidates if needed)
    let candidatesList = dbProfiles.map((p) => ({
      _id: p._id,
      userId: p.userId?._id || p._id,
      name: p.userId?.name || "Candidate",
      email: p.userId?.email || "",
      targetRole: p.targetRole,
      experienceLevel: p.experienceLevel,
      difficultyTier: p.difficultyTier,
      strengths: p.strengths || [],
      skillGaps: p.skillGaps || [],
      overallRating: p.overallRating,
      codingScore: p.codingScore || 80,
      systemDesignScore: p.systemDesignScore || 80,
      communicationScore: p.communicationScore || 80,
      interviewsCompleted: p.interviewsCompleted,
      battlesWon: p.battlesWon,
      badges: p.badges || [],
    }));

    // If DB candidates count is less than 5, supplement with SEED_CANDIDATES
    if (candidatesList.length < 5) {
      SEED_CANDIDATES.forEach((seed, idx) => {
        candidatesList.push({
          _id: `seed_${idx}`,
          userId: `seed_user_${idx}`,
          name: seed.name,
          email: seed.email,
          targetRole: seed.targetRole,
          experienceLevel: seed.experienceLevel,
          difficultyTier: seed.difficultyTier,
          strengths: seed.strengths,
          skillGaps: seed.skillGaps,
          overallRating: seed.overallRating,
          codingScore: seed.codingScore,
          systemDesignScore: seed.systemDesignScore,
          communicationScore: seed.communicationScore,
          interviewsCompleted: seed.interviewsCompleted,
          battlesWon: seed.battlesWon,
          badges: seed.badges,
        });
      });
    }

    // Match calculation algorithm
    const matches = candidatesList.map((candidate) => {
      let score = 50; // base score

      // 1. Role match (+25%)
      if (candidate.targetRole.toLowerCase() === userProfile.targetRole.toLowerCase()) {
        score += 25;
      } else if (candidate.targetRole.toLowerCase().includes(userProfile.targetRole.toLowerCase()) || userProfile.targetRole.toLowerCase().includes(candidate.targetRole.toLowerCase())) {
        score += 15;
      }

      // 2. Complementary Skill Gap Match (+20%)
      // If user's skill gap matches candidate's strength OR candidate's skill gap matches user's strength
      const userGapsInCandidateStrengths = userProfile.skillGaps.filter((gap) =>
        candidate.strengths.some((str) => str.toLowerCase().includes(gap.toLowerCase()) || gap.toLowerCase().includes(str.toLowerCase()))
      ).length;

      const candidateGapsInUserStrengths = candidate.skillGaps.filter((gap) =>
        userProfile.strengths.some((str) => str.toLowerCase().includes(gap.toLowerCase()) || gap.toLowerCase().includes(str.toLowerCase()))
      ).length;

      const complementaryPoints = (userGapsInCandidateStrengths + candidateGapsInUserStrengths) * 10;
      score += Math.min(complementaryPoints, 20);

      // 3. Performance Level Compatibility (+15%)
      const ratingDiff = Math.abs(userProfile.overallRating - candidate.overallRating);
      if (ratingDiff <= 5) score += 15;
      else if (ratingDiff <= 10) score += 10;
      else score += 5;

      // 4. Difficulty Tier Match (+10%)
      if (candidate.difficultyTier === userProfile.difficultyTier) score += 10;
      else score += 5;

      const matchPercentage = Math.min(Math.max(score, 65), 98);

      // Determine primary match reason
      let matchReason = "Balanced Performance & Skill Compatibility";
      if (userGapsInCandidateStrengths > 0 || candidateGapsInUserStrengths > 0) {
        matchReason = "Complementary Skill Swap Opportunity";
      } else if (candidate.targetRole === userProfile.targetRole) {
        matchReason = `Same Target Role: ${userProfile.targetRole}`;
      } else if (ratingDiff <= 5) {
        matchReason = "High Performance Peer Match";
      }

      return {
        ...candidate,
        matchPercentage,
        matchReason,
      };
    });

    // Sort by match percentage descending
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    return res.status(200).json({
      success: true,
      userProfile,
      matches,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/matching/groups
export const getPartnershipGroups = async (req, res) => {
  try {
    const userId = req.userId;
    const userProfile = await getOrCreateUserProfile(userId);

    const groups = [
      {
        id: "group_beginner",
        tier: "Beginner",
        title: "Foundation & Warmup Squad",
        description: "Focus on standard behavioral questions, core coding syntax, and confidence building.",
        targetRole: "All Roles",
        membersCount: 42,
        activeSessions: 6,
        color: "from-blue-500 to-indigo-600",
        badge: "STARTER",
        isCurrent: userProfile.difficultyTier === "Beginner",
      },
      {
        id: "group_intermediate",
        tier: "Intermediate",
        title: "Mid-Level Practice Syndicate",
        description: "Balanced focus on technical architecture, medium LeetCode algorithms, and behavioral stories.",
        targetRole: "Full Stack & Backend",
        membersCount: 89,
        activeSessions: 14,
        color: "from-emerald-500 to-teal-600",
        badge: "POPULAR",
        isCurrent: userProfile.difficultyTier === "Intermediate",
      },
      {
        id: "group_advanced",
        tier: "Advanced",
        title: "Senior System Architects",
        description: "Deep dive into scalable system design, complex data structures, and tech leadership scenarios.",
        targetRole: "Senior Tech Roles",
        membersCount: 64,
        activeSessions: 11,
        color: "from-purple-500 to-violet-600",
        badge: "HIGH INTENSITY",
        isCurrent: userProfile.difficultyTier === "Advanced",
      },
      {
        id: "group_elite",
        tier: "Elite",
        title: "Tier-1 / FAANG Mastery Circle",
        description: "Rigorous high-pressure mock interviews, concurrency, distributed systems, and executive behavioral rounds.",
        targetRole: "FAANG & Staff Level",
        membersCount: 31,
        activeSessions: 8,
        color: "from-amber-500 to-orange-600",
        badge: "PRO TIER",
        isCurrent: userProfile.difficultyTier === "Elite",
      },
    ];

    return res.status(200).json({ success: true, currentTier: userProfile.difficultyTier, groups });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/matching/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { roleFilter, timeframe } = req.query;
    const userId = req.userId;

    let dbProfiles = await CandidateProfile.find().populate("userId", "name email");

    let allCandidates = dbProfiles.map((p) => ({
      _id: p._id,
      userId: p.userId?._id || p._id,
      name: p.userId?.name || "Candidate",
      targetRole: p.targetRole,
      experienceLevel: p.experienceLevel,
      difficultyTier: p.difficultyTier,
      overallRating: p.overallRating,
      codingScore: p.codingScore || 80,
      systemDesignScore: p.systemDesignScore || 80,
      communicationScore: p.communicationScore || 80,
      interviewsCompleted: p.interviewsCompleted,
      battlesWon: p.battlesWon,
      strengths: p.strengths || [],
      skillGaps: p.skillGaps || [],
      badges: p.badges || [],
      isSelf: p.userId?._id?.toString() === userId?.toString(),
    }));

    // Ensure seed candidates exist in leaderboard if DB is small
    if (allCandidates.length < 5) {
      SEED_CANDIDATES.forEach((seed, idx) => {
        allCandidates.push({
          _id: `seed_lb_${idx}`,
          userId: `seed_lb_user_${idx}`,
          name: seed.name,
          targetRole: seed.targetRole,
          experienceLevel: seed.experienceLevel,
          difficultyTier: seed.difficultyTier,
          overallRating: seed.overallRating,
          codingScore: seed.codingScore,
          systemDesignScore: seed.systemDesignScore,
          communicationScore: seed.communicationScore,
          interviewsCompleted: seed.interviewsCompleted,
          battlesWon: seed.battlesWon,
          strengths: seed.strengths,
          skillGaps: seed.skillGaps,
          badges: seed.badges,
          isSelf: false,
        });
      });
    }

    // Role filter
    if (roleFilter && roleFilter !== "All") {
      allCandidates = allCandidates.filter((c) =>
        c.targetRole.toLowerCase().includes(roleFilter.toLowerCase())
      );
    }

    // Sort candidates by overallRating & interviews completed
    allCandidates.sort((a, b) => b.overallRating - a.overallRating || b.interviewsCompleted - a.interviewsCompleted);

    // Compute rank and percentile
    const totalCount = allCandidates.length;
    const leaderboard = allCandidates.map((c, index) => {
      const rank = index + 1;
      const percentile = Math.round(((totalCount - rank) / totalCount) * 100);
      return {
        ...c,
        rank,
        percentile: percentile < 50 ? 60 + (totalCount - rank) * 4 : Math.min(percentile, 99),
      };
    });

    return res.status(200).json({
      success: true,
      timeframe: timeframe || "All-Time",
      totalCandidates: totalCount,
      leaderboard,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/matching/request
export const sendPartnershipRequest = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId, topic, difficultyTier, note } = req.body;

    if (!receiverId) {
      return res.status(400).json({ success: false, message: "Receiver ID is required" });
    }

    const request = await PartnershipRequest.create({
      senderId,
      receiverId: receiverId.startsWith("seed_") ? senderId : receiverId,
      topic: topic || "Mock Technical Interview Practice",
      difficultyTier: difficultyTier || "Intermediate",
      note: note || "Hi! Let's pair up for a mock interview session.",
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Mock interview partnership request sent successfully!",
      request,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
