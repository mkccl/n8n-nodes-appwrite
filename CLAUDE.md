# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package for FriendGrid (SendGrid integration). It provides a custom node that allows n8n workflows to interact with the SendGrid API for contact management operations. The project follows the n8n community node development standards.

## Build and Development Commands

### Building the Project
```bash
pnpm run build
```
Compiles TypeScript and copies icon files to `dist/` directory using gulp.

### Development Mode
```bash
pnpm run dev
```
Runs TypeScript compiler in watch mode for continuous compilation during development.

### Linting
```bash
pnpm lint              # Check for errors
pnpm lintfix           # Auto-fix errors when possible
pnpm run format        # Format code with Prettier
```

### Local Testing with n8n
The `run_n8n.sh` script automates the process of testing the node locally:
- Unlinks existing package from n8n
- Cleans and rebuilds the project
- Links the package to n8n's custom directory (`~/.n8n/custom`)
- Starts n8n with the custom node available

Manual testing steps:
1. Build the project: `pnpm run build`
2. Link globally: `npm link` (in project root)
3. Link to n8n: `cd ~/.n8n/custom && npm link n8n-nodes-friendgrid`
4. Start n8n: `n8n start`

## Code Architecture

### Project Structure
```
n8n-nodes-friendgrid/
├── credentials/              # Credential type definitions
│   └── FriendGridApi.credentials.ts
├── nodes/                    # Node implementations
│   └── FriendGrid/
│       ├── FriendGrid.node.ts       # Main node implementation
│       ├── FriendGrid.node.json     # Node metadata
│       └── *.svg                     # Icon files
├── dist/                     # Compiled output (generated)
└── gulpfile.js              # Build task for copying icons
```

### Key Components

**Credentials (`FriendGridApi.credentials.ts`)**
- Handles API authentication using Bearer token
- Credential name: `friendGridApi`
- Uses generic authentication with Authorization header
- Includes test request to validate credentials against SendGrid API

**Node Implementation (`FriendGrid.node.ts`)**
- Class: `FriendGrid` implements `INodeType`
- Current resources: Contact
- Current operations: Create
- Uses `requestWithAuthentication` helper for API calls
- API endpoint: `https://api.sendgrid.com/v3/marketing/contacts`

**Node Structure**
- `description`: Contains all UI metadata (displayName, properties, credentials)
- `execute()`: Main execution method that processes input items and makes API requests
- Properties define the node's UI fields (resource, operation, email, additionalFields)

### n8n Integration Points

**Package Configuration (`package.json`)**
- `n8n.n8nNodesApiVersion`: 1
- `n8n.credentials`: Points to compiled credential file in `dist/`
- `n8n.nodes`: Points to compiled node file in `dist/`
- Must include `"n8n-community-node-package"` in keywords

**Build Process**
1. TypeScript compiles `.ts` files to `.js` in `dist/`
2. Gulp task `build:icons` copies all `.png` and `.svg` files from `nodes/` and `credentials/` to `dist/`
3. Declaration files (`.d.ts`) are generated for type information

### TypeScript Configuration

- Target: ES2019 with strict mode enabled
- Module: CommonJS (required for n8n compatibility)
- Outputs to `dist/` with source maps and declarations
- Includes: `credentials/**/*`, `nodes/**/*`, and their JSON files

### Linting Configuration

Uses n8n-specific ESLint rules:
- `plugin:n8n-nodes-base/community` for package.json
- `plugin:n8n-nodes-base/credentials` for credential files
- `plugin:n8n-nodes-base/nodes` for node files

Some rules are intentionally disabled (see `.eslintrc.js`).

## Important Conventions

### Node Parameters
- Use `this.getNodeParameter()` to retrieve user inputs
- First argument is parameter name, second is item index
- Type assertion required for proper TypeScript typing

### API Requests
- Always use `this.helpers.requestWithAuthentication.call()` for authenticated requests
- Pass credential name as first parameter (`'friendGridApi'`)
- Use `OptionsWithUri` type from `request` package for options
- Set `json: true` for automatic JSON parsing

### Return Data
- Process each input item in a loop
- Collect responses in `returnData` array
- Return using `this.helpers.returnJsonArray(returnData)` wrapped in array

### Display Options
- Use `displayOptions.show` to conditionally display fields based on resource/operation selection
- Keeps UI clean and contextual

### Icons
- SVG or PNG format
- Referenced in node description via `icon: 'file:appwrite.svg'`
- Must be copied to `dist/` during build (handled by gulp)

## Notes

- The node currently has some naming inconsistencies (displayName: 'Appwrite' vs actual FriendGrid functionality)
- The node wraps SendGrid API but is branded as FriendGrid
- Only supports contact creation currently - can be extended with more resources/operations
- The plan is to write an n8n wrapper around the appwrite cli so the user can use it within n8n