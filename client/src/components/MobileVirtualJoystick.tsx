//Joystickオブジェクトの状態管理

import { useEffect, useLayoutEffect, useState } from 'react'
import styled from 'styled-components'
import JoystickItem from './Joystick'

import phaserGame from '../PhaserGame'
import Game from '../scenes/Game'

import { useAppSelector } from '../hooks'
import { JoystickMovement } from './Joystick'

//Backdropは固定された位置に配置され、右下に表示される背景要素
const Backdrop = styled.div`
  position: fixed;
  bottom: 100px;
  right: 32px;
  max-height: 50%;
  max-width: 100%;
`

//Wrapperはその内部に配置され、全体的なレイアウトや余白を設定
const Wrapper = styled.div`
  position: relative;
  height: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
`

//JoystickWrapperはジョイスティックのコンポーネントを右下に配置するためのスタイル
const JoystickWrapper = styled.div`
  margin-top: auto;
  align-self: flex-end;
`

//画面の幅が特定の閾値以下かどうかを判定するためのユーティリティ関数を定義
export const minimumScreenWidthSize = 650 //px

const isSmallScreen = (smallScreenSize: number) => {
  const [width, setWidth] = useState(window.innerWidth) //現在のウィンドウの幅（width）を状態として保持

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth) //ウィンドウのリサイズイベントが発生した時にsetWidthを更新
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return width <= smallScreenSize //現在のウィンドウの幅がsmallScreenSize（minimumScreenWidthSizeで設定された閾値）以下かどうかを返す
}

export default function MobileVirtualJoystick() {
  const showJoystick = useAppSelector((state) => state.user.showJoystick)
  const showChat = useAppSelector((state) => state.chat.showChat)
  const hasSmallScreen = isSmallScreen(minimumScreenWidthSize)
  const game = phaserGame.scene.keys.game as Game

  useEffect(() => {}, [showJoystick, showChat])

  const handleMovement = (movement: JoystickMovement) => {
    game.myPlayer?.handleJoystickMovement(movement)
  }

  return (
    <Backdrop>
      <Wrapper>
        {!(showChat && hasSmallScreen) && showJoystick && (
          <JoystickWrapper>
            <JoystickItem onDirectionChange={handleMovement}></JoystickItem>
          </JoystickWrapper>
        )}
      </Wrapper>
    </Backdrop>
  )
}
