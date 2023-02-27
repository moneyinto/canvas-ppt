<p align="center">
    <img src="/public/favicon-192x192.png" />
</p>

<p align="center">
    <a href="https://github.com/moneyinto/canvas-ppt/stargazers" target="_black">
        <img src="https://img.shields.io/github/stars/moneyinto/canvas-ppt?logo=github" alt="stars" />
    </a>
    <a href="https://www.github.com/moneyinto/canvas-ppt/network/members" target="_black">
        <img src="https://img.shields.io/github/forks/moneyinto/canvas-ppt?logo=github" alt="forks" />
    </a>
    <a href="https://www.typescriptlang.org" target="_black">
        <img src="https://img.shields.io/badge/language-TypeScript-blue.svg" alt="language">
    </a>
    <a href="https://github.com/moneyinto/canvas-ppt/issues" target="_black">
        <img src="https://img.shields.io/github/issues-closed/moneyinto/canvas-ppt.svg" alt="issue">
    </a>
</p>

# CANVAS-PPT
> 一个基于Vue3.x + Typescript + canvas实现的在线演示文稿。

# 项目运行
```
npm install

npm run dev
```

# 功能列表
### 基础功能
- [x] 历史记录（撤销、重做）
- [x] 右键菜单

### 幻灯片页面编辑
- [x] 页面列表
- [x] 页面新增
- [x] 页面删除
- [x] 页面复制粘贴
- [x] 页面排序
- [x] 画布缩放、移动

### 幻灯片元素编辑
- [x] 元素添加
- [x] 元素删除
- [x] 元素复制粘贴
- [x] 元素拖拽移动
- [x] 元素旋转
- [x] 元素缩放
- [ ] 元素多选（框选、点选）
- [ ] 多元素组合
- [ ] 多元素批量编辑
- [ ] 元素锁定
- [ ] 元素吸附对齐（移动和缩放）
- [x] 元素层级调整
- [x] 元素对齐到画布
- [ ] 元素对齐到其他元素
- [ ] 多元素均匀分布
- [x] 粘贴外部图片
- [ ] 元素坐标、尺寸和旋转角度设置

#### 文字
- [x] [研究canvas文本编辑器](https://github.com/moneyinto/canvas-editor)
- [x] 字体设置
- [x] 字体大小设置
- [x] 字体颜色设置
- [x] 字体粗体设置
- [x] 字体斜体设置
- [x] 字体下划线设置
- [x] 字体删除线设置
- [x] 文本选中
- [x] 光标移动
- [x] 文本输入
- [x] 回车换行
- [x] 文本单个删除
- [x] 删除选中文本
- [x] 复制、剪切、粘贴文本
- [x] 粘贴外来文本（不带格式）
- [ ] 粘贴外来文本（带格式）
- [x] 文本设置行高
- [x] 文本左对齐、居中、右对齐
- [x] 填充色
- [x] 边框

#### 图片
- [x] 粘贴外来图片
- [ ] 裁剪
- [ ] 边框
- [ ] 阴影

#### 形状
- [x] 填充色
- [x] 边框
- [ ] 阴影
- [x] 透明度
- [x] 翻转
- [ ] 编辑文字

#### 图表

#### 表格

#### 视频

#### 音频

#### 公式

### 幻灯片放映

### 思考待解决问题
- 不规则形状如何判断点在形状内（目前选中元素都是以矩形区域判断，当两个形状重叠时，看到是选的A元素，确展示的是选中的B元素）
- 形状后面要考虑增加点位控制可调整的功能
- 翻转后且存在旋转，鼠标拖拽的距离和实际变化的宽高存在误差，待解决
- 渲染canvas和控制canvas，原先设想降低渲染操作对性能的损耗，渲染canvas只做渲染工作，操作元素全在控制canvas，但是控制层在渲染层之上，导致被选中操作的元素会在最高层，遮挡其他元素，但是根据层级选中的元素可能是最底层级的，目前优化方案改为，操作绘线，绘制新增元素效果依旧在控制层，其余元素变动转移到渲染层，但是频繁的渲染，加上渲染层元素很多时，会成倍增加性能的消耗

***参考`石墨文档`ppt样式，使用canvas学习实现ppt功能***
