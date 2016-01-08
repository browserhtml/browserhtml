declare class KeyboardEvent extends UIEvent {
  altKey: boolean;
  charCode: number;
  code: number;
  ctrlKey: boolean;
  isComposing: boolean;
  key: string;
  keyCode: number;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
  which: number;
  getModifierState(): boolean;
}
