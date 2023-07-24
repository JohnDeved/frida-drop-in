/// <reference path="index.d.ts" />

// make implementable class for "native" classes that must be instantiated with a pointer
abstract class NativeClass {
  constructor (public base: BaseClass, public address: NativePointer) {}
}

abstract class BaseClass implements NativeClass {
  constructor (public moduleName: string, isGlobal = false) {
    if (isGlobal) (globalThis as any).game = this
    this.base = this
    this.module = Process.getModuleByName(moduleName)
    this.address = this.module.base
  }
  base: BaseClass
  module: Module
  address: NativePointer
}

class ACTimer extends NativeClass {
  @prop(0x5c8, 'Int') accessor currentTimeMs: number
}

class ACCityChest extends NativeClass {
  @prop(0xC, 'Int') 
  accessor cityValue: number

  @prop(0x14, 'Int') 
  accessor contentValue: number

  @prop(0x20, 'S8') 
  accessor depositIntervalMins: number

  @prop(0x228, 'Int') 
  accessor nextDepositTimeSec: number
  
  /** 0x248 - pointer */
  get timer () {
    return new ACTimer(this.base, this.address.add(0x248).readPointer())
  }
  
  // todo: create a decorator for defining functions?
  // @thisCall(0x0074b2c0, 'void', ['int32'])
  // @func(0x0074b2c0, 'void', ['pointer', 'int32'])
  // - or maybe more feasable to make a factory function that returns a function?
  // hintDeposit = __thisCall(0x0074b2c0, 'void', ['int32'])
  // hintDeposit = this.call(0x0074b2c0, 'void', ['int32'])
  // - no pointer param needed, because it will be bound to the class instance and take the address from there
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

class ACGame extends BaseClass {
  // todo: decorator support BaseClass, BaseClass should implement NativeClass
  // todo: pass class type for Class pointers
  // - class musst implement NativeClass
  // - include base class so function can be defined?
  // @prop(0x1E16744, ACCityChest) 
  // accessor cityChest: ACCityChest
  // 
  // - new ACCityChest(this, this.module.base.add(0x1E16744).readPointer())
  //
  /** 0x1E16744 - pointer */
  get cityChest () {
    return new ACCityChest(this.base, this.module.base.add(0x1E16744).readPointer())
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

const game = new ACGame('AssassinsCreedIIGame.exe', true)
console.log(`City value: ${game.cityChest.cityValue} ƒ`)
console.log(`Content value: ${game.cityChest.contentValue} ƒ`)
console.log(`Deposit interval: ${game.cityChest.depositIntervalMins}m`)


// get alls NativePointer methods that start with "read" as union string type and omit the "read" part
type dataReadTypes = {
  [K in keyof NativePointer]: K extends `read${string}` ? K : never
}[keyof NativePointer]

// dataReadTypes but with "read" replaced with "write"
type dataTypes = dataReadTypes extends `read${infer R}` ? R : never

// omit data types that require a parameter
type dataNumberTypes = {
  [K in dataTypes]: NativePointer[`read${K}`] extends () => number | Int64 | UInt64 | NativePointer ? K : never
}[dataTypes]

type dataLengthTypes = Exclude<dataTypes, dataNumberTypes>

// overload function
function prop (offset: number, type: dataNumberTypes)
function prop (offset: number, type: dataLengthTypes, length: number)
function prop (offset: number, type: dataNumberTypes | dataLengthTypes, length?: number) {
  return function <This extends NativeClass, Return>() {
    return {
      get(this: This) {
        if (!this.address[`read${type}`]) throw new Error(`Cannot read ${type}`)
        if (length) {
          type = type as dataLengthTypes
          return this.address.add(offset)[`read${type}`](length) as any
        }
        type = type as dataNumberTypes
        return this.address.add(offset)[`read${type}`]() as any
      },
      set(this: This, value: Return) {
        if (!this.address[`write${type}`]) throw new Error(`Cannot write ${type}`)
        this.address.add(offset)[`write${type}`](value as any)
      },
    }
  }
}
