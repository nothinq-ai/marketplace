# Nothinq SDK

A TypeScript SDK for building extensions that integrate with the Nothinq platform. This SDK provides a communication bridge between extensions and the Nothinq host application.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Extension Manifest](#extension-manifest)
  - [Basic Structure](#basic-structure)
  - [Manifest Properties](#manifest-properties)
    - [Required Fields](#required-fields)
    - [Optional Fields](#optional-fields)
    - [Metadata (`meta`)](#metadata-meta)
    - [UI Configuration (`ui`)](#ui-configuration-ui)
    - [Configuration Schema (`config_schema`)](#configuration-schema-config_schema)
    - [Authentication (`auth`)](#authentication-auth)
    - [MCP Server Configuration (`server`)](#mcp-server-configuration-server)
    - [Themes (`themes`)](#themes-themes)
    - [Commands (`commands`)](#commands-commands)
  - [Complete Example](#complete-example)
  - [Publishing Your Extension](#publishing-your-extension)
  - [Testing Manifest](#testing-manifest)
  - [Best Practices](#best-practices)
- [Core Concepts](#core-concepts)
  - [SDK Initialization](#sdk-initialization)
  - [Message Communication](#message-communication)
- [API Reference](#api-reference)
  - [SDK Interface](#sdk-interface)
    - [`inapp()`](#inapp-boolean)
    - [`onready()`](#onreadyhandler---void-void)
    - [`loaded()`](#loaded-void)
    - [`listen()`](#listenhandler-messagehandler---void)
    - [`dispatch()`](#dispatchmessage-basemessage-promisevoid)
  - [Configuration API](#configuration-api)
    - [`config.get()`](#configget-promiset)
    - [`config.set()`](#configsetconfig-extraconfigt-promisevoid)
  - [Theme API](#theme-api)
    - [`theme.get()`](#themeget-promisetheme)
  - [Environment API](#environment-api)
    - [`env.set()`](#envsetenv-recordstring-any-promisevoid)
  - [File System API](#file-system-api)
    - [`fs.read()`](#fsreadpath-string-promisestring--void)
    - [`fs.write()`](#fswritepath-string-data-string-promisevoid)
  - [AI API](#ai-api)
    - [`ai.insertContextInput()`](#aiinsertcontextinputcontext-promptcontext-promisevoid)
  - [Sandbox API](#sandbox-api)
    - [`sandbox.host()`](#sandboxhost-promisestring--void)
- [TypeScript Types](#typescript-types)
  - [`Theme`](#theme)
  - [`PromptContext`](#promptcontext)
  - [`Attachment`](#attachment)
  - [`ExtensionCredential`](#extensioncredential)
  - [`BaseMessage`](#basemessage)
- [Message Router](#message-router)
- [Advanced Usage](#advanced-usage)
  - [Custom Configuration Type](#custom-configuration-type)
  - [Handling Credentials](#handling-credentials)
  - [Lifecycle Management](#lifecycle-management)
- [Deprecated APIs](#deprecated-apis)
- [Best Practices](#best-practices-1)
- [Example Extension](#example-extension)
- [License](#license)

## Installation

```bash
npm install @nothinq/sdk
# or
yarn add @nothinq/sdk
# or
bun add @nothinq/sdk
```

## Quick Start

```typescript
import { createSDK } from "@nothinq/sdk";

// Create SDK instance with your config type
const sdk = createSDK<MyConfigType>();

// Wait for SDK to be ready
sdk.onready(() => {
  console.log("Extension is ready!");

  // Notify host that extension has loaded
  sdk.loaded();
});

// Check if running inside Nothinq app
if (sdk.inapp()) {
  console.log("Running inside Nothinq");
}
```

## Extension Manifest

Every Nothinq extension requires a `manifest.json` file that defines its metadata, configuration schema, and capabilities.

### Basic Structure

```json
{
  "identifier": "com.example.myextension",
  "author": "Your Name",
  "version": "1.0.0",
  "meta": {
    "description": "A brief description of your extension",
    "logo": "https://example.com/logo.png",
    "tags": ["productivity", "ai"]
  },
  "ui": {
    "url": "https://example.com/extension"
  }
}
```

### Manifest Properties

#### Required Fields

- **`identifier`** (string): Unique identifier for your extension (e.g., `com.company.extension`)
- **`author`** (string): Extension author name

#### Optional Fields

- **`version`** (string): Extension version following semver (e.g., `1.0.0`)
- **`system`** (string): System identifier if extension is system-level
- **`scope`** (string): Extension scope - `"workspace"` or `"user"` (default: `"user"`)
- **`overview`** (string): Detailed overview or documentation URL

#### Metadata (`meta`)

```json
{
  "meta": {
    "description": "Extension description shown in the store",
    "logo": "https://example.com/logo.png",
    "tags": ["category1", "category2"]
  }
}
```

#### UI Configuration (`ui`)

Define the extension's user interface:

```json
{
  "ui": {
    "url": "https://example.com/extension-ui"
  }
}
```

#### Configuration Schema (`config_schema`)

Define user-configurable settings with validation:

```json
{
  "config_schema": {
    "required": ["apiKey"],
    "properties": {
      "apiKey": {
        "key": "apiKey",
        "type": "string",
        "description": "Your API key"
      },
      "endpoint": {
        "key": "endpoint",
        "type": "string",
        "description": "API endpoint URL",
        "defaultValue": "https://api.example.com"
      },
      "enabled": {
        "key": "enabled",
        "type": "boolean",
        "description": "Enable the extension",
        "defaultValue": true
      },
      "maxRetries": {
        "key": "maxRetries",
        "type": "number",
        "description": "Maximum retry attempts",
        "defaultValue": 3
      },
      "mode": {
        "key": "mode",
        "type": "select",
        "description": "Operation mode",
        "defaultValue": "production",
        "options": [
          { "value": "development", "label": "Development" },
          { "value": "production", "label": "Production" }
        ]
      },
      "accessToken": {
        "key": "accessToken",
        "type": "auth",
        "description": "OAuth access token"
      }
    }
  }
}
```

**Field Types:**

- **`string`**: Text input

  ```json
  {
    "type": "string",
    "defaultValue": "default text"
  }
  ```

- **`number`**: Numeric input

  ```json
  {
    "type": "number",
    "defaultValue": 42
  }
  ```

- **`boolean`**: Checkbox/toggle

  ```json
  {
    "type": "boolean",
    "defaultValue": true
  }
  ```

- **`select`**: Dropdown selection

  ```json
  {
    "type": "select",
    "defaultValue": "option1",
    "options": [
      { "value": "option1", "label": "Option 1" },
      { "value": "option2", "label": "Option 2" }
    ]
  }
  ```

- **`auth`**: OAuth/authentication token
  ```json
  {
    "type": "auth",
    "description": "Authentication token"
  }
  ```

**Field Properties:**

- **`key`** (required): Property key matching the config object
- **`type`** (required): Field type (see above)
- **`description`**: Help text shown to users
- **`defaultValue`**: Default value for the field
- **`dependencies`**: Comma-separated list of dependent field keys

#### Authentication (`auth`)

Configure OAuth or API key authentication:

**OAuth 2.0 / OAuth 2.1:**

```json
{
  "auth": {
    "type": "oauth2",
    "authorization_endpoint": "https://provider.com/oauth/authorize",
    "token_endpoint": "https://provider.com/oauth/token",
    "refresh_endpoint": "https://provider.com/oauth/refresh",
    "scopes_supported": ["read", "write", "admin"]
  }
}
```

**API Key:**

```json
{
  "auth": {
    "type": "apiKey"
  }
}
```

#### MCP Server Configuration (`server`)

Integrate with Model Context Protocol servers:

```json
{
  "server": {
    "type": "stdio",
    "command": "node",
    "args": ["server.js"],
    "env": {
      "API_KEY": "{{config.apiKey}}"
    }
  }
}
```

**Server Types:**

- **`stdio`**: Standard input/output communication

  ```json
  {
    "type": "stdio",
    "command": "node",
    "args": ["server.js"],
    "env": { "KEY": "value" }
  }
  ```

- **`http`**: HTTP-based communication

  ```json
  {
    "type": "http",
    "url": "https://api.example.com/mcp",
    "headers": {
      "Authorization": "Bearer {{config.apiKey}}"
    }
  }
  ```

- **`sse`**: Server-Sent Events
  ```json
  {
    "type": "sse",
    "url": "https://api.example.com/events",
    "headers": {
      "Authorization": "Bearer {{config.apiKey}}"
    }
  }
  ```

#### Themes (`themes`)

Provide custom themes for the Nothinq interface:

```json
{
  "themes": [
    {
      "id": "dark-theme",
      "name": "Dark Theme",
      "url": "https://example.com/themes/dark.json",
      "type": "dark"
    },
    {
      "id": "light-theme",
      "name": "Light Theme",
      "url": "https://example.com/themes/light.json",
      "type": "light"
    }
  ]
}
```

#### Commands (`commands`)

Define commands that can be triggered (future support):

```json
{
  "commands": ["command.id1", "command.id2"]
}
```

### Complete Example

```json
{
  "identifier": "com.example.stripe",
  "author": "Example Corp",
  "version": "1.2.0",
  "scope": "workspace",
  "overview": "https://docs.example.com/stripe-extension",
  "meta": {
    "description": "Stripe payment integration for Nothinq",
    "logo": "https://example.com/stripe-logo.png",
    "tags": ["payments", "stripe", "commerce"]
  },
  "ui": {
    "url": "https://extension.example.com/stripe"
  },
  "auth": {
    "type": "oauth2",
    "authorization_endpoint": "https://connect.stripe.com/oauth/authorize",
    "token_endpoint": "https://connect.stripe.com/oauth/token",
    "scopes_supported": ["read_write"]
  },
  "config_schema": {
    "required": ["apiKey", "mode"],
    "properties": {
      "apiKey": {
        "key": "apiKey",
        "type": "auth",
        "description": "Stripe API key"
      },
      "mode": {
        "key": "mode",
        "type": "select",
        "description": "Operating mode",
        "defaultValue": "test",
        "options": [
          { "value": "test", "label": "Test Mode" },
          { "value": "live", "label": "Live Mode" }
        ]
      },
      "webhookSecret": {
        "key": "webhookSecret",
        "type": "string",
        "description": "Webhook signing secret",
        "dependencies": "mode"
      },
      "enableLogging": {
        "key": "enableLogging",
        "type": "boolean",
        "description": "Enable detailed logging",
        "defaultValue": false
      },
      "timeout": {
        "key": "timeout",
        "type": "number",
        "description": "Request timeout in seconds",
        "defaultValue": 30
      }
    }
  },
  "server": {
    "type": "http",
    "url": "https://api.stripe.com/mcp",
    "headers": {
      "Authorization": "Bearer {{config.apiKey}}"
    }
  },
  "themes": [
    {
      "id": "stripe-dark",
      "name": "Stripe Dark",
      "url": "https://extension.example.com/themes/dark.json",
      "type": "dark"
    }
  ]
}
```

### Publishing Your Extension

1. **Create manifest.json** in your extension root
2. **Validate the manifest** against the schema
3. **Test locally** using the Nothinq development tools
4. **Submit for review** through the Nothinq extension store

### Testing Manifest

To test your manifest locally:

```typescript
import { createSDK } from "@nothinq/sdk";

const sdk = createSDK<YourConfigType>();

sdk.onready(async () => {
  // Get the config defined in your manifest
  const config = await sdk.config.get();
  console.log("Config:", config);

  // Config will match your config_schema structure
  console.log("API Key:", config.apiKey);
  console.log("Mode:", config.mode);
});
```

### Best Practices

1. **Use semantic versioning** for your extension version
2. **Provide clear descriptions** for all config fields
3. **Set sensible defaults** for optional configuration
4. **Request minimal permissions** needed for functionality
5. **Validate required fields** in your config_schema
6. **Use dependencies** to show/hide conditional fields
7. **Test with different configurations** before publishing
8. **Keep your manifest up to date** with code changes

## Core Concepts

### SDK Initialization

The SDK automatically handles the connection handshake between your extension and the Nothinq host application. It uses a two-way ready state system to ensure both sides are properly initialized before allowing communication.

```typescript
const sdk = createSDK<ConfigType>();

sdk.onready(() => {
  // Both parent and child are ready
  // Safe to make API calls
});
```

### Message Communication

The SDK provides a message router for bidirectional communication:

```typescript
// Listen to specific message types
const unsubscribe = sdk.listen("custom.event", async (message) => {
  console.log("Received:", message);
  return { success: true };
});

// Listen to all messages
sdk.listen(async (message) => {
  console.log("Global handler:", message);
});

// Dispatch messages to host
await sdk.dispatch({
  type: "custom.action",
  data: { foo: "bar" },
});

// Cleanup
unsubscribe();
```

## API Reference

### SDK Interface

#### `inapp(): boolean`

Check if the extension is running inside the Nothinq application.

```typescript
if (sdk.inapp()) {
  // Extension is running in Nothinq
}
```

#### `onready(handler: () => void): void`

Register a callback that fires when both the extension and host are ready. If already ready, the handler is called immediately.

```typescript
sdk.onready(() => {
  console.log("Ready to communicate!");
});
```

#### `loaded(): void`

Notify the host application that the extension has finished loading.

```typescript
sdk.onready(() => {
  // Initialize your extension
  sdk.loaded();
});
```

#### `listen(handler: MessageHandler): () => void`

#### `listen(type: string, handler: MessageHandler): () => void`

Listen for messages from the host application. Returns an unsubscribe function.

```typescript
// Type-specific listener
const unsubscribe = sdk.listen("user.action", async (message) => {
  // Handle message
  return { status: "processed" };
});

// Global listener
sdk.listen(async (message) => {
  // Handle all messages
});
```

#### `dispatch(message: BaseMessage): Promise<void>`

Send a message to the host application.

```typescript
await sdk.dispatch({
  type: "extension.event",
  payload: { data: "value" },
});
```

### Configuration API

#### `config.get(): Promise<T>`

Retrieve the extension's configuration from the host.

```typescript
interface MyConfig {
  apiKey: string;
  endpoint: string;
}

const config = await sdk.config.get();
console.log(config.apiKey);
```

#### `config.set(config: ExtraConfig<T>): Promise<void>`

Update the extension's configuration. Can optionally include credential information.

```typescript
await sdk.config.set({
  apiKey: "new-key",
  endpoint: "https://api.example.com",
  credential: {
    accessToken: "token",
    refreshToken: "refresh",
    expiresIn: 3600,
  },
});
```

### Theme API

#### `theme.get(): Promise<Theme>`

Get the current theme settings from the host application.

```typescript
const theme = await sdk.theme.get();
console.log(theme.type); // 'dark' | 'light'
console.log(theme.background);
console.log(theme.foreground);
console.log(theme.border);
console.log(theme.primary);
```

### Environment API

#### `env.set(env: Record<string, any>): Promise<void>`

Set environment variables in the host application.

```typescript
await sdk.env.set({
  API_KEY: "secret",
  DEBUG: "true",
});
```

### File System API

#### `fs.read(path: string): Promise<string | void>`

Read a file from the host's file system.

```typescript
const content = await sdk.fs.read("/path/to/file.txt");
console.log(content);
```

#### `fs.write(path: string, data: string): Promise<void>`

Write data to a file in the host's file system.

```typescript
await sdk.fs.write("/path/to/file.txt", "Hello, World!");
```

### AI API

#### `ai.insertContextInput(context: PromptContext): Promise<void>`

Insert context into the AI prompt input.

```typescript
// Insert custom text context
await sdk.ai.insertContextInput({
  type: "custom",
  id: "ctx-1",
  name: "User Data",
  value: "Some context text",
});

// Insert file attachment
await sdk.ai.insertContextInput({
  type: "attachment",
  id: "file-1",
  name: "document.pdf",
  value: {
    name: "document.pdf",
    url: "https://example.com/doc.pdf",
    contentType: "application/pdf",
    size: 1024000,
  },
});
```

### Sandbox API

#### `sandbox.host(): Promise<string | void>`

Get the sandbox host URL.

```typescript
const host = await sdk.sandbox.host();
console.log("Sandbox host:", host);
```

## TypeScript Types

### `Theme`

```typescript
interface Theme {
  type: "dark" | "light";
  background: string;
  foreground: string;
  border: string;
  primary: string;
}
```

### `PromptContext`

```typescript
interface PromptContext {
  type?: "custom" | "attachment";
  value: string | Attachment;
  id: string;
  name: string;
  loading?: boolean;
}
```

### `Attachment`

```typescript
interface Attachment {
  name: string;
  url: string;
  contentType: string;
  size: number;
}
```

### `ExtensionCredential`

```typescript
interface ExtensionCredential {
  id: string;
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  expiresAt?: number;
  createdAt?: number;
  name?: string;
}
```

### `BaseMessage`

```typescript
interface BaseMessage {
  type: string;
  [key: string]: any;
}
```

## Message Router

The SDK includes a message router for handling incoming messages:

```typescript
import { MessageRouter, MessageHandler } from "@nothinq/sdk";

const router = new MessageRouter();

// Set handler for specific message type
router.setHandler("custom.event", async (message) => {
  return { processed: true };
});

// Set global handler
router.setGlobalHandler(async (message) => {
  console.log("All messages:", message);
});

// Handle a message
await router.handleMessage({ type: "custom.event", data: "test" });

// Remove handlers
router.removeHandler("custom.event");
router.removeGlobalHandler();
```

## Advanced Usage

### Custom Configuration Type

Define your extension's configuration interface:

```typescript
interface StripeConfig {
  apiKey: string;
  webhookSecret: string;
  mode: "test" | "live";
}

const sdk = createSDK<StripeConfig>();

sdk.onready(async () => {
  const config = await sdk.config.get();
  // config is typed as StripeConfig
  console.log(config.apiKey);
});
```

### Handling Credentials

Store and retrieve OAuth tokens or API credentials:

```typescript
await sdk.config.set({
  apiKey: "my-key",
  credential: {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresIn: 3600,
    expiresAt: Date.now() + 3600000,
    tokenType: "Bearer",
  },
});
```

### Lifecycle Management

```typescript
const sdk = createSDK<ConfigType>();

// 1. Wait for connection
sdk.onready(async () => {
  // 2. Initialize your extension
  await initializeExtension();

  // 3. Set up message listeners
  sdk.listen("user.action", handleUserAction);

  // 4. Notify host that loading is complete
  sdk.loaded();
});
```

## Deprecated APIs

The following APIs are deprecated and should not be used in new code:

- `deprecated_expose()` - Use the new SDK initialization instead
- `deprecated_connect()` - Use the new SDK initialization instead

For disconnecting proxies, use:

```typescript
import { disconnect } from "@nothinq/sdk";

disconnect(proxy);
```

## Best Practices

1. **Always wait for ready state**: Use `sdk.onready()` before making API calls
2. **Call `loaded()` when ready**: Notify the host when your extension is fully initialized
3. **Type your configuration**: Define a TypeScript interface for your config
4. **Handle errors**: Wrap SDK calls in try-catch blocks
5. **Clean up listeners**: Store unsubscribe functions and call them when needed
6. **Check `inapp()` status**: Gracefully handle running outside Nothinq

## Example Extension

```typescript
import { createSDK, PromptContext } from "@nothinq/sdk";

interface MyExtensionConfig {
  apiEndpoint: string;
  enabled: boolean;
}

const sdk = createSDK<MyExtensionConfig>();

// Initialize
sdk.onready(async () => {
  try {
    // Get configuration
    const config = await sdk.config.get();

    // Get theme for UI styling
    const theme = await sdk.theme.get();
    document.body.style.background = theme.background;

    // Listen for custom events
    sdk.listen("data.request", async (message) => {
      const data = await fetchData(config.apiEndpoint);
      return { data };
    });

    // Notify host we're ready
    sdk.loaded();
  } catch (error) {
    console.error("Initialization failed:", error);
  }
});

// Send custom events
async function sendNotification(text: string) {
  await sdk.dispatch({
    type: "extension.notification",
    message: text,
  });
}
```

## License

MIT
