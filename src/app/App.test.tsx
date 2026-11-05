import { render, screen } from '@testing-library/react';
import { STORAGE_KEY, saveData } from '../lib/storage';
import App from './App';

describe('App', () => {
  it('renders the MockLoop heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'MockLoop' })).toBeInTheDocument();
  });

  it('shows the home screen empty state when nothing is stored', async () => {
    render(<App />);
    expect(await screen.findByText('No open points. Log your first mock →')).toBeInTheDocument();
  });

  it('shows open points saved in localStorage on the home screen', async () => {
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
    expect(await screen.findByText('Went quiet when stuck')).toBeInTheDocument();
    expect(screen.getByText('heard 2 times')).toBeInTheDocument();
  });

  it('falls back to the empty state on corrupted storage instead of crashing', async () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    render(<App />);
    expect(await screen.findByText('No open points. Log your first mock →')).toBeInTheDocument();
  });
});
