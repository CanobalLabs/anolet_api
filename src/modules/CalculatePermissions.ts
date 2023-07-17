import * as GetUser from "./GetUser";

export async function CalculatePermissions(ranks) {
    if (typeof ranks == "string") ranks = (await GetUser.getUser(ranks, "anolet")).ranks
    if (!ranks) return [];
    return ranks.map(rank => require("../../constants/ranks.json").find(({ id }) => id == rank)?.permissions || undefined).flat();
}
