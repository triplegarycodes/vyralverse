// Step 26: Seed helper to populate demo content for Vyral Verse
import { CoreMessagesRepo } from './repos/coreMessagesRepo';
import { LyfeLessonsRepo } from './repos/lyfeLessonsRepo';
import { ZonePostsRepo } from './repos/zonePostsRepo';
import { TreeNodesRepo } from './repos/treeNodesRepo';
import { SkrybeNotesRepo } from './repos/skrybeNotesRepo';

export const seed = async (): Promise<void> => {
  await CoreMessagesRepo.add({
    channel: 'core',
    author: 'Neo',
    content: 'Welcome to Vyral Verse — ignite your neon flow.',
    avatar: 'neo',
    created_at: Date.now()
  });

  const lesson = await LyfeLessonsRepo.add({
    topic: 'Neon Habits 101',
    outline: JSON.stringify(['Prime your focus', 'Track micro wins', 'Celebrate streaks']),
    created_at: Date.now()
  });

  await LyfeLessonsRepo.upsertProgress({
    lesson_id: lesson.id ?? 0,
    status: 'in-progress',
    xp: 120,
    completed_at: null
  });

  await ZonePostsRepo.add({
    author: 'V Team',
    body: 'Drop your latest momentum move in the Zone.',
    pinned: 1,
    reactions: 7,
    created_at: Date.now()
  });

  await TreeNodesRepo.add({
    parent_id: null,
    title: 'Foundational Flow',
    hint: 'Calibrate your daily rhythm.',
    created_at: Date.now()
  });

  await SkrybeNotesRepo.add({
    title: 'Manifesto Draft',
    body: 'Sketch the Vyral principles in three pulses.',
    word_count: 12,
    updated_at: Date.now()
  });
};
