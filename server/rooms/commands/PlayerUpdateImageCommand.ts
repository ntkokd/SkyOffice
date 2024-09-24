import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { IOfficeState } from '../../../types/IOfficeState';

type Payload = {
  client: Client;
  imageUrl: string; // Base64などの画像データ
};

export default class PlayerUpdateImageCommand extends Command<IOfficeState, Payload> {
  execute(data: Payload) {
    const { client, imageUrl } = data;

    const player = this.room.state.players.get(client.sessionId);

    if (!player) return;
    player.image = imageUrl; // プレイヤーオブジェクトに画像データを追加
  }
  
}