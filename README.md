# V'erse Vision

V'erse is a neon cyber-faith forge built with Expo 51 and React Native. Teens scan their chaos, fuel quests, and collab inside a mythic UI pulsing with #FF4500 embers and #FFD700 runes. The app stitches Skrybe's BLIP image captions with Stryke quests, Lyfe lessons, and a neon mascot named Neo.

## Core Flow

1. **Spark** – Onboard, etch a name, trigger haptics, and ignite a personalized Chroma.js palette saved to the local Firebase-mocked datastore.
2. **Core** – Launch projects, receive devotional prompts, and run Verse Echo scans that simulate BLIP captions and DistilBERT quests.
3. **Tree** – Visualize XP branches through a Three.js fractal tree while logging new skill seeds.
4. **Board** – Map cosmic goals on a neon starfield and let Skrybe remix them into Stryke missions.
5. **Zone** – Storm the social chat, drop $Lyfe tips, and feel real-time vibes as data updates through the AsyncStorage-backed store.
6. **Oath** – Seal the covenant with neon forest cylinders pulsing around Neo.
7. **Shop** – Unlock V-Packs, customize haptics, and tune your palette seed.

## Tech Highlights

- **Expo 51** with React Navigation stacks (`Spark → Core → Tree → Board → Zone → Oath → Shop`).
- **Three.js 0.167.0** scenes rendered via `expo-gl` + `expo-three` for the fractal tree, star map, forest grove, and Verse Echo relics.
- **Chroma.js palette engine** stored through AsyncStorage, mirroring Firebase persistence.
- **Lottie + react-native-haptic-feedback** drive Neo's reactions and tactile feedback for every major tap.
- **Mocked Skrybe services** turn scans and inputs into gritty faith quests and devotionals while saving results in the datastore.

## Getting Started

```bash
npm install
npm run start
```

Use the Expo CLI prompts to open the project on iOS, Android, or web. Camera, AR, and in-app purchase flows are mocked for local development and require native builds for full fidelity.
