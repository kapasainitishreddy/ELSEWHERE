# Play ELSEWHERE without developer setup

## Fastest: no install
[Open the public GitHub repository in StackBlitz](https://stackblitz.com/fork/github/kapasainitishreddy/ELSEWHERE?startScript=play&view=preview).

1. Use Chrome or Brave on a desktop computer.
2. StackBlitz will import the public GitHub repository and install its dependencies, then start the `play` script. Wait until the browser preview loads.
3. Click **RUN PHYSICS SANDBOX** to start beside the dungeon relics, or **PLAY GUEST DEMO** to begin in the future city. No sign-up or passphrase is needed. Your choices live only in memory and disappear when you close or refresh the preview.
4. Choose **Hollow Crown** for runic objects or **Titan Foundry** for reactor cargo. Walk with W/A/S/D, orbit with the mouse, press E near training props or click one to apply a physics impulse. The gallery is to your right from the spawn point.
5. Click the **?** help control for more movement/VR options.

**If the WebContainer cannot install the Rapier WebAssembly dependency**, the rest of the game still runs with a graceful fallback. This one-click link is an import-and-run workflow, not a dedicated public production deployment, and has not been hardware tested.

## Running locally on Windows
Install Node.js 22+ and Git, then in PowerShell:

```powershell
git clone https://github.com/kapasainitishreddy/ELSEWHERE.git
cd ELSEWHERE
npm install
npm run dev
```

Open http://localhost:5173 in the same computer's browser. `npm run play` instead binds to all interfaces for preview environments; don't expose that development server on a public network.

## Private vs guest
- **PLAY GUEST DEMO** is temporary and never writes a saved timeline.
- **CREATE ENCRYPTED WORLD** uses a passphrase kept only locally, and encrypts browser saves. Avoid entering personal details in guest demo.
- Real Meta API dialogue is separately opt-in; the offline authored game works without it.

## Reality check
A package installation and real interactive browser run are still required to certify physics, rendering, and VR performance. A screenshot alone is not proof.
