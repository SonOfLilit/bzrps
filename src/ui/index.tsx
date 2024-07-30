import React from "react";
import { Piece, Space, render } from "@boardzilla/core";
import { Card, default as setup } from "../game/index.js";

import "./style.scss";

render(setup, {
  settings: {},
  layout: (game) => {
    game.all(Card).appearance({ aspectRatio: 3 / 4 });
    game.all(Space, { name: "hand" }).layout(Piece, {
      rows: { max: 1 },
      gap: { x: 3, y: 0 },
      haphazardly: 0.2,
    });
    game.all(Space, { name: "sequence" }).layout(Piece, {
      rows: { max: 1 },
      gap: { x: 3, y: 0 },
      haphazardly: 0.2,
    });
    game.all(Space, { name: "stack" }).layout(Piece, {
      columns: { max: 1 },
      gap: { x: 0, y: 3 },
    });
    game.all(Space, { name: "slots" }).layout(Piece, {
      rows: { max: 1 },
      gap: { x: 3, y: 0 },
    });
  },
});
