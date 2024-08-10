//Phaser を使ってゲームシーンを管理するためのクラス Game を定義

import Phaser from 'phaser'

// import { debugDraw } from '../utils/debug'
import { createCharacterAnims } from '../anims/CharacterAnims'

import Item from '../items/Item'
import Chair from '../items/Chair'
import Computer from '../items/Computer'
import Whiteboard from '../items/Whiteboard'
import VendingMachine from '../items/VendingMachine'
import '../characters/MyPlayer'
import '../characters/OtherPlayer'
import MyPlayer from '../characters/MyPlayer'
import OtherPlayer from '../characters/OtherPlayer'
import PlayerSelector from '../characters/PlayerSelector'
import Network from '../services/Network'
import { IPlayer } from '../../../types/IOfficeState'
import { PlayerBehavior } from '../../../types/PlayerBehavior'
import { ItemType } from '../../../types/Items'

import store from '../stores'
import { setFocused, setShowChat } from '../stores/ChatStore'
import { NavKeys, Keyboard } from '../../../types/KeyboardState'

export default class Game extends Phaser.Scene {
  //プロパティの定義
  network!: Network
  private cursors!: NavKeys
  private keyE!: Phaser.Input.Keyboard.Key
  private keyR!: Phaser.Input.Keyboard.Key
  private map!: Phaser.Tilemaps.Tilemap
  myPlayer!: MyPlayer
  private playerSelector!: Phaser.GameObjects.Zone
  private otherPlayers!: Phaser.Physics.Arcade.Group
  private otherPlayerMap = new Map<string, OtherPlayer>()
  computerMap = new Map<string, Computer>()
  private whiteboardMap = new Map<string, Whiteboard>()

  //このシーンに'game'というキーを割り当てる
  constructor() {
    super('game')
  }

  registerKeys() {
    this.cursors = {
      ...this.input.keyboard.createCursorKeys(),//'...'は展開構文（配列や要素を展開して挿入できる
      ...(this.input.keyboard.addKeys('W,S,A,D') as Keyboard),
    }

    // maybe we can have a dedicated method for adding keys if more keys are needed in the future
    this.keyE = this.input.keyboard.addKey('E')
    this.keyR = this.input.keyboard.addKey('R')
    this.input.keyboard.disableGlobalCapture()
    this.input.keyboard.on('keydown-ENTER', (event) => {
      store.dispatch(setShowChat(true))
      store.dispatch(setFocused(true))
    })
    this.input.keyboard.on('keydown-ESC', (event) => {
      store.dispatch(setShowChat(false))
    })
  }

  disableKeys() {//キーの無効化
    this.input.keyboard.enabled = false
  }

  enableKeys() {//キーの有効化
    this.input.keyboard.enabled = true
  }

  create(data: { network: Network }) {
    //ネットワークの設定
    if (!data.network) {
      throw new Error('server instance missing')
    } else {
      this.network = data.network
    }
    
    //キャラクターのアニメーション
    createCharacterAnims(this.anims)

    //マップの読み込み
    this.map = this.make.tilemap({ key: 'tilemap' })
    const FloorAndGround = this.map.addTilesetImage('FloorAndGround', 'tiles_wall')

    //レイヤーの設定
    const groundLayer = this.map.createLayer('Ground', FloorAndGround)
    groundLayer.setCollisionByProperty({ collides: true })//コリジョンの設定

    // debugDraw(groundLayer, this)

    //プレイヤーの追加
    this.myPlayer = this.add.myPlayer(705, 500, 'adam', this.network.mySessionId)//初期位置705,500にプレイヤーオブジェクトを追加
    //プレイヤーオブジェクトの追加
    this.playerSelector = new PlayerSelector(this, 0, 0, 16, 16)

    // import chair objects from Tiled map to Phaser
    const chairs = this.physics.add.staticGroup({ classType: Chair })//静的なオブジェクトを管理するグループを作成
    const chairLayer = this.map.getObjectLayer('Chair')//Tiledマップから'Chair'という名前のレイヤーを取得
    chairLayer.objects.forEach((chairObj) => {//chairLayer に含まれるすべてのオブジェクトを反復処理　chairObj は各椅子オブジェクトのデータ
      const item = this.addObjectFromTiled(chairs, chairObj, 'chairs', 'chair') as Chair //Tiled マップのデータを元に、Phaser シーンに Chair オブジェクトを作成し、chairs グループに追加
      // custom properties[0] is the object direction specified in Tiled
      item.itemDirection = chairObj.properties[0].value //Tiled マップで設定されたカスタムプロパティを使って、椅子オブジェクトの方向を設定
    })

    // import computers objects from Tiled map to Phaser
    const computers = this.physics.add.staticGroup({ classType: Computer })//Computer オブジェクトを管理するための静的なグループを作成 のグループに追加されるオブジェクトはすべて Computer クラスのインスタンスとなる
    const computerLayer = this.map.getObjectLayer('Computer')
    computerLayer.objects.forEach((obj, i) => { //obj は各コンピュータオブジェクトのデータで、i はそのインデックス
      const item = this.addObjectFromTiled(computers, obj, 'computers', 'computer') as Computer
      item.setDepth(item.y + item.height * 0.27) //コンピュータオブジェクトが他のオブジェクトよりも前面に描画されるようにするため、深度を調整
      //各 Computer オブジェクトに一意の ID を設定
      const id = `${i}`
      item.id = id
      this.computerMap.set(id, item)//id をキーとして、item を computerMap に保存
    })

    // import whiteboards objects from Tiled map to Phaser
    //chair,computerと同じwhiteboard版
    const whiteboards = this.physics.add.staticGroup({ classType: Whiteboard })
    const whiteboardLayer = this.map.getObjectLayer('Whiteboard')
    whiteboardLayer.objects.forEach((obj, i) => {
      const item = this.addObjectFromTiled(
        whiteboards,
        obj,
        'whiteboards',
        'whiteboard'
      ) as Whiteboard
      const id = `${i}`
      item.id = id
      this.whiteboardMap.set(id, item)
    })

    // import vending machine objects from Tiled map to Phaser
    // 自動販売機版
    const vendingMachines = this.physics.add.staticGroup({ classType: VendingMachine })
    const vendingMachineLayer = this.map.getObjectLayer('VendingMachine')
    vendingMachineLayer.objects.forEach((obj, i) => {
      this.addObjectFromTiled(vendingMachines, obj, 'vendingmachines', 'vendingmachine')
    })

    // import other objects from Tiled map to Phaser
    //Tiled マップで定義された他のオブジェクトを Phaser ゲームシーンにインポートするための処理
    //trueのときオブジェクトは衝突する,falseのときオブジェクトは衝突しない
    this.addGroupFromTiled('Wall', 'tiles_wall', 'FloorAndGround', false)
    this.addGroupFromTiled('Objects', 'office', 'Modern_Office_Black_Shadow', false)
    this.addGroupFromTiled('ObjectsOnCollide', 'office', 'Modern_Office_Black_Shadow', true)
    this.addGroupFromTiled('GenericObjects', 'generic', 'Generic', false)
    this.addGroupFromTiled('GenericObjectsOnCollide', 'generic', 'Generic', true)
    this.addGroupFromTiled('Basement', 'basement', 'Basement', true)

    //他プレイヤーグループの作成
    this.otherPlayers = this.physics.add.group({ classType: OtherPlayer })

    this.cameras.main.zoom = 1.5 //カメラのズームレベル
    this.cameras.main.startFollow(this.myPlayer, true) //カメラがプレイヤーを追従する

    //this.myPlayer と this.myPlayer.playerContainer が groundLayer と vendingMachines と衝突するように設定(プレイヤーが地面や自動販売機とぶつかる)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], groundLayer)
    this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], vendingMachines)

    //オーバーラップの設定
    //プレイヤーのカーソルなど(layerSelector)と対象オブジェクトが重なった時
    this.physics.add.overlap(
      this.playerSelector,//オーバーラップの対象となるオブジェクト
      [chairs, computers, whiteboards, vendingMachines],//オーバーラップの検出対象となるオブジェクト
      this.handleItemSelectorOverlap,//オーバーラップが検出されたときに呼び出されるコールバック関数
      undefined,//オーバーラップの発生条件を指定するためのオプションパラメータ(ここでは設定していない)
      this //コールバック関数内で使用するコンテキストを指定(this='Game'シーン)
    )
    //プレイヤーと他プレイヤーが重なった時
    this.physics.add.overlap(
      this.myPlayer,
      this.otherPlayers,
      this.handlePlayersOverlap,
      undefined,
      this
    )

    // register network event listeners
    this.network.onPlayerJoined(this.handlePlayerJoined, this)
    this.network.onPlayerLeft(this.handlePlayerLeft, this)
    this.network.onMyPlayerReady(this.handleMyPlayerReady, this)
    this.network.onMyPlayerVideoConnected(this.handleMyVideoConnected, this)
    this.network.onPlayerUpdated(this.handlePlayerUpdated, this)
    this.network.onItemUserAdded(this.handleItemUserAdded, this)
    this.network.onItemUserRemoved(this.handleItemUserRemoved, this)
    this.network.onChatMessageAdded(this.handleChatMessageAdded, this)
  }

  //playerSelector（プレイヤーが現在選択しているアイテムを管理するオブジェクト）と selectionItem（プレイヤーが現在重なっているアイテム）との重なり処理
  private handleItemSelectorOverlap(playerSelector, selectionItem) {
    const currentItem = playerSelector.selectedItem as Item
    // currentItem is undefined if nothing was perviously selected
    if (currentItem) {
      // if the selection has not changed, do nothing
      if (currentItem === selectionItem || currentItem.depth >= selectionItem.depth) {
        return
      }
      // if selection changes, clear pervious dialog
      if (this.myPlayer.playerBehavior !== PlayerBehavior.SITTING) currentItem.clearDialogBox()
    }

    // set selected item and set up new dialog
    playerSelector.selectedItem = selectionItem //選択アイテムを新しく重なったアイテムに更新
    selectionItem.onOverlapDialog() //新しく選択されたアイテムに対して、そのアイテムの重なりダイアログを表示
  }

  //Tiled マップエディタから取得したオブジェクトを Phaser のゲーム内に追加するためのメソッド
  private addObjectFromTiled(
    group: Phaser.Physics.Arcade.StaticGroup,
    object: Phaser.Types.Tilemaps.TiledObject,
    key: string,
    tilesetName: string
  ) {
    //Tiled で設定された位置（object.x と object.y）を基に、ゲーム内での正しい位置を計算
    const actualX = object.x! + object.width! * 0.5
    const actualY = object.y! - object.height! * 0.5
    //group.get() メソッドを使用して、指定された位置（actualX, actualY）に新しいオブジェクトを取得
    //key はオブジェクトのテクスチャを指定し、gid はタイルセットの最初の ID からの相対的な ID を指定
    const obj = group
      .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
      .setDepth(actualY)//オブジェクトの深度を設定
    return obj//作成したオブジェクトを返す
  }

  //Tiledマップエディタで定義されたオブジェクトのレイヤーを Phaser のゲームシーンに追加,必要に応じて衝突設定を行う
  private addGroupFromTiled(
    objectLayerName: string,
    key: string,
    tilesetName: string,
    collidable: boolean //プレイヤーとの衝突設定を行うかどうかを決定するフラグ  true の場合、プレイヤーとの衝突が設定(boolean:真か偽の値をとる)
  ) {
    //Tiledオブジェクトの追加
    const group = this.physics.add.staticGroup()//staticGroup を作成
    const objectLayer = this.map.getObjectLayer(objectLayerName)
    objectLayer.objects.forEach((object) => {
      const actualX = object.x! + object.width! * 0.5
      const actualY = object.y! - object.height! * 0.5
      group
        .get(actualX, actualY, key, object.gid! - this.map.getTileset(tilesetName).firstgid)
        .setDepth(actualY)
    })
    if (this.myPlayer && collidable){ //this.myPlayer が存在し、かつ collidable が真である場合
      //プレイヤーと作成したグループの衝突を設定
      this.physics.add.collider([this.myPlayer, this.myPlayer.playerContainer], group)
    }
  }

  // function to add new player to the otherPlayer group
  private handlePlayerJoined(newPlayer: IPlayer, id: string) {
    const otherPlayer = this.add.otherPlayer(newPlayer.x, newPlayer.y, 'adam', id, newPlayer.name)
    this.otherPlayers.add(otherPlayer)
    this.otherPlayerMap.set(id, otherPlayer)
  }

  // function to remove the player who left from the otherPlayer group
  private handlePlayerLeft(id: string) {
    if (this.otherPlayerMap.has(id)) {
      const otherPlayer = this.otherPlayerMap.get(id)
      if (!otherPlayer) return
      this.otherPlayers.remove(otherPlayer, true, true)
      this.otherPlayerMap.delete(id)
    }
  }

  private handleMyPlayerReady() {
    this.myPlayer.readyToConnect = true
  }

  private handleMyVideoConnected() {
    this.myPlayer.videoConnected = true
  }

  // function to update target position upon receiving player updates
  private handlePlayerUpdated(field: string, value: number | string, id: string) {
    const otherPlayer = this.otherPlayerMap.get(id)
    otherPlayer?.updateOtherPlayer(field, value)
  }

  //2つのプレイヤーが重なったときに実行される処理
  private handlePlayersOverlap(myPlayer, otherPlayer) {
    otherPlayer.makeCall(myPlayer, this.network?.webRTC)
  }

  //アイテムにユーザーが追加された際に実行される処理
  private handleItemUserAdded(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.addCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.addCurrentUser(playerId)
    }
  }

  //アイテムからユーザーが削除された際に実行される処理
  private handleItemUserRemoved(playerId: string, itemId: string, itemType: ItemType) {
    if (itemType === ItemType.COMPUTER) {
      const computer = this.computerMap.get(itemId)
      computer?.removeCurrentUser(playerId)
    } else if (itemType === ItemType.WHITEBOARD) {
      const whiteboard = this.whiteboardMap.get(itemId)
      whiteboard?.removeCurrentUser(playerId)
    }
  }

  //チャットメッセージが追加された際に実行される処理
  private handleChatMessageAdded(playerId: string, content: string) {
    const otherPlayer = this.otherPlayerMap.get(playerId)
    otherPlayer?.updateDialogBubble(content)
  }

  //毎フレーム呼び出されゲームの状態を更新
  update(t: number, dt: number) {
    if (this.myPlayer && this.network) {
      this.playerSelector.update(this.myPlayer, this.cursors)
      this.myPlayer.update(this.playerSelector, this.cursors, this.keyE, this.keyR, this.network)
    }
  }
}
