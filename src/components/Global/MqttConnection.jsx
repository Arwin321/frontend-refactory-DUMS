// mqttService.js
import mqtt from 'mqtt';

const mqttUrl = `${import.meta.env.VITE_MQTT_SERVER ?? 'ws://localhost:1884'}`;
const topics = [
    'PIU_COD/AIR_DRYER/OVERVIEW',
    'PIU_COD/AIR_DRYER/AIR_DRYER_A',
    'PIU_COD/AIR_DRYER/AIR_DRYER_B',
    'PIU_COD/AIR_DRYER/AIR_DRYER_C',
    'PIU_COD/COMPRESSOR/OVERVIEW',
    'PIU_COD/COMPRESSOR/COMPRESSOR_A',
    'PIU_COD/COMPRESSOR/COMPRESSOR_B',
    'PIU_COD/COMPRESSOR/COMPRESSOR_C',
    'PIU_COD/ERROR_CODE/SIM',
];
const options = {
    keepalive: 30,
    clientId: 'react_mqtt_' + Math.random().toString(16).substr(2, 8),
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    username: `${import.meta.env.VITE_MQTT_USERNAME ?? ''}`, // jika ada
    password: `${import.meta.env.VITE_MQTT_PASSWORD ?? ''}`, // jika ada
};

const client = mqtt.connect(mqttUrl, options);

// Track connection status
let isConnected = false;

client.on('connect', () => {
    console.log('MQTT Connected');
    isConnected = true;

    // Subscribe default topic
    client.subscribe(topics, (err) => {
        if (err) console.error('Subscribe error:', err);
        else console.log(`Subscribed to topics: ${topics.join(', ')}`);
    });
});

client.on('error', (err) => {
    console.error('Connection error: ', err);
    client.end();
});

client.on('close', () => {
    console.log('MQTT Disconnected');
    isConnected = false;
});

/**
 * Publish message to MQTT
 * @param {string} topic
 * @param {string} message
 */
const publishMessage = (topic, message) => {
    if (client && isConnected && message.trim() !== '') {
        client.publish(topic, message);
    } else {
        console.warn('MQTT not connected or message empty');
    }
};

/**
 * Listen to incoming messages
 * @param {function} callback - Function(topic, message)
 */
const listenMessage = (callback) => {
    client.on('message', (topic, message) => {
        callback(topic, message.toString());
    });
};

const setValSvg = (listenTopic, svg) => {
    client.on('message', (topic, message) => {
        // console.log(topic ,' = ', listenTopic);
        if (topic === listenTopic) {
            const objChanel = JSON.parse(message);

            Object.entries(objChanel).forEach(([key, value]) => {
                // console.log(key, value);
                const el = svg.getElementById(key);
                if (el) {
                    if (value === true) {
                        el.style.display = ''; // sembunyikan
                    } else if (value === false) {
                        el.style.display = 'none';
                    } else if (!isNaN(value)) {
                        el.textContent = Number(value ?? 0.0).toFixed(2);
                    } else {
                        el.textContent = value;
                    }
                }
            });
        }
    });
};

// === NOTIFICATION LISTENER ===
const notifListeners = [];

const onNotifUpdate = (callback) => {
    notifListeners.push(callback);
};

client.on('message', (topic, message) => {
    if (topic === import.meta.env.VITE_MQTT_TOPIC_COD) {
        try {
            const payload = JSON.parse(message.toString());
            notifListeners.forEach((cb) => cb(payload));
        } catch (err) {
            console.error('Invalid notif payload', err);
        }
    }
});

export { publishMessage, listenMessage, setValSvg, onNotifUpdate };
