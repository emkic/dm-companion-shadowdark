export const IpcChannel = {
  BROADCAST_STATE: 'dm:broadcast-state',
  PLAYER_STATE_UPDATE: 'player:state-update',
  SAVE_SESSION: 'session:save',
  LOAD_SESSION: 'session:load',
  LIST_SESSIONS: 'session:list',
  DELETE_SESSION: 'session:delete',
  OPEN_FOLDER_DIALOG: 'dialog:open-folder',
  OPEN_IMAGE_DIALOG: 'dialog:open-image',
  READ_MEDIA_FOLDER: 'media:read-folder'
} as const
