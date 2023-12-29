## 元素拖拽辅助线开发规划设计
  ### 一、周边元素辅助线
  #### 1、{ T: y1, B: y2, L: x1, R: x2 } 来表示四条边界线 
  #### 2、如何计算元素四个点坐标数据 [[x1, y1], [x1, y2], [x2, y2], [x2, y1]]
  #### 3、一个元素坐标 [x, y, w, h, r] => 平移的四个点[[x, y], [x, y+h], [x+w, y+h], [x+w, y]] => 根据旋转角度r的到旋转后的四个点坐标构成一个新的矩形边界线，根据这个新的矩形来判断吸附
  ### 二、面板辅助线

  ```js
    // 使用Map来全局的存储记录每个元素的边界线值
    // 一个数组来存储需要绘制的辅助参考线
    const map = new Map()
    const lines = []
    // 计算每个元素的边界线坐标
    const getBoundary = (element) => {
      const { x, y, width, height, rotate, id } = element
      // 旋转前的四个点坐标
      let points = [
        [x, y],
        [x, y + height],
        [x + width, y + height],
        [x + width, y]
      ];
      if (rotate > 0) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        // 计算旋转后的四个点坐标
        const rotatePoints = [];
        points.forEach(([x, y]) => {
          const rotatePoint = rotate(x, y, centerX, centerY, rotate);
          rotatePoints.push(rotatePoint);
        });
        points = rotatePoints;
      }
      
      // 通过四个点坐标计算辅助边界线
      // 最大最小的x坐标及最大最小的y坐标
      const minX = Math.min(...points.map(([x]) => x));
      const maxX = Math.max(...points.map(([x]) => x));
      const minY = Math.min(...points.map(([y]) => y));
      const maxY = Math.max(...points.map(([y]) => y));

      // 计算辅助线
      const line = {
        T: minY,
        B: maxY,
        L: minX,
        R: maxX
      };
      return line;
    }

    const rotate = (x1, y1, x2, y2, angle) => {
        // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
        // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
        // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
        return [
            (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
            (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2
        ];
    }
  ```
