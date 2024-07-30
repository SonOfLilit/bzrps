import {
  createGame,
  Player,
  Space,
  Piece,
  Game,
} from '@boardzilla/core';

export class OpcodeClashPlayer extends Player<MyGame, OpcodeClashPlayer> {
}

class MyGame extends Game<MyGame, OpcodeClashPlayer> {
}

export default createGame(OpcodeClashPlayer, MyGame, game => {

  const { action } = game;
  const { playerActions, loop, eachPlayer } = game.flowCommands;

  game.defineActions({
  });

  game.defineFlow(
  );
});
