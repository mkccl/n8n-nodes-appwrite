# n8n-nodes-appwrite-io

[![SEE IT IN ACTION](https://img.youtube.com/vi/m1XgTgTuDoI/0.jpg)](https://www.youtube.com/watch?v=m1XgTgTuDoI)



This is an n8n community node that lets you use [Appwrite](https://appwrite.io) in your n8n workflows.

Appwrite is an open-source backend-as-a-service platform that provides developers with a set of APIs and tools to build secure and scalable applications. This node allows you to interact with Appwrite's database functionality directly from n8n.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

This package is available on npm and can be installed in your n8n instance.

### Installation via n8n Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install**
3. Enter `n8n-nodes-appwrite-io` in **Enter npm package name**
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes
5. Select **Install**

After installation, the Appwrite node will be available in your node palette.

### Manual Installation (Alternative Method)

If you're running n8n via npm or have access to the installation directory:

#### For npm-based n8n installations:

1. Navigate to your n8n installation directory or global node_modules:
   ```bash
   cd ~/.n8n/
   ```

2. Install the package:
   ```bash
   npm install n8n-nodes-appwrite-io
   ```

3. Restart n8n:
   ```bash
   n8n start
   ```

#### For Docker installations:

Create a `package.json` file with your custom nodes and mount it:

```json
{
  "name": "n8n-custom-nodes",
  "version": "1.0.0",
  "description": "Custom nodes for n8n",
  "dependencies": {
    "n8n-nodes-appwrite-io": "^0.1.0"
  }
}
```

Then update your docker run command or docker-compose.yml to install custom nodes:

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -v $(pwd)/package.json:/home/node/package.json \
  docker.n8n.io/n8nio/n8n \
  npm install --prefix /home/node && n8n start
```

Or in docker-compose.yml:
```yaml
version: '3.8'
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - ~/.n8n:/home/node/.n8n
      - ./package.json:/home/node/package.json
    command: sh -c "npm install --prefix /home/node && n8n start"
```

After installation using any method, the Appwrite node will be available in your node palette.

## Operations

### Document Operations

- **Create**: Create a new document in a collection
- **Get**: Retrieve a specific document by ID
- **List**: List documents with advanced query support

### Query Features

The List operation supports two query modes:

1. **Query Builder**: Build queries using the UI with support for:
   - Equal, Not Equal comparisons
   - Less Than, Greater Than, Between ranges
   - Search, Starts With, Ends With text operations
   - Is Null, Is Not Null checks
   - Select specific attributes
   - Order Ascending/Descending

2. **Custom Query**: Write custom Appwrite queries directly using the Query API syntax

### Smart Features

#### Dynamic Collection Selector
The node features a dynamic collection dropdown that automatically fetches and displays all available collections from your Appwrite database. No more copying and pasting collection IDs!

#### Schema-Based Document Creation
When creating documents, choose between two input modes:

1. **Auto-Map from Collection Schema** (Recommended for beginners)
   - Automatically loads all attributes from your selected collection
   - Shows field type for each attribute (e.g., "email (string)", "age (integer)")
   - Clearly marks required fields with a `[Required]` label
   - Excludes Appwrite system fields (`$id`, `$createdAt`, `$updatedAt`, etc.)
   - Build documents field-by-field with auto-complete
   - Supports n8n expressions in field values

2. **JSON Input** (For advanced users)
   - Traditional JSON input for maximum flexibility
   - Use expressions like `{{ $json }}` to map data from previous nodes
   - Full control over document structure

## Credentials

To use this node, you need to set up Appwrite API credentials in n8n.

### Getting Your Appwrite Credentials

1. **API Endpoint**
   - For Appwrite Cloud: `https://cloud.appwrite.io/v1`
   - For self-hosted: Your Appwrite instance URL + `/v1` (e.g., `https://appwrite.yourdomain.com/v1`)

2. **Project ID**
   - Log in to your [Appwrite Console](https://cloud.appwrite.io/console)
   - Select your project
   - Go to **Settings**
   - Copy the **Project ID** (found at the top of the settings page)

3. **Database ID**
   - In your Appwrite Console, go to **Databases**
   - Select the database you want to use
   - Copy the **Database ID** from the URL or the database settings
   - Example: If URL is `https://cloud.appwrite.io/console/project-123/databases/database-456`, the Database ID is `database-456`

4. **API Key**
   - In your Appwrite Console, go to your project
   - Navigate to **Overview > Integrations > API Keys** (or **Settings > API Keys** in some versions)
   - Click **Create API Key**
   - Give it a descriptive name (e.g., "n8n Integration")
   - Set the **Expiration** (or select "Never" for no expiration)
   - Under **Scopes**, select the permissions needed:
     - For full database access, enable all `databases.*` scopes
     - Minimum required scopes:
       - `databases.read` - to list collections and read documents
       - `databases.write` - to create documents
   - Click **Create**
   - **Important**: Copy the API key immediately - you won't be able to see it again!

### Setting Up Credentials in n8n

1. In n8n, open the Appwrite node
2. Click on **Credential to connect with**
3. Click **Create New Credential**
4. Fill in the credential fields:
   - **API Endpoint**: Your Appwrite API endpoint (e.g., `https://cloud.appwrite.io/v1`)
   - **Project ID**: Your Appwrite project ID
   - **Database ID**: Your Appwrite database ID
   - **API Key**: The API key you created in Appwrite Console
5. Click **Save**

The credentials will be tested automatically. If successful, you're ready to use the Appwrite node!

## Compatibility

- Tested with n8n version 0.125.0+
- Compatible with Appwrite API v1
- Works with both Appwrite Cloud and self-hosted instances

## Usage

### Example 1: Create a Document (Schema Mode)

1. Add the Appwrite node to your workflow
2. Select **Document** as the resource
3. Select **Create** as the operation
4. Choose your **Collection** from the dropdown
5. Select **Auto-Map from Collection Schema** as the Data Input Mode
6. Click **Add Field** to add document fields
7. Select a **Field Name** from the dropdown (shows type and required status)
8. Enter the **Field Value** (supports expressions like `{{ $json.email }}`)
9. Repeat steps 6-8 for each field you want to populate
10. Optionally, add **Permissions** as a JSON array (e.g., `["read(\"any\")"]`)
11. Execute the node

### Example 1b: Create a Document (JSON Mode)

1. Add the Appwrite node to your workflow
2. Select **Document** as the resource
3. Select **Create** as the operation
4. Choose your **Collection** from the dropdown
5. Select **JSON** as the Data Input Mode
6. Enter **Document Data** as JSON (or use expressions like `{{ $json }}` to pass data from previous nodes)
7. Optionally, add **Permissions** as a JSON array (e.g., `["read(\"any\")"]`)
8. Execute the node

### Example 2: List Documents with Filters

1. Add the Appwrite node to your workflow
2. Select **Document** as the resource
3. Select **List** as the operation
4. Choose your **Collection** from the dropdown
5. Select **Query Builder** mode
6. Add query filters (e.g., Equal: attribute="status", value="active")
7. Execute the node

### Example 3: Get a Specific Document

1. Add the Appwrite node to your workflow
2. Select **Document** as the resource
3. Select **Get** as the operation
4. Choose your **Collection** from the dropdown
5. Enter the **Document ID**
6. Execute the node

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Database Documentation](https://appwrite.io/docs/products/databases)
- [Appwrite Query Documentation](https://appwrite.io/docs/products/databases/queries)
- [Appwrite API Reference](https://appwrite.io/docs/references)

## Development

### Building the Project

```bash
npm run build
```

### Development Mode (with watch)

```bash
npm run dev
```

### Testing Locally

See the [CLAUDE.md](./CLAUDE.md) file for detailed development instructions.

## License

[MIT](LICENSE.md)

## Feedback

If you have any issues or feedback, please file an issue on the [GitHub repository](https://github.com/mkccl/n8n-nodes-appwrite-io/issues).
