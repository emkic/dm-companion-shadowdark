export const IpcChannel = {
  BROADCAST_STATE: 'dm:broadcast-state',
  PLAYER_STATE_UPDATE: 'player:state-update',
  SAVE_SESSION: 'session:save',
  LOAD_SESSION: 'session:load',
  LIST_SESSIONS: 'session:list',
  DELETE_SESSION: 'session:delete',
  OPEN_FOLDER_DIALOG: 'dialog:open-folder',
  OPEN_IMAGE_DIALOG: 'dialog:open-image',
  READ_MEDIA_FOLDER: 'media:read-folder',
  GET_DISPLAYS: 'display:get-all',
  MOVE_PLAYER_TO_DISPLAY: 'display:move-player',
  LOAD_MOOD_PRESETS: 'ambiance:load-presets',
  SAVE_MOOD_PRESETS: 'ambiance:save-presets',
  LOAD_AMBIANCE_VOLUME: 'ambiance:load-volume',
  SAVE_AMBIANCE_VOLUME: 'ambiance:save-volume',
  OPEN_AUDIO_DIALOG: 'dialog:open-audio'
} as const
