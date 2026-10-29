import { format, subDays } from 'date-fns';
import { Habit, HabitCompletion, Note } from '../types';
import { formatDateKey } from './date';

export function getInitialDemoHabits(): Habit[] {
  const todayKey = formatDateKey(new Date());
  const twoWeeksAgo = formatDateKey(subDays(new Date(), 21));

  return [
    {
      id: 'demo_habit_1',
      userId: 'demo_commander',
      title: 'Deep Focus Coding Sprint',
      description: 'Intense uninterrupted engineering and problem solving session',
      category: 'Projects',
      icon: 'code',
      color: '#7C5CFC',
      frequency: 'daily',
      selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
      habitType: 'binary',
      targetValue: 1,
      unit: 'times',
      startDate: twoWeeksAgo,
      reminderEnabled: true,
      reminderTime: '10:00',
      isArchived: false,
      isPaused: false,
      order: 1,
      createdAt: twoWeeksAgo,
      updatedAt: todayKey,
    },
    {
      id: 'demo_habit_2',
      userId: 'demo_commander',
      title: 'Read Architecture & Strategy Book',
      description: 'System design, engineering books, and mental model refinement',
      category: 'Learning',
      icon: 'book',
      color: '#36C5F0',
      frequency: 'daily',
      selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
      habitType: 'binary',
      targetValue: 1,
      unit: 'times',
      startDate: twoWeeksAgo,
      reminderEnabled: true,
      reminderTime: '21:00',
      isArchived: false,
      isPaused: false,
      order: 2,
      createdAt: twoWeeksAgo,
      updatedAt: todayKey,
    },
    {
      id: 'demo_habit_3',
      userId: 'demo_commander',
      title: 'Strength Training & Calisthenics',
      description: 'Calisthenics, kettlebell training, and active mobility',
      category: 'Fitness',
      icon: 'dumbbell',
      color: '#35D49A',
      frequency: 'custom_days',
      selectedWeekdays: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
      habitType: 'binary',
      targetValue: 1,
      unit: 'times',
      startDate: twoWeeksAgo,
      reminderEnabled: false,
      isArchived: false,
      isPaused: false,
      order: 3,
      createdAt: twoWeeksAgo,
      updatedAt: todayKey,
    },
    {
      id: 'demo_habit_4',
      userId: 'demo_commander',
      title: 'Morning Electrolytes & Hydration',
      description: '750ml water with sea salt and minerals on waking',
      category: 'Health',
      icon: 'droplets',
      color: '#FFB454',
      frequency: 'daily',
      selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
      habitType: 'binary',
      targetValue: 1,
      unit: 'times',
      startDate: twoWeeksAgo,
      reminderEnabled: true,
      reminderTime: '07:30',
      isArchived: false,
      isPaused: false,
      order: 4,
      createdAt: twoWeeksAgo,
      updatedAt: todayKey,
    },
    {
      id: 'demo_habit_5',
      userId: 'demo_commander',
      title: 'Ship Content / Engineering Log',
      description: 'Publish code commit recap, blog log, or short video insight',
      category: 'Content Creation',
      icon: 'video',
      color: '#F43F5E',
      frequency: 'custom_days',
      selectedWeekdays: [2, 4, 0], // Tue, Thu, Sun
      habitType: 'binary',
      targetValue: 1,
      unit: 'times',
      startDate: twoWeeksAgo,
      reminderEnabled: false,
      isArchived: false,
      isPaused: false,
      order: 5,
      createdAt: twoWeeksAgo,
      updatedAt: todayKey,
    },
  ];
}

export function getInitialDemoCompletions(): HabitCompletion[] {
  const completions: HabitCompletion[] = [];
  const now = new Date();

  // Populate last 14 days of history
  for (let i = 0; i <= 14; i++) {
    const day = subDays(now, i);
    const dateKey = formatDateKey(day);
    const dayOfWeek = day.getDay();

    // Habit 1 (Coding): completed on most days (streak active for last 7 days!)
    if (i <= 6 || i === 8 || i === 9 || i === 11 || i === 12) {
      completions.push({
        id: `demo_habit_1_${dateKey}`,
        userId: 'demo_commander',
        habitId: 'demo_habit_1',
        dateKey,
        status: 'completed',
        progressValue: 45,
        targetValue: 45,
        completedAt: `${dateKey}T11:30:00Z`,
        createdAt: `${dateKey}T11:30:00Z`,
        updatedAt: `${dateKey}T11:30:00Z`,
      });
    }

    // Habit 2 (Reading): active streak for last 5 days
    if (i <= 5 || i === 7 || i === 10 || i === 13) {
      completions.push({
        id: `demo_habit_2_${dateKey}`,
        userId: 'demo_commander',
        habitId: 'demo_habit_2',
        dateKey,
        status: 'completed',
        progressValue: 15,
        targetValue: 15,
        completedAt: `${dateKey}T21:45:00Z`,
        createdAt: `${dateKey}T21:45:00Z`,
        updatedAt: `${dateKey}T21:45:00Z`,
      });
    }

    // Habit 3 (Fitness): Mon(1), Wed(3), Fri(5), Sat(6)
    if ([1, 3, 5, 6].includes(dayOfWeek) && i <= 10) {
      completions.push({
        id: `demo_habit_3_${dateKey}`,
        userId: 'demo_commander',
        habitId: 'demo_habit_3',
        dateKey,
        status: 'completed',
        progressValue: 35,
        targetValue: 35,
        completedAt: `${dateKey}T17:20:00Z`,
        createdAt: `${dateKey}T17:20:00Z`,
        updatedAt: `${dateKey}T17:20:00Z`,
      });
    }

    // Habit 4 (Hydration): completed daily
    if (i <= 9) {
      completions.push({
        id: `demo_habit_4_${dateKey}`,
        userId: 'demo_commander',
        habitId: 'demo_habit_4',
        dateKey,
        status: 'completed',
        progressValue: 1,
        targetValue: 1,
        completedAt: `${dateKey}T07:45:00Z`,
        createdAt: `${dateKey}T07:45:00Z`,
        updatedAt: `${dateKey}T07:45:00Z`,
      });
    }

    // Habit 5 (Content): Tue(2), Thu(4), Sun(0)
    if ([2, 4, 0].includes(dayOfWeek) && i <= 7) {
      completions.push({
        id: `demo_habit_5_${dateKey}`,
        userId: 'demo_commander',
        habitId: 'demo_habit_5',
        dateKey,
        status: 'completed',
        progressValue: 1,
        targetValue: 1,
        completedAt: `${dateKey}T19:00:00Z`,
        createdAt: `${dateKey}T19:00:00Z`,
        updatedAt: `${dateKey}T19:00:00Z`,
      });
    }
  }

  return completions;
}

export function getInitialDemoNotes(): Note[] {
  const todayKey = formatDateKey(new Date());
  const yesterdayKey = formatDateKey(subDays(new Date(), 1));

  return [
    {
      id: 'demo_note_1',
      userId: 'demo_commander',
      title: `Daily Review — ${todayKey}`,
      category: 'reflection',
      dateKey: todayKey,
      content:
        '1. Completed: Finished 45m deep focus sprint on HabitFlow offline sync.\n2. Learned: Zero-pill typographic discipline creates far cleaner visual hierarchy.\n3. Wins: Maintained 7-day coding streak and hit workout target.\n4. Distractions: Checked notifications twice before 11am.\n5. Tomorrow Priority: Deploy final Firestore ABAC rules validation.',
      tags: ['daily-review', 'reflection', 'velocity'],
      reviewAnswers: {
        completedToday: 'Finished 45m deep focus sprint on HabitFlow offline sync.',
        learnedToday: 'Zero-pill typographic discipline creates far cleaner visual hierarchy.',
        wentWell: 'Maintained 7-day coding streak and hit workout target.',
        distractedBy: 'Checked notifications twice before 11am.',
        tomorrowPriority: 'Deploy final Firestore ABAC rules validation.',
      },
      createdAt: `${todayKey}T20:00:00Z`,
      updatedAt: `${todayKey}T20:00:00Z`,
    },
    {
      id: 'demo_note_2',
      userId: 'demo_commander',
      title: 'High-Leverage Engineering Systems',
      category: 'tech_note',
      dateKey: yesterdayKey,
      content:
        'When designing state-heavy interfaces, keep single source of truth for computed stats. Use date-fns for timezone-safe boundaries, and ensure mobile hitboxes never fall below 44x44px.',
      tags: ['architecture', 'engineering', 'frontend'],
      createdAt: `${yesterdayKey}T15:30:00Z`,
      updatedAt: `${yesterdayKey}T15:30:00Z`,
    },
  ];
}

export function getInitialDemoTasks(): import('../types').Task[] {
  const todayKey = formatDateKey(new Date());
  const tomorrowKey = formatDateKey(new Date(Date.now() + 86400000));
  const yesterdayKey = formatDateKey(subDays(new Date(), 1));

  return [
    {
      id: 'demo_task_1',
      userId: 'demo_commander',
      title: 'Review weekly habit telemetry & analytics report',
      description: 'Analyze correlation between morning workout and deep focus hours.',
      priority: 'urgent',
      dueDate: todayKey,
      dueTime: '17:00',
      category: 'Projects',
      completed: false,
      tags: ['telemetry', 'analytics', 'weekly-sync'],
      subtasks: [
        { id: 'sub_1_1', title: 'Check completion rates on weekend habits', completed: true },
        { id: 'sub_1_2', title: 'Audit missed streaks in calendar view', completed: false },
        { id: 'sub_1_3', title: 'Export backup report', completed: false },
      ],
      createdAt: `${yesterdayKey}T09:00:00Z`,
      updatedAt: `${todayKey}T08:00:00Z`,
    },
    {
      id: 'demo_task_2',
      userId: 'demo_commander',
      title: 'Complete chapter notes on System Design & Distributed Caches',
      description: 'Summarize read-through and cache-invalidation strategies.',
      priority: 'high',
      dueDate: todayKey,
      dueTime: '21:30',
      category: 'Learning',
      completed: false,
      tags: ['architecture', 'reading'],
      subtasks: [
        { id: 'sub_2_1', title: 'Draft key diagrams in daily note', completed: true },
        { id: 'sub_2_2', title: 'Review flashcards on Raft consensus', completed: false },
      ],
      createdAt: `${yesterdayKey}T10:00:00Z`,
      updatedAt: `${todayKey}T10:00:00Z`,
    },
    {
      id: 'demo_task_3',
      userId: 'demo_commander',
      title: 'Deploy updated PWA Service Worker manifest',
      description: 'Verify offline caching headers and install prompt banners.',
      priority: 'medium',
      dueDate: tomorrowKey,
      category: 'Projects',
      completed: false,
      tags: ['pwa', 'frontend', 'vite'],
      subtasks: [],
      createdAt: `${todayKey}T11:00:00Z`,
      updatedAt: `${todayKey}T11:00:00Z`,
    },
    {
      id: 'demo_task_4',
      userId: 'demo_commander',
      title: 'Prepare protein smoothie & post-workout hydration',
      description: 'Electrolyte blend with collagen and BCAAs.',
      priority: 'low',
      dueDate: todayKey,
      category: 'Fitness',
      completed: true,
      completedAt: `${todayKey}T08:30:00Z`,
      tags: ['nutrition', 'recovery'],
      subtasks: [],
      createdAt: `${todayKey}T07:00:00Z`,
      updatedAt: `${todayKey}T08:30:00Z`,
    },
    {
      id: 'demo_task_5',
      userId: 'demo_commander',
      title: 'Sync with design team on dark mode contrast tokens',
      description: 'Ensure #080B12 background passes AAA contrast standards.',
      priority: 'medium',
      dueDate: tomorrowKey,
      category: 'Freelancing',
      completed: false,
      tags: ['ui', 'tokens', 'a11y'],
      subtasks: [],
      createdAt: `${todayKey}T12:00:00Z`,
      updatedAt: `${todayKey}T12:00:00Z`,
    },
  ];
}

