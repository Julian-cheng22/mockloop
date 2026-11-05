import { render, screen } from '@testing-library/react';
import type { ImprovementPoint } from '../types/models';
import { saveData } from '../lib/storage';
import App from './App';

describe('App', () => {
  it('renders the MockLoop heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'MockLoop' })).toBeInTheDocument();
  });

  it('shows the home screen empty state when nothing is stored', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Before my next mock' })).toBeInTheDocument();
    expect(screen.getByText('No open points yet.')).toBeInTheDocument();
  });

  it('shows open points loaded from storage', () => {
    const point: ImprovementPoint = {
      id: 'p1',
      text: 'Jumped into code without clarifying input',
      category: 'Problem solving',
      status: 'open',
      sessionIds: ['s1', 's2'],
      createdAt: '2026-10-16T01:00:00.000Z',
    };
    saveData({ sessions: [], points: [point] });
    render(<App />);
    expect(screen.getByText('Jumped into code without clarifying input')).toBeInTheDocument();
    expect(screen.getByText('Heard 2 times')).toBeInTheDocument();
  });
});
