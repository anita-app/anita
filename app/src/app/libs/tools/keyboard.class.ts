export class Keyboard {
  public static isTyping (target: HTMLElement): boolean {
    return target.matches('input') || target.matches('textarea')
  }
}
