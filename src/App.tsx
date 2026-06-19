import { useState } from 'react';
import { ModeSelect } from './features/mode-select/ModeSelect';
import { QuickApp } from './features/quick/QuickApp';
import { RoomPlaceholder } from './features/room/RoomPlaceholder';

type Screen = 'home' | 'quick' | 'room';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  if (screen === 'quick') return <QuickApp onExit={() => setScreen('home')} />;
  if (screen === 'room') return <RoomPlaceholder onExit={() => setScreen('home')} />;
  return <ModeSelect onPick={setScreen} />;
}
