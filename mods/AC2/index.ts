/// <reference path="index.d.ts" />
/** @noResolve */

class ACTimer {
  constructor (public address: NativePointer) {}

  /** 0x5c8 - int */
  get currentTimeMs () {
    return this.address.add(0x5c8).readInt()
  }
}

class ACCityChest {
  constructor (public address: NativePointer) {}
  
  /** 0xC - int */
  get cityValue () {
    return this.address.add(0xC).readInt()
  }

  /** 0x14 - int */
  get contentValue () {
    return this.address.add(0x14).readInt()
  }

  set contentValue (value: number) {
    this.address.add(0x14).writeInt(value)
  }

  /** 0x20 - byte */
  get depositIntervalMins () {
    return this.address.add(0x20).readS8()
  }

  /** 0x228 - int */
  get nextDepositTimeSec () {
    return this.address.add(0x228).readInt()
  }

  /** 0x248 - dword */
  get timer () {
    return new ACTimer(this.address.add(0x248).readPointer())
  }

  hintDeposit (value: number) {
    game._thisCall.CityChest_hintDeposit(this.address, value)
  }

  hintFull () {
    game._thisCall.CityChest_hintFull(this.address)
  }

  hintCityValue () {
    game._thisCall.CityChest_hintCityValue(this.address)
  }
}

class ACGame {
  constructor () {(globalThis as any).game = this}
  module = Process.getModuleByName('AssassinsCreedIIGame.exe')

  /** 0x1E16744 - dword */
  get cityChest () {
    return new ACCityChest(this.module.base.add(0x1E16744).readPointer())
  }

  _thisCall = {
    /* 0x0074b2c0 - void __thiscall CityChest::hintDeposit(CityChest *this, int) */
    CityChest_hintDeposit: new NativeFunction(this.module.base.add(0x0074b2c0), 'void', ['pointer', 'int32'], { abi: 'thiscall' }),
    /* 0x0074b310 - void __thiscall CityChest::hintFull(CityChest *this) */
    CityChest_hintFull: new NativeFunction(this.module.base.add(0x0074b310), 'void', ['pointer'], { abi: 'thiscall' }),
    /* 0x0074b8b0 - void __thiscall CityChest::hintCityValue(CityChest *this) */
    CityChest_hintCityValue: new NativeFunction(this.module.base.add(0x0074b8b0), 'void', ['pointer'], { abi: 'thiscall' }),
  }
}

const game = new ACGame()
// console.log(`City value: ${game.cityChest.cityValue}`)
// console.log(`Content value: ${game.cityChest.contentValue} ƒ`)
// console.log(`Deposit interval: ${game.cityChest.depositIntervalMins}m`)
// game.displayChestDeposit(game.cityChest.address, 69420)