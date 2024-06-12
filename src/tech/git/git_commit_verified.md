# Git提交添加签名认证

## 安装gpg

```shell
brew install -v gpg
```

## 生成GPG key

> git上的用户名和邮箱都要和生成的gpg一致

```shell
gpg --full-generate-key
```

## 查看GPG key

```shell
gpg --list-secret-keys --keyid-format=long
```

## 获取GPG 公钥

```shell
gpg --armor --export xxx
```

## 给Git配置GPG key

```shell
git config user.signingkey xxx
git config commit.gpgsign true
```

## 修改当前commit信息

```shell
git commit --amend '-S' 
```

> 如果提交失败，信息为
> 
> error: gpg failed to sign the data
> 
> fatal: failed to write commit object
> 
> 需要先下设置环境变量

```shell
export GPG_TTY=$(tty)
```