/*
 * @author     Martin Høgh <mh@mapcentia.com>
 * @copyright  2013-2021 MapCentia ApS
 * @license    http://www.gnu.org/licenses/#AGPL  GNU AFFERO GENERAL PUBLIC LICENSE 3
 */

'use strict';

var urlparser = require('./../../../browser/modules/urlparser');
var db = urlparser.db;
var Chart = require('chart.js/auto');

module.exports = {

    /**
     *
     * @param o
     * @returns {exports}
     */
    set: function (o) {
        return this;
    },

    /**
     *
     */
    init: function () {
        window.elevation = (sql) => {
            fetch(
                `/api/sql/${db}?q=${sql}&srs=4326`
            ).then((res) => res.json()).then((data) => {
                const coords = data.features.map((feature) => {
                    return feature.geometry.coordinates.reverse()
                })
                console.log(coords)
                fetch(
                    '/api/elevation',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(coords)
                    }
                ).then((res) => res.json()).then((data) => {
                    // const elevations = data.results.map((result) => {
                    //     return result.elevation
                    // })
                    console.log(data)
                    const ctx = document.getElementById('chart');

                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: data.map(e => e.distance),
                            datasets: [{
                                data: data.map(e => e.elevation),
                                fill: true,
                                borderColor: '#66ccff',
                                backgroundColor: '#66ccff66',
                                tension: 0.1,
                                pointRadius: 0,
                                spanGaps: true                }]
                        },
                        plugins: [{
                            beforeInit: (chart, args, options) => {
                                const maxHeight = Math.max(...chart.data.datasets[0].data);
                                chart.options.scales.x.min = Math.min(...chart.data.labels);
                                chart.options.scales.x.max = Math.max(...chart.data.labels);
                                chart.options.scales.y.max = maxHeight + Math.round(maxHeight * 0.2);
                                chart.options.scales.y1.max = maxHeight + Math.round(maxHeight * 0.2);
                            }
                        }],
                        options: {
                            animation: false,
                            maintainAspectRatio: false,
                            interaction: { intersect: false, mode: 'index' },
                            tooltip: { position: 'nearest' },
                            scales: {
                                x: { type: 'linear' },
                                y: { type: 'linear', beginAtZero: true },
                                y1: { type: 'linear', display: true, position: 'right', beginAtZero: true, grid: { drawOnChartArea: false }},
                            },
                            plugins: {
                                title: { align: "end", display: true, text: "Distance, m / Højde, m" },
                                legend: { display: false },
                                tooltip: {
                                    displayColors: false,
                                    callbacks: {
                                        title: (tooltipItems) => {
                                            return "Distance: " + tooltipItems[0].label + 'm'
                                        },
                                        label: (tooltipItem) => {
                                            return "Højde: " + tooltipItem.raw + 'm'
                                        },
                                    }
                                }
                            }
                        }
                    });
                })
            })
        }
    }
};