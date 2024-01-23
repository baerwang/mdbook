# 多租户权限管理设计

> 使用ES来存储来设计多租户权限管理，领域对象有租户、团队、项目、人员、角色（租户管理员、团队管理员、普通成员）、菜单、权限。
> 
> 索引可以加上ID字段用来保存到数据库用来当作维护，先保存到DB，再去保存到ES上
> 如果ES挂了可以用DB将ES操作restore/reindex，多个持久化的方式，当然不用DB也可以，数据不是特别重要的话
> 
> 多租户一般场景都是查询大于删除和修改，可以用基于左右值编码（前提是要用DB的，ES不合适嵌套方式去做）
> 
> 下面索引是根据[DB的表结构](#DB)来设计的
> 菜单，角色，权限需要设置个表来作为全局字典，给前端渲染使用
> [users-relation](#人员和角色,菜单，权限关联-%28/users_relation%29) 这里索引设计的是考虑前端渲染的问题，后面接口授权需要加redis来配合使用

# ES

> 设计索引，本篇文档忽略掉settings，后面再规划根据场景来设置settings的相关字段

## 租户 (/tenants)

```json
{
  "mappings":{
    "doc":{
      "properties":{
        "id":{
          "type":"long"
        },
        "name":{
          "ignore_above":100,
          "type":"text"
        },
        "create_time":{
          "type":"date"
        }
      }
    }
  }
}
```

## 团队 (/teams)

```json
{
  "mappings":{
    "doc":{
      "properties":{
        "id":{
          "type":"long"
        },
        "tenants_id":{
          "type":"long"
        },
        "name":{
          "ignore_above":100,
          "type":"text"
        },
        "create_time":{
          "type":"date"
        },
        "update_time":{
          "type":"date"
        }
      }
    }
  }
}
```

## 项目 (/projects)

```json
{
  "mappings":{
    "doc":{
      "properties":{
        "id":{
          "type":"long"
        },
        "tenants_id":{
          "type":"long"
        },
        "name":{
          "ignore_above":100,
          "type":"text"
        },
        "create_time":{
          "type":"date"
        },
        "update_time":{
          "type":"date"
        }
      }
    }
  }
}
```

## 人员 (/users)

```json
{
  "mappings":{
    "doc":{
      "properties":{
        "id":{
          "type":"long"
        },
        "tenants_id":{
          "type":"long"
        },
        "username":{
          "ignore_above":100,
          "type":"text"
        },
        "password":{
          "ignore_above":20,
          "type":"keyword"
        },
        "create_time":{
          "type":"date"
        },
        "update_time":{
          "type":"date"
        }
      }
    }
  }
}
```

## 角色 (/role)

```json
{
  "mappings":{
    "doc":{
      "properties":{
        "id":{
          "type":"long"
        },
        "tenants_id":{
          "type":"long"
        },
        "name":{
          "ignore_above":100,
          "type":"text"
        },
        "role_type":{
          "type":"byte"
        },
        "create_time":{
          "type":"date"
        },
        "update_time":{
          "type":"date"
        }
      }
    }
  }
}
```

## 菜单 /menu

```json
{
  "mappings":{
    "doc":{
      "properties":{
        "id":{
          "type":"long"
        },
        "pid":{
          "type":"long"
        },
        "tenants_id":{
          "type":"long"
        },
        "name":{
          "ignore_above":100,
          "type":"text"
        },
        "display_order":{
          "type":"byte"
        },
        "create_time":{
          "type":"date"
        },
        "update_time":{
          "type":"date"
        }
      }
    }
  }
}
```

## 人员和角色,菜单，权限关联 (/users_relation)

```json
{
  "mappings":{
    "doc":{
      "properties":{
        "user_id":{
          "type":"long"
        },
        "role_id":{
          "type":"long"
        },
        "role_name":{
          "type":"text"
        },
        "menus":{
          "type":"object",
          "properties":{
            "id":{
              "type":"long"
            },
            "name":{
              "type":"text"
            }
          }
        },
        "permissions":{
          "type":"array"
        },
        "create_time":{
          "type":"date"
        },
        "update_time":{
          "type":"date"
        }
      }
    }
  }
}
```

# DB

## 租户 (tenants)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| name | 租户名称 | varchar(100) |NOT NULL| - |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 团队 (teams)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| tenant_id | 租户ID | bigint |NOT NULL| - |
| name | 团队名称 | varchar(100) |NOT NULL| - |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 项目 (projects)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| tenant_id | 租户ID | bigint |NOT NULL| - |
| teams_id | 团队ID | bigint |NOT NULL| - |
| name | 项目名称 | varchar(100) |NOT NULL| - |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 人员 (users)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| tenant_id | 租户ID | bigint |NOT NULL| - |
| username | 用户名称 | varchar(100) |NOT NULL| - |
| password | 密码 | varchar(20) |NOT NULL| 存储解密使用Argon2 `golang.org/x/crypto/argon2` |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 菜单 (menu) 

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| tenant_id | 租户ID | bigint |NOT NULL| - |
| pid | 父菜单ID | bigint |  NOT NULL| - |
| name | 菜单名称 | varchar(100) | NOT NULL| - |
| display_order | 显示顺序 | int |  NOT NULL| |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 角色 (role)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| tenant_id | 租户ID | bigint |NOT NULL| - |
| name | 角色名称 | varchar(100) | NOT NULL| - |
| type | 角色类型 | int | NOT NULL| 1:超级管理员 2:租户管理员 3:团队管理员 4:普通成员 |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 权限 (permissions)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| tenant_id | 租户ID | bigint |NOT NULL| - |
| name | 权限名称 | varchar(100) |NOT NULL| - |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 人员和角色关联 (user_role)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| user_id | 用户ID | bigint |NOT NULL| - |
| role_id | 角色ID | bigint | NOT NULL| - |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 角色和权限 (role_permissions)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| role_id | 角色ID | bigint |NOT NULL| - |
| permission_id | 权限ID | bigint |NOT NULL| - |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |

## 菜单和权限 (menu_permissions)

| 字段 | 名称 | 类型 | 约束 |备注|
| -- | -- | -- | -- | -- |
| id | id | bigint | PRIMARY KEY,NOT NULL |雪花ID |
| menu_id | 菜单ID | bigint |NOT NULL| - |
| permission_id | 权限ID| bigint |NOT NULL| - |
| create_time | 创建时间 | timestamp|NOT NULL | - |
| update_time | 更新时间 | timestamp|NOT NULL | - |
