module.exports = function(ranks) {
return ranks.map(rank => require("../constants/ranks.json").find(({ id }) => id == rank).permissions).flat();
}
