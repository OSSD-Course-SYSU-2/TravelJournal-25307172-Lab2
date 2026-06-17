/**
 * PointInPolygon.ets - 椭圆碰撞检测算法
 * 用于判断点击坐标是否落在某个省份的椭圆区域内
 * 坐标系：平板 0-1600(x) × 0-1000(y)，手机 0-800(x) × 0-1200(y)
 */

/**
 * 判断点 (px, py) 是否在椭圆内部
 * 椭圆方程: ((x - cx) / rx)^2 + ((y - cy) / ry)^2 <= 1
 *
 * @param px 点的 x 坐标（逻辑坐标系）
 * @param py 点的 y 坐标（逻辑坐标系）
 * @param cx 椭圆中心 x
 * @param cy 椭圆中心 y
 * @param rx 椭圆水平半径
 * @param ry 椭圆垂直半径
 * @returns true 表示点在椭圆内部，false 表示在外部
 */
export function pointInEllipse(px: number, py: number, cx: number, cy: number, rx: number, ry: number): boolean {
  if (rx <= 0 || ry <= 0) {
    return false;
  }
  const dx = (px - cx) / rx;
  const dy = (py - cy) / ry;
  return (dx * dx + dy * dy) <= 1;
}
