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
    <a href="https://www.github.com/moneyinto/canvas-ppt/blob/master/LICENSE" target="_black">
        <img src="https://img.shields.io/github/license/moneyinto/canvas-ppt?color=%232DCE89&logo=github" alt="license" />
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

### 幻灯片元素编辑
- [x] 元素添加、删除
- [ ] 元素复制粘贴
- [x] 元素拖拽移动
- [x] 元素旋转
- [x] 元素缩放
- [ ] 元素多选（框选、点选）
- [ ] 多元素组合
- [ ] 多元素批量编辑
- [ ] 元素锁定
- [ ] 元素吸附对齐（移动和缩放）
- [x] 元素层级调整
- [ ] 元素对齐到画布
- [ ] 元素对齐到其他元素
- [ ] 多元素均匀分布
- [ ] 粘贴外部图片
- [ ] 元素坐标、尺寸和旋转角度设置

#### 文字

#### 图片
- [ ] 裁剪
- [ ] 边框
- [ ] 阴影

#### 形状
- [x] 填充色
- [x] 边框
- [ ] 阴影
- [ ] 透明度
- [ ] 翻转
- [ ] 编辑文字

#### 图表

#### 表格

#### 视频

#### 音频

#### 公式

### 幻灯片放映

### 思考待解决问题
- 不规则形状如何判断点在形状内（目前选中元素都是以矩形区域判断，当两个形状重叠时，看到是选的A元素，确展示的是选中的B元素）

***参考`石墨文档`ppt样式，使用canvas学习实现ppt功能***
