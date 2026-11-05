import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ImprovementPoint } from '../../types/models';
import { BeforeNextMock } from './BeforeNextMock';

const makePoint = (overrides: Partial<ImprovementPoint> & { id: string }): ImprovementPoint => ({
  text: `Point ${overrides.id}`,
  category: 'Communication',
  status: 'open',
  sessionIds: ['s1'],
  createdAt: '2026-10-10T12:00:00.000Z',
  ...overrides,
});

const pointTexts = () => screen.getAllByRole('listitem').map((item) => item.textContent ?? '');

describe('BeforeNextMock', () => {
  it('shows only open points', () => {
    render(
      <BeforeNextMock
        points={[
          makePoint({ id: 'a', text: 'Went quiet when stuck' }),
          makePoint({
            id: 'b',
            text: 'Forgot edge cases',
            status: 'resolved',
            resolvedAt: '2026-10-12T12:00:00.000Z',
          }),
        ]}
      />,
    );
    expect(screen.getByText('Went quiet when stuck')).toBeInTheDocument();
    expect(screen.queryByText('Forgot edge cases')).not.toBeInTheDocument();
  });

  it('sorted by number of sessions the point came up in ("heard N times"), then newest first', () => {
    render(
      <BeforeNextMock
        points={[
          makePoint({ id: 'old', text: 'Old once', createdAt: '2026-10-01T12:00:00.000Z' }),
          makePoint({ id: 'rep', text: 'Jumped into code', sessionIds: ['s1', 's2', 's3'] }),
          makePoint({ id: 'new', text: 'New once', createdAt: '2026-10-15T12:00:00.000Z' }),
        ]}
      />,
    );
    const items = pointTexts();
    expect(items[0]).toContain('Jumped into code');
    expect(items[0]).toContain('heard 3 times');
    expect(items[1]).toContain('New once');
    expect(items[2]).toContain('Old once');
  });

  it('shows "heard N times" only when N ≥ 2, counting unique sessions', () => {
    render(
      <BeforeNextMock
        points={[
          makePoint({ id: 'a', text: 'Twice with dupes', sessionIds: ['s1', 's1', 's2'] }),
          makePoint({ id: 'b', text: 'Once' }),
        ]}
      />,
    );
    expect(screen.getByText('heard 2 times')).toBeInTheDocument();
    expect(screen.queryByText(/heard 1 time/)).not.toBeInTheDocument();
    expect(screen.queryByText(/heard 3 times/)).not.toBeInTheDocument();
  });

  it('each point shows its category and practice plan (if any)', () => {
    render(
      <BeforeNextMock
        points={[
          makePoint({
            id: 'a',
            text: 'Jumped into code',
            category: 'Problem solving',
            practiceAction: 'Ask 2 clarifying questions before coding',
            sessionIds: ['s1', 's2'],
          }),
          makePoint({ id: 'b', text: 'Ran out of time', category: 'Time management' }),
        ]}
      />,
    );
    const [first, second] = screen.getAllByRole('listitem');
    expect(within(first!).getByText('Problem solving')).toBeInTheDocument();
    expect(
      within(first!).getByText('Ask 2 clarifying questions before coding'),
    ).toBeInTheDocument();
    expect(within(first!).queryByText('+ Add a plan')).not.toBeInTheDocument();
    expect(within(second!).getByText('Time management')).toBeInTheDocument();
    expect(within(second!).getByText('+ Add a plan')).toBeInTheDocument();
  });

  it('points without a plan show "+ Add a plan", which calls onAddPlan when wired up', async () => {
    const onAddPlan = vi.fn();
    render(<BeforeNextMock points={[makePoint({ id: 'p1' })]} onAddPlan={onAddPlan} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Add a plan' }));
    expect(onAddPlan).toHaveBeenCalledWith('p1');
  });

  it('empty state explains how to log the first mock', () => {
    render(<BeforeNextMock points={[]} />);
    expect(screen.getByText('No open points. Log your first mock →')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('empty state is shown when every point is resolved', () => {
    render(<BeforeNextMock points={[makePoint({ id: 'a', status: 'resolved' })]} />);
    expect(screen.getByText('No open points. Log your first mock →')).toBeInTheDocument();
  });

  it('empty state link calls onLogFirstMock when wired up', async () => {
    const onLogFirstMock = vi.fn();
    render(<BeforeNextMock points={[]} onLogFirstMock={onLogFirstMock} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'No open points. Log your first mock →' }),
    );
    expect(onLogFirstMock).toHaveBeenCalledTimes(1);
  });
});
