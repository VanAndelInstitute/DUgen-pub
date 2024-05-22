(function storage() {
    var querystring = parseQuery();
    var dirs = {};
    var dirStack = [];
    var parentChart;
    var childrenChart;

    fetchData();
    function createParentChart(data) {
        if (parentChart) {
            parentChart.destroy();
        }

        parentChart = new Chart(document.getElementById("parentChart").getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.map(record => record.id),
                datasets: [
                    {
                        label: 'Inactive (Data NOT Used In Over 1 Year)',
                        backgroundColor: 'rgba(140, 168, 184, 1)',
                        data: data.map(record => record.cold / 1000000000)
                    },
                    {
                        label: 'Active (Data Used Within Last Year)',
                        backgroundColor: 'rgba(64, 194, 255, 1)',
                        data: data.map(record => record.hot / 1000000000)
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Current Folder',
                        color: 'white',
                        font: {
                            size: 32
                        }
                    },
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: "white",
                            font: {
                                size: 18
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        xAlign: 'center',
                        yAlign: 'bottom',
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + (context.parsed.x).toFixed(2) + ' GB';
                            },
                            footer: function (tooltipItems) {
                                let sum = 0;
                                tooltipItems.forEach(function (tooltipItem) {
                                    sum += tooltipItem.parsed.x;
                                });
                                return 'Total: ' + (sum).toFixed(2) + ' GB';
                            }
                        }
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        gridLines: {
                            color: "white"
                        },
                        ticks: {
                            callback: function (val, index) {
                                return this.getLabelForValue(val) + ' GB';
                            },
                            beginAtZero: true,
                            suggestedMax: 100,
                            font: {
                                size: 16,
                                weight: "bold"
                            },
                            color: "white"
                        }
                    },
                    x2: {
                        stacked: true,
                        position: 'right',
                        ticks: {
                            callback: function (val, index) {
                                return ((data.map(record => record.cold)[index] + data.map(record => record.hot)[index]) / 1000000000).toFixed(2) + ' GB';
                            },
                            beginAtZero: true,
                            suggestedMax: 100,
                            font: {
                                size: 16,
                                weight: "bold"
                            },
                            color: "white"
                        }
                    },
                    y: {
                        stacked: true,
                        gridLines: {
                            display: false,
                            color: "white"
                        },
                        ticks: {
                            font: {
                                size: 16
                            },
                            color: "white"
                        }
                    },
                },
                onClick: function (event) {
                    back();
                    // const points = parentChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

                    // if (points.length) {
                    //     const firstPoint = points[0];
                    //     const label = parentChart.data.labels[firstPoint.index];
                    //     const value = parentChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                    //     show(label.includes('/varidata/research/projects') ? label : dirStack[dirStack.length - 1] + label);
                    // }
                },
                animation: {
                    duration: 0,
                    onComplete: function () {
                        // var self = this;
                        // drawChart(self, data);
                    },
                }
            }
        });
    }

    function createChildrenChart(data) {
        if (childrenChart) {
            childrenChart.destroy();
        }

        childrenChart = new Chart(document.getElementById("childrenChart").getContext('2d'), {
            type: 'bar',
            data: {
                labels: data.map(record => record.id),
                datasets: [
                    {
                        label: 'Inactive (Data NOT Used In Over 1 Year)',
                        backgroundColor: 'rgba(140, 168, 184, 1)',
                        data: data.map(record => record.cold / 1000000000)
                    },
                    {
                        label: 'Active (Data Used Within Last Year)',
                        backgroundColor: 'rgba(64, 194, 255, 1)',
                        data: data.map(record => record.hot / 1000000000)
                    }
                ]
            },
            options: {
                indexAxis: 'y',
                // events: ['click'],
                plugins: {
                    title: {
                        display: true,
                        text: 'Subfolders',
                        color: 'white',
                        font: {
                            size: 32
                        }
                    },
                    legend: {
                        display: false,
                        position: 'bottom',
                        labels: {
                            color: "white",
                            font: {
                                size: 18
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        xAlign: 'center',
                        yAlign: 'bottom',
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + (context.parsed.x).toFixed(2) + ' GB';
                            },
                            footer: function (tooltipItems) {
                                let sum = 0;
                                tooltipItems.forEach(function (tooltipItem) {
                                    sum += tooltipItem.parsed.x;
                                });
                                return 'Total: ' + (sum).toFixed(2) + ' GB';
                            }
                        }
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x2: {
                        stacked: true,
                        position: 'right',
                        ticks: {
                            callback: function (val, index) {
                                return ((data.map(record => record.cold)[index] + data.map(record => record.hot)[index]) / 1000000000).toFixed(2) + ' GB';
                            },
                            beginAtZero: true,
                            suggestedMax: 100,
                            font: {
                                size: 16,
                                weight: "bold"
                            },
                            color: "white"
                        }
                    },

                    x: {
                        stacked: true,
                        gridLines: {
                            color: "white"
                        },
                        ticks: {
                            callback: function (val, index) {
                                return this.getLabelForValue(val) + ' GB';
                            },
                            beginAtZero: true,
                            font: {
                                size: 16,
                                weight: "bold"
                            },
                            color: "white"
                        }
                    },
                    y: {
                        stacked: true,
                        gridLines: {
                            display: false,
                            color: "white"
                        },
                        ticks: {
                            font: {
                                size: 16
                            },
                            color: "white"
                        }
                    },
                },
                onClick: function (event) {
                    const points = childrenChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

                    if (points.length) {
                        const firstPoint = points[0];
                        const label = childrenChart.data.labels[firstPoint.index];
                        const value = childrenChart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                        show(label);
                    }
                },
                animation: {
                    duration: 0,
                    onComplete: function () {
                        // var self = this;
                        // drawChart(self, data);
                    },
                }
            }
        })
    }

    function back() {

    }

    function show(dirname) {
        if (dirname.indexOf('[Files]') != -1) {
            return;
        }
        dirStack.push(dirname);
        dirEntry = dirs[dirname];

        var chartData = [];

        if (dirStack.length > 0) {
            chartData.push({
                id: dirname,
                hot: (dirEntry.size - dirEntry.coldsize),
                hotPercent: (dirEntry.size - dirEntry.coldsize) / dirEntry.size * 100,
                cold: dirEntry.coldsize,
                coldPercent: (dirEntry.coldsize) / dirEntry.size * 100,
                total: dirEntry.size
            });
        }

        createParentChart(chartData);

        var chartData = [];

        var heightMod = dirEntry.children.length * 5 + 10;
        document.getElementsByClassName('children-chart-container')[0].style.height = heightMod + 'em';

        var files = {
            id: '[Files]',
            hot: (dirEntry.size - dirEntry.coldsize),
            hotPercent: ((dirEntry.size - dirEntry.coldsize) / dirEntry.size * 100).toFixed(2),
            cold: dirEntry.coldsize,
            coldPercent: ((dirEntry.coldsize) / dirEntry.size * 100).toFixed(2),
            total: dirEntry.size
        }

        dirEntry.children.forEach(child => {
            chartData.push({
                id:  child,
                hot: (dirs[child].size - dirs[child].coldsize),
                hotPercent: ((dirs[child].size - dirs[child].coldsize) / dirEntry.size * 100).toFixed(2),
                cold: dirs[child].coldsize,
                coldPercent: ((dirs[child].coldsize) / dirEntry.size * 100).toFixed(2),
                total: dirEntry.size
            });
            files.hot = files.hot - (dirs[child].size - dirs[child].coldsize);
            files.hotPercent = (files.hot / files.total * 100).toFixed(2);
            files.cold = files.cold - dirs[child].coldsize;
            files.coldPercent = (files.cold / files.total * 100).toFixed(2);
        });

        chartData.push(files);

        chartData = chartData.sort((a, b) => {
            if (a.hot + a.cold < b.hot + b.cold) {
                return 1
            }
            if (a.hot + a.cold > b.hot + b.cold) {
                return -1
            }
            return 0;
        });

        createChildrenChart(chartData);
    }

    function fetchData() {
        var lab = querystring.id;
        fetch("data/" + lab + '.sorted.gz.DU.json.gz')
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => {
                const compressed = new Uint8Array(arrayBuffer);
                const decompressed = fflate.decompressSync(compressed);
                const jsonTxt = fflate.strFromU8(decompressed);
                const json = JSON.parse(jsonTxt);
                for (var i = 0; i < json.dirs.length; i++) {
                    d = json.dirs[i];
                    dirs[d.dir] = d;
                }
                show("/");
            });
    };

    function parseQuery() {
        var s = window.location.search.substring(1).split("&");
        var s_length = s.length;
        var bit, query = {lab: [], top: 20, cutoff: 0}, first, second;
        for(var i = 0; i < s_length; i++) {
            bit = s[i].split("=");
            first = decodeURIComponent(bit[0]);
            if(first.length == 0) continue;
            second = decodeURIComponent(bit[1]);
            if(typeof query[first] == "undefined") query[first] = second.toLocaleLowerCase();
            else if(query[first] instanceof Array) query[first].push(second.toLocaleLowerCase());
            else query[first] = second.toLocaleLowerCase();
        }
        return query;
    }

    document.addEventListener("DOMContentLoaded", function(event) {
        document.getElementById("back-arrow").onclick = function back() {
            if (dirStack.length > 1) {
                dirStack.pop();
                show(dirStack.pop());
            }
        };
    });
})();
