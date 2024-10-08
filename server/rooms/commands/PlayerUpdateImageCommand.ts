import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { Message } from '../../../types/Messages'
import { IOfficeState } from '../../../types/IOfficeState';
import fs from 'fs';
import path from 'path';

type Payload = {
  client: Client;
  image: ArrayBuffer; 
};

export default class PlayerUpdateImageCommand extends Command<IOfficeState, Payload> {

  execute({ client, image }: Payload) {
    const room = this.room;
    console.log("Updating player image for client:", client.sessionId);
  
    // 画像をサーバーに保存する処理
    const imagePath = this.saveImageToServer(image, client.sessionId);
  
    // クライアントに画像の保存先パスを通知する
    room.broadcast(
      Message.UPDATE_PLAYER_IMAGE,
      { playerId: client.sessionId, image: imagePath },
      { except: client }
    );
  }
  
  private saveImageToServer(imageData: ArrayBuffer, sessionId: string): string {
    const imageBuffer = Buffer.from(imageData);
    const imageFilePath = path.join(__dirname, 'images', `${sessionId}.png`);
    
    // ファイルに書き込む
    fs.writeFileSync(imageFilePath, imageBuffer);
    
    // 保存先のパスを返す
    return imageFilePath;
  }
  
}
