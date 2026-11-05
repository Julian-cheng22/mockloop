import { render, screen } from '@testing-library/react';
import { saveData } from '../lib/storage';
import App from './App';

describe('App', () => {
  it('renders the MockLoop heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'MockLoop' })).toBeInTheDocument();
  });

  it('shows the "Before my next mock" home screen by default', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Before my next mock' })).toBeInTheDocument();
    expect(screen.getByText('No open points. Log your first mock →')).toBeInTheDocument();
  });

  it('shows open points saved in storage on first render, with no loading state', () => {
    saveData({
      sessions: [],
      points: [
        {
          id: 'p1',
          text: 'Went quiet when stuck',
          category: 'Communication',
          status: 'open',
          sessionIds: ['s1', 's2'],
          createdAt: '2026-10-16T01:00:00.000Z',
        },
      ],
    });
    render(<App />);
    expect(screen.getByText('Went quiet when stuck')).toBeInTheDocument();
    expect(screen.getByText('heard 2 times')).toBeInTheDocument();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
