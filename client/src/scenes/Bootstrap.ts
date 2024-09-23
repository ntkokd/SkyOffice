//ゲームの初期設定
import Phaser from 'phaser'
import Network from '../services/Network'
import { BackgroundMode } from '../../../types/BackgroundMode'
import store from '../stores'
import { setRoomJoined } from '../stores/RoomStore'

export default class Bootstrap extends Phaser.Scene {
  private preloadComplete = false
  network!: Network

  constructor() {
    super('bootstrap')
  }

  preload() {
    //アセットの読み込み
    this.load.atlas(
      'cloud_day',
      'assets/background/cloud_day.png',
      'assets/background/cloud_day.json'
    )
    // defaultItemの画像をロード
    this.load.image('defaultItem', 'assets/objects/defaultItem.png');
    this.load.image('backdrop_day', 'assets/background/backdrop_day.png')
    this.load.atlas(
      'cloud_night',
      'assets/background/cloud_night.png',
      'assets/background/cloud_night.json'
    )
    this.load.image('backdrop_night', 'assets/background/backdrop_night.png')
    this.load.image('sun_moon', 'assets/background/sun_moon.png')

    this.load.tilemapTiledJSON('tilemap', 'assets/map/map.json')
    this.load.spritesheet('tiles_wall', 'assets/map/FloorAndGround.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('chairs', 'assets/items/chair.png', {
      frameWidth: 32,
      frameHeight: 64,
    })
    this.load.spritesheet('computers', 'assets/items/computer.png', {
      frameWidth: 96,
      frameHeight: 64,
    })
    this.load.spritesheet('whiteboards', 'assets/items/whiteboard.png', {
      frameWidth: 64,
      frameHeight: 64,
    })
    this.load.spritesheet('vendingmachines', 'assets/items/vendingmachine.png', {
      frameWidth: 48,
      frameHeight: 72,
    })
    this.load.spritesheet('office', 'assets/tileset/Modern_Office_Black_Shadow.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('basement', 'assets/tileset/Basement.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('generic', 'assets/tileset/Generic.png', {
      frameWidth: 32,
      frameHeight: 32,
    })
    this.load.spritesheet('adam', 'assets/character/adam.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
    this.load.spritesheet('ash', 'assets/character/ash.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
    this.load.spritesheet('lucy', 'assets/character/lucy.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
    this.load.spritesheet('nancy', 'assets/character/nancy.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
    //プリロードが完了したらstateをtrueに設定　背景シーンを起動
    this.load.on('complete', () => {
      this.preloadComplete = true
      this.launchBackground(store.getState().user.backgroundMode)
    })
  }

  init() {//初期化メゾット
    this.network = new Network() //Networkの新しいインスタンスを作成・this.networkに代入
  }

  private launchBackground(backgroundMode: BackgroundMode) {
    this.scene.launch('background', { backgroundMode })
  }

  launchGame() {
    if (!this.preloadComplete) return //アセットの読み込みが完了しているか
    this.network.webRTC?.checkPreviousPermission() //webRTC プロパティが存在する場合、過去の WebRTC 許可設定をチェックするメソッドを呼び出す
    //'game' シーンに対して、network という名前のプロパティを持つオブジェクトを渡す
    this.scene.launch('game', {
      network: this.network,
    })

    // update Redux state
    store.dispatch(setRoomJoined(true))//ルームに参加した」ことを状態に反映
  }

  changeBackgroundMode(backgroundMode: BackgroundMode) {//ゲームの背景モードを変更するためのメソッド
    this.scene.stop('background') //現在の背景シーンを停止
    this.launchBackground(backgroundMode) //新しい背景モードで再起動
  }
}
