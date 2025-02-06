import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // for additional matchers like .toBeInTheDocument()
import Header from './components/Header/Header.js'; // adjust path as needed

test('renders Header with Home and Create Application links, and a Log In button', () => {
  render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
  // Check that the "Home" link is in the document
  expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();

  // Check that the "Create Application" link is in the document
  expect(screen.getByRole('link', { name: /create application/i })).toBeInTheDocument();

  // Check that the "Log In" button is in the document
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});
