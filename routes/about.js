/**
 * Created by TRINHDUYKHUE on 7/22/2016.
 */
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('pages/about');
});

module.exports = router;
