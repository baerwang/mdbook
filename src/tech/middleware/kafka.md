# kafka使用指南

## 使用SASL认证

[该信息来源](https://learn.lianglianglee.com/%E4%B8%93%E6%A0%8F/Kafka%E6%A0%B8%E5%BF%83%E6%8A%80%E6%9C%AF%E4%B8%8E%E5%AE%9E%E6%88%98/assets/4a52c2eb1ae631697b5ec3d298f7333d.jpg)

| 认证机制             | 版本     | 理由                           |
|------------------|--------|------------------------------|
| SSL              | 0.9    | 适用于一般测试场景                    |
| SASL/GSSAPI      | 0.9    | 适用于本身已经实现的Kerberos认证的场景      |
| SASL/PLAIN       | 0.10.2 | 适用于中小型公司Kafka集群              |
| SASL/SCRAM       | 0.10.2 | 适用于中小型公司Kafka集群，支持认证用户的动态增减  |
| SASL/OAUTHBEARER | 2.0    | 适用于支持OAuth2.0框架的场景           |
| Delegation Token | 1.1    | 适用于Kerberos认证中出现TGT分发性能瓶颈的场景 |

## JASS配置

#### Zookeeper 配置Jaas (名称为jaas/zk-server.jass)

```text
Server {
        org.apache.kafka.common.security.scram.ScramLoginModule required
        username="admin"
        password="admin"
        user_admin="admin";
};
```

* org.apache.kafka.common.security.scram.PlainLoginModule required 是加密机制为PLAIN的处理类
* username、password是zookeeper之间通讯的用户名和密码
* user_admin="admin"的结构是user_[username]=[password]，定义kafka-broker（zookeeper客户端）连接到zookeeper时用的用户名和密码
* 注意jaas配置都要以；结尾

#### Kafka Server 配置Jaas (名称为jaas/kafka-server.jaas)

```text
Client {
        org.apache.kafka.common.security.scram.ScramLoginModule required
        username="admin"
        password="admin";
};

KafkaServer {
        org.apache.kafka.common.security.scram.ScramLoginModule required
        username="admin"
        password="admin"
        user_admin="admin"
        user_alice="alice";
};
```

* Client：用于broker和zookeeper之间的认证，对应zk-server.jass中的【user_admin="admin"】配置
* KafkaServer：集群中，broker之间用节点中的username，password进行通讯
* KafkaServer：kafka客户端（producer,consumer）连接broker时，用该配置下user_[username]=[password]结构配置的账号密码登录

#### Kafka Producer/Consumer 配置Jaas (名称为jaas-conf/consumer.conf)

```text
security.protocol=SASL_PLAINTEXT
sasl.mechanism=SCRAM-SHA-256
sasl.jaas.config=org.apache.kafka.common.security.scram.ScramLoginModule required username="admin" password="admin";
```

## SASL配置

> 如果有重复的参数，在每个配置文件最后一行添加，可以覆盖掉

### zookeeper (config/zookeeper.properties)

```properties
authProvider.1=org.apache.zookeeper.server.auth.SASLAuthenticationProvider
requireClientAuthScheme=sasl
jaasLoginRenew=3600000
```

### kafka server (config/server.properties)

```properties
listeners=SASL_PLAINTEXT://IP:9092
security.inter.broker.protocol=SASL_PLAINTEXT
sasl.enabled.mechanisms=SCRAM-SHA-256
sasl.mechanism.inter.broker.protocol=SCRAM-SHA-256
#authorizer.class.name=kafka.security.auth.SimpleAclAuthorizer
allow.everyone.if.no.acl.found=false
super.users=User:admin
advertised.listeners=SASL_PLAINTEXT://IP:9092
```

## 启动

### zookeeper

```shell
export KAFKA_OPTS=-Djava.security.auth.login.config=jaas/zk-server.jass
./bin/zookeeper-server-start.sh -daemon config/zookeeper.properties
```

### kafka server

```shell
export KAFKA_OPTS=-Djava.security.auth.login.config=jaas/kafka-server.jaa
./bin/kafka-server-start.sh -daemon config/server.properties
```

## 验证

### Producer

```shell
./bin/kafka-console-producer.sh --broker-list ip:9092 --topic Topic_x --producer.config jaas-conf/producer.conf
```

### Consumer

```shell
./bin/kafka-console-consumer.sh --bootstrap-server ip:9092 --topic Topic_x --from-beginning --consumer.config jaas-conf/producer.conf
```

## 将每个主题消息体设置为大小限制

### 如果已创建好主题，修改当前主题的消息体

```shell
./bin/kafka-configs.sh --bootstrap-server x:9092 --entity-type topics --entity-name Topic_x --alter --add-config max.message.bytes=36700160 (单位为bytes，m转换bytes）
```

### 创建主题并设置为消息体大小

```shell
./bin/kafka-topics.sh --bootstrap-server x:9092 --create --topic Topic_x --config max.message.bytes=36700160 (单位为bytes，m转换bytes）
```