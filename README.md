something like [ASI Loader](https://github.com/ThirteenAG/Ultimate-ASI-Loader) but for loading frida agent scripts.<br>
a "drop-in" solution to load frida scripts into games for modding purposes

need to create js [attach](https://github.com/frida/frida-node/blob/d3b2c753b0e64e68b867fac604f5481b93c6b2d3/lib/index.ts#L175) and load equivalent as binary
```js
frida.attach('game.exe').then(async session => {
  const script = await session.createScript(agentString)
  await script.load()
})
```

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
