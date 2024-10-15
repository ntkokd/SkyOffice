//ゲームアプリケーションにおけるユーザー関連の状態を管理
//ReduxはReactアプリケーションでよく使われる状態管理ツールで、スライスは全体の状態の一部分と、その状態を変更するアクションやリデューサーを定義する方法
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { sanitizeId } from '../util'
import { BackgroundMode } from '../../../types/BackgroundMode'

import phaserGame from '../PhaserGame'
import Bootstrap from '../scenes/Bootstrap'

export function getInitialBackgroundMode() {
  const currentHour = new Date().getHours()
  return currentHour > 6 && currentHour <= 18 ? BackgroundMode.DAY : BackgroundMode.NIGHT
}

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    backgroundMode: getInitialBackgroundMode(),
    sessionId: '',
    videoConnected: false,
    loggedIn: false,
    playerNameMap: new Map<string, string>(),
    playerImageMap: new Map<string, string>(), // プレイヤー画像を保存するマップを追加
    showJoystick: window.innerWidth < 650,
  },
  reducers: {//状態の変更を処理する関数
    toggleBackgroundMode: (state) => {
      const newMode =
        state.backgroundMode === BackgroundMode.DAY ? BackgroundMode.NIGHT : BackgroundMode.DAY

      state.backgroundMode = newMode
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
      bootstrap.changeBackgroundMode(newMode)
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload
    },
    setVideoConnected: (state, action: PayloadAction<boolean>) => {
      state.videoConnected = action.payload
    },
    setLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.loggedIn = action.payload
    },
    setPlayerNameMap: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.playerNameMap.set(sanitizeId(action.payload.id), action.payload.name)
    },
    removePlayerNameMap: (state, action: PayloadAction<string>) => {
      state.playerNameMap.delete(sanitizeId(action.payload))
    },
    setPlayerImageMap: (state, action: PayloadAction<{ id: string; image: string }>) => {
      state.playerImageMap.set(sanitizeId(action.payload.id), action.payload.image) // 画像URLをマップに保存
    },
    removePlayerImageMap: (state, action: PayloadAction<string>) => {
      state.playerImageMap.delete(sanitizeId(action.payload)) // マップから画像URLを削除
    },
    setShowJoystick: (state, action: PayloadAction<boolean>) => {
      state.showJoystick = action.payload
    },
  },
})

export const {
  toggleBackgroundMode,
  setSessionId,
  setVideoConnected,
  setLoggedIn,
  setPlayerNameMap,
  removePlayerNameMap,
  setPlayerImageMap, // 新しく追加したアクションをエクスポート
  removePlayerImageMap, // 削除用のアクションもエクスポート
  setShowJoystick,
} = userSlice.actions

export default userSlice.reducer
