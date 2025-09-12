# Screenshots Directory

This directory contains screenshots captured during Maestro test execution.

Screenshots are automatically generated during test runs and can help with:

- Visual verification of test steps
- Debugging failed tests
- Documentation of app flows
- Test reporting and analysis

## Screenshot Organization

- Screenshots are named based on the test step and timestamp
- Failed test screenshots are preserved for debugging
- Screenshots can be included in CI/CD test reports

## Cleanup

Screenshots should be periodically cleaned up to manage disk space:

```bash
# Clean old screenshots (older than 7 days)
find maestro/screenshots -name "*.png" -mtime +7 -delete
```
