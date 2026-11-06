# 猫、龟、睡眠与成长素材

**Alpha 0.6：内置本地程序三维已可用，不需要Runway或任何生成账户。**

猫、龟与可选三维狗具有幼年/少年/成年、睡眠/醒来、进食和距离驱动四足步态，直接从native-pets.js渲染；也可在界面录制真实WebM。它们是风格化三维角色，不是写实生成视频。旧小狗9段连续视频继续作为参考演示。

下列120条清单保留为**可选写实视频制作规划**，状态not_generated只描述这些外部制作视频，不表示内置三维不可用。不要求用户注册生成服务；静态参考图、测试夹具和三维动作也不会虚报为这120条写实视频已完成。

## 已准备

- [分龄角色参考图](age-reference-board.png)：幼年/少年/成年×狗/猫/龟，静态设计稿，不是动画。龟参考为保留识别特征的自然四足方向。
- [制作任务清单](jobs.json)：120个目标视频；狗猫各3阶段×14动作，龟3阶段×12动作（无奔跑）。全部状态为not_generated，属于未来可选制作，不是运行前置条件。
- [步态标定格式](gait-config.example.json)：仅为格式样例，不能宣称旧视频已完成标定。
- 物种和成长阶段严格分发、本地导入和持久保存、睡眠三段调度、距离驱动步态与脚步事件。

现有小狗9段跨阶段参考视频不计为专属分龄视频。未导入自有视频时，猫龟与狗的睡眠/移动使用内置三维；WebGL不可用则回退图集。三维有独立分龄参数，不把成年视频标为幼年。

## 第一批17条

| 角色 | 动作 |
|---|---|
| 成年猫 | idle、eat、sleep_loop、walk_left、walk_right |
| 成年龟 | idle、eat、sleep_loop、walk_left、walk_right |
| 成年狗 | sleep_enter、sleep_loop、sleep_exit、walk_left、walk_right、run_left、run_right |

之后补齐猫龟入睡/醒来、幼年和少年，再扩展其余互动。成长应改变头身比例、体态和毛发/壳纹，不仅改变显示大小。

## 单段验收

1. 同一角色跨动作、跨阶段维持脸、毛色/条纹/壳纹特征，禁止变成另一只。
2. 睡眠确实闭眼静卧，有呼吸，入睡与醒来过程完整。
3. 固定摄像机、光照、尺度，主体完整入镜，无文字、水印、多肢或闪烁。
4. 步态为固定根节点的原地循环，脚底基准稳定；审查支撑足，标定完整周期start/end和stride_px。
5. 循环首尾连贯，视频实际尺寸/时长/源帧率通过ffprobe检查。复制帧或图集插帧不算新细节。
6. 未通过的片段保留needs_revision，不能计入ready。

## 打包与接入

一个物种的一个阶段独立目录，视频命名idle.mp4、eat.mp4、sleep_enter.mp4、sleep_loop.mp4、sleep_exit.mp4、walk_left.mp4等。支持H.264 MP4或透明WebM。

在simulator目录运行：

```bash
python3 tools/build_stage_pack.py --species cat --stage baby --character tabby-01 --input /path/to/reviewed-videos --output /path/to/cat-baby-pack --source 'reviewed original footage' --gait-config /path/to/reviewed-gait.json
```

默认缺动作会停止；`--allow-partial`仅用于明确不完整的审查包。脚本读取真实视频并生成manifest，不生成或伪造动作。

在成长实验室展开“三物种素材制作与导入”，选择输出目录。目录含一个manifest.json及其视频。浏览器检查实际尺寸/时长并保存到本机IndexedDB，刷新后可用。错误导入不会覆盖旧包；隐私模式/清理网站数据可能删除素材，请保留源文件。

阶段预览只选择素材，不改宠物年龄。无本阶段素材时不借用别的物种，也不把成年素材标为幼年。

## 步态同步的边界

距离→相位→视频时间已实现，脚步声跟随距离事件。带gait标定的视频暂停自由播放，由距离seek到周期对应帧。脚底锚点固定构图位置；真实脚底锁定仍取决于片段根节点和标定质量，不能靠代码保证任意素材自然。

`tests/media-library-browser.cjs`使用临时纯色视频验证导入、专门睡眠调度、步态seek、阶段隔离和刷新恢复。这些是测试夹具，不进入产品资源，不证明成片拟真度。
