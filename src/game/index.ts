import { Game, Space, Piece, createGame, Player, Do } from "@boardzilla/core";

export class OpcodeClash extends Game<OpcodeClash, OpcodeClashPlayer> {
  round: number = 0;
  sequencePosition: number = 0;
}

export class OpcodeClashPlayer extends Player<OpcodeClash, OpcodeClashPlayer> {
  hp: number = 10;
}

export class Card extends Piece<OpcodeClash> {
  opcodes: string;

  toString = () => this.opcodes;
}

function generateDeck(player: OpcodeClashPlayer) {
  const common = "RPS!*";
  const mid = "~><@{}";
  const rare = "8%[?-+X&";
  const commands = common.repeat(7) + mid.repeat(3) + rare;
  const opcodes = [...commands].sort(() => Math.random() - 0.5);

  const generateCard = (k: number) => opcodes.splice(0, k).join("");

  const cardCounts = [
    ...Array(6).fill(3),
    ...Array(16).fill(2),
    ...Array(14).fill(1),
  ];

  cardCounts.forEach((count) => {
    player.my("deck")!.create(Card, `card-${Math.random()}`, {
      opcodes: generateCard(count),
    });
  });
}

export default createGame(OpcodeClashPlayer, OpcodeClash, (game) => {
  const { action } = game;
  const { playerActions, whileLoop, loop, eachPlayer, everyPlayer } =
    game.flowCommands;

  game.registerClasses(Card);

  for (const player of game.players) {
    const mat = game.create(Space, "mat", { player });
    mat.create(Space, "deck", { player });
    mat.create(Space, "hand", { player });
    mat.create(Space, "sequence", { player });
    mat.create(Space, "stack", { player });
    const slots = mat.create(Space, "slots", { player });
    slots.create(Piece, "Rock");
    slots.create(Piece, "Paper");
    slots.create(Piece, "Scissors");
    generateDeck(player);
  }

  game.defineActions({
    drawCards: (player) =>
      action({
        prompt: "Draw cards",
      }).do(() => {
        const numToDraw = Math.min(7, player.my("deck")!.all(Card).length);
        player.my("deck")!.firstN(numToDraw, Card).putInto(player.my("hand")!);
      }),

    placeSequence: (player) =>
      action({
        prompt: "Place 5 cards in your sequence",
      })
        .chooseOnBoard("card", () => player.my("hand")!.all(Card))
        .move("card", player.my("sequence")!),

    donePlacingSequence: (player) =>
      action({
        condition: player.my("sequence")!.all(Card).length == 5,
        prompt: "Done",
      })
        .do(() => {
          player
            .my("hand")!
            .all(Card)
            .putInto(game.players.current()!.my("deck")!, { fromBottom: 0 });
        })
        .do(Do.break),

    undoPlaceSequence: (player) =>
      action({
        prompt: "Undo",
      })
        .chooseOnBoard("card", () => player.my("sequence")!.all(Card))
        .move("card", player.my("hand")!),

    replaceSequenceCard: (player) =>
      action({
        prompt: "Replace a card in your sequence",
      })
        .chooseOnBoard("newCard", () => player.my("hand")!.all(Card))
        .chooseOnBoard("oldCard", () => player.my("sequence")!.all(Card))
        .swap("newCard", "oldCard")
        .do(() => {
          player
            .my("hand")!
            .all(Card)
            .putInto(player.my("deck")!, { fromBottom: 0 });
        }),
  });

  const setup = [
    everyPlayer({
      name: "Setup",
      do: playerActions({
        name: "Setup",
        actions: ["drawCards"],
      }),
    }),
    everyPlayer({
      name: "Setup sequence",
      do: [
        whileLoop({
          while: () => true,
          do: playerActions({
            name: "Setup sequence",
            actions: [
              "placeSequence",
              "undoPlaceSequence",
              "donePlacingSequence",
            ],
          }),
        }),
      ],
    }),
  ];

  const execute = [
    () => {
      game.sequencePosition = 0;
    },
    whileLoop({
      while: () => game.sequencePosition < 5,
      do: [
        eachPlayer({
          name: "executePlayer",
          do: ({ executePlayer }) => {
            const i = game.sequencePosition;

            const card = executePlayer.my("sequence").all(Card).at(i);
            if (card) {
              game.message(
                `${executePlayer.name} executes card: ${card.opcodes}`
              );
            }
          },
        }),
        () => {
          game.sequencePosition += 1;
        },
      ],
    }),
  ];

  const drawAndReplace = [
    () => {
      game.players.forEach((player) => {
        const n = Math.min(3, player.my("deck")!.all(Card).length);
        player.my("deck")!.firstN(n, Card).putInto(player.my("hand")!);
      });
    },
    everyPlayer({
      do: [playerActions({ actions: ["replaceSequenceCard"] })],
    }),
  ];

  game.defineFlow(
    ...setup,
    whileLoop({
      while: () => !game.players.find((p) => p.hp <= 0),
      do: [
        ...execute,
        ...execute,
        ...drawAndReplace,
        () => {
          game.round++;
        },
      ],
    }),
    () => {
      const winner = game.players.find((p) => p.hp > 0);
    }
  );
});
