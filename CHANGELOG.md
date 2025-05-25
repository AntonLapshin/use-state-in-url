# Changelog

All notable changes to this project will be documented in this file.

## [1.2.1] - 2024-01-XX

### Changed
- **BREAKING**: Removed the optional third `defaultValue` parameter from `useStateInUrl`. Now string parameters always default to empty string, and other types must use the object form with `defaultValue` property.
- Simplified API for better consistency

### Improved
- Better TypeScript type inference

## [1.2.0] - Previous Version

### Changed
- Refactored to infer type from `defaultValue` instead of requiring explicit `type` field
- **BREAKING**: Replaced `StateParam` interface with simpler `Param` interface
- Made `defaultValue` required when using object form

### Added
- Automatic type inference from default values
- Comprehensive tests for URL utilities

### Improved
- Simpler, more intuitive API
- Better code organization with separate utility modules
- Cleaner implementation with pure functions 