const express =
require("express");


const router =
express.Router();


const {

 getProfile,

 updateProfile,

 changePassword,

 addAddress

}
=
require(
 "../controllers/userController"
);


const {

 protect

}
=
require(
 "../middleware/authMiddleware"
);



router.get(
 "/profile",
 protect,
 getProfile
);



router.put(
 "/profile",
 protect,
 updateProfile
);



router.put(
 "/password",
 protect,
 changePassword
);



router.post(
 "/address",
 protect,
 addAddress
);



module.exports =
router;