All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-04-23
### Added
- verbose logging will print processing time of a file
### Fixed
- compressing files over 2GB

## [2.0.0] - 2024-01-25
### Breaking
- compression is now done using Node's native zlib module, this requires Node v12 at least
### Fixed
- `--glob-skip-br-extension` option not working
- some compression crashes on newer Node versions
### Changed
- default window size (compression option) set to 24 (was 0)
### Dev
- huge deps upgrade
- huge cleanup

## [1.0.4] - 2023-01-07
### Dev
- dependencies update

## [1.0.3] - 2021-08-13
### Fixed
- crash when compressing empty files
### Dev
- dev dep upgrade

## [1.0.2] - 2021-07-09
### Changed
- README
### Dev
- tslib upgrade, some dev deps upgrades

## [1.0.1] - 2021-04-29
### Fixed
- not very meaningful no/bad command errors

## [1.0.0] - 2021-04-29
### Added
- glob pattern matching
- exit code 1 on error
- choose mode/quality
- cli help
- allow to overwrite files

## [0.0.1] - 2018-01-30
### Added
- first version
