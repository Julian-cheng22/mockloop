import { BeforeNextMock } from '../features/home/BeforeNextMock';
import { useMockLoopStore } from './useMockLoopStore';

export default function App() {
  const { data, isLoading, error } = useMockLoopStore();

  return (
    <div className="mx-auto min-h-screen max-w-screen-sm overflow-x-hidden bg-slate-50 px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">MockLoop</h1>
        <p className="text-sm text-slate-600">Remember your mock-interview feedback.</p>
      </header>
      <main>
        {/* TabBar, the Log tab (empty-state link) and "+ Add a plan" are wired up in their own issues. */}
        <BeforeNextMock points={data.points} isLoading={isLoading} error={error} />
      </main>
    </div>
  );
}
