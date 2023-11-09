/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2023 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

const express = require('express');
const router = express.Router();
const fetch = require("node-fetch");
const config = require('../../../config/config.js');
const key = config?.searchConfig?.google?.key;

var turf = require('@turf/turf');


router.post('/api/elevation/', (req, res) => {
    const coords = req.body.map(coord => {
        return coord.join(',')
    })
    const url = 'https://maps.googleapis.com/maps/api/elevation/json?path=' + coords.join('|') + '&samples=50&key=AIzaSyBB1r76SA6z1oEScmh6Td_v59KR1dIgv9c';
    console.log(url)
    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    };
    fetch(url, options)
        .then(response => {
            res.header('content-type', 'application/json');
            if (response.ok) {
                response.json().then(data => {

                    let arr = []
                    let distance = 0;
                    let results = data.results;
                    for (let i = 0; i < results.length; i++) {
                        if (results[i + 1]) {
                            var from = turf.point([results[i].location.lng, results[i].location.lat]);
                            var to = turf.point([results[i + 1].location.lng, results[i + 1].location.lat]);
                            var options = {units: 'meters'};
                        }
                        arr.push({distance: distance, elevation: results[i].elevation});
                        distance += turf.distance(from, to, options);
                    }
                    res.send(arr);
                })
            } else {
                res.status(response.status).send({"success": false});
            }
        })
        .catch(error => {
            console.log(error)
            res.send("ERROR!");
        });
});
module.exports = router;
