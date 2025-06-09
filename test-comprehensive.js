/**
 * Comprehensive Testing Suite for Elevatr Career Success Tracker
 * Tests system integrity, configuration, and readiness for production
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Comprehensive Testing Suite...\n');

// Test results collector
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
};

function logTest(name, status, message = '') {
    const symbols = { pass: '✅', fail: '❌', warn: '⚠️' };
    const symbol = symbols[status] || '❓';
    
    console.log(`${symbol} ${name}: ${message}`);
    
    testResults[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
    testResults.details.push({ name, status, message, timestamp: new Date().toISOString() });
}

// Test 1: Firebase Configuration
function testFirebaseConfig() {
    console.log('\n📊 Testing Firebase Configuration...');
    
    try {
        const firebaseServicePath = path.join(__dirname, 'src', 'services', 'firebase.ts');
        if (fs.existsSync(firebaseServicePath)) {
            const content = fs.readFileSync(firebaseServicePath, 'utf8');
            
            // Check for required Firebase imports
            const requiredImports = [
                'initializeApp',
                'getFirestore',
                'getAuth',
                'collection',
                'doc',
                'addDoc',
                'getDocs',
                'updateDoc',
                'deleteDoc'
            ];
            
            let missingImports = [];
            requiredImports.forEach(imp => {
                if (!content.includes(imp)) {
                    missingImports.push(imp);
                }
            });
            
            if (missingImports.length === 0) {
                logTest('Firebase imports', 'pass', 'All required Firebase functions imported');
            } else {
                logTest('Firebase imports', 'warn', `Missing: ${missingImports.join(', ')}`);
            }
            
            // Check for Firebase configuration
            if (content.includes('firebaseConfig') && content.includes('initializeApp')) {
                logTest('Firebase initialization', 'pass', 'Firebase app properly initialized');
            } else {
                logTest('Firebase initialization', 'fail', 'Firebase app initialization not found');
            }
            
            // Check for Firestore and Auth setup
            if (content.includes('getFirestore') && content.includes('getAuth')) {
                logTest('Firebase services', 'pass', 'Firestore and Auth properly configured');
            } else {
                logTest('Firebase services', 'fail', 'Firestore or Auth configuration missing');
            }
            
        } else {
            logTest('Firebase service file', 'fail', 'firebase.ts not found');
        }
    } catch (error) {
        logTest('Firebase configuration test', 'fail', error.message);
    }
}

// Test 2: Type Definitions
function testTypeDefinitions() {
    console.log('\n📝 Testing Type Definitions...');
    
    try {
        const typesPath = path.join(__dirname, 'src', 'types', 'index.ts');
        if (fs.existsSync(typesPath)) {
            const content = fs.readFileSync(typesPath, 'utf8');
            
            // Check for core interfaces
            const coreTypes = ['Task', 'Sprint', 'JournalEntry', 'User'];
            let missingTypes = [];
            
            coreTypes.forEach(type => {
                if (content.includes(`interface ${type}`) || content.includes(`type ${type}`)) {
                    logTest(`${type} interface`, 'pass', 'Type definition found');
                } else {
                    missingTypes.push(type);
                    logTest(`${type} interface`, 'fail', 'Type definition missing');
                }
            });
            
            if (missingTypes.length === 0) {
                logTest('Core type definitions', 'pass', 'All core types defined');
            } else {
                logTest('Core type definitions', 'warn', `Missing: ${missingTypes.join(', ')}`);
            }
            
        } else {
            logTest('Types file', 'fail', 'types/index.ts not found');
        }
    } catch (error) {
        logTest('Type definitions test', 'fail', error.message);
    }
}

// Test 3: Component Structure
function testComponentStructure() {
    console.log('\n🧩 Testing Component Structure...');
    
    try {
        const componentsPath = path.join(__dirname, 'src', 'components');
        if (fs.existsSync(componentsPath)) {
            const components = fs.readdirSync(componentsPath, { recursive: true });
            
            // Check for UI components
            const uiComponents = components.filter(comp => 
                comp.includes('ui') && comp.endsWith('.tsx')
            );
            
            if (uiComponents.length > 0) {
                logTest('UI components', 'pass', `Found ${uiComponents.length} UI components`);
            } else {
                logTest('UI components', 'warn', 'No UI components found');
            }
            
            // Check for feature components
            const featureComponents = components.filter(comp => 
                !comp.includes('ui') && comp.endsWith('.tsx')
            );
            
            if (featureComponents.length > 0) {
                logTest('Feature components', 'pass', `Found ${featureComponents.length} feature components`);
            } else {
                logTest('Feature components', 'warn', 'No feature components found');
            }
            
        } else {
            logTest('Components directory', 'fail', 'Components directory not found');
        }
    } catch (error) {
        logTest('Component structure test', 'fail', error.message);
    }
}

// Test 4: Page Routes
function testPageRoutes() {
    console.log('\n🛣️  Testing Page Routes...');
    
    try {
        const appPath = path.join(__dirname, 'src', 'app');
        if (fs.existsSync(appPath)) {
            
            // Expected routes
            const expectedRoutes = [
                'page.tsx',           // Home
                'tasks/page.tsx',     // Tasks
                'sprint/page.tsx',    // Sprint list
                'sprint/new/page.tsx',// New sprint
                'journal/[dayId]/page.tsx', // Journal
                'calendar/page.tsx',  // Calendar
                'progress/page.tsx',  // Progress
                'settings/page.tsx'   // Settings
            ];
            
            expectedRoutes.forEach(route => {
                const routePath = path.join(appPath, route);
                if (fs.existsSync(routePath)) {
                    logTest(`Route: /${route.replace('/page.tsx', '').replace('page.tsx', '')}`, 'pass', 'Page file exists');
                } else {
                    logTest(`Route: /${route.replace('/page.tsx', '').replace('page.tsx', '')}`, 'fail', 'Page file missing');
                }
            });
            
        } else {
            logTest('App directory', 'fail', 'App directory not found');
        }
    } catch (error) {
        logTest('Page routes test', 'fail', error.message);
    }
}

// Test 5: Package Dependencies
function testPackageDependencies() {
    console.log('\n📦 Testing Package Dependencies...');
    
    try {
        const packageJsonPath = path.join(__dirname, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            // Check for essential dependencies
            const essentialDeps = [
                'next',
                'react',
                'react-dom',
                'firebase',
                'typescript'
            ];
            
            const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            essentialDeps.forEach(dep => {
                if (allDeps[dep]) {
                    logTest(`Dependency: ${dep}`, 'pass', `Version: ${allDeps[dep]}`);
                } else {
                    logTest(`Dependency: ${dep}`, 'fail', 'Not found in package.json');
                }
            });
            
            // Check for UI library (shadcn/ui or similar)
            const uiLibs = ['@radix-ui/react-dialog', '@radix-ui/react-slot', 'lucide-react', 'class-variance-authority'];
            const hasUILib = uiLibs.some(lib => allDeps[lib]);
            
            if (hasUILib) {
                logTest('UI library', 'pass', 'UI component library detected');
            } else {
                logTest('UI library', 'warn', 'No UI component library detected');
            }
            
        } else {
            logTest('Package.json', 'fail', 'package.json not found');
        }
    } catch (error) {
        logTest('Package dependencies test', 'fail', error.message);
    }
}

// Test 6: Environment Configuration
function testEnvironmentConfig() {
    console.log('\n🔧 Testing Environment Configuration...');
    
    try {
        // Check for environment files
        const envFiles = ['.env.local', '.env.example', '.env'];
        let foundEnvFile = false;
        
        envFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                foundEnvFile = true;
                logTest(`Environment file: ${file}`, 'pass', 'File exists');
                
                // Check for required Firebase env variables
                const content = fs.readFileSync(filePath, 'utf8');
                const requiredVars = [
                    'NEXT_PUBLIC_FIREBASE_API_KEY',
                    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
                    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
                ];
                
                requiredVars.forEach(varName => {
                    if (content.includes(varName)) {
                        logTest(`Env var: ${varName}`, 'pass', 'Variable defined');
                    } else {
                        logTest(`Env var: ${varName}`, 'warn', 'Variable not found');
                    }
                });
            }
        });
        
        if (!foundEnvFile) {
            logTest('Environment files', 'warn', 'No environment files found');
        }
        
    } catch (error) {
        logTest('Environment configuration test', 'fail', error.message);
    }
}

// Test 7: Build Configuration
function testBuildConfig() {
    console.log('\n⚙️  Testing Build Configuration...');
    
    try {
        // Check for Next.js config
        const nextConfigPath = path.join(__dirname, 'next.config.js');
        const nextConfigTsPath = path.join(__dirname, 'next.config.ts');
        
        if (fs.existsSync(nextConfigPath) || fs.existsSync(nextConfigTsPath)) {
            logTest('Next.js config', 'pass', 'Configuration file exists');
        } else {
            logTest('Next.js config', 'warn', 'No Next.js config file found');
        }
        
        // Check for TypeScript config
        const tsConfigPath = path.join(__dirname, 'tsconfig.json');
        if (fs.existsSync(tsConfigPath)) {
            logTest('TypeScript config', 'pass', 'tsconfig.json exists');
        } else {
            logTest('TypeScript config', 'fail', 'tsconfig.json missing');
        }
        
        // Check for Tailwind config
        const tailwindConfigs = ['tailwind.config.js', 'tailwind.config.ts'];
        let hasTailwind = false;
        
        tailwindConfigs.forEach(config => {
            if (fs.existsSync(path.join(__dirname, config))) {
                hasTailwind = true;
                logTest('Tailwind config', 'pass', `${config} exists`);
            }
        });
        
        if (!hasTailwind) {
            logTest('Tailwind config', 'warn', 'No Tailwind config found');
        }
        
    } catch (error) {
        logTest('Build configuration test', 'fail', error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Elevatr Career Success Tracker - Comprehensive Testing Suite');
    console.log('═'.repeat(60));
    
    testFirebaseConfig();
    testTypeDefinitions();
    testComponentStructure();
    testPageRoutes();
    testPackageDependencies();
    testEnvironmentConfig();
    testBuildConfig();
    
    // Generate summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    
    const total = testResults.passed + testResults.failed + testResults.warnings;
    
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings}`);
    console.log(`📊 Total: ${total}`);
    
    const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    // Determine overall status
    let overallStatus = 'PASS';
    if (testResults.failed > 0) {
        overallStatus = 'FAIL';
    } else if (testResults.warnings > 3) {
        overallStatus = 'WARN';
    }
    
    console.log(`\n🏆 Overall Status: ${overallStatus}`);
    
    // Save detailed results
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportData = {
        timestamp,
        summary: {
            passed: testResults.passed,
            failed: testResults.failed,
            warnings: testResults.warnings,
            total,
            successRate,
            overallStatus
        },
        details: testResults.details
    };
    
    fs.writeFileSync(`comprehensive-test-report-${timestamp}.json`, JSON.stringify(reportData, null, 2));
    console.log(`\n📝 Detailed report saved: comprehensive-test-report-${timestamp}.json`);
    
    return overallStatus === 'PASS';
}

// Run the tests
runAllTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
});
