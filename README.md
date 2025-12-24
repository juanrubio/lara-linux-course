# CodeQuest Academy

An interactive, gamified web-based learning platform designed for young learners to master Linux, Python, Bash scripting, and Raspberry Pi projects.

## Features

- **Interactive Terminal**: Browser-based sandboxed terminal powered by xterm.js
- **Gamification System**: XP, levels (1-15), achievements, streaks, and quests
- **4 Learning Tracks**: Linux (20 lessons), Python (25 lessons), Bash (15 lessons), Raspberry Pi (10 projects)
- **MDX Content**: Rich interactive lessons with quizzes, challenges, and exercises
- **Progress Tracking**: Persistent progress with local storage
- **Responsive Design**: Works on desktop and tablet

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Framer Motion
- **Database**: SQLite with Drizzle ORM
- **Terminal**: xterm.js
- **Content**: MDX with custom React components
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lara-linux-course

# Install dependencies
npm install
```

### Development Scripts

We provide several convenience scripts for different scenarios:

#### 1. **Localhost Development** (Recommended for WSL2 and local development)

```bash
./scripts/dev-localhost.sh
```

- Explicitly uses `ws://localhost:4000/api/terminal`
- Clears Next.js cache to ensure fresh environment
- Best for: WSL2 on Windows, local development
- Access at: `http://localhost:3000`

#### 2. **LAN Development** (For accessing from other devices on your network)

```bash
./scripts/dev-lan.sh
```

- Automatically detects your LAN IP address
- Configures firewall (UFW) to allow ports 3000 and 4000
- Uses `ws://YOUR_IP:4000/api/terminal`
- Best for: Accessing from phones, tablets, or other computers on your network
- Access at: `http://YOUR_IP:3000` (shown in terminal output)

#### 3. **Manual NPM Scripts** (For advanced users)

```bash
# Terminal 1: Start terminal WebSocket server
npm run dev:terminal

# Terminal 2: Start Next.js frontend
npm run dev
```

By default the frontend connects to `ws://localhost:4000/api/terminal`.
To use a different terminal server URL, set `NEXT_PUBLIC_TERMINAL_WS_URL` before starting the frontend.

### Build for Production

```bash
npm run build
npm start
```

Then start the terminal server separately:

```bash
npm run start:terminal
```

## Project Structure

```
lara-linux-course/
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   │   ├── gamification/ # XP bar, achievements, etc.
│   │   ├── layout/       # Header, sidebar, navigation
│   │   ├── lesson/       # MDX components
│   │   ├── terminal/     # Terminal emulator
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Core logic
│   │   ├── db/           # Database schema
│   │   ├── gamification/ # Levels, achievements, quests
│   │   └── terminal/     # Command validation
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
├── content/              # MDX lesson files
│   ├── linux/            # 20 Linux lessons
│   ├── python/           # 25 Python lessons
│   ├── bash/             # 15 Bash lessons
│   └── raspberry-pi/     # 10 Raspberry Pi projects
└── public/               # Static assets
```

## Learning Tracks

### Linux Fundamentals (20 Lessons)
- Chapter 1: Getting Started
- Chapter 2: Exploring the File System
- Chapter 3: File Content
- Chapter 4: System Explorer

### Python Programming (25 Lessons)
- Chapter 1: First Steps
- Chapter 2: Making Decisions
- Chapter 3: Loops and Lists
- Chapter 4: Functions
- Chapter 5: Files and Projects

### Bash Scripting (15 Lessons)
- Chapter 1: Script Basics
- Chapter 2: Control Flow
- Chapter 3: Advanced Scripting

### Raspberry Pi Projects (10 Projects)
- Hardware setup and GPIO basics
- LED control and button input
- Sensors and automation
- Web servers and game development

## Gamification

- **15 Levels**: From "Terminal Newbie" to "Master Hacker"
- **30+ Achievements**: Skill, streak, exploration, challenge, and secret badges
- **Quest System**: Story-driven missions with NPC characters
- **Daily Streaks**: Rewards for consistent practice

## Deployment on Raspberry Pi

For running on a Raspberry Pi:

```bash
# Build the application
npm run build

# Start production server
npm start
```

Consider setting up a systemd service for auto-start on boot.

## License

MIT License - Feel free to use and modify for educational purposes.

## Acknowledgments

Built with love for Lara's coding journey.
