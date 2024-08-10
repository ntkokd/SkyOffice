import Phaser from 'phaser'
import Game from './scenes/Game'
import Background from './scenes/Background'
import Bootstrap from './scenes/Bootstrap'

//Phaser を使用してゲームを構築する際の設定を定義
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, //Phaser が WebGL と Canvas のどちらを使用するか自動的に判断
  parent: 'phaser-container', //ゲームを表示する HTML 要素の ID 
  backgroundColor: '#93cbee',
  pixelArt: true, // Prevent pixel art from becoming blurred when scaled.
  //ゲームのスケーリング（サイズ変更）に関する設定
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE, //ウィンドウのサイズに合わせてゲームのサイズが動的に変更
    width: window.innerWidth, //ゲームの幅をウィンドウの内幅に設定
    height: window.innerHeight, //ゲームの高さをウィンドウの内高さに設定
  },
  //ゲームの物理エンジンに関する設定
  physics: {
    default: 'arcade', //Arcade 物理エンジンを使用
    arcade: {
      gravity: { y: 0 }, //垂直方向に重力を適用しない
      debug: false, //デバッグモードを無効
    },
  },
  autoFocus: true, //ゲームが自動的にブラウザのフォーカスを得る
  scene: [Bootstrap, Background, Game], //ゲームに含まれるシーンのリスト
}

const phaserGame = new Phaser.Game(config)

;(window as any).game = phaserGame

export default phaserGame
