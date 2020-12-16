/**
 * Copyright 2017-2018 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ------------------------------------------------------------------------------
 */

"use strict";

const ShippingPayload = require("./payload");

  const { SHIPPING_NAMESPACE, SHIPPING_FAMILY, ShippingState } = require("./state");

const { TransactionHandler } = require("sawtooth-sdk/processor/handler");
const { InvalidTransaction } = require("sawtooth-sdk/processor/exceptions");
//
// const _gameToStr = (board, state, player1, player2, name) => {
//   board = board.replace(/-/g, " ");
//   board = board.split("");
//   let out = "";
//   out += `GAME: ${name}\n`;
//   out += `PLAYER 1: ${player1.substring(0, 6)}\n`;
//   out += `PLAYER 2: ${player2.substring(0, 6)}\n`;
//   out += `STATE: ${state}\n`;
//   out += `\n`;
//   out += `${board[0]} | ${board[1]} | ${board[2]} \n`;
//   out += `---|---|--- \n`;
//   out += `${board[3]} | ${board[4]} | ${board[5]} \n`;
//   out += `---|---|--- \n`;
//   out += `${board[6]} | ${board[7]} | ${board[8]} \n`;
//   return out;
// };

// const _display = (msg) => {
//   let n = msg.search("\n");
//   let length = 0;
//
//   if (n !== -1) {
//     msg = msg.split("\n");
//     for (let i = 0; i < msg.length; i++) {
//       if (msg[i].length > length) {
//         length = msg[i].length;
//       }
//     }
//   } else {
//     length = msg.length;
//     msg = [msg];
//   }
//
//   console.log("+" + "-".repeat(length + 2) + "+");
//   for (let i = 0; i < msg.length; i++) {
//     let len = length - msg[i].length;
//
//     if (len % 2 === 1) {
//       console.log(
//         "+ " +
//           " ".repeat(Math.floor(len / 2)) +
//           msg[i] +
//           " ".repeat(Math.floor(len / 2 + 1)) +
//           " +"
//       );
//     } else {
//       console.log(
//         "+ " +
//           " ".repeat(Math.floor(len / 2)) +
//           msg[i] +
//           " ".repeat(Math.floor(len / 2)) +
//           " +"
//       );
//     }
//   }
//   console.log("+" + "-".repeat(length + 2) + "+");
// };


class ShippingHandler extends TransactionHandler {
  constructor() {
    super(SHIPPING_FAMILY, ["1.0"], [SHIPPING_NAMESPACE]);
  }

  apply(transactionProcessRequest, context) {
    let payload = ShippingPayload.fromBytes(transactionProcessRequest.payload);
    let shippingState = new ShippingState(context);
    let header = transactionProcessRequest.header;
    let shipper = header.signerPublicKey;

    console.log('---------------', payload)

    if (payload.action === "create") {
      return shippingState.getPackage(payload.id).then((pack) => {
        if (pack !== undefined) {
          throw new InvalidTransaction("Invalid Action: Package already exists.");
        }

        let createdPackage = {
          id: payload.id,
          history: [],
          location: payload.location,
        };

        console.log(
          `-------------------------------------------
          -----------------------------------
          -----------------------------------
          -------------------------------Shipper ${shipper.toString().substring(0, 6)} created packages ${
            payload.id
          }`
        );

        return shippingState.setPackage(payload.id, createdPackage);
      });
    } else if (payload.action === "update") {
      return shippingState.getPackage(payload.id).then((pack) => {

        if (payload.location.length < 1) {
          throw new InvalidTransaction("Invalid location");
        }

        if (pack === undefined) {
          throw new InvalidTransaction(
            "Invalid Action: Update requires a package id."
          );
        }

        console.log(pack)

        pack.history.push(pack.location);
        pack.location = payload.location;

        let shipperString = shipper.toString().substring(0, 6);

        console.log(
          `Shipper ${shipperString} takes location: ${pack.location} history: ${pack.history}\n\n`
        );

        return shippingState.setPackage(payload.id, pack);
      });
    } else if (payload.action === "get") {
      return shippingState.getPackage(payload.id).then((pack) => {
        if (pack === undefined) {
          throw new InvalidTransaction(
            `No package with id ${payload.id}`
          );
        }
        return shippingState.getPackage(payload.id);
      });
    } else {
      throw new InvalidTransaction(
        `Action must be create, update, or get not ${payload.action}`
      );
    }
  }
}

module.exports = ShippingHandler;
