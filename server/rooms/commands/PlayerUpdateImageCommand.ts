import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { Message } from '../../../types/Messages'
import { IOfficeState } from '../../../types/IOfficeState';
import fs from 'fs';
import path from 'path';

type Payload = {
  client: Client;
  imageUrl: string; // Base64などの画像データ
};

export default class PlayerUpdateImageCommand extends Command<IOfficeState, Payload> {

  execute({ client, imageUrl }: { client: any; imageUrl: string }) {
    const room = this.room;
    console.log("Updating player image for client:", client.sessionId);

    // 画像をサーバーに保存する処理
    const imagePath = this.saveImageToServer(imageUrl, client.sessionId);
    
    // クライアントに画像の保存先パスを通知する
    room.broadcast(
      Message.UPDATE_PLAYER_IMAGE,
      { playerId: client.sessionId, image: imagePath },
      { except: client }
    );
  }
  private saveImageToServer(imageUrl: string, sessionId: string): string {
    // 画像をBase64からバイナリデータに変換
    const imageBuffer = Buffer.from(imageUrl, 'base64');
    const imageFilePath = path.join(__dirname, 'images', `${sessionId}.png`);
    
    // ファイルに書き込む
    fs.writeFileSync(imageFilePath, imageBuffer);
    
    // 保存先のパスを返す
    return imageFilePath;
  }
  
}
  //execute(data: Payload) {
  //  const { client, imageUrl } = data;

  //  const player = this.room.state.players.get(client.sessionId);

  //  if (!player) return;
    //player.image = imageUrl; // プレイヤーオブジェクトに画像データを追加
  //}