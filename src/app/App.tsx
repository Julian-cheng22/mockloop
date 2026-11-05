import { BeforeNextMock } from '../features/home/BeforeNextMock';
import { useMockLoopStore } from './useMockLoopStore';

export default function App() {
  const { points } = useMockLoopStore();

  return (
    <div className="mx-auto min-h-screen max-w-screen-sm px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">MockLoop</h1>
        <p className="text-sm text-slate-600">Remember your mock-interview feedback.</p>
      </header>
      <main>
        {/* TODO(#4): wire up onLogFirstMock to the Log tab once it exists */}
        <BeforeNextMock points={points} />
      </main>
    </div>
  );
}
