// src/components/Footer/Footer.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer/Footer';

test('renders the footer with correct text', () => {
  render(<Footer />);
  
  
  // 方案 2: 更推荐的 getByRole + toHaveTextContent
  expect(screen.getByRole('contentinfo')).toHaveTextContent("© 2025 FormFlow. All rights reserved.");
});
