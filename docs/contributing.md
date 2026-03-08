# Contributing

Contributions to Kurozora is always welcome! This guide covers the process for all repositories in the Kurozora organization.

## Getting Started

1. **Fork** the repository you want to contribute to
2. **Clone** your fork locally
3. **Create a branch** from `master` with a descriptive name
4. **Make your changes** following the guidelines below
5. **Submit a Pull Request** back to the original repository

## Repositories

| Repository | Language | Description |
|------------|----------|-------------|
| [kurozora-web](https://github.com/Kurozora/kurozora-web) | PHP (Laravel) | Backend API and web frontend |
| [kurozora-app](https://github.com/Kurozora/kurozora-app) | Swift | iOS and macOS application |
| [kurozora-android](https://github.com/Kurozora/kurozora-android) | Kotlin | Android application |
| [KurozoraKit](https://github.com/Kurozora/KurozoraKit) | Swift | Swift SDK |
| [kurozorakit-android](https://github.com/Kurozora/kurozorakit-android) | Kotlin | Kotlin SDK |
| [developer](https://github.com/Kurozora/developer) | VitePress | This documentation site |

## Code Style

### Swift
- Follow the [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)
- Use SwiftLint with the project's `.swiftlint.yml`
- Prefer `async/await` over completion handlers

### Kotlin
- Follow the [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- Use ktlint with the project's configuration
- Prefer coroutines over callbacks
- Use `sealed class`/`sealed interface` for state modeling

### PHP (Laravel)
- Follow PSR-12 coding standards
- Use Laravel Pint for formatting
- Write feature tests for new API endpoints

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(api): add music endpoint for soundtrack listing
fix(kotlin-sdk): resolve memory leak in Flow subscriptions
docs(developer): add KurozoraKit Kotlin installation guide
chore(ci): update GitHub Actions workflow
```

## Pull Request Process

1. Ensure your PR has a clear title and description
2. Reference any related issues (e.g., `Fixes #123`)
3. Add tests for new functionality
4. Update documentation if applicable
5. Ensure all CI checks pass
6. Request a review from a maintainer

## Documentation Contributions

This developer documentation is built with VitePress. To contribute:

```bash
# Clone
git clone https://github.com/Kurozora/developer.git
cd developer

# Install dependencies
pnpm install

# Run dev server
pnpm docs:dev

# Build for production
pnpm docs:build
```

Edit Markdown files in the `docs/` directory. The sidebar navigation is configured in `docs/.vitepress/config.ts`.

## Reporting Issues

- Use the appropriate repository's GitHub Issues
- Provide steps to reproduce, expected behavior, and actual behavior
- Include device/OS/SDK version information
- Attach screenshots or logs when relevant

## Code of Conduct

All contributors are expected to follow our Code of Conduct. Be respectful, constructive, and inclusive in all interactions.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License for SDKs, proprietary for the main app).
