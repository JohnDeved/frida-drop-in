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

type dataOtherTypes = Exclude<dataTypes, dataNumberTypes>

// implement a decorator that makes creating accessor properties easier
// @property({ offset: 0x14, type: 'int' }) accessor
export function property (options: { offset: number, type: dataNumberTypes }) {
  return function <This extends NativeClass, Return>(
    target: ClassAccessorDecoratorTarget<This, Return>,
    context: ClassAccessorDecoratorContext<This, Return>
  ) {
    const result: ClassAccessorDecoratorResult<This, Return> = {
      get(this: This) {
        return this.address.add(options.offset)[`read${options.type}`]() as any
      },
      set(this: This, value: Return) {
        this.address.add(options.offset)[`write${options.type}`](value as any)
      },
    };

    return result;
  }
} 

// make implementable class for "native" classes that must be instantiated with a pointer
export abstract class NativeClass {
  constructor (public address: NativePointer) {}
}