# Learning

A place to track what I still need to understand better — concepts behind features already in the repo, but not yet internalized.

## Why this folder exists

Building something and *understanding* it are different speeds. Code ships before JWT, OAuth, Clerk, or infra details feel solid. This folder holds that gap explicitly: study notes, prompts, links, and checklists tied to real code paths in the project.

Each file is a personal backlog for one topic. Notes can be rough and incomplete. Strike items off as confidence grows. Remove or archive a file when you no longer need it.

## Index

| Topic | File | Status | Relates to |
|-------|------|--------|------------|
| Auth — JWT, OAuth 2.0, RFC 9728/8414, Clerk user model, orgs vs non-orgs | [auth-knowledge-gaps.md](auth-knowledge-gaps.md) | open | `apps/web/src/auth/`, MCP OAuth routes, Clerk |

## Adding a new learning doc

1. Create `topic-slug.md` in this folder (title, what to learn, study prompts, links, pointers to relevant code).
2. Add a row to the index table above.
