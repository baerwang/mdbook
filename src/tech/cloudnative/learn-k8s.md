# learn k8s

## k8s Store的类型

- cache: 实现Store，利用threadSafeMap存放数据
- UndeltaStore: 实现Store，利用cache存放数据，数据变更时通过PushFunc发送当前完整状态
- FIFO: 实现Queue（包含Store），利用自己内部的items数据结构存放数据
- DeltaFIFO
    - 处理每个对象的变化最多一次
    - 处理一个对象时，希望知道这个对象与你上次处理时，发生了哪些变化
    - 希望一个对象删除时，仍然能够处理它
    - 能够周期性重新处理所有的对象
- Heap: 实现Store，利用data数据结构存放数据，实现堆数据结构，用于优先队列
- ExpirationCache: 实现Store，利用threadSafeMap存放数据

## k8s crd

在k8s系统扩展中，开发者可以通过CRD（CustomResourceDefinition）来扩展k8s API，其功能主要由APIExtensionServe负责。
使用CRD扩展资源分为三步：

- *注册自定义资源*：开发者需要通过k8s提供的方式注册自定义资源，即通过CRd进行注册，注册之后，k8s就知道我们自定义资源的存在了，然后我们就可以像使用k8s内置资源一样使用自定义资源（CR）
- *使用自定义资源*：像内置资源比如Pod一样声明资源，使用CR声明我们的资源
- *删除最定义资源*：当我们不再需要时，可以删除自定义资源

### 如何操作自定义资源

*client-go*为每种k8s内置资源提供对应的*clientset*和*informer*。有两种方式可以来处理

- 使用client-go提供的*dynamicClient*来操作自定义资源对象，当然由于*dynamicClient*是基于RESTClient实现的，我们也可以使用RESTClient来达到同样的目的。
- 使用[code-generator](https://github.com/kubernetes/code-generator)来帮助我们生成需要的代码，就可以像使用client-go为k8s内置资源对象提供的方式监听和操作自定义资源。

### Finalizers

Finalizers 能够让控制器实现异步的删除前（Pre-delete）回调。与内置对象类似，定制对象也支持 Finalizers

## code-generator

```shell
git clone https://github.com/kubernetes/code-generator
go install cmd/{client-gen,xxx}
```

### 编写代码

拷贝这些目录的[相关代码](https://github.com/kubernetes/sample-controller/tree/master/pkg/apis/samplecontroller/v1alpha1)

```shell
./generate-groups.sh all github.com/operator-crd/pkg/generated github.com/operator-crd/pkg/apis crd/example.com:v1 --go-header-file=hack/boilerplate.go.txt --output-base ../../
```
