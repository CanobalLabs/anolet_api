import {User} from "../models/user";
import {CanobalUser} from "../models/canobalUser";

export async function getUser(id, type) {
    if (!await CanobalUser.findOne({ id: id })) return null;
    if (type == "anolet") return await User.findOne({ id: id });
    if (type == "canobal") return await CanobalUser.findOne({ id: id });
    if (type == "both") {}
    if (type == "both") {
        return Object.assign(
            // todo: fix this
            // @ts-ignore
                ...JSON.parse(
                    JSON.stringify(
                        await Promise.all([
                            User.findOne({ id: id }),
                            CanobalUser.findOne({ id: id })
                        ])
                    ))
                );
    } // Why we have to use JSON.parse -> JSON.stringify: https://stackoverflow.com/a/50520945/14361781
}