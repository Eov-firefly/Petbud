# BLE、近场社交与事务协议 v0.1

这是逻辑协议草案，UUID 为项目自定义值，正式冻结前在两台设备上验证MTU、角色切换和功耗。

## 发现与身份

服务UUID候选 `b6d10001-771e-4c9d-8aa4-504554425544`；control=...0002、events=...0003、bulk=...0004（完整UUID实现时生成并锁定）。使用128bit Service UUID广告标识，不冒用未分配的Bluetooth SIG厂商ID。legacy广告空间有限，Service UUID与短服务数据拆到scan response；真实布局经抓包确认，不同时塞昵称/签名/坐标。

广告最多含协议major、能力位、短期随机发现token；不广播永久pet_id、主人账户、位置。token轮换只减少被动关联，不保证不可追踪；已有好友认证走连接后握手。匿名设备也可打招呼，正式交友需已绑定身份或随后完成验证。

RSSI仅作为粗接近证据，滑动中位数+持续窗口+退出迟滞；候选持续3—5秒触发“发现”，30秒内同对象不重复叫。阈值由实测决定，不把RSSI映射成固定米数。多人时限制单次互动对象并公平轮询；设备不能真知道方位，动画看向只是表现。

## 握手和授权

1. 发现，按临时ID排序决定连接发起方；碰撞采用随机退避。
2. 交换HELLO：版本、nonce、能力、临时会话公钥和设备证书。
3. 使用受审计密码库：验证制造商/账户签发证书、签名nonce与完整转录，派生会话密钥；不能自写加密算法。BLE链路配对不能替代应用身份认证。
4. 交友前双端显示同一短验证码/图形，双方实体确认；既有好友用证书与挑战认证。
5. 共享角色摘要仅含公开花色/物种/昵称（昵称可设匿名）；不发送主人生理/定位资料。

nonce、session_id、递增seq防重放。无互联网时验证缓存证书与已知关系，无法确认撤销状态则只允许低风险问候，正式账本交友及赠礼等待在线确认。

## 帧与分片

逻辑消息：`{v,type,message_id,session_id,seq,ack,payload}`，连接后CBOR编码（JSON为调试视图）。头部与payload均参与认证，AEAD计数器不能重用；限制单消息4KiB、单会话队列/重组缓冲有界，实际预算在固件测量后冻结。

不假定MTU=247；先协商，再按 `ATT_MTU-3-应用头部长度` 分片。分片含msg_id/index/count，重组超时丢弃并NACK；CRC只检错，AEAD负责认证。重发沿用业务message_id，接收去重但重新ACK；ACK是收到，不代表赠礼结算。

版本major不兼容只提示升级，minor按capabilities协商；未知type拒绝或安全忽略，不崩溃。

## 社交会话状态机

`DISCOVERED → CONNECTING → AUTHENTICATED → GREETING → CONSENT_PENDING → FRIEND/PLAYING → FINISHED`，任意阶段可超时到CLOSED。用户拒绝不降低宠物健康或奖励。

玩耍会话协商 action_id、参与pet摘要、共享seed、延迟后开始。通过往返估计时钟偏移并交换ready，目标视觉起点差<300ms作为候选验收；无法同步时各自完成招呼，不声称同步成功。每屏渲染本地视图，不流式传帧。

事件由会话发起方产生encounter_id并由双方确认receipt；有两份receipt才称“双方完成”，仅一方完成记录为未确认，不编造朋友回忆。会话中每只宠物仍按自身状态选择动作，跨端协议只同步高层结果。

## 交友与赠礼

交友需两个用户同意，宠物可表现迟疑但不隐式拒绝账户授权。服务端pair_key唯一；重复碰面更新关系，不创建重复朋友。

P1赠礼必须在线结算。无网络可以发送“赠礼邀请”，不扣物、不显示到账；避免离线双花。最小状态机：

```
CREATED -> RESERVED -> COMMITTED
                  -> CANCELLED / EXPIRED
```

发方提交时事务锁定item_instance，验证归属与version，设reserved；收方accept在单一数据库事务内改变owner、写双边账本、commit transfer。客户端断线后按transfer_id查询；同一次accept重复返回同结果。过期任务只能释放reserved，不得撤销committed。提交通知失败由outbox重发，通知不负责扣物。

双方用transfer_id关联记忆；只有COMMITTED才播放“已收到礼物”。重放蓝牙动画不能重发库存。设备本地库存是缓存，恢复后必须先同步才能赠送。

## 手机同步

App配对同样需物理确认和设备证明；BLE control传命令，events发回执，bulk分块传日志/资源。命令有command_id、epoch、expected_seq；App不传“设置健康=1”之类任意赋值。后台连接不可作为唯一保证，设备主动保存待同步队列。

## 需要验证的攻击/故障

伪造广告、重放HELLO、证书过期/撤销、错误AEAD、超长分片、重复帧、乱序、多人连接碰撞、收方确认时断电、commit后通知丢失、旧设备迁移后赠礼。全部必须不造成活宠复制、双花或远程改生命状态。
