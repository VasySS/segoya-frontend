# segoya-frontend

[![License](https://img.shields.io/github/license/vasyss/segoya-frontend)](LICENSE)
![Svelte](https://img.shields.io/badge/Svelte-5-orange?logo=svelte)
![SvelteKit](https://img.shields.io/badge/SvelteKit-3-orange?logo=svelte)

A frontend for [Segoya](https://segoya.vasys.su) - panorama guessing game.

## Getting started

### Prerequisites

- **Node.js** >= 22 & **pnpm** installed

### Installation

1. **Clone the Repository**:

```sh
git clone https://github.com/VasySS/segoya-frontend.git
cd segoya-frontend
```

2. Create **.env** in root folder and set required fields (look at **.env.example** for reference)

3. Run the command to install dependencies and start the development server:

```sh
pnpm i
pnpm run dev
```

If OpenAPI schema on backend was changed, frontend should be synced first:

```sh
pnpm run api-gen
```

## Project overview

### Core Technologies

- **Svelte 5 + SvelteKit + Vite**
- UI: **Tailwind** and **shadcn** (**bits-ui** + **lucide-svelte**)
- Testing: **Vitest, Playwright, testing-library**
- API: types are generated from OpenAPI schema on backend using **typed-openapi** with **zod**
- i18: **paraglide**

## Building

Set **ORIGIN** env to the URL of frontend, run these commands:

```bash
pnpm run build
pnpm run preview
```

## nginx reverse proxy headers error

SvelteKit generates a large **Link** header and nginx starts to return 502, to fix this, nginx needs to be adjusted:

`https://github.com/sveltejs/kit/issues/11084`

```
proxy_busy_buffers_size   512k;
proxy_buffers   4 512k;
proxy_buffer_size   256k;
```
