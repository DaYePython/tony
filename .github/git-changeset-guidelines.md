# Git Workflow and Changeset Guidelines

## Overview

This document outlines the Git workflow, commit conventions, and Changeset usage guidelines for the Keyboard Sequence Listener monorepo project.

## Table of Contents

1. [Git Commit Conventions](#git-commit-conventions)
2. [Branch Naming](#branch-naming)
3. [Pull Request Guidelines](#pull-request-guidelines)
4. [Changeset Workflow](#changeset-workflow)
5. [Version Management](#version-management)
6. [Common Workflows](#common-workflows)

---

## Git Commit Conventions

We follow **Conventional Commits** specification for clear and structured commit history.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| **feat** | New feature | `feat: add gamepad support` |
| **fix** | Bug fix | `fix: resolve memory leak in cleanup` |
| **docs** | Documentation changes | `docs: update API examples in README` |
| **style** | Code style changes (formatting, semicolons, etc.) | `style: format code with prettier` |
| **refactor** | Code refactoring without changing behavior | `refactor: simplify sequence matching logic` |
| **perf** | Performance improvements | `perf: optimize event listener binding` |
| **test** | Adding or updating tests | `test: add unit tests for timeout feature` |
| **build** | Build system or dependency changes | `build: upgrade rollup to v4.10` |
| **ci** | CI/CD configuration changes | `ci: add automated testing workflow` |
| **chore** | Other changes (maintenance, etc.) | `chore: update dependencies` |
| **revert** | Revert previous commit | `revert: revert "feat: add feature X"` |

### Scopes (Optional)

Scopes specify which part of the codebase is affected:

- `lib` - Library core
- `playground` - Playground/demo application
- `docs` - Documentation
- `deps` - Dependencies
- `release` - Release related
- `ci` - CI/CD
- `types` - TypeScript types

**Examples**:

```bash
feat(lib): add onInput callback option
fix(playground): correct demo animation timing
docs(readme): add Vue 3 integration example
build(deps): bump typescript to 5.3.3
```

### Breaking Changes

For breaking changes, add `!` after type/scope and include `BREAKING CHANGE:` in footer:

```bash
refactor!: redesign API structure

BREAKING CHANGE: The KeySequenceListener constructor now requires
options object instead of positional parameters.

Before:
  new KeySequenceListener(sequence, onMatch)

After:
  new KeySequenceListener({ sequence, onMatch })
```

### Commit Message Examples

#### Good Examples ✅

```bash
feat: add gamepad button mapping support

fix: prevent memory leak in gamepad polling

docs: add troubleshooting section to README

refactor(lib): extract input processing to separate method

feat(playground)!: migrate to Vue 3 Composition API

BREAKING CHANGE: Playground now requires Vue 3
```

#### Bad Examples ❌

```bash
update code                    # Too vague
Fixed bug                      # Not following convention
added new feature              # Should start with lowercase type
WIP                           # Work in progress commits should be squashed
feat add gamepad              # Missing colon
```

### Commit Best Practices

1. **Use imperative mood** - "add feature" not "added feature"
2. **Keep subject line under 72 characters**
3. **Separate subject from body with blank line**
4. **Use body to explain what and why, not how**
5. **Reference issues/PRs** - `Closes #123`, `Fixes #456`, `Related to #789`

**Example with body**:

```bash
fix: resolve race condition in timeout handler

The previous implementation could trigger onTimeout callback
even after the sequence was matched if timing was unlucky.

This fix ensures we always clear the timeout immediately
before calling onMatch.

Fixes #42
```

---

## Branch Naming

### Branch Name Format

```
<type>/<short-description>
```

### Branch Types

| Type | Purpose | Example |
|------|---------|---------|
| **feature/** | New features | `feature/gamepad-support` |
| **fix/** | Bug fixes | `fix/memory-leak` |
| **docs/** | Documentation only | `docs/update-readme` |
| **refactor/** | Code refactoring | `refactor/cleanup-types` |
| **perf/** | Performance improvements | `perf/optimize-polling` |
| **test/** | Adding tests | `test/add-unit-tests` |
| **chore/** | Maintenance tasks | `chore/update-deps` |
| **release/** | Release preparation | `release/v1.0.0` |
| **hotfix/** | Urgent production fixes | `hotfix/critical-bug` |

### Branch Naming Rules

1. **Use lowercase with hyphens** - `feature/add-feature` ✅ not `Feature/Add_Feature` ❌
2. **Be descriptive but concise** - `fix/timeout-race-condition` ✅ not `fix/bug` ❌
3. **No personal prefixes** - `feature/gamepad` ✅ not `john/feature/gamepad` ❌
4. **Use issue number if available** - `fix/42-memory-leak` ✅

### Branch Naming Examples

```bash
feature/once-mode
feature/gamepad-support
fix/timeout-not-working
fix/123-memory-leak-cleanup
docs/add-vue-examples
refactor/simplify-api
chore/upgrade-typescript
release/v2.0.0
hotfix/critical-security-issue
```

---

## Pull Request Guidelines

### PR Title Format

Follow the same convention as commits:

```
<type>[optional scope]: <description>
```

**Examples**:

```
feat: add gamepad support
fix: resolve memory leak in cleanup
docs: update README with new examples
```

### PR Description Template

```markdown
## Description
Brief summary of changes and motivation.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Changes Made
- Added X
- Updated Y
- Removed Z

## Related Issues
Closes #123
Related to #456

## Testing
- [ ] Tested locally
- [ ] Tested in playground
- [ ] Manual testing completed
- [ ] No console errors

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Changeset created (if user-facing changes)
- [ ] Build passes locally
- [ ] No TypeScript errors

## Screenshots (if applicable)
![Before](url)
![After](url)
```

### PR Best Practices

1. **Keep PRs focused** - One feature/fix per PR
2. **Write clear descriptions** - Explain what and why
3. **Link related issues** - Use `Closes #123`, `Fixes #456`
4. **Request reviews** - Tag appropriate reviewers
5. **Keep PRs small** - Easier to review (aim for < 400 lines)
6. **Update documentation** - Keep README in sync
7. **Add changeset** - For user-facing changes
8. **Test thoroughly** - Both locally and in playground
9. **Resolve conflicts** - Keep branch up to date with main
10. **Respond to feedback** - Address review comments promptly

### PR Review Process

1. **Author**: Create PR with clear description
2. **Author**: Add changeset if needed
3. **Reviewers**: Review code, test locally if needed
4. **Author**: Address feedback and comments
5. **Reviewers**: Approve when ready
6. **Author/Maintainer**: Merge to main

---

## Changeset Workflow

### What is a Changeset?

A changeset is a way to declare changes that need to be released. It includes:

- Which packages are affected
- What type of version bump (major/minor/patch)
- A description of changes (for CHANGELOG)

### When to Create a Changeset

Create a changeset when your changes:

✅ **YES - Create changeset**:

- Add new public API features
- Fix user-facing bugs
- Modify public API behavior
- Update public documentation
- Add/remove dependencies
- Performance improvements users will notice

❌ **NO - Skip changeset**:

- Internal refactoring (no API changes)
- Update playground only
- Fix typos in code comments
- Update development dependencies
- Changes to CI/CD configuration
- Repository documentation (non-package)

### Creating a Changeset

#### Step 1: Run Changeset Command

```bash
pnpm changeset
```

#### Step 2: Select Packages

```
🦋  Which packages would you like to include?
◯ changed packages
  ◉ @daye-cli/keyboard-sequence-listener
```

Press **Space** to select, **Enter** to confirm.

#### Step 3: Choose Version Bump Type

```
🦋  What kind of change is this for @daye-cli/keyboard-sequence-listener?
❯ patch (1.0.4 → 1.0.5) - Bug fixes
  minor (1.0.4 → 1.1.0) - New features  
  major (1.0.4 → 2.0.0) - Breaking changes
```

**Version Bump Guide**:

| Type | When to Use | Example |
|------|-------------|---------|
| **patch** | Bug fixes, docs, internal changes | `1.0.4 → 1.0.5` |
| **minor** | New features (backward compatible) | `1.0.4 → 1.1.0` |
| **major** | Breaking changes | `1.0.4 → 2.0.0` |

#### Step 4: Write Summary

```
🦋  Please enter a summary for this change (this will be written to the changelog):
Add gamepad support with button mapping
```

**Writing Good Summaries**:

✅ **Good summaries**:

```
Add gamepad support with button mapping
Fix memory leak in listener cleanup
Add onInput callback for all key events
BREAKING: Remove deprecated resetSequence method
```

❌ **Bad summaries**:

```
update                          # Too vague
fixed some stuff                # Not descriptive
Added a new feature for users   # Too wordy
```

#### Step 5: Confirm

```
🦋  Is this your desired changeset?
Yes
```

A file will be created in `.changeset/` directory:

```
.changeset/
└── lovely-cats-jump.md
```

#### Step 6: Commit Changeset

```bash
git add .changeset
git commit -m "chore: add changeset"
git push
```

### Changeset File Format

Generated changeset file (`.changeset/random-name.md`):

```markdown
---
"@daye-cli/keyboard-sequence-listener": minor
---

Add gamepad support with button mapping
```

### Multiple Changes in One PR

If your PR includes multiple distinct changes, create multiple changesets:

```bash
# First change
pnpm changeset
# Select package, choose patch, describe fix

# Second change
pnpm changeset  
# Select package, choose minor, describe feature

# Both changesets will be in .changeset/ directory
git add .changeset
git commit -m "chore: add changesets"
```

### Editing Changesets

You can manually edit changeset files before committing:

```markdown
---
"@daye-cli/keyboard-sequence-listener": minor
---

Add gamepad support with configurable button mapping

This release includes:
- Full gamepad API integration
- Customizable button mappings
- Support for analog triggers
- Automatic gamepad detection
```

### Changeset Configuration

Configuration file: `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.2/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["playground"]
}
```

**Key settings**:

- `baseBranch: "main"` - Version PRs target main branch
- `ignore: ["playground"]` - Playground changes don't trigger versions
- `access: "public"` - Publish as public packages
- `commit: false` - Don't auto-commit changesets

---

## Version Management

### Semantic Versioning

We follow [Semver 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
  1  .  2  .  3
```

### Version Bump Examples

#### Patch (1.0.0 → 1.0.1)

**When**: Bug fixes, documentation, internal changes

**Examples**:

```bash
fix: correct TypeScript type definitions
fix: resolve memory leak in cleanup method
docs: update README examples
perf: optimize event listener performance (internal)
```

#### Minor (1.0.0 → 1.1.0)

**When**: New features, backward-compatible additions

**Examples**:

```bash
feat: add onInput callback option
feat: add new predefined sequence constants
feat: support custom timeout per sequence
feat: add getProgress() method
```

#### Major (1.0.0 → 2.0.0)

**When**: Breaking changes, incompatible API changes

**Examples**:

```bash
refactor!: change constructor to accept options object
feat!: remove deprecated methods
refactor!: rename KeySequence to SequenceArray
feat!: require explicit enableGamepad option
```

### Pre-release Versions

For beta/alpha releases:

```bash
# Create alpha version
1.0.0 → 1.1.0-alpha.0

# Create beta version
1.0.0 → 1.1.0-beta.0

# Release candidate
1.0.0 → 1.1.0-rc.0
```

**Publishing pre-releases**:

```bash
# In package directory
npm publish --tag next

# Users install with
npm install @daye-cli/keyboard-sequence-listener@next
```

### Version Lifecycle

1. **Development** - Make changes in feature branches
2. **Changeset Creation** - Document changes with changesets
3. **PR Merge** - Merge feature branch to main
4. **Version PR Creation** - Changesets bot creates "Version Packages" PR
5. **Version PR Review** - Review CHANGELOG and version bumps
6. **Version PR Merge** - Triggers automated NPM publish
7. **Release Published** - Package available on NPM

---

## Common Workflows

### Workflow 1: Adding a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/gamepad-support

# 2. Make changes
# ... edit files ...

# 3. Commit with conventional commit message
git add .
git commit -m "feat: add gamepad support with button mapping"

# 4. Create changeset
pnpm changeset
# Select: @daye-cli/keyboard-sequence-listener
# Choose: minor (new feature)
# Summary: "Add gamepad support with button mapping"

# 5. Commit changeset
git add .changeset
git commit -m "chore: add changeset"

# 6. Push and create PR
git push origin feature/gamepad-support

# 7. Create PR on GitHub
# Title: feat: add gamepad support
# Description: (use PR template)

# 8. Address review comments
# ... make changes ...
git add .
git commit -m "refactor: improve gamepad polling logic"
git push

# 9. Merge PR when approved
# (via GitHub UI)

# 10. Changesets bot creates Version PR automatically
# 11. Review and merge Version PR
# 12. Package published to NPM automatically
```

### Workflow 2: Fixing a Bug

```bash
# 1. Create fix branch
git checkout -b fix/memory-leak-cleanup

# 2. Fix the bug
# ... edit files ...

# 3. Commit fix
git add .
git commit -m "fix: resolve memory leak in listener cleanup"

# 4. Create changeset
pnpm changeset
# Select: @daye-cli/keyboard-sequence-listener
# Choose: patch (bug fix)
# Summary: "Fix memory leak in listener cleanup"

# 5. Commit changeset
git add .changeset
git commit -m "chore: add changeset"

# 6. Push and create PR
git push origin fix/memory-leak-cleanup

# 7. Merge and release (same as feature workflow)
```

### Workflow 3: Breaking Change

```bash
# 1. Create branch
git checkout -b refactor/redesign-api

# 2. Make breaking changes
# ... edit files ...

# 3. Commit with breaking change indicator
git add .
git commit -m "refactor!: change constructor to options object

BREAKING CHANGE: Constructor now requires options object
instead of positional parameters.

Before:
  new KeySequenceListener(sequence, onMatch)

After:
  new KeySequenceListener({ sequence, onMatch })"

# 4. Create changeset
pnpm changeset
# Select: @daye-cli/keyboard-sequence-listener
# Choose: major (breaking change)
# Summary: "BREAKING: Change constructor to options object"

# 5. Update documentation
# Edit README to reflect API changes

# 6. Commit changeset and docs
git add .
git commit -m "docs: update README for new API"

# 7. Push and create PR
git push origin refactor/redesign-api

# PR description should clearly document breaking changes
```

### Workflow 4: Documentation Only

```bash
# 1. Create branch
git checkout -b docs/add-examples

# 2. Update documentation
# ... edit README ...

# 3. Commit
git add .
git commit -m "docs: add Vue 3 integration examples"

# 4. NO changeset needed for docs-only changes

# 5. Push and create PR
git push origin docs/add-examples

# This won't trigger a version bump
```

### Workflow 5: Playground Updates

```bash
# 1. Create branch
git checkout -b feat/update-playground-demo

# 2. Update playground
# ... edit playground files ...

# 3. Commit
git add .
git commit -m "feat(playground): add gamepad demo section"

# 4. NO changeset needed (playground is in ignore list)

# 5. Push and create PR
git push origin feat/update-playground-demo

# Playground deploys to GitHub Pages automatically
# No NPM publish triggered
```

### Workflow 6: Hotfix for Production

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Fix the critical issue
# ... edit files ...

# 3. Commit
git add .
git commit -m "fix: patch critical security vulnerability

This fixes CVE-2024-XXXXX by sanitizing user input
before processing."

# 4. Create changeset
pnpm changeset
# Select: @daye-cli/keyboard-sequence-listener
# Choose: patch
# Summary: "Fix critical security vulnerability (CVE-2024-XXXXX)"

# 5. Commit changeset
git add .changeset
git commit -m "chore: add changeset"

# 6. Push and create PR with [URGENT] prefix
git push origin hotfix/critical-security-fix

# 7. Fast-track review and merge
# 8. Version PR will be created immediately
# 9. Merge Version PR to publish hotfix
```

---

## Changeset Commands Reference

### Create Changeset

```bash
pnpm changeset
```

### View Status

```bash
# See which changesets are pending
pnpm changeset status
```

### Version Packages (Locally)

```bash
# Updates version numbers and CHANGELOG
# (Usually done by CI)
pnpm changeset version
```

### Publish Packages (Locally)

```bash
# Publishes to NPM
# (Usually done by CI)
pnpm release
```

### Pre-release Mode

```bash
# Enter pre-release mode
pnpm changeset pre enter alpha

# Exit pre-release mode
pnpm changeset pre exit
```

---

## Git Commands Reference

### Branch Management

```bash
# Create new branch
git checkout -b feature/my-feature

# Switch branches
git checkout main

# List branches
git branch

# Delete branch (local)
git branch -d feature/my-feature

# Delete branch (remote)
git push origin --delete feature/my-feature
```

### Commit Management

```bash
# Stage changes
git add .
git add specific-file.ts

# Commit with message
git commit -m "feat: add new feature"

# Amend last commit
git commit --amend

# View commit history
git log --oneline

# View specific file history
git log -- path/to/file.ts
```

### Syncing with Remote

```bash
# Fetch latest changes
git fetch origin

# Pull latest changes
git pull origin main

# Push changes
git push origin feature/my-feature

# Force push (use with caution)
git push --force-with-lease origin feature/my-feature
```

### Stashing

```bash
# Stash changes
git stash

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{0}
```

---

## Best Practices Summary

### Git Commit Best Practices

1. ✅ Use conventional commit format
2. ✅ Write clear, descriptive messages
3. ✅ Commit logical units of work
4. ✅ Reference issues where applicable
5. ✅ Keep commits focused and atomic
6. ❌ Don't commit work-in-progress
7. ❌ Don't mix multiple concerns in one commit
8. ❌ Don't commit generated files

### Branch Best Practices

1. ✅ Use descriptive branch names with type prefix
2. ✅ Branch from main for new work
3. ✅ Keep branches up to date with main
4. ✅ Delete branches after merging
5. ✅ Keep branch scope focused
6. ❌ Don't work directly on main
7. ❌ Don't keep long-lived feature branches

### Changeset Best Practices

1. ✅ Create changeset for every user-facing change
2. ✅ Use correct version bump type (patch/minor/major)
3. ✅ Write clear, user-focused summaries
4. ✅ Create changeset before pushing
5. ✅ Review generated CHANGELOG before release
6. ❌ Don't create changesets for internal changes
7. ❌ Don't be vague in changeset descriptions
8. ❌ Don't mix multiple concerns in one changeset

### PR Best Practices

1. ✅ Keep PRs small and focused
2. ✅ Write comprehensive descriptions
3. ✅ Link related issues
4. ✅ Request reviews from appropriate people
5. ✅ Respond promptly to feedback
6. ✅ Test thoroughly before requesting review
7. ❌ Don't create massive PRs (>400 lines)
8. ❌ Don't leave PRs hanging without updates

---

## Troubleshooting

### Changeset Issues

**Problem**: "No changesets found"

**Solution**:

```bash
# Check if changesets exist
ls .changeset/

# Create a new changeset
pnpm changeset
```

---

**Problem**: "Version PR not created after merge"

**Solution**:

1. Verify changeset files were committed
2. Check GitHub Actions logs
3. Ensure changesets are in `.changeset/` directory
4. Verify `.changeset/config.json` is correct

---

**Problem**: "Wrong version bump type"

**Solution**:

```bash
# Delete the incorrect changeset file
rm .changeset/incorrect-changeset.md

# Create a new changeset with correct type
pnpm changeset
```

### Git Issues

**Problem**: "Merge conflicts"

**Solution**:

```bash
# Update your branch with latest main
git checkout main
git pull origin main
git checkout feature/my-feature
git merge main

# Resolve conflicts in your editor
# Then commit
git add .
git commit -m "chore: resolve merge conflicts"
```

---

**Problem**: "Accidentally committed to main"

**Solution**:

```bash
# Create a new branch from current state
git checkout -b feature/accidental-commit

# Reset main to remote state
git checkout main
git reset --hard origin/main

# Your changes are now in feature branch
git checkout feature/accidental-commit
```

---

**Problem**: "Need to undo last commit"

**Solution**:

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes
git reset --hard HEAD~1
```

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

---

## Quick Reference Card

### Commit Types

```
feat     - New feature
fix      - Bug fix
docs     - Documentation
style    - Formatting
refactor - Code restructuring
perf     - Performance
test     - Testing
build    - Build/dependencies
ci       - CI/CD
chore    - Maintenance
```

### Version Bumps

```
patch - Bug fixes (1.0.0 → 1.0.1)
minor - New features (1.0.0 → 1.1.0)
major - Breaking changes (1.0.0 → 2.0.0)
```

### Common Commands

```bash
# Changesets
pnpm changeset          # Create changeset
pnpm changeset status   # View pending changesets

# Git
git status              # Check status
git add .               # Stage all
git commit -m "msg"     # Commit
git push                # Push to remote
git pull                # Pull from remote

# Branches
git checkout -b name    # Create branch
git checkout main       # Switch to main
git branch -d name      # Delete branch
```
