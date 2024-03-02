//SETTING MQTT
const brokerUrl = 'ws://broker.emqx.io:8083/mqtt';
const topicRelay = "STMIK/ALFATH/78762181/relay";
const topicSensor = "STMIK/ALFATH/78762181/sensor";

var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom);
var option;
option = {
    tooltip: {
        formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
        {
            name: 'Pressure',
            type: 'gauge',
            progress: {
                show: true,
                // Pengkustomisasi warna area bagian dalam yang terisi
                itemStyle: {
                    color: '#CD0069' // Warna area bagian dalam yang terisi
                }
            },
            detail: {
                valueAnimation: true,
                formatter: '{value}'
            },
            data: [
                {
                    value: 0,
                    name: 'Persen',
                    pointer: {
                        itemStyle: {
                            color: '#CD0069' // Warna jarum menjadi merah
                        }
                    }
                }
            ]
        }
    ]
};
myChart.setOption(option);

var lineChart1 = echarts.init(document.getElementById('line-chart1'));
var lineOption1 = {
    xAxis: {
        type: 'category',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Semua data menjadi 0
    },
    yAxis: {
        type: 'value'
    },
    series: [{
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Semua data menjadi 0
        type: 'line',
        lineStyle: {
            color: '#CD0069' // Warna garis
        },
        symbol: 'circle', // Bentuk titik
        symbolSize: 8, // Ukuran titik
        itemStyle: {
            color: '#CD0069' // Warna titik
        },
        label: {
            show: true, // Menampilkan label nomor
            position: 'top', // Posisi label di atas titik
            color: '#CD0069', // Warna label
            fontSize: 12, // Ukuran font label
            formatter: function (params) {
                return params.value; // Menggunakan nilai data sebagai label
            }
        }
    }]
};
lineChart1.setOption(lineOption1);


const client = new MQTTClient(brokerUrl);
const options = { qos: 1, retain: true };

client.onConnect = () => {

    document.getElementById('broker').innerHTML = brokerUrl;
    document.getElementById('topic_sensor').innerHTML = topicSensor;
    document.getElementById('topic_relay').innerHTML = topicRelay;
    document.getElementById('client_id').innerHTML = client.clientId;


    client.subscribe(topicSensor);
    client.subscribe(topicRelay);
};

var simpanDataArray = [];
var simpanWaktuArray = [];

client.onMessage = (topic, message) => {
    console.log('Topic:', topic);
    console.log('Message:', message.toString());
    if (topic === topicSensor) {

        //update myChart
        var option = myChart.getOption();
        option.series[0].data[0].value = message.toString();
        myChart.setOption(option);

        var date = new Date();
        var time = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        //update lineChart
        simpanDataArray.push(message.toString());
        if (simpanDataArray.length > 40) {
            simpanDataArray.shift();
        }

        lineChart1.setOption({
            series: [{
                data: simpanDataArray
            }]
        });

        simpanWaktuArray.push(time);
        if (simpanWaktuArray.length > 40) {
            simpanWaktuArray.shift();
        }

        lineChart1.setOption({
            xAxis: {
                data: simpanWaktuArray
            }
        });

    }
    if (topic === topicRelay) {
        if (message.toString() === "ON") {
            document.getElementById('relay').style.color = "green";
        } else {
            document.getElementById('relay').style.color = "red";
        }
        document.getElementById('relay').innerHTML = message.toString();
    }
};

function publish_led(message) {
    client.publish(topicRelay, message, options);
}

client.connect();

