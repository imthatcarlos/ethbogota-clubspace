# clubspace-sdk

![img](https://mirror-media.imgix.net/publication-images/ZDLiXq321T6iGhd9B35EJ.png?height=563&width=1126&h=563&w=1126&auto=compress)

https://joinclubspace.xyz

## what is clubspace?
https://mirror.xyz/carlosbeltran.eth/9BVX0ZScWq9TcdTE_ZqzqyIqN7U0Pltc55v0cz_niJo

## how to integrate this sdk
This sdk allows third-party clients to create a clubspace (provided they have an api key)

As of now, the required inputs for creating a clubspace are:
- the creator must have a lens handle
- the creator must specify a `https://spinamp.xyz/` playlist id to serve as the live audio stream
- the creator must specify an nft drop to promote from decent/sound (manifold, zora in progress)
- the developer must wrap their component with our exported `JamProvider` component, which handles the ws/webRTC connections, but in the case of the sdk simple adds the creator as the space host

## check out our docs: https://docs.joinclubspace.xyz/

## TSDX commands

TSDX scaffolds your new library inside `/src`, and also sets up a [Parcel-based](https://parceljs.org) playground for it inside `/example`.

The recommended workflow is to run TSDX in one terminal:

```bash
npm start # or yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

Then run the example inside another:

```bash
cd example
npm i # or yarn to install dependencies
npm start # or yarn start
```

The default example imports and live reloads whatever is in `/dist`, so if you are seeing an out of date component, make sure TSDX is running in watch mode like we recommend above. **No symlinking required**, we use [Parcel's aliasing](https://parceljs.org/module_resolution.html#aliases).

WARNING: sometimes the hot reload doesn't work, delete the `.parcel-cache` folder and restart the parcel server to reset it

To do a one-off build, use `npm run build` or `yarn build`.

To run tests, use `npm test` or `yarn test`.
