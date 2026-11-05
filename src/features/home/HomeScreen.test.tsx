import { render, screen, within } from '@testing-library/react';
import type { ImprovementPoint } from '../../types/models';
import { HomeScreen } from './HomeScreen';

const makePoint = (overrides: Partial<ImprovementPoint> & { id: string }): ImprovementPoint => ({
  text: `Point ${overrides.id}`,
  category: 'Communication',
  status: 'open',
  sessionIds: ['s1'],
  createdAt: '2026-10-01T12:00:00.000Z',
  ...overrides,
});

describe('HomeScreen', () => {
  it('shows the empty state when there are no points', () => {
    render(<HomeScreen points={[]} />);
    expect(screen.getByRole('heading', { name: 'Before my next mock' })).toBeInTheDocument();
    expect(screen.getByText('No open points yet.')).toBeInTheDocument();
    expect(screen.getByText(/log it: paste your notes/i)).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows the empty state when every point is resolved', () => {
    render(
      <HomeScreen
        points={[
          makePoint({ id: 'p1', status: 'resolved', resolvedAt: '2026-10-02T12:00:00.000Z' }),
        ]}
      />,
    );
    expect(screen.getByText('No open points yet.')).toBeInTheDocument();
  });

  it('lists only open points, most repeated first', () => {
    render(
      <HomeScreen
        points={[
          makePoint({ id: 'p1', text: 'Went quiet when stuck', sessionIds: ['s1'] }),
          makePoint({
            id: 'p2',
            text: 'Jumped into code without clarifying',
            category: 'Problem solving',
            sessionIds: ['s1', 's2', 's3'],
          }),
          makePoint({
            id: 'p3',
            text: 'Forgot edge cases',
            status: 'resolved',
            sessionIds: ['s1', 's2', 's3', 's4'],
            resolvedAt: '2026-10-05T12:00:00.000Z',
          }),
        ]}
      />,
    );

    const items = within(
      screen.getByRole('list', { name: 'Open improvement points' }),
    ).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Jumped into code without clarifying');
    expect(items[0]).toHaveTextContent('Heard 3 times');
    expect(items[0]).toHaveTextContent('Problem solving');
    expect(items[1]).toHaveTextContent('Went quiet when stuck');
    expect(items[1]).toHaveTextContent('Heard once');
    expect(screen.queryByText('Forgot edge cases')).not.toBeInTheDocument();
    expect(screen.getByText('2 open points to keep in mind')).toBeInTheDocument();
  });

  it('shows the practice plan when there is one', () => {
    render(
      <HomeScreen
        points={[
          makePoint({
            id: 'p1',
            text: 'Went quiet when stuck',
            practiceAction: 'Narrate every step',
          }),
          makePoint({ id: 'p2', text: 'Ran out of time', practiceAction: '   ' }),
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    const withPlan = items.find((li) => li.textContent?.includes('Went quiet when stuck'));
    const withoutPlan = items.find((li) => li.textContent?.includes('Ran out of time'));
    expect(withPlan).toHaveTextContent("How I'll practice: Narrate every step");
    expect(withoutPlan).not.toHaveTextContent("How I'll practice");
  });
});
