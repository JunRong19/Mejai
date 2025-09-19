import { Mejai } from "@Mejai";

export class MejaiPlugin {

  public name!   : string
	public version!: string

  public initialized = false

  constructor(pkg: Promise<{ displayName?: string, name: string, version: string}>) {
    pkg.then(({ displayName, name, version }) => {
      this.name = displayName ?? name
      this.version = version

      Mejai.addPlugin(this)
    })
  }

  init(){}
  enable(){}
  disable(){}
  toggle(){}
}