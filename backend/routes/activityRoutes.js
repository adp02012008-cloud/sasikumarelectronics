const express =
require("express");


const router =
express.Router();



const {


 saveActivity,


 personalRecommendation,


 recentViews,


 history,


 clearHistory


} =
require(
 "../controllers/activityController"
);




const {

 protect

} =
require(
 "../middleware/authMiddleware"
);






/*
==============================
SAVE PRODUCT VIEW
==============================
*/


router.post(

 "/view",

 protect,

 saveActivity

);






/*
==============================
PERSONAL RECOMMENDATION
==============================
*/


router.get(

 "/recommend",

 protect,

 personalRecommendation

);






/*
==============================
RECENTLY VIEWED
==============================
*/


router.get(

 "/recent",

 protect,

 recentViews

);







/*
==============================
BROWSING HISTORY
==============================
*/


router.get(

 "/history",

 protect,

 history

);







/*
==============================
CLEAR HISTORY
==============================
*/


router.delete(

 "/clear",

 protect,

 clearHistory

);






module.exports =
router;