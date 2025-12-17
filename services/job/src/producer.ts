import { Kafka , type Admin, type Producer } from "kafkajs";

let Producer:Producer;
let admin:Admin;

export const connectKafka = async()=>{
    try {
        const kafka = new Kafka({
            clientId:"auth-service",
            brokers:[process.env.KAFKA_BROKER || "localhost:9092"],

        });
        admin = kafka.admin();
        await admin.connect();
        const topics =await admin.listTopics();

        if(!topics.includes("send-mail"))
        {
            await admin.createTopics({
                topics:[{
                    topic:"send-mail",
                    numPartitions:1,
                    replicationFactor:1,
                }]
            });
            console.log("✅ Topic 'Send-mail' created")
        }

        await admin.disconnect()

        Producer = kafka.producer();
        await Producer.connect();
        console.log("✅ Connected to Kafka Produce")


    } catch (error) {
        console.log(" ❌ Failed to connect to Kafka",error)
    }
};

export const publishToTopic = async(topic:string,message:any)=>{
    if(!Producer)
    {
        console.log("kafka producer is not initialized");
        return;
    }
    try {
        await Producer.send({
            topic:topic,
            messages:[
                {
                    value:JSON.stringify(message),
                },
            ]
        });
          console.log("Message published to topic:", topic);
    } catch (error) {
        console.error("Error publishing to topic:", error);
    }
};

export const disconnectKafka = async()=>{
    if(Producer)
    {
        Producer.disconnect();
    }
}

