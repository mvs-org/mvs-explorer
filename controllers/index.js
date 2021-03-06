let express = require('express'),
    router = express.Router();

//Load controllers
let AddressCtrl = require('./AddressCtrl.js'),
    BlockCtrl = require('./BlockCtrl.js'),
    PricingCtrl = require('./PricingCtrl.js'),
    ETHSwapCtrl = require('./ETHSwapCtrl.js'),
    SearchCtrl = require('./SearchCtrl.js'),
    MiningCtrl = require('./MiningCtrl.js'),
    ThirdPartyCtrl = require('./ThirdPartyCtrl.js'),
    GeoCtrl = require('./GeoCtrl.js'),
    FullnodeCtrl = require('./FullnodeCtrl.js'),
    LightwalletCtrl = require('./LightwalletCtrl.js'),
    TxCtrl = require('./TxCtrl.js'),
    AssetCtrl = require('./AssetCtrl.js'),
    AvatarCtrl = require('./AvatarCtrl.js'),
    CertCtrl = require('./CertCtrl.js'),
    MitCtrl = require('./MitCtrl.js'),
    InfoCtrl = require('./InfoCtrl.js');

//Caching
let apicache = require('apicache'),
    redis = require('redis'),
    redis_config = require('../config/redis.js'),
    cache = apicache
    .options({
        redisClient: (redis_config.enabled) ? redis.createClient(redis_config.config) : undefined,
        statusCodes: {include: [200]}
    })
    .middleware;
//Define cache rules to only cache if result was successfull
const hourCacheSuccess = cache('60 minutes'),
    longCacheSuccess = cache('5 minutes'),
    mediumCacheSuccess = cache('1 minutes'),
    shortCacheSuccess = cache('20 seconds');

/**
 * Get information on a transaction.
 * @route GET /tx/{hash}
 * @param {string} hash.path.required - Transaction hash
 * @group transaction - Operations about transactions
 * @returns {object} 200 - Transaction details
 */
router.get('/tx/:hash', shortCacheSuccess, TxCtrl.FetchTx);

/**
 * Get the list of all the transactions.
 * @route GET /txs
 * @param {string} page.query.optional - page
 * @param {number} min_time.query.optional - From timestamp
 * @param {number} max_time.query.optional - To timestamp
 * @param {number} min_height.query.optional - From height
 * @param {number} max_height.query.optional - To height
 * @group transaction - Operations about transactions
 * @returns {object} 200 - Transactions list
 */
router.get('/txs', TxCtrl.List);

/**
 * Get the outputs of a transaction.
 * @route GET /tx/outputs/{hash}
 * @param {string} hash.path.required - Transaction hash
 * @group transaction - Operations about transactions
 * @returns {object} 200 - Transaction details
 */
router.get('/tx/outputs/:hash', longCacheSuccess, TxCtrl.FetchTxOutputs);


/**
 * Broadcast a hex encoded transaction.
 * @route POST /tx
 * @param {string} tx.param.required - Transaction hash
 * @group transaction - Operations about transactions
 * @returns {object} 200 - Transaction
 */
router.post('/tx', TxCtrl.Broadcast);

/**
 * Search for transaction hash.
 * @route GET /suggest/tx/{prefix}
 * @param {string} prefix.path.required - Transaction hash prefix
 * @param {number} limit.query.optional - Number of results (default: 10)
 * @group transaction - Operations about transactions
 * @returns {object} 200 - Transaction details
 */
router.get('/suggest/tx/:prefix', mediumCacheSuccess, TxCtrl.Suggest);

/**
 * Get information on an address.
 * @route GET /address/info/{address}
 * @param {string} address.path.required - address
 * @group address - Operations about addresses
 * @returns {object} 200 - Address details
 */
router.get('/address/info/:address', shortCacheSuccess, AddressCtrl.ListBalances);

/**
 * Get public key on an address.
 * @route GET /address/pubkey/{address}
 * @param {string} address.path.required - address
 * @group address - Operations about addresses
 * @returns {object} 200 - Address details
 */
router.get('/address/pubkey/:address', longCacheSuccess, AddressCtrl.GetPublicKey);

/**
 * Get balance of an address.
 * @route GET /address/balance/{symbol}/{address}
 * @param {string} symbol.path.required - symbol
 * @param {string} address.path.required - address
 * @group address - Operations about addresses
 * @returns {object} 200 - Address balance
 */
router.get('/address/balance/:symbol/:address', shortCacheSuccess, AddressCtrl.GetBalance);

/**
 * Search for addresses.
 * @route GET /suggest/address/{prefix}
 * @param {string} prefix.path.required - Address prefix
 * @param {number} limit.query.optional - Number of results (default: 10)
 * @group address - Operations about addresses
 * @returns {object} 200 - Address suggestion
 */
router.get('/suggest/address/:prefix', AddressCtrl.Suggest);

/**
 * Count the number of addresses with an ETP balance.
 * @route GET /addresses/count
 * @param {string} format.query.optional - plain or json (default: json)
 * @group address - Operations about addresses
 * @returns {object} 200 - Transaction array
 */
router.get('/addresses/count', longCacheSuccess, AddressCtrl.CountAddresses);

/**
 * Get latest block number.
 * @route GET /height
 * @group block - Operations about blocks
 * @returns {object} 200 - Latest block number
 */
router.get('/height', shortCacheSuccess, BlockCtrl.FetchHeight);

/**
 * List blocks.
 * @route GET /blocks/{page}
 * @group block - Operations about blocks
 * @param {string} page.query.optional - Page (default: 0)
 * @param {string} items_per_page.query.optional - Items per page (default: 50)
 * @returns {object} 200 - Block data
 */
router.get('/blocks', shortCacheSuccess, BlockCtrl.ListBlocks);

/**
 * List block transactions.
 * @route GET /block/txs/{blockhash}
 * @group block - Operations about blocks
 * @param {string} blockhash.path.required - Hash of block
 * @param {number} page.query.optional - Page (default: 0)
 * @returns {object} 200 - Block data
 */
router.get('/block/txs/:blockhash', shortCacheSuccess, BlockCtrl.ListTxs);

/**
 * Search for block hashes by given prefix.
 * @route GET /suggest/blocks/{prefix}
 * @group block - Operations about blocks
 * @param {string} prefix.path.required - Prefix
 * @param {number} limit.query.optional - Number of results (default: 10, max: 100)
 * @returns {object} 200 - Block data
 */
router.get('/suggest/blocks/:prefix', shortCacheSuccess, BlockCtrl.Suggest);

/**
 * Get the specified block by hash or number.
 * @route GET /block/{block}
 * @group block - Operations about blocks
 * @param {number} block.path.required - block number or hash
 * @returns {object} 200 - Block data
 */
router.get('/block/:blockhash([A-Za-z0-9]{64})', longCacheSuccess, BlockCtrl.FetchHash);
router.get('/block/:block_no([0-9]{1,10})', longCacheSuccess, BlockCtrl.Fetch);

/**
 * This function returns the list of all the assets.
 * @route GET /assets
 * @group mst - Mst operations
 * @returns {object} 200 - List of assets
 */
router.get('/assets', longCacheSuccess, AssetCtrl.ListAllAssets);

/**
 * This function returns the list of all the assets with icons.
 * @route GET /assets/icons
 * @group mst - Mst operations
 * @returns {object} 200 - List of assets
 */
router.get('/assets/icons', longCacheSuccess, AssetCtrl.ListIcons);

/**
 * This function returns the list of all the assets stakeholders ordered by stake.
 * @route GET /stakes/{symbol}
 * @param {string} symbol.path.required - Asset symbol
 * @param {number} limit.query.optional - Number of results (default: 20)
 * @param {number} min.query.optional - Minimum balance (default 0)
 * @group mst - Mst operations
 * @returns {object} 200 - List of assets
 */
router.get('/stakes/:symbol', longCacheSuccess, AssetCtrl.ListStakes);

/**
 * This function returns the list of all the asset names that start with given prefix.
 * @route GET /suggest/asset/{prefix}
 * @param {string} prefix.path.required - Prefix asset symbol
 * @group mst - Mst operations
 * @returns {object} 200 - Search for assets
 */
router.get('/suggest/asset/:prefix', mediumCacheSuccess, AssetCtrl.Search);

/**
 * This function returns the information about a specific asset.
 * @route GET /asset/{asset_symbol}
 * @param {string} asset_symbol.path.required - Asset symbol
 * @param {string} format.query.optional - plain or json (default: json)
 * @group mst - Mst operations
 * @returns {object} 200 - Asset info
 */
router.get('/asset/:asset_symbol', longCacheSuccess, AssetCtrl.AssetInfo);

/**
 * This function returns the initial total supply about a specific asset.
 * @route GET /asset/totalsupply/{asset_symbol}
 * @param {string} asset_symbol.path.required - Asset symbol
 * @group mst - Mst operations
 * @returns {object} 200 - Asset info
 */
router.get('/asset/totalsupply/:asset_symbol', longCacheSuccess, AssetCtrl.AssetTotalSupply);

/**
 * This function returns a list of 3rd party conversion rates.
 * @route GET /3rd/conversion
 * @group bridge - Asset operations
 * @returns {object} 200 - 3rd party conversion rates
 */
router.get('/3rd/conversion', mediumCacheSuccess, ThirdPartyCtrl.rates);

/**
 * This function returns a list of MST-ERC20 configurations.
 * @route GET /bridge/config
 * @group bridge - Bridge operations
 * @returns {object} 200 - Bridge configurations
 */
router.get('/bridge/config', mediumCacheSuccess, AssetCtrl.BridgeConfig);

/**
 * This function returns a whitelist of MSTs that can be swapped with an Ethereum token.
 * @route GET /bridge/whitelist
 * @group bridge - Bridge operations
 * @returns {object} 200 - Bridge Whitelist
 */
router.get('/bridge/whitelist', mediumCacheSuccess, AssetCtrl.BridgeWhitelist);

/**
 * Balances of the ETH swap relay pool.
 * @route GET /bridge/balances
 * @group bridge - Bridge operations
 * @returns {object} 200 - ETHETP rate
 */
router.get('/bridge/balances', mediumCacheSuccess, ETHSwapCtrl.poolBalances);

/**
 * Rate for the ETH to ETP swap.
 * @route GET /bridge/rate/ETHETP
 * @group bridge - Bridge operations
 * @returns {object} 200 - ETHETP rate
 */
router.get('/bridge/rate/ETHETP', shortCacheSuccess, ETHSwapCtrl.ethSwapRate);

/**
 * This function returns the list of all the avatars.
 * @route GET /avatars
 * @group avatar - Avatar operations
 * @param {string} page.query.optional - page (default: 0)
 * @param {string} items_per_page.query.optional - items per page (default: 50)
 * @returns {object} 200 - List of avatars
 */
router.get('/avatars', longCacheSuccess, AvatarCtrl.ListAllAvatars);

/**
 * This function returns the list of all the avatars names that start with given prefix.
 * @route GET /suggest/avatar/{prefix}
 * @group avatar - Avatar operations
 * @returns {object} 200 - Search for avatars
 */
router.get('/suggest/avatar/:prefix', mediumCacheSuccess, AvatarCtrl.Search);

/**
 * This function returns the information about a specific avatar.
 * @route GET /avatar/{avatar_name}
 * @group avatar - Avatar operations
 * @returns {object} 200 - Asset info
 */
router.get('/avatar/:avatar_symbol', longCacheSuccess, AvatarCtrl.AvatarInfo);

/**
 * This function returns the list of all the certs.
 * @route GET /certs
 * @group cert - Cert operations
 * @param {number} show_invalidated.query.optional - Include invalidated certificates (default: false)
 * @param {string} page.query.optional - page (default: 0)
 * @param {string} items_per_page.query.optional - items per page (default: 50, max: 100)
 * @returns {object} 200 - List of certs
 */
router.get('/certs', longCacheSuccess, CertCtrl.ListAllCerts);

/**
 * This function returns the certs about a specific avatar.
 * @route GET /certs/{avatar_name}
 * @group cert - Cert operations
 * @param {number} show_invalidated.query.optional - Include invalidated certificates (default: false)
 * @returns {object} 200 - Cert info
 */
router.get('/certs/:owner', longCacheSuccess, CertCtrl.CertsInfo);

/**
 * This function returns the list of all the mits.
 * @route GET /mits
 * @group mit - Mit operations
 * @param {number} show_invalidated.query.optional - Include invalidated mits (default: false)
 * @param {string} page.query.optional - page (default: 0)
 * @param {string} items_per_page.query.optional - items per page (default: 50, max: 100)
 * @returns {object} 200 - List of mits
 */
router.get('/mits', mediumCacheSuccess, MitCtrl.ListAllMits);

/**
 * This function returns a specific mit.
 * @route GET /mits/{symbol}
 * @group mit - Mit operations
 * @param {number} show_invalidated.query.optional - Include invalidated mits (default: false)
 * @returns {object} 200 - Mit info
 */
router.get('/mits/:symbol', mediumCacheSuccess, MitCtrl.MitsInfo);

/**
 * Search for MIT symbol.
 * @route GET /suggest/mit/{symbol}
 * @group mit - Mit operations
 * @param {string} symbol.path.required - MIT symbol
 * @returns {object} 200 - MIT details
 */
router.get('/suggest/mit/:symbol', mediumCacheSuccess, MitCtrl.Search);

/**
 * This function returns general information about Metaverse blockchain.
 * @route GET /info
 * @group general - General operations
 * @returns {object} 200 - General info
 */
router.get('/info', longCacheSuccess, InfoCtrl.Info);

/**
 * This function returns number of coins in circulation.
 * @route GET /circulation
 * @param {number} adjust.query.optional - Exclude the foundation wallet (default: false)
 * @group general - General operations
 * @returns {object} 200 - Number of coins
 */
router.get('/circulation', hourCacheSuccess, BlockCtrl.FetchCirculation);

/**
 * This function returns the pricing information for multiple assets.
 * @route GET /pricing/tickers
 * @group general - Pricing operations
 * @returns {object} 200 - Tickers
 */
router.get('/pricing/tickers', mediumCacheSuccess, PricingCtrl.tickers);

/**
 * This function returns the sum of add deposited ETP.
 * @route GET /depositsum
 * @group general - General operations
 * @returns {object} 200 - Deposit sum
 */
router.get('/depositsum', longCacheSuccess, TxCtrl.LockSum);

/**
 * This function returns the total amount of rewards from ETP deposits.
 * @route GET /rewards
 * @group general - General operations
 * @returns {object} 200 - Deposit rewards
 */
router.get('/rewards', longCacheSuccess, TxCtrl.Rewards);

/**
 * This function returns version information on the fullnode wallet.
 * @route GET /fullnode/version
 * @group general - General operations
 * @returns {object} 200 - Fullnode version
 */
router.get('/fullnode/version', mediumCacheSuccess, FullnodeCtrl.version);
router.get('/lightwallet/version', mediumCacheSuccess, LightwalletCtrl.version);

router.get('/locations', mediumCacheSuccess, GeoCtrl.locations);

/**
 * Search for transactions, blocks, addresses and assets by given prefix.
 * @route GET /suggest/all/{prefix}
 * @param {string} prefix.path.required - Target prefix
 * @param {number} limit.query.optional - Number of result for each group (default: 10, max: 100)
 * @group general - General operations
 * @returns {object} 200 - Suggestion list
 */
router.get('/suggest/all/:prefix', SearchCtrl.Suggest);

/**
 * List block statistics.
 *
 * Result array contains points in form [height, avg blocktime, difficulty]
 *
 * @route GET /stats/block
 * @param {number} downscale.query.optional - Downscale (integer above 1)
 * @param {string} type.query.optional - Type of mining (pow, pos or dpos)
 * @group general - general operations
 * @returns {object} 200 - Suggestion list
 */
router.get('/stats/block', hourCacheSuccess, BlockCtrl.ListBlockstats);

/**
 * List block statistics by date.
 *
 * Result array contains points in form [date, value]
 *
 * @route GET /stats/date
 * @param {string} type.query.optional - Type of data (txcount, count, pow, pos or dpos. Default: pow)
 * @group general - general operations
 * @returns {object} 200 - Suggestion list
 */
router.get('/stats/date', hourCacheSuccess, BlockCtrl.ListBlockstatsByDate);

/**
 * This function returns the general mining information.
 * @route GET /mining/general
 * @param {number} interval.query.optional - Interval (default: 1000)
 * @group mining - Mining operations
 * @returns {object} 200 - Mining info
 */
router.get('/mining/general', shortCacheSuccess, MiningCtrl.info);

/**
 * This function returns the PoW mining information.
 * @route GET /mining/pow
 * @param {number} number.query.optional - Number of blocks used to calculate the statistics (default: 1000, max: 10000)
 * @group mining - Mining operations
 * @returns {object} 200 - Mining info
 */
router.get('/mining', shortCacheSuccess, MiningCtrl.PowInfo);
router.get('/mining/pow', shortCacheSuccess, MiningCtrl.PowInfo);

/**
 * This function returns the PoS mining information.
 * @route GET /mining/pos
 * @param {number} number.query.optional - Number of blocks used to calculate the statistics (default: 1000, max: 10000)
 * @group mining - Mining operations
 * @returns {object} 200 - Mining info
 */
router.get('/mining/pos', shortCacheSuccess, MiningCtrl.PosInfo);

/**
 * This function returns the mining pool statistics.
 * @route GET /poolstats
 * @param {number} interval.query.optional - Interval (default: 1000, max: 10000)
 * @group mining - Mining operations
 * @returns {object} 200 - Mining pool statistics
 */
router.get('/poolstats', longCacheSuccess, MiningCtrl.poolstats);

/**
 * This function returns the count of the votes that are ready for mining.
 * @route GET /posvotes/{avatar}
 * @param {string} avatar.path.required - Avatar
 * @param {number} interval.query.optional - Interval (default: 1000, max: 10000)
 * @group mining - Mining operations
 * @returns {object} 200 - PoS mining statistics
 */
router.get('/posvotes/:avatar', mediumCacheSuccess, MiningCtrl.posVotesByAvatar);

/**
 * This function returns the count of the votes that are ready for mining.
 * @route GET /posvotes
 * @param {number} interval.query.optional - Interval (default: 1000, max: 10000)
 * @group mining - Mining operations
 * @returns {object} 200 - PoS mining statistics
 */
router.get('/posvotes', longCacheSuccess, MiningCtrl.posVotes);

/**
 * This function returns the PoS mining statistics.
 * @route GET /posstats
 * @param {number} interval.query.optional - Interval (default: 1000, max: 10000)
 * @param {number} top.query.optional - Number of Avatars returned (default: 25, max: 100)
 * @group mining - Mining operations
 * @returns {object} 200 - PoS mining statistics
 */
router.get('/posstats', longCacheSuccess, MiningCtrl.posstats);

/**
 * This function returns the MST mining statistics.
 * @route GET /mstmining
 * @param {number} interval.query.optional - Interval (default: 1000, max: 10000)
 * @group mining - Mining operations
 * @returns {object} 200 - MST mining statistics
 */
router.get('/mstmining', longCacheSuccess, MiningCtrl.mstMiningStats);

/**
 * This function returns the list of MST that can be mined.
 * @route GET /mstmininglist
 * @group mining - Mining operations
 * @returns {object} 200 - MST mining list
 */
router.get('/mstmininglist', longCacheSuccess, MiningCtrl.listMstMining);

exports.routes = router;
