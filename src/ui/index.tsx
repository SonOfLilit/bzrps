import React from "react";
import { Piece, Space, render } from "@boardzilla/core";
import { Card, Value, default as setup } from "../game/index.js";

import "./style.scss";

render(setup, {
  boardSizes: [
    {
      name: "desktop",
      desktop: true,
      aspectRatio: { min: 8 / 5, max: 2 / 1 },
    },
  ],
  settings: {},
  layout: (game) => {
    const p1 = game.players[0];
    const p2 = game.players[1];
    const p1mat = p1.my("mat")!;
    const p2mat = p2.my("mat")!;

    for (const mat of [p1mat, p2mat]) {
      mat.layout("deck", {
        area: { top: 66, height: 34, left: 0, width: 75 },
        showBoundingBox: true,
      });
      mat.layout("hand", {
        area: { top: 0, height: 33, left: 0, width: 75 },
      });
      mat.layout("sequence", {
        area: { top: 33, height: 33, left: 0, width: 75 },
      });
      mat.layout("stack", {
        area: { top: 0, height: 100, left: 0 + 75, width: 12.5 },
      });
      mat.layout("slots", {
        area: { top: 0, height: 100, left: 0 + 87.5, width: 12.5 },
      });
    }
    game.all("hand").layout(Piece, {
      rows: { max: 1 },
      gap: { x: 1, y: 0 },
      //haphazardly: 0.2,
    });
    game.all("sequence").layout(Piece, {
      rows: { max: 1 },
      gap: { x: 1, y: 0 },
      //haphazardly: 0.2,
    });
    game.all("stack").layout(Piece, {
      gap: { x: 0, y: 0 },
      alignment: "bottom",
      direction: "btt",
    });
    game.all("slots").layout(Piece, {
      columns: { max: 1 },
      gap: { x: 3, y: 0 },
    });

    // game.disableDefaultAppearance();
    game.all("slots").appearance({
      render: (el) => <div>❤️ {el.player!.hp}</div>,
    });
    game.all(Card).appearance({
      aspectRatio: 3 / 4,
      render: (el) => (
        <div>
          {el.opcodes().map((o, i) => (
            <span className={(i == el.currentOpcode) ? "active" : undefined}>{o.toString()}</span>
          ))}
        </div>
      ),
      info: (el) => (
        <div>
          {el.opcodes().map((o) => (
            <div>
              {o.toString()} ({o.constructor.name})
            </div>
          ))}
        </div>
      ),
    });
    game.all(Value).appearance({
      aspectRatio: 1,
      info: (el) => <div>{el.value}</div>,
    });
  },
});
