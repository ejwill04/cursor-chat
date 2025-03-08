# Chat Project

A chat application using React, TypeScript, and OpenAI.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm
- OpenAI API key

## Development Setup

1. Install dependencies:
```bash
# Install root dependencies
pnpm install

# Install server dependencies
cd server && pnpm install
```

2. Configure environment variables:
```bash
# In the server directory
cp .env.example .env
```
Then edit `.env` and add your OpenAI API key.

3. Initialize the database:
```bash
# In the server directory
pnpm prisma migrate dev --name init
```

4. Start development servers:
```bash
# In the root directory
pnpm dev
```

This will start:
- PostgreSQL database (in Docker)
- Backend server: http://localhost:3000
- Frontend server: http://localhost:5173

## Available Scripts

- `pnpm dev` - Start everything (database, frontend, and backend)
- `pnpm dev:frontend` - Start only the frontend
- `pnpm dev:server` - Start only the backend
- `pnpm dev:db` - Start only the database
- `pnpm db:stop` - Stop the database
- `pnpm build` - Build the frontend for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
