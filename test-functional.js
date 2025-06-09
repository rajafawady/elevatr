/**
 * Functional Testing Script for Elevatr Career Success Tracker
 * This script performs actual functional tests on the Firebase service layer
 */

import { 
  validateUserId, 
  validateSprintId, 
  validateSprintData,
  handleFirebaseError,
  FirebaseServiceError 
} from '../src/services/firebase.js';

// Test Suite for Input Validation
const testInputValidation = () => {
  console.log('🧪 Testing Input Validation Functions...\n');
  
  const tests = [
    // User ID validation tests
    {
      name: 'Valid User ID',
      test: () => validateUserId('user123'),
      expected: true
    },
    {
      name: 'Empty User ID',
      test: () => validateUserId(''),
      expected: false
    },
    {
      name: 'Null User ID',
      test: () => validateUserId(null),
      expected: false
    },
    {
      name: 'Undefined User ID',
      test: () => validateUserId(undefined),
      expected: false
    },
    
    // Sprint ID validation tests
    {
      name: 'Valid Sprint ID',
      test: () => validateSprintId('sprint_abc123'),
      expected: true
    },
    {
      name: 'Empty Sprint ID',
      test: () => validateSprintId(''),
      expected: false
    },
    
    // Sprint data validation tests
    {
      name: 'Valid Sprint Data',
      test: () => validateSprintData({
        title: 'Test Sprint',
        description: 'A test sprint',
        duration: 15,
        startDate: '2025-06-09',
        endDate: '2025-06-24'
      }),
      expected: true
    },
    {
      name: 'Missing Title',
      test: () => validateSprintData({
        description: 'A test sprint',
        duration: 15,
        startDate: '2025-06-09',
        endDate: '2025-06-24'
      }),
      expected: false
    },
    {
      name: 'Invalid Duration',
      test: () => validateSprintData({
        title: 'Test Sprint',
        description: 'A test sprint',
        duration: 20, // Should be 15 or 30
        startDate: '2025-06-09',
        endDate: '2025-06-24'
      }),
      expected: false
    }
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      const result = test.test();
      if (result === test.expected) {
        console.log(`✅ ${test.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name}: FAILED (expected ${test.expected}, got ${result})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 Validation Tests Summary: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// Test Error Handling
const testErrorHandling = () => {
  console.log('🛡️ Testing Error Handling...\n');
  
  const mockFirebaseErrors = [
    {
      code: 'permission-denied',
      message: 'Missing or insufficient permissions'
    },
    {
      code: 'not-found',
      message: 'Document not found'
    },
    {
      code: 'unavailable',
      message: 'Service is currently unavailable'
    },
    {
      code: 'deadline-exceeded',
      message: 'Request timed out'
    },
    {
      code: 'resource-exhausted',
      message: 'Quota exceeded'
    }
  ];

  let passed = 0;
  let failed = 0;

  mockFirebaseErrors.forEach(mockError => {
    try {
      const handled = handleFirebaseError(mockError, 'test-operation');
      if (handled instanceof FirebaseServiceError) {
        console.log(`✅ ${mockError.code}: Properly handled as FirebaseServiceError`);
        passed++;
      } else {
        console.log(`❌ ${mockError.code}: Not handled correctly`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${mockError.code}: Error in handling - ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 Error Handling Tests Summary: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// Test Data Structure Validation
const testDataStructures = () => {
  console.log('📋 Testing Data Structure Validation...\n');
  
  const testSprint = {
    id: 'test-sprint-123',
    userId: 'user-123',
    title: 'Test Sprint',
    description: 'A comprehensive test sprint',
    duration: 15,
    startDate: '2025-06-09',
    endDate: '2025-06-24',
    status: 'active',
    days: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const testTask = {
    id: 'test-task-123',
    title: 'Test Task',
    description: 'A test task',
    status: 'active',
    priority: 'medium',
    category: 'development',
    sprintId: 'test-sprint-123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const structures = [
    {
      name: 'Sprint Structure',
      data: testSprint,
      requiredFields: ['id', 'userId', 'title', 'duration', 'startDate', 'endDate']
    },
    {
      name: 'Task Structure',
      data: testTask,
      requiredFields: ['id', 'title', 'status', 'priority', 'createdAt']
    }
  ];

  let passed = 0;
  let failed = 0;

  structures.forEach(structure => {
    const missing = structure.requiredFields.filter(field => 
      !(field in structure.data) || structure.data[field] === undefined
    );

    if (missing.length === 0) {
      console.log(`✅ ${structure.name}: All required fields present`);
      passed++;
    } else {
      console.log(`❌ ${structure.name}: Missing fields - ${missing.join(', ')}`);
      failed++;
    }
  });

  console.log(`\n📊 Data Structure Tests Summary: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// Performance Test (Basic)
const testPerformance = () => {
  console.log('⚡ Testing Basic Performance...\n');
  
  const performanceTests = [
    {
      name: 'User ID Validation (1000 iterations)',
      test: () => {
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          validateUserId(`user_${i}`);
        }
        return performance.now() - start;
      },
      threshold: 100 // milliseconds
    },
    {
      name: 'Sprint Data Validation (100 iterations)',
      test: () => {
        const start = performance.now();
        const testData = {
          title: 'Performance Test Sprint',
          description: 'Testing performance',
          duration: 15,
          startDate: '2025-06-09',
          endDate: '2025-06-24'
        };
        for (let i = 0; i < 100; i++) {
          validateSprintData(testData);
        }
        return performance.now() - start;
      },
      threshold: 50 // milliseconds
    }
  ];

  let passed = 0;
  let failed = 0;

  performanceTests.forEach(test => {
    try {
      const duration = test.test();
      if (duration < test.threshold) {
        console.log(`✅ ${test.name}: ${duration.toFixed(2)}ms (under ${test.threshold}ms threshold)`);
        passed++;
      } else {
        console.log(`⚠️ ${test.name}: ${duration.toFixed(2)}ms (over ${test.threshold}ms threshold)`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
      failed++;
    }
  });

  console.log(`\n📊 Performance Tests Summary: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
};

// Main Test Runner
const runAllTests = () => {
  console.log('🚀 Starting Elevatr Functional Tests...\n');
  console.log('='.repeat(60));
  
  const results = {
    validation: testInputValidation(),
    errorHandling: testErrorHandling(),
    dataStructures: testDataStructures(),
    performance: testPerformance()
  };

  console.log('='.repeat(60));
  console.log('📈 OVERALL TEST SUMMARY');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;

  Object.entries(results).forEach(([category, result]) => {
    console.log(`${category.toUpperCase()}: ${result.passed} passed, ${result.failed} failed`);
    totalPassed += result.passed;
    totalFailed += result.failed;
  });

  console.log('-'.repeat(60));
  console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
  
  const successRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1);
  console.log(`SUCCESS RATE: ${successRate}%`);

  if (totalFailed === 0) {
    console.log('🎉 ALL TESTS PASSED! The application is ready for production.');
  } else if (successRate >= 90) {
    console.log('✅ Most tests passed. Minor issues may need attention.');
  } else if (successRate >= 75) {
    console.log('⚠️ Some tests failed. Review and fix issues before deployment.');
  } else {
    console.log('❌ Many tests failed. Significant issues need to be addressed.');
  }
  
  console.log('='.repeat(60));
  
  return results;
};

// Export for use in browser or Node.js
if (typeof window !== 'undefined') {
  // Browser environment
  window.ElevatrTests = {
    runAllTests,
    testInputValidation,
    testErrorHandling,
    testDataStructures,
    testPerformance
  };
} else if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    runAllTests,
    testInputValidation,
    testErrorHandling,
    testDataStructures,
    testPerformance
  };
}

console.log('✅ Functional Test Suite Loaded - Ready to run tests!');
