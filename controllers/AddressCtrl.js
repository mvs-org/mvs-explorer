'use strict'

var Message = require('../models/message.js')
let Address = require('../models/address.js')
let Asset = require('../models/assets.js')
let Block = require('../models/block.js')
let Tx = require('../models/transaction.js')

exports.Suggest = Suggest
exports.GetBalance = GetBalance
exports.ListBalances = ListBalances
exports.CountAddresses = CountAddresses
exports.GetPublicKey = GetPublicKey

function Suggest(req, res) {
    let prefix = req.params.prefix
    let limit = Math.min(parseInt(req.query.limit) || 10, 100)
    let includeTxCount = false
    Address.suggest(prefix, limit, includeTxCount)
        .then((addresses) => res.status(200).json(Message(1, undefined, addresses)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_SUGGEST_ADDRESSES'))
        })
}

function ListBalances(req, res) {
    let address = req.params.address
    Block.height()
        .then((height) => Promise.all([Address.balances(address, height), Asset.listassets(),]))
        .then(async ([balances, assets]) => {
            balances.definitions = {}
            await Promise.all(assets.map((asset) => {
                if (typeof (balances.tokens[asset.symbol]) != 'undefined') {
                    balances.definitions[asset.symbol] = asset
                }
            }))
            return res.status(200).json(Message(1, undefined, balances))
        })
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_LIST_BALANCES'))
        })
}

function GetBalance(req, res) {
    let address = req.params.address
    let symbol = req.params.symbol.toUpperCase()
    let format = (req.query.format == "plain") ? "plain" : "json"
    Block.height()
        .then((height) => Address.balances(address, height))
        .then((balances) => {
            if (symbol == "ETP")
                return (balances.info.ETP) ? parseInt(balances.info.ETP) / Math.pow(10, 8) : 0
            else {
                balances.definitions = {}
                return Asset.listassets()
                    .then((assets) => Promise.all(assets.map((asset) => {
                        if (typeof (balances.tokens[asset.symbol]) != 'undefined') {
                            balances.definitions[asset.symbol] = asset
                        }
                    })))
                    .then(() =>  (balances.tokens[symbol]) ? balances.tokens[symbol] / Math.pow(10, balances.definitions[symbol].decimals) : 0)
            }
        })
        .then((balance) => {
            if (format == "plain")
                res.status(200).send(balance.toString())
            else
                res.status(200).json(Message(1, undefined, balance))
        })
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_LIST_BALANCES'))
        })
}

async function CountAddresses(req, res) {
    const format = (req.query.format === 'plain') ? 'plain' : 'json'

    Address.countaddresses(0.00000001)
        .then(result => format === 'plain' ? res.send(result.toString()) : res.json(Message(1, undefined, result)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_ADDRESSES_COUNT'))
        })
}

async function GetPublicKey(req, res) {
    let address = req.params.address
    Address.getPublicKey(address)
        .then(result => res.json(Message(1, undefined, result)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_ADDRESSES_COUNT'))
        })
}