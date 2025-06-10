// Test script to check if PerformanceIndicator exports correctly
try {
  const { PerformanceIndicator } = require('./src/components/ui/PerformanceIndicator.tsx');
  console.log('✅ PerformanceIndicator exported successfully');
} catch (error) {
  console.log('❌ Export error:', error.message);
}
