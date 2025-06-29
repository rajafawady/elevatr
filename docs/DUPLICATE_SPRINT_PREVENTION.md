# Duplicate Sprint Prevention Implementation

## Overview
This document describes the implementation of duplicate sprint prevention feature that ensures users cannot create overlapping active sprints and provides a user-friendly way to schedule sprints to start after the current one ends.

## Problem Statement
Previously, users could create multiple active sprints simultaneously, leading to:
- Confusion about which sprint is currently active
- Data inconsistency issues
- Poor user experience with overlapping sprint schedules

## Solution
Implemented a comprehensive solution that:
1. **Detects active sprints** before allowing new sprint creation
2. **Prompts users** to schedule new sprints after current ones end
3. **Automatically manages sprint statuses** to prevent conflicts
4. **Provides visual feedback** about active sprint detection

## Implementation Details

### 1. Active Sprint Detection Logic
**File**: `src/app/sprint/new/page.tsx`

```typescript
const isSprintCurrentlyActive = (sprint: Sprint | null): boolean => {
  if (!sprint) return false;
  
  const today = new Date().toISOString().split('T')[0];
  const sprintStart = sprint.startDate;
  const sprintEnd = sprint.endDate;
  
  // A sprint is active if:
  // 1. Status is 'active' OR status is undefined (for backward compatibility)
  // 2. Today's date is between start and end dates (inclusive)
  const statusActive = !sprint.status || sprint.status === 'active';
  const dateActive = today >= sprintStart && today <= sprintEnd;
  
  return statusActive && dateActive;
};
```

**Key Features**:
- Checks both sprint status and date range
- Handles backward compatibility for sprints without status
- Uses ISO date format for consistent comparison

### 2. User Interface Enhancements

#### Active Sprint Warning Dialog
When users attempt to create a sprint while one is active, they see:
- Clear warning about the existing active sprint
- Details of the current sprint (title, dates, description)
- Option to schedule the new sprint after the current one ends
- Calculated start date for the new sprint

#### Visual Indicators
- **Sprint Preview**: Shows amber warning when active sprint detected
- **Formatted Dates**: User-friendly date formatting in dialogs
- **Success Messages**: Confirmation when sprint is scheduled

### 3. Backend Logic Updates

#### Sprint Store (`src/stores/sprintStore.ts`)
**Enhanced `addSprint` function**:
```typescript
// If the new sprint is active, mark previous active sprints as completed
if (newSprint.status === 'active') {
  updatedSprints = updatedSprints.map(sprint => 
    sprint.status === 'active' 
      ? { ...sprint, status: 'completed' as const, updatedAt: new Date().toISOString() }
      : sprint
  );
}
```

#### Firebase Service (`src/services/firebase.ts`)
**Enhanced `createSprint` function**:
```typescript
// If the new sprint is active, mark previous active sprints as completed
if (sprint.status === 'active') {
  const sprintsQuery = query(
    collection(db, 'sprints'),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  
  const activeSprintsSnap = await getDocs(sprintsQuery);
  const batch = writeBatch(db);
  
  activeSprintsSnap.docs.forEach(doc => {
    batch.update(doc.ref, { 
      status: 'completed',
      updatedAt: now
    });
  });
  
  if (!activeSprintsSnap.empty) {
    await batch.commit();
  }
}
```

**Enhanced `getActiveSprint` function**:
```typescript
// Look for explicitly active sprints first
for (const doc of sprintsSnap.docs) {
  const sprint = doc.data() as Sprint;
  
  // Check if sprint is active by status and within date range
  if ((!sprint.status || sprint.status === 'active') &&
      sprint.startDate <= today && 
      sprint.endDate >= today) {
    return sprint;
  }
}
```

#### Local Storage Service (`src/services/localStorage.ts`)
**Enhanced `addLocalSprint` function**:
```typescript
// If the new sprint is active, mark previous active sprints as completed
if (newSprint.status === 'active') {
  sprints.forEach(existingSprint => {
    if (existingSprint.status === 'active') {
      existingSprint.status = 'completed';
      existingSprint.updatedAt = new Date().toISOString();
    }
  });
}
```

**Enhanced `getLocalActiveSprint` function**:
```typescript
// Look for explicitly active sprints first
const activeSprint = sprints.find(sprint => 
  (!sprint.status || sprint.status === 'active') &&
  sprint.startDate <= today && 
  sprint.endDate >= today
);
```

### 4. Date Handling for Scheduled Sprints

**Automatic Date Calculation**:
```typescript
const handleCreateSprintAfterCurrent = async () => {
  if (activeSprint) {
    // Calculate the day after current sprint ends
    const currentEndDate = new Date(activeSprint.endDate);
    currentEndDate.setDate(currentEndDate.getDate() + 1);
    const newStartDate = currentEndDate.toISOString().split('T')[0];
    
    await handleCreateSprint(newStartDate);
  }
};
```

**Dynamic Day Generation**:
```typescript
// Create days structure with custom start date
days = Array.from({ length: sprintType === '15-day' ? 15 : 30 }, (_, i) => {
  const startDate = new Date(customStartDate || new Date().toISOString().split('T')[0]);
  const dayDate = new Date(startDate);
  dayDate.setDate(dayDate.getDate() + i);
  return {
    day: `Day ${i + 1}`,
    date: dayDate.toISOString().split('T')[0],
    // ... tasks
  };
});
```

## User Experience Flow

1. **User clicks "Create Sprint"**
2. **System checks for active sprints**
   - If no active sprint: Creates immediately
   - If active sprint exists: Shows warning dialog
3. **User sees active sprint details**
   - Current sprint title, dates, description
   - Calculated start date for new sprint
4. **User chooses action**:
   - **Cancel**: Returns to form
   - **Schedule Sprint**: Creates sprint with future start date
5. **System provides feedback**
   - Success message with scheduled date
   - Navigation to new sprint (if applicable)

## Benefits

### For Users
- **Clear guidance** when attempting to create overlapping sprints
- **Automatic scheduling** to prevent conflicts
- **Visual feedback** about sprint timing
- **Consistent experience** across all sprint management

### For System
- **Data consistency** with proper sprint status management
- **No duplicate active sprints** in the database
- **Proper state management** across Firebase and local storage
- **Backward compatibility** with existing sprints

## Testing Scenarios

### Test Case 1: No Active Sprint
1. Navigate to `/sprint/new`
2. Fill in sprint details
3. Click "Create Sprint"
4. **Expected**: Sprint created immediately with today's start date

### Test Case 2: Active Sprint Exists
1. Ensure there's an active sprint (within date range)
2. Navigate to `/sprint/new`
3. Fill in sprint details
4. Click "Create Sprint"
5. **Expected**: Warning dialog appears with active sprint details

### Test Case 3: Schedule After Active Sprint
1. From active sprint warning dialog
2. Click "Schedule Sprint"
3. **Expected**: 
   - New sprint created with start date = (active sprint end date + 1)
   - Success message shows formatted start date
   - Previous active sprint marked as completed

### Test Case 4: Visual Indicators
1. With active sprint present
2. Navigate to `/sprint/new`
3. **Expected**: 
   - Amber warning appears in sprint preview
   - Warning text indicates scheduling behavior

## Technical Considerations

### Performance
- Minimal impact on sprint creation flow
- Single database query to check for active sprints
- Efficient batch operations for status updates

### Scalability
- Works with both Firebase and local storage
- Handles multiple active sprints (edge case)
- Proper error handling and cleanup

### Maintainability
- Clear separation of concerns
- Reusable active sprint detection logic
- Comprehensive error handling

## Future Enhancements

1. **Sprint Queuing**: Allow users to queue multiple future sprints
2. **Sprint Templates**: Save and reuse sprint configurations
3. **Automated Transitions**: Auto-start scheduled sprints
4. **Notification System**: Remind users of upcoming sprints
5. **Sprint Analytics**: Track sprint scheduling patterns

## Dependencies
- React hooks for state management
- Firebase Firestore for data persistence
- Local storage service for offline support
- Zustand store for state management
- Next.js for routing and navigation

## Conclusion
This implementation provides a robust solution for preventing duplicate active sprints while maintaining excellent user experience. The system automatically handles sprint status management and provides clear guidance to users about scheduling conflicts.
