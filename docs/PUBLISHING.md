# Publishing Quick Reference

Quick commands and steps for publishing Chartlite packages.

## Prerequisites Checklist

- [ ] npm account created
- [ ] npm token generated (Automation type)
- [ ] `NPM_TOKEN` added to GitHub Secrets
- [ ] All tests passing locally (`pnpm test`)
- [ ] Build successful (`pnpm build`)
- [ ] CHANGELOG.md updated

## Publishing Commands

### Automated (Recommended)

#### Using GitHub Actions
1. Go to Actions tab
2. Select "Release" workflow
3. Click "Run workflow"
4. Select version bump type
5. Packages automatically publish to npm

### Manual

#### Prepare Release
```bash
# 1. Ensure everything is clean
git status

# 2. Pull latest
git pull origin main

# 3. Install and build
pnpm install
pnpm build

# 4. Run tests
pnpm test

# 5. Check current version
cat packages/core/package.json | grep version
```

#### Bump Version
```bash
# Choose one:
cd packages/core && npm version patch  # 0.0.1 → 0.0.2
cd packages/core && npm version minor  # 0.0.1 → 0.1.0
cd packages/core && npm version major  # 0.0.1 → 1.0.0

# Get new version
NEW_VERSION=$(node -p "require('./packages/core/package.json').version")
echo $NEW_VERSION
```

#### Update Changelog
```bash
# Edit CHANGELOG.md manually
# Add entry for new version with changes
```

#### Commit and Tag
```bash
git add .
git commit -m "chore: release v$NEW_VERSION"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
git push origin main --tags
```

#### Publish to npm
```bash
# Core package
cd packages/core
pnpm publish --access public

# React package (when ready)
cd ../react
pnpm publish --access public
```

#### Create GitHub Release
```bash
# Using GitHub CLI
gh release create "v$NEW_VERSION" --generate-notes

# Or manually on GitHub:
# Go to Releases → Draft new release → Select tag → Publish
```

## Version Guidelines

### Semantic Versioning (SemVer)

- **MAJOR** (1.0.0): Breaking changes
  - API changes that break existing code
  - Removed features
  - Major architectural changes

- **MINOR** (0.1.0): New features
  - New chart types
  - New configuration options
  - New framework wrappers
  - Backward compatible changes

- **PATCH** (0.0.1): Bug fixes
  - Bug fixes
  - Performance improvements
  - Documentation updates
  - Internal refactoring

### Pre-releases

```bash
# Alpha release
npm version prerelease --preid=alpha  # 0.1.0-alpha.0

# Beta release
npm version prerelease --preid=beta   # 0.1.0-beta.0

# Release candidate
npm version prerelease --preid=rc     # 0.1.0-rc.0

# Publish pre-release
pnpm publish --access public --tag next
```

## Verification

### After Publishing

```bash
# Check npm package
npm view @chartlite/core
npm view @chartlite/react

# Test installation
mkdir /tmp/test-chartlite
cd /tmp/test-chartlite
npm init -y
npm install @chartlite/core
node -e "console.log(require('@chartlite/core'))"
```

### Check Package Contents

```bash
# Before publishing, see what will be included
cd packages/core
npm pack --dry-run

# Or create tarball
npm pack
tar -tzf chartlite-core-*.tgz
```

## Rollback

### Unpublish (within 72 hours)

```bash
# Unpublish specific version
npm unpublish @chartlite/core@0.1.0

# ⚠️  Use with caution! Can only unpublish within 72 hours
```

### Deprecate (preferred)

```bash
# Deprecate a version
npm deprecate @chartlite/core@0.1.0 "Please upgrade to 0.1.1"

# Undeprecate
npm deprecate @chartlite/core@0.1.0 ""
```

## Troubleshooting

### Package Already Exists
```
Error: 403 Forbidden - PUT https://registry.npmjs.org/@chartlite%2fcore
```

**Solutions:**
- Choose a different package name
- Verify you own the npm scope
- Check you're logged in: `npm whoami`

### Not Logged In
```
Error: You must be logged in to publish packages
```

**Solution:**
```bash
npm login
# Enter username, password, email, OTP
```

### Version Already Published
```
Error: You cannot publish over the previously published versions
```

**Solution:**
```bash
# Bump version again
npm version patch
```

### Build Artifacts Missing
```
Error: ENOENT: no such file or directory, stat 'dist/index.js'
```

**Solution:**
```bash
pnpm build
```

## npm Commands Reference

```bash
# Login to npm
npm login

# Check who you're logged in as
npm whoami

# View package info
npm view @chartlite/core

# View all versions
npm view @chartlite/core versions

# View latest version
npm view @chartlite/core version

# View package downloads
npm view @chartlite/core downloads

# Search for packages
npm search chartlite

# List package files
npm pack --dry-run

# Set package access
npm access public @chartlite/core
npm access restricted @chartlite/core

# Manage organization
npm org ls chartlite
npm org add chartlite username

# View dist-tags
npm dist-tag ls @chartlite/core

# Add dist-tag
npm dist-tag add @chartlite/core@0.1.0 latest
```

## Release Checklist

- [ ] All changes committed
- [ ] Tests passing (`pnpm test`)
- [ ] Build successful (`pnpm build`)
- [ ] Linting clean (`pnpm lint`)
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] Changes pushed to GitHub
- [ ] Packages published to npm
- [ ] GitHub Release created
- [ ] Installation verified
- [ ] Documentation updated
- [ ] Announcement posted (optional)

## Contact

For publishing access or questions:
- GitHub: [yourusername/chartlite/issues](https://github.com/yourusername/chartlite/issues)
- npm: [@chartlite](https://www.npmjs.com/org/chartlite)
