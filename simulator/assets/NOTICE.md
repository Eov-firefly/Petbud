# 素材来源与使用边界

2026-11-04。社区形象由用户指定的 Codex Pets 公共下载来源取得，保持原始 WebP，无重绘或裁剪文件改写；运行时按帧显示。原作者及素材权利不因本仓库公开而转移。本次仅用于 Petbud 交互原型评估，不声称获得量产、商业销售或品牌授权。

| 本地文件 | 原作品 | 作者/发布者 | 来源 |
|---|---|---|---|
| pets/dog-sheet.webp、dog-poster.webp | Monty / monty-boy | xor | https://codex-pets.net/pets/monty-boy |
| pets/cat-sheet.webp、cat-poster.webp | Lihua Cat / lihua-cat | ooooo | https://codex-pets.net/pets/lihua-cat |
| pets/turtle-sheet.webp、turtle-poster.webp | Torti / torti | aropan | https://codex-pets.net/pets/torti |

确切原文件URL、上传版本与发布者见同目录的 `.source.json`。Codex Pets 的平台源码MIT许可证不自动覆盖每位用户上传的宠物图像。平台[条款](https://codex-pets.net/terms)说明公共内容的展示、下载与游乐场使用，但没有提供这些具体形象的独立商用许可；商业化前需确认作者授权或替换成自有正式资产。可在此原型本机替换为自有同规格图集。

HachimoDock素材未复制，其当前许可证对独立产品复用另有书面授权要求。

## 录制动物声音

- `audio/dog-bark.ogg`：Broadbeer，George（拉布拉多）叫声，约1996，公有领域。来源：https://commons.wikimedia.org/wiki/File:George_vuf_1996.ogg 。原文件未改写，播放时按行为调整音量、速度及次数。
- `audio/dog-happy.ogg`：Amada44，Barking of a dog，2011，CC BY-SA 3.0。来源：https://commons.wikimedia.org/wiki/File:Barking_of_a_dog.ogg 。许可：https://creativecommons.org/licenses/by-sa/3.0/ 。原OGG文件未修改，不表示作者背书本产品；如后续分发改编录音，须依该许可履行义务。
- `audio/cat-meow.ogg`：Maullido de gata hembra joven，2012，CC0 1.0。来源：https://commons.wikimedia.org/wiki/File:Maullido_de_gata_hembra_joven.ogg 。许可：https://creativecommons.org/publicdomain/zero/1.0/ 。原OGG文件未修改。

呼噜、进食、脚步、清理等短音为本项目程序合成。乌龟采用低音量动作反馈，不播放猫狗叫声，也不将其描述为真实龟叫录音。社区图集本身不含音轨，叫声由Petbud行为事件独立关联，非逐帧口型同步。

## Alpha 0.3 幼猫音效替换

当前代码不再加载 `cat-meow.ogg` 的成年猫录音。新增：

- `audio/kitten-call.ogg`：SFXMint，Kitten High-Pitched Cat Meowing 50，https://sfxmint.com/sounds/animal-cat-meow-50 。
- `audio/kitten-soft.ogg`：SFXMint，Kitten High-Pitched Cat Meowing 71，https://sfxmint.com/sounds/animal-cat-meow-71 。

来源标明为AI生成幼猫风格音效，CC0 1.0，非真实小猫现场录音。本项目做了去除开头静音、截短、淡入淡出与转OGG；播放保持原速，不通过升调伪装幼猫。许可：https://creativecommons.org/publicdomain/zero/1.0/ 。原文件下载地址分别为 `https://sfxmint.com/dl/animal-cat-meow-50.mp3` 和 `https://sfxmint.com/dl/animal-cat-meow-71.mp3`。

再次核查HachimoDock许可证：第3条对独立于该项目的软件/硬件产品复用另有书面授权要求，不因非商业原型而自动解除。因此Alpha 0.3仍未复制其默认小狗素材，只参考其连续动作表现。
