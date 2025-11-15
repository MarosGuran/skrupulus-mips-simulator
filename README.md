# SKRUPULUS MIPS Simulator

A web-based MIPS assembly simulator built with Quasar Framework and Vue.js.

## Features

- Interactive MIPS assembly code editor
- Register and memory state visualization
- Step-by-step execution visualization
- Adjustable simulation speed

## Running with Docker (Recommended)

The easiest way to run the application is using Docker:

### Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier management)

### Using Docker Compose

1. Clone the repository:
```bash
git clone https://github.com/MarosGuran/skrupulus-mips-simulator.git
cd skrupulus-mips-simulator
```

2. Build and run the container:
```bash
docker-compose up -d
```

3. Access the application at: `http://localhost:8080`

4. To stop the container:
```bash
docker-compose down
```

### Using Docker directly

1. Build the Docker image:
```bash
docker build -t skrupulus-mips-simulator .
```

2. Run the container:
```bash
docker run -d -p 8080:80 --name mips-simulator skrupulus-mips-simulator
```

3. Access the application at: `http://localhost:8080`

4. To stop and remove the container:
```bash
docker stop mips-simulator
docker rm mips-simulator
```

## Local Development Setup

If you want to develop locally without Docker:

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher (or yarn 1.22.x or higher)

### Install dependencies

```bash
cd bp-mips
npm install
```

### Start the app in development mode

```bash
npm run dev
# or
quasar dev -m pwa
```

### Lint the files

```bash
npm run lint
```

### Format the files

```bash
npm run format
```

### Build the app for production

```bash
npm run build:pwa
```

For more information, see the [bp-mips README](bp-mips/README.md).