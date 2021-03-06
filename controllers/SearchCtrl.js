'use strict';

//Load Models
var Message = require('../models/message.js');
var Transaction = require('../models/transaction');
var Block = require('../models/block');
var Address = require('../models/address');
var Asset = require('../models/assets');
var Avatar = require('../models/avatars');
var Mit = require('../models/mits');
var Helper = require('../libraries/helper.js');

exports.Suggest = suggest;

/**
 * Suggest transactions, addresses, blocks and assets for given prefix.
 * @param {} req
 * @param {} res
 */
function suggest(req, res) {
    var prefix = req.params.prefix;
    let limit = Math.min(parseInt(req.query.limit) || 10, 100)

    Promise.all([
            Helper.checkError(limit <= 20, 'ERR_LIMIT_RANGE'),
            Helper.checkError(prefix.length >= 3, 'ERR_PREFIX_LENGTH')
        ])
        .then(() => Promise.all([
            Transaction.suggest(prefix, limit),
            Address.suggest(prefix, limit, true),
            Block.suggest(prefix, limit),
            Asset.suggest(prefix, limit),
            Avatar.suggest(prefix, limit),
            Mit.suggest(prefix, limit)
        ]))
        .then((suggestions) => {
            res.json(Message(1, undefined, {
                tx: suggestions[0],
                address: suggestions[1],
                block: suggestions[2],
                asset: suggestions[3],
                avatar: suggestions[4],
                mit: suggestions[5]
            }));
        })
        .catch((error) => {
            switch (error.message) {
                case 'ERR_LIMIT_RANGE':
                case 'ERR_PREFIX_LENGTH':
                    break;
                default:
                    console.error(error);
            }
            res.status(404).json(Message(0, error.message));
        });
}
