# GitHub Actions CI/CD Instructions

## Overview

This project uses GitHub Actions for automated continuous integration and deployment. We have two main workflows:

1. **Deploy Workflow** - Automatically deploys playground to GitHub Pages
2. **Release Workflow** - Manages package versioning and NPM publishing

## Workflows Overview

### 📦 Deploy to GitHub Pages (`deploy.yml`)

**Purpose**: Automatically builds and deploys the playground demo application to GitHub Pages.

**Trigger**:

- Push to `main` branch

**Process**:

1. Checkout code
2. Setup pnpm and Node.js
3. Install dependencies
4. Build playground
5. Deploy to GitHub Pages

**Configuration**:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
permissions:
  contents: write
```

**Playground URL**: Your demo will be available at `https://<username>.github.io/<repo-name>/`

---

### 🚀 Release Workflow (`publish.yml`)

**Purpose**: Automates the package versioning and NPM publishing process using Changesets.

**Trigger**:

- Push tags matching `v*.*.*` pattern (e.g., `v1.0.0`, `v1.2.3`)

**Process**:

1. Checkout code with full history
2. Setup pnpm and Node.js
3. Install dependencies
4. Run Changesets action:
   - Creates version PR if changesets exist
   - Publishes to NPM when version PR is merged

**Configuration**:

```yaml
name: Release
on:
  push:
    tags:
      - 'v*.*.*'
permissions:
  contents: write
  pull-requests: write
```

## Setup Guide

### Initial Setup

#### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** (will be created automatically)
   - Folder: **/ (root)**
4. Save

The playground will be deployed to: `https://<username>.github.io/<repo-name>/`

#### 2. Configure NPM Publishing

##### Step 1: Create NPM Access Token

1. Visit [https://www.npmjs.com/settings/YOUR_USERNAME/tokens](https://www.npmjs.com/settings/)
2. Click **"Generate New Token"** → **"Automation"**
3. Token name: `GitHub Actions - keyboard-sequence-listener`
4. Permissions: **Automation** (bypasses 2FA for CI/CD)
5. Copy the generated token

##### Step 2: Add GitHub Secret

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Configuration:
   - **Name**: `NPM_TOKEN`
   - **Secret**: Paste your NPM token
5. Click **"Add secret"**

##### Step 3: Verify Package Configuration

Ensure `packages/keyboard-sequence-listener/package.json` has:

```json
{
  "name": "@daye-cli/keyboard-sequence-listener",
  "publishConfig": {
    "access": "public"
  }
}
```

## Release Process with Changesets

### Workflow

1. **Make Changes** - Develop features or fix bugs
2. **Create Changeset** - Document changes
3. **Merge to Main** - Trigger version PR creation
4. **Merge Version PR** - Automatically publish to NPM

### Step-by-Step Guide

#### 1. Make Your Changes

```bash
# Create a feature branch
git checkout -b feature/new-feature

# Make your changes
# ... edit files ...

# Commit changes
git commit -am "feat: add new feature"
```

#### 2. Create a Changeset

```bash
# Generate a changeset
pnpm changeset

# You'll be prompted with:
# 1. Which packages changed? (select with space, press enter)
# 2. What kind of change? (major/minor/patch)
# 3. Describe the changes
```

**Example Interaction**:

```
🦋  Which packages would you like to include?
◯ changed packages
  ◉ @daye-cli/keyboard-sequence-listener

🦋  What kind of change is this for @daye-cli/keyboard-sequence-listener?
❯ patch (0.0.4 → 0.0.5) - Bug fixes
  minor (0.0.4 → 0.1.0) - New features
  major (0.0.4 → 1.0.0) - Breaking changes

🦋  Please enter a summary for this change:
Add gamepad button mapping support

🦋  Is this your desired changeset?
Yes
```

This creates a file in `.changeset/` directory.

#### 3. Commit the Changeset

```bash
git add .changeset
git commit -m "chore: add changeset"
git push origin feature/new-feature
```

#### 4. Create Pull Request

1. Create PR to `main` branch
2. Review and merge when ready

#### 5. Automated Version PR

Once merged to `main`, GitHub Actions will:

1. Detect the changeset
2. Create a **"Version Packages"** PR automatically
3. This PR will:
   - Update version numbers in `package.json`
   - Update `CHANGELOG.md`
   - Remove consumed changesets

#### 6. Publish to NPM

1. Review the **"Version Packages"** PR
2. Merge it to `main`
3. GitHub Actions will automatically:
   - Build the package
   - Publish to NPM
   - Create a GitHub Release

## Version Bumping Strategy

Follow [Semantic Versioning](https://semver.org/):

### Patch (0.0.1 → 0.0.2)

**When**: Bug fixes, documentation updates, internal refactors

**Examples**:

- Fix memory leak in listener cleanup
- Update README examples
- Refactor internal methods (no API changes)

```bash
# Select: patch
pnpm changeset
```

### Minor (0.1.0 → 0.2.0)

**When**: New features, backward-compatible changes

**Examples**:

- Add new callback option (`onInput`)
- Add new predefined sequence
- Add new public method

```bash
# Select: minor
pnpm changeset
```

### Major (1.0.0 → 2.0.0)

**When**: Breaking changes, incompatible API changes

**Examples**:

- Remove or rename public methods
- Change function signatures
- Remove support for old options

```bash
# Select: major
pnpm changeset
```

## Manual Publishing (Fallback)

If automated publishing fails, you can publish manually:

### From Local Machine

```bash
# 1. Ensure you're on main branch
git checkout main
git pull origin main

# 2. Build the library
pnpm build:lib

# 3. Navigate to package directory
cd packages/keyboard-sequence-listener

# 4. Login to NPM (if not already)
npm login

# 5. Publish (with 2FA code if required)
npm publish --otp=123456
```

### Troubleshooting Manual Publish

**Issue**: "You must verify your email to publish packages"

- Solution: Verify your email on npmjs.com

**Issue**: "You must sign in with two-factor authentication"

- Solution: Add `--otp=YOUR_6_DIGIT_CODE` to publish command

**Issue**: "You cannot publish over the previously published version"

- Solution: Update version in `package.json` first

**Issue**: "You do not have permission to publish"

- Solution: Check package name is unique or you have access to the org

## Workflow Files Location

```
.github/
└── workflows/
    ├── deploy.yml    # GitHub Pages deployment
    └── publish.yml   # NPM publishing with Changesets
```

## Modifying Workflows

### Adding Build Steps

To add additional build or test steps:

```yaml
- name: Run tests
  run: pnpm test

- name: Run linting
  run: pnpm lint

- name: Type check
  run: pnpm type-check
```

### Changing Node.js Version

Update in both workflows:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change version here
```

### Changing pnpm Version

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10  # Change version here
```

### Adding Environment Variables

For secrets or environment variables:

```yaml
env:
  CUSTOM_VAR: ${{ secrets.CUSTOM_SECRET }}
  PUBLIC_VAR: 'some-value'
```

## Branch Protection Rules

### Recommended Settings

To prevent accidental direct pushes and ensure CI passes:

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Do not allow bypassing the above settings

## Monitoring Workflows

### View Workflow Runs

1. Go to **Actions** tab in your repository
2. Select a workflow from the left sidebar
3. Click on a specific run to see details

### Workflow Status Badge

Add to your README.md:

```markdown
[![Deploy](https://github.com/USERNAME/REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/deploy.yml)

[![Release](https://github.com/USERNAME/REPO/actions/workflows/publish.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/publish.yml)
```

### Debugging Failed Workflows

1. Click on the failed workflow run
2. Expand failed step to see logs
3. Common issues:
   - **Build failures**: Check TypeScript errors
   - **Permission denied**: Check secrets are configured
   - **NPM publish failed**: Verify NPM_TOKEN and package name
   - **Deploy failed**: Check GitHub Pages is enabled

## Common Scenarios

### Scenario 1: Release a Bug Fix

```bash
# 1. Fix the bug
git checkout -b fix/memory-leak
# ... make changes ...
git commit -am "fix: resolve memory leak in cleanup"

# 2. Create changeset (select patch)
pnpm changeset
# Select: patch
# Description: "Fix memory leak in listener cleanup"

# 3. Push and create PR
git add .changeset
git commit -m "chore: add changeset"
git push origin fix/memory-leak

# 4. Merge PR → Version PR created automatically
# 5. Merge Version PR → Published automatically
```

### Scenario 2: Add New Feature

```bash
# 1. Develop feature
git checkout -b feature/gamepad-support
# ... make changes ...
git commit -am "feat: add gamepad support"

# 2. Create changeset (select minor)
pnpm changeset
# Select: minor
# Description: "Add gamepad button mapping support"

# 3. Push and create PR
git add .changeset
git commit -m "chore: add changeset"
git push origin feature/gamepad-support

# 4. Merge PR → Version PR created
# 5. Merge Version PR → Published
```

### Scenario 3: Breaking Change

```bash
# 1. Make breaking change
git checkout -b breaking/new-api
# ... make changes ...
git commit -am "refactor!: redesign API structure"

# 2. Create changeset (select major)
pnpm changeset
# Select: major
# Description: "BREAKING: Redesign API - remove deprecated methods"

# 3. Follow same PR process
```

### Scenario 4: Update Playground Only

```bash
# No changeset needed for playground-only changes
git checkout -b docs/update-demo
# ... update playground ...
git commit -am "docs: update demo examples"
git push origin docs/update-demo

# Merge PR → Playground auto-deploys to GitHub Pages
# No NPM publish triggered
```

## Best Practices

### Do's ✅

1. **Always create changesets** for library changes
2. **Use semantic commit messages** (`feat:`, `fix:`, `docs:`, etc.)
3. **Test locally** before pushing (`pnpm build`)
4. **Review version PR** before merging
5. **Keep changesets descriptive** for changelog clarity
6. **One changeset per PR** for simplicity

### Don'ts ❌

1. **Don't manually edit** `CHANGELOG.md` (Changesets does this)
2. **Don't manually bump** version in `package.json` (unless manual publish)
3. **Don't skip changesets** for user-facing changes
4. **Don't merge multiple unrelated** changesets in one PR
5. **Don't commit** `.changeset/*.md` files from other branches

## Security Considerations

### Protecting Secrets

- ✅ Use GitHub Secrets for tokens
- ✅ Never commit tokens to repository
- ✅ Use "Automation" tokens for NPM (bypass 2FA)
- ✅ Rotate tokens periodically

### Permissions

Current workflow permissions:

```yaml
permissions:
  contents: write        # For creating releases & commits
  pull-requests: write   # For creating version PRs
```

**Minimal required permissions** - only what's needed for each workflow.

## Troubleshooting

### Deploy Workflow Issues

**Problem**: Playground not updating on GitHub Pages

**Solutions**:

1. Check Actions tab for errors
2. Verify GitHub Pages is enabled
3. Check `gh-pages` branch exists
4. Ensure `playground/dist` folder is created during build

---

**Problem**: Build fails with "Module not found"

**Solutions**:

1. Verify `pnpm install` completed successfully
2. Check workspace dependencies in `package.json`
3. Clear cache and retry

### Release Workflow Issues

**Problem**: NPM publish fails with "Unauthorized"

**Solutions**:

1. Verify `NPM_TOKEN` secret is set correctly
2. Check token has "Automation" permission
3. Ensure package name is unique or you have access
4. Verify `publishConfig.access: "public"` in package.json

---

**Problem**: Version PR not created after merge

**Solutions**:

1. Verify changeset files exist in `.changeset/` directory
2. Check workflow completed successfully in Actions tab
3. Ensure you merged to `main` branch
4. Look for error logs in Changesets action step

---

**Problem**: Publish happens but package not on NPM

**Solutions**:

1. Check NPM for package (may take a few minutes)
2. Verify package name in `package.json`
3. Check NPM account has required permissions
4. Review npm logs in workflow output

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [pnpm Action](https://github.com/pnpm/action-setup)
- [Semantic Versioning](https://semver.org/)
- [NPM Publishing](https://docs.npmjs.com/cli/v8/commands/npm-publish)
- [GitHub Pages](https://docs.github.com/en/pages)

## Getting Help

If you encounter issues:

1. Check workflow logs in GitHub Actions tab
2. Review this documentation
3. Search for similar issues in GitHub Actions discussions
4. Check Changesets troubleshooting guide
5. Verify all secrets and permissions are configured correctly

## Summary Checklist

Before pushing changes:

- [ ] Changes committed with semantic commit message
- [ ] Changeset created (if library changes)
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Changes tested in playground (if applicable)
- [ ] README updated (if API changes)
- [ ] TypeScript compiles without errors

Before merging Version PR:

- [ ] Version numbers are correct
- [ ] CHANGELOG entries are accurate
- [ ] All tests pass
- [ ] Playground still works with changes
- [ ] Ready for NPM publication

For production release:

- [ ] GitHub Secrets configured (NPM_TOKEN)
- [ ] GitHub Pages enabled
- [ ] Branch protection rules set (optional but recommended)
- [ ] Documentation is up to date
