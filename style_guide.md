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

Every endpoint must export an `Endpoint` instance, schemas, and types from its `index.ts` file. Endpoint instances are created using the `Endpoint` class from `$lib/utils`, which provides type-safe request handling with automatic validation. Endpoint names should be in PascalCase, starting with the HTTP method followed by a descriptor (e.g., `GetUserPosts`, `PostUserPost`, `PutUserPost`, `DeleteUserPost`). Always use named status codes from `StatusCode` rather than raw numbers.

```typescript
import { z } from "zod"
import { Endpoint, StatusCode } from "$lib/utils"
import type { posts } from "$lib/server/db/schema"

// Schemas as Zod schemas
export const postUserPostSchema = z.object({
    title: z.string(),
    content: z.string()
})

export const getUserPostsQuerySchema = z.object({
    status: z.enum(["draft", "published"]).optional(),
    limit: z.coerce.number().optional()
})

// Request types as TypeScript types
export type PostUserPostRequest = z.infer<typeof postUserPostSchema>
export type GetUserPostsQuery = z.infer<typeof getUserPostsQuerySchema>

// Response types as TypeScript types (infer from database schema when possible)
export type PostUserPostResponse = typeof posts.$inferSelect

export type GetUserPostsResponse = {
    posts: (typeof posts.$inferSelect)[]
    total: number
}

// Path function (accepts parameters for dynamic segments)
const getUserPostsPath = (userId: string | number) => `/api/v1/users/${userId}/posts`

// Endpoint export with GET method (includes query parameters in schema)
export const GetUserPosts = new Endpoint<GetUserPostsResponse, typeof getUserPostsPath>({
    method: "GET",
    path: getUserPostsPath,
    successCodes: [StatusCode.OK]
})

// Endpoint export with POST method (includes request body schema)
export const PostUserPost = new Endpoint<PostUserPostResponse, typeof getUserPostsPath, typeof postUserPostSchema>({
    method: "POST",
    path: getUserPostsPath,
    successCodes: [StatusCode.CREATED],
    schema: postUserPostSchema
})

// For blob responses (file downloads), specify responseType
const downloadPath = (userId: string | number, postId: string | number) =>
    `/api/v1/users/${userId}/posts/${postId}/download`

export const GetUserPostDownload = new Endpoint<Blob, typeof downloadPath>({
    method: "GET",
    path: downloadPath,
    successCodes: [StatusCode.OK],
    responseType: "blob"
})
```

## Components

### Naming & Organization

Components should use PascalCase for file naming (e.g., `UserProfile.svelte`), while component-specific logic files should use camelCase (e.g., `userHelpers.ts`). Props and event handler names should consistently use camelCase, such as `userName`, `isActive`, `onClick`, `handleSubmit`, and `onButtonClick`. Classes should also use PascalCase, and constants use SCREAMING_SNAKE_CASE.

## Authentication & Authorization

Authentication is handled via SSO and falls outside the scope of this guide. Authorization must be performed on every request using SvelteKit server-side hooks. Clinician Toolkit currently has two authorization levels: Public endpoints are accessible to all authenticated users, while Admin endpoints are restricted to administrators only. The authorization hook maintains a list (or reference to a list) of all endpoints that do not require administrative privileges. All endpoints default to admin-only access following a deny-by-default security model, where administrators have access to all endpoints. This approach ensures that forgetting to whitelist a public endpoint results in it remaining admin-only until explicitly corrected.

## Type Safety & Validation

### The `any` Type

The `any` type is forbidden unless absolutely necessary. Use `unknown` when the type is genuinely unknown, explicit union types when you know the possible types, `never` for impossible cases and generic types for reusable functions. In the rare case that `any` is required, a comment must be included with the reason for inclusion.

### Client-Side Requests

Client-side code should use the `Endpoint.fetch()` method for all API requests. This provides automatic type safety, request validation, and consistent error handling through the `FetchError` class.

**Structure**:

```typescript
import { GetUserPosts, PostUserPost } from "$api/v1/users/[userId]/posts"
import type { GetUserPostsResponse, PostUserPostRequest } from "$api/v1/users/[userId]/posts"
import { FetchError } from "$lib/utils"
import { toast } from "svelte-sonner"

// Example: GET request with path parameters
async function fetchUserPosts(userId: number): Promise<GetUserPostsResponse | undefined> {
    const result = await GetUserPosts.fetch({ pathArgs: [userId] })

    if (result instanceof FetchError) {
        toast.error(`Failed to fetch posts: ${result.message}`)
        return undefined
    }

    return result
}

// Example: POST request with path parameters and request body
async function createUserPost(userId: number, data: PostUserPostRequest): Promise<void> {
    const result = await PostUserPost.fetch({
        pathArgs: [userId],
        body: data
    })

    if (result instanceof FetchError) {
        toast.error(`Failed to create post: ${result.message}`)
        return
    }

    toast.success("Post created successfully")
}

// Example: File download
import { GetUserPostDownload } from "$api/v1/users/[userId]/posts/[postId]/download"
import { downloadBlob } from "$lib/utils"

async function downloadPost(userId: number, postId: number): Promise<void> {
    const result = await GetUserPostDownload.fetch({ pathArgs: [userId, postId] })

    if (result instanceof FetchError) {
        toast.error(`Failed to download: ${result.message}`)
        return
    }

    downloadBlob(result, "post.docx")
}
```

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

PRs should be as small as possible while still delivering a complete piece of functionality. Ideally, follow the principle of one ticket is one PR. If a ticket is too large for a single PR, create child tickets. If multiple tickets are required to deliver a single piece of functionality, consider linking them to a common parent ticket.
