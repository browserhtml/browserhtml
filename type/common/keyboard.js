export type Key = {
  type: 'Keyboard.Key',
  // Currently Key carries no additional information, though in future we may
  // want to have it carry the following.
  // chord: string,
  // key: string,
  // metaKey: boolean,
  // shiftKey: boolean,
  // altKey: boolean,
  // ctrlKey: boolean
};

// Keyboard actions wrap another action, annotating it with binding info.
export type Command <action> = {
  type: 'Keyboard.Command',
  action: action,
  chord: string,
  key: string,
  metaKey: boolean,
  shiftKey: boolean,
  altKey: boolean,
  ctrlKey: boolean
};

export type Action = Key | Command;

// Wrap an action in a Command action
export type asCommand <action> = (action:action, chord: string, key: string, metaKey: boolean, shiftKey: boolean, altKey: boolean, ctrlKey: boolean) =>
  Command<action>;

export type asKey = () => Key;