# 📚 API Documentation

## Overview

This document provides comprehensive API documentation for the Elevatr Career Success Tracker application. The application uses Firebase as the backend service, with custom service layer functions providing a clean API interface.

## Architecture

### Service Layer Structure
```
src/services/
├── firebase.ts          # Main Firebase service layer
└── types/
    └── index.ts         # Type definitions
```

### Authentication
All API operations require user authentication through Firebase Auth. The service layer automatically validates user permissions and ensures data isolation.

## Sprint Management API

### Create Sprint

**Function**: `createSprint(userId: string, sprintData: SprintData): Promise<string>`

Creates a new sprint for the specified user with automatic progress tracking initialization.

**Parameters**:
```typescript
interface SprintData {
  title: string;
  description: string;
  userId: string;
  duration: 15 | 30;
  startDate: string;      // YYYY-MM-DD format
  endDate: string;        // YYYY-MM-DD format
  days: Day[];
}

interface Day {
  day: string;            // "Day 1", "Day 2", etc.
  date: string;           // YYYY-MM-DD format
  coreTasks: CoreTask[];
  specialTasks: string[];
}

interface CoreTask {
  category: string;       // "Learning", "Networking", etc.
  description: string;
}
```

**Returns**: `Promise<string>` - The created sprint ID

**Example**:
```typescript
const sprintData = {
  title: "Career Growth Sprint",
  description: "15-day focus on skill development",
  userId: "user-123",
  duration: 15,
  startDate: "2025-06-01",
  endDate: "2025-06-15",
  days: [
    {
      day: "Day 1",
      date: "2025-06-01",
      coreTasks: [
        { category: "Learning", description: "Complete React course module" },
        { category: "Networking", description: "Connect with industry mentor" }
      ],
      specialTasks: ["Review and plan next day activities"]
    }
    // ... additional days
  ]
};

const sprintId = await createSprint("user-123", sprintData);
```

**Error Handling**:
- `FirebaseServiceError` with code `'invalid-input'` for validation errors
- `FirebaseServiceError` with code `'permission-denied'` for unauthorized access
- `FirebaseServiceError` with code `'unknown'` for unexpected errors

### Get Sprint

**Function**: `getSprint(sprintId: string): Promise<Sprint | null>`

Retrieves a specific sprint by ID.

**Parameters**:
- `sprintId: string` - The unique sprint identifier

**Returns**: `Promise<Sprint | null>` - The sprint data or null if not found

**Example**:
```typescript
const sprint = await getSprint("sprint-123");
if (sprint) {
  console.log(`Sprint: ${sprint.title}`);
  console.log(`Duration: ${sprint.duration} days`);
  console.log(`Tasks: ${sprint.days.length} days planned`);
}
```

### Get User Sprints

**Function**: `getSprintsByUser(userId: string): Promise<Sprint[]>`

Retrieves all sprints for a specific user, ordered by creation date (most recent first).

**Parameters**:
- `userId: string` - The user identifier

**Returns**: `Promise<Sprint[]>` - Array of user's sprints

**Example**:
```typescript
const userSprints = await getSprintsByUser("user-123");
console.log(`User has ${userSprints.length} sprints`);

userSprints.forEach(sprint => {
  console.log(`${sprint.title} - ${sprint.status || 'active'}`);
});
```

### Update Sprint

**Function**: `updateSprint(sprintId: string, updates: Partial<Sprint>): Promise<void>`

Updates specific fields of an existing sprint.

**Parameters**:
- `sprintId: string` - The sprint identifier
- `updates: Partial<Sprint>` - Object containing fields to update

**Example**:
```typescript
await updateSprint("sprint-123", {
  title: "Updated Sprint Title",
  description: "Updated description",
  status: "completed"
});

// Update only the days array (common for task additions)
await updateSprint("sprint-123", {
  days: updatedDaysArray
});
```

### Delete Sprint

**Function**: `deleteSprint(sprintId: string): Promise<void>`

Deletes a sprint and all associated progress data.

**Parameters**:
- `sprintId: string` - The sprint identifier

**Example**:
```typescript
await deleteSprint("sprint-123");
// Sprint and all progress data will be permanently deleted
```

**Note**: This operation also removes all associated user progress, task statuses, and journal entries.

### Get Active Sprint

**Function**: `getActiveSprint(userId: string): Promise<Sprint | null>`

Retrieves the user's most recently created sprint (assumed to be active).

**Parameters**:
- `userId: string` - The user identifier

**Returns**: `Promise<Sprint | null>` - The active sprint or null

**Example**:
```typescript
const activeSprint = await getActiveSprint("user-123");
if (activeSprint) {
  console.log(`Active sprint: ${activeSprint.title}`);
  console.log(`Days remaining: ${getDaysRemaining(activeSprint.endDate)}`);
}
```

## Progress Tracking API

### Get User Progress

**Function**: `getUserProgress(userId: string, sprintId: string): Promise<UserProgress | null>`

Retrieves progress data for a specific user and sprint combination.

**Parameters**:
- `userId: string` - The user identifier
- `sprintId: string` - The sprint identifier

**Returns**: `Promise<UserProgress | null>` - Progress data or null if not found

**Type Definition**:
```typescript
interface UserProgress {
  userId: string;
  sprintId: string;
  taskStatuses: TaskStatus[];
  journalEntries: JournalEntry[];
  streaks: {
    currentTaskStreak: number;
    longestTaskStreak: number;
    currentJournalStreak: number;
    longestJournalStreak: number;
  };
  stats: {
    totalTasksCompleted: number;
    totalDaysCompleted: number;
    completionPercentage: number;
  };
}
```

**Example**:
```typescript
const progress = await getUserProgress("user-123", "sprint-123");
if (progress) {
  console.log(`Completed tasks: ${progress.stats.totalTasksCompleted}`);
  console.log(`Completion rate: ${progress.stats.completionPercentage}%`);
  console.log(`Current streak: ${progress.streaks.currentTaskStreak} days`);
}
```

### Update Task Status

**Function**: `updateTaskStatus(userId: string, sprintId: string, taskStatus: TaskStatusUpdate): Promise<void>`

Updates the completion status of a specific task.

**Parameters**:
```typescript
interface TaskStatusUpdate {
  dayId: string;          // "Day 1", "Day 2", etc.
  taskType: 'core' | 'special';
  taskIndex: number;      // 0-based index within the task array
  status: 'completed' | 'active';
  completedAt?: Date;     // Optional, defaults to current time
}
```

**Example**:
```typescript
// Mark a core task as completed
await updateTaskStatus("user-123", "sprint-123", {
  dayId: "Day 1",
  taskType: "core",
  taskIndex: 0,
  status: "completed"
});

// Mark a special task as incomplete
await updateTaskStatus("user-123", "sprint-123", {
  dayId: "Day 1",
  taskType: "special",
  taskIndex: 0,
  status: "active"
});
```

**Auto-calculated Fields**:
- Progress statistics are automatically recalculated
- Streaks are updated based on completion patterns
- Completion percentages are refreshed

## Task Management API

### Get Tasks by User

**Function**: `getTasksByUser(userId: string): Promise<Task[]>`

Retrieves all tasks across all sprints for a user, converted from task statuses.

**Returns**: `Promise<Task[]>` - Array of task objects

**Type Definition**:
```typescript
interface Task {
  id: string;             // Generated composite ID
  title: string;          // Task description or category
  description?: string;   // Additional task details
  status: 'active' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  category?: string;      // Task category (for core tasks)
  sprintId?: string;      // Associated sprint
  dayId?: string;         // Associated day
  taskType?: 'core' | 'special';
  taskIndex?: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  completedAt?: Date | Timestamp | null;
  dueDate?: Date | Timestamp | null;
}
```

**Example**:
```typescript
const userTasks = await getTasksByUser("user-123");

// Filter by status
const completedTasks = userTasks.filter(task => task.status === 'completed');
const activeTasks = userTasks.filter(task => task.status === 'active');

// Group by sprint
const tasksBySprint = userTasks.reduce((acc, task) => {
  const sprintId = task.sprintId || 'unassigned';
  if (!acc[sprintId]) acc[sprintId] = [];
  acc[sprintId].push(task);
  return acc;
}, {} as Record<string, Task[]>);
```

### Update Task

**Function**: `updateTask(taskId: string, updates: Partial<Task>): Promise<void>`

Updates a task's properties. The task ID should be in the format generated by the system.

**Parameters**:
- `taskId: string` - Composite task ID (format: `sprintId-dayId-taskType-taskIndex`)
- `updates: Partial<Task>` - Fields to update

**Example**:
```typescript
await updateTask("sprint-123-Day-1-core-0", {
  status: "completed",
  completedAt: new Date()
});
```

### Get Recent Task Updates

**Function**: `getRecentTaskUpdates(userId: string, limit?: number): Promise<TaskStatus[]>`

Retrieves recently updated tasks for activity feeds and notifications.

**Parameters**:
- `userId: string` - The user identifier
- `limit: number` - Maximum number of updates to return (default: 10)

**Returns**: `Promise<TaskStatus[]>` - Recent task updates, ordered by update time

**Example**:
```typescript
const recentUpdates = await getRecentTaskUpdates("user-123", 5);
recentUpdates.forEach(update => {
  console.log(`${update.dayId} ${update.taskType} task ${update.taskIndex}: ${update.completed ? 'completed' : 'pending'}`);
});
```

## Journal API

### Create Journal Entry

**Function**: `createJournalEntry(userId: string, sprintId: string, dayId: string, content: string): Promise<string>`

Creates a daily journal entry for reflection and progress tracking.

**Parameters**:
- `userId: string` - The user identifier
- `sprintId: string` - The associated sprint
- `dayId: string` - The day identifier ("Day 1", "Day 2", etc.)
- `content: string` - The journal content

**Returns**: `Promise<string>` - The journal entry ID

**Example**:
```typescript
const entryId = await createJournalEntry(
  "user-123",
  "sprint-123",
  "Day 1",
  "Today I completed my first learning task and connected with a mentor. Feeling motivated!"
);
```

### Get Journal Entry

**Function**: `getJournalEntry(userId: string, sprintId: string, dayId: string): Promise<JournalEntry | null>`

Retrieves a specific journal entry for a given day.

**Type Definition**:
```typescript
interface JournalEntry {
  id: string;
  userId: string;
  sprintId: string;
  dayId: string;
  content: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}
```

**Example**:
```typescript
const entry = await getJournalEntry("user-123", "sprint-123", "Day 1");
if (entry) {
  console.log(`Journal for ${entry.dayId}: ${entry.content}`);
}
```

### Update Journal Entry

**Function**: `updateJournalEntry(entryId: string, content: string): Promise<void>`

Updates the content of an existing journal entry.

**Example**:
```typescript
await updateJournalEntry("entry-123", "Updated reflection content with new insights.");
```

## Template API

### Get Public Templates

**Function**: `getPublicTemplates(): Promise<Sprint[]>`

Retrieves publicly available sprint templates that users can use as starting points.

**Returns**: `Promise<Sprint[]>` - Array of template sprints

**Example**:
```typescript
const templates = await getPublicTemplates();
templates.forEach(template => {
  console.log(`Template: ${template.title} (${template.duration} days)`);
});
```

### Create Template

**Function**: `createTemplate(sprintData: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>`

Creates a new public template from sprint data.

**Example**:
```typescript
const templateId = await createTemplate({
  title: "Software Developer 15-Day Sprint",
  description: "Focused on coding skills and networking",
  userId: "template-creator",
  duration: 15,
  startDate: "2025-06-01",
  endDate: "2025-06-15",
  days: templateDays
});
```

## Utility Functions

### Progress Calculation

**Function**: `calculateProgress(sprint: Sprint, userProgress?: UserProgress): ProgressData`

Calculates completion statistics for a sprint.

**Type Definition**:
```typescript
interface ProgressData {
  completedTasks: number;
  totalTasks: number;
  percentage: number;
}
```

**Example**:
```typescript
import { calculateProgress } from '@/lib/utils';

const progressData = calculateProgress(sprint, userProgress);
console.log(`Progress: ${progressData.percentage}% (${progressData.completedTasks}/${progressData.totalTasks})`);
```

### Date Utilities

**Function**: `getDaysRemaining(endDate: string): number`

Calculates days remaining until sprint end date.

**Example**:
```typescript
import { getDaysRemaining } from '@/lib/utils';

const daysLeft = getDaysRemaining("2025-06-15");
console.log(`${daysLeft} days remaining`);
```

## Error Handling

### Custom Error Types

```typescript
class FirebaseServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'FirebaseServiceError';
  }
}
```

### Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `invalid-input` | Invalid or missing required parameters | Empty strings, invalid dates, malformed data |
| `not-found` | Requested resource doesn't exist | Non-existent sprint/user IDs |
| `permission-denied` | User lacks permission for operation | Accessing other users' data |
| `already-exists` | Resource already exists | Duplicate sprint creation |
| `quota-exceeded` | Firebase quota limits reached | Too many operations |
| `network-error` | Network connectivity issues | Offline, slow connection |
| `unknown` | Unexpected error occurred | Firebase internal errors |

### Error Handling Example

```typescript
try {
  const sprint = await getSprint("sprint-123");
} catch (error) {
  if (error instanceof FirebaseServiceError) {
    switch (error.code) {
      case 'not-found':
        console.log('Sprint not found');
        break;
      case 'permission-denied':
        console.log('Access denied');
        break;
      default:
        console.log(`Error: ${error.message}`);
    }
  } else {
    console.log('Unexpected error:', error);
  }
}
```

## Rate Limiting and Quotas

### Firebase Limitations
- **Reads**: 50,000 per day (free tier)
- **Writes**: 20,000 per day (free tier)
- **Document Size**: Maximum 1MB per document
- **Batch Operations**: Maximum 500 operations per batch

### Recommended Usage Patterns
- **Pagination**: Use limit() for large datasets
- **Caching**: Implement client-side caching for frequently accessed data
- **Batch Operations**: Group multiple writes when possible
- **Offline Support**: Implement offline-first patterns

## Security Considerations

### Data Validation
All service functions include comprehensive input validation:
- User ID format validation
- Sprint ID format validation
- Data structure validation
- Type safety enforcement

### Access Control
- User-specific data isolation
- Automatic permission checking
- Firebase Security Rules enforcement
- Authentication requirement for all operations

### Data Sanitization
- Input sanitization for XSS prevention
- SQL injection prevention (not applicable for Firestore)
- Proper error message handling to prevent information leakage

## Performance Optimization

### Query Optimization
```typescript
// Efficient: Use compound queries
const query = query(
  collection(db, 'sprints'),
  where('userId', '==', userId),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc'),
  limit(10)
);

// Avoid: Multiple separate queries
const allSprints = await getSprintsByUser(userId);
const activeSprints = allSprints.filter(s => s.status === 'active');
```

### Caching Strategies
- Use React Query or SWR for client-side caching
- Implement service worker caching for offline support
- Cache computed values like progress calculations

### Batch Operations
```typescript
// Efficient: Batch writes
const batch = writeBatch(db);
batch.set(doc1Ref, doc1Data);
batch.update(doc2Ref, doc2Updates);
batch.delete(doc3Ref);
await batch.commit();
```

---

**API Documentation Version**: 1.0  
**Last Updated**: June 10, 2025  
**API Stability**: Stable  
**Breaking Changes**: None planned
