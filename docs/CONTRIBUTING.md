# Contributing to Elevatr Career Success Tracker

Thank you for your interest in contributing to Elevatr! We welcome contributions from everyone, whether you're fixing bugs, adding features, improving documentation, or sharing ideas.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a new branch** for your feature/fix
4. **Make your changes** and test them
5. **Submit a pull request**

## 🛠️ Development Setup

### Prerequisites
- Node.js 18 or later
- npm or yarn
- Git
- Firebase account (for backend features)

### Local Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/elevatr.git
cd elevatr

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

## 📝 Code Style

We use ESLint and Prettier to maintain consistent code style:

```bash
# Run linting
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Check TypeScript types
npm run type-check

# Build project
npm run build
```

### Style Guidelines
- Use **TypeScript** for all new code
- Follow **React** best practices and hooks
- Use **Tailwind CSS** for styling
- Write **meaningful commit messages**
- Add **JSDoc comments** for complex functions
- Maintain **responsive design** principles

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── contexts/              # React context providers
├── services/              # External service integrations
├── types/                 # TypeScript type definitions
├── lib/                   # Utility functions and helpers
└── hooks/                 # Custom React hooks
```

## 🎯 What to Contribute

### 🐛 Bug Fixes
- Check existing issues for known bugs
- Create a new issue if bug isn't reported
- Include reproduction steps and environment details
- Write tests for bug fixes when possible

### ✨ New Features
- Check roadmap and existing feature requests
- Open an issue to discuss the feature first
- Follow existing patterns and conventions
- Include documentation and tests
- Update README if needed

### 📚 Documentation
- Fix typos and grammar
- Add missing documentation
- Improve code comments
- Update README and guides
- Create tutorials and examples

### 🎨 UI/UX Improvements
- Follow existing design patterns
- Ensure responsive design
- Test on multiple devices
- Consider accessibility (a11y)
- Maintain dark/light theme support

## 🔄 Pull Request Process

### Before Submitting
1. **Test your changes** thoroughly
2. **Run linting** and fix any issues
3. **Update documentation** if needed
4. **Add tests** for new functionality
5. **Ensure build passes** locally

### PR Guidelines
- **Clear title** describing the change
- **Detailed description** of what and why
- **Link related issues** using keywords (fixes #123)
- **Include screenshots** for UI changes
- **Keep PRs focused** - one feature per PR
- **Respond to feedback** promptly

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests pass

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors/warnings
```

## 🏷️ Issue Guidelines

### Bug Reports
```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Environment**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Version: [e.g. 1.0.0]

**Additional context**
Screenshots, logs, etc.
```

### Feature Requests
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives**
Other solutions considered

**Additional context**
Mockups, examples, etc.
```

## 🎖️ Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub** contributor graphs
- **Discord** special roles (when available)

## 📋 Development Workflow

### Branch Naming
- `feature/add-user-avatars`
- `fix/login-error-handling`
- `docs/update-installation-guide`
- `refactor/simplify-auth-context`

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user avatar upload functionality
fix: resolve login redirect issue
docs: update Firebase setup instructions
refactor: simplify notification context
```

### Release Process
1. **Version bumping** follows semantic versioning
2. **Changelog** updated for each release
3. **Release notes** highlight major changes
4. **Migration guides** for breaking changes

## 🤝 Community Guidelines

### Code of Conduct
- **Be respectful** and inclusive
- **Help others** learn and grow
- **Give constructive feedback**
- **Assume positive intent**
- **Follow GitHub's terms**

### Communication
- **GitHub Issues** for bugs and features
- **Discussions** for questions and ideas
- **Discord** for real-time chat (coming soon)
- **Email** for security issues

## 🔒 Security

### Reporting Security Issues
**DO NOT** create public issues for security vulnerabilities.

Instead:
1. Email: security@elevatr.app
2. Include detailed description
3. Provide reproduction steps
4. We'll respond within 48 hours

### Security Best Practices
- **Never commit** API keys or secrets
- **Use environment variables** for configuration
- **Validate all inputs** on client and server
- **Follow Firebase security rules**
- **Keep dependencies updated**

## 📚 Resources

### Learning
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [GitHub Desktop](https://desktop.github.com/) - Git GUI
- [Figma](https://figma.com) - Design collaboration
- [Postman](https://postman.com) - API testing

## ❓ Questions?

Need help getting started? Have questions about contributing?

- 📧 **Email**: contribute@elevatr.app
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/elevatr/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/elevatr/issues)

---

**Thank you for contributing to Elevatr! Together, we're building the future of career development.** 🚀
