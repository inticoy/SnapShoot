'use client';

import { IndexPage } from './components/IndexPage';
import { LevelGroupPage } from './components/LevelGroupPage';
import { useHashRouter } from './hooks/useHashRouter';
import { groupLevelsByPrefix } from './lib/utils';
import { DIFFICULTY_LEVELS } from '../../src/config/Difficulty';

export default function AdminPage() {
  const { route, navigate } = useHashRouter();
  const groups = groupLevelsByPrefix(DIFFICULTY_LEVELS);

  // Index page
  if (!route || route === '' || route === '/') {
    return (
      <IndexPage
        levels={DIFFICULTY_LEVELS}
        onNavigate={(prefix) => navigate(prefix)}
      />
    );
  }

  // Level group page
  const levels = groups.get(route);
  if (levels) {
    return (
      <LevelGroupPage
        groupId={route}
        levels={levels}
        onBack={() => navigate('')}
      />
    );
  }

  // 404 - redirect to index
  return (
    <IndexPage
      levels={DIFFICULTY_LEVELS}
      onNavigate={(prefix) => navigate(prefix)}
    />
  );
}
