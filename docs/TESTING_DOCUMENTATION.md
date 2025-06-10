# 🧪 Testing Documentation

## Overview

This document provides comprehensive testing documentation for the Elevatr Career Success Tracker application, including testing strategies, procedures, and guidelines.

## Testing Strategy

### Testing Pyramid

```
                    E2E Tests
                 (User Workflows)
                      /\
                     /  \
                    /    \
                   /      \
              Integration Tests
             (Service Layer)
                  /\
                 /  \
                /    \
               /      \
              /        \
            Unit Tests
        (Components & Utils)
```

### Testing Levels

1. **Unit Tests**: Individual components and functions
2. **Integration Tests**: Service layer and API interactions
3. **End-to-End Tests**: Complete user workflows
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Authentication and authorization
6. **Accessibility Tests**: WCAG compliance

## Test Environment Setup

### Prerequisites
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event cypress
npm install --save-dev @types/jest eslint-plugin-testing-library
```

### Jest Configuration
Create `jest.config.js`:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));
```

### Cypress Configuration
Create `cypress.config.ts`:
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
});
```

## Unit Testing

### Component Testing

#### Example: Button Component Test
```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

#### Example: ActiveSprint Component Test
```typescript
// src/components/dashboard/__tests__/ActiveSprint.test.tsx
import { render, screen } from '@testing-library/react';
import { ActiveSprint } from '../ActiveSprint';
import { Sprint, UserProgress } from '@/types';

const mockSprint: Sprint = {
  id: 'sprint-1',
  userId: 'user-1',
  title: 'Test Sprint',
  description: 'Test Description',
  duration: 15,
  startDate: '2025-06-01',
  endDate: '2025-06-15',
  days: [
    {
      day: 'Day 1',
      date: '2025-06-01',
      coreTasks: [
        { category: 'Learning', description: 'Complete course' },
        { category: 'Networking', description: 'Connect with mentor' }
      ],
      specialTasks: ['Review progress']
    }
  ],
  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2025-06-01T00:00:00Z'
};

const mockUserProgress: UserProgress = {
  userId: 'user-1',
  sprintId: 'sprint-1',
  taskStatuses: [
    {
      dayId: 'Day 1',
      taskType: 'core',
      taskIndex: 0,
      completed: true,
      completedAt: '2025-06-01T10:00:00Z',
      updatedAt: new Date()
    }
  ],
  journalEntries: [],
  streaks: {
    currentTaskStreak: 1,
    longestTaskStreak: 1,
    currentJournalStreak: 0,
    longestJournalStreak: 0
  },
  stats: {
    totalTasksCompleted: 1,
    totalDaysCompleted: 0,
    completionPercentage: 33.33
  }
};

describe('ActiveSprint Component', () => {
  it('displays sprint title', () => {
    render(<ActiveSprint sprint={mockSprint} userProgress={mockUserProgress} />);
    expect(screen.getByText('Active Sprint: Test Sprint')).toBeInTheDocument();
  });

  it('shows correct task completion count', () => {
    render(<ActiveSprint sprint={mockSprint} userProgress={mockUserProgress} />);
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('displays progress percentage', () => {
    render(<ActiveSprint sprint={mockSprint} userProgress={mockUserProgress} />);
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('shows no active sprint message when sprint is null', () => {
    render(<ActiveSprint sprint={null} userProgress={null} />);
    expect(screen.getByText('No active sprint found.')).toBeInTheDocument();
  });
});
```

### Utility Function Testing

#### Example: Progress Calculation Test
```typescript
// src/lib/__tests__/utils.test.ts
import { calculateProgress } from '../utils';

describe('calculateProgress', () => {
  const mockSprint = {
    days: [
      {
        coreTasks: [{ category: 'Learning', description: 'Task 1' }],
        specialTasks: ['Special Task 1']
      },
      {
        coreTasks: [{ category: 'Networking', description: 'Task 2' }],
        specialTasks: ['Special Task 2']
      }
    ]
  };

  it('calculates progress without user data', () => {
    const result = calculateProgress(mockSprint);
    expect(result).toEqual({
      completedTasks: 0,
      totalTasks: 4,
      percentage: 0
    });
  });

  it('calculates progress with user data', () => {
    const userProgress = {
      taskStatuses: [
        { completed: true },
        { completed: true },
        { completed: false },
        { completed: false }
      ]
    };

    const result = calculateProgress(mockSprint, userProgress);
    expect(result).toEqual({
      completedTasks: 2,
      totalTasks: 4,
      percentage: 50
    });
  });

  it('handles empty sprint days', () => {
    const emptySprint = { days: [] };
    const result = calculateProgress(emptySprint);
    expect(result).toEqual({
      completedTasks: 0,
      totalTasks: 0,
      percentage: 0
    });
  });
});
```

## Integration Testing

### Firebase Service Testing

#### Example: Sprint Service Test
```typescript
// src/services/__tests__/firebase.test.ts
import { createSprint, getSprint, getSprintsByUser } from '../firebase';
import { Sprint } from '@/types';

// Mock Firebase functions
jest.mock('firebase/firestore');

describe('Firebase Sprint Services', () => {
  const mockSprintData = {
    title: 'Test Sprint',
    description: 'Test Description',
    userId: 'user-123',
    duration: 15 as const,
    startDate: '2025-06-01',
    endDate: '2025-06-15',
    days: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSprint', () => {
    it('creates sprint successfully', async () => {
      const mockDoc = { id: 'sprint-123' };
      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      
      require('firebase/firestore').doc.mockReturnValue(mockDoc);
      require('firebase/firestore').setDoc.mockImplementation(mockSetDoc);

      const result = await createSprint('user-123', mockSprintData);
      
      expect(result).toBe('sprint-123');
      expect(mockSetDoc).toHaveBeenCalledWith(
        mockDoc,
        expect.objectContaining({
          ...mockSprintData,
          id: 'sprint-123',
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      );
    });

    it('handles validation errors', async () => {
      await expect(createSprint('', mockSprintData)).rejects.toThrow();
    });
  });

  describe('getSprintsByUser', () => {
    it('retrieves user sprints', async () => {
      const mockSprints = [
        { id: 'sprint-1', ...mockSprintData },
        { id: 'sprint-2', ...mockSprintData }
      ];

      const mockQuerySnapshot = {
        docs: mockSprints.map(sprint => ({
          data: () => sprint
        }))
      };

      require('firebase/firestore').getDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await getSprintsByUser('user-123');
      
      expect(result).toEqual(mockSprints);
    });
  });
});
```

### Context Testing

#### Example: AuthContext Test
```typescript
// src/contexts/__tests__/AuthContext.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const TestComponent = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>User: {user.email}</div>;
  return <div>No user</div>;
};

describe('AuthContext', () => {
  it('provides user data when authenticated', async () => {
    const mockUser = { email: 'test@example.com', uid: 'user-123' };
    
    require('firebase/auth').onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    require('firebase/auth').onAuthStateChanged.mockImplementation(() => () => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

## End-to-End Testing

### Cypress E2E Tests

#### Example: Sprint Creation Flow
```typescript
// cypress/e2e/sprint-creation.cy.ts
describe('Sprint Creation Flow', () => {
  beforeEach(() => {
    // Mock authentication
    cy.visit('/');
    cy.mockAuth();
  });

  it('creates a new sprint successfully', () => {
    // Navigate to sprint creation
    cy.get('[data-testid="create-sprint-button"]').click();
    cy.url().should('include', '/sprint/new');

    // Fill out sprint form
    cy.get('[data-testid="sprint-title"]').type('My Test Sprint');
    cy.get('[data-testid="sprint-description"]').type('A comprehensive test sprint');
    cy.get('[data-testid="sprint-duration-15"]').click();

    // Create sprint
    cy.get('[data-testid="create-sprint-submit"]').click();

    // Verify creation
    cy.url().should('include', '/sprint/');
    cy.get('[data-testid="sprint-title"]').should('contain', 'My Test Sprint');
    cy.get('[data-testid="day-1"]').should('be.visible');
    cy.get('[data-testid="core-tasks"]').should('contain', '2 tasks');
    cy.get('[data-testid="special-tasks"]').should('contain', '1 task');
  });

  it('validates required fields', () => {
    cy.visit('/sprint/new');
    
    // Try to create without title
    cy.get('[data-testid="create-sprint-submit"]').click();
    
    // Should not navigate away
    cy.url().should('include', '/sprint/new');
    cy.get('[data-testid="sprint-title"]').should('have.attr', 'required');
  });
});
```

#### Example: Task Completion Flow
```typescript
// cypress/e2e/task-completion.cy.ts
describe('Task Completion Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.mockAuth();
    cy.createTestSprint();
  });

  it('completes tasks and updates progress', () => {
    // Navigate to sprint
    cy.get('[data-testid="active-sprint-link"]').click();

    // Complete a core task
    cy.get('[data-testid="core-task-0"]').click();
    cy.get('[data-testid="core-task-0"] [data-testid="task-checkbox"]')
      .should('have.class', 'completed');

    // Verify progress update
    cy.get('[data-testid="progress-bar"]').should('contain', '33%');
    cy.get('[data-testid="task-count"]').should('contain', '1/3');

    // Complete special task
    cy.get('[data-testid="special-task-0"]').click();
    
    // Verify updated progress
    cy.get('[data-testid="progress-bar"]').should('contain', '67%');
    cy.get('[data-testid="task-count"]').should('contain', '2/3');
  });

  it('persists task completion across page reloads', () => {
    // Complete a task
    cy.get('[data-testid="core-task-0"]').click();
    
    // Reload page
    cy.reload();
    
    // Verify task is still completed
    cy.get('[data-testid="core-task-0"] [data-testid="task-checkbox"]')
      .should('have.class', 'completed');
  });
});
```

### Cypress Commands

Create `cypress/support/commands.ts`:
```typescript
declare global {
  namespace Cypress {
    interface Chainable {
      mockAuth(): Chainable<void>;
      createTestSprint(): Chainable<void>;
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('mockAuth', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('auth-user', JSON.stringify({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    }));
  });
});

Cypress.Commands.add('createTestSprint', () => {
  cy.request('POST', '/api/test/create-sprint', {
    title: 'Test Sprint',
    description: 'A test sprint for E2E testing',
    duration: 15
  });
});

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('not.include', '/login');
});
```

## Performance Testing

### Lighthouse CI Configuration

Create `.lighthouserc.js`:
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/sprint', 'http://localhost:3000/tasks'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

### Bundle Analysis Test
```typescript
// scripts/analyze-bundle.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const analyzeBundle = () => {
  return new Promise((resolve, reject) => {
    const analyzer = new BundleAnalyzerPlugin({
      analyzerMode: 'json',
      reportFilename: 'bundle-report.json',
      openAnalyzer: false,
    });

    // Analyze bundle and check size thresholds
    analyzer.apply({
      hooks: {
        done: (stats) => {
          const bundleSize = stats.compilation.assets['main.js']?.size || 0;
          const maxSize = 500 * 1024; // 500KB

          if (bundleSize > maxSize) {
            reject(new Error(`Bundle size ${bundleSize} exceeds maximum ${maxSize}`));
          } else {
            resolve(bundleSize);
          }
        },
      },
    });
  });
};

module.exports = { analyzeBundle };
```

## Accessibility Testing

### Automated Accessibility Tests
```typescript
// src/components/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Dashboard } from '@/components/dashboard/Dashboard';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Dashboard should not have accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button components should be keyboard accessible', () => {
    const { getByRole } = render(
      <Button onClick={() => {}}>Test Button</Button>
    );
    
    const button = getByRole('button');
    expect(button).toHaveAttribute('tabIndex', '0');
    
    // Test keyboard navigation
    button.focus();
    expect(document.activeElement).toBe(button);
  });
});
```

## Security Testing

### Authentication Tests
```typescript
// src/services/__tests__/auth-security.test.ts
describe('Authentication Security', () => {
  it('prevents unauthorized access to protected routes', async () => {
    // Mock unauthenticated state
    jest.spyOn(require('../firebase'), 'getCurrentUser').mockReturnValue(null);

    const response = await fetch('/api/sprints');
    expect(response.status).toBe(401);
  });

  it('validates user permissions for data access', async () => {
    const mockUser = { uid: 'user-123' };
    jest.spyOn(require('../firebase'), 'getCurrentUser').mockReturnValue(mockUser);

    // Try to access another user's data
    const response = await fetch('/api/sprints/other-user-sprint');
    expect(response.status).toBe(403);
  });

  it('sanitizes user input to prevent XSS', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    expect(sanitized).not.toContain('<script>');
  });
});
```

## Test Data Management

### Test Fixtures
Create `src/__tests__/fixtures/`:

```typescript
// src/__tests__/fixtures/sprint.ts
export const mockSprint = {
  id: 'test-sprint-1',
  userId: 'test-user-1',
  title: 'Test Sprint',
  description: 'A test sprint for unit testing',
  duration: 15 as const,
  startDate: '2025-06-01',
  endDate: '2025-06-15',
  days: [
    {
      day: 'Day 1',
      date: '2025-06-01',
      coreTasks: [
        { category: 'Learning', description: 'Complete online course' },
        { category: 'Networking', description: 'Connect with mentor' }
      ],
      specialTasks: ['Review daily goals']
    }
  ],
  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2025-06-01T00:00:00Z'
};

export const mockUserProgress = {
  userId: 'test-user-1',
  sprintId: 'test-sprint-1',
  taskStatuses: [],
  journalEntries: [],
  streaks: {
    currentTaskStreak: 0,
    longestTaskStreak: 0,
    currentJournalStreak: 0,
    longestJournalStreak: 0
  },
  stats: {
    totalTasksCompleted: 0,
    totalDaysCompleted: 0,
    completionPercentage: 0
  }
};
```

### Database Seeding
```typescript
// scripts/seed-test-data.ts
import { createSprint, createUserProgress } from '@/services/firebase';
import { mockSprint, mockUserProgress } from '@/__tests__/fixtures/sprint';

export const seedTestData = async () => {
  try {
    await createSprint(mockSprint.userId, mockSprint);
    await createUserProgress(mockUserProgress);
    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
};
```

## Test Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:lighthouse": "lhci autorun",
    "test:accessibility": "jest --testPathPattern=accessibility",
    "test:security": "jest --testPathPattern=security",
    "test:all": "npm run test && npm run test:e2e && npm run test:lighthouse"
  }
}
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run Lighthouse CI
        run: npm run test:lighthouse
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Maintenance

### Regular Testing Tasks
- **Daily**: Run unit tests during development
- **Weekly**: Full test suite execution
- **Monthly**: Performance and accessibility audits
- **Quarterly**: Security testing and penetration testing

### Test Quality Metrics
- **Code Coverage**: Minimum 80% line coverage
- **Test Reliability**: < 1% flaky test rate
- **Test Performance**: Average test execution < 30 seconds
- **Maintenance Overhead**: < 10% development time

---

**Testing Documentation Version**: 1.0  
**Last Updated**: June 10, 2025  
**Review Cycle**: Quarterly  
**Next Review**: September 10, 2025
