import {CanobalUser} from "../models/canobalUser";

export async function checkUsername(username: string) {
    return CanobalUser.findOne({ "username": { $regex: new RegExp(username, "i") } }, "id").then(response => {
        return response == null ? false : response.id;
    });
}