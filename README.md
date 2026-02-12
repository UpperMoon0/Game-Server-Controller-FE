# Game Server Controller UI

A modern desktop UI for managing game servers, built with Tauri and React TypeScript.

## Features

- **Dashboard**: Overview of cluster status, metrics, and quick actions
- **Node Management**: Add, configure, and monitor game server nodes
- **Server Management**: Create, start, stop, and delete game servers
- **Real-time Monitoring**: Live metrics and status updates
- **Cross-platform**: Desktop application for Windows, macOS, and Linux

## Quick Start

### Prerequisites

- Node.js 18+
- Rust (for Tauri)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run in development mode**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Build Tauri application**
   ```bash
   npm run tauri build
   ```

## Architecture

```
┌─────────────────────────────────────────┐
│           Tauri Desktop App              │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │          React Frontend           │   │
│  │  ┌──────┐ ┌──────┐ ┌──────────┐ │   │
│  │  │Dashboard│ │Nodes│ │Servers │ │   │
│  │  └──────┘ └──────┘ └──────────┘ │   │
│  └──────────────────────────────────┘   │
│              │                          │
│         REST API                        │
│              │                          │
│              ▼                          │
│  ┌──────────────────────────────────┐   │
│  │      Game Server Controller       │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: React 18, TypeScript
- **State Management**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Desktop**: Tauri
- **HTTP Client**: Axios
- **Charts**: Recharts

## Project Structure

```
game-server-controller-ui/
├── src/
│   ├── components/
│   │   ├── Common/          # Shared components
│   │   ├── Dashboard/       # Dashboard views
│   │   ├── NodeManager/     # Node management views
│   │   ├── ServerManager/   # Server management views
│   │   └── Settings/        # Settings views
│   ├── hooks/               # Custom React hooks
│   ├── services/           # API services
│   ├── store/              # State management
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── tauri.conf.json        # Tauri configuration
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run tauri dev` - Start Tauri dev environment
- `npm run tauri build` - Build Tauri application

## Configuration

Configure the UI through environment variables:

```env
VITE_API_URL=http://localhost:8080
```

Or through the Settings page in the application.

## API Integration

The UI communicates with the Controller through REST API:

- `GET /api/v1/nodes` - List nodes
- `GET /api/v1/servers` - List servers
- `POST /api/v1/servers` - Create server
- `POST /api/v1/servers/:id/action` - Server actions
- `GET /api/v1/metrics` - Cluster metrics

## Building Desktop App

### Windows
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

### macOS
```bash
npm run tauri build -- --target x86_64-apple-darwin
# For Apple Silicon
npm run tauri build -- --target aarch64-apple-darwin
```

### Linux
```bash
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/your-org/game-server-controller-ui/issues) page.
