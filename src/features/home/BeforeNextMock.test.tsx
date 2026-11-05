import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ImprovementPoint } from '../../types/models';
import { BeforeNextMock } from './BeforeNextMock';

const makePoint = (overrides: Partial<ImprovementPoint>): ImprovementPoint => ({
  id: 'p',
  text: 'Went quiet when stuck',
  category: 'Communication',
  status: 'open',
  sessionIds: ['s1'],
  createdAt: '2026-10-16T01:00:00.000Z',
  ...overrides,
});

const points: ImprovementPoint[] = [
  makePoint({
    id: 'p1',
    text: 'Went quiet when stuck',
    category: 'Communication',
    createdAt: '2026-10-15T01:00:00.000Z',
  }),
  makePoint({
    id: 'p2',
    text: 'Jumped into code without clarifying input',
    category: 'Problem solving',
    sessionIds: ['s1', 's2', 's3'],
    practiceAction: 'Ask 2 clarifying questions before typing',
    createdAt: '2026-10-01T01:00:00.000Z',
  }),
  makePoint({
    id: 'p3',
    text: 'Ran out of time before testing',
    category: 'Time management',
    status: 'resolved',
    sessionIds: ['s1', 's2', 's3', 's4'],
    resolvedAt: '2026-10-17T01:00:00.000Z',
  }),
  makePoint({
    id: 'p4',
    text: 'Skipped edge cases',
    category: 'Testing',
    createdAt: '2026-10-18T01:00:00.000Z',
  }),
];

const pointTitles = () =>
  within(screen.getByRole('list'))
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent);

describe('BeforeNextMock', () => {
  it('"Shows only open points"', () => {
    render(<BeforeNextMock points={points} />);
    expect(screen.getByRole('heading', { name: 'Before my next mock' })).toBeInTheDocument();
    expect(screen.queryByText('Ran out of time before testing')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('"Sorted by number of sessions the point came up in (heard N times), then newest first"', () => {
    render(<BeforeNextMock points={points} />);
    expect(pointTitles()).toEqual([
      'Jumped into code without clarifying input',
      'Skipped edge cases',
      'Went quiet when stuck',
    ]);
    expect(screen.getByText('heard 3 times')).toBeInTheDocument();
    expect(screen.queryByText(/heard 1 times?/)).not.toBeInTheDocument();
  });

  it('"Each point shows its category and practice plan (if any)"', () => {
    render(<BeforeNextMock points={points} />);
    const [first, second] = screen.getAllByRole('listitem');
    expect(within(first!).getByText('Problem solving')).toBeInTheDocument();
    expect(
      within(first!).getByText('Ask 2 clarifying questions before typing'),
    ).toBeInTheDocument();
    expect(within(second!).getByText('Testing')).toBeInTheDocument();
    expect(within(second!).queryByText(/How I'll practice/)).not.toBeInTheDocument();
  });

  it('shows "+ Add a plan" for points without a plan and reports which point was clicked', async () => {
    const handleAddPlan = vi.fn();
    render(<BeforeNextMock points={points} onAddPlan={handleAddPlan} />);
    const addButtons = screen.getAllByRole('button', { name: '+ Add a plan' });
    expect(addButtons).toHaveLength(2);
    await userEvent.click(addButtons[0]!);
    expect(handleAddPlan).toHaveBeenCalledWith('p4');
  });

  it('"Empty state explains how to log the first mock" when there are no points', () => {
    render(<BeforeNextMock points={[]} />);
    expect(screen.getByText('No open points. Log your first mock →')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows the empty state when every point is resolved, with a button that opens Log', async () => {
    const handleLogMock = vi.fn();
    render(<BeforeNextMock points={[points[2]!]} onLogMock={handleLogMock} />);
    expect(screen.getByText('No open points.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /log your first mock/i }));
    expect(handleLogMock).toHaveBeenCalledTimes(1);
  });

  it('shows a loading state', () => {
    render(<BeforeNextMock points={points} isLoading />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading your points…');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows an error state', () => {
    render(<BeforeNextMock points={points} error="Couldn't load your saved points." />);
    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load your saved points.");
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('keeps mixed Chinese/English point text intact', () => {
    render(<BeforeNextMock points={[makePoint({ id: 'zh', text: '没问清楚 input 就开始写' })]} />);
    expect(screen.getByText('没问清楚 input 就开始写')).toBeInTheDocument();
  });
});
