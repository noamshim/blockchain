/**
 * Copyright 2018 Intel Corporation
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
const { TextEncoder, TextDecoder } = require("text-encoding/lib/encoding");
const { InvalidTransaction } = require("sawtooth-sdk/processor/exceptions");
const decoder = new TextDecoder("utf8");
class ShippingPayload {
  constructor(id, action, location, name, time) {
    this.id = id;
    this.action = action;
    this.location = location;
    this.name = name;
    this.time = time;
  }

  static fromBytes(payload) {
    payload = decoder.decode(payload).split(",");
    if (payload.length === 5) {
      let shippingPayload = new ShippingPayload(payload[0], payload[1], payload[2], payload[3], payload[4]);
      console.log('**********success payload')
      if (!shippingPayload.id) {
        throw new InvalidTransaction("Package id is required");
      }
      if (shippingPayload.id.indexOf("|") !== -1) {
        throw new InvalidTransaction('Package id cannot contain "|"');
      }

      if (!shippingPayload.action) {
        throw new InvalidTransaction("Action is required");
      }
      return shippingPayload;
    } else {
      throw new InvalidTransaction("Invalid payload serialization");
    }
  }
}

module.exports = ShippingPayload;
