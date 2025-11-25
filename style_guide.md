# Style Guide

## Foreword

This style guide outlines the coding standards and best practices for Clinician Toolkit Webapp.

At the time of writing this document is written to be aspirational rather than descriptive of the current state of the repository. Upon acceptance, a refactor will happen to align the codebase with these standards for all styling-related divergences. Code related divergences (e.g. test coverage) will slowly be addressed over time as files are edited for other reasons.

This is intended to be a living document; it should be adjusted in accordance with the needs of the project as they arise. The goal is to ensure consistency across the codebase to improve readability and collaboration among developers.

## Project Structure

### Route Organization

**Pages**: All page routes must be placed in `routes/(pages)/` directory.

**API Endpoints**: All API endpoints must be placed in `routes/(api)/api/v1/` directory (or later version tags for future API versions).

### Library Structure

The `$lib` directory should contain:

- `$lib/shadcn/` - shadcn-svelte components following default shadcn structure.
- `$lib/components/` - custom components that are used across multiple pages.
- `$lib/server` - serverside components and functionality.
- `$lib/docx` and `$lib/server/docx` - client-side and server-side handling of Word documents
- `$lib/utils.ts` - shared utility functions.
  - Prefer keeping functions with the components/pages that use them unless multiple use-cases already exist.

Note: components specific to a single page belong in `routes/(pages)/[pageName]/components/`

## API Endpoints

### Directory Structure

Each API endpoint directory must contain:

- `+server.ts` - the actual endpoint handlers
  - Endpoints should appear in the following order: GET, POST, PUT, PATCH, DELETE. Remaining methods follow DELETE in alphabetical order.
- `index.ts` - path exports, Zod schemas, and TypeScript types

Example structure:

```
routes/(api)/api/v1/users/[userId]/posts/
├── +server.ts
└── index.ts
```

The root `index.ts` file for each version (e.g., `api/v1/index.ts`) should re-export all paths, schemas, and types from its child endpoint directories.

Endpoints whose primary purpose is file download must have URLs terminating in `/download`

### Path Exports and Schemas

Every endpoint must export a path object, schemas, and types from its `index.ts` file. Path objects must include a `pattern` string, a successCodes numeric list, and a `path` function for constructing the URL. Their name should be in SCREAMING_SNAKE_CASE, must start with the method and be followed by a descriptor of the endpoint.

```typescript
import { z } from "zod"

// Schemas as Zod schemas
export const createUserPostSchema = z.object({
    title: z.string(),
    content: z.string()
})

export const getUserPostsQuerySchema = z.object({
    status: z.enum(["draft", "published"]).optional(),
    limit: z.coerce.number().optional()
})

// Request types as Typescript types
export type CreateUserPostRequest = z.infer<typeof createUserPostSchema>
export type GetUserPostsQuery = z.infer<typeof getUserPostsQuerySchema>

// Response types as Typescript types
export type UserPostResponse = {
    id: string
    userId: string
    title: string
    content: string
    createdAt: string
}

export type UserPostsListResponse = {
    posts: UserPostResponse[]
    total: number
}

// Path export
export const GET_USER_POSTS = {
    pattern: "/api/v1/users/[userId]/posts",
    path: (userId: string, query?: GetUserPostsQuery) => {
        const url = `/api/v1/users/${userId}/posts`
        if (!query) return url
        const params = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]))
        return `${url}?${params}`
    },
    successCodes: [200] as const
}
```


## Components

### Naming & Organization

Components should use PascalCase for file naming (e.g., `UserProfile.svelte`), while component-specific logic files should use camelCase (e.g., `userHelpers.ts`). Props and event handler names should consistently use camelCase, such as `userName`, `isActive`, `onClick`, `handleSubmit`, and `onButtonClick`. Classes should also use PascalCase, and constants use SCREAMING_SNAKE_CASE.

## Authentication & Authorization

Authentication is handled via SSO and falls outside the scope of this guide. Authorization must be performed on every request using SvelteKit server-side hooks. Clinician Toolkit currently has two authorization levels: Public endpoints are accessible to all authenticated users, while Admin endpoints are restricted to administrators only. The authorization hook maintains a list (or reference to a list) of all endpoints that do not require administrative privileges. All endpoints default to admin-only access following a deny-by-default security model, where administrators have access to all endpoints. This approach ensures that forgetting to whitelist a public endpoint results in it remaining admin-only until explicitly corrected.

## Type Safety & Validation

### The `any` Type

The `any` type is forbidden. Use `unknown` when the type is genuinely unknown, explicit union types when you know the possible types, `never` for impossible cases and generic types for reusable functions

### Client-Side Requests

Pages with client-side fetch requests should include a `requests.ts` file in the same directory as `+page.svelte`. The `requests.ts` file handles all request/response logic for the page, including:

**Structure**:

```typescript
import type { UserResponse } from "$lib/api/v1/users"
import { USERS } from "$lib/api/v1/users"

export async function fetchUser (
    id: number,
    onError: (error: Error) => void = defaultErrorHandler
): Promise<UserResponse | undefined> {
    try {
        const response = await fetch(USERS.path(String(id)))
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        onError(error as Error)
        return undefined
    }
}
```

Every function in `requests.ts` must accept an `onError` callback parameter for handling errors. HTTP response handling is determined on a per-endpoint basis, but should generally treat 2XX and 3XX status codes as success and all others as errors. Functions should return the server response as-is without any transformation, using type definitions that already exist in the API endpoint's `index.ts` file.

## Code Organization

### File Structure

Typescript files and the `<script>` block of Svelte files should follow this ordering:

1. Imports
2. Constants
3. Module-level code
4. Functions/Classes
    - Exported functions/classes should appear near the top
    - Private functions should appear at the end of classes

This is explicitly more of a guideline than a rule; deviations are acceptable.

## Testing

### Unit Tests

All `.ts` files must have a corresponding `.test.ts` file. From the publication of this style guide forward, any PR that touches a `.ts` file must add a `.test.ts` file unless good reason is given. Test files should live alongside their source files.

### End-to-End Tests

All page files should have tests for their basic functionality with regards to buttons that appear, are clickable etcetera... These tests should mock calls to external services, and be placed with the file they test as `.spec.ts` files. End-to-end tests based on the fully deployed architecture should run through the basic operations of each page and will be stored in `/e2e`

## Documentation

### Code Comments

Code should be self-documenting. Comments should be used sparingly to explain _why_, not _what_. JSDoc comments should be used for API handlers to provide a brief description of the endpoint's purpose, for complex algorithms or business logic that may not be immediately apparent, and for non-obvious behavior or edge cases that developers should be aware of. Avoid documenting obvious behavior that's clear from the code itself, information already captured in type signatures, or redundant descriptions of what the code does.

## Linting & Formatting

All code must be formatted using Prettier and checked for quality issues with ESLint. Any code merged into the repository must pass all linting checks.

## Version Control

**Commit Messages**: Use clear, descriptive commit messages following the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).

**Pull Requests**: Pull Requests (PRs) must include a description of changes, and link to the Notion ticket at the end of the title. Commits should be squashed before merging (use Github's Squash + Merge option). Squashed commit messages should follow the same guidelines as regular commit messages. Example PR title: `feat: Add Azure OpenAI endpoint [DCH-123]`

PRs should be as small as possible while still delivering a complete piece of functionality. Ideally, follow the principle of one ticket is one PR. If a ticket is too large for a single PR, create child tickets. If multiple tickets are required to deliver a single piece of functionality, consider linking them in Notion.
