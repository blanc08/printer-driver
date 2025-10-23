# Printer Driver API

A minimal Express.js API service with TypeScript and file modification watch features using nodemon.

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/printers` - List available printers
- `POST /api/print` - Submit a print job
- `GET /api/print-status/:jobId` - Check print job status

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` and automatically restart when you modify files in the `src` directory.

### Building

Build the TypeScript code to JavaScript:

```bash
npm run build
```

### Production

Start the production server:

```bash
npm start
```

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Remove build directory
