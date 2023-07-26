import { render, screen } from '@testing-library/react';
import React from 'react';
import { Editor } from './Editor';

xtest('renders learn react link', () => {
  render(<></>);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
