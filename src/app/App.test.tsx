import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the MockLoop heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'MockLoop' })).toBeInTheDocument();
  });
});
