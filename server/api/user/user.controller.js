import { UserDetails } from "../../models/user-details.model.js";
import { asyncHandler } from "../../utils/async-handler.util.js";

const setUserDetails = asyncHandler(async (req, res) => {
    const { name, role, extra } = req.body;
    const { uid } = req.user;

    const updated = await UserDetails.findOneAndUpdate(
        { uid },
        { name, role, extra, uid },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).send("SAVED");
});


const getUserDetails = asyncHandler(async (req, res) => {
    const { uid } = req.user;

    const userDetails = await UserDetails.findOne({
        uid,
    })

    if (!userDetails) return res.status(404).send("No user details found!!")

    const detailsToSend = {
        name: userDetails.name,
        role: userDetails.role,
        extra: userDetails.extra
    }

    return res.status(200).send({
        details: detailsToSend
    })

})

export {
    setUserDetails,
    getUserDetails
}