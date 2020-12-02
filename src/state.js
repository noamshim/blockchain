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

const crypto = require("crypto");

class ShippingState {
  constructor(context) {
    this.context = context;
    this.addressCache = new Map([]);
    this.timeout = 500; // Timeout in milliseconds
  }

  getPackage(id) {
    return this._loadPackages(id).then((packages) => packages.get(id));
  }

  setPackage(id, pack) {
    let address = _makeShippingAddress(id);

    return this._loadPackages(id)
      .then((packages) => {
        packages.set(id, pack);
        return packages;
      })
      .then((packages) => {
        let data = _serialize(packages);

        this.addressCache.set(address, data);
        let entries = {
          [address]: data,
        };
        return this.context.setState(entries, this.timeout);
      });
  }

  // deleteGame(name) {
  //   let address = _makeXoAddress(name);
  //   return this._loadGames(name).then((games) => {
  //     games.delete(name);
  //
  //     if (games.size === 0) {
  //       this.addressCache.set(address, null);
  //       return this.context.deleteState([address], this.timeout);
  //     } else {
  //       let data = _serialize(games);
  //       this.addressCache.set(address, data);
  //       let entries = {
  //         [address]: data,
  //       };
  //       return this.context.setState(entries, this.timeout);
  //     }
  //   });
  // }

  _loadPackages(id) {
    let address = _makeShippingAddress(id);
    if (this.addressCache.has(address)) {
      if (this.addressCache.get(address) === null) {
        return Promise.resolve(new Map([]));
      } else {
        return Promise.resolve(_deserialize(this.addressCache.get(address)));
      }
    } else {
      return this.context
        .getState([address], this.timeout)
        .then((addressValues) => {
          if (!addressValues[address].toString()) {
            this.addressCache.set(address, null);
            return new Map([]);
          } else {
            let data = addressValues[address].toString();
            this.addressCache.set(address, data);
            return _deserialize(data);
          }
        });
    }
  }
}

const _hash = (x) =>
  crypto
    .createHash("sha512")
    .update(x)
    .digest("hex")
    .toLowerCase()
    .substring(0, 64);

const SHIPPING_FAMILY = "shipping";

const SHIPPING_NAMESPACE = _hash(SHIPPING_FAMILY).substring(0, 6);

const _makeShippingAddress = (x) => SHIPPING_NAMESPACE + _hash(x);

module.exports = {
  SHIPPING_NAMESPACE,
  SHIPPING_FAMILY,
  ShippingState,
};

const _deserialize = (data) => {
  let packagesIterable = data
    .split("|")
    .map((x) => x.split(","))
    .map((x) => [
      x[0],
      { id: x[0], history: x[1], location: x[2], time: x[3] },
    ]);
  return new Map(packagesIterable);
};

const _serialize = (packages) => {
  let packageStrs = [];
  for (let idPackage of packages) {
    let id = idPackage[0];
    let pack = idPackage[1];
    packageStrs.push(
      [id, pack.history, pack.location, pack.time].join(",")
    );
  }

  packageStrs.sort();

  return Buffer.from(packageStrs.join("|"));
};
