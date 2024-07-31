import {
  Game,
  Space,
  Piece,
  createGame,
  Player,
  Do,
  ElementClass,
} from "@boardzilla/core";

const VALUES = 3;
const SLOTS = 3;
const SEQUENCE_CARDS = 5;
const SETUP_CARDS = 7;
const REPLACE_CARDS = 3;

export class OpcodeClash extends Game<OpcodeClash, OpcodeClashPlayer> {
  round: number = 0;
  sequencePosition: number = 0;
}

export class OpcodeClashPlayer extends Player<OpcodeClash, OpcodeClashPlayer> {
  hp: number = 10;

  push(value: number) {
    const cls = valueToClass(value);
    this.game.pile.first(cls)!.putInto(this.my("stack")!);
  }

  pop(): number | undefined {
    const value = this.my("stack")!.last(Value);
    if (value) {
      const result = value.value;
      value.putInto(this.game.pile);
      return result;
    }
    return undefined;
  }
}

export class Value extends Piece<OpcodeClash> {
  value: number;

  toString(): string {
    return "Value";
  }
}

export class Rock extends Value {
  value = 0;

  toString() {
    return "🪨";
  }
}

export class Paper extends Value {
  value = 1;

  toString() {
    return "📄";
  }
}

export class Scissors extends Value {
  value = 2;

  toString() {
    return "✂️";
  }
}

function valueToClass(value: number): typeof Value {
  return [Rock, Paper, Scissors][modValues(value)];
}

function modValues(n: number): number {
  return ((n % VALUES) + VALUES) % VALUES;
}

export class Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {}
  toString(): string {
    return "Opcode";
  }
}

export class PushRock extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    player.push(0);
  }
  toString() {
    return "👊";
  }
}

export class PushPaper extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    player.push(1);
  }
  toString() {
    return "🖐️";
  }
}

export class PushScissors extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    player.push(2);
  }
  toString() {
    return "✌️";
  }
}

export class PushRandom extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    player.push(Math.floor(Math.random() * VALUES));
  }
  toString() {
    return "💪";
  }
}

export class Play extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const value = player.pop();
    if (value !== undefined) {
      const i = player.pop();
      if (value && i) {
        const slot = player.my("slots")!;
        slot.all(Value)[i].putInto(game.pile);
        game.pile.first(valueToClass(value))?.putInto(slot, { position: i });
      }
    }
  }
  toString() {
    return "👉";
  }
}

export class DecrementSlot extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const i = player.pop();
    if (i !== undefined) {
      const slots = player.my("slots")!.all(Value);
      const x = slots[i].value;
      slots[i].putInto(game.pile);
      game.pile
        .first(valueToClass(modValues(x - 1)))!
        .putInto(player.my("slots")!, { position: i });
    }
  }
  toString() {
    return "👉";
  }
}

export class IncrementSlot extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const i = player.pop();
    if (i !== undefined) {
      const slots = player.my("slots")!.all(Value);
      const x = slots[i].value;
      slots[i].putInto(game.pile);
      game.pile
        .first(valueToClass(modValues(x + 1)))!
        .putInto(player.my("slots")!, { position: i });
    }
  }
  toString() {
    return "👉";
  }
}

export class Fight extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const p1 = game.players[0].my("slots")!.all(Value);
    const p2 = game.players[1].my("slots")!.all(Value);

    for (let i = 0; i < SLOTS; i++) {
      const result = modValues(p1[i].value - p2[i].value);
      if (result == 1) {
        game.players[1].hp -= 1;
      } else if (result == 2) {
        game.players[0].hp -= 1;
      }
    }
  }
  toString() {
    return "👉";
  }
}

export class SlotFight extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const i = player.pop();
    if (i !== undefined) {
      const p1 = game.players[0].my("slots")!.all(Value);
      const p2 = game.players[1].my("slots")!.all(Value);

      const result = modValues(p1[i].value - p2[i].value);
      if (result == 1) {
        game.players[1].hp -= 1;
      } else if (result == 2) {
        game.players[0].hp -= 1;
      }
    }
  }
  toString() {
    return "👉";
  }
}

export class Increment extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const value = player.pop();
    if (value !== undefined) {
      player.push(modValues(value + 1));
    }
  }
  toString() {
    return "👆";
  }
}

export class Decrement extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const value = player.pop();
    if (value !== undefined) {
      player.push(modValues(value - 1));
    }
  }
  toString() {
    return "👇";
  }
}

export class Subtract extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const y = player.pop();
    const x = player.pop();
    if (x !== undefined && y !== undefined) {
      player.push(modValues(x - y));
    }
  }
  toString() {
    return "👏";
  }
}

export class Add extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const y = player.pop();
    const x = player.pop();
    if (x !== undefined && y !== undefined) {
      player.push(modValues(x + y));
    }
  }
  toString() {
    return "🤲";
  }
}

export class SpecialCombine extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const y = player.pop();
    const x = player.pop();
    if (x !== undefined && y !== undefined) {
      player.push(x === 0 && y === 0 ? 2 : 1);
    }
  }
  toString() {
    return "🤞";
  }
}

export class Skip extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const value = player.pop();
    if (value !== undefined) {
      // TODO: implement
      game.sequencePosition += value;
    }
  }
  toString() {
    return "🤌";
  }
}

export class Remove extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    player.pop();
  }
  toString() {
    return "🫳";
  }
}

export class Duplicate extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const value = player.my("stack")!.last(Value);
    if (value) {
      player.push(value.value);
    }
  }
  toString() {
    return "👐";
  }
}

export class Swap extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const y = player.pop();
    const x = player.pop();
    if (y) {
      player.push(y);
    }
    if (x) {
      player.push(x);
    }
  }
  toString() {
    return "🤙";
  }
}

export class Over extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const y = player.pop();
    const x = player.pop();
    if (x !== undefined) {
      player.push(x);
    }
    if (y !== undefined) {
      player.push(y);
    }
    if (x !== undefined) {
      player.push(x);
    }
  }
  toString() {
    return "🖖";
  }
}

export class PushOpponentSlot extends Opcode {
  execute(game: OpcodeClash, player: OpcodeClashPlayer): void {
    const opponent = game.players.find((p) => p !== player);
    if (opponent) {
      const opponentSlot = opponent.my("slots")!.firstN(1, Piece)[0];
      const value = opponentSlot.first(Value);
      if (value) {
        player.push(value.value);
      }
    }
  }
  toString() {
    return "🫵";
  }
}

const opcodeMap: { [key: string]: new () => Opcode } = {
  R: PushRock,
  P: PushPaper,
  S: PushScissors,
  "~": PushRandom,
  "!": Play,
  "{": DecrementSlot,
  "}": IncrementSlot,
  "*": Fight,
  "@": SlotFight,
  ">": Increment,
  "<": Decrement,
  "-": Subtract,
  "+": Add,
  //"^": SpecialCombine,
  //j: Skip,
  X: Remove,
  "8": Duplicate,
  "%": Swap,
  "[": Over,
  "?": PushOpponentSlot,
};

function parseOpcode(char: string): Opcode {
  const OpcodeClass = opcodeMap[char];
  if (OpcodeClass) {
    return new OpcodeClass();
  }
  throw new Error(`Unknown opcode: ${char}`);
}

export class Card extends Piece<OpcodeClash> {
  opcodes: string;

  values() {
    return this.opcodes.split("").map((op) => parseOpcode(op));
  }

  toString() {
    return this.values()
      .map((x) => x.toString())
      .join("");
  }
}

function generateDeck(game: OpcodeClash, player: OpcodeClashPlayer) {
  const common = "RPS!*";
  const mid = "~><@{}";
  const rare = "8%[?-+X8"; // TODO: & pop from opponent
  const commands = common.repeat(7) + mid.repeat(3) + rare;
  const opcodes = [...commands].sort(() => Math.random() - 0.5);
  console.log(opcodes.length);

  const generateCard = (k: number) => opcodes.splice(0, k).join("");

  const cardCounts = [
    ...Array(6).fill(3),
    ...Array(16).fill(2),
    ...Array(11).fill(1),
  ];

  cardCounts.forEach((count) => {
    const cardId = `card-${Math.random()}`;
    const opcodes = generateCard(count);
    player.my("deck")!.create(Card, cardId, { opcodes });
  });
}

export default createGame(OpcodeClashPlayer, OpcodeClash, (game) => {
  const { action } = game;
  const { playerActions, whileLoop, loop, eachPlayer, everyPlayer } =
    game.flowCommands;

  game.registerClasses(
    Card,
    Value,
    Rock,
    Paper,
    Scissors,
    ...Object.values(Opcode)
  );

  // Create 40 each of R, P, and S in the pile
  for (let i = 0; i < 40; i++) {
    game.pile.create(Rock, `rock-${i}`);
    game.pile.create(Paper, `paper-${i}`);
    game.pile.create(Scissors, `scissors-${i}`);
  }

  for (const player of game.players) {
    const mat = game.create(Space, "mat", { player });
    mat.create(Space, "deck", { player });
    mat.create(Space, "hand", { player });
    mat.create(Space, "sequence", { player });
    mat.create(Space, "stack", { player });
    const slots = mat.create(Space, "slots", { player });
    game.pile.first(Rock)?.putInto(slots);
    game.pile.first(Paper)?.putInto(slots);
    game.pile.first(Scissors)?.putInto(slots);
    generateDeck(game, player);
  }

  game.defineActions({
    drawCards: (player) =>
      action({
        prompt: "Draw cards",
      }).do(() => {
        const numToDraw = Math.min(
          SETUP_CARDS,
          player.my("deck")!.all(Card).length
        );
        player.my("deck")!.firstN(numToDraw, Card).putInto(player.my("hand")!);
      }),

    placeSequence: (player) =>
      action({
        prompt: `Place ${SEQUENCE_CARDS} cards in your sequence`,
      })
        .chooseOnBoard("card", () => player.my("hand")!.all(Card))
        .move("card", player.my("sequence")!),

    donePlacingSequence: (player) =>
      action({
        condition: player.my("sequence")!.all(Card).length == SEQUENCE_CARDS,
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
      while: () => game.sequencePosition < SEQUENCE_CARDS,
      do: [
        eachPlayer({
          name: "executePlayer",
          do: ({ executePlayer }) => {
            const i = game.sequencePosition;
            const card = executePlayer.my("sequence")!.all(Card)[i];
            if (card) {
              game.message(
                `${executePlayer.name} executes card: ${card.toString()}`
              );
              for (const opcode of card.values()) {
                opcode.execute(game, executePlayer);
                game.message(`Executed ${opcode.toString()} (${opcode.constructor.name})`);
              }
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
        const n = Math.min(REPLACE_CARDS, player.my("deck")!.all(Card).length);
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
      if (winner) {
        game.message(`${winner.name} wins the game!`);
      } else {
        game.message("The game ended in a draw!");
      }
    }
  );
});
