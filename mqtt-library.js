class MQTTClient {
    constructor(broker, clientId, topic_will, username, password) {
        this.broker = broker;
        this.clientId = clientId || `iotcloud_${Math.random().toString(16).substr(2, 8)}`;
        this.topic_will = topic_will || `iotcloud/${this.clientId}/status`;
        this.username = username || 'public';
        this.password = password || 'public';
        this.subscribedTopics = new Set();
        this.statusElement = document.getElementById('status');
    }

    setStatusAndColor(status, color) {
        this.statusElement.innerHTML = status;
        this.statusElement.style.color = color;
    }    

    connect() {
        const options = {
            keepalive: 5,
            clientId: this.clientId,
            protocolId: 'MQTT',
            protocolVersion: 4,
            clean: true,
            reconnectPeriod: 1000,
            connectTimeout: 30 * 1000,
            rejectUnauthorized: false,
            username: this.username,
            password: this.password,
            will: {
                topic: this.topic_will,
                payload: 'Connection lost abnormally!',
                qos: 1,
                retain: true
            }
        };

        try {
            this.client = mqtt.connect(this.broker, options);

            this.client.on('connect', () => {
                console.log('Connected to:', this.broker);
                this.setStatusAndColor('CONNECTED', 'green');
                if (this.onConnect) {
                    this.onConnect();
                }
            });

            this.client.on('error', (err) => {
                console.error('Error:', err);
                this.setStatus('Error');
                if (this.onError) {
                    this.onError(err);
                }
            });

            this.client.on('reconnect', () => {
                console.log('Reconnecting...');
                this.setStatusAndColor('RECONNECTING', 'orange');
                if (this.onReconnect) {
                    this.onReconnect();
                }
            });

            this.client.on('disconnect', () => {
                console.log('Disconnected!');
                this.setStatusAndColor('DISCONNECTED', 'red');
                if (this.onDisconnect) {
                    this.onDisconnect();
                }
            });

            this.client.on('message', (topic, message) => {
                if (this.onMessage) {
                    this.onMessage(topic, message);
                }
            });
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    }

    subscribe(topic, callback) {
        if (!this.subscribedTopics.has(topic)) {
            this.client.subscribe(topic, (err) => {
                if (!err) {
                    console.log('Subscribed to:', topic);
                    this.subscribedTopics.add(topic);
                    if (callback) {
                        callback();
                    }
                } else {
                    console.error('Subscription error:', err);
                }
            });
        } else {
            console.log('Already subscribed to:', topic);
            if (callback) {
                callback();
            }
        }
    }

    publish(topic, message, options, callback) {
        try {
            this.client.publish(topic, message, options, (err) => {
                if (!err) {
                    console.log('Published:', message, 'to', topic);
                    if (callback) {
                        callback();
                    }
                } else {
                    console.error('Publish error:', err);
                }
            });
        } catch (error) {
            console.error('Publish error:', error);
        }
    }

    onMessage(topic, callback) {
        this.onMessage = callback;
    }

    disconnect() {
        this.client.end();
        this.subscribedTopics.clear();
    }
}