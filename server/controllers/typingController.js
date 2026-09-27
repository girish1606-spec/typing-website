import { TypingResult, User } from '../models/dbStore.js';

const TYPING_PASSAGES = {
  // Duration-based standard prose
  quick: [
    "Speed is not about rushing through keys; it is the rhythm of clarity and effortless precision.",
    "The quick brown fox jumps over the lazy dog while mechanical switches click with satisfying resonance.",
    "True mastery over the keyboard comes when your fingers move seamlessly ahead of conscious thought.",
    "Code flows effortlessly when your muscle memory executes every semicolon and bracket with perfection.",
    "Every keystroke is an opportunity to improve your precision and elevate your overall typing velocity."
  ],
  '1min': [
    "Typing at high speeds requires a synthesis of relaxation, accurate posture, and steady rhythm. When your fingers find their natural cadence on the home row, errors diminish and velocity increases organically. Professional typists do not glance at their keys; instead, their mind's eye projects words straight onto the screen.",
    "Technology moves at a relentless pace, and the keyboard remains humanity's primary conduit to digital creativity. Writing software, composing research, and communicating across time zones all hinge upon the efficiency with which thoughts transform into digital characters on a glass display.",
    "The quiet hum of a workspace paired with the tactile response of mechanical switches creates a sanctuary for deep focus. As each sentence resolves into accurate text, momentum builds. Consistency over time turns modest speeds into remarkable typing prowess."
  ],
  '3min': [
    "In the early days of personal computing, keyboards were heavy mechanical instruments built with metal frames and buckling spring switches. The satisfying tactile click informed the typist of an actuation long before the key bottomed out. Today, modern keyboards have evolved into personalized works of craftsmanship. Enthusiasts tune switch weights, lubricate stabilizers, and choose custom keycaps with sculpted profiles to achieve peak tactile acoustics and unmatched typing comfort.\n\nDeveloping elite typing speed is an athletic endeavor for the brain and hands. Fine motor coordination improves through deliberate practice. Typists who push past eighty and one hundred words per minute learn to read entire words and multi-word chunks in advance rather than processing letter by letter. This predictive cognitive processing is what unlocks fluid speed and minimizes hesitations.",
    "Artificial intelligence and computational software continue to reshape our digital civilization. Yet, the human-in-the-loop interaction depends heavily on the fidelity of our input methods. Whether you are prompting an advanced reasoning agent, refactoring a legacy codebase, or architecting a database schema, the velocity of your input sets the tempo for your intellectual throughput.\n\nPracticing regularly with varied texts strengthens both common n-gram muscle memory and dexterity with rare character combinations. Punctuation, capitalization, and numeric sequences test precision, ensuring that raw speed translates into practical real-world productivity."
  ],
  '5min': [
    "The keyboard has a storied lineage that began with mechanical typewriters in the late nineteenth century. The legendary QWERTY layout was engineered to minimize the jamming of metal typebars while allowing reasonable typing flow across opposing hands. Over decades of innovation, alternative layouts such as Dvorak and Colemak emerged, aiming to reduce finger travel distance and increase alternating hand balance. Despite alternative designs, QWERTY remains the global standard, mastered by hundreds of millions of typists worldwide.\n\nTo transcend plateaus in your typing speed, one must adopt systematic training habits. The first pillar is zero-error discipline: slowing down slightly to eliminate typos builds stronger neural pathways than rushing blindly through mistakes. When accuracy hovers consistently above ninety-eight percent, speed naturally surges forward without cognitive friction.\n\nThe second pillar is ergonomic alignment. Neutral wrist posture, relaxed shoulders, and buoyant finger curves prevent repetitive strain injury and fatigue. Paired with audible key actuation feedback, a typist enters a state of flow where the barrier between human intention and computer execution dissolves entirely."
  ],
  practice: [
    "Practice makes permanent. Focus on rhythm, smooth transitions between character pairs, and keeping your wrists slightly elevated. Don't look down at the keyboard; trust your muscle memory.",
    "Clean code is not written by luck; it is crafted through disciplined thought, rigorous refactoring, and continuous refinement. Master your tools and the tools will amplify your craft.",
    "Curiosity is the engine of intellectual discovery. Learn every day, test your limits, and celebrate the small incremental victories that accumulate over time."
  ],

  // Thematic Categories
  code: [
    "function calculateWpm(correctChars, elapsedMinutes) { if (elapsedMinutes <= 0) return 0; const netWords = correctChars / 5; return Math.round(netWords / elapsedMinutes); }",
    "const handleKeyPress = async (event) => { const { key, target } = event; if (key === 'Enter') { await submitTransaction(); } else if (key === 'Escape') { resetState(); } };",
    "import React, { useState, useEffect } from 'react'; export const useDebounce = (value, delay = 300) => { const [debounced, setDebounced] = useState(value); return debounced; };",
    "SELECT users.id, users.email, payments.amount, payments.status FROM users INNER JOIN payments ON users.id = payments.userId WHERE payments.status = 'Approved';"
  ],
  quotes: [
    "Do what you can, with what you have, where you are. Theodore Roosevelt reminded us that continuous forward momentum conquers all doubt.",
    "Simplicity is prerequisite for reliability. Edsger Dijkstra believed that elegant software stems from crystal-clear thinking and discipline.",
    "The only way to do great work is to love what you do. If you haven't found it yet, keep looking and do not settle.",
    "It always seems impossible until it is done. Perseverance transforms initial hesitation into effortless mastery."
  ],
  words: [
    "time person year way day thing man world life hand part child eye woman place work week case point government company number group problem fact idea water money",
    "system program question work night area write right study book word business issue side kind head house service friend father power hour game line member",
    "change lead community name president team minute idea kid body information back parent face others level office door health person art war history party result"
  ]
};

/**
 * Save typing test result and update user profile stats
 */
export async function saveTypingResult(req, res) {
  try {
    const userId = req.user ? String(req.user._id) : 'guest';
    const {
      wpm,
      rawWpm,
      accuracy,
      errors = 0,
      correctChars = 0,
      incorrectChars = 0,
      totalChars = 0,
      duration = 60,
      mode = '1min',
      textSnippet = ''
    } = req.body;

    if (typeof wpm !== 'number' || typeof accuracy !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid test metrics provided.'
      });
    }

    // Record the test result
    const newResult = await TypingResult.create({
      userId,
      wpm: Math.round(wpm),
      rawWpm: Math.round(rawWpm || wpm),
      accuracy: Number(accuracy.toFixed(1)),
      errors: Number(errors),
      correctChars: Number(correctChars),
      incorrectChars: Number(incorrectChars),
      totalChars: Number(totalChars),
      duration: Number(duration),
      mode,
      textSnippet: textSnippet.slice(0, 100)
    });

    let updatedStats = null;

    // If authenticated user, update aggregate statistics
    if (userId !== 'guest') {
      const user = await User.findById(userId);
      if (user) {
        const stats = user.typingStatistics || {
          testsCompleted: 0,
          totalPracticeTime: 0,
          bestWpm: 0,
          averageWpm: 0,
          bestAccuracy: 0,
          averageAccuracy: 0,
          lastWpm: 0,
        };

        const newCount = (stats.testsCompleted || 0) + 1;
        const newTotalTime = (stats.totalPracticeTime || 0) + Math.round(duration);
        const newBestWpm = Math.max(stats.bestWpm || 0, Math.round(wpm));
        const newAverageWpm = Math.round(
          ((stats.averageWpm || 0) * (stats.testsCompleted || 0) + Math.round(wpm)) / newCount
        );
        const newBestAccuracy = Math.max(stats.bestAccuracy || 0, Number(accuracy.toFixed(1)));
        const newAverageAccuracy = Number(
          (
            ((stats.averageAccuracy || 0) * (stats.testsCompleted || 0) + accuracy) / newCount
          ).toFixed(1)
        );

        updatedStats = {
          testsCompleted: newCount,
          totalPracticeTime: newTotalTime,
          bestWpm: newBestWpm,
          averageWpm: newAverageWpm,
          bestAccuracy: newBestAccuracy,
          averageAccuracy: newAverageAccuracy,
          lastWpm: Math.round(wpm)
        };

        await User.findByIdAndUpdate(userId, { typingStatistics: updatedStats });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Typing test recorded successfully!',
      result: newResult,
      updatedStats
    });
  } catch (error) {
    console.error('saveTypingResult error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record test result.'
    });
  }
}

/**
 * Get randomized typing texts by mode
 */
export async function getTypingTexts(req, res) {
  try {
    const mode = req.query.mode || '1min';
    const category = req.query.category;

    let pool = TYPING_PASSAGES[mode] || TYPING_PASSAGES['1min'];
    if (category && TYPING_PASSAGES[category]) {
      pool = TYPING_PASSAGES[category];
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedText = pool[randomIndex];

    return res.status(200).json({
      success: true,
      mode,
      category: category || 'standard',
      text: selectedText,
      totalWords: selectedText.split(/\s+/).filter(Boolean).length
    });
  } catch (error) {
    console.error('getTypingTexts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve typing text.'
    });
  }
}

/**
 * Get global leaderboard rankings
 * Supports ?mode=all|quick|1min|3min|5min
 */
export async function getLeaderboard(req, res) {
  try {
    const { mode = 'all', limit = 50 } = req.query;

    let leaderboard = [];

    if (mode === 'all') {
      const allUsers = await User.find();
      const activeTypists = allUsers
        .filter(u => u.typingStatistics && u.typingStatistics.testsCompleted > 0)
        .map(u => ({
          userId: u._id,
          name: u.name,
          role: u.role,
          subscriptionStatus: u.subscriptionStatus,
          bestWpm: u.typingStatistics?.bestWpm || 0,
          averageWpm: u.typingStatistics?.averageWpm || 0,
          bestAccuracy: u.typingStatistics?.bestAccuracy || 0,
          testsCompleted: u.typingStatistics?.testsCompleted || 0,
          totalPracticeTime: u.typingStatistics?.totalPracticeTime || 0,
          lastWpm: u.typingStatistics?.lastWpm || 0,
          avatarTheme: u.preferences?.theme || 'midnight'
        }))
        .sort((a, b) => {
          if (b.bestWpm !== a.bestWpm) return b.bestWpm - a.bestWpm;
          return b.bestAccuracy - a.bestAccuracy;
        });

      leaderboard = activeTypists.slice(0, parseInt(limit, 10));
    } else {
      const results = await TypingResult.find({ mode });
      const userBest = new Map();
      for (const r of results) {
        const id = r.userId;
        const current = userBest.get(id);
        if (!current || r.wpm > current.bestWpm) {
          userBest.set(id, {
            userId: r.userId,
            name: r.userName || 'Anonymous Typist',
            bestWpm: r.wpm,
            bestAccuracy: r.accuracy,
            mode: r.mode,
            createdAt: r.createdAt
          });
        }
      }
      leaderboard = Array.from(userBest.values())
        .sort((a, b) => b.bestWpm - a.bestWpm)
        .slice(0, parseInt(limit, 10));
    }

    const rankedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    const topThree = {
      gold: rankedLeaderboard[0] || null,
      silver: rankedLeaderboard[1] || null,
      bronze: rankedLeaderboard[2] || null,
    };

    return res.status(200).json({
      success: true,
      mode,
      topThree,
      rankings: rankedLeaderboard,
      totalParticipants: rankedLeaderboard.length
    });
  } catch (error) {
    console.error('getLeaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard rankings.'
    });
  }
}

