# App、云端、语音与记忆

## 技术基线

App建议Flutter，BLE/后台定位通过受控原生桥接；后端TypeScript模块化单体+PostgreSQL，对象存储存资源与导出，队列处理记忆。先不拆微服务，不为单机养成引入持续云连接。具体框架及版本在工程初始化时锁定。

App离线显示最近同步时间；权限按使用时请求：BLE用于配对/附近同步，位置用于可选路线，麦克风用于主动语音。设备可脱离App独立生活；首次联网与账户不是第一次喂食前置条件。

## 页面

宠物页：状态摘要、照顾快捷入口、连接状态；回忆页：事实卡片、日历、导出与删除；朋友页：宠物关系、共同活动，不默认真人资料；设备页：静音/作息/托管/定位/麦克风/备份/升级/迁移；账户页：会员权益、账单恢复、隐私操作。

## 数据模型

| 表 | 主键与关键字段 | 一致性 |
|---|---|---|
| users | user_id、region、consent_version | 账户权威 |
| devices | device_id、public_key、owner_id、firmware | 设备密钥不以明文存用户端配置 |
| pets | pet_id、species、owner_id、writer_epoch、lifecycle | 一个当前权威设备 |
| snapshots | pet_id、epoch、seq、schema、config_hash、blob_hash | 唯一(pet,epoch,seq) |
| pet_events | event_id、pet_id、epoch、seq、type、payload、prev_hash | 去重且顺序验证 |
| memories | memory_id、source_event_ids、text、visibility | 文案可删除，不篡改必要账本 |
| friendships | pair_key、pet_a、pet_b、status、consent_a/b | pair_key按pet_id排序唯一 |
| encounters | encounter_id、pair_key、action、receipt_a/b | 一次事件多个视图 |
| inventory | owner_id、item_instance_id、item_type、version、state | 可转移实例唯一 |
| transfers | transfer_id、sender、recipient、item、status | 事务原子结算 |
| wallet_ledger | entry_id、owner_id、delta、reason、source_id | source_id幂等，不改历史余额 |
| entitlements | user_id、product_id、provider_transaction_id、expires | 支付回执服务端验证 |

昵称为不可信文本，输出转义。所有API按当前用户/绑定设备核验对象权限，不能仅知pet_id就读快照。位置独立存储且不进入宠物公开资料。

## HTTP接口草案

统一 `/v1`、HTTPS、用户Bearer或设备独立凭证；错误 `{code,message,retryable,request_id}`。时间ISO8601 UTC，页面按用户时区展示。POST写操作支持Idempotency-Key；同key不同请求体返回409。分页使用不透明cursor，不整库返回。

| 方法 路径 | 请求重点 | 结果/异常 |
|---|---|---|
| POST /device-pairings | challenge、device_signature、用户确认 | 一次性绑定；冲突409 |
| POST /pets | egg_offer_id、selected_egg、claim_id | 分配pet_id；幂等返回原宠物 |
| POST /pets/{id}/event-batches | epoch、first_seq、events、hash | accepted_through；缺口409含expected_seq |
| PUT /pets/{id}/snapshots/{seq} | schema/config/hash/content | 校验关联事件；过时不覆盖 |
| GET /pets/{id}/recovery | 目标设备证明 | 快照+事件尾，需迁移权限 |
| POST /pets/{id}/migrations | source/target/proof | 提升epoch，撤销旧writer |
| POST /friendships | encounter_id、peer、consent | pending或active；需双方提交 |
| POST /transfers | item_instance_id、recipient、item_version | reserved；不直接增加收方库存 |
| POST /transfers/{id}/accept | 收方确认 | 原子committed；幂等同结果 |
| POST /transfers/{id}/cancel | 发方或过期任务 | committed不可取消 |
| POST /walks | summary、optional_coarse_places | 不接受路线作为生命状态事实 |
| GET /memories | pet_id、cursor | 私有投影 |
| POST /voice-intents | 音频或文本、允许的context | 意图建议；设备校验再执行 |
| GET /devices/{id}/update-manifest | firmware/hardware_rev | 签名清单及兼容说明 |
| POST /entitlements/verify | provider、receipt_token | 服务端核验，不能信客户端会员bool |
| POST /privacy/exports | scope | 异步导出任务 |
| DELETE /account | reauth、confirm | 撤销凭证、按策略删除/匿名化 |

上述为接口约定，不是OpenAPI已完成实现。工程阶段补齐每个DTO、JSON Schema、限流和契约测试。

## 语音实现

本地先反馈，联网再理解。按键开启短录音，VAD结束，超时有界；设备优先输出叫声/气泡。任意昵称离线免按键唤醒单独PoC，不作为基础芯片自带能力；[官方定制文档](https://docs.espressif.com/projects/esp-sr/en/latest/esp32s3/wake_word_engine/ESP_Wake_Words_Customization.html)说明的是模型定制流程，并非现场任意名字学习。

ASR → 结构化intent → 允许列表校验 → 设备命令。模型输出不能执行任意工具、URL或代码；高风险命令（迁移、放归、充值）必须走明确UI，不通过语音自动执行。超时回退本地回应，基础功能不等待云端。

## AI及记忆

LLM输入限于已授权事件摘要、角色设定和有限偏好，输出 `{text,source_event_ids,tone}`；无可引用事件则用中性生活描述，不捏造真实散步、朋友或位置。设备状态“生病”不能被文案改成“健康”。模板回退随时可用。

事实保留与文案生成分离；用户可删除可选回忆，删除后重生成不能重新引用其内容。多人共同回忆中，单方撤回后删除可识别资料，保留匿名且确有必要的交易记录。声纹识别非首版必需，不宣传“记住声音”除非已实现并获明确授权。

原始录音默认任务完成即删、错误排查留存须单独同意并限定时间；精确轨迹默认不上传，粗地点/路线保存由用户选择。必要账本保留范围及期限在上线前按销售地区确定。

## 会员

首版可先不接支付，用测试entitlement验证流程。会员蛋明确物种外观，不概率收费；到期后已领取宠物/外观保留，后续领取和新增内容停止。账号迁移恢复权益，退款/撤销不杀宠、不回收已建立生命；异常支付仅限制未来领取。成本按MAU×语音分钟×ASR费+摘要tokens+存储+流量建模，供应商报价后填数，不虚构成本。
