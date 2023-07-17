import {CalculatePermissions} from '../modules/CalculatePermissions';
import {User} from "../models/user";

export = function Permission(perm1: string, perm2?: string) {
    return async function (req, res, next) {
        if (!res.locals.id) return res.status(401).send();
        if ((await CalculatePermissions(res.locals.id)).includes(perm1) || (await CalculatePermissions(res.locals.id)).includes(perm2)) {
            res.locals.permissions = await CalculatePermissions(res.locals.id);
            next();
        } else {
            res.status(403).send();
        }
    }
}
