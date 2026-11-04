# 可解析设计样例

这些JSON是接口讨论与后续建模的起点，**不是完整JSON Schema、生产配置、加密测试向量或可运行系统**。

- [生命配置](life-config.example.json)：时间单位、阶段、候选风险预算、物种差异、影子模式。
- [宠物状态](pet-state.example.json)：存档字段、PRNG流位置、writer epoch。
- [事件](event.example.json)：序列、命令去重、版本和原因码。
- [BLE逻辑消息](ble-message.example.json)：连接后消息调试视图；线上需CBOR封装及认证。
- [赠礼](transfer.example.json)：状态机及终态限制。

后续实现先生成严格类型和Schema，校验必填、枚举、范围、未知字段策略及版本迁移；配置缺少疾病/生理常量时拒绝作为正式运行包加载。不要复制示例ID、hash或PRNG状态用于生产。
