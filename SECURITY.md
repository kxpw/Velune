# Security Policy

## Supported Versions

Velune is currently pre-1.0. Security fixes are applied to the latest released
version. Older pre-release versions may not receive backports.

| Version                           | Security support                             |
| --------------------------------- | -------------------------------------------- |
| Latest published `velune` release | Supported                                    |
| Older `0.x` releases              | Not normally supported                       |
| Unreleased `main` branch          | Accepted for triage; not a supported release |

When a security fix is released, users should upgrade to the patched version
as soon as practical. A GitHub Security Advisory will identify affected and
fixed versions when that information is available.

## Reporting a Vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub's private vulnerability reporting for this repository:

<https://github.com/kxpw/Velune/security/advisories/new>

Include as much of the following as possible:

- affected package, component, version, or commit;
- environment and configuration needed to reproduce the issue;
- prerequisites and step-by-step reproduction;
- a minimal proof of concept that does not contain real user data;
- expected impact and the security boundary that is crossed;
- known workarounds, mitigations, or suggested fixes;
- whether the issue has been disclosed anywhere else.

Do not include active credentials, personal data, or data taken from systems
you do not own or have permission to test. If private reporting is unavailable,
open a public issue containing only a request for a private contact channel;
do not include vulnerability details.

## Response Process

Maintainers will acknowledge a complete report as soon as practical, validate
the impact privately, and keep the reporter informed when the status changes.
The usual process is:

1. Confirm receipt and request missing reproduction details.
2. Reproduce the issue and determine affected versions and severity.
3. Prepare a fix and regression tests in private when confidentiality is
   required.
4. Coordinate a release and disclosure date with the reporter.
5. Publish the patched release and a GitHub Security Advisory.
6. Request a CVE when the impact and ecosystem reach justify one.

Response and remediation time depend on severity, complexity, maintainer
availability, and release risk. This policy intentionally does not promise an
SLA the project cannot reliably meet.

## Scope

Useful reports include:

- cross-site scripting or unsafe URL handling caused by library behavior;
- focus, overlay, or isolation defects that cross a meaningful security
  boundary;
- prototype pollution or unsafe object merging;
- dependency, release, or build-pipeline compromise;
- published package contents containing credentials or unintended files;
- server-rendering behavior that exposes sensitive data across requests;
- a documented security control that can be bypassed in a supported
  configuration.

Reports are most useful when they demonstrate impact in Velune itself rather
than only in an application that uses unsafe consumer code.

## Out of Scope

Use the normal issue tracker for:

- general bugs, visual defects, or accessibility issues without a security
  boundary;
- unsupported browsers, versions, or unpublished development snapshots;
- automated scanner output without a reproducible impact on Velune;
- self-XSS that requires a user to paste code into developer tools;
- denial-of-service claims without realistic input, scale, or boundary impact;
- vulnerabilities that exist only because an application disables browser
  protections or renders untrusted HTML outside Velune;
- already public dependency advisories without evidence that the vulnerable
  path is reachable through Velune.

Spam, social engineering, physical attacks, and testing that disrupts services
or accesses other people's data are not authorized.

## Responsible Security Research

When testing Velune:

- use systems and data you own or have explicit permission to test;
- make the minimum requests necessary to demonstrate the issue;
- stop if you encounter personal data, credentials, or signs of service
  disruption;
- do not establish persistence, move laterally, or degrade availability;
- give maintainers reasonable time to investigate and release a fix;
- comply with applicable laws and third-party terms.

Maintainers will not pursue action against good-faith research that follows
this policy. This statement does not authorize testing third-party systems or
waive requirements imposed by their owners.

## Coordinated Disclosure

Please allow maintainers reasonable time to investigate and publish a fix
before public disclosure. Do not publish exploit details, open a public pull
request, or notify downstream users before a coordinated disclosure date.

After a fix is available, the advisory should describe affected versions,
impact, mitigations, the fixed version, and appropriate credit without exposing
unnecessary user data or operational details.

## Dependency Reports

For an unpublished dependency concern, use the same private reporting channel
and identify the dependency, advisory or proof of concept, reachable Velune code
path, and available fixed version. Public dependency advisories can be reported
through a normal issue when no confidential exploit details are involved.

## Recognition and Bounties

Reporters of valid vulnerabilities will be credited in the advisory unless
they prefer to remain anonymous. Velune does not currently operate a paid bug
bounty program, and submitting a report does not create an entitlement to
payment.
