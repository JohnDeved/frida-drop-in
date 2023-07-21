something like [ASI Loader](https://github.com/ThirteenAG/Ultimate-ASI-Loader) but for loading frida agent scripts.<br>
a "drop-in" solution to load frida scripts into games for modding purposes

need to create js [attach](https://github.com/frida/frida-node/blob/d3b2c753b0e64e68b867fac604f5481b93c6b2d3/lib/index.ts#L175) and load equivalent as binary
```js
frida.attach('game.exe').then(async session => {
  const script = await session.createScript(agentString)
  await script.load()
})
```

possible setup:
 - download "-loader.exe"
 - rename to "game-loader.exe"
 - place next to "game.exe"
 - create folder "mods"
 - create js scripts eg "mods/god-mode.ts"
 - loader will start game.exe, and attach. using its own file name for matching
 - loader will scan the relative directory for mods/*[.js|.ts]
 - loader will inject scripts into process session

how installing mods might look like:
 - download mod.zip
 - extract at root of game folder (extracts game-loader.exe and mods/*)
 - run new game-loader.exe

should create POC in node, then move to go or rust for compiling a sharable release.

go (no windows?)
-
 - https://pkg.go.dev/github.com/frida/frida-go/frida#Attach
 - https://pkg.go.dev/github.com/frida/frida-go/frida#Session.CreateScript
 - https://pkg.go.dev/github.com/frida/frida-go/frida#Script.Load


rust (no simple attach?)
- 
 - https://docs.rs/frida/latest/frida/struct.DeviceManager.html#method.enumerate_all_devices
 - https://docs.rs/frida/latest/frida/struct.Device.html#method.attach
 - https://docs.rs/frida/latest/frida/struct.Session.html#method.create_script
 - https://docs.rs/frida/latest/frida/struct.Script.html#method.load
