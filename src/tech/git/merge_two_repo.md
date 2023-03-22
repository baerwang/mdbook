# 协作合并多仓库

## 准备两个repo（w1，w2）

```shell
git clone github.com/baerwang/w1.git && cd w1
```

```shell
git remote add dev github.com/baerwang/w2.git       # 添加远程 w2 repo
git fetch dev                                       # 拉取远程 w2 repo
```

```shell
git checkout -b dev dev/main                        # 新建分支指定 w2 main分支
git checkout main                                   # 切换 w1 主分支
```

```shell
git branch -vv                                      # 查看当前的分支和最新的commit log
```