'use strict';

//Load Models
var Assets = require('../models/assets.js'),
    BridgeConfig = require('../config/eth-bridge.js'),
    Message = require('../models/message.js');

exports.ListAllAssets = listassets;
exports.ListStakes = listStakes;
exports.AssetInfo = assetinfo;
exports.Search = search;
exports.BridgeBlacklist = ethBridgeBlacklist;

/**
 * Get the list of all the assets.
 * @param {} req
 * @param {} res
 */
function listassets(req, res) {
    Assets.listassets()
        .then((assets) => res.json(Message(1, undefined, assets)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_ASSETS')));
};

/**
 * Get the list of all the assets stakeholders ordered by stake.
 * @param {} req
 * @param {} res
 */
function listStakes(req, res) {
    let symbol = req.params.symbol;
    let limit = parseInt(req.query.limit) || 20;
    let min = parseInt(req.query.min) || 0;
    Assets.stakelist(symbol.replace(/\./g,'_'), limit, min)
        .then((list) => res.json(Message(1, undefined, list)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_ASSETS_STAKES'));
        });
};

/**
 * Search for assets names.
 * @param {} req
 * @param {} res
 */
function search(req, res) {
    let prefix = req.params.prefix;
    var limit = parseInt(req.query.limit) || 10;
    Assets.suggest(prefix, limit)
        .then((assets) => res.json(Message(1, undefined, assets)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_SEARCH_ASSETS')));
};

/**
 * Get the information of an asset.
 * @param {} req
 * @param {} res
 */
function assetinfo(req, res) {
    var symbol = req.params.asset_symbol;
    Assets.assetinfo(symbol.toUpperCase())
        .then((assets) => res.json(Message(1, undefined, assets)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_ASSETS')));
};

function ethBridgeBlacklist(req,res){
    if(BridgeConfig.blacklist)
        res.json(Message(1, undefined, BridgeConfig.blacklist));
    else
        res.status(404).json(Message(0, 'ERR_ETH_BRIDGE_BLACKLIST'));
}
