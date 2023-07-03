const GetUser = require("./GetUser.js");

module.exports = async function(ranks) {
    if (typeof ranks == "string") ranks = (await GetUser(ranks, "anolet")).ranks
    if (!ranks) return [];
    return ranks.map(rank => require("../constants/ranks.json").find(({ id }) => id == rank)?.permissions || undefined).flat();
}
