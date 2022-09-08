const itemsToType = [
  'your personal notes',
  'balance sheets',
  'bills and invoices',
  'subscriptions to online services',
  'personal or business contacts',
  'financial data',
  'business accounts',
  'meetings notes',
  'ongoing projects',
  'your favourite recipes',
  'passwords',
  'your art collection',
  'your favourite books',
  'movies to watch',
  'your collectables',
  'your wardrobe',
  'warehouse inventory',
  'musical instruments',
  'paintings',
  'your cars',
  'your collection of stamps',
  'your devices',
  'furniture details',
  'hospital equipment',
  'inventory of jewelry',
]

export class Typewriter {
  private static domElementId = 'description-last-item'
  private static domElement: HTMLSpanElement = null
  private static delayBetweenLetters = 50
  private static delayCaret = 500
  private static currentWordIndex = -1

  public static async start(): Promise<void> {
    if(!this.domElement) {
      this.domElement = document.getElementById(this.domElementId)
    }
    if (this.domElement) {
      this.type()
    }
  }
  
  public static async type(): Promise<void> {
    const stringToType = await this.getNextString()
    await this.typeString(stringToType)
  }

  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private static getNextString(): string {
    this.currentWordIndex = (this.currentWordIndex + 1) < itemsToType.length ? this.currentWordIndex + 1 : 0
    return itemsToType[this.currentWordIndex]
  }

  private static async typeString(stringToType: string): Promise<void> {
    
    for (let i = 0; i < stringToType.length; i++) {
      if (i === 0) {
        this.domElement.innerHTML = ''
      }
      this.domElement.innerHTML = this.domElement.innerHTML.slice(0, -1) + stringToType.charAt(i) + '|'
      await this.sleep(this.delayBetweenLetters)
    }
    
    this.domElement.innerHTML = this.domElement.innerHTML.slice(0, -1)
    
    this.domElement.innerHTML = `${stringToType}|`
    await this.sleep(this.delayCaret)
    // html white space
    this.domElement.innerHTML = `${stringToType}&nbsp;`
    await this.sleep(this.delayCaret)
  
    this.domElement.innerHTML = `${stringToType}|`

    for (let i = 0; i < stringToType.length; i++) {
      this.domElement.innerHTML = this.domElement.innerHTML.slice(0, -2) + '|'
      await this.sleep(10)
    }
    
    await this.sleep(10)

    this.type()
  }

}