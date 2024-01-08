## K8s 组件整理

### 控制平面组件

#### APIServer

集群管理API入口

#### ETCD

k8s存储，用于服务发现，各种资源对象信息(可以理解为DB)

#### Controller-Manager

	Replication Controller 保证deployments副本。
	Node Controller 监控etcd存储节点各类信息。
	ResourceQuota Controller 期望的资源信息通过API Server写入到ETCD中，系统请求资源会读这些信息，否则创建失败
	Namespace Controller 创建namespace来进行资源隔离。
	Endpoint Controller 负责生成和维护所有的Endpoint对象的控制器，创建新的Service时候，会生成对应的Endpoint
	ServiceAccount Controller 为新的namespace创建默认的服务账号

#### Scheduler

k8s的调度器，Schedule监听APIServer，创建Pod，该组件负责Pod如那个Node节点绑定，写入ETCD `调度器分两个阶段`

> predicate 策略 （过滤不符合条件的节点）

    PodFitsPorts：同P odFitsHostPorts。
    PodFitsHostPorts：检查是否有 Host Ports 冲突。
    PodFitsResources：检查 Node 的资源是否充足，包括允许的Pod数量、CPU、内存、GPU个数以及其他的OpaqueIntResources。
    HostName：检查 pod.Spec.NodeName 是否与候选节点一致。
    MatchNodeSelector：检查候选节点的 pod.Spec.NodeSelector 是否匹配。
    NoVolumeZoneConflict：检查 volume zone 是否冲突。
    MatchInterPodAffinity：检查是否匹配 Pod 的亲和性要求。
    NoDiskConflict：检查是否存在 Volume 冲突，仅限于 GCE PD、AWS EBS、Ceph RBD以及 iSCSI。
    PodToleratesNodeTaints：检查 Pod 是否容忍 Node Taints。
    CheckNodeMemoryPressure：检查 Pod 是否可以调度到 MemoryPressure 的节点上。
    CheckNodeDiskPressure：检查 Pod 是否可以调度到 DiskPressure 的节点上。
    NoVolumeNodeConflict：检查节点是否满足 Pod 所引用的 Volume 的条件。

> priority 策略 （先级排序，选中优先级最高的节点）

    SelectorSpreadPriority：优先减少节点上属于同一个 Service 或 Replication Controller 的 Pod 数量。
    	- 尽量将同一个 rc 下的多个副本分散到不同节点，增加可用性
    InterPodAffinityPriority：优先将Pod调度到相同的拓扑上(如同一个节点、Rack、Zone等)。
    LeastRequestedPriority：优先调度到请求资源少的节点上。
    BalancedResourceAllocation：优先平衡各节点的资源使用。
    NodePreferAvoidPodsPriority：alpha.kubernetes.io/preferAvoidPods字段判断，权重为10000，避免其他优先级策略的影响
    NodeAffinityPriority：优先调度到匹配NodeAffinity的节点上。
    TaintTolerationPriority：优先调度到匹配TaintToleration的节点上。
    ServiceSpreadingPriority：尽量将同一个service的Pod分布到不同节点上，已经被SelectorSpreadPriority替代( 默认未使用)。
    EqualPriority：将所有节点的优先级设置为1 (默认未使用)。
    ImageLocalityPriority：尽量将使用大镜像的容器调度到已经下拉了该镜像的节点上(默认未使用)。
    MostRequestedPriority：尽量调度到已经使用过的Node.上，特别适用于cluster-autoscaler (默认未使用)。

### Node组件

#### Kube-Proxy

负责接受转发请求，核心要点将Service的访问请求转发到后台的具体某个Pod

#### Kubectl

是k8s集群上的每个节点，用来保证容器运行在Pod中，kubectl接收一组通过各类提供给它的PodSpecs，确保这些PodSpecs中描述的容器运行状态并健康，当scheduler确定在某个node上运行pod，会将pod的具体配置信息（images，volume等）发送给改节点的kubectl，kubectl根据这个信息去创建和运行容器，将master上报运行状态。
