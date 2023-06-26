import { render, screen } from '@testing-library/react';
import React from 'react';
import { Editor } from './Editor';

test('renders learn react link', () => {
  render(<Editor />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
