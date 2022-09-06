const itemsToType = [
  'your personal notes',
  'projects',
  'contacts',
  'meetings notes',
  'financial data',
  'balance sheets',
  'business accounts',
  'your favourite recipes',
  'your art collection',
  'your favourite books',
  'movies to watch',
  'your wardrobe',
  'hospital equipment',
  'inventory of jewelry',
  'warehouse inventory',
  'musical instruments',
  'paintings',
  'your cars',
  'your collection of stamps',
  'your collectables',
  'your devices',
  'furniture',
  'bills and invoices',
  'subscriptions to online services'
]

export class Typewriter {
  private static domElementId = 'description-last-item'
  private static domElement: HTMLSpanElement = null
  private static previousString = ''
  private static delayBetweenLetters = 100
  private static delayCaret = 500
  private static delayBetweenWords = 1000

  public static async type(): Promise<void> {
    if(!Typewriter.domElement) {
      Typewriter.domElement = document.getElementById(Typewriter.domElementId)
    }
    if (Typewriter.domElement) {
      const stringToType = await Typewriter.getRandomString()
      await Typewriter.typeString(stringToType)
    }
  }

  private static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private static getRandomString(): string {
    const randomIndex = Math.floor(Math.random() * itemsToType.length)
    const randomItem = itemsToType[randomIndex]
    if (randomItem === Typewriter.previousString) {
      return Typewriter.getRandomString()
    } else {
      Typewriter.previousString = randomItem
      return randomItem
    }
  }

  private static async typeString(stringToType: string): Promise<void> {
    for (let i = 0; i < stringToType.length; i++) {
      if (i === 0) {
        Typewriter.domElement.innerHTML = ''
      }
      Typewriter.domElement.innerHTML = Typewriter.domElement.innerHTML.slice(0, -1) + stringToType.charAt(i) + '|'
      await Typewriter.sleep(Typewriter.delayBetweenLetters)
    }
    Typewriter.domElement.innerHTML = Typewriter.domElement.innerHTML.slice(0, -1)
    for (let i = 0; i <= Typewriter.delayBetweenWords / Typewriter.delayCaret; i++) {
      Typewriter.domElement.innerHTML = `${stringToType}|`
      await Typewriter.sleep(Typewriter.delayCaret)
      // html white space
      Typewriter.domElement.innerHTML = `${stringToType}&nbsp;`
      await Typewriter.sleep(Typewriter.delayCaret)
    }
    
    Typewriter.type()
  }

}