# Qiskit Environment Setup Tutorial

This project is an **Electron**-based desktop application that guides users through setting up a **Qiskit environment** and also provides a way to query **IBM Quantum API** information (e.g., usage, backends) using a token. It aims to help newcomers install and configure Qiskit and optionally explore quantum computing features through the IBM Quantum platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Getting Started (Development Mode)](#getting-started-development-mode)
4. [Building a Standalone Executable](#building-a-standalone-executable)
5. [User API](#usage)

---

## Overview

- **Goal**: Provide an easy-to-use tutorial for anyone wanting to install Python, set up a virtual environment, and install Qiskit. Additionally, show how to check IBM Quantum usage and device availability using an API token.
- **Tech Stack**: [Electron](https://www.electronjs.org/), JavaScript (ES Modules), Node.js, Qiskit (Python).

---

## Key Features

1. **Step-by-Step Tutorial**
   - Guides you through checking Python installation, creating a virtual environment, installing Qiskit, and verifying VSCode setup.
2. **IBM Quantum API Integration**
   - Allows you to enter your IBM Quantum token and retrieve usage info, list backends, and check their statuses in real time.
3. **Examples Section**
   - Includes basic quantum information links, example code, and references to Qiskit usage (expandable with your own examples).

---

## Getting Started (Development Mode)

1. **Clone the repository** (or download the ZIP):

   ```bash
   git clone https://github.com/<your-account>/<your-repo>.git
   cd <your-repo>

   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run in development**:

   ```bash
   npm start
   ```

   This will launch the Electron app in development mode.

   If needed, open DevTools via Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (macOS).

## Building a Standalone Executable

We recommend using electron-builder:

1. **Install electron-builder** (if not already):

   ```bash
   npm install --save-dev electron-builder
   ```

2. **Add build script to your** package.json:

   ```jsonc
   {
     "scripts": {
       "start": "electron .",
       "dist": "electron-builder"
     },
     "build": {
       "directories": {
         "output": "dist"
       }
       // ...
     }
   }
   ```

3. **Build**:
   ```bash
   npm run dist
   ```

- After building, check the dist/ folder for .exe (Windows), .dmg (Mac), or .AppImage (Linux).

## Usage

1. Launch the App

   - Either run npm start in dev mode or install via the built .exe/.dmg/.AppImage.

2. Follow the Tutorial

   - The sidebar provides “Installation Tutorial” steps: Check Python, create a venv, install Qiskit, confirm VSCode, etc.

3. Examples

   - Offers example quantum info links (or code) and any additional quantum circuit examples you add.

4. IBM Quantum API

   - Enter your token in the “User API” section to fetch usage info, device statuses, and more.

**Enjoy exploring quantum computing with Qiskit!**
