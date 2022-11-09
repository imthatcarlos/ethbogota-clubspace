# clubspace

## setup
```bash
nvm use
yarn
yarn dev
```

## todo
- live space
    - memoize where possible, seeing how jam ui does it for identities and reactions
    - connected wallet is required to enter clubspace, reflect in ui (`get started` button)
    - fix: reactions not being sent or rendered
    - fix: leaving a space does not work with `leaveRoom()` ⇒ useUnload() hook not working
    - fix: JOIN ROOM being logged twice?
    - UI layout to mimic twitter spaces
        - Creator profile at the top
        - Lens follow button
        - NFT being sold + buy button + feed of latest purchases (listener)
        - playlist collapsed showing the one now playing, link somewhere
        - audience grid + reaction component (similar to twitter space)
- create space
    - render decent NFT that loads
    - make the lens login optional?
    - make the lens post optional?
    - choose playlist from spinamp ⇒ render the playlist info (cover image, track count, etc)
        - limit tracks to 10
    - OR create playlist from decent NFTs ⇒ TBD
