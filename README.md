# Social Media

[![CI](https://github.com/viral32111/social-media/actions/workflows/ci.yml/badge.svg)](https://github.com/viral32111/social-media/actions/workflows/ci.yml)
[![CodeQL](https://github.com/viral32111/social-media/actions/workflows/codeql.yml/badge.svg)](https://github.com/viral32111/social-media/actions/workflows/codeql.yml)
![GitHub tag (with filter)](https://img.shields.io/github/v/tag/viral32111/social-media?label=Latest)
![GitHub repository size](https://img.shields.io/github/repo-size/viral32111/social-media?label=Size)
![GitHub release downloads](https://img.shields.io/github/downloads/viral32111/social-media/total?label=Downloads)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/viral32111/social-media?label=Commits)

This is a full-stack web application of a barebones social media platform, very similar to [Twitter](https://twitter.com).

**This project is under development! There are no stable releases and usable deployments yet.**

## 📡 Technologies

The client-side uses [Vite](https://vitejs.dev) as the toolchain, [React](https://react.dev) for constructing the user interface, [TailwindCSS](https://tailwindcss.com) & [SASS](https://sass-lang.com) for styling, [jQuery](https://jquery.com) for scripts, and [Jest](https://jestjs.io) for automated testing.

The server-side uses [Node.js](https://nodejs.org) as the runtime, [Express](https://expressjs.com) for API routes, [MongoDB](https://www.mongodb.com) for storing persistent data, [Neo4j](https://neo4j.com) for generating recommendations, and [Mocha](https://mochajs.org)/[Chai](https://www.chaijs.com) for automated testing.

Both sides use [TypeScript](https://www.typescriptlang.org) as the programming language and [ESLint](https://eslint.org) to ensure code style.

## 📥 Usage

There is a pre-built [Docker image](https://github.com/viral32111/social-media/pkgs/container/social-media) for running the server-side API, and a [GitHub Pages](https://github.com/viral32111/social-media/deployments/activity_log?environment=github-pages) deployment for viewing the client-side user interface.

The [MongoDB](https://www.mongodb.com) and [Neo4j](https://neo4j.com) databases are not bundled with the Docker image and must be setup independently.

Check the [CI workflow runs](https://github.com/viral32111/social-media/actions/workflows/ci.yml) for the latest client-side and server-side build artifacts.

## ⚖️ License

Copyright (C) 2023 [viral32111](https://viral32111.com).

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses.
