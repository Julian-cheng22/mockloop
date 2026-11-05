import { useState } from 'react';
import { HomeScreen } from '../features/home/HomeScreen';
import { loadPoints } from '../lib/storage';

export default function App() {
  const [points] = useState(loadPoints);

  return (
    <div className="mx-auto min-h-screen max-w-screen-sm px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">MockLoop</h1>
        <p className="text-sm text-slate-600">Remember your mock-interview feedback.</p>
      </header>
      <main>
        <HomeScreen points={points} />
      </main>
    </div>
  );
}
