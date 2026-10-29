import { useEffect, useState } from 'react';
import { Habit } from '../types';
import { isHabitScheduledOnDate } from '../utils/date';

export interface ActiveReminder {
  habitId: string;
  habitTitle: string;
  reminderTime: string;
  category: string;
  color: string;
}

export function useReminders(habits: Habit[], inAppEnabled: boolean = true) {
  const [activeNotification, setActiveNotification] = useState<ActiveReminder | null>(null);
  const [notifiedSet] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!inAppEnabled) return;

    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateKey = now.toISOString().slice(0, 10);

      const scheduledWithReminders = habits.filter(
        (h) => !h.isArchived && !h.isPaused && h.reminderEnabled && h.reminderTime && isHabitScheduledOnDate(h, now)
      );

      for (const habit of scheduledWithReminders) {
        const reminderKey = `${habit.id}_${todayDateKey}_${habit.reminderTime}`;
        if (habit.reminderTime === currentTimeStr && !notifiedSet.has(reminderKey)) {
          notifiedSet.add(reminderKey);

          // Show in-app banner
          setActiveNotification({
            habitId: habit.id,
            habitTitle: habit.title,
            reminderTime: habit.reminderTime,
            category: habit.category,
            color: habit.color,
          });

          // Also trigger Web Notification if granted
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`HabitFlow: Time for ${habit.title}`, {
                body: `Scheduled reminder at ${habit.reminderTime} for category ${habit.category}.`,
                icon: '/icon.svg',
              });
            } catch {
              // Ignore web notification failure
            }
          }
          break;
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkInterval);
  }, [habits, inAppEnabled, notifiedSet]);

  const dismissNotification = () => {
    setActiveNotification(null);
  };

  return {
    activeNotification,
    dismissNotification,
  };
}
