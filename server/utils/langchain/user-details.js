import { UserDetails } from "../../models/user-details.model.js";

export const getUserDetails = async (uid) => {

    const userDetails = await UserDetails.findOne({
        uid,
    })

    if (!userDetails) return "No user details are available. Respond in a helpful, friendly way without personalization.";

    return `USER DETAILS:
        ${JSON.stringify(userDetails)}
    `
}