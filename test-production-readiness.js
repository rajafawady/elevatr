/**
 * Production Readiness Testing Suite for Elevatr Career Success Tracker
 * Final validation before deployment
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🚀 Production Readiness Testing Suite');
console.log('═'.repeat(60));

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

// Test 1: Essential Files Validation
function testEssentialFiles() {
    console.log('\n📁 Testing Essential Files...');
    
    const essentialFiles = [
        'package.json',
        'next.config.js',
        'tsconfig.json',
        'tailwind.config.ts',
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/services/firebase.ts',
        'src/types/index.ts',
        '.env.local'
    ];
    
    essentialFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size > 0) {
                logTest(`File: ${file}`, 'pass', `${stats.size} bytes`);
            } else {
                logTest(`File: ${file}`, 'warn', 'Empty file');
            }
        } else {
            logTest(`File: ${file}`, 'fail', 'File missing');
        }
    });
}

// Test 2: All Required Pages
function testAllPages() {
    console.log('\n📄 Testing All Application Pages...');
    
    const requiredPages = [
        'src/app/page.tsx',
        'src/app/tasks/page.tsx',
        'src/app/sprint/page.tsx',
        'src/app/sprint/new/page.tsx',
        'src/app/journal/[dayId]/page.tsx',
        'src/app/calendar/page.tsx',
        'src/app/progress/page.tsx',
        'src/app/settings/page.tsx'
    ];
    
    requiredPages.forEach(page => {
        const pagePath = path.join(__dirname, page);
        if (fs.existsSync(pagePath)) {
            const content = fs.readFileSync(pagePath, 'utf8');
            
            // Check for proper Next.js page structure
            if (content.includes('export default')) {
                logTest(`Page: ${page.split('/').slice(-2).join('/')}`, 'pass', 'Valid page component');
            } else {
                logTest(`Page: ${page.split('/').slice(-2).join('/')}`, 'fail', 'Missing default export');
            }
            
            // Check for client-side markers if needed
            if (content.includes('useState') || content.includes('useEffect')) {
                if (content.includes("'use client'")) {
                    logTest(`Client directive: ${page.split('/').slice(-2).join('/')}`, 'pass', 'Proper use client directive');
                } else {
                    logTest(`Client directive: ${page.split('/').slice(-2).join('/')}`, 'warn', 'Missing use client directive');
                }
            }
        } else {
            logTest(`Page: ${page.split('/').slice(-2).join('/')}`, 'fail', 'Page file missing');
        }
    });
}

// Test 3: Firebase Configuration
function testFirebaseSetup() {
    console.log('\n🔥 Testing Firebase Configuration...');
    
    const firebasePath = path.join(__dirname, 'src/services/firebase.ts');
    if (fs.existsSync(firebasePath)) {
        const content = fs.readFileSync(firebasePath, 'utf8');
        
        // Check for essential Firebase imports
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
        
        let importScore = 0;
        requiredImports.forEach(imp => {
            if (content.includes(imp)) {
                importScore++;
            }
        });
        
        if (importScore === requiredImports.length) {
            logTest('Firebase imports', 'pass', 'All required imports present');
        } else if (importScore >= 7) {
            logTest('Firebase imports', 'warn', `${importScore}/${requiredImports.length} imports found`);
        } else {
            logTest('Firebase imports', 'fail', `Only ${importScore}/${requiredImports.length} imports found`);
        }
        
        // Check for CRUD operations
        const crudOperations = [
            'createSprint',
            'getSprintsByUser',
            'updateSprint',
            'deleteSprint',
            'createTask',
            'getTasksByUser',
            'updateTask',
            'deleteTask'
        ];
        
        let crudScore = 0;
        crudOperations.forEach(op => {
            if (content.includes(op)) {
                crudScore++;
            }
        });
        
        if (crudScore >= 6) {
            logTest('CRUD operations', 'pass', `${crudScore}/${crudOperations.length} operations implemented`);
        } else {
            logTest('CRUD operations', 'warn', `Only ${crudScore}/${crudOperations.length} operations implemented`);
        }
        
    } else {
        logTest('Firebase service', 'fail', 'firebase.ts not found');
    }
}

// Test 4: UI Components
function testUIComponents() {
    console.log('\n🎨 Testing UI Components...');
    
    const uiPath = path.join(__dirname, 'src/components/ui');
    if (fs.existsSync(uiPath)) {
        const uiComponents = fs.readdirSync(uiPath).filter(file => file.endsWith('.tsx'));
        
        if (uiComponents.length >= 5) {
            logTest('UI components count', 'pass', `${uiComponents.length} components found`);
        } else {
            logTest('UI components count', 'warn', `Only ${uiComponents.length} components found`);
        }
        
        // Check for essential UI components
        const essentialComponents = ['Button.tsx', 'Card.tsx', 'Badge.tsx'];
        essentialComponents.forEach(comp => {
            if (uiComponents.includes(comp)) {
                logTest(`UI component: ${comp}`, 'pass', 'Component exists');
            } else {
                logTest(`UI component: ${comp}`, 'warn', 'Component missing');
            }
        });
    } else {
        logTest('UI components directory', 'fail', 'UI components directory not found');
    }
}

// Test 5: Type Definitions
function testTypeDefinitions() {
    console.log('\n📝 Testing Type Definitions...');
    
    const typesPath = path.join(__dirname, 'src/types/index.ts');
    if (fs.existsSync(typesPath)) {
        const content = fs.readFileSync(typesPath, 'utf8');
        
        const requiredTypes = ['Task', 'Sprint', 'JournalEntry', 'User'];
        let typeScore = 0;
        
        requiredTypes.forEach(type => {
            if (content.includes(`interface ${type}`) || content.includes(`type ${type}`)) {
                typeScore++;
                logTest(`Type: ${type}`, 'pass', 'Type definition found');
            } else {
                logTest(`Type: ${type}`, 'fail', 'Type definition missing');
            }
        });
        
        if (typeScore === requiredTypes.length) {
            logTest('Type completeness', 'pass', 'All core types defined');
        } else {
            logTest('Type completeness', 'warn', `${typeScore}/${requiredTypes.length} types defined`);
        }
    } else {
        logTest('Types file', 'fail', 'types/index.ts not found');
    }
}

// Test 6: Security and Environment
function testSecurity() {
    console.log('\n🔒 Testing Security Configuration...');
    
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        
        // Check for Firebase environment variables
        const firebaseVars = [
            'NEXT_PUBLIC_FIREBASE_API_KEY',
            'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
            'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
            'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
            'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
            'NEXT_PUBLIC_FIREBASE_APP_ID'
        ];
        
        let envScore = 0;
        firebaseVars.forEach(varName => {
            if (content.includes(varName)) {
                envScore++;
            }
        });
        
        if (envScore >= 4) {
            logTest('Environment variables', 'pass', `${envScore}/${firebaseVars.length} Firebase vars configured`);
        } else {
            logTest('Environment variables', 'fail', `Only ${envScore}/${firebaseVars.length} Firebase vars configured`);
        }
        
        // Check for sensitive data exposure
        if (content.includes('password') || content.includes('secret')) {
            logTest('Sensitive data check', 'warn', 'Potential sensitive data in env file');
        } else {
            logTest('Sensitive data check', 'pass', 'No obvious sensitive data exposed');
        }
    } else {
        logTest('Environment file', 'warn', 'No .env.local file found');
    }
}

// Test 7: Build Dependencies
function testBuildDependencies() {
    console.log('\n📦 Testing Build Dependencies...');
    
    const packagePath = path.join(__dirname, 'package.json');
    if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Check essential dependencies
        const essential = {
            'next': 'Next.js framework',
            'react': 'React library',
            'react-dom': 'React DOM',
            'typescript': 'TypeScript',
            'firebase': 'Firebase SDK'
        };
        
        Object.entries(essential).forEach(([dep, desc]) => {
            if (deps[dep]) {
                logTest(`Dependency: ${dep}`, 'pass', `${desc} - ${deps[dep]}`);
            } else {
                logTest(`Dependency: ${dep}`, 'fail', `${desc} missing`);
            }
        });
        
        // Check for development tools
        const devTools = ['eslint', 'tailwindcss', '@types/node'];
        let devScore = 0;
        devTools.forEach(tool => {
            if (deps[tool]) {
                devScore++;
            }
        });
        
        if (devScore >= 2) {
            logTest('Development tools', 'pass', `${devScore}/${devTools.length} dev tools configured`);
        } else {
            logTest('Development tools', 'warn', `Only ${devScore}/${devTools.length} dev tools configured`);
        }
    } else {
        logTest('Package.json', 'fail', 'package.json not found');
    }
}

// Test 8: Application Structure
function testApplicationStructure() {
    console.log('\n🏗️  Testing Application Structure...');
    
    const requiredDirectories = [
        'src/app',
        'src/components',
        'src/components/ui',
        'src/services',
        'src/types',
        'src/contexts'
    ];
    
    requiredDirectories.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            logTest(`Directory: ${dir}`, 'pass', `${files.length} files/subdirectories`);
        } else {
            logTest(`Directory: ${dir}`, 'fail', 'Directory missing');
        }
    });
}

// Generate Final Report
function generateFinalReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PRODUCTION READINESS ASSESSMENT');
    console.log('═'.repeat(60));
    
    const total = testResults.passed + testResults.failed + testResults.warnings;
    const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;
    
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⚠️  Warnings: ${testResults.warnings}`);
    console.log(`📊 Total Tests: ${total}`);
    console.log(`🎯 Success Rate: ${successRate}%`);
    
    // Determine readiness level
    let readinessLevel = 'NOT READY';
    let recommendations = [];
    
    if (testResults.failed === 0 && successRate >= 90) {
        readinessLevel = 'PRODUCTION READY ✅';
        recommendations.push('Application is ready for production deployment');
        recommendations.push('Consider monitoring setup and backup procedures');
    } else if (testResults.failed <= 2 && successRate >= 85) {
        readinessLevel = 'MOSTLY READY ⚠️';
        recommendations.push('Address failed tests before deployment');
        recommendations.push('Review warnings for potential improvements');
    } else if (testResults.failed <= 5 && successRate >= 70) {
        readinessLevel = 'NEEDS WORK ❌';
        recommendations.push('Fix critical issues before deployment');
        recommendations.push('Review application architecture');
    } else {
        readinessLevel = 'NOT READY ❌';
        recommendations.push('Significant work needed before deployment');
        recommendations.push('Review fundamental application setup');
    }
    
    console.log(`\n🏆 READINESS LEVEL: ${readinessLevel}`);
    console.log('\n📋 RECOMMENDATIONS:');
    recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
    });
    
    // Save detailed report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportData = {
        timestamp,
        readinessLevel,
        summary: {
            passed: testResults.passed,
            failed: testResults.failed,
            warnings: testResults.warnings,
            total,
            successRate
        },
        recommendations,
        details: testResults.details
    };
    
    fs.writeFileSync(`production-readiness-report-${timestamp}.json`, JSON.stringify(reportData, null, 2));
    console.log(`\n📝 Detailed report saved: production-readiness-report-${timestamp}.json`);
    
    return readinessLevel.includes('READY');
}

// Run all tests
async function runProductionTests() {
    testEssentialFiles();
    testAllPages();
    testFirebaseSetup();
    testUIComponents();
    testTypeDefinitions();
    testSecurity();
    testBuildDependencies();
    testApplicationStructure();
    
    return generateFinalReport();
}

// Execute tests
runProductionTests().then(isReady => {
    if (isReady) {
        console.log('\n🎉 Congratulations! Your application is ready for production deployment.');
    } else {
        console.log('\n⚠️  Please address the issues above before deploying to production.');
    }
    process.exit(isReady ? 0 : 1);
}).catch(error => {
    console.error('\n❌ Production testing failed:', error);
    process.exit(1);
});
