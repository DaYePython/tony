# 键盘序列监听器

一个轻量级的 TypeScript 库，用于检测键盘输入序列（如科乐美秘籍：↑↑↓↓←→←→BA）。

[English](./README.md) | 简体中文

## 特性

✨ **简单的 API** - 易于使用，完整的 TypeScript 支持  
🎯 **进度追踪** - 每个按键匹配时都会回调  
⏱️ **超时支持** - 为序列完成设置时间限制  
🔄 **灵活控制** - 启动、停止、重置和销毁监听器  
🎮 **预定义序列** - 包含科乐美秘籍等  
📦 **轻量级** - 零依赖，压缩后小于 2KB

## 安装

```bash
npm install @daye-cli/keyboard-sequence-listener
# 或
pnpm add @daye-cli/keyboard-sequence-listener
# 或
yarn add @daye-cli/keyboard-sequence-listener
```

## 使用方法

### 基础示例

```typescript
import { KeySequenceListener, KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener';

// 监听科乐美秘籍
const listener = new KeySequenceListener({
  sequence: KONAMI_CODE,
  onMatch: () => {
    console.log('科乐美秘籍激活！🎮');
  },
});

listener.start();

// 需要时停止监听
listener.stop();
```

### 自定义序列与进度追踪

```typescript
import { KeySequenceListener } from '@daye-cli/keyboard-sequence-listener';

const listener = new KeySequenceListener({
  sequence: ['KeyH', 'KeyE', 'KeyL', 'KeyL', 'KeyO'],
  onMatch: () => {
    console.log('你输入了 "HELLO"！');
  },
  onProgress: (currentIndex, totalLength) => {
    console.log(`进度：${currentIndex}/${totalLength}`);
  },
  onMismatch: () => {
    console.log('按错键了！');
  },
  onTimeout: () => {
    console.log('序列超时 - 太慢了！');
  },
  timeout: 3000, // 3秒内完成序列
});

listener.start();
```

### 一次性模式（仅监听一次）

```typescript
import { KeySequenceListener } from '@daye-cli/keyboard-sequence-listener';

// 这个监听器在首次匹配后会自动停止
const listener = new KeySequenceListener({
  sequence: ['Digit1', 'Digit2', 'Digit3'],
  onMatch: () => {
    alert('序列匹配成功！监听器已停止。');
  },
  once: true, // 首次匹配后自动停止
});

listener.start();

// 要重新启动，只需再次调用 start()
listener.start();
```

### Vue 3 示例

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { KeySequenceListener, KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener';

const progress = ref(0);
const message = ref('');
let listener: KeySequenceListener;

onMounted(() => {
  listener = new KeySequenceListener({
    sequence: KONAMI_CODE,
    onMatch: () => {
      message.value = '🎮 科乐美秘籍激活！';
    },
    onProgress: (currentIndex, totalLength) => {
      progress.value = (currentIndex / totalLength) * 100;
    },
    onMismatch: () => {
      progress.value = 0;
      message.value = '❌ 按错键了！';
    },
  });
  
  listener.start();
});

onUnmounted(() => {
  listener?.destroy();
});
</script>

<template>
  <div>
    <div class="progress-bar" :style="{ width: progress + '%' }"></div>
    <p>{{ message }}</p>
  </div>
</template>
```

## API

### `KeySequenceListener`

#### 构造函数选项

```typescript
interface KeySequenceListenerOptions {
  sequence: string[];           // 按键代码数组（例如：['ArrowUp', 'KeyA']）
  onMatch: () => void;          // 序列完成时调用
  onProgress?: (currentIndex: number, totalLength: number) => void; // 每次按键正确时调用
  onMismatch?: () => void;      // 按错键时调用
  onTimeout?: () => void;       // 序列超时时调用
  timeout?: number;             // 时间窗口，单位毫秒（默认：5000）
  once?: boolean;               // 首次匹配后自动停止（默认：false）
}
```

**关键参数：**

- `sequence` - 键盘事件代码数组（使用 `event.code` 格式，如 `'KeyA'`、`'ArrowUp'`、`'Digit1'`）
- `onMatch` - 必需的回调函数，当完整序列匹配时触发
- `onProgress` - 可选的回调函数，每次成功按键时触发（适用于进度条）
  - `currentIndex` - 序列中的当前位置（从 1 开始）
  - `totalLength` - 序列的总长度
- `onMismatch` - 可选的回调函数，当用户按错键时触发（仅在序列开始后）
- `onTimeout` - 可选的回调函数，当按键间隔时间过长时触发
- `timeout` - 序列自动重置前的毫秒数（默认：5000ms）
- `once` - 如果为 true，监听器在首次匹配后自动停止

#### 方法

- `start()` - 开始监听键盘事件
- `stop()` - 停止监听（保留进度）
- `reset()` - 重置进度到开始位置
- `destroy()` - 清理并移除所有事件监听器

### 预定义序列

```typescript
import { KONAMI_CODE } from '@daye-cli/keyboard-sequence-listener';

// KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
//                'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
//                'KeyB', 'KeyA']
```

**可用常量：**

- `KONAMI_CODE` - 经典的 ↑↑↓↓←→←→BA 序列

## 按键代码参考

使用 `event.code` 格式表示键盘按键：

| 按键类型 | 示例代码 |
|---------|---------|
| 字母 | `KeyA`, `KeyB`, ... `KeyZ` |
| 数字 | `Digit0`, `Digit1`, ... `Digit9` |
| 方向键 | `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` |
| 特殊键 | `Enter`, `Space`, `Escape`, `Tab` |

查看完整参考：[MDN KeyboardEvent.code](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/code)

## 浏览器支持

适用于支持以下特性的所有现代浏览器：
- `KeyboardEvent.code`（Chrome 48+、Firefox 38+、Safari 10.1+）
- ES2015+（或使用转译）

## 贡献

欢迎提交问题和拉取请求！访问 [GitHub 仓库](https://github.com/DaYePython/tony)。

## 许可证

MIT
