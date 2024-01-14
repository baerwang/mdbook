# k8s Client 类型

- RestClient: 最基础的客户端，提供最基本的封装
- Clientset: 是一个Client的集合，在Clientset中包含了所有k8s内置资源的client，通过Clientset便可以很方便操作`Pod`、`Service`等这些资源
- DynamicClient: 动态客户端，可以操作任意k8s的资源，包括CRD定义的资源
- DiscoveryClient: 用于发现k8s提供的资源组、资源版本和资源信息，比如`kubectl api-resources`

## RestClient的使用

- RestClientFor: 为创建RESTClient准备config，比如`编解器`、`限速器`等
- UnversionedRESTClientFor: 与`RestClientFor`类似，只是允许`config.GroupVersion`为空

### 用`RestClientFor`指定namespace获取pods

```go
package main

import (
	"context"
	"fmt"

	v1 "k8s.io/api/core/v1"
	"k8s.io/client-go/kubernetes/scheme"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {

	// config
	config, err := clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
	if err != nil {
		panic(err)
	}
	config.GroupVersion = &v1.SchemeGroupVersion
	config.NegotiatedSerializer = scheme.Codecs
	config.APIPath = "/api"

	// client
	clientFor, err := rest.RESTClientFor(config)
	if err != nil {
		panic(err)
	}

	// get data
	var pods = v1.PodList{}
	if err = clientFor.Get().Namespace("kube-system").Resource("pods").Do(context.Background()).Into(&pods); err != nil {
		panic(err)
	}

	for _, item := range pods.Items {
		fmt.Println(item.Name)
	}
}
```

### Clientset使用

> 通过*rest.Config参数和NewForConfig方法来获取clientset对象，clientset是多个client的集合，每个client可能包含不同版本的方法调用

```go
package main

import (
	"context"
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {
	config, err := clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
	if err != nil {
		panic(err)
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	list, err := clientset.CoreV1().Pods("kube-system").List(context.Background(), metav1.ListOptions{})
	if err != nil {
		panic(err)
	}

	for _, item := range list.Items {
		fmt.Println(item.Name)
	}
}
```

### DynamicClient

```go
package main

import (
	"context"
	"fmt"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {
	config, err := clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
	if err != nil {
		panic(err)
	}

	dynamicClient, err := dynamic.NewForConfig(config)
	if err != nil {
		panic(err)
	}

	resource := schema.GroupVersionResource{Group: "apps", Version: "v1", Resource: "deployments"}
	list, err := dynamicClient.Resource(resource).Namespace("kube-system").List(context.Background(), metav1.ListOptions{})
	if err != nil {
		panic(err)
	}

	for _, item := range list.Items {
		fmt.Println(item.GetName())
	}
}
```

### DiscoveryClient

```go
package main

import (
	"fmt"

	"k8s.io/client-go/discovery"
	"k8s.io/client-go/tools/clientcmd"
)

func main() {
	config, err := clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
	if err != nil {
		panic(err)
	}

	discoveryClient, err := discovery.NewDiscoveryClientForConfig(config)
	if err != nil {
		panic(err)
	}

	resources, err := discoveryClient.ServerPreferredNamespacedResources()
	if err != nil {
		panic(err)
	}

	for _, res := range resources {
		for _, apiResource := range res.APIResources {
			fmt.Println(apiResource.Name)
		}
	}
}
```