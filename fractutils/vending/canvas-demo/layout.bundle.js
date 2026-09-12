"use strict";
var EraserLayout = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // packages/layout/src/index.ts
  var index_exports = {};
  __export(index_exports, {
    LayoutManager: () => LayoutManager,
    anchorFromStored: () => anchorFromStored,
    createEntityOutline: () => createEntityOutline,
    resolveManualLabel: () => resolveManualLabel,
    roundedCornerGeometry: () => roundedCornerGeometry,
    routeCorridorConnectionBatch: () => routeCorridorConnectionBatch,
    straightConnectionEndpoints: () => straightConnectionEndpoints
  });

  // packages/layout/src/rtree/RTree.ts
  var RTree = class {
    constructor(maxEntries = 9) {
      __publicField(this, "maxEntries");
      __publicField(this, "minEntries");
      __publicField(this, "data");
      this.maxEntries = Math.max(4, maxEntries);
      this.minEntries = Math.max(2, Math.ceil(this.maxEntries * 0.4));
      this.data = createNode([]);
    }
    all() {
      const result = [];
      this.visitAll(this.data, (item) => {
        result.push(item);
        return false;
      });
      return result;
    }
    /** Return every item whose bounding box intersects `box`. */
    search(box) {
      return this.searchBounds(box.minX, box.minY, box.maxX, box.maxY);
    }
    /** Return every item intersecting the supplied scalar bounds. */
    searchBounds(minX, minY, maxX, maxY) {
      const result = [];
      this.visitIntersecting(minX, minY, maxX, maxY, (item) => {
        result.push(item);
        return false;
      });
      return result;
    }
    /** Process intersecting items immediately without allocating a result array. */
    forEachIntersecting(box, visitor) {
      this.forEachIntersectingBounds(box.minX, box.minY, box.maxX, box.maxY, visitor);
    }
    /** Process items intersecting the supplied scalar bounds. */
    forEachIntersectingBounds(minX, minY, maxX, maxY, visitor) {
      this.visitIntersecting(minX, minY, maxX, maxY, visitor);
    }
    /** Process items intersecting the vertical segment at `x`. */
    forEachAtX(x, minY, maxY, visitor) {
      this.visitIntersecting(x, minY, x, maxY, visitor);
    }
    /** Process items intersecting the horizontal segment at `y`. */
    forEachAtY(y, minX, maxX, visitor) {
      this.visitIntersecting(minX, y, maxX, y, visitor);
    }
    /** Return as soon as an intersecting item satisfies `predicate`. */
    someIntersecting(box, predicate) {
      return this.someIntersectingBounds(box.minX, box.minY, box.maxX, box.maxY, predicate);
    }
    /** Return as soon as an item within the supplied scalar bounds satisfies `predicate`. */
    someIntersectingBounds(minX, minY, maxX, maxY, predicate) {
      return this.visitIntersecting(minX, minY, maxX, maxY, predicate);
    }
    /** Return whether any item intersects `box`. */
    collides(box) {
      return this.collidesBounds(box.minX, box.minY, box.maxX, box.maxY);
    }
    /** Return whether any item intersects the supplied scalar bounds. */
    collidesBounds(minX, minY, maxX, maxY) {
      return this.visitIntersecting(minX, minY, maxX, maxY, () => true);
    }
    /** Bulk-load items using RBush's OMT packing algorithm. */
    load(items) {
      if (items.length === 0) {
        return this;
      }
      if (items.length < this.minEntries) {
        for (const item of items) {
          this.insert(item);
        }
        return this;
      }
      let node = this.build(items.slice(), 0, items.length - 1, 0);
      if (this.data.children.length === 0) {
        this.data = node;
      } else if (this.data.height === node.height) {
        this.splitRoot(this.data, node);
      } else {
        if (this.data.height < node.height) {
          const previousRoot = this.data;
          this.data = node;
          node = previousRoot;
        }
        this.insertNode(node, this.data.height - node.height - 1);
      }
      return this;
    }
    insert(item) {
      this.insertItem(item, this.data.height - 1);
      return this;
    }
    clear() {
      this.data = createNode([]);
      return this;
    }
    remove(item, equals) {
      let node = this.data;
      const minX = item.x;
      const minY = item.y;
      const maxX = item.x + item.width;
      const maxY = item.y + item.height;
      const path = [];
      const indexes = [];
      let childIndex = 0;
      let parent;
      let goingUp = false;
      while (node || path.length > 0) {
        if (!node) {
          node = path.pop();
          parent = path[path.length - 1];
          childIndex = indexes.pop() ?? 0;
          goingUp = true;
        }
        if (!node) {
          break;
        }
        if (node.leaf) {
          const itemIndex = findItem(item, node.children, equals);
          if (itemIndex !== -1) {
            node.children.splice(itemIndex, 1);
            path.push(node);
            this.condense(path);
            return this;
          }
        }
        if (!goingUp && !node.leaf && containsBounds(node, minX, minY, maxX, maxY)) {
          path.push(node);
          indexes.push(childIndex);
          childIndex = 0;
          parent = node;
          node = node.children[0];
        } else if (parent) {
          childIndex += 1;
          node = parent.children[childIndex];
          goingUp = false;
        } else {
          node = void 0;
        }
      }
      return this;
    }
    toJSON() {
      return this.data;
    }
    fromJSON(data) {
      this.data = data;
      return this;
    }
    visitIntersecting(minX, minY, maxX, maxY, predicate) {
      let node = this.data;
      if (!intersectsBounds(node, minX, minY, maxX, maxY)) {
        return false;
      }
      const nodesToSearch = [];
      while (node) {
        for (const child of node.children) {
          if (node.leaf) {
            if (!intersectsItemBounds(child, minX, minY, maxX, maxY)) {
              continue;
            }
            if (predicate(child)) {
              return true;
            }
            continue;
          }
          const childNode = child;
          if (!intersectsBounds(childNode, minX, minY, maxX, maxY)) {
            continue;
          }
          if (boundsContainBox(minX, minY, maxX, maxY, childNode)) {
            if (this.visitAll(child, predicate)) {
              return true;
            }
          } else {
            nodesToSearch.push(child);
          }
        }
        node = nodesToSearch.pop();
      }
      return false;
    }
    visitAll(node, predicate) {
      let current = node;
      const nodesToSearch = [];
      while (current) {
        if (current.leaf) {
          for (const child of current.children) {
            if (predicate(child)) {
              return true;
            }
          }
        } else {
          nodesToSearch.push(...current.children);
        }
        current = nodesToSearch.pop();
      }
      return false;
    }
    build(items, left, right, requestedHeight) {
      const itemCount = right - left + 1;
      let entriesPerNode = this.maxEntries;
      if (itemCount <= entriesPerNode) {
        const leaf = createNode(items.slice(left, right + 1));
        calcBBox(leaf);
        return leaf;
      }
      let height = requestedHeight;
      if (height === 0) {
        height = Math.ceil(Math.log(itemCount) / Math.log(entriesPerNode));
        entriesPerNode = Math.ceil(itemCount / entriesPerNode ** (height - 1));
      }
      const node = createNode([]);
      node.leaf = false;
      node.height = height;
      const tileSize = Math.ceil(itemCount / entriesPerNode);
      const columnSize = tileSize * Math.ceil(Math.sqrt(entriesPerNode));
      multiSelect(items, left, right, columnSize, compareItemMinX);
      for (let columnStart = left; columnStart <= right; columnStart += columnSize) {
        const columnEnd = Math.min(columnStart + columnSize - 1, right);
        multiSelect(items, columnStart, columnEnd, tileSize, compareItemMinY);
        for (let tileStart = columnStart; tileStart <= columnEnd; tileStart += tileSize) {
          const tileEnd = Math.min(tileStart + tileSize - 1, columnEnd);
          node.children.push(this.build(items, tileStart, tileEnd, height - 1));
        }
      }
      calcBBox(node);
      return node;
    }
    chooseSubtree(minX, minY, maxX, maxY, root, level, path) {
      let node = root;
      while (true) {
        path.push(node);
        if (node.leaf || path.length - 1 === level) {
          break;
        }
        let minimumArea = Number.POSITIVE_INFINITY;
        let minimumEnlargement = Number.POSITIVE_INFINITY;
        let targetNode;
        for (const child of node.children) {
          const area = boxArea(child);
          const enlargement = enlargedArea(minX, minY, maxX, maxY, child) - area;
          if (enlargement < minimumEnlargement) {
            minimumEnlargement = enlargement;
            minimumArea = Math.min(area, minimumArea);
            targetNode = child;
          } else if (enlargement === minimumEnlargement && area < minimumArea) {
            minimumArea = area;
            targetNode = child;
          }
        }
        node = targetNode ?? node.children[0];
      }
      return node;
    }
    insertItem(item, level) {
      this.insertAtLevel(item, item.x, item.y, item.x + item.width, item.y + item.height, level);
    }
    insertNode(node, level) {
      this.insertAtLevel(node, node.minX, node.minY, node.maxX, node.maxY, level);
    }
    insertAtLevel(item, minX, minY, maxX, maxY, level) {
      const insertPath = [];
      const node = this.chooseSubtree(minX, minY, maxX, maxY, this.data, level, insertPath);
      node.children.push(item);
      extendBounds(node, minX, minY, maxX, maxY);
      let currentLevel = level;
      while (currentLevel >= 0) {
        if (insertPath[currentLevel].children.length > this.maxEntries) {
          this.split(insertPath, currentLevel);
          currentLevel -= 1;
        } else {
          break;
        }
      }
      this.adjustParentBoxes(minX, minY, maxX, maxY, insertPath, currentLevel);
    }
    split(insertPath, level) {
      const node = insertPath[level];
      const childCount = node.children.length;
      this.chooseSplitAxis(node, this.minEntries, childCount);
      const splitIndex = this.chooseSplitIndex(node, this.minEntries, childCount);
      const newNode = createNode(node.children.splice(splitIndex));
      newNode.height = node.height;
      newNode.leaf = node.leaf;
      calcBBox(node);
      calcBBox(newNode);
      if (level > 0) {
        insertPath[level - 1].children.push(newNode);
      } else {
        this.splitRoot(node, newNode);
      }
    }
    splitRoot(node, newNode) {
      this.data = createNode([node, newNode]);
      this.data.height = node.height + 1;
      this.data.leaf = false;
      calcBBox(this.data);
    }
    chooseSplitIndex(node, minimum, maximum) {
      let bestIndex;
      let minimumOverlap = Number.POSITIVE_INFINITY;
      let minimumArea = Number.POSITIVE_INFINITY;
      for (let index = minimum; index <= maximum - minimum; index += 1) {
        const firstBox = distributedBox(node, 0, index);
        const secondBox = distributedBox(node, index, maximum);
        const overlap = intersectionArea(firstBox, secondBox);
        const area = boxArea(firstBox) + boxArea(secondBox);
        if (overlap < minimumOverlap) {
          minimumOverlap = overlap;
          bestIndex = index;
          minimumArea = Math.min(area, minimumArea);
        } else if (overlap === minimumOverlap && area < minimumArea) {
          minimumArea = area;
          bestIndex = index;
        }
      }
      return bestIndex ?? maximum - minimum;
    }
    chooseSplitAxis(node, minimum, maximum) {
      const compareMinX = node.leaf ? (left, right) => compareItemMinX(left, right) : (left, right) => compareNodeMinX(left, right);
      const compareMinY = node.leaf ? (left, right) => compareItemMinY(left, right) : (left, right) => compareNodeMinY(left, right);
      const xMargin = this.allDistributedMargin(node, minimum, maximum, compareMinX);
      const yMargin = this.allDistributedMargin(node, minimum, maximum, compareMinY);
      if (xMargin < yMargin) {
        node.children.sort(compareMinX);
      }
    }
    allDistributedMargin(node, minimum, maximum, compare) {
      node.children.sort(compare);
      const leftBox = distributedBox(node, 0, minimum);
      const rightBox = distributedBox(node, maximum - minimum, maximum);
      let margin = boxMargin(leftBox) + boxMargin(rightBox);
      for (let index = minimum; index < maximum - minimum; index += 1) {
        const child = node.children[index];
        if (node.leaf) {
          extendItem(leftBox, child);
        } else {
          extendBox(leftBox, child);
        }
        margin += boxMargin(leftBox);
      }
      for (let index = maximum - minimum - 1; index >= minimum; index -= 1) {
        const child = node.children[index];
        if (node.leaf) {
          extendItem(rightBox, child);
        } else {
          extendBox(rightBox, child);
        }
        margin += boxMargin(rightBox);
      }
      return margin;
    }
    adjustParentBoxes(minX, minY, maxX, maxY, path, level) {
      for (let index = level; index >= 0; index -= 1) {
        extendBounds(path[index], minX, minY, maxX, maxY);
      }
    }
    condense(path) {
      for (let index = path.length - 1; index >= 0; index -= 1) {
        const node = path[index];
        if (node.children.length === 0) {
          if (index > 0) {
            const siblings = path[index - 1].children;
            siblings.splice(siblings.indexOf(node), 1);
          } else {
            this.clear();
          }
        } else {
          calcBBox(node);
        }
      }
    }
  };
  function findItem(item, items, equals) {
    if (!equals) {
      return items.indexOf(item);
    }
    return items.findIndex((candidate) => equals(item, candidate));
  }
  function calcBBox(node) {
    distributedBox(node, 0, node.children.length, node);
  }
  function distributedBox(node, start, end, destination = createNode([])) {
    destination.minX = Number.POSITIVE_INFINITY;
    destination.minY = Number.POSITIVE_INFINITY;
    destination.maxX = Number.NEGATIVE_INFINITY;
    destination.maxY = Number.NEGATIVE_INFINITY;
    for (let index = start; index < end; index += 1) {
      const child = node.children[index];
      if (node.leaf) {
        extendItem(destination, child);
      } else {
        extendBox(destination, child);
      }
    }
    return destination;
  }
  function extendItem(target, item) {
    extendBounds(target, item.x, item.y, item.x + item.width, item.y + item.height);
  }
  function extendBox(target, addition) {
    extendBounds(target, addition.minX, addition.minY, addition.maxX, addition.maxY);
  }
  function extendBounds(target, minX, minY, maxX, maxY) {
    target.minX = Math.min(target.minX, minX);
    target.minY = Math.min(target.minY, minY);
    target.maxX = Math.max(target.maxX, maxX);
    target.maxY = Math.max(target.maxY, maxY);
  }
  function compareItemMinX(left, right) {
    return left.x - right.x;
  }
  function compareItemMinY(left, right) {
    return left.y - right.y;
  }
  function compareNodeMinX(left, right) {
    return left.minX - right.minX;
  }
  function compareNodeMinY(left, right) {
    return left.minY - right.minY;
  }
  function boxArea(box) {
    return (box.maxX - box.minX) * (box.maxY - box.minY);
  }
  function boxMargin(box) {
    return box.maxX - box.minX + (box.maxY - box.minY);
  }
  function enlargedArea(minX, minY, maxX, maxY, second) {
    return (Math.max(second.maxX, maxX) - Math.min(second.minX, minX)) * (Math.max(second.maxY, maxY) - Math.min(second.minY, minY));
  }
  function intersectionArea(first, second) {
    const minX = Math.max(first.minX, second.minX);
    const minY = Math.max(first.minY, second.minY);
    const maxX = Math.min(first.maxX, second.maxX);
    const maxY = Math.min(first.maxY, second.maxY);
    return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
  }
  function boundsContainBox(minX, minY, maxX, maxY, inner) {
    return minX <= inner.minX && minY <= inner.minY && inner.maxX <= maxX && inner.maxY <= maxY;
  }
  function containsBounds(outer, minX, minY, maxX, maxY) {
    return outer.minX <= minX && outer.minY <= minY && maxX <= outer.maxX && maxY <= outer.maxY;
  }
  function intersectsBounds(box, minX, minY, maxX, maxY) {
    return box.minX <= maxX && box.minY <= maxY && box.maxX >= minX && box.maxY >= minY;
  }
  function intersectsItemBounds(item, minX, minY, maxX, maxY) {
    return item.x <= maxX && item.y <= maxY && item.x + item.width >= minX && item.y + item.height >= minY;
  }
  function createNode(children) {
    return {
      children,
      height: 1,
      leaf: true,
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY
    };
  }
  function quickselect(items, selection, left, right, compare) {
    let lower = left;
    let upper = right;
    while (upper > lower) {
      if (upper - lower > 600) {
        const itemCount = upper - lower + 1;
        const selectionOffset = selection - lower + 1;
        const logarithm = Math.log(itemCount);
        const sampleSize = 0.5 * Math.exp(2 * logarithm / 3);
        const sampleDelta = 0.5 * Math.sqrt(logarithm * sampleSize * (itemCount - sampleSize) / itemCount) * (selectionOffset - itemCount / 2 < 0 ? -1 : 1);
        const newLeft = Math.max(
          lower,
          Math.floor(selection - selectionOffset * sampleSize / itemCount + sampleDelta)
        );
        const newRight = Math.min(
          upper,
          Math.floor(
            selection + (itemCount - selectionOffset) * sampleSize / itemCount + sampleDelta
          )
        );
        quickselect(items, selection, newLeft, newRight, compare);
      }
      const selected = items[selection];
      let leftIndex = lower;
      let rightIndex = upper;
      swap(items, lower, selection);
      if (compare(items[upper], selected) > 0) {
        swap(items, lower, upper);
      }
      while (leftIndex < rightIndex) {
        swap(items, leftIndex, rightIndex);
        leftIndex += 1;
        rightIndex -= 1;
        while (compare(items[leftIndex], selected) < 0) {
          leftIndex += 1;
        }
        while (compare(items[rightIndex], selected) > 0) {
          rightIndex -= 1;
        }
      }
      if (compare(items[lower], selected) === 0) {
        swap(items, lower, rightIndex);
      } else {
        rightIndex += 1;
        swap(items, rightIndex, upper);
      }
      if (rightIndex <= selection) {
        lower = rightIndex + 1;
      }
      if (selection <= rightIndex) {
        upper = rightIndex - 1;
      }
    }
  }
  function swap(items, left, right) {
    const item = items[left];
    items[left] = items[right];
    items[right] = item;
  }
  function multiSelect(items, left, right, groupSize, compare) {
    const stack = [left, right];
    while (stack.length > 0) {
      const currentRight = stack.pop();
      const currentLeft = stack.pop();
      if (currentLeft === void 0 || currentRight === void 0) {
        throw new Error("RTree bulk-load selection stack is unbalanced");
      }
      if (currentRight - currentLeft <= groupSize) {
        continue;
      }
      const middle = currentLeft + Math.ceil((currentRight - currentLeft) / groupSize / 2) * groupSize;
      quickselect(items, middle, currentLeft, currentRight, compare);
      stack.push(currentLeft, middle, middle, currentRight);
    }
  }

  // packages/layout/src/LayoutTree.ts
  var LayoutTree = class extends RTree {
  };

  // packages/utils/src/timeTracker.ts
  var TimeTracker = class {
    constructor() {
      __publicField(this, "record", {});
      __publicField(this, "createdAt", performance.now());
      __publicField(this, "startedAt", performance.now());
    }
    /** Accumulated phase timings in milliseconds, in the order they were marked. */
    get timings() {
      return this.record;
    }
    /** Records the span since construction, the last `mark`, or the last `reset`, then restarts. */
    mark(name) {
      const now = performance.now();
      this.record[name] = Math.round((now - this.startedAt) * 100) / 100;
      this.startedAt = now;
    }
    /**
     * Wall-clock milliseconds since the tracker was constructed, rounded to two decimals.
     *
     * Anchored at construction rather than at the phase clock, so `mark` and `reset` leave it
     * untouched: callers report it as the run total alongside the per-phase spans.
     */
    totalMs() {
      return Math.round((performance.now() - this.createdAt) * 100) / 100;
    }
    /** Restarts the clock without recording the span in flight. */
    reset() {
      this.startedAt = performance.now();
    }
    /** Folds another pipeline's timings in under `${prefix}.${stage}` keys. */
    merge(prefix, timings) {
      for (const [stage, ms] of Object.entries(timings ?? {})) {
        this.record[`${prefix}.${stage}`] = ms;
      }
    }
  };

  // packages/utils/src/setUtils.ts
  function addToSet(set, values) {
    values?.forEach((value) => set.add(value));
    return set;
  }

  // packages/layout/src/rangeUtils.ts
  function makeRangeFromEntity(entity) {
    return {
      minX: entity.x,
      maxX: entity.x + entity.width,
      minY: entity.y,
      maxY: entity.y + entity.height
    };
  }
  function makeRangeForEntityTextPlacement(entity) {
    if (!entity?.textPlacement) {
      return void 0;
    }
    return {
      minX: entity.x + entity.textPlacement.relativeX,
      maxX: entity.x + entity.textPlacement.relativeX + entity.textPlacement.width,
      minY: entity.y + entity.textPlacement.relativeY,
      maxY: entity.y + entity.textPlacement.relativeY + entity.textPlacement.height
    };
  }
  function addBufferToRange(range, buffer) {
    return {
      minX: range.minX - buffer,
      maxX: range.maxX + buffer,
      minY: range.minY - buffer,
      maxY: range.maxY + buffer
    };
  }
  function isOverlapping(rangeA, rangeB) {
    return !(rangeA.minX > rangeB.maxX || rangeA.maxX < rangeB.minX || rangeA.minY > rangeB.maxY || rangeA.maxY < rangeB.minY);
  }
  function midpoint(span) {
    return (span[0] + span[1]) / 2;
  }
  function spanLength(span) {
    return span[1] - span[0];
  }
  function spansEqual(left, right, epsilon) {
    return Math.abs(left[0] - right[0]) <= epsilon && Math.abs(left[1] - right[1]) <= epsilon;
  }
  function insetSpan(span, padding, epsilon) {
    return span[1] - span[0] >= 2 * padding - epsilon ? [span[0] + padding, span[1] - padding] : void 0;
  }
  function intersectSpans(left, right, epsilon) {
    const start = Math.max(left[0], right[0]);
    const end = Math.min(left[1], right[1]);
    return start <= end + epsilon ? [start, Math.max(start, end)] : void 0;
  }
  function intersectPositiveSpans(left, right, epsilon) {
    const start = Math.max(left[0], right[0]);
    const end = Math.min(left[1], right[1]);
    return end - start > epsilon ? [start, end] : void 0;
  }
  function spansOverlapPositive(left, right, epsilon) {
    return Math.min(left[1], right[1]) - Math.max(left[0], right[0]) > epsilon;
  }
  function spanOverlapLength(left, right) {
    return Math.max(0, Math.min(left[1], right[1]) - Math.max(left[0], right[0]));
  }
  function spanContains(outer, inner, epsilon) {
    return outer[0] <= inner[0] + epsilon && outer[1] >= inner[1] - epsilon;
  }
  function coordinateInSpan(value, span, epsilon) {
    return value >= span[0] - epsilon && value <= span[1] + epsilon;
  }
  function clampToSpan(value, span) {
    return Math.min(Math.max(value, span[0]), span[1]);
  }
  function clamp(value, lower, upper) {
    return Math.min(Math.max(value, lower), upper);
  }
  var axisStart = (b, axis) => axis === "x" ? b.x : b.y;
  var axisOrthMin = (b, axis) => axis === "x" ? b.y : b.x;
  function makePropsFromRange(range) {
    return {
      x: range.minX,
      y: range.minY,
      width: range.maxX - range.minX,
      height: range.maxY - range.minY
    };
  }
  function subtractSpan(source, cut, epsilon) {
    const overlap = intersectPositiveSpans(source, cut, epsilon);
    if (!overlap) {
      return [source];
    }
    const result = [];
    if (overlap[0] > source[0]) {
      result.push([source[0], overlap[0]]);
    }
    if (overlap[1] < source[1]) {
      result.push([overlap[1], source[1]]);
    }
    return result;
  }
  function subtractSpans(bounds, exclusions, epsilon) {
    const clipped = exclusions.map((span) => [Math.max(bounds[0], span[0]), Math.min(bounds[1], span[1])]).filter((span) => span[0] <= span[1] + epsilon).sort((left, right) => left[0] - right[0] || left[1] - right[1]);
    const available = [];
    let cursor = bounds[0];
    for (const exclusion of clipped) {
      if (exclusion[0] > cursor + epsilon) {
        available.push([cursor, exclusion[0]]);
      }
      cursor = Math.max(cursor, exclusion[1]);
      if (cursor >= bounds[1] - epsilon) {
        break;
      }
    }
    if (cursor < bounds[1] - epsilon) {
      available.push([cursor, bounds[1]]);
    }
    return available;
  }

  // packages/layout/src/typeChecks.ts
  function isAxis(arg) {
    return arg === "x" || arg === "y";
  }
  function isShift(change) {
    return "deltaX" in change || "deltaY" in change;
  }

  // packages/layout/src/directionUtils.ts
  function legacyDirectionToDirection(direction2) {
    switch (direction2) {
      case "right":
        return "right";
      case "left":
        return "left";
      case "up":
      case "top":
        return "up";
      case "down":
      case "bottom":
        return "down";
      default:
        return void 0;
    }
  }
  function getAxisForDirection(arg) {
    if (isAxis(arg)) {
      return arg;
    }
    const direction2 = typeof arg === "string" ? arg : arg.primaryDirection;
    return direction2 === "right" || direction2 === "left" ? "x" : "y";
  }
  function isHorizontal(arg) {
    if (!arg) {
      return false;
    }
    return getAxisForDirection(arg) === "x";
  }
  var OPPOSITE_DIRECTION = {
    up: "down",
    down: "up",
    left: "right",
    right: "left"
  };

  // packages/layout/src/sizeUtils.ts
  function getDimensions(entities, options = {}) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const entity of entities) {
      const change = options.pendingChanges?.get(entity.id);
      const finalEnt = change ? applySizeChanges(entity, change, false) : entity;
      const entityDims = getEntityDimensions(finalEnt, options);
      minX = Math.min(minX, entityDims.minX);
      minY = Math.min(minY, entityDims.minY);
      maxX = Math.max(maxX, entityDims.maxX);
      maxY = Math.max(maxY, entityDims.maxY);
    }
    return { minX, minY, maxX, maxY };
  }
  function getEntityDimensions(entity, options = {}) {
    let w = entity.width;
    let h = entity.height;
    let xDiffAfterOverride = 0;
    let yDiffAfterOverride = 0;
    if (options.entityRankSpacing && !entity.isContainer) {
      w = options.entityRankSpacing.width ?? w;
      h = options.entityRankSpacing.height ?? h;
      xDiffAfterOverride = (w - entity.width) / 2;
      yDiffAfterOverride = (h - entity.height) / 2;
    }
    const x = entity.x - xDiffAfterOverride;
    const y = entity.y - yDiffAfterOverride;
    if (!options.excludeTextDimensions) {
      const range = makeRangeForEntityTextPlacement(entity);
      const minY = Math.min(y, range?.minY ?? Infinity);
      const minX = Math.min(x, range?.minX ?? Infinity);
      const maxX = Math.max(x + w, range?.maxX ?? -Infinity);
      const maxY = Math.max(y + h, range?.maxY ?? -Infinity);
      return { minX, minY, maxX, maxY };
    }
    return { minX: x, minY: y, maxX: x + w, maxY: y + h };
  }
  function buildChanges(entity, changes) {
    if (!changes) {
      return {};
    }
    const updates = {};
    if (changes.deltaX) {
      updates.x = entity.x + changes.deltaX;
    }
    if (changes.deltaY) {
      updates.y = entity.y + changes.deltaY;
    }
    if (changes.deltaWidth) {
      updates.width = entity.width + changes.deltaWidth;
    }
    if (changes.deltaHeight) {
      updates.height = entity.height + changes.deltaHeight;
    }
    if (changes.containerId !== void 0) {
      updates.containerId = changes.containerId;
    }
    if (changes.isContainer !== void 0) {
      updates.isContainer = !!changes.isContainer;
    }
    if (changes.options !== void 0) {
      updates.options = { ...entity.options ?? {}, ...changes.options };
    }
    if (changes.textPlacement !== void 0) {
      updates.textPlacement = changes.textPlacement;
    }
    return updates;
  }
  function applySizeChanges(entity, changes, mutate) {
    const updates = buildChanges(entity, changes);
    if (mutate) {
      Object.assign(entity, updates);
      return entity;
    }
    return { ...entity, ...updates };
  }
  function applyConnectionChanges(connection, changes, mutate) {
    if (!changes) {
      return mutate ? connection : { ...connection };
    }
    let updates = {};
    if ("deltaX" in changes || "deltaY" in changes) {
      updates.x = connection.x + (changes.deltaX ?? 0);
      updates.y = connection.y + (changes.deltaY ?? 0);
    } else {
      updates = changes;
    }
    if (connection.textPlacement && !("textPlacement" in updates)) {
      const originalX = connection.x;
      const originalY = connection.y;
      const originalTextPlacementX = connection.textPlacement.x;
      const originalTextPlacementY = connection.textPlacement.y;
      if ("x" in updates) {
        updates.textPlacement ?? (updates.textPlacement = { ...connection.textPlacement });
        updates.textPlacement.x = originalTextPlacementX - originalX + (updates.x ?? 0);
      }
      if ("y" in updates) {
        updates.textPlacement ?? (updates.textPlacement = { ...connection.textPlacement });
        updates.textPlacement.y = originalTextPlacementY - originalY + (updates.y ?? 0);
      }
    }
    if (mutate) {
      Object.assign(connection, updates);
      return connection;
    }
    return { ...connection, ...updates };
  }

  // packages/layout/src/overlaps.ts
  function calculateOverlaps(layoutManager, movingEntityIds) {
    const overlaps = [];
    const buffer = layoutManager.options.marginBetweenEntities;
    const skipContainers = layoutManager.options.skipContainerOverlapBehavior;
    const containedEntityIds = /* @__PURE__ */ new Set();
    for (const entityId of movingEntityIds) {
      const childIds = layoutManager.getChildIds(entityId, true) ?? [];
      addToSet(containedEntityIds, childIds);
    }
    function isValidOverlap(entity, overlappedEntity) {
      if (movingEntityIds.has(overlappedEntity.id) || containedEntityIds.has(overlappedEntity.id)) {
        return false;
      }
      if (skipContainers && overlappedEntity.isContainer) {
        return false;
      }
      if ((overlappedEntity.isContainer || entity.isContainer) && layoutManager.areRelated(overlappedEntity.id, entity.id)) {
        return false;
      }
      return true;
    }
    for (const entityId of movingEntityIds) {
      if (containedEntityIds.has(entityId)) {
        continue;
      }
      const entity = layoutManager.getEntityById(entityId);
      if (!entity) {
        continue;
      }
      const dimensions = getEntityDimensions(entity);
      const bufferRange = addBufferToRange({ ...dimensions }, buffer);
      const entriesInBufferRange = layoutManager.findEntitiesInRange(
        bufferRange,
        (overlappedEntity) => isValidOverlap(entity, overlappedEntity)
      );
      if (!entriesInBufferRange.length) {
        continue;
      }
      const containerIds = getContainerIds(entriesInBufferRange);
      for (const entry of entriesInBufferRange) {
        if (entry.containerId && containerIds.has(entry.containerId)) {
          continue;
        }
        const entryDimensions = getEntityDimensions(entry);
        overlaps.push({
          overlappingEntityId: entityId,
          overlappedEntityId: entry.id,
          isOverlapping: isOverlapping(dimensions, entryDimensions),
          primaryDirection: layoutManager.primaryDirection,
          overlappedSides: determineOverlappedSides(dimensions, entryDimensions)
        });
      }
    }
    return overlaps;
  }
  function calculateAllOverlaps(layoutManager, buffer = 0) {
    const overlaps = [];
    const dimensionCache = /* @__PURE__ */ new Map();
    function getDimesions(entity) {
      const cached = dimensionCache.get(entity.id);
      if (cached) {
        return cached;
      }
      const dimensions = getEntityDimensions(entity);
      dimensionCache.set(entity.id, dimensions);
      return dimensions;
    }
    const overlappedByEntityId = /* @__PURE__ */ new Map();
    function isValidOverlap(entity, overlappedEntity) {
      if (entity === overlappedEntity) {
        return false;
      }
      const eId = entity.id;
      const oId = overlappedEntity.id;
      if (eId === oId) {
        return false;
      }
      const hasOverlap = overlappedByEntityId.get(eId)?.has(oId) || overlappedByEntityId.get(oId)?.has(eId);
      if (hasOverlap) {
        return false;
      }
      if (layoutManager.areRelated(eId, oId)) {
        return false;
      }
      return true;
    }
    for (const entity of layoutManager.getEntities()) {
      const dimensions = getDimesions(entity);
      const bufferRange = buffer ? addBufferToRange({ ...dimensions }, buffer) : dimensions;
      const entriesInBufferRange = layoutManager.findEntitiesInRange(
        bufferRange,
        (overlappedEntity) => isValidOverlap(entity, overlappedEntity)
      );
      if (!entriesInBufferRange.length) {
        continue;
      }
      const containerIds = getContainerIds(entriesInBufferRange);
      for (const overlappedEntity of entriesInBufferRange) {
        if (overlappedEntity.containerId && containerIds.has(overlappedEntity.containerId)) {
          continue;
        }
        const overlappedDimensions = getDimesions(overlappedEntity);
        overlaps.push({
          overlappingEntityId: entity.id,
          overlappedEntityId: overlappedEntity.id,
          isOverlapping: isOverlapping(dimensions, overlappedDimensions),
          primaryDirection: layoutManager.primaryDirection,
          overlappedSides: determineOverlappedSides(dimensions, overlappedDimensions)
        });
        const set = overlappedByEntityId.get(entity.id);
        if (set) {
          set.add(overlappedEntity.id);
        } else {
          overlappedByEntityId.set(entity.id, /* @__PURE__ */ new Set([overlappedEntity.id]));
        }
      }
    }
    return overlaps;
  }
  function getContainerIds(entities) {
    const containerIds = /* @__PURE__ */ new Set();
    for (const entity of entities) {
      if (entity.isContainer) {
        containerIds.add(entity.id);
      }
    }
    return containerIds;
  }
  function determineOverlappedSides(entity, overlappedRange) {
    const overlappedSides = new Uint8Array(4);
    if (entity.minY < overlappedRange.minY) {
      overlappedSides[0] = 1;
    }
    if (entity.maxY > overlappedRange.maxY) {
      overlappedSides[1] = 1;
    }
    if (entity.minX < overlappedRange.minX) {
      overlappedSides[2] = 1;
    }
    if (entity.maxX > overlappedRange.maxX) {
      overlappedSides[3] = 1;
    }
    return overlappedSides;
  }

  // packages/layout/src/constants.ts
  var DEFAULT_OPTIONS = {
    marginBetweenEntities: 40,
    marginBetweenRanks: 40,
    containerPadding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    minConnectionLength: 80,
    minConnectionTextMargin: 40,
    sizingMode: "auto",
    entityRankSpacing: void 0
  };

  // packages/layout/src/layoutManagerUtils.ts
  function makeContainerMapping(entities) {
    const containerMapping = {};
    for (const entity of entities) {
      addEntityToContainerMapping(containerMapping, entity);
    }
    return containerMapping;
  }
  function makeParentMapping(entitiesById) {
    const parentMapping = {};
    for (const entity of Object.values(entitiesById)) {
      addEntityToParentMapping(parentMapping, entity, entitiesById);
    }
    return parentMapping;
  }
  function addEntityToContainerMapping(containerMapping, entity) {
    var _a, _b;
    if (entity.isContainer) {
      containerMapping[_a = entity.id] ?? (containerMapping[_a] = /* @__PURE__ */ new Set());
    }
    if (entity.containerId) {
      containerMapping[_b = entity.containerId] ?? (containerMapping[_b] = /* @__PURE__ */ new Set());
      containerMapping[entity.containerId].add(entity.id);
    }
  }
  function addEntityToParentMapping(parentMapping, entity, entitiesById) {
    const parents = [];
    const seen = /* @__PURE__ */ new Set([entity.id]);
    let currentEntity = entity;
    while (currentEntity?.containerId) {
      if (seen.has(currentEntity.containerId)) {
        break;
      }
      parents.push(currentEntity.containerId);
      seen.add(currentEntity.containerId);
      currentEntity = entitiesById[currentEntity.containerId];
    }
    parentMapping[entity.id] = parents;
  }
  function removeEntityFromContainerMapping(containerMapping, entity) {
    if (entity.isContainer) {
      delete containerMapping[entity.id];
    }
    if (entity.containerId) {
      containerMapping[entity.containerId]?.delete(entity.id);
    }
  }
  function removeEntityFromParentMapping(parentMapping, entity) {
    delete parentMapping[entity.id];
  }
  function updateEntityContainerMapping(containerMapping, entity, oldContainerId, oldWasContainer) {
    if (oldContainerId && entity.containerId !== oldContainerId) {
      containerMapping[oldContainerId]?.delete(entity.id);
    }
    if (oldWasContainer && !entity.isContainer) {
      delete containerMapping[entity.id];
    }
    addEntityToContainerMapping(containerMapping, entity);
  }
  function updateEntityParentMapping(entitiesById, parentMapping, containerMapping, entity, oldContainerId, oldIsContainer, oldChildIds) {
    if (!!oldIsContainer === !!entity.isContainer && (oldContainerId ?? "") === (entity.containerId ?? "")) {
      return;
    }
    addEntityToParentMapping(parentMapping, entity, entitiesById);
    const seenChildIds = /* @__PURE__ */ new Set();
    function recursivelyUpdateChildren(childIds) {
      if (childIds?.size) {
        for (const childId of childIds) {
          if (seenChildIds.has(childId)) {
            continue;
          }
          seenChildIds.add(childId);
          addEntityToParentMapping(parentMapping, entitiesById[childId], entitiesById);
          recursivelyUpdateChildren(containerMapping[childId]);
        }
      }
    }
    recursivelyUpdateChildren(oldChildIds);
  }
  function makeConnectionMapping(connections) {
    const connectionMapping = {};
    for (const connection of connections) {
      const { id, from, to } = connection;
      if (from) {
        if (connectionMapping[from]) {
          connectionMapping[from].push(id);
        } else {
          connectionMapping[from] = [id];
        }
      }
      if (to) {
        if (connectionMapping[to]) {
          connectionMapping[to].push(id);
        } else {
          connectionMapping[to] = [id];
        }
      }
    }
    return connectionMapping;
  }
  function addConnectionToMappings(connection, connectionMapping) {
    const { id, from, to } = connection;
    if (!connectionMapping[from]) {
      connectionMapping[from] = [];
    }
    if (!connectionMapping[from].includes(id)) {
      connectionMapping[from].push(id);
    }
    if (!connectionMapping[to]) {
      connectionMapping[to] = [];
    }
    if (!connectionMapping[to].includes(id)) {
      connectionMapping[to].push(id);
    }
  }
  function removeConnectionFromMappings(connectionId, connections, connectionMapping) {
    const index = connections.findIndex((c) => c.id === connectionId);
    if (index === -1) {
      return;
    }
    const connection = connections[index];
    connections.splice(index, 1);
    const { from, to } = connection;
    const fromIndex = connectionMapping[from]?.indexOf(connectionId);
    if (fromIndex !== void 0 && fromIndex !== -1) {
      connectionMapping[from].splice(fromIndex, 1);
    }
    const toIndex = connectionMapping[to]?.indexOf(connectionId);
    if (toIndex !== void 0 && toIndex !== -1) {
      connectionMapping[to].splice(toIndex, 1);
    }
  }
  function mergeChanges(change, existingChange) {
    if (!existingChange) {
      return change;
    }
    const final = { ...existingChange };
    if ("deltaX" in change && change.deltaX !== void 0) {
      final.deltaX = (existingChange.deltaX ?? 0) + change.deltaX;
    }
    if ("deltaY" in change && change.deltaY !== void 0) {
      final.deltaY = (existingChange.deltaY ?? 0) + change.deltaY;
    }
    if ("deltaWidth" in change && change.deltaWidth !== void 0) {
      final.deltaWidth = (existingChange.deltaWidth ?? 0) + change.deltaWidth;
    }
    if ("deltaHeight" in change && change.deltaHeight !== void 0) {
      final.deltaHeight = (existingChange.deltaHeight ?? 0) + change.deltaHeight;
    }
    if ("containerId" in change && change.containerId !== void 0) {
      final.containerId = change.containerId;
    }
    if ("isContainer" in change && change.isContainer !== void 0) {
      final.isContainer = change.isContainer;
    }
    if ("options" in change && change.options !== void 0) {
      final.options = { ...existingChange.options ?? {}, ...change.options };
    }
    if ("textPlacement" in change && change.textPlacement !== void 0) {
      final.textPlacement = change.textPlacement;
    }
    return final;
  }
  function mergeConnectionChanges(change, existingChange) {
    if (!existingChange) {
      return change;
    }
    if (!isShift(change)) {
      return { ...existingChange, ...change };
    }
    const final = { ...existingChange };
    if ("deltaX" in change && change.deltaX !== void 0) {
      if ("x" in final) {
        final.x = (final.x ?? 0) + change.deltaX;
      } else {
        final.deltaX = (final.deltaX ?? 0) + change.deltaX;
      }
    }
    if ("deltaY" in change && change.deltaY !== void 0) {
      if ("y" in final) {
        final.y = (final.y ?? 0) + change.deltaY;
      } else {
        final.deltaY = (final.deltaY ?? 0) + change.deltaY;
      }
    }
    return final;
  }
  function deepCopyStagedChanges(changes) {
    if (!changes) {
      return void 0;
    }
    return {
      additions: new Map(changes.additions),
      updates: new Map(changes.updates),
      deletes: new Set(changes.deletes),
      addedConnections: new Map(changes.addedConnections),
      updatedConnections: new Map(changes.updatedConnections),
      deletedConnections: new Set(changes.deletedConnections)
    };
  }
  function copyEntitiesWithSharing(baseEntitiesById, sourceEntitiesById) {
    if (!sourceEntitiesById) {
      return { ...baseEntitiesById };
    }
    const result = {};
    for (const [key, entity] of Object.entries(sourceEntitiesById)) {
      result[key] = entity === baseEntitiesById[key] ? entity : { ...entity };
    }
    return result;
  }
  function copyTreeJsonWithEntities(treeJson, entitiesById) {
    return {
      ...treeJson,
      children: treeJson.children.map(
        (child) => treeJson.leaf ? entitiesById[child.id] ?? child : copyTreeJsonWithEntities(child, entitiesById)
      )
    };
  }
  function copyLayoutTree(treeJson, entitiesById) {
    return new LayoutTree().fromJSON(copyTreeJsonWithEntities(treeJson, entitiesById));
  }
  function copyInternalData(original, current) {
    const base = current ?? original;
    const entitiesById = copyEntitiesWithSharing(original.entitiesById, current?.entitiesById);
    const tree = "tree" in base && base.tree ? copyLayoutTree(base.tree.toJSON(), entitiesById) : "treeJson" in base && base.treeJson ? copyLayoutTree(base.treeJson, entitiesById) : null;
    const connectionMapping = {};
    for (const [id, connectionIds] of Object.entries(base.connectionMapping)) {
      connectionMapping[id] = [...connectionIds];
    }
    const containerMapping = {};
    for (const [id, childIds] of Object.entries(base.containerMapping)) {
      containerMapping[id] = new Set(childIds);
    }
    const parentMapping = {};
    for (const [id, parentIds] of Object.entries(base.parentMapping)) {
      parentMapping[id] = [...parentIds];
    }
    return {
      entities: Object.values(entitiesById),
      connections: base.connections.map((c) => ({ ...c })),
      entitiesById,
      connectionMapping,
      containerIds: new Set(base.containerIds),
      containerMapping,
      parentMapping,
      dims: base.dims ? { ...base.dims } : void 0,
      tree
    };
  }
  function makeStagedChanges() {
    return {
      additions: /* @__PURE__ */ new Map(),
      updates: /* @__PURE__ */ new Map(),
      deletes: /* @__PURE__ */ new Set(),
      addedConnections: /* @__PURE__ */ new Map(),
      deletedConnections: /* @__PURE__ */ new Set(),
      updatedConnections: /* @__PURE__ */ new Map()
    };
  }

  // packages/layout/src/LayoutError.ts
  var LayoutError = class extends Error {
  };
  var MissingEntityError = class extends LayoutError {
    constructor(msg, id) {
      super(`${msg}: ${id}`);
    }
  };
  var LayoutDuplicateError = class extends LayoutError {
    constructor(msg, id) {
      super(`${msg}: ${id}`);
    }
  };

  // packages/layout/src/alignmentUtils.ts
  var EMPTY_CLASSES = [];
  var EMPTY_BY_ENTITY = /* @__PURE__ */ new Map();
  var LayoutAlignment = class _LayoutAlignment {
    constructor(currentEntities, captured) {
      this.currentEntities = currentEntities;
      __publicField(this, "captured");
      this.captured = captured;
    }
    capture(options = {}) {
      this.captured = buildAlignmentView(
        options.entities ?? this.currentEntities(),
        options.tolerance ?? 1
      );
      return this.captured;
    }
    clear() {
      this.captured = void 0;
    }
    get isCaptured() {
      return this.captured !== void 0;
    }
    get classes() {
      return this.captured?.classes ?? EMPTY_CLASSES;
    }
    get byEntity() {
      return this.captured?.byEntity ?? EMPTY_BY_ENTITY;
    }
    copyFor(currentEntities) {
      return new _LayoutAlignment(currentEntities, this.captured);
    }
  };
  function buildAlignmentView(entities, tolerance = 1) {
    const round = (value) => Math.round(value / tolerance) * tolerance;
    const edged = entities.map((entity) => ({
      id: entity.id,
      scope: entity.containerId ?? "__root__",
      start: { x: round(entity.x), y: round(entity.y) },
      end: { x: round(entity.x + entity.width), y: round(entity.y + entity.height) },
      center: { x: round(entity.x + entity.width / 2), y: round(entity.y + entity.height / 2) }
    }));
    const scopeStarts = /* @__PURE__ */ new Map();
    const scopeEnds = /* @__PURE__ */ new Map();
    for (const entity of edged) {
      const starts = getOrInit(scopeStarts, entity.scope);
      const ends = getOrInit(scopeEnds, entity.scope);
      for (const axis of ["x", "y"]) {
        starts[axis].add(entity.start[axis]);
        ends[axis].add(entity.end[axis]);
      }
    }
    const crossAdmitted = (entity, scope, axis) => (scopeStarts.get(scope)?.[axis].has(entity.start[axis]) ?? false) && (scopeEnds.get(scope)?.[axis].has(entity.end[axis]) ?? false);
    const classes = [];
    for (const axis of ["x", "y"]) {
      for (const side of ["start", "end"]) {
        const kind2 = side === "start" ? START_KIND[axis] : END_KIND[axis];
        const byValue = /* @__PURE__ */ new Map();
        for (const entity of edged) {
          const value = entity[side][axis];
          const bucket = byValue.get(value) ?? [];
          bucket.push(entity);
          byValue.set(value, bucket);
        }
        for (const [value, bucket] of byValue) {
          if (bucket.length < 2) {
            continue;
          }
          for (const component of splitBucketIntoComponents(bucket, axis, crossAdmitted)) {
            if (component.length > 1) {
              classes.push({ kind: kind2, value, ids: component.map((entity) => entity.id).sort() });
            }
          }
        }
      }
      const kind = CENTER_KIND[axis];
      const byScopeValue = /* @__PURE__ */ new Map();
      for (const entity of edged) {
        const key = `${entity.scope}:${entity.center[axis]}`;
        const bucket = byScopeValue.get(key) ?? [];
        bucket.push(entity);
        byScopeValue.set(key, bucket);
      }
      for (const bucket of byScopeValue.values()) {
        if (bucket.length > 1) {
          classes.push({
            kind,
            value: bucket[0].center[axis],
            ids: bucket.map((entity) => entity.id).sort()
          });
        }
      }
    }
    const byEntity = /* @__PURE__ */ new Map();
    for (const alignmentClass of classes) {
      for (const id of alignmentClass.ids) {
        const entry = byEntity.get(id) ?? {};
        entry[alignmentClass.kind] = alignmentClass;
        byEntity.set(id, entry);
      }
    }
    return { classes, byEntity };
  }
  var START_KIND = { x: "left", y: "top" };
  var END_KIND = { x: "right", y: "bottom" };
  var CENTER_KIND = { x: "centerX", y: "centerY" };
  function splitBucketIntoComponents(bucket, axis, crossAdmitted) {
    const parent = /* @__PURE__ */ new Map();
    const find = (id) => {
      let root = id;
      while (parent.get(root) !== root) {
        root = parent.get(root);
      }
      return root;
    };
    const union = (a, b) => {
      parent.set(find(a), find(b));
    };
    for (const entity of bucket) {
      parent.set(entity.id, entity.id);
    }
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        const a = bucket[i];
        const b = bucket[j];
        const coupled = a.scope === b.scope || crossAdmitted(a, b.scope, axis) || crossAdmitted(b, a.scope, axis);
        if (coupled) {
          union(a.id, b.id);
        }
      }
    }
    const components = /* @__PURE__ */ new Map();
    for (const entity of bucket) {
      const root = find(entity.id);
      const list = components.get(root) ?? [];
      list.push(entity);
      components.set(root, list);
    }
    return [...components.values()];
  }
  function getOrInit(map, scope) {
    let entry = map.get(scope);
    if (!entry) {
      entry = { x: /* @__PURE__ */ new Set(), y: /* @__PURE__ */ new Set() };
      map.set(scope, entry);
    }
    return entry;
  }

  // packages/layout/src/LayoutManager.ts
  var LayoutManager = class _LayoutManager {
    constructor(args, _prebuilt) {
      __publicField(this, "primaryDirection", "right");
      __publicField(this, "stagedChanges");
      __publicField(this, "origin", {
        x: 0,
        y: 0
      });
      __publicField(this, "options");
      __publicField(this, "_alignment");
      /**
       * Base data state. All persistent mutable data lives here.
       */
      __publicField(this, "_data");
      /**
       * Staged data state. When changes are initiated, a copy of _data is made here.
       * Access staged data via: this._stagedData?.entities ?? this._data.entities
       */
      __publicField(this, "_stagedData");
      /**
       * Checkpoints: snapshots of LayoutManager state that can be restored or forked from.
       */
      __publicField(this, "_checkpoints", /* @__PURE__ */ new Map());
      __publicField(this, "_checkpointCounter", 0);
      this.options = { ...DEFAULT_OPTIONS, ...args.options };
      if (args.primaryDirection) {
        this.primaryDirection = args.primaryDirection;
      }
      if (_prebuilt) {
        this._data = {
          entities: args.entities,
          entitiesById: _prebuilt.entitiesById,
          connections: args.connections,
          containerIds: _prebuilt.containerIds,
          containerMapping: _prebuilt.containerMapping,
          parentMapping: _prebuilt.parentMapping,
          connectionMapping: _prebuilt.connectionMapping,
          dims: void 0,
          tree: null
        };
      } else {
        this._data = this._createInitialData(args.entities, args.connections);
      }
      if (args.origin) {
        this.origin = args.origin;
      }
      this._alignment = new LayoutAlignment(() => this.getEntities());
    }
    get alignment() {
      return this._alignment;
    }
    /**
     * Create initial Data from entities and connections.
     * This builds all the derived mappings.
     */
    _createInitialData(entities, connections) {
      const entitiesById = {};
      for (const entity of entities) {
        entitiesById[entity.id] = entity;
      }
      const containerMapping = makeContainerMapping(entities);
      const containerIds = new Set(
        Object.keys(containerMapping).filter((id) => entitiesById[id]?.isContainer)
      );
      return {
        entities,
        entitiesById,
        connections,
        containerIds,
        containerMapping,
        parentMapping: makeParentMapping(entitiesById),
        connectionMapping: makeConnectionMapping(connections),
        // Lazy properties added on query / read
        dims: void 0,
        tree: null
      };
    }
    /** Util for making a full range from a partial range. Avoids new object if possible. */
    _makeFullRange(rangeArg) {
      if (rangeArg.minX != null && rangeArg.maxX != null && rangeArg.minY != null && rangeArg.maxY != null) {
        return rangeArg;
      }
      return {
        minX: rangeArg.minX === void 0 ? -Infinity : rangeArg.minX,
        minY: rangeArg.minY === void 0 ? -Infinity : rangeArg.minY,
        maxX: rangeArg.maxX === void 0 ? Infinity : rangeArg.maxX,
        maxY: rangeArg.maxY === void 0 ? Infinity : rangeArg.maxY
      };
    }
    /** Get the appropriate data object (staged or base) based on includeStaged flag */
    _getData(includeStaged = true) {
      return includeStaged ? this._stagedData ?? this._data : this._data;
    }
    /** Finds overlapping leaves and containers. */
    findEntitiesInRange(range, filterFn, includeStaged = true) {
      const entities = this.findLeafEntitiesInRange(range, filterFn, includeStaged);
      entities.push(...this.findContainersInRange(range, filterFn, includeStaged));
      return entities;
    }
    /** Finds overlapping non-container entities using the spatial tree. */
    findLeafEntitiesInRange(range, filterFn, includeStaged = true) {
      const tree = this._ensureTree(includeStaged);
      const fullRange = this._makeFullRange(range);
      if (!filterFn) {
        return tree.searchBounds(fullRange.minX, fullRange.minY, fullRange.maxX, fullRange.maxY);
      }
      const entities = [];
      tree.forEachIntersectingBounds(
        fullRange.minX,
        fullRange.minY,
        fullRange.maxX,
        fullRange.maxY,
        (entity) => {
          if (filterFn(entity)) {
            entities.push(entity);
          }
        }
      );
      return entities;
    }
    /** Finds overlapping containers by scanning the maintained container set. */
    findContainersInRange(range, filterFn, includeStaged = true) {
      const fullRange = this._makeFullRange(range);
      const data = this._getData(includeStaged);
      const containers = [];
      for (const containerId of data.containerIds) {
        const container = data.entitiesById[containerId];
        if (container && isOverlapping(fullRange, makeRangeFromEntity(container)) && (!filterFn || filterFn(container))) {
          containers.push(container);
        }
      }
      return containers;
    }
    calculateOverlaps(movingEntityIds) {
      return calculateOverlaps(this, movingEntityIds);
    }
    calculateAllOverlaps() {
      return calculateAllOverlaps(this);
    }
    hasEntitiesInRange(range) {
      const fullRange = this._makeFullRange(range);
      return this._ensureTree().collidesBounds(
        fullRange.minX,
        fullRange.minY,
        fullRange.maxX,
        fullRange.maxY
      ) || this.findContainersInRange(fullRange).length > 0;
    }
    getEntities(includeStaged = true) {
      return this._getData(includeStaged).entities;
    }
    /**
     * Gathers all text placements from containers and connections
     */
    getTextPlacements(includeStaged = true) {
      const textPlacements = [];
      for (const entity of this.getEntities(includeStaged)) {
        if (entity.textPlacement) {
          textPlacements.push({
            entityId: entity.id,
            width: entity.textPlacement.width,
            height: entity.textPlacement.height,
            x: entity.x + entity.textPlacement.relativeX,
            y: entity.y + entity.textPlacement.relativeY
          });
        }
      }
      for (const connection of this.getConnections(includeStaged)) {
        if (connection.textPlacement) {
          textPlacements.push({ entityId: connection.id, ...connection.textPlacement });
        }
      }
      return textPlacements;
    }
    getEntitiesMapping(includeStaged = true) {
      return this._getData(includeStaged).entitiesById;
    }
    getConnectionMapping(includeStaged = true) {
      return this._getData(includeStaged).connectionMapping;
    }
    getConnectedEntities(entityId) {
      const connectionIds = this.getConnectionMapping()[entityId];
      if (!connectionIds) {
        return [];
      }
      const connectedEntities = [];
      for (const connectionId of connectionIds) {
        const connection = this.getConnectionById(connectionId);
        if (!connection) {
          continue;
        }
        const otherId = connection.from === entityId ? connection.to : connection.from;
        connectedEntities.push({ otherId, connection });
      }
      return connectedEntities;
    }
    isConnected(entityId, otherId) {
      for (const entry of this.getConnectedEntities(entityId)) {
        if (entry.otherId === otherId || Array.isArray(otherId) && otherId.includes(entry.otherId)) {
          return true;
        }
      }
      return false;
    }
    getContainerMapping(includeStaged = true) {
      return this._getData(includeStaged).containerMapping;
    }
    getChildIds(id, recursive = false, includeStaged = true) {
      const containerMapping = this.getContainerMapping(includeStaged);
      const directChildIds = containerMapping[id];
      if (!recursive || !directChildIds?.size) {
        return directChildIds;
      }
      const childIds = /* @__PURE__ */ new Set();
      const visited = /* @__PURE__ */ new Set([id]);
      const queue = Array.from(directChildIds);
      for (let index = 0; index < queue.length; index++) {
        const childId = queue[index];
        if (visited.has(childId)) {
          continue;
        }
        visited.add(childId);
        childIds.add(childId);
        const nestedChildIds = containerMapping[childId];
        if (!nestedChildIds?.size) {
          continue;
        }
        for (const nestedChildId of nestedChildIds) {
          queue.push(nestedChildId);
        }
      }
      return childIds;
    }
    /** Useful for lazily iterating over children */
    *getChildIterator(id, recursive = true, includeStaged = true) {
      const childIds = this.getChildIds(id, recursive, includeStaged);
      if (!childIds?.size) {
        return;
      }
      for (const childId of childIds) {
        yield childId;
      }
    }
    /** Util for seeing if one entity is a child (nested or otherwise) of another */
    isChildOf(args) {
      const parentIds = this.getParentMapping(args.includeStaged ?? true)[args.targetId];
      return parentIds?.includes(args.parentId) ?? false;
    }
    /** Util for seeing if one entity is a child (nested or otherwise) of another */
    areRelated(idA, idB, includeStaged = true) {
      const parentsA = this.getParentMapping(includeStaged)[idA];
      if (parentsA?.includes(idB)) {
        return true;
      }
      const parentsB = this.getParentMapping(includeStaged)[idB];
      return parentsB?.includes(idA) ?? false;
    }
    getChildEntities(id, recursive = false, includeStaged = true) {
      const ret = [];
      const childIds = this.getChildIds(id, recursive, includeStaged);
      if (!childIds?.size) {
        return ret;
      }
      for (const childId of childIds) {
        const child = this.getEntityById(childId, false, includeStaged);
        if (child) {
          ret.push(child);
        }
      }
      return ret;
    }
    /** Direct members of a sibling scope: a container's children, or the root entities. */
    getEntitiesInScope(scope, includeStaged = true) {
      return scope ? this.getChildEntities(scope, false, includeStaged) : this.getEntities(includeStaged).filter((e) => !e.containerId);
    }
    getSiblingEntities(entityArg, includeStaged = true) {
      const entity = typeof entityArg === "string" ? this.getEntityById(entityArg, false, includeStaged) : entityArg;
      if (!entity) {
        return [];
      }
      const { containerId } = entity;
      return containerId ? this.getChildEntities(containerId, false, includeStaged).filter((e) => e.id !== entity.id) : this.getEntities(includeStaged).filter((e) => e.id !== entity.id && !e.containerId);
    }
    initiateChanges() {
      if (this.stagedChanges != null) {
        return this.stagedChanges;
      }
      this.stagedChanges = makeStagedChanges();
      this._stagedData = copyInternalData(this._data);
      return this.stagedChanges;
    }
    addEntity(entity) {
      if (!this.stagedChanges) {
        this.initiateChanges();
      }
      this.stagedChanges.additions.set(entity.id, entity);
      this._add(entity);
    }
    addConnection(connection) {
      if (!this.stagedChanges) {
        this.initiateChanges();
      }
      const staged = this._stagedData;
      if (staged.connections.find((c) => c.id === connection.id)) {
        if (true) {
          console.warn(new LayoutDuplicateError("Connection already exists", connection.id));
        }
        return;
      }
      this.stagedChanges.addedConnections.set(connection.id, connection);
      staged.connections.push(connection);
      addConnectionToMappings(connection, staged.connectionMapping);
    }
    updateEntity(entityId, changes) {
      if (!this.stagedChanges) {
        this.initiateChanges();
      }
      const { additions, updates } = this.stagedChanges;
      const existingAddition = additions.get(entityId);
      if (existingAddition) {
      } else {
        updates.set(entityId, mergeChanges(changes, updates.get(entityId)));
      }
      this._update(entityId, changes);
    }
    updateMany(entityIds, changes) {
      if (!entityIds) {
        return;
      }
      const arr = Array.isArray(entityIds) ? entityIds : Array.from(entityIds);
      for (const arg of arr) {
        const id = typeof arg === "string" ? arg : arg.id;
        this.updateEntity(id, changes);
      }
    }
    /** Wraps one or more entities in a new container. Requires all entities have the same containerId. */
    wrap(entities, container) {
      const currentContainerId = entities[0].containerId;
      if (entities.some((e) => e.containerId !== currentContainerId)) {
        throw new LayoutError("Can only wrap entities that share a container or are at root");
      }
      this.addEntity({
        // Default props for position
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        ...container,
        isContainer: true,
        containerId: currentContainerId
      });
      this.updateMany(entities, { containerId: container.id });
    }
    unwrap(containerArg) {
      const containerId = typeof containerArg === "string" ? containerArg : containerArg.id;
      const container = typeof containerArg === "string" ? this.getEntityById(containerId) : containerArg;
      if (!container) {
        throw new MissingEntityError("Container not found", containerId);
      }
      const childIds = this.getChildIds(containerId, false);
      this.removeEntity(containerId);
      this.updateMany(childIds, { containerId: container.containerId });
    }
    updateConnection(connectionId, changes) {
      if (!this.stagedChanges) {
        this.initiateChanges();
      }
      const connection = this.getConnectionById(connectionId);
      if (!connection) {
        console.warn(new MissingEntityError("Connection does not exist", connectionId));
        return;
      }
      const canMutate = connection !== this.getConnectionById(connectionId, false);
      const updates = this.stagedChanges.updatedConnections;
      updates.set(connectionId, mergeConnectionChanges(changes, updates.get(connectionId)));
      applyConnectionChanges(connection, changes, canMutate);
    }
    removeEntity(entityId) {
      if (!this.stagedChanges) {
        this.initiateChanges();
      }
      this.stagedChanges.deletes.add(entityId);
      this._remove(entityId);
    }
    removeConnection(connectionId) {
      if (!this.stagedChanges) {
        this.initiateChanges();
      }
      this.stagedChanges.deletedConnections.add(connectionId);
      this.stagedChanges.updatedConnections.delete(connectionId);
      this.stagedChanges.addedConnections.delete(connectionId);
      const staged = this._stagedData;
      removeConnectionFromMappings(connectionId, staged.connections, staged.connectionMapping);
    }
    applyStagedChanges() {
      const changes = this.stagedChanges;
      if (!changes) {
        console.warn(new LayoutError("Tried to apply staged changes but none exist."));
        this.clearStagedChanges();
        return;
      }
      if (!this._stagedData) {
        console.warn(new LayoutError("Tried to apply staged changes but no staged data exists."));
        this.clearStagedChanges();
        return;
      }
      this._data = this._stagedData;
      this.clearStagedChanges();
    }
    clearStagedChanges() {
      this.stagedChanges = void 0;
      this._stagedData = void 0;
    }
    /**
     * Snapshot the current state (staged if available, otherwise base) and return a checkpoint ID.
     * The checkpoint can later be used to restore state or fork a new LayoutManager.
     */
    checkpoint(label) {
      const id = label ?? `cp-${this._checkpointCounter++}`;
      const copy = copyInternalData(this._data, this._stagedData);
      const checkpoint = {
        entitiesById: copy.entitiesById,
        connections: copy.connections,
        containerIds: copy.containerIds,
        containerMapping: copy.containerMapping,
        parentMapping: copy.parentMapping,
        connectionMapping: copy.connectionMapping,
        dims: copy.dims,
        treeJson: copy.tree?.toJSON() ?? null,
        // Deep copy staged changes with all Maps and Sets
        stagedChanges: deepCopyStagedChanges(this.stagedChanges)
      };
      this._checkpoints.set(id, checkpoint);
      return id;
    }
    /**
     * Create a new independent LayoutManager from a checkpoint (or from current state if no ID given).
     * The fork is a completely separate instance — mutations to one do not affect the other.
     * Uses structural sharing and copies mapping for perf.
     */
    fork(checkpointId) {
      let data;
      if (checkpointId) {
        const state = this._checkpoints.get(checkpointId);
        if (!state) {
          throw new LayoutError(`Checkpoint "${checkpointId}" not found`);
        }
        data = copyInternalData(this._data, state);
      } else {
        data = copyInternalData(this._data, this._stagedData);
      }
      const fork = new _LayoutManager(
        {
          entities: data.entities,
          connections: data.connections,
          options: { ...this.options },
          primaryDirection: this.primaryDirection,
          origin: { ...this.origin }
        },
        data
      );
      fork._alignment = this.alignment.copyFor(() => fork.getEntities());
      return fork;
    }
    /**
     * Restore staged state to a previously saved checkpoint.
     * This replaces the current staged state (initiating changes if needed).
     */
    restore(checkpointId) {
      const state = this._checkpoints.get(checkpointId);
      if (!state) {
        throw new LayoutError(`Checkpoint "${checkpointId}" not found`);
      }
      this._stagedData = copyInternalData(this._data, state);
      this.stagedChanges = state.stagedChanges ? deepCopyStagedChanges(state.stagedChanges) : makeStagedChanges();
    }
    deleteCheckpoint(checkpointId) {
      return this._checkpoints.delete(checkpointId);
    }
    hasCheckpoint(checkpointId) {
      return this._checkpoints.has(checkpointId);
    }
    getEntityById(id, throwOnMissing = false, withChanges = true) {
      if (!id) {
        return void 0;
      }
      const ret = this._getData(withChanges).entitiesById[id];
      if (throwOnMissing && !ret) {
        throw new MissingEntityError("Entity not found", id);
      }
      return ret;
    }
    getEntitiesById(ids, errorOnMissing = false, withChanges = true) {
      const entities = [];
      for (const id of ids) {
        const entity = this.getEntityById(id, errorOnMissing, withChanges);
        if (entity) {
          entities.push(entity);
        }
      }
      return entities;
    }
    getEntityMapping(includeStaged = true) {
      return this._getData(includeStaged).entitiesById;
    }
    /**
     * Returns all containers, starting from parent and ending at root
     */
    getAllContainerIds(entityArg, withChanges = true) {
      const id = typeof entityArg === "string" ? entityArg : entityArg.id;
      return this.getParentMapping(withChanges)[id] || [];
    }
    getEntityDepth(entityArg, withChanges = true) {
      const id = typeof entityArg === "string" ? entityArg : entityArg.id;
      return this.getAllContainerIds(id, withChanges).length;
    }
    /**
     * Get options for an entity, using the layout manager options as defaults
     */
    getEntityOptions(entity) {
      return entity.options ? {
        ...entity.options,
        ...this.options
      } : this.options;
    }
    getEntityOption(entity, key) {
      return entity.options?.[key] ?? this.options[key];
    }
    getConnectionById(connectionId, includeStaged = true) {
      return this._getData(includeStaged).connections.find((c) => c.id === connectionId);
    }
    getConnections(includeStaged = true) {
      return this._getData(includeStaged).connections;
    }
    _ensureTree(applyToStaged = true) {
      const data = this._getData(applyToStaged);
      if (!data.tree) {
        data.tree = new LayoutTree();
        data.tree.load(data.entities.filter((entity) => !entity.isContainer));
      }
      return data.tree;
    }
    resetEntities(entities, connections) {
      this.clearStagedChanges();
      const connectionsToUse = connections ?? this._data.connections;
      this._data = this._createInitialData(entities, connectionsToUse);
    }
    resetConnections(connections) {
      this.clearStagedChanges();
      this._data = this._createInitialData(this._data.entities, connections);
    }
    _add(entity) {
      const staged = this._stagedData;
      staged.entitiesById[entity.id] = entity;
      staged.entities = Object.values(staged.entitiesById);
      if (entity.isContainer) {
        staged.containerIds.add(entity.id);
      } else if (staged.tree) {
        staged.tree.insert(entity);
      }
      addEntityToContainerMapping(staged.containerMapping, entity);
      addEntityToParentMapping(staged.parentMapping, entity, staged.entitiesById);
      this._updatedDimsForEntityAddition(entity);
    }
    _remove(entityId) {
      const staged = this._stagedData;
      const entity = staged.entitiesById[entityId];
      if (!entity) {
        return;
      }
      delete staged.entitiesById[entityId];
      staged.entities = Object.values(staged.entitiesById);
      staged.containerIds.delete(entity.id);
      if (staged.tree && !entity.isContainer) {
        staged.tree.remove(entity);
      }
      removeEntityFromContainerMapping(staged.containerMapping, entity);
      removeEntityFromParentMapping(staged.parentMapping, entity);
      this._updatedDimsForEntityRemoval(entity);
    }
    _update(entityId, update) {
      const staged = this._stagedData;
      const entity = staged.entitiesById[entityId];
      if (!entity) {
        console.warn(new MissingEntityError("Tried to update non-existent entity", entityId));
        return;
      }
      const oldContainerId = entity.containerId;
      const oldWasContainer = entity.isContainer;
      if (staged.tree && !oldWasContainer) {
        staged.tree.remove(entity);
      }
      const canMutate = entity !== this._data.entitiesById[entity.id];
      const updatedEntity = applySizeChanges(entity, update, canMutate);
      if (updatedEntity.isContainer) {
        staged.containerIds.add(updatedEntity.id);
      } else {
        staged.containerIds.delete(updatedEntity.id);
      }
      if (staged.tree && !updatedEntity.isContainer) {
        staged.tree.insert(updatedEntity);
      }
      staged.entitiesById[updatedEntity.id] = updatedEntity;
      staged.entities = Object.values(staged.entitiesById);
      const oldChildIds = staged.containerMapping[entity.id];
      updateEntityContainerMapping(
        staged.containerMapping,
        updatedEntity,
        oldContainerId,
        oldWasContainer
      );
      updateEntityParentMapping(
        staged.entitiesById,
        staged.parentMapping,
        staged.containerMapping,
        updatedEntity,
        oldContainerId,
        oldWasContainer,
        oldChildIds
      );
      this._updatedDimsForEntityAddition(updatedEntity);
      this._updatedDimsForEntityRemoval(entity);
    }
    /**
     * Calculating full dimensions is expensive if we are doing it often
     * So if a new entity is added (or updated) we can just do a fast partial check
     */
    _updatedDimsForEntityAddition(entity) {
      const staged = this._stagedData;
      if (staged?.dims) {
        const minX = Math.min(staged.dims.minX, entity.x);
        const minY = Math.min(staged.dims.minY, entity.y);
        const maxX = Math.max(staged.dims.maxX, entity.x + entity.width);
        const maxY = Math.max(staged.dims.maxY, entity.y + entity.height);
        const needsReCalc = entity.x !== staged.dims.minX || entity.y !== staged.dims.minY || entity.x + entity.width !== staged.dims.maxX || entity.y + entity.height !== staged.dims.maxY;
        if (needsReCalc) {
          staged.dims = {
            minX,
            minY,
            maxX,
            maxY,
            midX: (minX + maxX) / 2,
            midY: (minY + maxY) / 2
          };
        }
      }
    }
    /**
     * If an entity is removed, we may need to recalculate the dimensions,
     * but we only want to do that if the entity was on the boundary of the current range
     */
    _updatedDimsForEntityRemoval(entity) {
      const staged = this._stagedData;
      if (staged?.dims) {
        const needsRecalc = entity.x <= staged.dims.minX || entity.y <= staged.dims.minY || entity.x + entity.width >= staged.dims.maxX || entity.y + entity.height >= staged.dims.maxY;
        if (needsRecalc) {
          staged.dims = void 0;
        }
      }
    }
    _calcDims(includeStaged = true) {
      const data = this._getData(includeStaged);
      const baseDims = getDimensions(data.entities);
      data.dims = {
        ...baseDims,
        midX: (baseDims.minX + baseDims.maxX) / 2,
        midY: (baseDims.minY + baseDims.maxY) / 2
      };
      return data.dims;
    }
    get dims() {
      return this._data.dims || this._calcDims(false);
    }
    get stagedDims() {
      return this._stagedData?.dims || this._calcDims(true);
    }
    getDims(includeStaged) {
      if (includeStaged && this._stagedData?.dims) {
        return this._stagedData.dims;
      }
      return this._calcDims(includeStaged);
    }
    getParentMapping(includeStaged = true) {
      return this._getData(includeStaged).parentMapping;
    }
  };

  // packages/layout/src/outline.ts
  var EPSILON = 1e-9;
  function angle(from, to) {
    return Math.atan2(to.x - from.x, to.y - from.y);
  }
  function safeTan(halfAngle, r) {
    const v = r / Math.tan(halfAngle);
    return Number.isFinite(v) ? v : r;
  }
  function roundedCornerGeometry(prev, cur, next, radius) {
    const toPrev = angle(cur, prev);
    const toNext = angle(cur, next);
    const between = toNext - toPrev;
    const betweenDeg = between * (180 / Math.PI);
    const shortest = Math.min(
      Math.hypot(prev.x - cur.x, prev.y - cur.y),
      Math.hypot(next.x - cur.x, next.y - cur.y)
    );
    const maxRadius = Math.abs(shortest / 2 * Math.tan(between / 2));
    const r = Math.min(radius, maxRadius);
    let offset;
    let sweep;
    if (betweenDeg < 0 && betweenDeg >= -180 || betweenDeg > 180 && betweenDeg < 360) {
      offset = safeTan(between / 2, -r);
      sweep = 0;
    } else {
      offset = safeTan(between / 2, r);
      sweep = 1;
    }
    const start = {
      x: cur.x + Math.sin(toPrev) * offset,
      y: cur.y + Math.cos(toPrev) * offset
    };
    const end = {
      x: cur.x + Math.sin(toNext) * offset,
      y: cur.y + Math.cos(toNext) * offset
    };
    return { start, end, radius: r, betweenDeg, sweep };
  }
  function cross(ax, ay, bx, by) {
    return ax * by - ay * bx;
  }
  function sideOfChord(arc, point) {
    return cross(
      arc.chordB.x - arc.chordA.x,
      arc.chordB.y - arc.chordA.y,
      point.x - arc.chordA.x,
      point.y - arc.chordA.y
    );
  }
  function arcCenter(start, end, radius, vertex) {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const chordX = end.x - start.x;
    const chordY = end.y - start.y;
    const chordLength = Math.hypot(chordX, chordY);
    if (chordLength < EPSILON) {
      return null;
    }
    const halfChord = chordLength / 2;
    const apothem = Math.sqrt(Math.max(0, radius * radius - halfChord * halfChord));
    const normalX = -chordY / chordLength * apothem;
    const normalY = chordX / chordLength * apothem;
    const first = { x: midX + normalX, y: midY + normalY };
    const second = { x: midX - normalX, y: midY - normalY };
    const chord = { chordA: start, chordB: end };
    const vertexSide = sideOfChord(chord, vertex);
    return sideOfChord(chord, first) * vertexSide <= 0 ? first : second;
  }
  function raySegmentHit(origin, direction2, segment) {
    const edgeX = segment.b.x - segment.a.x;
    const edgeY = segment.b.y - segment.a.y;
    const denominator = cross(direction2.x, direction2.y, edgeX, edgeY);
    if (Math.abs(denominator) < EPSILON) {
      return null;
    }
    const offsetX = segment.a.x - origin.x;
    const offsetY = segment.a.y - origin.y;
    const t = cross(offsetX, offsetY, edgeX, edgeY) / denominator;
    const s = cross(offsetX, offsetY, direction2.x, direction2.y) / denominator;
    if (t < -EPSILON || s < -EPSILON || s > 1 + EPSILON) {
      return null;
    }
    return t;
  }
  function rayArcHits(origin, direction2, arc) {
    const toOriginX = origin.x - arc.center.x;
    const toOriginY = origin.y - arc.center.y;
    const a = direction2.x * direction2.x + direction2.y * direction2.y;
    const b = 2 * (direction2.x * toOriginX + direction2.y * toOriginY);
    const c = toOriginX * toOriginX + toOriginY * toOriginY - arc.radius * arc.radius;
    const discriminant = b * b - 4 * a * c;
    if (a < EPSILON || discriminant < 0) {
      return [];
    }
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const hits = [];
    for (const t of [(-b - sqrtDiscriminant) / (2 * a), (-b + sqrtDiscriminant) / (2 * a)]) {
      if (t < -EPSILON) {
        continue;
      }
      const point = { x: origin.x + direction2.x * t, y: origin.y + direction2.y * t };
      const vertexSide = sideOfChord(arc, arc.vertex);
      const pointSide = sideOfChord(arc, point);
      if (pointSide * vertexSide >= -EPSILON) {
        hits.push(t);
      }
    }
    return hits;
  }
  var PolygonOutline = class {
    constructor(vertices, cornerRadius) {
      __publicField(this, "primitives");
      this.primitives = [];
      const corners = vertices.map((cur, index) => {
        const prev = vertices[(index - 1 + vertices.length) % vertices.length];
        const next = vertices[(index + 1) % vertices.length];
        if (cornerRadius <= EPSILON) {
          return { start: cur, end: cur, radius: 0 };
        }
        const corner = roundedCornerGeometry(prev, cur, next, cornerRadius);
        const center2 = corner.radius > EPSILON ? arcCenter(corner.start, corner.end, corner.radius, cur) : null;
        if (center2) {
          this.primitives.push({
            kind: "arc",
            center: center2,
            radius: corner.radius,
            chordA: corner.start,
            chordB: corner.end,
            vertex: cur
          });
        }
        return center2 ? corner : { start: cur, end: cur, radius: 0 };
      });
      for (const [index, corner] of corners.entries()) {
        const nextCorner = corners[(index + 1) % corners.length];
        const a = corner.end;
        const b = nextCorner.start;
        if (Math.hypot(b.x - a.x, b.y - a.y) > EPSILON) {
          this.primitives.push({ kind: "segment", a, b });
        }
      }
    }
    intersectRay(origin, direction2) {
      let nearest = null;
      for (const primitive of this.primitives) {
        const hits = primitive.kind === "segment" ? [raySegmentHit(origin, direction2, primitive)].filter((t) => t !== null) : rayArcHits(origin, direction2, primitive);
        for (const t of hits) {
          if (nearest === null || t < nearest) {
            nearest = t;
          }
        }
      }
      if (nearest === null) {
        return null;
      }
      return { x: origin.x + direction2.x * nearest, y: origin.y + direction2.y * nearest };
    }
  };
  var EllipseOutline = class {
    constructor(box) {
      this.box = box;
    }
    intersectRay(origin, direction2) {
      const radiusX = this.box.width / 2;
      const radiusY = this.box.height / 2;
      if (radiusX < EPSILON || radiusY < EPSILON) {
        return null;
      }
      const centerX = this.box.x + radiusX;
      const centerY = this.box.y + radiusY;
      const originU = (origin.x - centerX) / radiusX;
      const originV = (origin.y - centerY) / radiusY;
      const directionU = direction2.x / radiusX;
      const directionV = direction2.y / radiusY;
      const a = directionU * directionU + directionV * directionV;
      const b = 2 * (originU * directionU + originV * directionV);
      const c = originU * originU + originV * originV - 1;
      const discriminant = b * b - 4 * a * c;
      if (a < EPSILON || discriminant < 0) {
        return null;
      }
      const sqrtDiscriminant = Math.sqrt(discriminant);
      const near = (-b - sqrtDiscriminant) / (2 * a);
      const far = (-b + sqrtDiscriminant) / (2 * a);
      const t = near >= -EPSILON ? near : far >= -EPSILON ? far : null;
      if (t === null) {
        return null;
      }
      return { x: origin.x + direction2.x * t, y: origin.y + direction2.y * t };
    }
  };
  function effectiveCornerRadius(descriptor, box) {
    const fromPercent = descriptor.cornerRadiusPercent !== void 0 ? descriptor.cornerRadiusPercent / 100 * Math.min(box.width, box.height) : Number.POSITIVE_INFINITY;
    const fromPx = descriptor.cornerRadius ?? Number.POSITIVE_INFINITY;
    const radius = Math.min(fromPx, fromPercent);
    return Number.isFinite(radius) ? radius : 0;
  }
  function scaleVertex(vertex, box) {
    return {
      x: box.x + vertex[0] / 100 * box.width,
      y: box.y + vertex[1] / 100 * box.height
    };
  }
  function createEntityOutline(descriptor, box) {
    if (descriptor.kind === "ellipse") {
      return new EllipseOutline(box);
    }
    if (descriptor.vertices.length < 3) {
      return null;
    }
    const vertices = descriptor.vertices.map((vertex) => scaleVertex(vertex, box));
    return new PolygonOutline(vertices, effectiveCornerRadius(descriptor, box));
  }
  var INWARD_DIRECTION = {
    left: { x: 1, y: 0 },
    right: { x: -1, y: 0 },
    up: { x: 0, y: 1 },
    down: { x: 0, y: -1 }
  };
  function clipFacePointToOutline(entity, face, point) {
    if (!entity.outline) {
      return point;
    }
    const outline = createEntityOutline(entity.outline, entity);
    return outline?.intersectRay(point, INWARD_DIRECTION[face]) ?? point;
  }

  // packages/layout/src/routing/polylineUtils.ts
  function polylineLength(points) {
    let total = 0;
    for (let index = 1; index < points.length; index += 1) {
      total += Math.hypot(
        points[index][0] - points[index - 1][0],
        points[index][1] - points[index - 1][1]
      );
    }
    return total;
  }
  function projectedHalfExtent(tangent, width, height) {
    return Math.abs(tangent[0]) * width / 2 + Math.abs(tangent[1]) * height / 2;
  }
  function effectiveLabelPerpOffset(lineOffset, perpendicularHalfExtent, gap) {
    if (lineOffset === 0) {
      return 0;
    }
    return Math.sign(lineOffset) * Math.max(Math.abs(lineOffset), perpendicularHalfExtent + gap);
  }
  function pointAtArcLengthFraction(points, fraction) {
    const clampedFraction = Math.min(1, Math.max(0, fraction));
    if (points.length < 2) {
      return { point: points[0] ?? [0, 0], tangent: [0, 0] };
    }
    const segmentLengths = [];
    let total = 0;
    for (let index = 1; index < points.length; index += 1) {
      const length2 = Math.hypot(
        points[index][0] - points[index - 1][0],
        points[index][1] - points[index - 1][1]
      );
      segmentLengths.push(length2);
      total += length2;
    }
    if (total === 0) {
      return { point: points[0], tangent: [0, 0] };
    }
    const target = clampedFraction * total;
    let distance = 0;
    for (let index = 0; index < segmentLengths.length; index += 1) {
      const length2 = segmentLengths[index];
      if (distance + length2 >= target || index === segmentLengths.length - 1) {
        const start2 = points[index];
        const end2 = points[index + 1];
        const ratio = length2 === 0 ? 0 : (target - distance) / length2;
        return {
          point: [start2[0] + (end2[0] - start2[0]) * ratio, start2[1] + (end2[1] - start2[1]) * ratio],
          tangent: length2 === 0 ? [0, 0] : [(end2[0] - start2[0]) / length2, (end2[1] - start2[1]) / length2]
        };
      }
      distance += length2;
    }
    const lastIndex = points.length - 1;
    const start = points[lastIndex - 1];
    const end = points[lastIndex];
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    return {
      point: end,
      tangent: length === 0 ? [0, 0] : [(end[0] - start[0]) / length, (end[1] - start[1]) / length]
    };
  }
  function projectPointOntoPolyline(point, points) {
    const zero = [0, 0];
    if (points.length < 2) {
      return { closest: points[0] ?? zero, fraction: 0, perp: 0, tangent: zero };
    }
    const segmentLengths = [];
    let total = 0;
    for (let index = 1; index < points.length; index += 1) {
      const length = Math.hypot(
        points[index][0] - points[index - 1][0],
        points[index][1] - points[index - 1][1]
      );
      segmentLengths.push(length);
      total += length;
    }
    let bestDistanceSquared = Infinity;
    let bestClosest = points[0];
    let bestFraction = 0;
    let bestPerpendicular = 0;
    let bestTangent = zero;
    let cumulative = 0;
    for (let index = 0; index < segmentLengths.length; index += 1) {
      const start = points[index];
      const end = points[index + 1];
      const length = segmentLengths[index];
      const deltaX = end[0] - start[0];
      const deltaY = end[1] - start[1];
      const lengthSquared = deltaX * deltaX + deltaY * deltaY;
      const ratio = lengthSquared === 0 ? 0 : Math.min(
        1,
        Math.max(
          0,
          ((point[0] - start[0]) * deltaX + (point[1] - start[1]) * deltaY) / lengthSquared
        )
      );
      const closestX = start[0] + deltaX * ratio;
      const closestY = start[1] + deltaY * ratio;
      const distanceSquared = (point[0] - closestX) ** 2 + (point[1] - closestY) ** 2;
      if (distanceSquared < bestDistanceSquared) {
        const tangent = length === 0 ? zero : [deltaX / length, deltaY / length];
        bestDistanceSquared = distanceSquared;
        bestClosest = [closestX, closestY];
        bestFraction = total === 0 ? 0 : (cumulative + length * ratio) / total;
        bestPerpendicular = (point[0] - closestX) * -tangent[1] + (point[1] - closestY) * tangent[0];
        bestTangent = tangent;
      }
      cumulative += length;
    }
    return {
      closest: bestClosest,
      fraction: bestFraction,
      perp: bestPerpendicular,
      tangent: bestTangent
    };
  }
  function simplifyCollinearPoints(points, epsilon = 0) {
    if (points.length < 3) {
      return points;
    }
    const result = [points[0]];
    for (let index = 1; index < points.length; index += 1) {
      const previous = result[result.length - 1];
      const current = points[index];
      if (Math.abs(current[0] - previous[0]) <= epsilon && Math.abs(current[1] - previous[1]) <= epsilon) {
        continue;
      }
      if (result.length >= 2) {
        const beforePrevious = result[result.length - 2];
        const vertical = Math.abs(current[0] - previous[0]) <= epsilon && Math.abs(previous[0] - beforePrevious[0]) <= epsilon;
        const horizontal = Math.abs(current[1] - previous[1]) <= epsilon && Math.abs(previous[1] - beforePrevious[1]) <= epsilon;
        if (vertical || horizontal) {
          result[result.length - 1] = current;
          continue;
        }
      }
      result.push(current);
    }
    return result;
  }

  // packages/layout/src/routing/textPlacements.ts
  var LABEL_LINE_GAP = 4;
  function isExternalTextPlacement(entity) {
    if (!entity?.textPlacement) {
      return false;
    }
    return entity.textPlacement.relativeX < 0 || entity.textPlacement.relativeX >= entity.width || entity.textPlacement.relativeY < 0 || entity.textPlacement.relativeY >= entity.height;
  }
  function makeExternalTextRange(entity) {
    return isExternalTextPlacement(entity) ? makeRangeForEntityTextPlacement(entity) : void 0;
  }
  function touchExternalTextRangeToEntity(entity) {
    const textRange = makeExternalTextRange(entity);
    if (!textRange) {
      return void 0;
    }
    const entityRange = makeRangeFromEntity(entity);
    return makePropsFromRange({
      minX: textRange.minX > entityRange.maxX ? entityRange.maxX : textRange.minX,
      minY: textRange.minY > entityRange.maxY ? entityRange.maxY : textRange.minY,
      maxX: textRange.maxX < entityRange.minX ? entityRange.minX : textRange.maxX,
      maxY: textRange.maxY < entityRange.minY ? entityRange.minY : textRange.maxY
    });
  }
  function touchExternalTextRangeToEntityClippedToBodyFace(entity) {
    const textRange = makeExternalTextRange(entity);
    if (!textRange) {
      return void 0;
    }
    const entityRange = makeRangeFromEntity(entity);
    const overlapsHorizontalFace = Math.min(textRange.maxX, entityRange.maxX) > Math.max(textRange.minX, entityRange.minX);
    if (overlapsHorizontalFace && (textRange.maxY <= entityRange.minY || textRange.minY >= entityRange.maxY)) {
      return makePropsFromRange({
        minX: Math.max(textRange.minX, entityRange.minX),
        minY: textRange.maxY <= entityRange.minY ? textRange.minY : entityRange.maxY,
        maxX: Math.min(textRange.maxX, entityRange.maxX),
        maxY: textRange.maxY <= entityRange.minY ? entityRange.minY : textRange.maxY
      });
    }
    const overlapsVerticalFace = Math.min(textRange.maxY, entityRange.maxY) > Math.max(textRange.minY, entityRange.minY);
    if (overlapsVerticalFace && (textRange.maxX <= entityRange.minX || textRange.minX >= entityRange.maxX)) {
      return makePropsFromRange({
        minX: textRange.maxX <= entityRange.minX ? textRange.minX : entityRange.maxX,
        minY: Math.max(textRange.minY, entityRange.minY),
        maxX: textRange.maxX <= entityRange.minX ? entityRange.minX : textRange.maxX,
        maxY: Math.min(textRange.maxY, entityRange.maxY)
      });
    }
    return touchExternalTextRangeToEntity(entity);
  }

  // packages/layout/src/routing/corridor/geometry.ts
  var ROUTING_EPSILON = 1e-6;
  function snapEntitiesToGrid(entities) {
    let snapped;
    for (const [entityIndex, entity] of entities.entries()) {
      if (isEntityOnGrid(entity)) {
        continue;
      }
      snapped ?? (snapped = [...entities]);
      snapped[entityIndex] = snapEntityToGrid(entity);
    }
    return snapped ?? entities;
  }
  function isEntityOnGrid(entity) {
    const title = entity.textPlacement;
    return Number.isInteger(entity.x) && Number.isInteger(entity.y) && Number.isInteger(entity.width) && Number.isInteger(entity.height) && (title === void 0 || Number.isInteger(title.relativeX) && Number.isInteger(title.relativeY) && Number.isInteger(title.width) && Number.isInteger(title.height));
  }
  function snapEntityToGrid(entity) {
    const x = Math.round(entity.x);
    const y = Math.round(entity.y);
    const snapped = {
      ...entity,
      x,
      y,
      width: Math.round(entity.x + entity.width) - x,
      height: Math.round(entity.y + entity.height) - y
    };
    const title = entity.textPlacement;
    if (title !== void 0) {
      const titleX = Math.round(entity.x + title.relativeX);
      const titleY = Math.round(entity.y + title.relativeY);
      snapped.textPlacement = {
        relativeX: titleX - x,
        relativeY: titleY - y,
        width: Math.round(entity.x + title.relativeX + title.width) - titleX,
        height: Math.round(entity.y + title.relativeY + title.height) - titleY
      };
    }
    return snapped;
  }
  function facePlane(entity, face) {
    if (face === "left") {
      return entity.x;
    }
    if (face === "right") {
      return entity.x + entity.width;
    }
    return face === "up" ? entity.y : entity.y + entity.height;
  }
  function faceCrossSpan(entity, face) {
    return face === "left" || face === "right" ? [entity.y, entity.y + entity.height] : [entity.x, entity.x + entity.width];
  }
  function terminalFacePlane(entity, face) {
    const bodyPlane = facePlane(entity, face);
    const textRange = makeExternalTextRange(entity);
    if (!textRange) {
      return bodyPlane;
    }
    const text = makePropsFromRange(textRange);
    const bodyCross = faceCrossSpan(entity, face);
    const textCross = faceCrossSpan(text, face);
    if (Math.min(bodyCross[1], textCross[1]) <= Math.max(bodyCross[0], textCross[0])) {
      return bodyPlane;
    }
    if (face === "right") {
      return Math.max(bodyPlane, text.x + text.width);
    }
    if (face === "left") {
      return Math.min(bodyPlane, text.x);
    }
    if (face === "down") {
      return Math.max(bodyPlane, text.y + text.height);
    }
    return Math.min(bodyPlane, text.y);
  }
  function faceNormalAxis(face) {
    return face === "left" || face === "right" ? "x" : "y";
  }
  function faceOrder(face) {
    return face === "up" ? 0 : face === "right" ? 1 : face === "down" ? 2 : 3;
  }
  function outwardSign(face) {
    return face === "left" || face === "up" ? -1 : 1;
  }
  function travelSpanOf(axis, rect) {
    return axis === "x" ? [rect.x, rect.x + rect.width] : [rect.y, rect.y + rect.height];
  }
  function crossSpanOf(axis, rect) {
    return axis === "x" ? [rect.y, rect.y + rect.height] : [rect.x, rect.x + rect.width];
  }
  function corridorCrossSpan(corridor) {
    return crossSpanOf(corridor.axis, corridor.rect);
  }
  function corridorTravelSpan(corridor) {
    return travelSpanOf(corridor.axis, corridor.rect);
  }
  function corridorCenter(corridor) {
    const cross2 = corridorCrossSpan(corridor);
    return midpoint(cross2);
  }
  function axisPoint(axis, travel, track) {
    return axis === "x" ? { x: travel, y: track } : { x: track, y: travel };
  }
  function segmentAxis(from, to) {
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    if (dx <= ROUTING_EPSILON === dy <= ROUTING_EPSILON) {
      return void 0;
    }
    return dx > ROUTING_EPSILON ? "x" : "y";
  }
  function samePoint(left, right, epsilon = 0) {
    return Math.abs(left.x - right.x) <= epsilon && Math.abs(left.y - right.y) <= epsilon;
  }
  function manhattan(from, to) {
    return Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
  }
  function manhattanCoords(fromX, fromY, toX, toY) {
    return Math.abs(toX - fromX) + Math.abs(toY - fromY);
  }
  function expandRect(rect, amount) {
    return {
      x: rect.x - amount,
      y: rect.y - amount,
      width: rect.width + amount * 2,
      height: rect.height + amount * 2
    };
  }
  function centeredRect(center2, size) {
    return {
      x: center2.x - size.width / 2,
      y: center2.y - size.height / 2,
      width: size.width,
      height: size.height
    };
  }
  function pointInRect(point, rect) {
    return point.x >= rect.x - ROUTING_EPSILON && point.x <= rect.x + rect.width + ROUTING_EPSILON && point.y >= rect.y - ROUTING_EPSILON && point.y <= rect.y + rect.height + ROUTING_EPSILON;
  }
  function segmentPiercesRect(from, to, rect) {
    if (Math.abs(from.x - to.x) <= ROUTING_EPSILON) {
      return inside(from.x, rect.x, rect.width) && overlapLength(Math.min(from.y, to.y), Math.abs(to.y - from.y), rect.y, rect.height) > ROUTING_EPSILON;
    }
    return inside(from.y, rect.y, rect.height) && overlapLength(Math.min(from.x, to.x), Math.abs(to.x - from.x), rect.x, rect.width) > ROUTING_EPSILON;
  }
  function rectCrossesBoundary(rect, container) {
    const vertical = overlapLength(rect.y, rect.height, container.y, container.height) > ROUTING_EPSILON;
    const horizontal = overlapLength(rect.x, rect.width, container.x, container.width) > ROUTING_EPSILON;
    return vertical && [container.x, container.x + container.width].some((x) => inside(x, rect.x, rect.width)) || horizontal && [container.y, container.y + container.height].some((y) => inside(y, rect.y, rect.height));
  }
  function rectsOverlap(left, right) {
    return overlapLength(left.x, left.width, right.x, right.width) > ROUTING_EPSILON && overlapLength(left.y, left.height, right.y, right.height) > ROUTING_EPSILON;
  }
  function overlapLength(a, aLength, b, bLength) {
    return Math.min(a + aLength, b + bLength) - Math.max(a, b);
  }
  function inside(value, start, length) {
    return value > start + ROUTING_EPSILON && value < start + length - ROUTING_EPSILON;
  }
  function orderedSpan(first, second) {
    return first <= second ? [first, second] : [second, first];
  }
  function overlapRect(left, right, epsilon) {
    const x = Math.max(left.x, right.x);
    const y = Math.max(left.y, right.y);
    const maxX = Math.min(left.x + left.width, right.x + right.width);
    const maxY = Math.min(left.y + left.height, right.y + right.height);
    return maxX - x > epsilon && maxY - y > epsilon ? { x, y, width: maxX - x, height: maxY - y } : void 0;
  }
  function compareNumber(left, right, epsilon = 0) {
    return Math.abs(left - right) <= epsilon ? 0 : left - right;
  }
  function boundaryTravelCoordinate(world, corridor, boundary) {
    if (boundary.kind === "terminal") {
      const attachment = world.indexer.attachments[boundary.attachmentIndex];
      return terminalFacePlane(world.entities[attachment.entityIndex], attachment.face);
    }
    const portal = world.indexer.portals[boundary.portalIndex];
    if (portal.kind === "continue") {
      return portal.planeCoordinate;
    }
    return corridor.axis === "x" ? portal.rect.x + portal.rect.width / 2 : portal.rect.y + portal.rect.height / 2;
  }
  function possibleTravelInterval(world, corridor, route, visitIndex, desiredTracks) {
    const visit = route.visits[visitIndex];
    const entrySpan = boundaryTravelInterval(
      world,
      corridor,
      visit.entry,
      route,
      visitIndex,
      desiredTracks,
      "entry"
    );
    const exitSpan = boundaryTravelInterval(
      world,
      corridor,
      visit.exit,
      route,
      visitIndex,
      desiredTracks,
      "exit"
    );
    return [Math.min(entrySpan[0], exitSpan[0]), Math.max(entrySpan[1], exitSpan[1])];
  }
  function boundaryTravelInterval(world, corridor, boundary, route, visitIndex, desiredTracks, side) {
    if (boundary.kind === "portal") {
      const portal = world.indexer.portals[boundary.portalIndex];
      if (portal.kind === "continue") {
        const plane = boundaryTravelCoordinate(world, corridor, boundary);
        return [plane, plane];
      }
      const portalTravel = corridor.axis === "x" ? [portal.rect.x, portal.rect.x + portal.rect.width] : [portal.rect.y, portal.rect.y + portal.rect.height];
      const adjacentVisitIndex = side === "entry" ? visitIndex - 1 : visitIndex + 1;
      if (adjacentVisitIndex < 0 || adjacentVisitIndex >= route.visits.length) {
        throw new Error(`route ${route.requestIndex}: turn has no adjacent visit`);
      }
      const travel2 = clamp(desiredTracks[adjacentVisitIndex], portalTravel[0], portalTravel[1]);
      return [travel2, travel2];
    }
    const travel = boundaryTravelCoordinate(world, corridor, boundary);
    return [travel, travel];
  }
  function endpointPoint(entities, endpoint, track = endpointTrackCoordinate(entities[endpoint.entityIndex], endpoint)) {
    const entity = entities[endpoint.entityIndex];
    const plane = facePlane(entity, endpoint.face);
    return endpoint.face === "left" || endpoint.face === "right" ? { x: plane, y: track } : { x: track, y: plane };
  }
  function endpointCrossCoordinate(entities, endpoint, referenceFace) {
    const entity = entities[endpoint.entityIndex];
    const endpointPlane = terminalFacePlane(entity, endpoint.face);
    const endpointTrack2 = endpointTrackCoordinate(entity, endpoint);
    if (referenceFace === "left" || referenceFace === "right") {
      return endpoint.face === "left" || endpoint.face === "right" ? endpointTrack2 : endpointPlane;
    }
    return endpoint.face === "left" || endpoint.face === "right" ? endpointPlane : endpointTrack2;
  }
  function endpointTrackCoordinate(entity, endpoint) {
    if (endpoint.authoredTrack !== void 0) {
      return endpoint.authoredTrack;
    }
    return endpoint.face === "left" || endpoint.face === "right" ? entity.y + entity.height / 2 : entity.x + entity.width / 2;
  }

  // packages/layout/src/routing/measure/geometry.ts
  var EPS = 0.01;
  function overlapLength2(a, b) {
    return Math.min(a[1], b[1]) - Math.max(a[0], b[0]);
  }
  function spansOverlap(a, b, epsilon = EPS) {
    return overlapLength2(a, b) > epsilon;
  }

  // packages/layout/src/routing/faces.ts
  function detectExitFace(entity, opposite, isHorizontal2, crossAxisThreshold = 1) {
    const dx = opposite.x + opposite.width / 2 - (entity.x + entity.width / 2);
    const dy = opposite.y + opposite.height / 2 - (entity.y + entity.height / 2);
    if (isHorizontal2) {
      if (Math.abs(dy) > Math.abs(dx) * crossAxisThreshold) {
        return dy >= 0 ? "down" : "up";
      }
      return dx >= 0 ? "right" : "left";
    }
    if (Math.abs(dx) > Math.abs(dy) * crossAxisThreshold) {
      return dx >= 0 ? "right" : "left";
    }
    return dy >= 0 ? "down" : "up";
  }
  function detectEnterFace(entity, source, isHorizontal2, crossAxisThreshold = 1) {
    return OPPOSITE_DIRECTION[detectExitFace(source, entity, isHorizontal2, crossAxisThreshold)];
  }
  function entityCenter(entity) {
    return {
      x: midpoint(travelSpanOf("x", entity)),
      y: midpoint(travelSpanOf("y", entity))
    };
  }
  function verticalFaces(from, to) {
    return midpoint(travelSpanOf("y", to)) >= midpoint(travelSpanOf("y", from)) ? { from: "down", to: "up" } : { from: "up", to: "down" };
  }
  function horizontalFaces(from, to) {
    return midpoint(travelSpanOf("x", to)) >= midpoint(travelSpanOf("x", from)) ? { from: "right", to: "left" } : { from: "left", to: "right" };
  }
  function aspectFaces(from, to, verticalPrimary) {
    return verticalPrimary ? verticalFaces(from, to) : horizontalFaces(from, to);
  }
  function dominantDirectionFace(dx, dy, verticalPrimary) {
    if (Math.abs(dy) > Math.abs(dx)) {
      return dy >= 0 ? "down" : "up";
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx >= 0 ? "right" : "left";
    }
    return verticalPrimary ? dy >= 0 ? "down" : "up" : dx >= 0 ? "right" : "left";
  }
  function sourceFanMembers(request, requestsBySource) {
    const members = requestsBySource.get(request.from) ?? [];
    return members.length >= 2 ? members : [];
  }
  function familyFaceForRequest(request, requestsBySource, layoutManager, verticalPrimary) {
    const members = sourceFanMembers(request, requestsBySource);
    if (members.length === 0) {
      return void 0;
    }
    const source = layoutManager.getEntityById(request.from);
    if (!source) {
      return void 0;
    }
    const sourceCenter = entityCenter(source);
    const deltas = [];
    for (const member of members) {
      const target = layoutManager.getEntityById(member.to);
      if (!target) {
        continue;
      }
      const targetCenter = entityCenter(target);
      deltas.push({ dx: targetCenter.x - sourceCenter.x, dy: targetCenter.y - sourceCenter.y });
    }
    if (deltas.length < 2) {
      return void 0;
    }
    const dx = deltas.reduce((sum, d) => sum + d.dx, 0) / deltas.length;
    const dy = deltas.reduce((sum, d) => sum + d.dy, 0) / deltas.length;
    const face = dominantDirectionFace(dx, dy, verticalPrimary);
    const coherent = deltas.every((d) => {
      if (face === "down") {
        return d.dy > 0;
      }
      if (face === "up") {
        return d.dy < 0;
      }
      if (face === "right") {
        return d.dx > 0;
      }
      return d.dx < 0;
    });
    return coherent ? face : void 0;
  }
  function unpinnedRule(request, requestsBySource, layoutManager, verticalPrimary) {
    const from = layoutManager.getEntityById(request.from);
    const to = layoutManager.getEntityById(request.to);
    if (!from || !to) {
      return {
        faces: { from: "right", to: "left" },
        reason: "aspect"
      };
    }
    const xOverlap = spansOverlap(travelSpanOf("x", from), travelSpanOf("x", to));
    const yOverlap = spansOverlap(travelSpanOf("y", from), travelSpanOf("y", to));
    const strictAxisFaces = xOverlap && !yOverlap ? verticalFaces(from, to) : horizontalFaces(from, to);
    const aspect = aspectFaces(from, to, verticalPrimary);
    const familyFace = !xOverlap && !yOverlap ? familyFaceForRequest(request, requestsBySource, layoutManager, verticalPrimary) : void 0;
    const familyFaces = familyFace ? { from: familyFace, to: OPPOSITE_DIRECTION[familyFace] } : void 0;
    if (xOverlap !== yOverlap) {
      return { faces: strictAxisFaces, reason: "strict-axis" };
    }
    if (familyFaces) {
      return { faces: familyFaces, reason: "family" };
    }
    return { faces: aspect, reason: "aspect" };
  }
  function applySiblingFaceConsensus(assignments, requests, layoutManager, verticalPrimary) {
    const establishedSiblingKeys = /* @__PURE__ */ new Set();
    assignments.forEach((assignment, requestIndex) => {
      const request = requests[requestIndex];
      const from = layoutManager.getEntityById(request.from);
      const to = layoutManager.getEntityById(request.to);
      if (!from || !to) {
        return;
      }
      if (assignment.reasons.from !== "aspect") {
        establishedSiblingKeys.add(siblingKey(request.from, assignment.from, to, assignment.to));
      }
      if (assignment.reasons.to !== "aspect") {
        establishedSiblingKeys.add(siblingKey(request.to, assignment.to, from, assignment.from));
      }
    });
    return assignments.map((assignment, requestIndex) => {
      if (assignment.reasons.from !== "aspect" || assignment.reasons.to !== "aspect") {
        return assignment;
      }
      const request = requests[requestIndex];
      const from = layoutManager.getEntityById(request.from);
      const to = layoutManager.getEntityById(request.to);
      if (!from || !to || request.from === request.to) {
        return assignment;
      }
      if ((from.containerId ?? null) === (to.containerId ?? null)) {
        return assignment;
      }
      const fromCenter = entityCenter(from);
      const toCenter = entityCenter(to);
      const fromFace = dominantDirectionFace(
        toCenter.x - fromCenter.x,
        toCenter.y - fromCenter.y,
        verticalPrimary
      );
      const toFace = OPPOSITE_DIRECTION[fromFace];
      const supportedAtEitherEnd = establishedSiblingKeys.has(siblingKey(request.from, fromFace, to, toFace)) || establishedSiblingKeys.has(siblingKey(request.to, toFace, from, fromFace));
      if (!supportedAtEitherEnd) {
        return assignment;
      }
      if (assignment.from === fromFace && assignment.to === toFace) {
        return assignment;
      }
      return {
        ...assignment,
        from: fromFace,
        to: toFace,
        reasons: { from: "sibling", to: "sibling" }
      };
    });
  }
  function siblingKey(sharedEntityId, sharedFace, oppositeEntity, oppositeFace) {
    return `${sharedEntityId}:${sharedFace}:${facePlane(oppositeEntity, oppositeFace)}`;
  }
  function assignFaces(layoutManager, requests, connections) {
    const { minX, maxX, minY, maxY } = layoutManager.getDims();
    const verticalPrimary = maxY - minY > maxX - minX;
    const connectionsById = new Map(connections.map((connection) => [connection.id, connection]));
    const assignments = [];
    const requestsBySource = /* @__PURE__ */ new Map();
    for (const request of requests) {
      const list = requestsBySource.get(request.from);
      if (list) {
        list.push(request);
      } else {
        requestsBySource.set(request.from, [request]);
      }
    }
    for (const request of requests) {
      const connection = connectionsById.get(request.connId);
      const pinned = { from: request.faces?.from, to: request.faces?.to };
      const authored = { from: connection?.authoredFromFace, to: connection?.authoredToFace };
      const rule = unpinnedRule(request, requestsBySource, layoutManager, verticalPrimary);
      const from = pinned.from ?? authored.from ?? rule.faces.from;
      const to = pinned.to ?? authored.to ?? rule.faces.to;
      const reasons = {
        from: pinned.from || authored.from ? "authored" : rule.reason,
        to: pinned.to || authored.to ? "authored" : rule.reason
      };
      const assignment = {
        connId: request.connId,
        from,
        to,
        reasons
      };
      assignments.push(assignment);
    }
    return applySiblingFaceConsensus(assignments, requests, layoutManager, verticalPrimary);
  }

  // packages/layout/src/portUtils.ts
  function getPortAsPoint(entity, direction2, includeTextPlacement = true) {
    if (entity.customPorts?.[direction2]) {
      return entity.customPorts[direction2];
    }
    const textPlacement = includeTextPlacement ? entity.textPlacement : void 0;
    switch (direction2) {
      case "up": {
        const textIsUp = textPlacement && textPlacement.relativeY + textPlacement.height <= 0;
        const minY = textIsUp ? entity.y + textPlacement.relativeY : entity.y;
        return [Math.round(entity.x + entity.width / 2), Math.floor(minY)];
      }
      case "down": {
        const textIsDown = textPlacement && textPlacement.relativeY >= entity.height;
        const maxY = textIsDown ? entity.y + textPlacement.relativeY + textPlacement.height : entity.y + entity.height;
        return [Math.round(entity.x + entity.width / 2), Math.ceil(maxY)];
      }
      case "left": {
        const textIsLeft = textPlacement && textPlacement.relativeX + textPlacement.width <= 0;
        const minX = textIsLeft ? entity.x + textPlacement.relativeX : entity.x;
        return [Math.floor(minX), Math.round(entity.y + entity.height / 2)];
      }
      case "right": {
        const textIsRight = textPlacement && textPlacement.relativeX >= entity.width;
        const maxX = textIsRight ? entity.x + textPlacement.relativeX + textPlacement.width : entity.x + entity.width;
        return [Math.ceil(maxX), Math.round(entity.y + entity.height / 2)];
      }
    }
  }
  function getRelativePort(entity, point, targetDirection) {
    const relativeX = clamp((point[0] - entity.x) / entity.width, 0, 1);
    const relativeY = clamp((point[1] - entity.y) / entity.height, 0, 1);
    switch (targetDirection) {
      case "up":
        return [relativeX, 0];
      case "down":
        return [relativeX, 1];
      case "left":
        return [0, relativeY];
      case "right":
        return [1, relativeY];
    }
    const xBorder = relativeX < 0.5 ? 0 : 1;
    const yBorder = relativeY < 0.5 ? 0 : 1;
    if (Math.abs(relativeX - xBorder) <= Math.abs(relativeY - yBorder)) {
      return [xBorder, Number(relativeY.toFixed(2))];
    }
    return [Number(relativeX.toFixed(2)), yBorder];
  }
  function getRelativePortCoord(entity, relativePort, direction2) {
    if (!relativePort) {
      return void 0;
    }
    return direction2 === "up" || direction2 === "down" ? entity.x + relativePort[0] * entity.width : entity.y + relativePort[1] * entity.height;
  }
  function getAbsolutePortPoint(entity, relativePortPoint) {
    return [
      Math.floor(entity.x + entity.width * relativePortPoint[0]),
      Math.floor(entity.y + entity.height * relativePortPoint[1])
    ];
  }

  // packages/layout/src/routing/fallbackConnection.ts
  var FALLBACK_DETOUR_SIZE = 20;
  function makeRoughFallbackConnectionChange(layoutManager, connection, options = {}) {
    const entitiesById = layoutManager.getEntitiesMapping();
    const fromEntity = connection.from ? entitiesById[connection.from] : void 0;
    const toEntity = connection.to ? entitiesById[connection.to] : void 0;
    const stored = storedAbsolutePoints(connection);
    const fromFace = resolveFromFace(layoutManager, connection, fromEntity, toEntity, options);
    const toFace = resolveToFace(layoutManager, connection, fromEntity, toEntity, options);
    const faceStart = entityFacePoint(fromEntity, fromFace);
    const faceEnd = entityFacePoint(toEntity, toFace);
    const start = finitePointOrUndefined(options.startPoint) ?? relativeEndpointPoint(fromEntity, connection.relativeFromPort) ?? faceStart ?? stored[0] ?? [0, 0];
    const end = finitePointOrUndefined(options.endPoint) ?? relativeEndpointPoint(toEntity, connection.relativeToPort) ?? faceEnd ?? stored.at(-1) ?? [start[0] + 10, start[1]];
    const absolutePoints = makeRoughFallbackPoints(start, end, fromFace, toFace);
    if (fromEntity && start === faceStart) {
      const clipped = clipFacePointToOutline(fromEntity, fromFace, { x: start[0], y: start[1] });
      absolutePoints[0] = [clipped.x, clipped.y];
    }
    if (toEntity && end === faceEnd) {
      const clipped = clipFacePointToOutline(toEntity, toFace, { x: end[0], y: end[1] });
      absolutePoints[absolutePoints.length - 1] = [clipped.x, clipped.y];
    }
    return {
      ...absolutePointsChange(absolutePoints),
      relativeFromPort: fromEntity ? connection.relativeFromPort ?? getRelativePort(fromEntity, start, fromFace) : void 0,
      relativeToPort: toEntity ? connection.relativeToPort ?? getRelativePort(toEntity, end, toFace) : void 0
    };
  }
  function makeRoughFallbackPoints(start, end, fromFace, toFace) {
    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];
    let absolutePoints;
    if (deltaX !== 0 && deltaY !== 0) {
      const fromHorizontal = isHorizontal(fromFace);
      if (fromHorizontal === isHorizontal(toFace)) {
        const midX = Math.round((start[0] + end[0]) / 2);
        const midY = Math.round((start[1] + end[1]) / 2);
        absolutePoints = fromHorizontal ? [start, [midX, start[1]], [midX, end[1]], end] : [start, [start[0], midY], [end[0], midY], end];
      } else {
        const bend = fromHorizontal ? [end[0], start[1]] : [start[0], end[1]];
        absolutePoints = [start, bend, end];
      }
    } else if (deltaX !== 0 || deltaY !== 0) {
      absolutePoints = [start, end];
    } else {
      const fromOffset = directionOffset(fromFace);
      const toOffset = directionOffset(toFace);
      const first = [start[0] + fromOffset[0], start[1] + fromOffset[1]];
      const last = [end[0] + toOffset[0], end[1] + toOffset[1]];
      if (first[0] === last[0] || first[1] === last[1]) {
        const detour = first[1] === last[1] ? [first[0], first[1] + FALLBACK_DETOUR_SIZE] : [first[0] + FALLBACK_DETOUR_SIZE, first[1]];
        const beforeLast = first[1] === last[1] ? [last[0], detour[1]] : [detour[0], last[1]];
        absolutePoints = [start, first, detour, beforeLast, last, end];
      } else {
        absolutePoints = [start, first, [first[0], last[1]], last, end];
      }
    }
    return absolutePoints.filter(
      (point, index) => index === 0 || point[0] !== absolutePoints[index - 1][0] || point[1] !== absolutePoints[index - 1][1]
    );
  }
  function resolveFromFace(layoutManager, connection, fromEntity, toEntity, options) {
    return options.fromFace ?? legacyDirectionToDirection(connection.authoredFromFace) ?? faceFromRelativePort(connection.relativeFromPort) ?? (fromEntity && toEntity ? detectExitFace(fromEntity, toEntity, isHorizontal(layoutManager)) : layoutManager.primaryDirection);
  }
  function resolveToFace(layoutManager, connection, fromEntity, toEntity, options) {
    return options.toFace ?? legacyDirectionToDirection(connection.authoredToFace) ?? faceFromRelativePort(connection.relativeToPort) ?? (fromEntity && toEntity ? detectEnterFace(toEntity, fromEntity, isHorizontal(layoutManager)) : OPPOSITE_DIRECTION[layoutManager.primaryDirection]);
  }
  function directionOffset(direction2) {
    switch (direction2) {
      case "up":
        return [0, -FALLBACK_DETOUR_SIZE];
      case "down":
        return [0, FALLBACK_DETOUR_SIZE];
      case "left":
        return [-FALLBACK_DETOUR_SIZE, 0];
      case "right":
        return [FALLBACK_DETOUR_SIZE, 0];
    }
  }
  function faceFromRelativePort(port) {
    if (!port) {
      return void 0;
    }
    const [x, y] = port;
    const distances = [
      ["up", y],
      ["down", 1 - y],
      ["left", x],
      ["right", 1 - x]
    ];
    return distances.reduce((best, candidate) => candidate[1] < best[1] ? candidate : best)[0];
  }
  function entityFacePoint(entity, face) {
    return entity ? getPortAsPoint(entity, face, false) : void 0;
  }
  function relativeEndpointPoint(entity, port) {
    if (!entity || !port) {
      return void 0;
    }
    return finitePointOrUndefined(getAbsolutePortPoint(entity, port));
  }
  function storedAbsolutePoints(connection) {
    if (!connection.points || !Number.isFinite(connection.x) || !Number.isFinite(connection.y)) {
      return [];
    }
    return connection.points.map(([x, y]) => [connection.x + x, connection.y + y]).filter((point) => finitePointOrUndefined(point) !== void 0);
  }
  function absolutePointsChange(absolutePoints) {
    const start = absolutePoints[0] ?? [0, 0];
    return {
      x: start[0],
      y: start[1],
      points: absolutePoints.map(([x, y]) => [x - start[0], y - start[1]])
    };
  }
  function finitePointOrUndefined(point) {
    return point && Number.isFinite(point[0]) && Number.isFinite(point[1]) ? point : void 0;
  }

  // packages/layout/src/routing/corridor/continuations.ts
  function continuationKey(routeIndex, afterVisitIndex) {
    return `${routeIndex}:${afterVisitIndex}`;
  }
  function continuationKeySet(refs) {
    return new Set(refs.map((ref) => continuationKey(ref.routeIndex, ref.afterVisitIndex)));
  }
  function dedupeContinuations(continuations) {
    const unique = new Map(
      continuations.map(
        (continuation) => [
          continuationKey(continuation.routeIndex, continuation.afterVisitIndex),
          continuation
        ]
      )
    );
    return [...unique.values()].sort(
      (left, right) => left.routeIndex - right.routeIndex || left.afterVisitIndex - right.afterVisitIndex
    );
  }

  // packages/layout/src/routing/corridor/qualityCost.ts
  var ROUTING_QUALITY_COSTS = {
    crossing: 225,
    nearFaceTurn: 200,
    backtrackPer24Px: 200,
    portCentering: 175,
    symmetry: 125,
    tinyKink: 100,
    spacingDeficitPer24Px: 100,
    wallHugPer24Px: 50,
    firstOrdinaryBend: 48,
    additionalOrdinaryBend: 24,
    pathPerPx: 1,
    invalidGeometry: 1,
    lineMerge: 1,
    wallTouch: 1,
    terminalDirection: 1
  };
  function ordinaryBendCost(bendCount) {
    return bendCount <= 0 ? 0 : ROUTING_QUALITY_COSTS.firstOrdinaryBend + (bendCount - 1) * ROUTING_QUALITY_COSTS.additionalOrdinaryBend;
  }
  var QUALITY_TIER_BY_KIND = {
    backtrack: "scalar",
    crossing: "scalar",
    "face-fan-symmetry": "scalar",
    "line-merge": "cap",
    "missing-spacing-contention": "invalid",
    "near-face-turn": "scalar",
    "port-centering": "scalar",
    "sibling-symmetry": "scalar",
    "spacing-deficit": "scalar",
    "terminal-direction": "cap",
    "tiny-kink": "scalar",
    "wall-hug": "scalar",
    "wall-touch": "cap"
  };
  var ZERO_COST = { invalid: 0, cap: 0, scalar: 0 };
  var SPACING_DESIRE_COST_PER_OBJECTIVE_UNIT = 1e-3;
  var RoutingQualityLedger = class {
    constructor() {
      __publicField(this, "sources", /* @__PURE__ */ new Map());
    }
    replaceSource(source, stage, events, scalarCosts) {
      for (const event of events) {
        assertEvent(event);
      }
      if (events.length === 0 && scalarCostTotal(scalarCosts) === 0) {
        this.sources.delete(source);
        return;
      }
      this.sources.set(source, {
        stage,
        events: [...events],
        ...scalarCosts ? { scalarCosts: { ...scalarCosts } } : {}
      });
    }
    removeStage(stage) {
      for (const [source, value] of this.sources) {
        if (value.stage === stage) {
          this.sources.delete(source);
        }
      }
    }
    snapshot() {
      const sources = [];
      const events = [];
      let ordinaryBends = 0;
      let pathLength = 0;
      let spacingDesire = 0;
      let invalid = 0;
      let cap = 0;
      let scalar = 0;
      for (const [sourceName, source] of this.sources) {
        const sourceEvents = [];
        for (const event of source.events) {
          events.push(event);
          sourceEvents.push(event);
          const tier = routingQualityTier(event.kind);
          if (tier === "invalid") {
            invalid += event.cost;
          } else if (tier === "cap") {
            cap += event.cost;
          } else {
            scalar += event.cost;
          }
        }
        const sourceScalarCosts = source.scalarCosts;
        ordinaryBends += sourceScalarCosts?.ordinaryBends ?? 0;
        pathLength += sourceScalarCosts?.pathLength ?? 0;
        spacingDesire += sourceScalarCosts?.spacingDesire ?? 0;
        if (sourceEvents.length > 0 || scalarCostTotal(sourceScalarCosts) > 0) {
          sources.push({
            source: sourceName,
            stage: source.stage,
            events: sourceEvents,
            ...sourceScalarCosts ? { scalarCosts: sourceScalarCosts } : {}
          });
        }
      }
      const scalarCosts = { ordinaryBends, pathLength, spacingDesire };
      scalar += scalarCostTotal(scalarCosts);
      return {
        sources,
        events,
        scalarCosts,
        cost: events.length === 0 && scalar === 0 ? ZERO_COST : { invalid, cap, scalar }
      };
    }
  };
  function routingQualityCost(events, scalarCosts) {
    if (events.length === 0 && scalarCostTotal(scalarCosts) === 0) {
      return ZERO_COST;
    }
    let invalid = 0;
    let cap = 0;
    let scalar = scalarCostTotal(scalarCosts);
    for (const event of events) {
      const tier = routingQualityTier(event.kind);
      if (tier === "invalid") {
        invalid += event.cost;
      } else if (tier === "cap") {
        cap += event.cost;
      } else {
        scalar += event.cost;
      }
    }
    return { invalid, cap, scalar };
  }
  function routingQualityTier(kind) {
    return QUALITY_TIER_BY_KIND[kind];
  }
  function scalarCostTotal(costs) {
    return (costs?.ordinaryBends ?? 0) + (costs?.pathLength ?? 0) + (costs?.spacingDesire ?? 0) * SPACING_DESIRE_COST_PER_OBJECTIVE_UNIT;
  }
  function compareRoutingQualityCosts(candidate, incumbent) {
    return candidate.invalid - incumbent.invalid || candidate.cap - incumbent.cap || candidate.scalar - incumbent.scalar;
  }
  function qualityEventCount(events, kind) {
    let count = 0;
    for (const event of events) {
      if (event.kind === kind) {
        count += 1;
      }
    }
    return count;
  }
  function spacingDeficitCost(requiredGap, achievedGap, sharedTravelLength) {
    if (requiredGap <= 0 || sharedTravelLength <= 0) {
      return 0;
    }
    const deficitRatio = Math.max(0, (requiredGap - Math.max(0, achievedGap)) / requiredGap);
    return ROUTING_QUALITY_COSTS.spacingDeficitPer24Px * (sharedTravelLength / 24) * deficitRatio * deficitRatio;
  }
  function wallHugCost(distance, overlap, clearance) {
    if (distance < 0 || overlap <= 0 || clearance <= 0 || distance >= clearance) {
      return 0;
    }
    const pressure = (clearance - distance) / clearance;
    return ROUTING_QUALITY_COSTS.wallHugPer24Px * (overlap / 24) * pressure * pressure;
  }
  function nearFaceTurnCost(penalty) {
    return ROUTING_QUALITY_COSTS.nearFaceTurn * Math.max(0, penalty);
  }
  var BACKTRACK_OVERLAP_FLOOR_PX = 24;
  var BACKTRACK_FREE_SEPARATION_PX = 72;
  function backtrackCost(overlap, separation) {
    if (separation >= BACKTRACK_FREE_SEPARATION_PX) {
      return 0;
    }
    const chargeable = overlap - Math.max(separation, BACKTRACK_OVERLAP_FLOOR_PX);
    return chargeable <= 0 ? 0 : ROUTING_QUALITY_COSTS.backtrackPer24Px * (chargeable / 24);
  }
  function assertEvent(event) {
    if (!Number.isFinite(event.cost) || event.cost < 0) {
      throw new Error(`routing quality: ${event.kind} has invalid cost ${event.cost}`);
    }
  }

  // packages/layout/src/routing/corridor/wallQuality.ts
  var EPSILON2 = 1e-6;
  var WALL_HUG_CLEARANCE_PX = 24;
  var WALL_HUG_OVERLAP_TOLERANCE_PX = 1;
  var NEAR_FACE_SPAN_SLACK_PX = 2;
  var TERMINAL_STUB_IDEAL_PX = 24;
  function collectWallQualityEvents(world, routes) {
    const wallHugs = [];
    const nearFaceTurns = [];
    const wallTouches = [];
    const seenHugs = /* @__PURE__ */ new Set();
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      if (route.visits.length === 0) {
        continue;
      }
      const points = route.points();
      collectRouteWallHugs(world, route, routeIndex, points, seenHugs, wallHugs);
      collectRouteTerminalStubs(world, route, routeIndex, points, nearFaceTurns);
      collectRouteWallTouches(world, route, routeIndex, points, wallTouches);
    }
    return [...wallTouches, ...nearFaceTurns, ...wallHugs];
  }
  function collectRouteTerminalStubs(world, route, routeIndex, points, events) {
    if (points.length < 3) {
      return;
    }
    collectTerminalStub(world, route, routeIndex, points, "from", events);
    collectTerminalStub(world, route, routeIndex, points, "to", events);
  }
  function collectTerminalStub(world, route, routeIndex, points, endpointSide, events) {
    const stub = terminalStub(points, endpointSide);
    if (!stub) {
      return;
    }
    const { bendPointIndex, distance } = stub;
    const achievable = freeDepthAhead(world, route, points, endpointSide, bendPointIndex);
    const effectiveIdeal = Math.min(TERMINAL_STUB_IDEAL_PX, achievable);
    const penalty = anchorCurve(distance, effectiveIdeal);
    if (penalty <= 0) {
      return;
    }
    const visits = bendVisits(route, routeIndex, bendPointIndex);
    events.push({
      kind: "near-face-turn",
      cost: nearFaceTurnCost(penalty),
      routeIndexes: [routeIndex],
      corridorIndexes: corridorIndexesForVisits(route, visits),
      visits
    });
  }
  var STUB_DEPTH_WINDOW_PX = 12;
  function freeDepthAhead(world, route, points, endpointSide, bendPointIndex) {
    const endpoint = route[endpointSide];
    const port = endpointSide === "from" ? points[0] : points[points.length - 1];
    const bend = points[bendPointIndex];
    const stubAxis = segmentAxis2(port, bend);
    const planeCoordinate = stubAxis === "x" ? port.x : port.y;
    const bendCoordinate = stubAxis === "x" ? bend.x : bend.y;
    const outward = Math.sign(bendCoordinate - planeCoordinate) || 1;
    const crossCoordinate = stubAxis === "x" ? port.y : port.x;
    let depth = Number.POSITIVE_INFINITY;
    for (let entityIndex = 0; entityIndex < world.entities.length; entityIndex += 1) {
      if (entityIndex === endpoint.entityIndex) {
        continue;
      }
      const entity = world.entities[entityIndex];
      const [travelStart, travelEnd] = stubAxis === "x" ? [entity.x, entity.x + entity.width] : [entity.y, entity.y + entity.height];
      const [crossStart, crossEnd] = stubAxis === "x" ? [entity.y, entity.y + entity.height] : [entity.x, entity.x + entity.width];
      if (crossEnd < crossCoordinate - STUB_DEPTH_WINDOW_PX || crossStart > crossCoordinate + STUB_DEPTH_WINDOW_PX) {
        continue;
      }
      if (entity.isContainer === true && crossStart <= crossCoordinate && crossCoordinate <= crossEnd && travelStart <= planeCoordinate && planeCoordinate <= travelEnd) {
        continue;
      }
      const ahead = outward > 0 ? travelStart - planeCoordinate : planeCoordinate - travelEnd;
      if (ahead >= -EPSILON2 && ahead < depth) {
        depth = ahead;
      }
    }
    return Math.max(0, depth);
  }
  function terminalStub(points, endpointSide) {
    if (endpointSide === "from") {
      const axis2 = segmentAxis2(points[0], points[1]);
      let bendPointIndex2 = 1;
      while (bendPointIndex2 + 1 < points.length && segmentAxis2(points[bendPointIndex2], points[bendPointIndex2 + 1]) === axis2) {
        bendPointIndex2 += 1;
      }
      return bendPointIndex2 + 1 < points.length ? { bendPointIndex: bendPointIndex2, distance: manhattan(points[0], points[bendPointIndex2]) } : void 0;
    }
    const lastPointIndex = points.length - 1;
    const axis = segmentAxis2(points[lastPointIndex - 1], points[lastPointIndex]);
    let bendPointIndex = lastPointIndex - 1;
    while (bendPointIndex - 1 >= 0 && segmentAxis2(points[bendPointIndex - 1], points[bendPointIndex]) === axis) {
      bendPointIndex -= 1;
    }
    return bendPointIndex - 1 >= 0 ? { bendPointIndex, distance: manhattan(points[bendPointIndex], points[lastPointIndex]) } : void 0;
  }
  function collectRouteWallHugs(world, route, routeIndex, points, seen, events) {
    const ownFrom = route.from.entityIndex;
    const ownTo = route.to.entityIndex;
    for (let segmentIndex = 0; segmentIndex + 1 < points.length; segmentIndex += 1) {
      const from = points[segmentIndex];
      const to = points[segmentIndex + 1];
      const axis = segmentAxis2(from, to);
      const visitIndex = route.segmentVisitOf(segmentIndex);
      const corridorIndex = route.visits[visitIndex].corridorIndex;
      const lane = axis === "x" ? from.y : from.x;
      const travelStart = axis === "x" ? Math.min(from.x, to.x) : Math.min(from.y, to.y);
      const travelEnd = axis === "x" ? Math.max(from.x, to.x) : Math.max(from.y, to.y);
      const wallNormal = axis === "x" ? "y" : "x";
      for (const face of world.indexer.wallFacesForCorridor(corridorIndex)) {
        if (face.normalAxis !== wallNormal) {
          continue;
        }
        const distance = Math.abs(lane - face.coordinate);
        if (distance >= WALL_HUG_CLEARANCE_PX - EPSILON2) {
          continue;
        }
        const entityIndex = face.entityIndex;
        if (entityIndex === ownFrom || entityIndex === ownTo) {
          continue;
        }
        const overlapStart = Math.max(travelStart, face.span[0]);
        const overlapEnd = Math.min(travelEnd, face.span[1]);
        const overlap = overlapEnd - overlapStart;
        if (overlap <= WALL_HUG_OVERLAP_TOLERANCE_PX) {
          continue;
        }
        const key = `${routeIndex}|${entityIndex}|${face.face}|${lane.toFixed(1)}`;
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        const visit = {
          routeIndex,
          visitIndex
        };
        events.push({
          kind: "wall-hug",
          cost: wallHugCost(distance, overlap, WALL_HUG_CLEARANCE_PX),
          routeIndexes: [routeIndex],
          corridorIndexes: [corridorIndex],
          visits: [visit]
        });
      }
    }
  }
  function collectRouteWallTouches(world, route, routeIndex, points, events) {
    for (let pointIndex = 1; pointIndex + 1 < points.length; pointIndex += 1) {
      if (!isCorner(points, pointIndex)) {
        continue;
      }
      const bend = points[pointIndex];
      let selected;
      for (const segmentIndex of [pointIndex - 1, pointIndex]) {
        const visitIndex = route.segmentVisitOf(segmentIndex);
        const corridorIndex = route.visits[visitIndex].corridorIndex;
        for (const face of world.indexer.wallFacesForCorridor(corridorIndex)) {
          const coordinate = face.normalAxis === "x" ? bend.x : bend.y;
          const travel = face.normalAxis === "x" ? bend.y : bend.x;
          if (Math.abs(coordinate - face.coordinate) > EPSILON2 || travel < face.span[0] - NEAR_FACE_SPAN_SLACK_PX - EPSILON2 || travel > face.span[1] + NEAR_FACE_SPAN_SLACK_PX + EPSILON2) {
            continue;
          }
          const candidate = { ...face, corridorIndex };
          if (!selected || compareCorridorFaces(candidate, selected) < 0) {
            selected = candidate;
          }
        }
      }
      if (!selected) {
        continue;
      }
      const visits = bendVisits(route, routeIndex, pointIndex);
      events.push({
        kind: "wall-touch",
        cost: ROUTING_QUALITY_COSTS.wallTouch,
        routeIndexes: [routeIndex],
        corridorIndexes: corridorIndexesForVisits(route, visits),
        visits,
        routeIndex,
        bendPointIndex: pointIndex,
        entityIndex: selected.entityIndex,
        face: selected.face
      });
    }
  }
  function compareCorridorFaces(left, right) {
    return left.entityId.localeCompare(right.entityId) || left.normalAxis.localeCompare(right.normalAxis) || left.coordinate - right.coordinate || left.corridorIndex - right.corridorIndex;
  }
  function bendVisits(route, routeIndex, pointIndex) {
    const first = route.segmentVisitOf(pointIndex - 1);
    const second = route.segmentVisitOf(pointIndex);
    const lower = Math.min(first, second);
    const upper = Math.max(first, second);
    const firstRef = { routeIndex, visitIndex: lower };
    return lower === upper ? [firstRef] : [firstRef, { routeIndex, visitIndex: upper }];
  }
  function corridorIndexesForVisits(route, visits) {
    const first = route.visits[visits[0].visitIndex].corridorIndex;
    const second = visits[1] ? route.visits[visits[1].visitIndex].corridorIndex : first;
    return first === second ? [first] : [Math.min(first, second), Math.max(first, second)];
  }
  function isCorner(points, pointIndex) {
    return segmentAxis2(points[pointIndex - 1], points[pointIndex]) !== segmentAxis2(points[pointIndex], points[pointIndex + 1]);
  }
  function segmentAxis2(from, to) {
    if (from.y === to.y) {
      return "x";
    }
    if (from.x === to.x) {
      return "y";
    }
    throw new Error("wall quality: emitted segment is not cardinal");
  }
  function anchorCurve(distance, anchor) {
    if (anchor <= EPSILON2 || distance >= anchor) {
      return 0;
    }
    const shortfall2 = (anchor - Math.max(0, distance)) / anchor;
    return shortfall2 * shortfall2;
  }

  // packages/layout/src/routing/corridor/continuationGeometry.ts
  function continuationBundlePlacement(world, route, continuation) {
    const afterVisitIndex = continuation.afterVisitIndex;
    const beforeCorridor = world.indexer.corridors[route.visits[afterVisitIndex - 1].corridorIndex];
    const afterCorridor = world.indexer.corridors[route.visits[afterVisitIndex].corridorIndex];
    const beforeCross = corridorCrossSpan(beforeCorridor);
    const afterCross = corridorCrossSpan(afterCorridor);
    const hostVisitIndex = selectBoundaryHost(
      beforeCorridor,
      afterCorridor,
      spanContains(beforeCross, afterCross, ROUTING_EPSILON),
      spanContains(afterCross, beforeCross, ROUTING_EPSILON),
      afterVisitIndex
    );
    const hostCorridorIndex = route.visits[hostVisitIndex].corridorIndex;
    const boundary = route.visits[afterVisitIndex].entry;
    if (boundary.kind !== "portal") {
      throw new Error(`route ${route.requestIndex}: continuation portal missing`);
    }
    const hostSide = hostVisitIndex === afterVisitIndex - 1 ? "exit" : "entry";
    return {
      key: `${boundary.portalIndex}:${hostCorridorIndex}:${hostSide}`,
      hostVisitIndex,
      hostCorridorIndex,
      mouthVisitIndex: hostVisitIndex === afterVisitIndex - 1 ? afterVisitIndex : afterVisitIndex - 1
    };
  }
  function buildContinuationBoundaryRealizations(world, routes, tracksByRoute, continuations, tuning, withPerpendicularClearance) {
    const drafts = [];
    for (const continuation of continuations) {
      const route = routes[continuation.routeIndex];
      const afterVisitIndex = continuation.afterVisitIndex;
      const oldTrack = tracksByRoute[continuation.routeIndex][afterVisitIndex - 1];
      const newTrack = tracksByRoute[continuation.routeIndex][afterVisitIndex];
      if (Math.abs(oldTrack - newTrack) <= ROUTING_EPSILON) {
        continue;
      }
      const entry = route.visits[afterVisitIndex].entry;
      if (entry.kind !== "portal" || entry.mode !== "continue-straight") {
        throw new Error(`route ${route.requestIndex}: flexible continuation boundary missing`);
      }
      const portal = world.indexer.portals[entry.portalIndex];
      if (portal.kind !== "continue") {
        throw new Error(`route ${route.requestIndex}: flexible continuation portal missing`);
      }
      const beforeCorridorIndex = route.visits[afterVisitIndex - 1].corridorIndex;
      const afterCorridorIndex = route.visits[afterVisitIndex].corridorIndex;
      const beforeCorridor = world.indexer.corridors[beforeCorridorIndex];
      const afterCorridor = world.indexer.corridors[afterCorridorIndex];
      const beforeHosts = coordinateInSpan(
        newTrack,
        corridorCrossSpan(beforeCorridor),
        ROUTING_EPSILON
      );
      const afterHosts = coordinateInSpan(
        oldTrack,
        corridorCrossSpan(afterCorridor),
        ROUTING_EPSILON
      );
      const eventCoordinate = portal.planeCoordinate;
      if (beforeHosts || afterHosts) {
        const hostVisitIndex = selectBoundaryHost(
          beforeCorridor,
          afterCorridor,
          beforeHosts,
          afterHosts,
          afterVisitIndex
        );
        drafts.push(
          boundaryDraft(
            world,
            route,
            continuation.routeIndex,
            afterVisitIndex,
            hostVisitIndex,
            oldTrack,
            newTrack,
            eventCoordinate,
            tracksByRoute,
            tuning
          )
        );
        continue;
      }
      throw new Error(`route ${route.requestIndex}: selected continuation has no containing host`);
    }
    const result = routes.map(() => []);
    const assignedShifts = /* @__PURE__ */ new Map();
    const groups = /* @__PURE__ */ new Map();
    for (const draft of drafts) {
      const corridorPair = [draft.beforeCorridorIndex, draft.afterCorridorIndex].sort(
        (left, right) => left - right
      );
      const key = `${corridorPair[0]}:${corridorPair[1]}:${draft.hostCorridorIndex}`;
      const group = groups.get(key) ?? [];
      group.push(draft);
      groups.set(key, group);
    }
    for (const group of groups.values()) {
      const ordered = orderBoundaryDrafts(group);
      const maximumDepth = Math.min(...ordered.map((draft) => draft.maximumDepth));
      const nearDepth = Math.min(tuning.corridorEdgePadding, maximumDepth);
      const gap = ordered.length <= 1 ? 0 : Math.floor(
        Math.min(
          tuning.minimumTrackSeparation,
          Math.max(0, maximumDepth - nearDepth) / (ordered.length - 1)
        ) + ROUTING_EPSILON
      );
      const depths = ordered.map(
        (_, orderIndex) => nearDepth + (ordered.length - 1 - orderIndex) * gap
      );
      const depthOffset = withPerpendicularClearance ? continuationBundleDepthOffset(
        world,
        routes,
        tracksByRoute,
        ordered,
        depths,
        maximumDepth,
        tuning
      ) : 0;
      const wallDepthOffset = withPerpendicularClearance ? 0 : continuationBundleCenterDepthOffset(
        world,
        routes,
        tracksByRoute,
        ordered,
        depths,
        maximumDepth,
        tuning
      );
      ordered.forEach((draft, orderIndex) => {
        const depth = depths[orderIndex] + depthOffset + wallDepthOffset;
        const planKey = continuationKey(draft.routeIndex, draft.afterVisitIndex);
        const shifts = assignedShifts.get(planKey) ?? [];
        shifts.push({
          hostVisitIndex: draft.hostVisitIndex,
          shiftCoordinate: draft.eventCoordinate + draft.hostSide * depth,
          trackAfter: draft.toTrack
        });
        assignedShifts.set(planKey, shifts);
      });
    }
    for (const [planKey, shifts] of assignedShifts) {
      const draft = drafts.find(
        (candidate) => continuationKey(candidate.routeIndex, candidate.afterVisitIndex) === planKey
      );
      if (!draft) {
        throw new Error(`boundary realization ${planKey} lost its draft`);
      }
      result[draft.routeIndex].push({
        kind: "continue-retrack",
        afterVisitIndex: draft.afterVisitIndex,
        shifts: shifts.map(({ hostVisitIndex, shiftCoordinate, trackAfter }) => ({
          hostVisitIndex,
          shiftCoordinate,
          trackAfter
        }))
      });
    }
    for (const realizations of result) {
      realizations.sort((left, right) => left.afterVisitIndex - right.afterVisitIndex);
    }
    return result;
  }
  function continuationBundleCenterDepthOffset(world, routes, tracksByRoute, drafts, depths, maximumDepth, tuning) {
    const deepest = Math.max(...depths);
    const shallowest = Math.min(...depths);
    const maximumOffset = Math.floor(maximumDepth - deepest + ROUTING_EPSILON);
    if (maximumOffset <= 0) {
      return 0;
    }
    const facesByDraft = drafts.map((draft) => {
      const hostAxis = world.indexer.corridors[draft.hostCorridorIndex].axis;
      const trackSpan = [
        Math.min(draft.fromTrack, draft.toTrack),
        Math.max(draft.fromTrack, draft.toTrack)
      ];
      return world.indexer.wallFacesForCorridor(draft.hostCorridorIndex).filter(
        (face) => face.normalAxis === hostAxis && face.span[0] < trackSpan[1] + ROUTING_EPSILON && face.span[1] > trackSpan[0] - ROUTING_EPSILON
      );
    });
    let farWallDepth = Number.POSITIVE_INFINITY;
    drafts.forEach((draft, index) => {
      for (const face of facesByDraft[index]) {
        const faceDepth = draft.hostSide * (face.coordinate - draft.eventCoordinate);
        if (faceDepth > depths[index] + ROUTING_EPSILON) {
          farWallDepth = Math.min(farWallDepth, faceDepth);
        }
      }
    });
    const laneClearanceAt = (offset) => Math.min(
      ...drafts.map(
        (draft, index) => continuationShiftClearance(
          world,
          routes,
          tracksByRoute,
          draft,
          draft.eventCoordinate + draft.hostSide * (depths[index] + offset)
        )
      )
    );
    const withLaneClearance = (preferred) => {
      if (laneClearanceAt(preferred) >= tuning.minimumTrackSeparation - ROUTING_EPSILON) {
        return preferred;
      }
      const candidates = /* @__PURE__ */ new Set([0, maximumOffset]);
      drafts.forEach((draft, index) => {
        routes.forEach((route, routeIndex) => {
          route.visits.forEach((_visit, visitIndex) => {
            const track = tracksByRoute[routeIndex][visitIndex];
            for (const target of [
              track + tuning.minimumTrackSeparation,
              track - tuning.minimumTrackSeparation
            ]) {
              const offset = Math.round(
                draft.hostSide * (target - draft.eventCoordinate) - depths[index]
              );
              if (offset >= 0 && offset <= maximumOffset) {
                candidates.add(offset);
              }
            }
          });
        });
      });
      let best;
      for (const offset of candidates) {
        if (laneClearanceAt(offset) < tuning.minimumTrackSeparation - ROUTING_EPSILON) {
          continue;
        }
        if (best === void 0 || Math.abs(offset - preferred) < Math.abs(best - preferred)) {
          best = offset;
        }
      }
      return best ?? preferred;
    };
    if (Number.isFinite(farWallDepth)) {
      const envelopeCenter = (shallowest + deepest) / 2;
      const centeringOffset = Math.round(farWallDepth / 2 - envelopeCenter);
      return withLaneClearance(Math.max(0, Math.min(maximumOffset, centeringOffset)));
    }
    let clearanceOffset = 0;
    drafts.forEach((draft, index) => {
      for (const face of facesByDraft[index]) {
        const faceDepth = draft.hostSide * (face.coordinate - draft.eventCoordinate);
        if (faceDepth <= depths[index] + ROUTING_EPSILON) {
          const needed = Math.ceil(faceDepth + WALL_HUG_CLEARANCE_PX - depths[index]);
          clearanceOffset = Math.max(clearanceOffset, needed);
        }
      }
    });
    return withLaneClearance(Math.max(0, Math.min(maximumOffset, clearanceOffset)));
  }
  function continuationBundleDepthOffset(world, routes, tracksByRoute, drafts, depths, maximumDepth, tuning) {
    const deepest = Math.max(...depths);
    const maximumOffset = Math.floor(maximumDepth - deepest + ROUTING_EPSILON);
    let bestOffset = 0;
    let bestClearance = Number.NEGATIVE_INFINITY;
    for (let offset = 0; offset <= maximumOffset; offset += 1) {
      const clearance = Math.min(
        ...drafts.map(
          (draft, index) => continuationShiftClearance(
            world,
            routes,
            tracksByRoute,
            draft,
            draft.eventCoordinate + draft.hostSide * (depths[index] + offset)
          )
        )
      );
      if (clearance >= tuning.minimumTrackSeparation - ROUTING_EPSILON) {
        return offset;
      }
      if (clearance > bestClearance + ROUTING_EPSILON) {
        bestClearance = clearance;
        bestOffset = offset;
      }
    }
    return bestOffset;
  }
  function continuationShiftClearance(world, routes, tracksByRoute, draft, shiftCoordinate) {
    const hostAxis = world.indexer.corridors[draft.hostCorridorIndex].axis;
    const shiftSpan = [
      Math.min(draft.fromTrack, draft.toTrack),
      Math.max(draft.fromTrack, draft.toTrack)
    ];
    let clearance = Number.POSITIVE_INFINITY;
    routes.forEach((route, routeIndex) => {
      if (routeIndex === draft.routeIndex) {
        return;
      }
      route.visits.forEach((visit, visitIndex) => {
        const corridor = world.indexer.corridors[visit.corridorIndex];
        if (corridor.axis === hostAxis) {
          return;
        }
        const travelInterval = possibleTravelInterval(
          world,
          corridor,
          route,
          visitIndex,
          tracksByRoute[routeIndex]
        );
        if (!spansOverlapPositive(shiftSpan, travelInterval, ROUTING_EPSILON)) {
          return;
        }
        clearance = Math.min(
          clearance,
          Math.abs(shiftCoordinate - tracksByRoute[routeIndex][visitIndex])
        );
      });
    });
    return clearance;
  }
  function boundaryDraft(world, route, routeIndex, afterVisitIndex, hostVisitIndex, fromTrack, toTrack, eventCoordinate, tracksByRoute, tuning) {
    const hostCorridorIndex = route.visits[hostVisitIndex].corridorIndex;
    const beforeCorridorIndex = route.visits[afterVisitIndex - 1].corridorIndex;
    const afterCorridorIndex = route.visits[afterVisitIndex].corridorIndex;
    const hostBefore = hostVisitIndex === afterVisitIndex - 1;
    const hostCorridor = world.indexer.corridors[hostCorridorIndex];
    const hostTravel = corridorTravelSpan(hostCorridor);
    const hostSide = midpoint(hostTravel) < eventCoordinate ? -1 : 1;
    const farBoundary = hostBefore ? route.visits[hostVisitIndex].entry : route.visits[hostVisitIndex].exit;
    const adjacentVisitIndex = hostBefore ? hostVisitIndex - 1 : hostVisitIndex + 1;
    const farTravel = farBoundary.kind === "portal" && farBoundary.mode === "turn" && adjacentVisitIndex >= 0 && adjacentVisitIndex < route.visits.length ? tracksByRoute[routeIndex][adjacentVisitIndex] : boundaryTravelCoordinate(world, hostCorridor, farBoundary);
    const traversedDepth = Math.max(
      0,
      Math.abs(farTravel - eventCoordinate) - tuning.corridorEdgePadding
    );
    const maximumDepth = Math.min(
      tuning.boundaryShiftDepth,
      traversedDepth,
      hostSide < 0 ? eventCoordinate - hostTravel[0] : hostTravel[1] - eventCoordinate
    );
    return {
      routeIndex,
      afterVisitIndex,
      beforeCorridorIndex,
      afterCorridorIndex,
      hostVisitIndex,
      hostCorridorIndex,
      fromTrack,
      toTrack,
      hostTrack: hostBefore ? fromTrack : toTrack,
      mouthTrack: hostBefore ? toTrack : fromTrack,
      eventCoordinate,
      hostSide,
      maximumDepth: Math.max(0, maximumDepth)
    };
  }
  function selectBoundaryHost(before, after, beforeHosts, afterHosts, afterVisitIndex) {
    if (beforeHosts && !afterHosts) {
      return afterVisitIndex - 1;
    }
    if (afterHosts && !beforeHosts) {
      return afterVisitIndex;
    }
    return spanLength(corridorCrossSpan(before)) >= spanLength(corridorCrossSpan(after)) ? afterVisitIndex - 1 : afterVisitIndex;
  }
  function orderBoundaryDrafts(drafts) {
    const outgoing = drafts.map(() => /* @__PURE__ */ new Set());
    const incoming = new Int32Array(drafts.length);
    for (let left = 0; left < drafts.length; left += 1) {
      for (let right = left + 1; right < drafts.length; right += 1) {
        const leftFirst = boundaryOrderSafe(drafts[left], drafts[right]);
        const rightFirst = boundaryOrderSafe(drafts[right], drafts[left]);
        if (leftFirst === rightFirst) {
          continue;
        }
        const before = leftFirst ? left : right;
        const after = leftFirst ? right : left;
        outgoing[before].add(after);
        incoming[after] += 1;
      }
    }
    const remaining = new Set(drafts.map((_, index) => index));
    const result = [];
    while (remaining.size > 0) {
      const next = [...remaining].filter((index) => incoming[index] === 0).sort((left, right) => drafts[left].routeIndex - drafts[right].routeIndex)[0];
      const selected = next ?? Math.min(...remaining);
      remaining.delete(selected);
      result.push(drafts[selected]);
      for (const after of outgoing[selected]) {
        incoming[after] -= 1;
      }
    }
    return result;
  }
  function boundaryOrderSafe(first, second) {
    return !insideClosedSweep(second.hostTrack, first.hostTrack, first.mouthTrack) && !insideClosedSweep(first.mouthTrack, second.hostTrack, second.mouthTrack);
  }
  function insideClosedSweep(value, first, second) {
    return value >= Math.min(first, second) - ROUTING_EPSILON && value <= Math.max(first, second) + ROUTING_EPSILON;
  }

  // packages/layout/src/routing/corridor/spacingObjective.ts
  function compileTrackDesires(desires) {
    if (desires.length === 0) {
      throw new Error("corridor spacing: track unit has no desires");
    }
    const hasSemanticDesire = desires.some((desire) => desire.kind !== "corridor-ideal");
    let weight = 0;
    let weightedTracks = 0;
    let weightedSquares = 0;
    for (const desire of desires) {
      if (!(desire.weight > 0)) {
        throw new Error(`corridor spacing: ${desire.kind} desire has non-positive weight`);
      }
      if (hasSemanticDesire && desire.kind === "corridor-ideal") {
        continue;
      }
      const weightedTrack = desire.track * desire.weight;
      weight += desire.weight;
      weightedTracks += weightedTrack;
      weightedSquares += weightedTrack * desire.track;
    }
    const track = weightedTracks / weight;
    return {
      track,
      weight,
      irreducibleCost: Math.max(0, weightedSquares - weightedTracks * track)
    };
  }

  // packages/layout/src/routing/corridor/unionFind.ts
  function createUnionFind() {
    let parent = new Int32Array(0);
    const reset = (size) => {
      if (size > parent.length) {
        parent = new Int32Array(Math.max(size, parent.length * 2));
      }
      for (let index = 0; index < size; index += 1) {
        parent[index] = index;
      }
    };
    const find = (index) => {
      let root = index;
      while (parent[root] !== root) {
        root = parent[root];
      }
      while (parent[index] !== root) {
        const next = parent[index];
        parent[index] = root;
        index = next;
      }
      return root;
    };
    const unionInto = (survivor, merged) => {
      const survivorRoot = find(survivor);
      const mergedRoot = find(merged);
      if (survivorRoot !== mergedRoot) {
        parent[mergedRoot] = survivorRoot;
      }
      return survivorRoot;
    };
    const unionMin = (left, right) => {
      const leftRoot = find(left);
      const rightRoot = find(right);
      const minimumRoot = Math.min(leftRoot, rightRoot);
      if (leftRoot !== rightRoot) {
        parent[Math.max(leftRoot, rightRoot)] = minimumRoot;
      }
      return minimumRoot;
    };
    return { find, unionInto, unionMin, reset };
  }

  // packages/layout/src/routing/corridor/spacingKernel.ts
  var EPSILON3 = 1e-6;
  var CAPACITY_SEARCH_ITERATIONS = 48;
  var MAX_COMPONENT_SOLVER_ITERATIONS = 2e3;
  var COMPONENT_SOLVER_TOLERANCE = 5e-5;
  function maximumFeasibleSpacingGap(units, indexes, requested) {
    if (indexes.length <= 1 || canFitOrderedSpacingGap(units, indexes, requested)) {
      return requested;
    }
    let low = Number.POSITIVE_INFINITY;
    for (let index = 1; index < indexes.length; index += 1) {
      low = Math.min(low, units[indexes[index]].lower - units[indexes[index - 1]].upper);
    }
    let high = requested;
    for (let iteration = 0; iteration < CAPACITY_SEARCH_ITERATIONS; iteration += 1) {
      const middle = (low + high) / 2;
      if (canFitOrderedSpacingGap(units, indexes, middle)) {
        low = middle;
      } else {
        high = middle;
      }
    }
    return low;
  }
  function canFitOrderedSpacingGap(units, indexes, gap) {
    const count = indexes?.length ?? units.length;
    let track = units[indexes?.[0] ?? 0]?.lower ?? 0;
    for (let index = 1; index < count; index += 1) {
      const unit = units[indexes?.[index] ?? index];
      track = Math.max(unit.lower, track + gap);
      if (track > unit.upper + EPSILON3) {
        return false;
      }
    }
    return true;
  }
  function createSpacingKernelWorkspace() {
    return {
      constraintComponentUnionFind: createUnionFind(),
      capacityFeasibilityValues: new Float64Array(0),
      projectionBoxResiduals: new Float64Array(0),
      projectionBeforeResiduals: new Float64Array(0),
      projectionAfterResiduals: new Float64Array(0),
      projectionPreviousValues: new Float64Array(0)
    };
  }
  function retainFloat64Capacity(buffer, size) {
    return size <= buffer.length ? buffer : new Float64Array(Math.max(size, buffer.length * 2, 1));
  }
  var InfeasibleSpacingComponentError = class extends Error {
    constructor(unitIndexes) {
      super("corridor spacing: continuation order is infeasible even at zero gap");
      __publicField(this, "unitIndexes");
      this.name = "InfeasibleSpacingComponentError";
      this.unitIndexes = [...unitIndexes];
    }
  };
  function solveSpacingKernel(units, constraints, workspace = createSpacingKernelWorkspace()) {
    const compiledUnits = units.map((unit) => {
      const objective2 = compileTrackDesires(unit.desires);
      return {
        lower: unit.lower,
        upper: unit.upper,
        desired: objective2.track,
        desireWeight: objective2.weight,
        irreducibleDesireCost: objective2.irreducibleCost,
        authored: unit.authored
      };
    });
    const problem = buildCompiledSpacingProblem(compiledUnits, constraints, workspace);
    const fitted = fitConstraintCapacity(problem, workspace);
    const projected = solveComponents(problem, fitted.constraints, workspace);
    const quantized = quantizeComponentSolution(compiledUnits, fitted.constraints, projected.values);
    const unitCosts = new Float64Array(compiledUnits.length);
    let objective = 0;
    for (let index = 0; index < compiledUnits.length; index += 1) {
      const unit = compiledUnits[index];
      const displacement = quantized.tracks[index] - unit.desired;
      const cost = unit.irreducibleDesireCost + unit.desireWeight * displacement * displacement;
      unitCosts[index] = cost;
      objective += cost;
    }
    return {
      tracks: quantized.tracks,
      unitCosts,
      objective,
      capacityReductions: fitted.reductions,
      quantizationReductions: [
        ...quantized.boundReductions,
        ...constraintQuantizationReductions(problem, fitted.constraints, quantized.tracks)
      ],
      metrics: {
        converged: projected.converged,
        quantizationViolationCount: quantized.violationCount
      }
    };
  }
  function buildCompiledSpacingProblem(units, constraints, workspace) {
    const { constraintComponentUnionFind } = workspace;
    constraintComponentUnionFind.reset(units.length);
    for (const constraint of constraints) {
      constraintComponentUnionFind.unionMin(constraint.before, constraint.after);
    }
    const componentIndexByUnit = new Int32Array(units.length);
    const unitIndexesByComponent = [];
    for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
      const componentRoot = constraintComponentUnionFind.find(unitIndex);
      let componentIndex;
      if (componentRoot === unitIndex) {
        componentIndex = unitIndexesByComponent.length;
        unitIndexesByComponent.push([]);
      } else {
        componentIndex = componentIndexByUnit[componentRoot];
      }
      componentIndexByUnit[unitIndex] = componentIndex;
      unitIndexesByComponent[componentIndex].push(unitIndex);
    }
    const constraintIndexesByComponent = unitIndexesByComponent.map(() => []);
    const constrainedComponentIndexes = [];
    constraints.forEach((constraint, constraintIndex) => {
      const componentIndex = componentIndexByUnit[constraint.before];
      const componentConstraintIndexes = constraintIndexesByComponent[componentIndex];
      if (componentConstraintIndexes.length === 0) {
        constrainedComponentIndexes.push(componentIndex);
      }
      componentConstraintIndexes.push(constraintIndex);
    });
    const components = unitIndexesByComponent.map(
      (unitIndexes, componentIndex) => {
        const constraintIndexes = constraintIndexesByComponent[componentIndex];
        return {
          unitIndexes,
          constraintIndexes,
          topology: extractDirectedPath(unitIndexes, constraints, constraintIndexes) ?? {
            kind: "general"
          }
        };
      }
    );
    return {
      units,
      constraints,
      components,
      constrainedComponents: constrainedComponentIndexes.map(
        (componentIndex) => components[componentIndex]
      )
    };
  }
  function solveComponents(problem, constraints, workspace) {
    const { units } = problem;
    const values = units.map((unit) => unit.desired);
    let converged = true;
    for (const component of problem.components) {
      const { constraintIndexes, topology, unitIndexes } = component;
      if (topology.kind === "path") {
        solveBoundedPavaPath(units, constraints, topology, values);
        continue;
      }
      const componentConverged = projectComponent(
        units,
        unitIndexes,
        constraints,
        constraintIndexes,
        values,
        workspace
      );
      converged = converged && componentConverged;
    }
    return { values, converged };
  }
  function extractDirectedPath(unitIndexes, constraints, constraintIndexes) {
    if (unitIndexes.length === 1) {
      return constraintIndexes.length === 0 ? { kind: "path", orderedUnitIndexes: [...unitIndexes], orderedConstraintIndexes: [] } : void 0;
    }
    if (constraintIndexes.length !== unitIndexes.length - 1) {
      return void 0;
    }
    const incomingByUnit = /* @__PURE__ */ new Map();
    const outgoingByUnit = /* @__PURE__ */ new Map();
    for (const constraintIndex of constraintIndexes) {
      const constraint = constraints[constraintIndex];
      if (constraint.before === constraint.after || outgoingByUnit.has(constraint.before) || incomingByUnit.has(constraint.after)) {
        return void 0;
      }
      outgoingByUnit.set(constraint.before, constraintIndex);
      incomingByUnit.set(constraint.after, constraintIndex);
    }
    const starts = unitIndexes.filter((unitIndex) => !incomingByUnit.has(unitIndex));
    const ends = unitIndexes.filter((unitIndex) => !outgoingByUnit.has(unitIndex));
    if (starts.length !== 1 || ends.length !== 1) {
      return void 0;
    }
    for (const unitIndex of unitIndexes) {
      const incomingCount = incomingByUnit.has(unitIndex) ? 1 : 0;
      const outgoingCount = outgoingByUnit.has(unitIndex) ? 1 : 0;
      if (unitIndex === starts[0]) {
        if (incomingCount !== 0 || outgoingCount !== 1) {
          return void 0;
        }
      } else if (unitIndex === ends[0]) {
        if (incomingCount !== 1 || outgoingCount !== 0) {
          return void 0;
        }
      } else if (incomingCount !== 1 || outgoingCount !== 1) {
        return void 0;
      }
    }
    const pathUnitIndexes = [];
    const pathConstraintIndexes = [];
    const visited = /* @__PURE__ */ new Set();
    let current = starts[0];
    while (current !== void 0) {
      if (visited.has(current)) {
        return void 0;
      }
      visited.add(current);
      pathUnitIndexes.push(current);
      const outgoingIndex = outgoingByUnit.get(current);
      if (outgoingIndex === void 0) {
        current = void 0;
        continue;
      }
      pathConstraintIndexes.push(outgoingIndex);
      current = constraints[outgoingIndex].after;
    }
    if (pathUnitIndexes.length !== unitIndexes.length || pathConstraintIndexes.length !== constraintIndexes.length) {
      return void 0;
    }
    return {
      kind: "path",
      orderedUnitIndexes: pathUnitIndexes,
      orderedConstraintIndexes: pathConstraintIndexes
    };
  }
  function pavaBlockValue(weightedTarget, weight, lower, upper) {
    if (lower > upper) {
      if (lower - upper > EPSILON3) {
        throw new Error(
          `corridor spacing: infeasible bounds in path component (${lower} > ${upper})`
        );
      }
      return (lower + upper) / 2;
    }
    return clamp(weightedTarget / weight, lower, upper);
  }
  function solveBoundedPavaPath(units, constraints, path, values) {
    const offsets = new Float64Array(path.orderedUnitIndexes.length);
    for (let index = 1; index < offsets.length; index += 1) {
      offsets[index] = offsets[index - 1] + constraints[path.orderedConstraintIndexes[index - 1]].gap;
    }
    const lowerBounds = new Float64Array(path.orderedUnitIndexes.length);
    let propagatedLower = Number.NEGATIVE_INFINITY;
    for (let index = 0; index < path.orderedUnitIndexes.length; index += 1) {
      const unit = units[path.orderedUnitIndexes[index]];
      propagatedLower = Math.max(propagatedLower, unit.lower - offsets[index]);
      lowerBounds[index] = propagatedLower;
    }
    const upperBounds = new Float64Array(path.orderedUnitIndexes.length);
    let propagatedUpper = Number.POSITIVE_INFINITY;
    for (let index = path.orderedUnitIndexes.length - 1; index >= 0; index -= 1) {
      const unit = units[path.orderedUnitIndexes[index]];
      propagatedUpper = Math.min(propagatedUpper, unit.upper - offsets[index]);
      upperBounds[index] = propagatedUpper;
    }
    const blocks = [];
    for (let index = 0; index < path.orderedUnitIndexes.length; index += 1) {
      const unit = units[path.orderedUnitIndexes[index]];
      const weightedTarget = unit.desireWeight * (unit.desired - offsets[index]);
      blocks.push({
        start: index,
        end: index,
        weight: unit.desireWeight,
        weightedTarget,
        lower: lowerBounds[index],
        upper: upperBounds[index],
        value: pavaBlockValue(
          weightedTarget,
          unit.desireWeight,
          lowerBounds[index],
          upperBounds[index]
        )
      });
      while (blocks.length >= 2) {
        const right = blocks[blocks.length - 1];
        const left = blocks[blocks.length - 2];
        if (left.value <= right.value) {
          break;
        }
        blocks.pop();
        blocks.pop();
        const weight = left.weight + right.weight;
        const mergedWeightedTarget = left.weightedTarget + right.weightedTarget;
        const lower = Math.max(left.lower, right.lower);
        const upper = Math.min(left.upper, right.upper);
        blocks.push({
          start: left.start,
          end: right.end,
          weight,
          weightedTarget: mergedWeightedTarget,
          lower,
          upper,
          value: pavaBlockValue(mergedWeightedTarget, weight, lower, upper)
        });
      }
    }
    for (const block of blocks) {
      for (let index = block.start; index <= block.end; index += 1) {
        values[path.orderedUnitIndexes[index]] = block.value + offsets[index];
      }
    }
  }
  function projectComponent(units, unitIndexes, constraints, constraintIndexes, values, workspace) {
    workspace.projectionBoxResiduals = retainFloat64Capacity(
      workspace.projectionBoxResiduals,
      units.length
    );
    workspace.projectionBeforeResiduals = retainFloat64Capacity(
      workspace.projectionBeforeResiduals,
      constraintIndexes.length
    );
    workspace.projectionAfterResiduals = retainFloat64Capacity(
      workspace.projectionAfterResiduals,
      constraintIndexes.length
    );
    workspace.projectionPreviousValues = retainFloat64Capacity(
      workspace.projectionPreviousValues,
      unitIndexes.length
    );
    const {
      projectionAfterResiduals,
      projectionBeforeResiduals,
      projectionBoxResiduals,
      projectionPreviousValues
    } = workspace;
    for (const unitIndex of unitIndexes) {
      projectionBoxResiduals[unitIndex] = 0;
    }
    projectionBeforeResiduals.fill(0, 0, constraintIndexes.length);
    projectionAfterResiduals.fill(0, 0, constraintIndexes.length);
    for (let iteration = 1; iteration <= MAX_COMPONENT_SOLVER_ITERATIONS; iteration += 1) {
      for (let index = 0; index < unitIndexes.length; index += 1) {
        projectionPreviousValues[index] = values[unitIndexes[index]];
      }
      let maximumResidualChange = 0;
      for (const unitIndex of unitIndexes) {
        const corrected = values[unitIndex] + projectionBoxResiduals[unitIndex];
        const projected = clamp(corrected, units[unitIndex].lower, units[unitIndex].upper);
        values[unitIndex] = projected;
        const residual = corrected - projected;
        maximumResidualChange = Math.max(
          maximumResidualChange,
          Math.abs(residual - projectionBoxResiduals[unitIndex])
        );
        projectionBoxResiduals[unitIndex] = residual;
      }
      constraintIndexes.forEach((constraintIndex, componentConstraintIndex) => {
        const constraint = constraints[constraintIndex];
        const correctedBefore = values[constraint.before] + projectionBeforeResiduals[componentConstraintIndex];
        const correctedAfter = values[constraint.after] + projectionAfterResiduals[componentConstraintIndex];
        const violation = constraint.gap - (correctedAfter - correctedBefore);
        let projectedBefore = correctedBefore;
        let projectedAfter = correctedAfter;
        if (violation > 0) {
          const beforeWeight = units[constraint.before].desireWeight;
          const afterWeight = units[constraint.after].desireWeight;
          projectedBefore -= violation * afterWeight / (beforeWeight + afterWeight);
          projectedAfter += violation * beforeWeight / (beforeWeight + afterWeight);
        }
        values[constraint.before] = projectedBefore;
        values[constraint.after] = projectedAfter;
        const beforeResidual = correctedBefore - projectedBefore;
        const afterResidual = correctedAfter - projectedAfter;
        maximumResidualChange = Math.max(
          maximumResidualChange,
          Math.abs(beforeResidual - projectionBeforeResiduals[componentConstraintIndex]),
          Math.abs(afterResidual - projectionAfterResiduals[componentConstraintIndex])
        );
        projectionBeforeResiduals[componentConstraintIndex] = beforeResidual;
        projectionAfterResiduals[componentConstraintIndex] = afterResidual;
      });
      let maximumChange = 0;
      let maximumViolation = 0;
      for (let index = 0; index < unitIndexes.length; index += 1) {
        const unitIndex = unitIndexes[index];
        maximumChange = Math.max(
          maximumChange,
          Math.abs(values[unitIndex] - projectionPreviousValues[index])
        );
        maximumViolation = Math.max(
          maximumViolation,
          units[unitIndex].lower - values[unitIndex],
          values[unitIndex] - units[unitIndex].upper
        );
      }
      for (const constraintIndex of constraintIndexes) {
        const constraint = constraints[constraintIndex];
        maximumViolation = Math.max(
          maximumViolation,
          constraint.gap - (values[constraint.after] - values[constraint.before])
        );
      }
      if (maximumChange <= COMPONENT_SOLVER_TOLERANCE && maximumResidualChange <= COMPONENT_SOLVER_TOLERANCE && maximumViolation <= COMPONENT_SOLVER_TOLERANCE) {
        return true;
      }
    }
    return false;
  }
  function fitConstraintCapacity(problem, workspace) {
    const { constraints, units } = problem;
    let fitted;
    const reductions = [];
    workspace.capacityFeasibilityValues = retainFloat64Capacity(
      workspace.capacityFeasibilityValues,
      units.length
    );
    const { capacityFeasibilityValues } = workspace;
    for (const component of problem.constrainedComponents) {
      const { constraintIndexes, unitIndexes } = component;
      if (constraintsFeasible(
        units,
        constraints,
        unitIndexes,
        constraintIndexes,
        1,
        capacityFeasibilityValues
      )) {
        continue;
      }
      if (!constraintsFeasible(
        units,
        constraints,
        unitIndexes,
        constraintIndexes,
        0,
        capacityFeasibilityValues
      )) {
        throw new InfeasibleSpacingComponentError(unitIndexes);
      }
      let low = 0;
      let high = 1;
      for (let iteration = 0; iteration < CAPACITY_SEARCH_ITERATIONS; iteration += 1) {
        const middle = (low + high) / 2;
        if (constraintsFeasible(
          units,
          constraints,
          unitIndexes,
          constraintIndexes,
          middle,
          capacityFeasibilityValues
        )) {
          low = middle;
        } else {
          high = middle;
        }
      }
      let maxGap = Number.NEGATIVE_INFINITY;
      for (const constraintIndex of constraintIndexes) {
        maxGap = Math.max(maxGap, constraints[constraintIndex].gap);
      }
      reductions.push({
        unitIndexes: component.unitIndexes,
        required: Math.max(0, maxGap),
        achieved: Math.max(0, maxGap * low)
      });
      if (!fitted) {
        fitted = constraints.slice();
      }
      const mutableFitted = fitted;
      for (const constraintIndex of constraintIndexes) {
        const constraint = constraints[constraintIndex];
        mutableFitted[constraintIndex] = {
          ...constraint,
          gap: constraint.gap > 0 ? constraint.gap * low : constraint.gap
        };
      }
    }
    return {
      constraints: fitted ?? constraints,
      reductions
    };
  }
  function constraintsFeasible(units, constraints, unitIndexes, constraintIndexes, scale, values) {
    for (const unitIndex of unitIndexes) {
      values[unitIndex] = units[unitIndex].lower;
    }
    for (let iteration = 0; iteration <= unitIndexes.length; iteration += 1) {
      let changed = false;
      for (const constraintIndex of constraintIndexes) {
        const constraint = constraints[constraintIndex];
        const gap = constraint.gap > 0 ? constraint.gap * scale : constraint.gap;
        const candidate = values[constraint.before] + gap;
        if (candidate <= values[constraint.after]) {
          continue;
        }
        if (candidate > units[constraint.after].upper) {
          return false;
        }
        values[constraint.after] = candidate;
        changed = true;
      }
      if (!changed) {
        return true;
      }
    }
    return false;
  }
  function quantizeComponentSolution(units, constraints, projected) {
    const boundReductions = [];
    const values = units.map((unit, index) => {
      if (unit.authored) {
        return clamp(projected[index], unit.lower, unit.upper);
      }
      const lower = Math.ceil(unit.lower - EPSILON3);
      const upper = Math.floor(unit.upper + EPSILON3);
      if (lower <= upper) {
        return clamp(Math.round(projected[index]), lower, upper);
      }
      boundReductions.push({
        unitIndexes: [index],
        required: 0,
        achieved: unit.upper - unit.lower
      });
      return projected[index];
    });
    for (let iteration = 0; iteration <= units.length + constraints.length; iteration += 1) {
      let changed = false;
      for (const constraint of constraints) {
        const requiredGap = Math.floor(constraint.gap + EPSILON3);
        const violation = requiredGap - (values[constraint.after] - values[constraint.before]);
        if (violation <= EPSILON3) {
          continue;
        }
        const after = units[constraint.after];
        const afterTarget = after.authored ? values[constraint.after] + violation : Math.ceil(values[constraint.after] + violation - EPSILON3);
        const nextAfter = Math.min(after.upper, afterTarget);
        if (nextAfter > values[constraint.after] + EPSILON3) {
          values[constraint.after] = nextAfter;
          changed = true;
        }
        const remaining = requiredGap - (values[constraint.after] - values[constraint.before]);
        if (remaining > EPSILON3) {
          const before = units[constraint.before];
          const beforeTarget = before.authored ? values[constraint.before] - remaining : Math.floor(values[constraint.before] - remaining + EPSILON3);
          const nextBefore = Math.max(before.lower, beforeTarget);
          if (nextBefore < values[constraint.before] - EPSILON3) {
            values[constraint.before] = nextBefore;
            changed = true;
          }
        }
      }
      if (!changed) {
        break;
      }
    }
    let violationCount = 0;
    for (let index = 0; index < values.length; index += 1) {
      const unit = units[index];
      if (values[index] < unit.lower - EPSILON3 || values[index] > unit.upper + EPSILON3) {
        values[index] = clamp(values[index], unit.lower, unit.upper);
        violationCount += 1;
      }
    }
    violationCount += constraints.filter(
      (constraint) => values[constraint.after] - values[constraint.before] < Math.floor(constraint.gap + EPSILON3) - EPSILON3
    ).length;
    return { tracks: values, boundReductions, violationCount };
  }
  function constraintQuantizationReductions(problem, constraints, tracks) {
    const reductions = [];
    for (const component of problem.constrainedComponents) {
      const { constraintIndexes } = component;
      let required = Number.NEGATIVE_INFINITY;
      let achieved = Number.POSITIVE_INFINITY;
      let reduced = false;
      for (const constraintIndex of constraintIndexes) {
        const constraint = constraints[constraintIndex];
        const constraintAchieved = tracks[constraint.after] - tracks[constraint.before];
        required = Math.max(required, constraint.gap);
        achieved = Math.min(achieved, constraintAchieved);
        reduced = reduced || constraintAchieved + EPSILON3 < constraint.gap;
      }
      if (!reduced) {
        continue;
      }
      reductions.push({
        unitIndexes: component.unitIndexes,
        required,
        achieved
      });
    }
    return reductions;
  }

  // packages/layout/src/routing/corridor/continuationPolicy.ts
  var EPSILON4 = 1e-6;
  function planContinuationPolicies(world, routes, localUnits, continuations, independentContinuations, terminalCenterContinuations, continuationUnionFind, tuning) {
    const forcedIndependentKeys = continuationKeySet(independentContinuations);
    const continuationKeys = /* @__PURE__ */ new Set();
    const relaxationReasonByKey = /* @__PURE__ */ new Map();
    const proposedReasons = /* @__PURE__ */ new Map();
    const terminalCenterCandidateKeys = /* @__PURE__ */ new Set();
    for (const continuation of continuations) {
      const key = continuationKey(continuation.routeIndex, continuation.afterVisitIndex);
      continuationKeys.add(key);
      relaxationReasonByKey.set(
        key,
        continuationRelaxationReason(world, routes[continuation.routeIndex], continuation)
      );
      if (forcedIndependentKeys.has(key)) {
        proposedReasons.set(key, "forced-independent");
      }
    }
    for (const key of forcedIndependentKeys) {
      if (!continuationKeys.has(key)) {
        throw new Error(`corridor spacing: forced continuation ${key} does not exist`);
      }
    }
    for (const continuation of continuations) {
      const key = continuationKey(continuation.routeIndex, continuation.afterVisitIndex);
      const route = routes[continuation.routeIndex];
      if (proposedReasons.has(key)) {
        continue;
      }
      const relaxationReason = relaxationReasonByKey.get(key);
      const relaxationEligible = relaxationReason === "default-equal";
      const beforeUnit = localUnits[continuation.beforeLocalUnit];
      const afterUnit = localUnits[continuation.afterLocalUnit];
      const hasTerminalConflict = singletonTerminalCenterConflict(
        world,
        route,
        continuation,
        beforeUnit,
        afterUnit,
        tuning
      );
      const terminalPartialOverlap = relaxationReason === "partial-overlap" && hasTerminalConflict && terminalConflictHasContainingHost(world, route, continuation, beforeUnit, afterUnit) && continuationHasHostRunway(world, route, continuation);
      const terminalLeadConflict = relaxationReason === "no-host-runway" && collapsedTerminalLeadConflict(world, route, continuation, beforeUnit, afterUnit, tuning);
      if (!relaxationEligible && !terminalPartialOverlap && !terminalLeadConflict) {
        continue;
      }
      const paddedIntersection = intersectSpans(
        [beforeUnit.lower, beforeUnit.upper],
        [afterUnit.lower, afterUnit.upper],
        EPSILON4
      );
      if (hasTerminalConflict && (relaxationEligible || terminalPartialOverlap) && paddedIntersection) {
        terminalCenterCandidateKeys.add(key);
      }
      if (terminalCenterContinuations && hasTerminalConflict) {
        proposedReasons.set(key, "terminal-center-conflict");
      } else if (terminalLeadConflict) {
        proposedReasons.set(key, "terminal-lead-conflict");
      } else if (!paddedIntersection) {
        proposedReasons.set(key, "empty-padded-intersection");
      }
    }
    const proposed = continuations.filter(
      (continuation) => proposedReasons.has(continuationKey(continuation.routeIndex, continuation.afterVisitIndex))
    );
    const flexibleContinuations = discoverFlexibleContinuations(
      world,
      routes,
      localUnits,
      continuations,
      proposed,
      continuationUnionFind
    );
    const flexibleKeys = continuationKeySet(flexibleContinuations);
    for (const key of forcedIndependentKeys) {
      if (!flexibleKeys.has(key)) {
        throw new Error(`corridor spacing: forced continuation ${key} is not bundle-safe`);
      }
    }
    const policies = continuations.map((continuation) => {
      const route = routes[continuation.routeIndex];
      const key = continuationKey(continuation.routeIndex, continuation.afterVisitIndex);
      const relaxationReason = relaxationReasonByKey.get(key);
      const proposedReason = proposedReasons.get(key);
      const policy = flexibleKeys.has(key) ? "independent" : "equal";
      const reason = proposedReason && policy === "equal" ? "bundle-safety" : proposedReason;
      return {
        routeIndex: continuation.routeIndex,
        afterVisitIndex: continuation.afterVisitIndex,
        beforeCorridorIndex: route.visits[continuation.afterVisitIndex - 1].corridorIndex,
        afterCorridorIndex: route.visits[continuation.afterVisitIndex].corridorIndex,
        policy,
        reason: reason ?? relaxationReason,
        terminalCenterCandidate: terminalCenterCandidateKeys.has(key)
      };
    });
    return { flexibleContinuations, policies };
  }
  function singletonTerminalCenterConflict(world, route, continuation, before, after, tuning) {
    if (before.members.length !== 1 || after.members.length !== 1) {
      return false;
    }
    const beforeTerminal = before.desires.find((desire) => desire.kind === "terminal");
    const afterTerminal = after.desires.find((desire) => desire.kind === "terminal");
    if (beforeTerminal && afterTerminal) {
      return Math.abs(beforeTerminal.track - afterTerminal.track) >= tuning.terminalConflict - EPSILON4;
    }
    const terminal = beforeTerminal ?? afterTerminal;
    if (!terminal) {
      return false;
    }
    const terminalVisitIndex = beforeTerminal ? continuation.afterVisitIndex - 1 : continuation.afterVisitIndex;
    const endpoint = terminalVisitIndex === 0 ? route.from : terminalVisitIndex === route.visits.length - 1 ? route.to : void 0;
    if (!endpoint || spanLength(faceCrossSpan(world.entities[endpoint.entityIndex], endpoint.face)) > tuning.directFanFaceSpan + EPSILON4) {
      return false;
    }
    const neighbor = beforeTerminal ? after : before;
    return terminal.track < neighbor.lower - EPSILON4 || terminal.track > neighbor.upper + EPSILON4;
  }
  function terminalConflictHasContainingHost(world, route, continuation, before, after) {
    const beforeTerminal = before.desires.find((desire) => desire.kind === "terminal");
    const afterTerminal = after.desires.find((desire) => desire.kind === "terminal");
    if (!beforeTerminal || !afterTerminal) {
      return false;
    }
    const beforeCorridor = world.indexer.corridors[route.visits[continuation.afterVisitIndex - 1].corridorIndex];
    const afterCorridor = world.indexer.corridors[route.visits[continuation.afterVisitIndex].corridorIndex];
    return coordinateInSpan(afterTerminal.track, corridorCrossSpan(beforeCorridor), EPSILON4) || coordinateInSpan(beforeTerminal.track, corridorCrossSpan(afterCorridor), EPSILON4);
  }
  function collapsedTerminalLeadConflict(world, route, continuation, before, after, tuning) {
    if (!continuationHasTerminalLead(world, route, continuation.afterVisitIndex, tuning) || !continuationHasGuaranteedShiftRunway(world, route, continuation, tuning)) {
      return false;
    }
    const beforeVisit = route.visits[continuation.afterVisitIndex - 1];
    const afterVisit = route.visits[continuation.afterVisitIndex];
    const sharedTrack = intersectSpans(beforeVisit.feasibleTrack, afterVisit.feasibleTrack, EPSILON4);
    if (!sharedTrack || spanLength(sharedTrack) > EPSILON4) {
      return false;
    }
    const equalTrack = midpoint(sharedTrack);
    const beforeDesired = clamp(
      compileTrackDesires(before.desires).track,
      before.lower,
      before.upper
    );
    const afterDesired = clamp(compileTrackDesires(after.desires).track, after.lower, after.upper);
    return Math.max(Math.abs(beforeDesired - equalTrack), Math.abs(afterDesired - equalTrack)) >= tuning.minimumTrackSeparation - EPSILON4;
  }
  function continuationHasGuaranteedShiftRunway(world, route, continuation, tuning) {
    const placement = continuationBundlePlacement(world, route, continuation);
    const hostBefore = placement.hostVisitIndex === continuation.afterVisitIndex - 1;
    const hostVisit = route.visits[placement.hostVisitIndex];
    const farBoundary = hostBefore ? hostVisit.entry : hostVisit.exit;
    const adjacentVisitIndex = hostBefore ? placement.hostVisitIndex - 1 : placement.hostVisitIndex + 1;
    const adjacentVisit = route.visits[adjacentVisitIndex];
    const entry = route.visits[continuation.afterVisitIndex].entry;
    if (farBoundary.kind !== "portal" || farBoundary.mode !== "turn" || !adjacentVisit || entry.kind !== "portal") {
      return false;
    }
    const portal = world.indexer.portals[entry.portalIndex];
    if (portal.kind !== "continue") {
      return false;
    }
    const eventCoordinate = portal.planeCoordinate;
    const guaranteedDistance = Math.max(
      adjacentVisit.feasibleTrack[0] - eventCoordinate,
      eventCoordinate - adjacentVisit.feasibleTrack[1],
      0
    );
    return guaranteedDistance >= tuning.minimumTrackSeparation + tuning.corridorEdgePadding - EPSILON4;
  }
  function continuationRelaxationReason(world, route, continuation) {
    const before = world.indexer.corridors[route.visits[continuation.afterVisitIndex - 1].corridorIndex];
    const after = world.indexer.corridors[route.visits[continuation.afterVisitIndex].corridorIndex];
    const beforeCross = corridorCrossSpan(before);
    const afterCross = corridorCrossSpan(after);
    const beforeLength = spanLength(beforeCross);
    const afterLength = spanLength(afterCross);
    if (Math.abs(beforeLength - afterLength) <= EPSILON4) {
      return "equal-span";
    }
    if (!spanContains(beforeCross, afterCross, EPSILON4) && !spanContains(afterCross, beforeCross, EPSILON4)) {
      return "partial-overlap";
    }
    if (!continuationHasHostRunway(world, route, continuation)) {
      return "no-host-runway";
    }
    return "default-equal";
  }
  function discoverFlexibleContinuations(world, routes, localUnits, continuations, candidates, continuationUnionFind) {
    let retained = [...candidates];
    while (true) {
      const retainedKeys = continuationKeySet(retained);
      const strictRootByLocal = continuationRoots(
        localUnits.length,
        continuations,
        retainedKeys,
        continuationUnionFind
      );
      const feasible = feasibleBoundaryContinuations(
        world,
        routes,
        localUnits,
        strictRootByLocal,
        retained
      );
      if (feasible.length === retained.length) {
        return feasible;
      }
      retained = feasible;
    }
  }
  function continuationRoots(unitCount, continuations, flexibleKeys, continuationUnionFind) {
    continuationUnionFind.reset(unitCount);
    for (const continuation of continuations) {
      if (flexibleKeys.has(continuationKey(continuation.routeIndex, continuation.afterVisitIndex))) {
        continue;
      }
      continuationUnionFind.unionInto(continuation.beforeLocalUnit, continuation.afterLocalUnit);
    }
    const roots = new Int32Array(unitCount);
    for (let index = 0; index < unitCount; index += 1) {
      roots[index] = continuationUnionFind.find(index);
    }
    return roots;
  }
  function mergeContinuationComponentUnit(routes, localUnits, indexes) {
    const members = indexes.flatMap((index) => localUnits[index].members);
    let lower = Math.max(...indexes.map((index) => localUnits[index].lower));
    let upper = Math.min(...indexes.map((index) => localUnits[index].upper));
    let emptyPaddedBounds;
    if (lower > upper + EPSILON4) {
      const achieved = upper - lower;
      lower = Math.max(
        ...members.map(
          (member) => routes[member.ref.routeIndex].visits[member.ref.visitIndex].feasibleTrack[0]
        )
      );
      upper = Math.min(
        ...members.map(
          (member) => routes[member.ref.routeIndex].visits[member.ref.visitIndex].feasibleTrack[1]
        )
      );
      emptyPaddedBounds = { achieved, rawInfeasible: lower > upper + EPSILON4 };
    }
    return {
      unit: {
        members,
        lower,
        upper: Math.max(lower, upper),
        desires: continuationComponentDesires(
          indexes,
          localUnits,
          members,
          lower,
          Math.max(lower, upper)
        ),
        authored: indexes.some((index) => localUnits[index].authored)
      },
      emptyPaddedBounds
    };
  }
  function continuationComponentDesires(indexes, localUnits, members, lower, upper) {
    const desires = indexes.flatMap((index) => localUnits[index].desires);
    if (desires.length < 2 || desires.some((desire) => desire.kind !== "corridor-ideal")) {
      return desires;
    }
    const routeIndex = members[0]?.ref.routeIndex;
    if (members.some(
      (member) => member.endpointGroups.length > 0 || member.ref.routeIndex !== routeIndex
    )) {
      return desires;
    }
    const realizableOrdinary = desires.filter(
      (desire) => desire.track >= lower - EPSILON4 && desire.track <= upper + EPSILON4
    );
    if (realizableOrdinary.length === 0) {
      return desires;
    }
    const consensusTrack = realizableOrdinary[0].track;
    if (realizableOrdinary.some((desire) => Math.abs(desire.track - consensusTrack) > EPSILON4)) {
      return desires;
    }
    return realizableOrdinary;
  }
  function continuationHasHostRunway(world, route, continuation) {
    const placement = continuationBundlePlacement(world, route, continuation);
    const hostBefore = placement.hostVisitIndex === continuation.afterVisitIndex - 1;
    const hostVisit = route.visits[placement.hostVisitIndex];
    const farBoundary = hostBefore ? hostVisit.entry : hostVisit.exit;
    const hostCorridor = world.indexer.corridors[hostVisit.corridorIndex];
    const entry = route.visits[continuation.afterVisitIndex].entry;
    if (entry.kind !== "portal") {
      throw new Error(`route ${route.requestIndex}: continuation portal missing`);
    }
    const portal = world.indexer.portals[entry.portalIndex];
    if (portal.kind !== "continue") {
      throw new Error(`route ${route.requestIndex}: continuation event missing`);
    }
    const eventCoordinate = portal.planeCoordinate;
    if (farBoundary.kind === "portal" && farBoundary.mode === "turn") {
      const turn = world.indexer.portals[farBoundary.portalIndex];
      if (turn.kind !== "turn") {
        throw new Error(`route ${route.requestIndex}: turn runway boundary missing`);
      }
      const turnTravel = hostCorridor.axis === "x" ? [turn.rect.x, turn.rect.x + turn.rect.width] : [turn.rect.y, turn.rect.y + turn.rect.height];
      if (coordinateInSpan(eventCoordinate, turnTravel, EPSILON4)) {
        return false;
      }
    }
    return Math.abs(boundaryTravelCoordinate(world, hostCorridor, farBoundary) - eventCoordinate) > EPSILON4;
  }
  function feasibleBoundaryContinuations(world, routes, localUnits, strictRootByLocal, continuations) {
    const localIndexesByRoot = /* @__PURE__ */ new Map();
    strictRootByLocal.forEach((root, localIndex) => {
      const indexes = localIndexesByRoot.get(root) ?? [];
      indexes.push(localIndex);
      localIndexesByRoot.set(root, indexes);
    });
    const unitByRoot = /* @__PURE__ */ new Map();
    for (const [root, indexes] of localIndexesByRoot) {
      unitByRoot.set(root, mergeContinuationComponentUnit(routes, localUnits, indexes).unit);
    }
    const bundles = /* @__PURE__ */ new Map();
    for (const continuation of continuations) {
      const route = routes[continuation.routeIndex];
      const placement = continuationBundlePlacement(world, route, continuation);
      const hostBefore = placement.hostVisitIndex === continuation.afterVisitIndex - 1;
      const members = bundles.get(placement.key) ?? [];
      members.push({
        continuation,
        hostLocalUnit: hostBefore ? continuation.beforeLocalUnit : continuation.afterLocalUnit,
        mouthLocalUnit: hostBefore ? continuation.afterLocalUnit : continuation.beforeLocalUnit,
        mouthOrder: route.orderOf(placement.mouthVisitIndex)
      });
      bundles.set(placement.key, members);
    }
    const retained = /* @__PURE__ */ new Set();
    for (const members of bundles.values()) {
      const ordered = [...members].sort(
        (left, right) => left.mouthOrder - right.mouthOrder || left.continuation.routeIndex - right.continuation.routeIndex
      );
      const hostUnits = strictUnits(
        ordered.map((member) => member.hostLocalUnit),
        strictRootByLocal,
        unitByRoot
      );
      const mouthUnits = strictUnits(
        ordered.map((member) => member.mouthLocalUnit),
        strictRootByLocal,
        unitByRoot
      );
      if (!nondecreasingDesires(hostUnits) || !nondecreasingDesires(mouthUnits) || !canFitOrderedSpacingGap(hostUnits, void 0, 0) || !canFitOrderedSpacingGap(mouthUnits, void 0, 0)) {
        continue;
      }
      for (const member of ordered) {
        retained.add(
          continuationKey(member.continuation.routeIndex, member.continuation.afterVisitIndex)
        );
      }
    }
    return continuations.filter(
      (continuation) => retained.has(continuationKey(continuation.routeIndex, continuation.afterVisitIndex))
    );
  }
  function strictUnits(indexes, strictRootByLocal, unitByRoot) {
    const seen = /* @__PURE__ */ new Set();
    return indexes.flatMap((index) => {
      const root = strictRootByLocal[index];
      if (seen.has(root)) {
        return [];
      }
      seen.add(root);
      return [unitByRoot.get(root)];
    });
  }
  function nondecreasingDesires(units) {
    let previous = Number.NEGATIVE_INFINITY;
    for (const unit of units) {
      const desired = compileTrackDesires(unit.desires).track;
      if (previous > desired + EPSILON4) {
        return false;
      }
      previous = desired;
    }
    return true;
  }
  function isStraightContinuationBoundary(boundary) {
    return boundary.kind === "portal" && boundary.mode === "continue-straight";
  }
  function visitHasContinuationBoundary(visit) {
    return isStraightContinuationBoundary(visit.entry) || isStraightContinuationBoundary(visit.exit);
  }
  function continuedTargetTerminalLeadRunStart(world, route, tuning) {
    if (!endpointNeedsTerminalLead(route.to) || route.visits.length < 3) {
      return void 0;
    }
    const beforeLast = route.visits.length - 2;
    if (!visitHasContinuationBoundary(route.visits[beforeLast])) {
      return void 0;
    }
    const terminalParallelCorridor = world.indexer.corridors[route.visits[beforeLast].corridorIndex];
    if (spanLength(corridorCrossSpan(terminalParallelCorridor)) >= 2 * tuning.minimumTrackSeparation) {
      return void 0;
    }
    let runStart = beforeLast;
    while (runStart > 0 && isStraightContinuationBoundary(route.visits[runStart].entry)) {
      runStart -= 1;
    }
    return runStart;
  }
  function continuedSourceTerminalLeadRunEnd(world, route, tuning) {
    if (!endpointNeedsTerminalLead(route.from) || route.visits.length < 3) {
      return void 0;
    }
    const afterFirst = 1;
    if (!visitHasContinuationBoundary(route.visits[afterFirst])) {
      return void 0;
    }
    const terminalParallelCorridor = world.indexer.corridors[route.visits[afterFirst].corridorIndex];
    if (spanLength(corridorCrossSpan(terminalParallelCorridor)) > tuning.narrowSpan + EPSILON4) {
      return void 0;
    }
    let runEnd = afterFirst;
    while (runEnd + 1 < route.visits.length && isStraightContinuationBoundary(route.visits[runEnd].exit)) {
      runEnd += 1;
    }
    return runEnd;
  }
  function continuationHasTerminalLead(world, route, afterVisitIndex, tuning) {
    const sourceRunEnd = continuedSourceTerminalLeadRunEnd(world, route, tuning);
    if (sourceRunEnd !== void 0 && afterVisitIndex > 1 && afterVisitIndex <= sourceRunEnd) {
      return true;
    }
    const targetRunStart = continuedTargetTerminalLeadRunStart(world, route, tuning);
    return targetRunStart !== void 0 && afterVisitIndex > targetRunStart && afterVisitIndex <= route.visits.length - 2;
  }
  function endpointNeedsTerminalLead(endpoint) {
    return endpoint.hasArrowhead !== false;
  }

  // packages/layout/src/routing/corridor/spacing.ts
  var EPSILON5 = 1e-6;
  var CorridorSpacingError = class extends Error {
    constructor(corridorIndexes, routeIndexes, message, options) {
      const uniqueCorridorIndexes = [
        ...new Set(typeof corridorIndexes === "number" ? [corridorIndexes] : corridorIndexes)
      ].sort((left, right) => left - right);
      const corridorLabel = uniqueCorridorIndexes.length === 1 ? `corridor ${uniqueCorridorIndexes[0]}` : `corridors ${uniqueCorridorIndexes.join(",")}`;
      super(`${corridorLabel}: ${message}`, options);
      __publicField(this, "corridorIndex");
      __publicField(this, "corridorIndexes");
      __publicField(this, "routeIndexes");
      this.name = "CorridorSpacingError";
      this.corridorIndex = uniqueCorridorIndexes[0];
      this.corridorIndexes = uniqueCorridorIndexes;
      this.routeIndexes = [...new Set(routeIndexes)].sort((left, right) => left - right);
    }
  };
  function createSpacingRunWorkspace() {
    return {
      continuationUnionFind: createUnionFind(),
      paddedCut: {
        unionFind: createUnionFind(),
        lowerBounds: new Float64Array(0),
        upperBounds: new Float64Array(0),
        boundMarks: new Uint32Array(0),
        generation: 0,
        roots: []
      },
      trackUnitUnionFind: createUnionFind(),
      contentionUnionFind: createUnionFind(),
      kernel: createSpacingKernelWorkspace()
    };
  }
  var MIN_TRACK_SEPARATION_PX = 8;
  var CORRIDOR_EDGE_PADDING_PX = 4;
  var PORT_EDGE_PADDING_PX = 8;
  var IDEAL_TERMINAL_SEPARATION_PX = 16;
  var TERMINAL_LEAD_PX = 40;
  var SOURCE_TERMINAL_LEAD_PX = 16;
  var U_TURN_DEPTH_PX = 24;
  var ENDPOINT_DESIRE_WEIGHT = 8;
  var DIRECT_FAN_FACE_SPAN_PX = 200;
  var TERMINAL_CORRIDOR_IDEAL_WEIGHT = 2;
  var U_TURN_CORRIDOR_IDEAL_WEIGHT = 4;
  var CORRIDOR_IDEAL_DESIRE_WEIGHT = 0.05;
  var CORRIDOR_IDEAL_EDGE_OFFSET_PX = 4;
  var BOUNDARY_SHIFT_DEPTH_PX = 24;
  var CONTINUATION_NARROW_SPAN_PX = 40;
  var CONTINUATION_TERMINAL_CONFLICT_PX = 16;
  var CONTINUATION_GEOMETRY_TUNING = {
    minimumTrackSeparation: MIN_TRACK_SEPARATION_PX,
    corridorEdgePadding: CORRIDOR_EDGE_PADDING_PX,
    boundaryShiftDepth: BOUNDARY_SHIFT_DEPTH_PX
  };
  var CONTINUATION_POLICY_TUNING = {
    minimumTrackSeparation: MIN_TRACK_SEPARATION_PX,
    corridorEdgePadding: CORRIDOR_EDGE_PADDING_PX,
    directFanFaceSpan: DIRECT_FAN_FACE_SPAN_PX,
    narrowSpan: CONTINUATION_NARROW_SPAN_PX,
    terminalConflict: CONTINUATION_TERMINAL_CONFLICT_PX
  };
  var EMPTY_ROUTE_ENDPOINTS = Object.freeze([]);
  var EMPTY_ENDPOINT_GROUPS = Object.freeze([]);
  function haveSameSpacingInputs(route, baseline) {
    return route.requestIndex === baseline.requestIndex && sameSpacingEndpoint(route.from, baseline.from) && sameSpacingEndpoint(route.to, baseline.to) && route.visits.length === baseline.visits.length && route.visits.every((visit, visitIndex) => {
      const baselineVisit = baseline.visits[visitIndex];
      return visit.corridorIndex === baselineVisit.corridorIndex && visit.feasibleTrack[0] === baselineVisit.feasibleTrack[0] && visit.feasibleTrack[1] === baselineVisit.feasibleTrack[1] && boundaryIdentity(visit.entry) === boundaryIdentity(baselineVisit.entry) && boundaryIdentity(visit.exit) === boundaryIdentity(baselineVisit.exit);
    });
  }
  function spaceRoutes(world, routes, ordering, options = {}) {
    const incremental = options.incrementalBaseline;
    if (!incremental || incremental.seedCorridorIndexes.length === 0) {
      const solved2 = solveSpacingRoutes(world, routes, ordering, options);
      commitSpacing(routes, solved2);
      return solved2.spacing;
    }
    const activeCorridorIndexes = new Set(incremental.seedCorridorIndexes);
    const reusableRouteIndexes = reusableIncrementalRouteIndexes(
      routes,
      incremental.routes,
      activeCorridorIndexes
    );
    expandStraightContinuationCorridors(routes, activeCorridorIndexes);
    const solved = solveSpacingRoutes(world, routes, ordering, options, {
      baseline: incremental,
      reusableRouteIndexes,
      activeCorridorIndexes
    });
    const spacing = {
      ...solved.spacing,
      metrics: {
        ...solved.spacing.metrics,
        incremental: {
          reusedCorridorCount: ordering.groups.filter(
            (group) => !activeCorridorIndexes.has(group.corridorIndex)
          ).length
        }
      }
    };
    commitSpacing(routes, solved);
    return spacing;
  }
  function solveSpacingRoutes(world, routes, ordering, options, selective) {
    const workspace = options.workspace ?? createSpacingRunWorkspace();
    const qualityLedger = options.qualityLedger ?? new RoutingQualityLedger();
    qualityLedger.removeStage("spacing");
    if (selective) {
      for (const source of selective.baseline.spacing.quality.sources) {
        const corridorIndex = spacingQualitySourceCorridorIndex(source.source);
        const touchesActiveCorridor = corridorIndex === void 0 ? source.events.some(
          (event) => event.corridorIndexes?.some((index) => selective.activeCorridorIndexes.has(index))
        ) : selective.activeCorridorIndexes.has(corridorIndex);
        if (!touchesActiveCorridor) {
          qualityLedger.replaceSource(source.source, source.stage, source.events, source.scalarCosts);
        }
      }
    }
    const desiredTracks = buildDesiredTracks(world, routes, ordering);
    const requiredContentionsByVisit = indexRequiredContentions(options.requiredContentions ?? []);
    const tracksByRoute = routes.map((route, routeIndex) => {
      if (route.visits.length > 0) {
        route.assertOrdered();
      }
      const tracks = selective?.reusableRouteIndexes.has(routeIndex) ? Float64Array.from(
        route.visits.map(
          (_, visitIndex) => selective.baseline.routes[routeIndex].nominalTrackOf(visitIndex)
        )
      ) : new Float64Array(route.visits.length);
      if (!selective?.reusableRouteIndexes.has(routeIndex)) {
        tracks.fill(Number.NaN);
      }
      return tracks;
    });
    const shortfalls = selective ? selective.baseline.spacing.shortfalls.filter(
      (shortfall2) => !selective.activeCorridorIndexes.has(shortfall2.corridorIndex)
    ) : [];
    const continuedCorridors = straightContinuationCorridors(routes);
    const continuedWorks = [];
    let kernelMetrics = {
      converged: true,
      quantizationViolationCount: 0
    };
    const addKernelMetrics = (metrics2) => {
      kernelMetrics = {
        converged: kernelMetrics.converged && metrics2.converged,
        quantizationViolationCount: kernelMetrics.quantizationViolationCount + metrics2.quantizationViolationCount
      };
    };
    const buildVariablesFor = (group, shortfallSink, relaxedVisits, relaxPadding = false) => group.members.map(
      (ref) => buildVariable(
        world,
        routes,
        desiredTracks,
        group.corridorIndex,
        ref,
        shortfallSink,
        relaxedVisits?.has(visitKey(ref.routeIndex, ref.visitIndex)) ?? false,
        relaxPadding,
        requiredContentionsByVisit
      )
    );
    const relaxPaddingUntilFeasible = (group, relaxedVisits) => {
      const groupShortfalls = [];
      let variables = buildVariablesFor(group, groupShortfalls, relaxedVisits, true);
      const deferredPaddingShortfalls = [];
      for (let variableIndex = 0; variableIndex < variables.length; variableIndex += 1) {
        const ref = group.members[variableIndex];
        for (const rule of variablePaddingRules(world, routes, group.corridorIndex, ref)) {
          const variable = variables[variableIndex];
          const padded = insetSpan(rule.container, rule.padding, EPSILON5);
          const bounds = padded ? intersectSpans([variable.lower, variable.upper], padded, EPSILON5) : void 0;
          if (!bounds) {
            groupShortfalls.push({
              kind: rule.kind,
              corridorIndex: group.corridorIndex,
              routeIndexes: [ref.routeIndex],
              visitIndexes: [ref.visitIndex],
              required: rule.padding,
              achieved: maximumClearance([variable.lower, variable.upper], rule.container)
            });
            continue;
          }
          const candidateVariables = variables.slice();
          candidateVariables[variableIndex] = {
            ...variable,
            lower: bounds[0],
            upper: bounds[1]
          };
          const candidateUnits = buildUnits(group, candidateVariables, [], workspace);
          if (canFitOrderedSpacingGap(candidateUnits, void 0, 0)) {
            variables = candidateVariables;
          } else {
            deferredPaddingShortfalls.push({ ref, rule });
          }
        }
      }
      return {
        units: buildUnits(group, variables, groupShortfalls, workspace),
        shortfalls: groupShortfalls,
        deferredPaddingShortfalls
      };
    };
    for (const group of ordering.groups) {
      if (selective && !selective.activeCorridorIndexes.has(group.corridorIndex)) {
        continue;
      }
      const continued = continuedCorridors.has(group.corridorIndex);
      const strictShortfalls = [];
      const strictVariables = buildVariablesFor(group, strictShortfalls, void 0);
      const strictUnits2 = buildUnits(group, strictVariables, strictShortfalls, workspace);
      const strictContentionComponents = buildContentionComponents(
        strictUnits2,
        workspace.contentionUnionFind
      );
      const mandatoryRelaxedVisits = continued ? /* @__PURE__ */ new Set() : congestedTurnVisits(
        world,
        routes,
        strictUnits2,
        strictContentionComponents,
        2,
        true,
        COMPONENT_SOLVER_TOLERANCE
      );
      const candidateRelaxedVisits = options.turnRetrackCorridors?.has(group.corridorIndex) ? congestedTurnVisits(
        world,
        routes,
        strictUnits2,
        strictContentionComponents,
        Number.POSITIVE_INFINITY,
        false,
        Number.POSITIVE_INFINITY
      ) : /* @__PURE__ */ new Set();
      const relaxedVisits = /* @__PURE__ */ new Set([...mandatoryRelaxedVisits, ...candidateRelaxedVisits]);
      let groupShortfalls = relaxedVisits.size === 0 ? strictShortfalls : [];
      const variables = relaxedVisits.size === 0 ? strictVariables : buildVariablesFor(group, groupShortfalls, relaxedVisits);
      let units = relaxedVisits.size === 0 ? strictUnits2 : buildUnits(group, variables, groupShortfalls, workspace);
      let deferredPaddingShortfalls;
      if (!continued && !canFitOrderedSpacingGap(units, void 0, 0)) {
        const relaxed = relaxPaddingUntilFeasible(group, relaxedVisits);
        groupShortfalls = relaxed.shortfalls;
        units = relaxed.units;
        deferredPaddingShortfalls = relaxed.deferredPaddingShortfalls;
      }
      shortfalls.push(...groupShortfalls);
      const contentionComponents = units === strictUnits2 ? strictContentionComponents : buildContentionComponents(units, workspace.contentionUnionFind);
      const work = {
        group,
        units,
        contentionComponents,
        deferredPaddingShortfalls
      };
      if (continued) {
        continuedWorks.push(work);
      } else {
        addKernelMetrics(
          solveIndependentCorridor(work, tracksByRoute, shortfalls, qualityLedger, workspace)
        );
      }
    }
    const continuedResult = solveContinuedCorridors(
      world,
      routes,
      continuedWorks,
      tracksByRoute,
      shortfalls,
      options.independentContinuations ?? [],
      options.terminalCenterContinuations ?? false,
      options.continuationTrackClearance ?? false,
      qualityLedger,
      workspace
    );
    addKernelMetrics(continuedResult.metrics);
    const turnRealizationsByRoute = buildTurnBoundaryRealizations(world, routes, tracksByRoute);
    const continuationPolicies = mergeContinuationPolicies(
      routes,
      selective,
      continuedResult.policies
    );
    const boundaryRealizationsByRoute = routes.map((route, routeIndex) => {
      const retainedContinuations = selective ? baselineContinuationRealizations(
        route,
        selective.baseline.routes[routeIndex],
        selective.activeCorridorIndexes,
        selective.reusableRouteIndexes.has(routeIndex)
      ) : [];
      return [
        ...retainedContinuations,
        ...continuedResult.boundaryRealizationsByRoute[routeIndex],
        ...turnRealizationsByRoute[routeIndex]
      ].sort((left, right) => left.afterVisitIndex - right.afterVisitIndex);
    });
    let variableCount = 0;
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      if (route.visits.length === 0) {
        continue;
      }
      variableCount += route.visits.length;
      for (let visitIndex = 0; visitIndex < route.visits.length; visitIndex += 1) {
        if (!Number.isFinite(tracksByRoute[routeIndex][visitIndex])) {
          throw new Error(`route ${route.requestIndex}: visit ${visitIndex} was not spaced`);
        }
      }
    }
    if (selective) {
      normalizeSpacingQualitySources(qualityLedger, ordering, continuedCorridors);
    }
    return {
      tracksByRoute,
      boundaryRealizationsByRoute,
      spacing: {
        shortfalls: selective ? orderSpacingShortfalls(shortfalls, ordering, continuedCorridors) : shortfalls,
        continuations: continuationPolicies,
        quality: qualityLedger.snapshot(),
        metrics: {
          variableCount,
          shortfallCount: shortfalls.length,
          ...kernelMetrics
        }
      }
    };
  }
  function commitSpacing(routes, solved) {
    routes.forEach((route, routeIndex) => {
      if (route.visits.length === 0) {
        return;
      }
      route.setNominalTracks(
        solved.tracksByRoute[routeIndex],
        solved.boundaryRealizationsByRoute[routeIndex]
      );
    });
  }
  function reusableIncrementalRouteIndexes(routes, baselineRoutes, activeCorridorIndexes) {
    if (routes.length !== baselineRoutes.length) {
      throw new Error("corridor spacing: incremental baseline route count changed");
    }
    const reusable = /* @__PURE__ */ new Set();
    routes.forEach((route, routeIndex) => {
      const baseline = baselineRoutes[routeIndex];
      if (route.requestIndex !== baseline.requestIndex) {
        throw new Error(`corridor spacing: incremental baseline route ${routeIndex} changed request`);
      }
      if (haveSameSpacingInputs(route, baseline)) {
        reusable.add(routeIndex);
        return;
      }
      for (const visit of route.visits) {
        activeCorridorIndexes.add(visit.corridorIndex);
      }
      for (const visit of baseline.visits) {
        activeCorridorIndexes.add(visit.corridorIndex);
      }
    });
    return reusable;
  }
  function boundaryIdentity(boundary) {
    return boundary.kind === "terminal" ? `terminal:${boundary.attachmentIndex}` : `portal:${boundary.portalIndex}:${boundary.mode}`;
  }
  function sameSpacingEndpoint(left, right) {
    return left.entityIndex === right.entityIndex && left.face === right.face && left.hasArrowhead === right.hasArrowhead && left.authoredTrack === right.authoredTrack && left.repairPinTrack === right.repairPinTrack && left.portGroup === right.portGroup;
  }
  function spacingPinTrack(endpoint) {
    return endpoint.authoredTrack ?? endpoint.repairPinTrack;
  }
  function expandStraightContinuationCorridors(routes, corridorIndexes) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const route of routes) {
        for (let visitIndex = 1; visitIndex < route.visits.length; visitIndex += 1) {
          const entry = route.visits[visitIndex].entry;
          if (entry.kind !== "portal" || entry.mode !== "continue-straight") {
            continue;
          }
          const before = route.visits[visitIndex - 1].corridorIndex;
          const after = route.visits[visitIndex].corridorIndex;
          if (!corridorIndexes.has(before) && !corridorIndexes.has(after)) {
            continue;
          }
          const oldSize = corridorIndexes.size;
          corridorIndexes.add(before);
          corridorIndexes.add(after);
          changed = changed || corridorIndexes.size !== oldSize;
        }
      }
    }
  }
  function mergeContinuationPolicies(routes, selective, activePolicies) {
    if (!selective) {
      return [...activePolicies];
    }
    const retained = selective.baseline.spacing.continuations.filter((policy) => {
      if (!selective.reusableRouteIndexes.has(policy.routeIndex)) {
        return false;
      }
      const route = routes[policy.routeIndex];
      const beforeCorridorIndex = route.visits[policy.afterVisitIndex - 1].corridorIndex;
      const afterCorridorIndex = route.visits[policy.afterVisitIndex].corridorIndex;
      return !selective.activeCorridorIndexes.has(beforeCorridorIndex) && !selective.activeCorridorIndexes.has(afterCorridorIndex);
    });
    return [...retained, ...activePolicies].sort(
      (left, right) => left.routeIndex - right.routeIndex || left.afterVisitIndex - right.afterVisitIndex
    );
  }
  function normalizeSpacingQualitySources(qualityLedger, ordering, continuedCorridors) {
    const sourceByCorridor = new Map(
      qualityLedger.snapshot().sources.flatMap((source) => {
        const corridorIndex = spacingQualitySourceCorridorIndex(source.source);
        return corridorIndex === void 0 ? [] : [[corridorIndex, source]];
      })
    );
    qualityLedger.removeStage("spacing");
    const orderedGroups = [
      ...ordering.groups.filter((group) => !continuedCorridors.has(group.corridorIndex)),
      ...ordering.groups.filter((group) => continuedCorridors.has(group.corridorIndex))
    ];
    for (const group of orderedGroups) {
      const source = sourceByCorridor.get(group.corridorIndex);
      if (source) {
        qualityLedger.replaceSource(source.source, source.stage, source.events, source.scalarCosts);
      }
    }
  }
  function baselineContinuationRealizations(route, baselineRoute, activeCorridorIndexes, reusable) {
    if (!reusable) {
      return [];
    }
    const retained = [];
    for (let afterVisitIndex = 1; afterVisitIndex < route.visits.length; afterVisitIndex += 1) {
      const realization = baselineRoute.boundaryRealizationAfter(afterVisitIndex);
      if (realization?.kind !== "continue-retrack") {
        continue;
      }
      const beforeCorridorIndex = route.visits[afterVisitIndex - 1].corridorIndex;
      const afterCorridorIndex = route.visits[afterVisitIndex].corridorIndex;
      if (!activeCorridorIndexes.has(beforeCorridorIndex) && !activeCorridorIndexes.has(afterCorridorIndex)) {
        retained.push(realization);
      }
    }
    return retained;
  }
  function orderSpacingShortfalls(shortfalls, ordering, continuedCorridors) {
    const rankByCorridor = /* @__PURE__ */ new Map();
    [
      ...ordering.groups.filter((group) => !continuedCorridors.has(group.corridorIndex)),
      ...ordering.groups.filter((group) => continuedCorridors.has(group.corridorIndex))
    ].forEach((group, rank) => rankByCorridor.set(group.corridorIndex, rank));
    return shortfalls.map((shortfall2, index) => ({ shortfall: shortfall2, index })).sort(
      (left, right) => (rankByCorridor.get(left.shortfall.corridorIndex) ?? Number.MAX_SAFE_INTEGER) - (rankByCorridor.get(right.shortfall.corridorIndex) ?? Number.MAX_SAFE_INTEGER) || left.index - right.index
    ).map(({ shortfall: shortfall2 }) => shortfall2);
  }
  function solveIndependentCorridor(work, tracksByRoute, shortfalls, qualityLedger, workspace) {
    const constraints = work.contentionComponents.flatMap(
      (indexes) => indexes.slice(1).map((afterIndex, index) => ({
        before: indexes[index],
        after: afterIndex,
        gap: MIN_TRACK_SEPARATION_PX
      }))
    );
    let solved;
    try {
      solved = solveSpacingKernel(work.units, constraints, workspace.kernel);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (error instanceof InfeasibleSpacingComponentError) {
        throw new CorridorSpacingError(
          work.group.corridorIndex,
          work.group.members.map((member) => member.routeIndex),
          message,
          { cause: error }
        );
      }
      throw new Error(`corridor ${work.group.corridorIndex}: ${message}`, { cause: error });
    }
    for (const reduction of solved.capacityReductions) {
      shortfalls.push(
        reductionShortfall("minimum-separation", work.group.corridorIndex, reduction, work.units)
      );
    }
    for (const reduction of solved.quantizationReductions) {
      shortfalls.push(
        reductionShortfall("quantization", work.group.corridorIndex, reduction, work.units)
      );
    }
    commitUnitTracks(work.units, solved.tracks, tracksByRoute);
    for (const { ref, rule } of work.deferredPaddingShortfalls ?? []) {
      const track = tracksByRoute[ref.routeIndex][ref.visitIndex];
      const achieved = Math.max(0, Math.min(track - rule.container[0], rule.container[1] - track));
      if (achieved >= rule.padding - EPSILON5) {
        continue;
      }
      shortfalls.push({
        kind: rule.kind,
        corridorIndex: work.group.corridorIndex,
        routeIndexes: [ref.routeIndex],
        visitIndexes: [ref.visitIndex],
        required: rule.padding,
        achieved
      });
    }
    qualityLedger.replaceSource(
      spacingQualitySource(work.group.corridorIndex),
      "spacing",
      spacingQualityEvents(work, tracksByRoute),
      spacingScalarCosts(solved.objective)
    );
    return solved.metrics;
  }
  function congestedTurnVisits(world, routes, units, contentionComponents, maximumVisitCount = Number.POSITIVE_INFINITY, requirePinnedVisit = false, capacityTolerance = EPSILON5) {
    const result = /* @__PURE__ */ new Set();
    for (const componentIndexes of contentionComponents) {
      let visitCount = 0;
      let pinnedVisitCount = 0;
      for (const unitIndex of componentIndexes) {
        const unit = units[unitIndex];
        visitCount += unit.members.length;
        if (requirePinnedVisit) {
          for (const member of unit.members) {
            const span = routes[member.ref.routeIndex].visits[member.ref.visitIndex].feasibleTrack;
            if (span[1] - span[0] <= COMPONENT_SOLVER_TOLERANCE) {
              pinnedVisitCount += 1;
            }
          }
        }
      }
      if (visitCount > maximumVisitCount) {
        continue;
      }
      if (requirePinnedVisit && pinnedVisitCount !== 1) {
        continue;
      }
      if (capacityTolerance !== Number.POSITIVE_INFINITY && maximumFeasibleSpacingGap(units, componentIndexes, MIN_TRACK_SEPARATION_PX) > capacityTolerance) {
        continue;
      }
      for (const unitIndex of componentIndexes) {
        const unit = units[unitIndex];
        if (unit.authored) {
          continue;
        }
        for (const member of unit.members) {
          const route = routes[member.ref.routeIndex];
          const visit = route.visits[member.ref.visitIndex];
          const corridor = world.indexer.corridors[visit.corridorIndex];
          const corridorCross = corridorCrossSpan(corridor);
          const hasTurn = visit.entry.kind === "portal" && visit.entry.mode === "turn" || visit.exit.kind === "portal" && visit.exit.mode === "turn";
          if (hasTurn && (visit.feasibleTrack[0] > corridorCross[0] + EPSILON5 || visit.feasibleTrack[1] < corridorCross[1] - EPSILON5)) {
            result.add(visitKey(member.ref.routeIndex, member.ref.visitIndex));
          }
        }
      }
    }
    return result;
  }
  function straightContinuationCorridors(routes) {
    const result = /* @__PURE__ */ new Set();
    for (const route of routes) {
      for (let visitIndex = 1; visitIndex < route.visits.length; visitIndex += 1) {
        const entry = route.visits[visitIndex].entry;
        if (entry.kind === "portal" && entry.mode === "continue-straight") {
          result.add(route.visits[visitIndex - 1].corridorIndex);
          result.add(route.visits[visitIndex].corridorIndex);
        }
      }
    }
    return result;
  }
  function solveContinuedCorridors(world, routes, works, tracksByRoute, shortfalls, independentContinuations, terminalCenterContinuations, continuationTrackClearance, qualityLedger, workspace) {
    if (works.length === 0) {
      return {
        metrics: { converged: true, quantizationViolationCount: 0 },
        boundaryRealizationsByRoute: routes.map(() => []),
        policies: []
      };
    }
    const localUnits = [];
    const unitOffsetByCorridor = /* @__PURE__ */ new Map();
    const unitByVisit = /* @__PURE__ */ new Map();
    const continuations = [];
    let unitOffset = 0;
    for (const work of works) {
      localUnits.push(...work.units);
      unitOffsetByCorridor.set(work.group.corridorIndex, unitOffset);
      work.units.forEach((unit, localIndex) => {
        for (const member of unit.members) {
          unitByVisit.set(
            visitKey(member.ref.routeIndex, member.ref.visitIndex),
            unitOffset + localIndex
          );
        }
      });
      unitOffset += work.units.length;
    }
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      for (let visitIndex = 1; visitIndex < route.visits.length; visitIndex += 1) {
        const entry = route.visits[visitIndex].entry;
        if (entry.kind !== "portal" || entry.mode !== "continue-straight") {
          continue;
        }
        const before = unitByVisit.get(visitKey(routeIndex, visitIndex - 1));
        const after = unitByVisit.get(visitKey(routeIndex, visitIndex));
        if (before === void 0 && after === void 0) {
          continue;
        }
        if (before === void 0 || after === void 0) {
          throw new Error(`route ${route.requestIndex}: continuation spacing unit missing`);
        }
        continuations.push({
          routeIndex,
          afterVisitIndex: visitIndex,
          beforeLocalUnit: before,
          afterLocalUnit: after
        });
      }
    }
    const continuationKeys = continuationKeySet(continuations);
    let policyPlan = planContinuationPolicies(
      world,
      routes,
      localUnits,
      continuations,
      independentContinuations.filter(
        ({ routeIndex, afterVisitIndex }) => continuationKeys.has(continuationKey(routeIndex, afterVisitIndex))
      ),
      terminalCenterContinuations,
      workspace.continuationUnionFind,
      CONTINUATION_POLICY_TUNING
    );
    const attempt = (flexibleContinuations) => solveContinuedConfiguration(
      world,
      routes,
      works,
      localUnits,
      unitOffsetByCorridor,
      continuations,
      flexibleContinuations,
      tracksByRoute,
      continuationTrackClearance,
      workspace
    );
    let best = attempt(policyPlan.flexibleContinuations);
    const ladderFellThrough = best.metrics.quantizationViolationCount > 0;
    if (ladderFellThrough && policyPlan.flexibleContinuations.length > 0) {
      best = attempt([]);
    }
    if (ladderFellThrough) {
      policyPlan = {
        flexibleContinuations: [],
        policies: policyPlan.policies.map(
          (policy) => policy.policy === "independent" ? { ...policy, policy: "equal", reason: "solver-fallback" } : policy
        )
      };
    }
    best.tracksByRoute.forEach((tracks, routeIndex) => {
      tracks.forEach((track, visitIndex) => {
        if (Number.isFinite(track)) {
          tracksByRoute[routeIndex][visitIndex] = track;
        }
      });
    });
    shortfalls.push(...best.shortfalls);
    for (const work of works) {
      qualityLedger.replaceSource(
        spacingQualitySource(work.group.corridorIndex),
        "spacing",
        spacingQualityEvents(work, tracksByRoute),
        spacingScalarCosts(best.desireCostByCorridor.get(work.group.corridorIndex) ?? 0)
      );
    }
    return {
      metrics: best.metrics,
      boundaryRealizationsByRoute: best.boundaryRealizationsByRoute,
      policies: policyPlan.policies
    };
  }
  function solveContinuedConfiguration(world, routes, works, localUnits, unitOffsetByCorridor, continuations, flexibleContinuations, baseTracksByRoute, continuationTrackClearance, workspace) {
    const flexibleKeys = continuationKeySet(flexibleContinuations);
    const rootByLocal = continuationRoots(
      localUnits.length,
      continuations,
      flexibleKeys,
      workspace.continuationUnionFind
    );
    const shortfalls = [];
    const localIndexesByRoot = /* @__PURE__ */ new Map();
    localUnits.forEach((_, localIndex) => {
      const root = rootByLocal[localIndex];
      const indexes = localIndexesByRoot.get(root) ?? [];
      indexes.push(localIndex);
      localIndexesByRoot.set(root, indexes);
    });
    const globalUnits = [];
    const globalByLocal = new Int32Array(localUnits.length);
    for (const indexes of [...localIndexesByRoot.values()].sort((a, b) => a[0] - b[0])) {
      const merged = mergeContinuationComponentUnit(routes, localUnits, indexes);
      if (merged.emptyPaddedBounds) {
        if (merged.emptyPaddedBounds.rawInfeasible) {
          throw new Error("corridor spacing: A* committed an empty straight-continuation track");
        }
        shortfalls.push({
          ...shortfall(
            "straight-continuation",
            memberCorridorIndex(routes, merged.unit.members),
            merged.unit.members,
            0,
            merged.emptyPaddedBounds.achieved
          ),
          reason: "empty-padded-intersection",
          candidateContinuations: reducingPaddedContinuationCuts(
            indexes,
            localUnits,
            continuations,
            flexibleKeys,
            workspace
          )
        });
      }
      const globalIndex = globalUnits.length;
      globalUnits.push(merged.unit);
      for (const localIndex of indexes) {
        globalByLocal[localIndex] = globalIndex;
      }
    }
    const constraintsByPair = /* @__PURE__ */ new Map();
    for (const work of works) {
      const offset = unitOffsetByCorridor.get(work.group.corridorIndex);
      const occupants = [];
      const occupantGlobalIndexes = [];
      for (let localIndex = 0; localIndex < work.units.length; localIndex += 1) {
        const globalIndex = globalByLocal[offset + localIndex];
        const existingIndex = occupantGlobalIndexes.indexOf(globalIndex);
        if (existingIndex >= 0) {
          const existing = occupants[existingIndex];
          occupants[existingIndex] = {
            ...existing,
            members: [...existing.members, ...work.units[localIndex].members]
          };
        } else {
          occupants.push({
            ...globalUnits[globalIndex],
            members: work.units[localIndex].members
          });
          occupantGlobalIndexes.push(globalIndex);
        }
      }
      const occupantContentionComponents = buildContentionComponents(
        occupants,
        workspace.contentionUnionFind
      );
      for (const componentIndexes of occupantContentionComponents) {
        const continuousGap = maximumFeasibleSpacingGap(
          occupants,
          componentIndexes,
          MIN_TRACK_SEPARATION_PX
        );
        const gap = continuousGap >= MIN_TRACK_SEPARATION_PX - EPSILON5 ? MIN_TRACK_SEPARATION_PX : Math.floor(continuousGap + EPSILON5);
        if (gap < MIN_TRACK_SEPARATION_PX - EPSILON5) {
          const members = [];
          for (const componentIndex of componentIndexes) {
            members.push(...occupants[componentIndex].members);
          }
          shortfalls.push(
            shortfall(
              "minimum-separation",
              work.group.corridorIndex,
              members,
              MIN_TRACK_SEPARATION_PX,
              gap
            )
          );
        }
        if (gap < 0) {
          continue;
        }
        for (let index = 1; index < componentIndexes.length; index += 1) {
          const before = occupantGlobalIndexes[componentIndexes[index - 1]];
          const after = occupantGlobalIndexes[componentIndexes[index]];
          if (mergeConstraint(constraintsByPair, before, after, gap)) {
            const members = [...globalUnits[before].members, ...globalUnits[after].members];
            shortfalls.push(
              shortfall("straight-continuation", work.group.corridorIndex, members, gap, 0)
            );
          }
        }
      }
    }
    addBoundaryBundleConstraints(
      world,
      routes,
      flexibleContinuations,
      globalByLocal,
      constraintsByPair,
      globalUnits,
      shortfalls
    );
    let solved;
    try {
      solved = solveSpacingKernel(globalUnits, [...constraintsByPair.values()], workspace.kernel);
    } catch (error) {
      if (!(error instanceof InfeasibleSpacingComponentError)) {
        throw error;
      }
      const members = error.unitIndexes.flatMap((unitIndex) => globalUnits[unitIndex]?.members ?? []);
      const corridorIndexes = new Set(
        members.map(
          (member) => routes[member.ref.routeIndex].visits[member.ref.visitIndex].corridorIndex
        )
      );
      const failedWorks = works.filter((work) => corridorIndexes.has(work.group.corridorIndex));
      throw new CorridorSpacingError(
        failedWorks.map((work) => work.group.corridorIndex),
        failedWorks.flatMap((work) => work.group.members.map((member) => member.routeIndex)),
        error.message,
        { cause: error }
      );
    }
    for (const reduction of solved.capacityReductions) {
      const firstUnit = globalUnits[reduction.unitIndexes[0]];
      shortfalls.push(
        reductionShortfall(
          "straight-continuation",
          memberCorridorIndex(routes, firstUnit.members),
          reduction,
          globalUnits
        )
      );
    }
    for (const reduction of solved.quantizationReductions) {
      const firstUnit = globalUnits[reduction.unitIndexes[0]];
      shortfalls.push(
        reductionShortfall(
          "quantization",
          memberCorridorIndex(routes, firstUnit.members),
          reduction,
          globalUnits
        )
      );
    }
    const tracksByRoute = baseTracksByRoute.map((tracks) => Float64Array.from(tracks));
    const desireCostByCorridor = /* @__PURE__ */ new Map();
    globalUnits.forEach((unit, index) => {
      const corridorIndex = memberCorridorIndex(routes, unit.members);
      desireCostByCorridor.set(
        corridorIndex,
        (desireCostByCorridor.get(corridorIndex) ?? 0) + solved.unitCosts[index]
      );
      for (const member of unit.members) {
        tracksByRoute[member.ref.routeIndex][member.ref.visitIndex] = solved.tracks[index];
      }
    });
    return {
      metrics: solved.metrics,
      tracksByRoute,
      shortfalls,
      desireCostByCorridor,
      boundaryRealizationsByRoute: buildContinuationBoundaryRealizations(
        world,
        routes,
        tracksByRoute,
        flexibleContinuations,
        CONTINUATION_GEOMETRY_TUNING,
        continuationTrackClearance
      )
    };
  }
  function reducingPaddedContinuationCuts(localIndexes, localUnits, continuations, flexibleKeys, workspace) {
    const indexSet = new Set(localIndexes);
    const strictEdges = continuations.filter(
      (continuation) => !flexibleKeys.has(continuationKey(continuation.routeIndex, continuation.afterVisitIndex)) && indexSet.has(continuation.beforeLocalUnit) && indexSet.has(continuation.afterLocalUnit) && continuation.beforeLocalUnit !== continuation.afterLocalUnit
    );
    const incumbentViolation = paddedComponentViolation(localIndexes, localUnits);
    const result = [];
    for (const candidate of strictEdges) {
      const candidateViolation = paddedViolationWithoutBoundary(
        localIndexes,
        localUnits,
        strictEdges,
        candidate,
        workspace.paddedCut
      );
      if (candidateViolation < incumbentViolation - EPSILON5) {
        result.push({
          boundary: {
            routeIndex: candidate.routeIndex,
            afterVisitIndex: candidate.afterVisitIndex
          },
          remainingViolation: candidateViolation
        });
      }
    }
    return result.sort(
      (left, right) => left.remainingViolation - right.remainingViolation || left.boundary.routeIndex - right.boundary.routeIndex || left.boundary.afterVisitIndex - right.boundary.afterVisitIndex
    ).map((candidate) => candidate.boundary);
  }
  function paddedComponentViolation(localIndexes, localUnits) {
    let lower = Number.NEGATIVE_INFINITY;
    let upper = Number.POSITIVE_INFINITY;
    for (const index of localIndexes) {
      lower = Math.max(lower, localUnits[index].lower);
      upper = Math.min(upper, localUnits[index].upper);
    }
    return Math.max(0, lower - upper);
  }
  function paddedViolationWithoutBoundary(localIndexes, localUnits, edges, removed, workspace) {
    workspace.unionFind.reset(localUnits.length);
    for (const edge of edges) {
      if (edge.routeIndex !== removed.routeIndex || edge.afterVisitIndex !== removed.afterVisitIndex) {
        workspace.unionFind.unionMin(edge.beforeLocalUnit, edge.afterLocalUnit);
      }
    }
    if (localUnits.length > workspace.lowerBounds.length) {
      const capacity = Math.max(localUnits.length, workspace.lowerBounds.length * 2, 1);
      workspace.lowerBounds = new Float64Array(capacity);
      workspace.upperBounds = new Float64Array(capacity);
      workspace.boundMarks = new Uint32Array(capacity);
    }
    workspace.generation += 1;
    if (workspace.generation === 4294967295) {
      workspace.boundMarks.fill(0);
      workspace.generation = 1;
    }
    workspace.roots.length = 0;
    for (const index of localIndexes) {
      const componentRoot = workspace.unionFind.find(index);
      const unit = localUnits[index];
      if (workspace.boundMarks[componentRoot] !== workspace.generation) {
        workspace.boundMarks[componentRoot] = workspace.generation;
        workspace.lowerBounds[componentRoot] = unit.lower;
        workspace.upperBounds[componentRoot] = unit.upper;
        workspace.roots.push(componentRoot);
      } else {
        workspace.lowerBounds[componentRoot] = Math.max(
          workspace.lowerBounds[componentRoot],
          unit.lower
        );
        workspace.upperBounds[componentRoot] = Math.min(
          workspace.upperBounds[componentRoot],
          unit.upper
        );
      }
    }
    let violation = 0;
    for (const componentRoot of workspace.roots) {
      violation += Math.max(
        0,
        workspace.lowerBounds[componentRoot] - workspace.upperBounds[componentRoot]
      );
    }
    return violation;
  }
  function addBoundaryBundleConstraints(world, routes, continuations, globalByLocal, constraints, globalUnits, shortfalls) {
    const bundles = /* @__PURE__ */ new Map();
    for (const continuation of continuations) {
      const route = routes[continuation.routeIndex];
      const placement = continuationBundlePlacement(world, route, continuation);
      const hostBefore = placement.hostVisitIndex === continuation.afterVisitIndex - 1;
      const hostLocalUnit = hostBefore ? continuation.beforeLocalUnit : continuation.afterLocalUnit;
      const mouthLocalUnit = hostBefore ? continuation.afterLocalUnit : continuation.beforeLocalUnit;
      const members = bundles.get(placement.key) ?? [];
      members.push({
        routeIndex: continuation.routeIndex,
        hostCorridorIndex: placement.hostCorridorIndex,
        mouthVisitIndex: placement.mouthVisitIndex,
        hostGlobalUnit: globalByLocal[hostLocalUnit],
        mouthGlobalUnit: globalByLocal[mouthLocalUnit]
      });
      bundles.set(placement.key, members);
    }
    for (const members of bundles.values()) {
      const ordered = [...members].sort(
        (left, right) => routes[left.routeIndex].orderOf(left.mouthVisitIndex) - routes[right.routeIndex].orderOf(right.mouthVisitIndex) || left.routeIndex - right.routeIndex
      );
      for (const unitField of ["mouthGlobalUnit", "hostGlobalUnit"]) {
        const seen = /* @__PURE__ */ new Set();
        const unique = ordered.filter((member) => {
          if (seen.has(member[unitField])) {
            return false;
          }
          seen.add(member[unitField]);
          return true;
        });
        for (let index = 1; index < unique.length; index += 1) {
          const before = unique[index - 1][unitField];
          const after = unique[index][unitField];
          if (!mergeConstraint(constraints, before, after, MIN_TRACK_SEPARATION_PX)) {
            continue;
          }
          const conflicting = [...globalUnits[before].members, ...globalUnits[after].members];
          shortfalls.push(
            shortfall(
              "straight-continuation",
              unique[index].hostCorridorIndex,
              conflicting,
              MIN_TRACK_SEPARATION_PX,
              0
            )
          );
        }
      }
    }
  }
  function buildTurnBoundaryRealizations(world, routes, tracksByRoute) {
    const result = routes.map(() => []);
    routes.forEach((route, routeIndex) => {
      result[routeIndex].push(
        ...buildRouteTurnBoundaryRealizations(world, route, routeIndex, tracksByRoute)
      );
    });
    return packTurnPortalLegs(world, routes, tracksByRoute, result);
  }
  function buildRouteTurnBoundaryRealizations(world, route, routeIndex, tracksByRoute) {
    const result = [];
    for (let afterVisitIndex = 1; afterVisitIndex < route.visits.length; afterVisitIndex += 1) {
      const boundary = route.visits[afterVisitIndex].entry;
      if (boundary.kind !== "portal" || boundary.mode !== "turn") {
        continue;
      }
      const portal = world.indexer.portals[boundary.portalIndex];
      if (portal.kind !== "turn") {
        throw new Error(`route ${route.requestIndex}: turn portal missing`);
      }
      const beforeVisitIndex = afterVisitIndex - 1;
      const beforeCorridor = world.indexer.corridors[route.visits[beforeVisitIndex].corridorIndex];
      const afterCorridor = world.indexer.corridors[route.visits[afterVisitIndex].corridorIndex];
      const beforeTrack = tracksByRoute[routeIndex][beforeVisitIndex];
      const afterTrack = tracksByRoute[routeIndex][afterVisitIndex];
      const beforeSpan = turnPortalCrossSpan(portal, beforeCorridor.axis);
      const afterSpan = turnPortalCrossSpan(portal, afterCorridor.axis);
      const beforePortalTrack = clamp(beforeTrack, beforeSpan[0], beforeSpan[1]);
      const afterPortalTrack = clamp(afterTrack, afterSpan[0], afterSpan[1]);
      const shifts = [];
      if (!coordinateInSpan(beforeTrack, beforeSpan, EPSILON5)) {
        shifts.push({
          hostVisitIndex: beforeVisitIndex,
          shiftCoordinate: turnShiftCoordinate(
            world,
            beforeCorridor,
            afterPortalTrack,
            route.visits[beforeVisitIndex].entry
          ),
          trackAfter: beforePortalTrack
        });
      }
      if (!coordinateInSpan(afterTrack, afterSpan, EPSILON5)) {
        shifts.push({
          hostVisitIndex: afterVisitIndex,
          shiftCoordinate: turnShiftCoordinate(
            world,
            afterCorridor,
            beforePortalTrack,
            route.visits[afterVisitIndex].exit
          ),
          trackAfter: afterTrack
        });
      }
      if (shifts.length > 0) {
        result.push({
          kind: "turn-retrack",
          afterVisitIndex,
          beforePortalTrack,
          afterPortalTrack,
          shifts
        });
      }
    }
    return result;
  }
  function packTurnPortalLegs(world, routes, tracksByRoute, realizationsByRoute) {
    const shifts = turnShiftRefs(world, routes, tracksByRoute, realizationsByRoute);
    const coordinateByShift = new Map(
      shifts.map((shift) => [turnShiftKey(shift), shift.shiftCoordinate])
    );
    const groups = /* @__PURE__ */ new Map();
    for (const shift of shifts) {
      const key = `${shift.hostAxis}:${shift.portalTrack}`;
      const group = groups.get(key) ?? [];
      group.push(shift);
      groups.set(key, group);
    }
    for (const group of groups.values()) {
      const ordered = [...group].sort(
        (left, right) => left.portalCoordinate - right.portalCoordinate || left.routeIndex - right.routeIndex
      );
      for (let index = 1; index < ordered.length; index += 1) {
        const left = ordered[index - 1];
        const right = ordered[index];
        const leftKey = turnShiftKey(left);
        const rightKey = turnShiftKey(right);
        let leftCoordinate = coordinateByShift.get(leftKey);
        let rightCoordinate = coordinateByShift.get(rightKey);
        const leftEntersGap = leftCoordinate > left.portalCoordinate + EPSILON5;
        const rightEntersGap = rightCoordinate < right.portalCoordinate - EPSILON5;
        if (!leftEntersGap && !rightEntersGap) {
          continue;
        }
        if (leftEntersGap && rightEntersGap) {
          const middle = (left.portalCoordinate + right.portalCoordinate) / 2;
          leftCoordinate = Math.min(
            leftCoordinate,
            Math.floor(middle - MIN_TRACK_SEPARATION_PX / 2 + EPSILON5)
          );
          rightCoordinate = Math.max(
            rightCoordinate,
            Math.ceil(middle + MIN_TRACK_SEPARATION_PX / 2 - EPSILON5)
          );
          leftCoordinate = nudgeTowardPortal(left, right, leftCoordinate);
          rightCoordinate = nudgeTowardPortal(right, left, rightCoordinate);
        } else if (leftEntersGap) {
          leftCoordinate = Math.min(leftCoordinate, right.portalCoordinate - MIN_TRACK_SEPARATION_PX);
        } else {
          rightCoordinate = Math.max(
            rightCoordinate,
            left.portalCoordinate + MIN_TRACK_SEPARATION_PX
          );
        }
        coordinateByShift.set(
          leftKey,
          clampTowardPortal(leftCoordinate, left.portalCoordinate, left.shiftCoordinate)
        );
        coordinateByShift.set(
          rightKey,
          clampTowardPortal(rightCoordinate, right.portalCoordinate, right.shiftCoordinate)
        );
      }
      if (!groupIsCertified(ordered, coordinateByShift)) {
        for (const shift of group) {
          coordinateByShift.set(turnShiftKey(shift), shift.shiftCoordinate);
        }
      }
    }
    return realizationsByRoute.map(
      (realizations, routeIndex) => realizations.map((realization, realizationIndex) => {
        if (realization.kind !== "turn-retrack") {
          return realization;
        }
        return {
          ...realization,
          shifts: realization.shifts.map((shift, shiftIndex) => ({
            ...shift,
            shiftCoordinate: coordinateByShift.get(turnShiftKey({ routeIndex, realizationIndex, shiftIndex })) ?? shift.shiftCoordinate
          }))
        };
      })
    );
  }
  function clampTowardPortal(candidate, portal, desired) {
    return Math.round(clamp(candidate, Math.min(portal, desired), Math.max(portal, desired)));
  }
  function nearPortalShiftCoordinate(shift) {
    return shift.portalCoordinate + Math.sign(shift.shiftCoordinate - shift.portalCoordinate) * CORRIDOR_EDGE_PADDING_PX;
  }
  function turnShiftKey(shift) {
    return `${shift.routeIndex}:${shift.realizationIndex}:${shift.shiftIndex}`;
  }
  function nudgeTowardPortal(shift, neighbor, coordinate) {
    const nearPortal = nearPortalShiftCoordinate(shift);
    if (strictlyInside(neighbor.routeTrack, shift.routeTrack, shift.portalTrack) && !coordinateInSpan(nearPortal, neighbor.routeRun, EPSILON5)) {
      return nearPortal;
    }
    return coordinate;
  }
  function groupIsCertified(ordered, coordinateByShift) {
    return ordered.slice(1).every((right, index) => {
      const left = ordered[index];
      const available = right.portalCoordinate - left.portalCoordinate;
      const leftEnd = Math.max(
        left.portalCoordinate,
        coordinateByShift.get(turnShiftKey(left))
      );
      const rightStart = Math.min(
        right.portalCoordinate,
        coordinateByShift.get(turnShiftKey(right))
      );
      return available > EPSILON5 && rightStart - leftEnd >= Math.min(MIN_TRACK_SEPARATION_PX, available) - EPSILON5;
    });
  }
  function turnShiftRefs(world, routes, tracksByRoute, realizationsByRoute) {
    const result = [];
    realizationsByRoute.forEach((realizations, routeIndex) => {
      realizations.forEach((realization, realizationIndex) => {
        if (realization.kind !== "turn-retrack") {
          return;
        }
        realization.shifts.forEach((shift, shiftIndex) => {
          const hostBefore = shift.hostVisitIndex === realization.afterVisitIndex - 1;
          const hostCorridorIndex = routes[routeIndex].visits[shift.hostVisitIndex].corridorIndex;
          const hostCorridor = world.indexer.corridors[hostCorridorIndex];
          result.push({
            routeIndex,
            realizationIndex,
            shiftIndex,
            hostAxis: hostCorridor.axis,
            routeTrack: hostBefore ? tracksByRoute[routeIndex][shift.hostVisitIndex] : shift.trackAfter,
            routeRun: realizedVisitTravelSpan(
              world,
              routes[routeIndex],
              routeIndex,
              shift.hostVisitIndex,
              tracksByRoute,
              realizationsByRoute[routeIndex]
            ),
            portalCoordinate: hostBefore ? realization.afterPortalTrack : realization.beforePortalTrack,
            portalTrack: hostBefore ? realization.beforePortalTrack : realization.afterPortalTrack,
            shiftCoordinate: shift.shiftCoordinate
          });
        });
      });
    });
    return result;
  }
  function turnShiftCoordinate(world, corridor, portalTravel, farBoundary) {
    const farTravel = boundaryTravelCoordinate(world, corridor, farBoundary);
    const direction2 = Math.sign(farTravel - portalTravel);
    if (direction2 === 0) {
      return Math.round(portalTravel);
    }
    const depth = Math.min(
      BOUNDARY_SHIFT_DEPTH_PX,
      Math.max(0, Math.abs(farTravel - portalTravel) - CORRIDOR_EDGE_PADDING_PX)
    );
    return Math.round(portalTravel + direction2 * depth);
  }
  function realizedVisitTravelSpan(world, route, routeIndex, visitIndex, tracksByRoute, realizations) {
    const corridor = world.indexer.corridors[route.visits[visitIndex].corridorIndex];
    const coordinate = (side) => {
      const boundary = route.visits[visitIndex][side];
      if (boundary.kind !== "portal" || boundary.mode !== "turn") {
        return boundaryTravelCoordinate(world, corridor, boundary);
      }
      const afterVisitIndex = side === "entry" ? visitIndex : visitIndex + 1;
      const realization = realizations.find(
        (candidate) => candidate.kind === "turn-retrack" && candidate.afterVisitIndex === afterVisitIndex
      );
      if (realization?.kind === "turn-retrack") {
        const hostedShift = realization.shifts.find((shift) => shift.hostVisitIndex === visitIndex);
        if (hostedShift) {
          return hostedShift.shiftCoordinate;
        }
        return side === "entry" ? realization.beforePortalTrack : realization.afterPortalTrack;
      }
      const adjacentVisitIndex = side === "entry" ? visitIndex - 1 : visitIndex + 1;
      return tracksByRoute[routeIndex][adjacentVisitIndex];
    };
    const entry = coordinate("entry");
    const exit = coordinate("exit");
    return [Math.min(entry, exit), Math.max(entry, exit)];
  }
  function strictlyInside(value, first, second) {
    return value > Math.min(first, second) + EPSILON5 && value < Math.max(first, second) - EPSILON5;
  }
  function mergeConstraint(constraints, before, after, gap) {
    if (before === after) {
      return false;
    }
    const reverse = constraints.get(`${after}:${before}`);
    if (reverse) {
      const canonicalBefore = Math.min(before, after);
      const canonicalAfter = Math.max(before, after);
      constraints.delete(`${before}:${after}`);
      constraints.delete(`${after}:${before}`);
      constraints.set(`${canonicalBefore}:${canonicalAfter}`, {
        before: canonicalBefore,
        after: canonicalAfter,
        gap: Math.max(gap, reverse.gap)
      });
      return true;
    }
    const key = `${before}:${after}`;
    const existing = constraints.get(key);
    if (!existing || gap > existing.gap) {
      constraints.set(key, { before, after, gap });
    }
    return false;
  }
  function commitUnitTracks(units, tracks, tracksByRoute) {
    units.forEach((unit, unitIndex) => {
      for (const member of unit.members) {
        tracksByRoute[member.ref.routeIndex][member.ref.visitIndex] = tracks[unitIndex];
      }
    });
  }
  function spacingQualitySource(corridorIndex) {
    return `spacing:corridor:${corridorIndex}`;
  }
  function spacingQualitySourceCorridorIndex(source) {
    const prefix = "spacing:corridor:";
    if (!source.startsWith(prefix)) {
      return void 0;
    }
    const corridorIndex = Number(source.slice(prefix.length));
    return Number.isInteger(corridorIndex) ? corridorIndex : void 0;
  }
  function spacingScalarCosts(spacingDesire) {
    return { ordinaryBends: 0, pathLength: 0, spacingDesire };
  }
  function spacingDeficitQualityEvent(corridorIndex, achievedGap, sharedTravelLength, visits) {
    return {
      kind: "spacing-deficit",
      cost: spacingDeficitCost(MIN_TRACK_SEPARATION_PX, achievedGap, sharedTravelLength),
      routeIndexes: [...new Set(visits.map((visit) => visit.routeIndex))],
      corridorIndexes: [corridorIndex],
      visits
    };
  }
  function collectMissingRealizedSpacingQualityEvents(world, routes, ordering, provisionalEvents, geometryIndex) {
    const events = [];
    for (const group of ordering.groups) {
      const corridor = world.indexer.corridors[group.corridorIndex];
      const corridorSegments = geometryIndex.segmentsForCorridor(group.corridorIndex);
      for (let index = 1; index < group.members.length; index += 1) {
        const before = group.members[index - 1];
        const after = group.members[index];
        const [beforeSegment, afterSegment] = [before, after].map(
          (visit) => corridorSegments.find(
            (segment) => segment.routeIndex === visit.routeIndex && segment.visitIndex === visit.visitIndex && segment.axis === corridor.axis && Math.abs(
              segment.track - routes[segment.routeIndex].nominalTrackOf(segment.visitIndex)
            ) <= EPSILON5
          )
        );
        const achievedGap = Math.abs(
          routes[after.routeIndex].nominalTrackOf(after.visitIndex) - routes[before.routeIndex].nominalTrackOf(before.visitIndex)
        );
        if (achievedGap >= MIN_TRACK_SEPARATION_PX - EPSILON5) {
          continue;
        }
        const sharedTravelLength = beforeSegment && afterSegment ? Math.max(
          0,
          Math.min(beforeSegment.travel[1], afterSegment.travel[1]) - Math.max(beforeSegment.travel[0], afterSegment.travel[0])
        ) : 0;
        if (sharedTravelLength <= EPSILON5) {
          continue;
        }
        const alreadyReported = provisionalEvents.some(
          (event) => event.kind === "spacing-deficit" && event.corridorIndexes?.includes(group.corridorIndex) && event.routeIndexes.includes(before.routeIndex) && event.routeIndexes.includes(after.routeIndex)
        );
        if (alreadyReported) {
          continue;
        }
        const visits = [before, after];
        events.push({
          kind: "missing-spacing-contention",
          cost: ROUTING_QUALITY_COSTS.invalidGeometry,
          routeIndexes: [...new Set(visits.map((visit) => visit.routeIndex))],
          corridorIndexes: [group.corridorIndex],
          visits
        });
      }
    }
    return events;
  }
  function spacingQualityEvents(work, tracksByRoute) {
    const events = [];
    for (const indexes of work.contentionComponents) {
      for (let index = 1; index < indexes.length; index += 1) {
        const before = work.units[indexes[index - 1]];
        const after = work.units[indexes[index]];
        const beforeTrack = unitTrack(before, tracksByRoute);
        const afterTrack = unitTrack(after, tracksByRoute);
        const achievedGap = afterTrack - beforeTrack;
        if (achievedGap >= MIN_TRACK_SEPARATION_PX - EPSILON5) {
          continue;
        }
        const sharedTravelLength = unitSharedTravelLength(before, after);
        if (sharedTravelLength <= EPSILON5) {
          continue;
        }
        const visits = qualityVisits([...before.members, ...after.members]);
        const corridorIndex = work.group.corridorIndex;
        events.push(
          spacingDeficitQualityEvent(corridorIndex, achievedGap, sharedTravelLength, visits)
        );
        if (Math.abs(achievedGap) <= EPSILON5) {
          const routeIndexes = [...new Set(visits.map((visit) => visit.routeIndex))];
          const merge = {
            kind: "line-merge",
            cost: ROUTING_QUALITY_COSTS.lineMerge,
            routeIndexes,
            corridorIndexes: [corridorIndex],
            visits
          };
          events.push(merge);
        }
      }
    }
    return events;
  }
  function unitTrack(unit, tracksByRoute) {
    const member = unit.members[0];
    return tracksByRoute[member.ref.routeIndex][member.ref.visitIndex];
  }
  function qualityVisits(members) {
    const visits = /* @__PURE__ */ new Map();
    for (const member of members) {
      const { routeIndex, visitIndex } = member.ref;
      visits.set(visitKey(routeIndex, visitIndex), { routeIndex, visitIndex });
    }
    return [...visits.values()];
  }
  function unitSharedTravelLength(left, right) {
    const overlaps = [];
    for (const leftMember of left.members) {
      for (const rightMember of right.members) {
        const overlap = intersectSpans(
          leftMember.travelInterval,
          rightMember.travelInterval,
          EPSILON5
        );
        if (overlap) {
          overlaps.push(overlap);
        }
      }
    }
    overlaps.sort((leftSpan, rightSpan) => leftSpan[0] - rightSpan[0]);
    let result = 0;
    let current;
    for (const overlap of overlaps) {
      if (!current || overlap[0] > current[1] + EPSILON5) {
        if (current) {
          result += spanLength(current);
        }
        current = overlap;
      } else {
        current = [current[0], Math.max(current[1], overlap[1])];
      }
    }
    return result + (current ? spanLength(current) : 0);
  }
  function visitKey(routeIndex, visitIndex) {
    return `${routeIndex}:${visitIndex}`;
  }
  function requiredContentionVisitKey(corridorIndex, ref) {
    return `${corridorIndex}:${visitKey(ref.routeIndex, ref.visitIndex)}`;
  }
  function indexRequiredContentions(contentions) {
    const result = /* @__PURE__ */ new Map();
    for (const contention of contentions) {
      const [first, second] = contention.visits;
      if (first.routeIndex === second.routeIndex && first.visitIndex === second.visitIndex) {
        continue;
      }
      for (const [visit, partner] of [
        [first, second],
        [second, first]
      ]) {
        const key = requiredContentionVisitKey(contention.corridorIndexes[0], visit);
        const partners = result.get(key) ?? /* @__PURE__ */ new Set();
        partners.add(visitKey(partner.routeIndex, partner.visitIndex));
        result.set(key, partners);
      }
    }
    return result;
  }
  function buildDesiredTracks(world, routes, ordering) {
    const desires = routes.map((route) => route.visits.map(() => []));
    const corridorIdealSeeds = routes.map(
      (route) => route.visits.map(() => void 0)
    );
    const groupByCorridor = new Map(ordering.groups.map((group) => [group.corridorIndex, group]));
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      if (route.visits.length === 0) {
        continue;
      }
      if (route.visits.length >= 3) {
        if (route.visits.length === 3 && !visitHasContinuationBoundary(route.visits[1])) {
          corridorIdealSeeds[routeIndex][1] = bridgeTerminalIdealSeed(world, route);
        } else {
          if (endpointNeedsTerminalLead(route.from) && !visitHasContinuationBoundary(route.visits[1])) {
            const seed = outsideTerminalIdealSeed(
              world,
              route.from,
              route.visits[1],
              TERMINAL_LEAD_PX
            );
            corridorIdealSeeds[routeIndex][1] = seed;
          } else {
            const sourceRunEnd = continuedSourceTerminalLeadRunEnd(
              world,
              route,
              CONTINUATION_POLICY_TUNING
            );
            if (sourceRunEnd !== void 0) {
              const sourceRunIsUncontended = !runHasTopologicalContention(
                world,
                routes,
                groupByCorridor,
                routeIndex,
                1,
                sourceRunEnd
              );
              const sourceFaceSpan = faceCrossSpan(
                world.entities[route.from.entityIndex],
                route.from.face
              );
              const sourceTerminalSpan = route.visits[0].feasibleTrack;
              const sourceTerminalCoversFace = spanContains(sourceTerminalSpan, sourceFaceSpan, EPSILON5) && spanContains(sourceFaceSpan, sourceTerminalSpan, EPSILON5);
              const seed = outsideTerminalIdealSeed(
                world,
                route.from,
                route.visits[1],
                SOURCE_TERMINAL_LEAD_PX,
                sourceRunIsUncontended && sourceTerminalCoversFace
              );
              for (let visitIndex = 1; visitIndex <= sourceRunEnd; visitIndex += 1) {
                corridorIdealSeeds[routeIndex][visitIndex] = seed;
              }
            }
          }
          const beforeLast = route.visits.length - 2;
          if (endpointNeedsTerminalLead(route.to) && !visitHasContinuationBoundary(route.visits[beforeLast])) {
            const seed = outsideTerminalIdealSeed(
              world,
              route.to,
              route.visits[beforeLast],
              TERMINAL_LEAD_PX
            );
            corridorIdealSeeds[routeIndex][beforeLast] = seed;
          } else {
            const targetRunStart = continuedTargetTerminalLeadRunStart(
              world,
              route,
              CONTINUATION_POLICY_TUNING
            );
            if (targetRunStart !== void 0) {
              const seed = outsideTerminalIdealSeed(
                world,
                route.to,
                route.visits[beforeLast],
                TERMINAL_LEAD_PX
              );
              for (let visitIndex = targetRunStart; visitIndex <= beforeLast; visitIndex += 1) {
                corridorIdealSeeds[routeIndex][visitIndex] = seed;
              }
            }
          }
        }
      }
      for (let visitIndex = 1; visitIndex + 1 < route.visits.length; visitIndex += 1) {
        const desired = uTurnCoordinate(world, route, visitIndex);
        if (desired === void 0) {
          continue;
        }
        corridorIdealSeeds[routeIndex][visitIndex] = {
          track: desired,
          weight: U_TURN_CORRIDOR_IDEAL_WEIGHT,
          policy: {
            kind: "u-turn",
            desiredTrack: desired
          }
        };
      }
    }
    addTerminalFaceDesires(world, routes, desires, groupByCorridor);
    harmonizeSoloDirectTerminalDesires(routes, desires);
    const collapseVisitValues = (fallback) => routes.map((route, routeIndex) => {
      const result = new Float64Array(route.visits.length);
      for (let visitIndex = 0; visitIndex < route.visits.length; visitIndex += 1) {
        const visitDesires = desires[routeIndex][visitIndex];
        result[visitIndex] = visitDesires.length > 0 || !fallback ? compileTrackDesires(visitDesires).track : fallback(routeIndex, visitIndex);
      }
      return result;
    });
    const provisionalValues = collapseVisitValues(
      (routeIndex, visitIndex) => corridorIdealSeeds[routeIndex][visitIndex]?.track ?? corridorCenter(world.indexer.corridors[routes[routeIndex].visits[visitIndex].corridorIndex])
    );
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      for (let visitIndex = 0; visitIndex < route.visits.length; visitIndex += 1) {
        const visitDesires = desires[routeIndex][visitIndex];
        if (visitDesires.length > 0) {
          continue;
        }
        const corridor = world.indexer.corridors[route.visits[visitIndex].corridorIndex];
        const travelInterval = possibleTravelInterval(
          world,
          corridor,
          route,
          visitIndex,
          provisionalValues[routeIndex]
        );
        const seed = corridorIdealSeeds[routeIndex][visitIndex];
        visitDesires.push({
          kind: seed?.policy?.kind ?? "corridor-ideal",
          track: seed?.policy ? corridorIdealTrack(corridor, travelInterval, seed.policy) : seed?.track ?? corridorIdealTrack(corridor, travelInterval),
          weight: seed?.weight ?? CORRIDOR_IDEAL_DESIRE_WEIGHT
        });
      }
    }
    return {
      values: collapseVisitValues(),
      desires
    };
  }
  function harmonizeSoloDirectTerminalDesires(routes, desires) {
    const terminalCounts = /* @__PURE__ */ new Map();
    for (const route of routes) {
      if (route.visits.length === 0) {
        continue;
      }
      for (const endpoint of [route.from, route.to]) {
        const key = terminalKey(endpoint);
        terminalCounts.set(key, (terminalCounts.get(key) ?? 0) + 1);
      }
    }
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      if (route.visits.length !== 1 || spacingPinTrack(route.from) !== void 0 || spacingPinTrack(route.to) !== void 0 || route.from.portGroup !== void 0 || route.to.portGroup !== void 0 || terminalCounts.get(terminalKey(route.from)) !== 1 || terminalCounts.get(terminalKey(route.to)) !== 1) {
        continue;
      }
      const feasible = route.visits[0].feasibleTrack;
      const usable = insetSpan(feasible, PORT_EDGE_PADDING_PX, EPSILON5) ?? feasible;
      desires[routeIndex][0] = [
        {
          kind: "terminal",
          track: midpoint(usable),
          weight: ENDPOINT_DESIRE_WEIGHT
        }
      ];
    }
  }
  function terminalKey(endpoint) {
    return `${endpoint.entityIndex}:${endpoint.face}`;
  }
  function oneSidedIdealTrack(entityOnNegative, cross2, center2, farInfluence) {
    if (farInfluence === "open") {
      return center2;
    }
    return entityOnNegative ? cross2[1] - CORRIDOR_IDEAL_EDGE_OFFSET_PX : cross2[0] + CORRIDOR_IDEAL_EDGE_OFFSET_PX;
  }
  function corridorIdealTrack(corridor, travelInterval, policy) {
    const cross2 = corridorCrossSpan(corridor);
    const center2 = midpoint(cross2);
    const [negative, positive] = corridorBorderInfluences(corridor, travelInterval);
    const ordinary = negative === "entity" === (positive === "entity") ? center2 : (
      // Mirrored one-sided entity pushes in adjacent open space sit 8px apart.
      oneSidedIdealTrack(
        negative === "entity",
        cross2,
        center2,
        negative === "entity" ? positive : negative
      )
    );
    if (!policy) {
      return ordinary;
    }
    if (policy.kind === "u-turn") {
      return policy.desiredTrack;
    }
    const entityBounded = negative === "entity" && positive === "entity";
    if (policy.kind === "terminal-window") {
      return entityBounded && policy.lower <= policy.upper ? clamp(ordinary, policy.lower, policy.upper) : policy.desiredTrack;
    }
    if (!entityBounded) {
      return policy.desiredTrack;
    }
    return policy.direction === "negative" ? Math.min(ordinary, policy.plane - IDEAL_TERMINAL_SEPARATION_PX) : Math.max(ordinary, policy.plane + IDEAL_TERMINAL_SEPARATION_PX);
  }
  function corridorBorderInfluences(corridor, travelInterval) {
    const isX = corridor.borderProfile.axis === "x";
    const negativeSpans = isX ? corridor.borderProfile.top : corridor.borderProfile.left;
    const positiveSpans = isX ? corridor.borderProfile.bottom : corridor.borderProfile.right;
    return [
      borderInfluence(negativeSpans, travelInterval),
      borderInfluence(positiveSpans, travelInterval)
    ];
  }
  function borderInfluence(spans, travelInterval) {
    let diagramBorder = false;
    for (const border of spans) {
      if (!borderOverlapsTravel(border.span, travelInterval)) {
        continue;
      }
      if (border.kind === "entity") {
        return "entity";
      }
      diagramBorder = true;
    }
    return diagramBorder ? "diagram-border" : "open";
  }
  function borderOverlapsTravel(border, travel) {
    return Math.min(border[1], travel[1]) - Math.max(border[0], travel[0]) > EPSILON5 || travel[1] - travel[0] <= EPSILON5 && coordinateInSpan(travel[0], border, EPSILON5);
  }
  function runHasTopologicalContention(world, routes, groupByCorridor, routeIndex, runStart, runEnd) {
    const route = routes[routeIndex];
    for (let visitIndex = runStart; visitIndex <= runEnd; visitIndex += 1) {
      const visit = route.visits[visitIndex];
      const group = groupByCorridor.get(visit.corridorIndex);
      if (!group) {
        continue;
      }
      const interval = topologicalTravelInterval(world, route, visitIndex);
      for (const member of group.members) {
        if (member.routeIndex === routeIndex && member.visitIndex === visitIndex) {
          continue;
        }
        if (spansOverlapPositive(
          interval,
          topologicalTravelInterval(world, routes[member.routeIndex], member.visitIndex),
          EPSILON5
        )) {
          return true;
        }
      }
    }
    return false;
  }
  function topologicalTravelInterval(world, route, visitIndex) {
    const visit = route.visits[visitIndex];
    const corridor = world.indexer.corridors[visit.corridorIndex];
    const entry = boundaryTravelCoordinate(world, corridor, visit.entry);
    const exit = boundaryTravelCoordinate(world, corridor, visit.exit);
    return [Math.min(entry, exit), Math.max(entry, exit)];
  }
  function addTerminalMember(preferences, routeIndex, visitIndex, endpoint, opposite) {
    let preference = preferences.find(
      (candidate) => candidate.entityIndex === endpoint.entityIndex && candidate.face === endpoint.face
    );
    if (!preference) {
      preference = { entityIndex: endpoint.entityIndex, face: endpoint.face, members: [] };
      preferences.push(preference);
    }
    preference.members.push({ routeIndex, visitIndex, endpoint, opposite });
  }
  function visitTiedTerminalEnd(route, visitIndex) {
    let start = visitIndex;
    while (start > 0 && isStraightContinuationBoundary(route.visits[start].entry)) {
      start -= 1;
    }
    if (start === 0) {
      return "from";
    }
    let end = visitIndex;
    while (end < route.visits.length - 1 && isStraightContinuationBoundary(route.visits[end].exit)) {
      end += 1;
    }
    if (end === route.visits.length - 1) {
      return "to";
    }
    return void 0;
  }
  function terminalContendsWithOtherTerminalTrack(world, routes, groupByCorridor, routeIndex, visitIndex) {
    const route = routes[routeIndex];
    const group = groupByCorridor.get(route.visits[visitIndex].corridorIndex);
    if (!group) {
      return false;
    }
    const interval = topologicalTravelInterval(world, route, visitIndex);
    for (const member of group.members) {
      if (member.routeIndex === routeIndex) {
        continue;
      }
      if (visitTiedTerminalEnd(routes[member.routeIndex], member.visitIndex) !== void 0 && spansOverlapPositive(
        interval,
        topologicalTravelInterval(world, routes[member.routeIndex], member.visitIndex),
        EPSILON5
      )) {
        return true;
      }
    }
    return false;
  }
  function addTerminalFaceDesires(world, routes, desires, groupByCorridor) {
    const preferences = [];
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      if (route.visits.length === 0) {
        continue;
      }
      addTerminalMember(preferences, routeIndex, 0, route.from, route.to);
      addTerminalMember(preferences, routeIndex, route.visits.length - 1, route.to, route.from);
    }
    for (const preference of preferences) {
      const faceSpan = faceCrossSpan(world.entities[preference.entityIndex], preference.face);
      const usableFace = insetSpan(faceSpan, PORT_EDGE_PADDING_PX, EPSILON5) ?? faceSpan;
      const ordered = terminalPreferenceUnits(preference.members).map((members) => ({
        members,
        orderCoordinate: members.reduce(
          (sum, member) => sum + endpointCrossCoordinate(world.entities, member.opposite, preference.face),
          0
        ) / members.length,
        usable: sharedTerminalUsableSpan(world, routes, members)
      })).sort(
        (left, right) => left.orderCoordinate - right.orderCoordinate || left.members[0].routeIndex - right.members[0].routeIndex || left.members[0].visitIndex - right.members[0].visitIndex
      );
      const gap = ordered.length <= 1 ? 0 : Math.min(IDEAL_TERMINAL_SEPARATION_PX, spanLength(usableFace) / (ordered.length - 1));
      const packedWidth = gap * (ordered.length - 1);
      const first = clamp(
        midpoint(usableFace) - packedWidth / 2,
        usableFace[0],
        usableFace[1] - packedWidth
      );
      ordered.forEach((unit, unitIndex) => {
        const pinnedTrack = unit.members.map((member) => spacingPinTrack(member.endpoint)).find((track) => track !== void 0);
        const ideal = pinnedTrack ?? first + unitIndex * gap;
        const singletonOutsideUsable = unit.usable !== void 0 && ordered.length === 1 && !coordinateInSpan(ideal, unit.usable, EPSILON5);
        const guarded = singletonOutsideUsable && unit.members.some(
          (member) => terminalContendsWithOtherTerminalTrack(
            world,
            routes,
            groupByCorridor,
            member.routeIndex,
            member.visitIndex
          )
        );
        const desired = unit.usable ? singletonOutsideUsable && guarded ? midpoint(unit.usable) : clamp(ideal, unit.usable[0], unit.usable[1]) : ideal;
        for (const member of unit.members) {
          desires[member.routeIndex][member.visitIndex].push({
            kind: "terminal",
            track: spacingPinTrack(member.endpoint) ?? desired,
            weight: ENDPOINT_DESIRE_WEIGHT
          });
        }
      });
    }
  }
  function sharedTerminalUsableSpan(world, routes, members) {
    let shared;
    for (const member of members) {
      const faceSpan = faceCrossSpan(
        world.entities[member.endpoint.entityIndex],
        member.endpoint.face
      );
      const feasible = intersectSpans(
        faceSpan,
        routes[member.routeIndex].visits[member.visitIndex].feasibleTrack,
        EPSILON5
      );
      if (!feasible) {
        return void 0;
      }
      const pinTrack = spacingPinTrack(member.endpoint);
      const usable = pinTrack === void 0 ? insetSpan(feasible, PORT_EDGE_PADDING_PX, EPSILON5) ?? feasible : [pinTrack, pinTrack];
      shared = shared ? intersectSpans(shared, usable, EPSILON5) : usable;
      if (!shared) {
        return void 0;
      }
    }
    return shared;
  }
  function terminalPreferenceUnits(members) {
    const memberGroups = [];
    for (const member of members) {
      const existing = member.endpoint.portGroup === void 0 ? void 0 : memberGroups.find(
        (unit) => unit[0].endpoint.portGroup === member.endpoint.portGroup && unit[0].endpoint.entityIndex === member.endpoint.entityIndex && unit[0].endpoint.face === member.endpoint.face
      );
      if (existing) {
        existing.push(member);
      } else {
        memberGroups.push([member]);
      }
    }
    return memberGroups;
  }
  function buildVariable(world, routes, desiredTracks, corridorIndex, ref, shortfalls, relaxTurns, relaxPadding, requiredContentionsByVisit) {
    const route = routes[ref.routeIndex];
    const visit = route.visits[ref.visitIndex];
    let bounds = relaxTurns ? corridorCrossSpan(world.indexer.corridors[corridorIndex]) : visit.feasibleTrack;
    bounds = terminalApproachBounds(world, route, ref.visitIndex, bounds);
    const endpoints = visitEndpoints(route, ref.visitIndex);
    for (const endpoint of endpoints) {
      if (endpoint.authoredTrack === void 0 && endpoint.repairPinTrack !== void 0) {
        bounds = [
          Math.max(bounds[0], endpoint.repairPinTrack),
          Math.min(bounds[1], endpoint.repairPinTrack)
        ];
      }
    }
    let authored = false;
    let endpointGroups;
    for (const endpoint of endpoints) {
      authored = authored || spacingPinTrack(endpoint) !== void 0;
      if (endpoint.portGroup !== void 0) {
        if (!endpointGroups) {
          endpointGroups = [];
        }
        endpointGroups.push({
          entityIndex: endpoint.entityIndex,
          face: endpoint.face,
          portGroup: endpoint.portGroup
        });
      }
    }
    if (!relaxPadding && !authored) {
      bounds = applyPadding(
        "corridor-padding",
        corridorIndex,
        ref,
        bounds,
        corridorCrossSpan(world.indexer.corridors[corridorIndex]),
        CORRIDOR_EDGE_PADDING_PX,
        shortfalls
      );
    }
    for (const endpoint of endpoints) {
      if (!relaxPadding && spacingPinTrack(endpoint) === void 0) {
        bounds = applyPadding(
          "port-padding",
          corridorIndex,
          ref,
          bounds,
          faceCrossSpan(world.entities[endpoint.entityIndex], endpoint.face),
          PORT_EDGE_PADDING_PX,
          shortfalls
        );
      }
    }
    const corridor = world.indexer.corridors[corridorIndex];
    const travelInterval = possibleTravelInterval(
      world,
      corridor,
      route,
      ref.visitIndex,
      desiredTracks.values[ref.routeIndex]
    );
    return {
      ref,
      travelInterval,
      lower: bounds[0],
      upper: bounds[1],
      desires: desiredTracks.desires[ref.routeIndex][ref.visitIndex],
      authored,
      endpointGroups: endpointGroups ?? EMPTY_ENDPOINT_GROUPS,
      requiredContentionVisitKeys: requiredContentionsByVisit.size === 0 ? void 0 : requiredContentionsByVisit.get(requiredContentionVisitKey(corridorIndex, ref))
    };
  }
  function variablePaddingRules(world, routes, corridorIndex, ref) {
    const route = routes[ref.routeIndex];
    const endpoints = visitEndpoints(route, ref.visitIndex);
    const rules = [];
    if (!endpoints.some((endpoint) => spacingPinTrack(endpoint) !== void 0)) {
      rules.push({
        kind: "corridor-padding",
        container: corridorCrossSpan(world.indexer.corridors[corridorIndex]),
        padding: CORRIDOR_EDGE_PADDING_PX
      });
    }
    for (const endpoint of endpoints) {
      if (spacingPinTrack(endpoint) === void 0) {
        rules.push({
          kind: "port-padding",
          container: faceCrossSpan(world.entities[endpoint.entityIndex], endpoint.face),
          padding: PORT_EDGE_PADDING_PX
        });
      }
    }
    return rules;
  }
  function terminalApproachBounds(world, route, visitIndex, bounds) {
    let result = bounds;
    const sourceApproach = terminalApproachVisitIndex(world, route, "from");
    if (sourceApproach === visitIndex) {
      result = clipToTerminalOutwardSide(world, route.from, result);
    }
    const targetApproach = terminalApproachVisitIndex(world, route, "to");
    if (targetApproach === visitIndex) {
      result = clipToTerminalOutwardSide(world, route.to, result);
    }
    return result;
  }
  function terminalApproachVisitIndex(world, route, side) {
    if (route.visits.length < 2) {
      return void 0;
    }
    const terminalVisitIndex = side === "from" ? 0 : route.visits.length - 1;
    const terminalAxis = world.indexer.corridors[route.visits[terminalVisitIndex].corridorIndex].axis;
    const step = side === "from" ? 1 : -1;
    for (let visitIndex = terminalVisitIndex + step; visitIndex >= 0 && visitIndex < route.visits.length; visitIndex += step) {
      const axis = world.indexer.corridors[route.visits[visitIndex].corridorIndex].axis;
      if (axis !== terminalAxis) {
        return visitIndex;
      }
    }
    return void 0;
  }
  function clipToTerminalOutwardSide(world, endpoint, bounds) {
    const plane = terminalFacePlane(world.entities[endpoint.entityIndex], endpoint.face);
    const outwardPlane = endpoint.face === "left" || endpoint.face === "up" ? plane - 1 : plane + 1;
    const lower = endpoint.face === "right" || endpoint.face === "down" ? Math.max(bounds[0], Math.min(bounds[1], outwardPlane)) : bounds[0];
    const upper = endpoint.face === "left" || endpoint.face === "up" ? Math.min(bounds[1], Math.max(bounds[0], outwardPlane)) : bounds[1];
    if (lower > upper + EPSILON5) {
      throw new Error(
        `corridor spacing: terminal ${endpoint.entityIndex}:${endpoint.face} has no outward approach`
      );
    }
    return [lower, Math.max(lower, upper)];
  }
  function turnPortalCrossSpan(portal, axis) {
    return axis === "x" ? [portal.rect.y, portal.rect.y + portal.rect.height] : [portal.rect.x, portal.rect.x + portal.rect.width];
  }
  function applyPadding(kind, corridorIndex, ref, bounds, container, padding, shortfalls) {
    const padded = insetSpan(container, padding, EPSILON5);
    const intersection = padded ? intersectSpans(bounds, padded, EPSILON5) : void 0;
    if (intersection) {
      return intersection;
    }
    shortfalls.push({
      kind,
      corridorIndex,
      routeIndexes: [ref.routeIndex],
      visitIndexes: [ref.visitIndex],
      required: padding,
      achieved: maximumClearance(bounds, container)
    });
    return bounds;
  }
  function buildUnits(group, variables, shortfalls, workspace) {
    const { trackUnitUnionFind } = workspace;
    trackUnitUnionFind.reset(variables.length);
    for (let left = 0; left < variables.length; left += 1) {
      for (let right = left + 1; right < variables.length; right += 1) {
        if (sharesEndpointGroup(variables[left], variables[right])) {
          trackUnitUnionFind.unionInto(left, right);
        }
      }
    }
    const membersByRoot = /* @__PURE__ */ new Map();
    for (let index = 0; index < variables.length; index += 1) {
      const componentRoot = trackUnitUnionFind.find(index);
      const indexes = membersByRoot.get(componentRoot) ?? [];
      indexes.push(index);
      membersByRoot.set(componentRoot, indexes);
    }
    const units = [];
    for (const indexes of membersByRoot.values()) {
      const contiguous = indexes[indexes.length - 1] - indexes[0] + 1 === indexes.length;
      const members = [];
      let lower = Number.NEGATIVE_INFINITY;
      let upper = Number.POSITIVE_INFINITY;
      for (const memberIndex of indexes) {
        const member = variables[memberIndex];
        members.push(member);
        lower = Math.max(lower, member.lower);
        upper = Math.min(upper, member.upper);
      }
      if (!contiguous || lower > upper + EPSILON5) {
        shortfalls.push(shortfall("combined-port", group.corridorIndex, members, 0, upper - lower));
        for (const member of members) {
          units.push({
            members: [member],
            lower: member.lower,
            upper: member.upper,
            desires: member.desires,
            authored: member.authored
          });
        }
        continue;
      }
      const desires = [];
      for (const member of members) {
        desires.push(...member.desires);
      }
      units.push({
        members,
        lower,
        upper: Math.max(lower, upper),
        desires,
        authored: members.some((member) => member.authored)
      });
    }
    return units;
  }
  function sharesEndpointGroup(left, right) {
    return left.endpointGroups.some(
      (leftGroup) => right.endpointGroups.some(
        (rightGroup) => leftGroup.entityIndex === rightGroup.entityIndex && leftGroup.face === rightGroup.face && leftGroup.portGroup === rightGroup.portGroup
      )
    );
  }
  function buildContentionComponents(units, unionFind) {
    unionFind.reset(units.length);
    for (let left = 0; left < units.length; left += 1) {
      for (let right = left + 1; right < units.length; right += 1) {
        if (!unitsContend(units[left], units[right])) {
          continue;
        }
        unionFind.unionMin(left, right);
      }
    }
    const indexesByRoot = /* @__PURE__ */ new Map();
    for (let index = 0; index < units.length; index += 1) {
      const componentRoot = unionFind.find(index);
      const indexes = indexesByRoot.get(componentRoot);
      if (indexes) {
        indexes.push(index);
      } else {
        indexesByRoot.set(componentRoot, [index]);
      }
    }
    return [...indexesByRoot.values()];
  }
  function unitsContend(left, right) {
    for (const leftMember of left.members) {
      for (const rightMember of right.members) {
        if (spansOverlapPositive(leftMember.travelInterval, rightMember.travelInterval, EPSILON5) || leftMember.requiredContentionVisitKeys?.has(
          visitKey(rightMember.ref.routeIndex, rightMember.ref.visitIndex)
        ) === true || rightMember.requiredContentionVisitKeys?.has(
          visitKey(leftMember.ref.routeIndex, leftMember.ref.visitIndex)
        ) === true) {
          return true;
        }
      }
    }
    return false;
  }
  function shortfall(kind, corridorIndex, variables, required, achieved) {
    return {
      kind,
      corridorIndex,
      routeIndexes: variables.map((variable) => variable.ref.routeIndex),
      visitIndexes: variables.map((variable) => variable.ref.visitIndex),
      required,
      achieved
    };
  }
  function memberCorridorIndex(routes, members) {
    return routes[members[0].ref.routeIndex].visits[members[0].ref.visitIndex].corridorIndex;
  }
  function reductionShortfall(kind, corridorIndex, reduction, units) {
    const routeIndexes = [];
    const visitIndexes = [];
    for (const unitIndex of reduction.unitIndexes) {
      for (const member of units[unitIndex].members) {
        routeIndexes.push(member.ref.routeIndex);
        visitIndexes.push(member.ref.visitIndex);
      }
    }
    return {
      kind,
      corridorIndex,
      routeIndexes,
      visitIndexes,
      required: reduction.required,
      achieved: reduction.achieved
    };
  }
  function visitEndpoints(route, visitIndex) {
    if (visitIndex === 0) {
      return route.visits.length === 1 ? [route.from, route.to] : [route.from];
    }
    return visitIndex === route.visits.length - 1 ? [route.to] : EMPTY_ROUTE_ENDPOINTS;
  }
  function outsideTerminalIdealSeed(world, endpoint, adjacentVisit, terminalLead, balanceNarrowEntityGap = false) {
    const entity = world.entities[endpoint.entityIndex];
    const plane = terminalFacePlane(entity, endpoint.face);
    const corridor = world.indexer.corridors[adjacentVisit.corridorIndex];
    const center2 = corridorCenter(corridor);
    const direction2 = endpoint.face === "left" || endpoint.face === "up" ? "negative" : "positive";
    const desiredTrack = direction2 === "negative" ? Math.min(center2, plane - terminalLead) : Math.max(center2, plane + terminalLead);
    const policy = {
      kind: "terminal-lead",
      desiredTrack,
      plane,
      direction: direction2
    };
    const travelInterval = faceCrossSpan(entity, endpoint.face);
    const ordinary = corridorIdealTrack(corridor, travelInterval);
    const [negative, positive] = corridorBorderInfluences(corridor, travelInterval);
    const centeredLead = direction2 === "negative" ? plane - ordinary : ordinary - plane;
    const paddedFeasible = insetSpan(adjacentVisit.feasibleTrack, CORRIDOR_EDGE_PADDING_PX, EPSILON5) ?? adjacentVisit.feasibleTrack;
    const realizableLeadTrack = clamp(desiredTrack, paddedFeasible[0], paddedFeasible[1]);
    const useBalancedGap = balanceNarrowEntityGap && negative === "entity" && positive === "entity" && centeredLead < IDEAL_TERMINAL_SEPARATION_PX - EPSILON5 && Math.abs(realizableLeadTrack - ordinary) >= CORRIDOR_EDGE_PADDING_PX - EPSILON5;
    return {
      track: useBalancedGap ? ordinary : desiredTrack,
      weight: useBalancedGap ? CORRIDOR_IDEAL_DESIRE_WEIGHT : TERMINAL_CORRIDOR_IDEAL_WEIGHT,
      ...useBalancedGap ? {} : { policy }
    };
  }
  function bridgeTerminalIdealSeed(world, route) {
    const visit = route.visits[1];
    const center2 = corridorCenter(world.indexer.corridors[visit.corridorIndex]);
    let lower = Number.NEGATIVE_INFINITY;
    let upper = Number.POSITIVE_INFINITY;
    let idealLower = Number.NEGATIVE_INFINITY;
    let idealUpper = Number.POSITIVE_INFINITY;
    const endpoints = [route.from, route.to].filter(endpointNeedsTerminalLead);
    if (endpoints.length === 0) {
      return { track: center2, weight: CORRIDOR_IDEAL_DESIRE_WEIGHT };
    }
    for (const endpoint of endpoints) {
      const plane = terminalFacePlane(world.entities[endpoint.entityIndex], endpoint.face);
      if (endpoint.face === "left" || endpoint.face === "up") {
        upper = Math.min(upper, plane - TERMINAL_LEAD_PX);
        idealUpper = Math.min(idealUpper, plane - IDEAL_TERMINAL_SEPARATION_PX);
      } else {
        lower = Math.max(lower, plane + TERMINAL_LEAD_PX);
        idealLower = Math.max(idealLower, plane + IDEAL_TERMINAL_SEPARATION_PX);
      }
    }
    const desiredTrack = lower <= upper ? clamp(center2, lower, upper) : (lower + upper) / 2;
    return {
      track: desiredTrack,
      weight: TERMINAL_CORRIDOR_IDEAL_WEIGHT,
      policy: {
        kind: "terminal-window",
        desiredTrack,
        lower: idealLower,
        upper: idealUpper
      }
    };
  }
  function uTurnCoordinate(world, route, visitIndex) {
    const previous = route.visits[visitIndex - 1];
    const visit = route.visits[visitIndex];
    const next = route.visits[visitIndex + 1];
    const previousCorridor = world.indexer.corridors[previous.corridorIndex];
    const corridor = world.indexer.corridors[visit.corridorIndex];
    const nextCorridor = world.indexer.corridors[next.corridorIndex];
    if (previousCorridor.axis !== nextCorridor.axis || previousCorridor.axis === corridor.axis || visitHasContinuationBoundary(visit)) {
      return void 0;
    }
    const previousOuter = boundaryTravelCoordinate(world, previousCorridor, previous.entry);
    const nextOuter = boundaryTravelCoordinate(world, nextCorridor, next.exit);
    const outerStart = Math.min(previousOuter, nextOuter);
    const outerEnd = Math.max(previousOuter, nextOuter);
    const cross2 = corridorCrossSpan(corridor);
    const center2 = midpoint(cross2);
    if (cross2[1] <= outerStart + EPSILON5) {
      return Math.max(center2, cross2[1] - U_TURN_DEPTH_PX);
    }
    if (cross2[0] >= outerEnd - EPSILON5) {
      return Math.min(center2, cross2[0] + U_TURN_DEPTH_PX);
    }
    return void 0;
  }
  function maximumClearance(bounds, container) {
    const best = clamp(midpoint(container), bounds[0], bounds[1]);
    return Math.max(0, Math.min(best - container[0], container[1] - best));
  }

  // packages/layout/src/routing/corridor/contract.ts
  var AUTHORED_PORT_TOLERANCE_PX = 0.5;

  // packages/layout/src/routing/corridor/route.ts
  var PHASE_RANK = {
    ordering: 0,
    ordered: 1,
    spaced: 2,
    emitted: 3
  };
  var Route = class {
    constructor(requestIndex, from, to, visits) {
      __publicField(this, "requestIndex");
      __publicField(this, "from");
      __publicField(this, "to");
      __publicField(this, "visits");
      __publicField(this, "realization");
      if (!Number.isInteger(requestIndex) || requestIndex < 0) {
        throw new Error(`invalid route request index ${requestIndex}`);
      }
      validateEndpoint(requestIndex, "from", from);
      validateEndpoint(requestIndex, "to", to);
      for (let visitIndex = 0; visitIndex < visits.length; visitIndex += 1) {
        validateVisit(requestIndex, visitIndex, visits[visitIndex]);
      }
      this.requestIndex = requestIndex;
      this.from = from;
      this.to = to;
      this.visits = visits;
    }
    hasRealization() {
      return this.realization !== void 0;
    }
    beginRealization() {
      if (this.realization) {
        throw new Error(`route ${this.requestIndex}: realization already active`);
      }
      this.realization = {
        phase: "ordering",
        orderByVisit: new Int32Array(this.visits.length),
        nominalTrackByVisit: new Float64Array(this.visits.length)
      };
    }
    setOrder(orderByVisit) {
      const realization = this.expectPhase("ordering", "setOrder");
      this.expectVisitValues(orderByVisit, "orders");
      for (const order of orderByVisit) {
        if (!Number.isInteger(order) || order < 0) {
          throw new Error(`route ${this.requestIndex}: invalid order ${order}`);
        }
      }
      realization.orderByVisit.set(orderByVisit);
      realization.phase = "ordered";
    }
    setNominalTracks(nominalTrackByVisit, boundaryRealizations = []) {
      const realization = this.expectPhase("ordered", "setNominalTracks");
      this.expectVisitValues(nominalTrackByVisit, "nominal tracks");
      validateBoundaryRealizations(this.requestIndex, this.visits.length, boundaryRealizations);
      for (let visitIndex = 0; visitIndex < nominalTrackByVisit.length; visitIndex += 1) {
        const track = nominalTrackByVisit[visitIndex];
        const [start, end] = this.visits[visitIndex].feasibleTrack;
        const authorizedTurnTrack = boundaryRealizations.some(
          (candidate) => candidate.kind === "turn-retrack" && candidate.shifts.some((shift) => shift.hostVisitIndex === visitIndex)
        );
        if (!Number.isFinite(track) || !authorizedTurnTrack && (track < start || track > end)) {
          throw new Error(
            `route ${this.requestIndex}: track ${track} outside visit ${visitIndex} span [${start}, ${end}]`
          );
        }
      }
      realization.nominalTrackByVisit.set(nominalTrackByVisit);
      realization.boundaryRealizations = boundaryRealizations;
      realization.phase = "spaced";
    }
    setGeometry(ports, points, segmentVisitByIndex) {
      const realization = this.expectPhase("spaced", "setGeometry");
      validateGeometry(this.requestIndex, this.from, this.to, ports, points);
      validateSegmentProvenance(
        this.requestIndex,
        this.visits.length,
        points.length,
        segmentVisitByIndex
      );
      realization.ports = ports;
      realization.points = points;
      realization.segmentVisitByIndex = Int32Array.from(segmentVisitByIndex);
      realization.phase = "emitted";
    }
    assertOrdered() {
      this.expectAtLeast("ordered", "assertOrdered");
    }
    assertSpaced() {
      this.expectAtLeast("spaced", "assertSpaced");
    }
    assertEmitted() {
      this.expectAtLeast("emitted", "assertEmitted");
    }
    orderOf(visitIndex) {
      const realization = this.expectAtLeast("ordered", "orderOf");
      return realization.orderByVisit[this.expectVisitIndex(visitIndex)];
    }
    nominalTrackOf(visitIndex) {
      const realization = this.expectAtLeast("spaced", "nominalTrackOf");
      return realization.nominalTrackByVisit[this.expectVisitIndex(visitIndex)];
    }
    boundaryRealizationAfter(afterVisitIndex) {
      const realization = this.expectAtLeast("spaced", "boundaryRealizationAfter");
      if (!Number.isInteger(afterVisitIndex) || afterVisitIndex <= 0 || afterVisitIndex >= this.visits.length) {
        throw new Error(
          `route ${this.requestIndex}: boundary after visit ${afterVisitIndex} out of range`
        );
      }
      return realization.boundaryRealizations?.find(
        (candidate) => candidate.afterVisitIndex === afterVisitIndex
      );
    }
    ports() {
      const realization = this.expectAtLeast("emitted", "ports");
      return realization.ports;
    }
    points() {
      const realization = this.expectAtLeast("emitted", "points");
      return realization.points;
    }
    segmentVisitOf(segmentIndex) {
      const realization = this.expectAtLeast("emitted", "segmentVisitOf");
      const segmentCount = realization.points.length - 1;
      if (!Number.isInteger(segmentIndex) || segmentIndex < 0 || segmentIndex >= segmentCount) {
        throw new Error(`route ${this.requestIndex}: segment ${segmentIndex} out of range`);
      }
      return realization.segmentVisitByIndex[segmentIndex];
    }
    expectVisitValues(values, name) {
      if (values.length !== this.visits.length) {
        throw new Error(
          `route ${this.requestIndex}: ${values.length} ${name} for ${this.visits.length} visits`
        );
      }
    }
    expectVisitIndex(visitIndex) {
      if (!Number.isInteger(visitIndex) || visitIndex < 0 || visitIndex >= this.visits.length) {
        throw new Error(`route ${this.requestIndex}: visit ${visitIndex} out of range`);
      }
      return visitIndex;
    }
    expectPhase(phase, caller) {
      const realization = this.realization;
      if (!realization) {
        throw new Error(`route ${this.requestIndex}: ${caller} requires an active realization`);
      }
      if (realization.phase !== phase) {
        throw new Error(
          `route ${this.requestIndex}: ${caller} requires phase '${phase}', at '${realization.phase}'`
        );
      }
      return realization;
    }
    expectAtLeast(phase, caller) {
      const realization = this.realization;
      if (!realization) {
        throw new Error(`route ${this.requestIndex}: ${caller} requires an active realization`);
      }
      if (PHASE_RANK[realization.phase] < PHASE_RANK[phase]) {
        throw new Error(
          `route ${this.requestIndex}: ${caller} requires phase >= '${phase}', at '${realization.phase}'`
        );
      }
      return realization;
    }
  };
  function validateVisit(requestIndex, visitIndex, visit) {
    if (!Number.isInteger(visit.corridorIndex) || visit.corridorIndex < 0) {
      throw new Error(`route ${requestIndex}: invalid corridor for visit ${visitIndex}`);
    }
    const [start, end] = visit.feasibleTrack;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
      throw new Error(`route ${requestIndex}: invalid feasible track for visit ${visitIndex}`);
    }
    validateBoundary(requestIndex, visitIndex, "entry", visit.entry);
    validateBoundary(requestIndex, visitIndex, "exit", visit.exit);
  }
  function cloneRoute(route, requestIndex = route.requestIndex) {
    return new Route(requestIndex, route.from, route.to, route.visits);
  }
  function validateEndpoint(requestIndex, side, endpoint) {
    if (!Number.isInteger(endpoint.entityIndex) || endpoint.entityIndex < 0) {
      throw new Error(`route ${requestIndex}: invalid ${side} entity index`);
    }
    if (endpoint.authoredTrack !== void 0 && !Number.isFinite(endpoint.authoredTrack)) {
      throw new Error(`route ${requestIndex}: invalid ${side} authored track`);
    }
    if (endpoint.portGroup !== void 0 && (!Number.isInteger(endpoint.portGroup) || endpoint.portGroup < 0)) {
      throw new Error(`route ${requestIndex}: invalid ${side} port group`);
    }
  }
  function validateBoundary(requestIndex, visitIndex, side, boundary) {
    const index = boundary.kind === "terminal" ? boundary.attachmentIndex : boundary.portalIndex;
    if (!Number.isInteger(index) || index < 0) {
      throw new Error(`route ${requestIndex}: invalid ${side} boundary for visit ${visitIndex}`);
    }
  }
  function validateGeometry(requestIndex, from, to, ports, points) {
    if (points.length < 2) {
      throw new Error(`route ${requestIndex}: emitted polyline needs at least 2 points`);
    }
    if (!samePoint(points[0], ports.from) || !samePoint(points[points.length - 1], ports.to)) {
      throw new Error(`route ${requestIndex}: emitted endpoints do not match ports`);
    }
    const authoredX = authoredTracksOnAxis(from, to, "x");
    const authoredY = authoredTracksOnAxis(from, to, "y");
    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
      const point = points[pointIndex];
      const terminal = pointIndex === 0 || pointIndex === points.length - 1;
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y) || !terminal && (!quantizedOrAuthored(point.x, authoredX) || !quantizedOrAuthored(point.y, authoredY))) {
        throw new Error(`route ${requestIndex}: emitted point ${pointIndex} is not quantized`);
      }
      if (pointIndex === 0) {
        continue;
      }
      const previous = points[pointIndex - 1];
      if (samePoint(previous, point)) {
        throw new Error(`route ${requestIndex}: duplicate emitted point ${pointIndex}`);
      }
      if (previous.x !== point.x && previous.y !== point.y) {
        throw new Error(`route ${requestIndex}: diagonal emitted segment ${pointIndex - 1}`);
      }
    }
  }
  function validateBoundaryRealizations(requestIndex, visitCount, realizations) {
    let previousAfterVisitIndex = 0;
    for (const realization of realizations) {
      if (!Number.isInteger(realization.afterVisitIndex) || realization.afterVisitIndex <= previousAfterVisitIndex || realization.afterVisitIndex >= visitCount) {
        throw new Error(
          `route ${requestIndex}: invalid boundary realization ${realization.afterVisitIndex}`
        );
      }
      if (realization.kind === "turn-retrack") {
        if (!Number.isFinite(realization.beforePortalTrack) || !Number.isFinite(realization.afterPortalTrack) || realization.shifts.length < 1 || realization.shifts.length > 2 || realization.shifts.some(
          (shift) => shift.hostVisitIndex !== realization.afterVisitIndex - 1 && shift.hostVisitIndex !== realization.afterVisitIndex || !Number.isFinite(shift.shiftCoordinate) || !Number.isFinite(shift.trackAfter)
        )) {
          throw new Error(
            `route ${requestIndex}: boundary ${realization.afterVisitIndex} has invalid turn re-track`
          );
        }
        previousAfterVisitIndex = realization.afterVisitIndex;
        continue;
      }
      if (realization.shifts.length !== 1) {
        throw new Error(`route ${requestIndex}: boundary has invalid shift count`);
      }
      for (const shift of realization.shifts) {
        if (shift.hostVisitIndex !== realization.afterVisitIndex - 1 && shift.hostVisitIndex !== realization.afterVisitIndex) {
          throw new Error(
            `route ${requestIndex}: boundary ${realization.afterVisitIndex} has invalid host visit`
          );
        }
        if (!Number.isFinite(shift.shiftCoordinate) || !Number.isFinite(shift.trackAfter)) {
          throw new Error(
            `route ${requestIndex}: boundary ${realization.afterVisitIndex} has invalid shift`
          );
        }
      }
      previousAfterVisitIndex = realization.afterVisitIndex;
    }
  }
  function validateSegmentProvenance(requestIndex, visitCount, pointCount, segmentVisitByIndex) {
    const segmentCount = pointCount - 1;
    if (segmentVisitByIndex.length !== segmentCount) {
      throw new Error(
        `route ${requestIndex}: ${segmentVisitByIndex.length} segment visits for ${segmentCount} emitted segments`
      );
    }
    for (let segmentIndex = 0; segmentIndex < segmentVisitByIndex.length; segmentIndex += 1) {
      const visitIndex = segmentVisitByIndex[segmentIndex];
      if (!Number.isInteger(visitIndex) || visitIndex < 0 || visitIndex >= visitCount) {
        throw new Error(
          `route ${requestIndex}: invalid visit ${visitIndex} for segment ${segmentIndex}`
        );
      }
    }
  }
  function authoredTracksOnAxis(from, to, axis) {
    const result = [];
    for (const endpoint of [from, to]) {
      const trackAxis = endpoint.face === "left" || endpoint.face === "right" ? "y" : "x";
      if (trackAxis === axis && endpoint.authoredTrack !== void 0) {
        result.push(endpoint.authoredTrack);
      }
    }
    return result;
  }
  function quantizedOrAuthored(value, authoredTracks) {
    return Number.isInteger(value) || authoredTracks.some(
      (authoredTrack) => Math.abs(value - authoredTrack) <= AUTHORED_PORT_TOLERANCE_PX
    );
  }

  // packages/layout/src/routing/corridor/adoptRoutes.ts
  var TOLERANCE_PX = 0.75;
  var AXIS_EPSILON = 1e-6;
  function toOrthogonalSegments(points) {
    if (points.length < 2) {
      return void 0;
    }
    const segments = [];
    for (let index = 0; index + 1 < points.length; index += 1) {
      const [fromX, fromY] = points[index];
      const [toX, toY] = points[index + 1];
      const dx = toX - fromX;
      const dy = toY - fromY;
      if (Math.abs(dx) > AXIS_EPSILON && Math.abs(dy) > AXIS_EPSILON) {
        return void 0;
      }
      if (Math.abs(dx) <= AXIS_EPSILON && Math.abs(dy) <= AXIS_EPSILON) {
        continue;
      }
      const axis = Math.abs(dx) > AXIS_EPSILON ? "x" : "y";
      const track = axis === "x" ? fromY : fromX;
      const travelEnd = axis === "x" ? toX : toY;
      const previous = segments[segments.length - 1];
      if (previous !== void 0 && previous.axis === axis) {
        previous.travelEnd = travelEnd;
        continue;
      }
      segments.push({
        axis,
        track,
        travelStart: axis === "x" ? fromX : fromY,
        travelEnd
      });
    }
    return segments.length === 0 ? void 0 : segments;
  }
  function terminalAttachmentFor(world, endpoint, axis, coordinateAtFace, track) {
    for (const attachmentIndex of world.indexer.attachmentsForEndpoint(endpoint)) {
      const attachment = world.indexer.attachments[attachmentIndex];
      const corridor = world.indexer.corridors[attachment.corridorIndex];
      if (corridor.axis === axis && coordinateInSpan(track, corridorCrossSpan(corridor), TOLERANCE_PX) && coordinateInSpan(coordinateAtFace, corridorTravelSpan(corridor), TOLERANCE_PX) && coordinateInSpan(track, attachment.faceSpan, TOLERANCE_PX)) {
        return attachment;
      }
    }
    return void 0;
  }
  function rectContains(rect, point) {
    return point[0] >= rect.x - TOLERANCE_PX && point[0] <= rect.x + rect.width + TOLERANCE_PX && point[1] >= rect.y - TOLERANCE_PX && point[1] <= rect.y + rect.height + TOLERANCE_PX;
  }
  function nextContinuePortal(world, corridorIndex, axis, track, target, forward) {
    let fallback;
    for (const portal of world.indexer.portalsFrom(corridorIndex)) {
      if (portal.kind !== "continue" || portal.axis !== axis) {
        continue;
      }
      const onExitSide = forward ? portal.negativeCorridorIndex === corridorIndex : portal.positiveCorridorIndex === corridorIndex;
      if (!onExitSide || !coordinateInSpan(track, portal.crossSpan, TOLERANCE_PX)) {
        continue;
      }
      const other = world.indexer.otherCorridorIndex(portal, corridorIndex);
      if (coordinateInSpan(target, corridorTravelSpan(world.indexer.corridors[other]), TOLERANCE_PX)) {
        return portal;
      }
      fallback = fallback ?? portal;
    }
    return fallback;
  }
  function turnPortalAt(world, corridorIndex, corner, nextTrack, nextTarget) {
    let fallback;
    for (const portal of world.indexer.portalsFrom(corridorIndex)) {
      if (portal.kind !== "turn" || !rectContains(portal.rect, corner)) {
        continue;
      }
      const other = world.indexer.otherCorridorIndex(portal, corridorIndex);
      const otherCorridor = world.indexer.corridors[other];
      if (!coordinateInSpan(nextTrack, corridorCrossSpan(otherCorridor), TOLERANCE_PX)) {
        continue;
      }
      if (coordinateInSpan(nextTarget, corridorTravelSpan(otherCorridor), TOLERANCE_PX)) {
        return { portal, otherCorridorIndex: other };
      }
      fallback = fallback ?? { portal, otherCorridorIndex: other };
    }
    return fallback;
  }
  function adoptRoute(world, request, points, options = {}) {
    const segments = toOrthogonalSegments(points);
    if (segments === void 0) {
      return void 0;
    }
    segments[0].travelStart = terminalFacePlane(
      world.entities[request.from.entityIndex],
      request.from.face
    );
    segments[segments.length - 1].travelEnd = terminalFacePlane(
      world.entities[request.to.entityIndex],
      request.to.face
    );
    const first = segments[0];
    const sourceAttachment = terminalAttachmentFor(
      world,
      request.from,
      first.axis,
      first.travelStart,
      first.track
    );
    if (sourceAttachment === void 0) {
      return void 0;
    }
    const visits = [
      {
        corridorIndex: sourceAttachment.corridorIndex,
        entry: { kind: "terminal", attachmentIndex: sourceAttachment.index },
        track: first.track
      }
    ];
    const current = () => visits[visits.length - 1];
    for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
      const segment = segments[segmentIndex];
      if (segmentIndex > 0) {
        const previous = segments[segmentIndex - 1];
        const corner = previous.axis === "x" ? [previous.travelEnd, previous.track] : [previous.track, previous.travelEnd];
        const turn = turnPortalAt(
          world,
          current().corridorIndex,
          corner,
          segment.track,
          segment.travelEnd
        );
        if (turn === void 0) {
          return void 0;
        }
        current().exit = { kind: "portal", portalIndex: turn.portal.index, mode: "turn" };
        visits.push({
          corridorIndex: turn.otherCorridorIndex,
          entry: { kind: "portal", portalIndex: turn.portal.index, mode: "turn" },
          track: segment.track
        });
      }
      const forward = segment.travelEnd >= segment.travelStart;
      let guard = world.indexer.corridors.length + 1;
      while (!coordinateInSpan(
        segment.travelEnd,
        corridorTravelSpan(world.indexer.corridors[current().corridorIndex]),
        TOLERANCE_PX
      )) {
        guard -= 1;
        if (guard <= 0) {
          return void 0;
        }
        const portal = nextContinuePortal(
          world,
          current().corridorIndex,
          segment.axis,
          segment.track,
          segment.travelEnd,
          forward
        );
        if (portal === void 0) {
          return void 0;
        }
        current().exit = { kind: "portal", portalIndex: portal.index, mode: "continue-straight" };
        visits.push({
          corridorIndex: world.indexer.otherCorridorIndex(portal, current().corridorIndex),
          entry: { kind: "portal", portalIndex: portal.index, mode: "continue-straight" },
          track: segment.track
        });
      }
    }
    const last = segments[segments.length - 1];
    const targetAttachment = terminalAttachmentFor(
      world,
      request.to,
      last.axis,
      last.travelEnd,
      last.track
    );
    if (targetAttachment === void 0 || targetAttachment.corridorIndex !== current().corridorIndex) {
      return void 0;
    }
    current().exit = { kind: "terminal", attachmentIndex: targetAttachment.index };
    const corridorVisits = [];
    for (const visit of visits) {
      const exit = visit.exit;
      if (exit === void 0) {
        return void 0;
      }
      let feasibleTrack = boundaryConstrainedSpan(world, visit.corridorIndex, visit.entry, exit);
      if (feasibleTrack === void 0) {
        return void 0;
      }
      if (options.pinTracks !== false) {
        const pinnedTrack = Math.min(Math.max(visit.track, feasibleTrack[0]), feasibleTrack[1]);
        feasibleTrack = [pinnedTrack, pinnedTrack];
      }
      corridorVisits.push({
        corridorIndex: visit.corridorIndex,
        entry: visit.entry,
        exit,
        feasibleTrack
      });
    }
    return new Route(request.requestIndex, request.from, request.to, corridorVisits);
  }
  function boundaryConstrainedSpan(world, corridorIndex, entry, exit) {
    let span = corridorCrossSpan(world.indexer.corridors[corridorIndex]);
    for (const boundary of [entry, exit]) {
      const constraint = boundaryCrossSpan(world, corridorIndex, boundary);
      const intersection = intersectSpans(span, constraint, TOLERANCE_PX);
      if (intersection === void 0) {
        return void 0;
      }
      span = intersection;
    }
    return span;
  }
  function boundaryCrossSpan(world, corridorIndex, boundary) {
    const corridor = world.indexer.corridors[corridorIndex];
    if (boundary.kind === "terminal") {
      return world.indexer.attachments[boundary.attachmentIndex].faceSpan;
    }
    const portal = world.indexer.portals[boundary.portalIndex];
    if (portal.kind === "continue") {
      return portal.crossSpan;
    }
    return crossSpanOf(corridor.axis, portal.rect);
  }

  // packages/layout/src/routing/corridor/runDisplacement.ts
  var MAX_L_RESIDUAL_PX = 8;
  function realizeRunDisplacement(request) {
    const { points, segmentIndex } = request;
    if (segmentIndex < 0 || segmentIndex + 1 >= points.length) {
      throw new Error(`run displacement: invalid segment ${segmentIndex}`);
    }
    const from = points[segmentIndex];
    const to = points[segmentIndex + 1];
    const axis = segmentAxis(from, to);
    if (!axis) {
      return void 0;
    }
    const baseTrack = axisOrthMin(from, axis);
    if (Math.abs(baseTrack - axisOrthMin(to, axis)) > ROUTING_EPSILON) {
      return void 0;
    }
    if (Math.abs(baseTrack - request.displacedTrack) <= ROUTING_EPSILON) {
      return {
        displacement: {
          kind: "straight",
          baseTrack,
          displacedTrack: baseTrack
        },
        points
      };
    }
    const startTravel = axisStart(from, axis);
    const endTravel = axisStart(to, axis);
    const direction2 = endTravel >= startTravel ? 1 : -1;
    const length = Math.abs(endTravel - startTravel);
    const window = orderedSpan(request.labelWindow[0], request.labelWindow[1]);
    const windowStart = direction2 * (window[0] - startTravel);
    const windowEnd = direction2 * (window[1] - startTravel);
    const windowAlong = orderedSpan(windowStart, windowEnd);
    if (windowAlong[0] < -ROUTING_EPSILON || windowAlong[1] > length + ROUTING_EPSILON) {
      return void 0;
    }
    const displacedStart = Math.max(0, Math.floor(windowAlong[0] - request.jogMargin));
    const displacedEnd = Math.min(length, Math.ceil(windowAlong[1] + request.jogMargin));
    if (displacedEnd - displacedStart <= ROUTING_EPSILON) {
      return void 0;
    }
    const modes = [];
    if (request.allowLAbsorption !== false) {
      const lCandidates = [];
      if (displacedEnd < length - ROUTING_EPSILON && canAbsorbAtFrom(points, segmentIndex, axis, request.displacedTrack)) {
        lCandidates.push({ mode: "l-from", extension: displacedStart });
      }
      if (displacedStart > ROUTING_EPSILON && canAbsorbAtTo(points, segmentIndex, axis, request.displacedTrack)) {
        lCandidates.push({ mode: "l-to", extension: length - displacedEnd });
      }
      lCandidates.sort(
        (left, right) => left.extension - right.extension || left.mode.localeCompare(right.mode)
      );
      const previousTrack = segmentIndex > 0 ? axisOrthMin(points[segmentIndex - 1], axis) : void 0;
      const nextTrack = segmentIndex + 2 < points.length ? axisOrthMin(points[segmentIndex + 2], axis) : void 0;
      if (request.allowFullShift === true && (displacedStart <= MAX_L_RESIDUAL_PX && canAbsorbAtTo(points, segmentIndex, axis, request.displacedTrack) && previousTrack !== void 0 && preservesDirection(previousTrack, baseTrack, request.displacedTrack) || length - displacedEnd <= MAX_L_RESIDUAL_PX && canAbsorbAtFrom(points, segmentIndex, axis, request.displacedTrack) && nextTrack !== void 0 && preservesDirection(nextTrack, baseTrack, request.displacedTrack))) {
        modes.push("shift");
      }
      modes.push(...lCandidates.map((candidate) => candidate.mode));
    }
    if (displacedStart > ROUTING_EPSILON && displacedEnd < length - ROUTING_EPSILON) {
      modes.push("u");
    }
    for (const mode of modes) {
      const pieceBounds = mode === "shift" ? [0, length] : mode === "l-from" ? [0, displacedEnd] : mode === "l-to" ? [displacedStart, length] : [displacedStart, displacedEnd];
      const local = localGeometry(
        axis,
        startTravel,
        direction2,
        length,
        baseTrack,
        request.displacedTrack,
        pieceBounds,
        mode
      );
      const realized = splicePoints(points, segmentIndex, local);
      return {
        displacement: {
          kind: mode,
          baseTrack,
          displacedTrack: request.displacedTrack
        },
        points: realized
      };
    }
    return void 0;
  }
  function localGeometry(axis, startTravel, direction2, length, baseTrack, displacedTrack, pieceBounds, mode) {
    const point = (along, track) => pointOnRun(axis, startTravel, direction2, along, track);
    if (mode === "shift") {
      return [point(0, displacedTrack), point(length, displacedTrack)];
    }
    if (mode === "l-from") {
      return [
        point(0, displacedTrack),
        point(pieceBounds[1], displacedTrack),
        point(pieceBounds[1], baseTrack),
        point(length, baseTrack)
      ];
    }
    if (mode === "l-to") {
      return [
        point(0, baseTrack),
        point(pieceBounds[0], baseTrack),
        point(pieceBounds[0], displacedTrack),
        point(length, displacedTrack)
      ];
    }
    return [
      point(0, baseTrack),
      point(pieceBounds[0], baseTrack),
      point(pieceBounds[0], displacedTrack),
      point(pieceBounds[1], displacedTrack),
      point(pieceBounds[1], baseTrack),
      point(length, baseTrack)
    ];
  }
  function pointOnRun(axis, startTravel, direction2, along, track) {
    return axisPoint(axis, startTravel + direction2 * along, track);
  }
  function preservesDirection(endpointTrack2, baseTrack, displacedTrack) {
    const original = baseTrack - endpointTrack2;
    const shifted = displacedTrack - endpointTrack2;
    return Math.abs(shifted) > ROUTING_EPSILON && original * shifted > 0;
  }
  function splicePoints(points, segmentIndex, local) {
    return [...points.slice(0, segmentIndex), ...local, ...points.slice(segmentIndex + 2)];
  }
  function canAbsorbAtFrom(points, segmentIndex, axis, track) {
    if (segmentIndex === 0) {
      return false;
    }
    const previous = points[segmentIndex - 1];
    const corner = points[segmentIndex];
    return segmentAxis(previous, corner) !== axis && coordinateInSpan(
      track,
      orderedSpan(axisOrthMin(previous, axis), axisOrthMin(corner, axis)),
      ROUTING_EPSILON
    );
  }
  function canAbsorbAtTo(points, segmentIndex, axis, track) {
    if (segmentIndex + 2 >= points.length) {
      return false;
    }
    const corner = points[segmentIndex + 1];
    const next = points[segmentIndex + 2];
    return segmentAxis(corner, next) !== axis && coordinateInSpan(
      track,
      orderedSpan(axisOrthMin(corner, axis), axisOrthMin(next, axis)),
      ROUTING_EPSILON
    );
  }

  // packages/layout/src/routing/corridor/text.ts
  var LABEL_LINE_CLEARANCE_PX = 4;
  var LABEL_JOG_MARGIN_PX = 16;

  // packages/layout/src/routing/corridor/travelSpans.ts
  var TERMINAL_LABEL_GAP_PX = 8;
  function clearTravelSpans(world, routeSegmentIndex, ownerPoints, occupied, ownerRouteIndex, segment, size, legal) {
    const alongExtent = segment.axis === "x" ? size.width : size.height;
    const crossExtent = segment.axis === "x" ? size.height : size.width;
    const track = segment.axis === "x" ? segment.from.y : segment.from.x;
    const worldAlong = segment.axis === "x" ? [world.bounds.x + alongExtent / 2, world.bounds.x + world.bounds.width - alongExtent / 2] : [world.bounds.y + alongExtent / 2, world.bounds.y + world.bounds.height - alongExtent / 2];
    const worldCross = segment.axis === "x" ? [world.bounds.y, world.bounds.y + world.bounds.height] : [world.bounds.x, world.bounds.x + world.bounds.width];
    if (track - crossExtent / 2 < worldCross[0] - ROUTING_EPSILON || track + crossExtent / 2 > worldCross[1] + ROUTING_EPSILON) {
      return { bounds: legal, clear: [], structural: [] };
    }
    const bounded = [
      Math.max(legal[0], worldAlong[0]),
      Math.min(legal[1], worldAlong[1])
    ];
    if (bounded[0] > bounded[1] + ROUTING_EPSILON) {
      return { bounds: bounded, clear: [], structural: [] };
    }
    const excluded = [];
    for (const entity of world.entities) {
      if (entity.isContainer === true) {
        addContainerBoundaryExclusions(excluded, segment, size, entity);
      } else {
        addRectTravelExclusion(excluded, segment, size, entity, 0);
      }
    }
    const structural = subtractSpans(bounded, excluded, ROUTING_EPSILON);
    for (const rect of occupied) {
      addRectTravelExclusion(excluded, segment, size, rect, TERMINAL_LABEL_GAP_PX);
    }
    const searchRect = segment.axis === "x" ? {
      x: bounded[0] - alongExtent / 2,
      y: track - crossExtent / 2 - LABEL_LINE_CLEARANCE_PX,
      width: bounded[1] - bounded[0] + alongExtent,
      height: crossExtent + 2 * LABEL_LINE_CLEARANCE_PX
    } : {
      x: track - crossExtent / 2 - LABEL_LINE_CLEARANCE_PX,
      y: bounded[0] - alongExtent / 2,
      width: crossExtent + 2 * LABEL_LINE_CLEARANCE_PX,
      height: bounded[1] - bounded[0] + alongExtent
    };
    for (const other of routeSegmentIndex.segmentsInRect(searchRect, ownerRouteIndex)) {
      addLineTravelExclusion(excluded, segment, size, other.from, other.to, LABEL_LINE_CLEARANCE_PX);
    }
    for (let index = 0; index + 1 < ownerPoints.length; index += 1) {
      if (index === segment.index) {
        continue;
      }
      addLineTravelExclusion(
        excluded,
        segment,
        size,
        ownerPoints[index],
        ownerPoints[index + 1],
        LABEL_LINE_CLEARANCE_PX
      );
    }
    return { bounds: bounded, clear: subtractSpans(bounded, excluded, ROUTING_EPSILON), structural };
  }
  function addRectTravelExclusion(excluded, segment, size, rect, clearance) {
    const alongExtent = segment.axis === "x" ? size.width : size.height;
    const crossExtent = segment.axis === "x" ? size.height : size.width;
    const track = segment.axis === "x" ? segment.from.y : segment.from.x;
    const crossStart = segment.axis === "x" ? rect.y : rect.x;
    const crossLength = segment.axis === "x" ? rect.height : rect.width;
    if (overlapLength(
      track - crossExtent / 2 - clearance,
      crossExtent + 2 * clearance,
      crossStart,
      crossLength
    ) <= ROUTING_EPSILON) {
      return;
    }
    const travelStart = segment.axis === "x" ? rect.x : rect.y;
    const travelLength = segment.axis === "x" ? rect.width : rect.height;
    excluded.push([
      travelStart - alongExtent / 2 - clearance,
      travelStart + travelLength + alongExtent / 2 + clearance
    ]);
  }
  function addContainerBoundaryExclusions(excluded, segment, size, container) {
    const corners = [
      { x: container.x, y: container.y },
      { x: container.x + container.width, y: container.y },
      { x: container.x + container.width, y: container.y + container.height },
      { x: container.x, y: container.y + container.height }
    ];
    for (let index = 0; index < corners.length; index += 1) {
      addLineTravelExclusion(
        excluded,
        segment,
        size,
        corners[index],
        corners[(index + 1) % corners.length],
        0
      );
    }
  }
  function addLineTravelExclusion(excluded, segment, size, from, to, clearance) {
    const alongExtent = segment.axis === "x" ? size.width : size.height;
    const crossExtent = segment.axis === "x" ? size.height : size.width;
    const track = segment.axis === "x" ? segment.from.y : segment.from.x;
    const lineFollowsHostAxis = segment.axis === "x" ? Math.abs(from.y - to.y) <= ROUTING_EPSILON : Math.abs(from.x - to.x) <= ROUTING_EPSILON;
    const lineCrossStart = lineFollowsHostAxis ? segment.axis === "x" ? from.y : from.x : Math.min(segment.axis === "x" ? from.y : from.x, segment.axis === "x" ? to.y : to.x);
    const lineCrossLength = lineFollowsHostAxis ? 0 : Math.abs(segment.axis === "x" ? to.y - from.y : to.x - from.x);
    if (lineCrossStart > track + crossExtent / 2 + clearance + ROUTING_EPSILON || lineCrossStart + lineCrossLength < track - crossExtent / 2 - clearance - ROUTING_EPSILON) {
      return;
    }
    const firstTravel = segment.axis === "x" ? from.x : from.y;
    const secondTravel = segment.axis === "x" ? to.x : to.y;
    excluded.push([
      Math.min(firstTravel, secondTravel) - alongExtent / 2 - clearance,
      Math.max(firstTravel, secondTravel) + alongExtent / 2 + clearance
    ]);
  }

  // packages/layout/src/routing/corridor/labelPlacement.ts
  var TARGET_ARROWHEAD_MARGIN_PX = 12;
  var BEND_MARGIN_PX = LABEL_LINE_CLEARANCE_PX;
  var ALIGNMENT_TOLERANCE_PX = 12;
  var WIDE_U_END_MARGIN_PX = 24;
  var ORIGIN_COST = {
    alignment: -14,
    "gap-center": -12,
    "corridor-center": -5,
    "segment-center": -5,
    "clear-space": 0
  };
  var TextRouteSegmentIndex = class {
    constructor(pointsByRoute) {
      __publicField(this, "tree", new LayoutTree());
      const segments = [];
      for (let routeIndex = 0; routeIndex < pointsByRoute.length; routeIndex += 1) {
        const points = pointsByRoute[routeIndex];
        for (let segmentIndex = 0; segmentIndex + 1 < points.length; segmentIndex += 1) {
          const from = points[segmentIndex];
          const to = points[segmentIndex + 1];
          segments.push({
            routeIndex,
            segmentIndex,
            from,
            to,
            x: Math.min(from.x, to.x),
            y: Math.min(from.y, to.y),
            width: Math.abs(to.x - from.x),
            height: Math.abs(to.y - from.y)
          });
        }
      }
      this.tree.load(segments);
    }
    segmentsInRect(rect, excludedRouteIndex) {
      const segments = [];
      this.tree.forEachIntersectingBounds(
        rect.x,
        rect.y,
        rect.x + rect.width,
        rect.y + rect.height,
        (segment) => {
          if (segment.routeIndex !== excludedRouteIndex) {
            segments.push(segment);
          }
        }
      );
      return segments;
    }
  };
  function placeLabels(world, routes, specs) {
    for (const route of routes) {
      route.assertEmitted();
    }
    const sizes = labelSizes(routes.length, specs);
    const routePoints = routes.map((route) => route.points());
    let segmentIndex = new TextRouteSegmentIndex(routePoints);
    const candidatesByRoute = /* @__PURE__ */ new Map();
    const placements = [];
    const occupied = [];
    const offlineRouteIndexes = /* @__PURE__ */ new Set();
    for (const [routeIndex, size] of sizes) {
      const candidates = placementCandidates(
        world,
        routes[routeIndex],
        routePoints[routeIndex],
        segmentIndex,
        routeIndex,
        size
      );
      candidatesByRoute.set(routeIndex, candidates);
    }
    for (const [routeIndex] of sizes) {
      const candidates = candidatesByRoute.get(routeIndex) ?? [];
      if (candidates.some(({ slack }) => slack >= 0)) {
        continue;
      }
      const fallback = candidates[0];
      if (!fallback) {
        throw new Error(`label placement: route ${routes[routeIndex].requestIndex} has no segment`);
      }
      const placement = offlinePlacement(
        world,
        routePoints[routeIndex],
        segmentIndex,
        occupied,
        fallback
      );
      placements.push(placement);
      occupied.push(placement.rect);
      offlineRouteIndexes.add(routeIndex);
    }
    addAlignmentCandidates(world, routePoints, segmentIndex, occupied, candidatesByRoute);
    const coordinated = resolveCandidateConflicts(world, candidatesByRoute, routePoints, occupied);
    for (const [routeIndex, points] of coordinated.points) {
      routePoints[routeIndex] = points;
    }
    placements.push(...coordinated.placements);
    occupied.push(...coordinated.placements.map(({ rect }) => rect));
    segmentIndex = new TextRouteSegmentIndex(routePoints);
    for (const [routeIndex] of sizes) {
      if (offlineRouteIndexes.has(routeIndex) || coordinated.routeIndexes.has(routeIndex)) {
        continue;
      }
      const route = routes[routeIndex];
      const baseCandidates = candidatesByRoute.get(routeIndex) ?? [];
      const evaluated = baseCandidates.filter((candidate) => candidate.slack >= 0).map((candidate) => ({
        candidate,
        defects: candidateDefects(
          world,
          segmentIndex,
          routePoints[routeIndex],
          occupied,
          routeIndex,
          candidate.segmentIndex,
          candidate.rect
        )
      })).sort(compareEvaluatedCandidates);
      const selected = evaluated[0]?.candidate;
      if (!selected) {
        const fallback = baseCandidates[0];
        if (!fallback) {
          throw new Error(`label placement: route ${route.requestIndex} has no non-zero segment`);
        }
        const placement2 = offlinePlacement(
          world,
          routePoints[routeIndex],
          segmentIndex,
          occupied,
          fallback
        );
        placements.push(placement2);
        occupied.push(placement2.rect);
        continue;
      }
      if (selected.points) {
        routePoints[routeIndex] = selected.points;
        segmentIndex = new TextRouteSegmentIndex(routePoints);
      }
      const placement = {
        routeIndex,
        rect: selected.rect,
        host: {
          kind: "segment",
          segmentIndex: selected.segmentIndex,
          ...selected.displacement ? { displacement: selected.displacement } : {}
        },
        tier: "on-line"
      };
      placements.push(placement);
      occupied.push(placement.rect);
    }
    return {
      placements: placements.sort((left, right) => left.routeIndex - right.routeIndex),
      routePoints
    };
  }
  function labelSizes(routeCount, specs) {
    const sizes = /* @__PURE__ */ new Map();
    for (const spec of specs) {
      if (!Number.isInteger(spec.routeIndex) || spec.routeIndex < 0 || spec.routeIndex >= routeCount || ![spec.size.width, spec.size.height].every((value) => Number.isFinite(value) && value > 0)) {
        throw new Error(`label placement: invalid spec for route ${spec.routeIndex}`);
      }
      if (sizes.has(spec.routeIndex)) {
        throw new Error(`label placement: duplicate label for route ${spec.routeIndex}`);
      }
      sizes.set(spec.routeIndex, spec.size);
    }
    return new Map([...sizes].sort(([left], [right]) => left - right));
  }
  function placementCandidates(world, route, points, routeSegmentIndex, routeIndex, size) {
    const candidates = [];
    for (const [firstSegmentIndex, lastSegmentIndex, axis] of straightRuns(points)) {
      const from = points[firstSegmentIndex];
      const firstTo = points[firstSegmentIndex + 1];
      const direction2 = Math.sign(axisStart(firstTo, axis) - axisStart(from, axis));
      const to = points[lastSegmentIndex + 1];
      const start = axisStart(from, axis);
      const end = axisStart(to, axis);
      const length = Math.abs(end - start);
      const extent = axis === "x" ? size.width : size.height;
      const fromMargin = firstSegmentIndex === 0 ? 0 : BEND_MARGIN_PX;
      const toMargin = lastSegmentIndex === points.length - 2 ? TARGET_ARROWHEAD_MARGIN_PX : BEND_MARGIN_PX;
      const runMidpoint = (start + end) / 2;
      const track = axisOrthMin(from, axis);
      const slack = length - extent - fromMargin - toMargin;
      if (extent + fromMargin + toMargin > length + ROUTING_EPSILON) {
        const segmentIndex = segmentIndexAtTravel(
          points,
          firstSegmentIndex,
          lastSegmentIndex,
          axis,
          runMidpoint
        );
        const anchor = axisPoint(axis, runMidpoint, track);
        candidates.push({
          routeIndex,
          sourceSegmentIndex: segmentIndex,
          segmentIndex,
          axis,
          travel: runMidpoint,
          track,
          legalTravel: [runMidpoint, runMidpoint],
          rect: centeredRect(anchor, size),
          origin: "segment-center",
          slack,
          clearSpanLength: length,
          midpointDistance: 0,
          alignmentSupport: 0
        });
        continue;
      }
      const legalTravel = orderedSpan(
        start + direction2 * (extent / 2 + fromMargin),
        end - direction2 * (extent / 2 + toMargin)
      );
      const travelSpace = clearTravelSpans(
        world,
        routeSegmentIndex,
        points,
        [],
        routeIndex,
        { index: firstSegmentIndex, axis, from },
        size,
        legalTravel
      );
      const options = /* @__PURE__ */ new Map();
      const add = (travel, origin, clearSpanLength) => {
        if (!coordinateInSpan(travel, legalTravel, ROUTING_EPSILON)) {
          return;
        }
        const key = travel.toFixed(6);
        const current = options.get(key);
        if (!current || ORIGIN_COST[origin] < ORIGIN_COST[current.origin]) {
          options.set(key, { travel, origin, clearSpanLength });
        }
      };
      for (const span of travelSpace.structural) {
        if (span[0] > travelSpace.bounds[0] + ROUTING_EPSILON && span[1] < travelSpace.bounds[1] - ROUTING_EPSILON) {
          add(midpoint(span), "gap-center", spanLength(span));
        }
      }
      for (const span of travelSpace.clear) {
        add(midpoint(span), "clear-space", spanLength(span));
      }
      const seenCorridors = /* @__PURE__ */ new Set();
      for (let segmentIndex = firstSegmentIndex; segmentIndex <= lastSegmentIndex; segmentIndex += 1) {
        const visitIndex = route.segmentVisitOf(segmentIndex);
        const corridorIndex = route.visits[visitIndex]?.corridorIndex;
        if (corridorIndex === void 0 || seenCorridors.has(corridorIndex)) {
          continue;
        }
        seenCorridors.add(corridorIndex);
        const corridor = world.indexer.corridors[corridorIndex];
        const corridorTravel = corridorTravelSpan(corridor);
        const corridorCenter2 = midpoint(corridorTravel);
        if (coordinateInSpan(corridorCenter2, legalTravel, ROUTING_EPSILON)) {
          add(corridorCenter2, "corridor-center", spanLength(corridorTravel));
        }
      }
      add(clampToSpan(runMidpoint, legalTravel), "segment-center", length);
      for (const option of options.values()) {
        const segmentIndex = segmentIndexAtTravel(
          points,
          firstSegmentIndex,
          lastSegmentIndex,
          axis,
          option.travel
        );
        const anchor = axisPoint(axis, option.travel, track);
        candidates.push({
          routeIndex,
          sourceSegmentIndex: segmentIndex,
          segmentIndex,
          axis,
          travel: option.travel,
          track,
          legalTravel,
          rect: centeredRect(anchor, size),
          origin: option.origin,
          slack,
          clearSpanLength: option.clearSpanLength,
          midpointDistance: Math.abs(option.travel - runMidpoint),
          alignmentSupport: 0
        });
      }
    }
    if (candidates.length === 0) {
      return [];
    }
    const online = candidates.filter((candidate) => candidate.slack >= 0);
    const cleanBounds = online.filter((candidate) => {
      const defects = candidateDefects(
        world,
        routeSegmentIndex,
        points,
        [],
        routeIndex,
        candidate.segmentIndex,
        candidate.rect
      );
      return defects.entityCollisionCount === 0;
    });
    return dedupeCandidates([
      ...cleanBounds.length > 0 ? cleanBounds : online,
      ...candidates.filter((candidate) => candidate.slack < 0)
    ]).sort(compareBaseCandidates);
  }
  function* straightRuns(points) {
    for (let first = 0; first + 1 < points.length; ) {
      const from = points[first];
      const firstTo = points[first + 1];
      const axis = segmentAxis(from, firstTo);
      if (!axis) {
        first += 1;
        continue;
      }
      const track = axisOrthMin(from, axis);
      const direction2 = Math.sign(axisStart(firstTo, axis) - axisStart(from, axis));
      let last = first;
      while (last + 2 < points.length) {
        const nextSegmentIndex = last + 1;
        const nextFrom = points[nextSegmentIndex];
        const nextTo = points[nextSegmentIndex + 1];
        if (segmentAxis(nextFrom, nextTo) !== axis || Math.abs(axisOrthMin(nextFrom, axis) - track) > ROUTING_EPSILON || Math.sign(axisStart(nextTo, axis) - axisStart(nextFrom, axis)) !== direction2) {
          break;
        }
        last += 1;
      }
      yield [first, last, axis];
      first = last + 1;
    }
  }
  function segmentIndexAtTravel(points, firstSegmentIndex, lastSegmentIndex, axis, travel) {
    for (let segmentIndex = firstSegmentIndex; segmentIndex <= lastSegmentIndex; segmentIndex += 1) {
      const span = orderedSpan(
        axisStart(points[segmentIndex], axis),
        axisStart(points[segmentIndex + 1], axis)
      );
      if (coordinateInSpan(travel, span, ROUTING_EPSILON)) {
        return segmentIndex;
      }
    }
    return firstSegmentIndex;
  }
  function addAlignmentCandidates(world, pointsByRoute, routeSegmentIndex, occupied, candidatesByRoute) {
    const preferred = [...candidatesByRoute.values()].flatMap((candidates) => candidates[0] && candidates[0].slack >= 0 ? [candidates[0]] : []).sort(
      (left, right) => left.axis.localeCompare(right.axis) || left.travel - right.travel || left.routeIndex - right.routeIndex
    );
    for (let start = 0; start < preferred.length; ) {
      let end = start + 1;
      while (end < preferred.length && preferred[end].axis === preferred[start].axis && preferred[end].travel - preferred[start].travel <= ALIGNMENT_TOLERANCE_PX + ROUTING_EPSILON) {
        end += 1;
      }
      const cluster = preferred.slice(start, end);
      const routeIndexes = new Set(cluster.map(({ routeIndex }) => routeIndex));
      if (routeIndexes.size > 1) {
        const travels = [...cluster].sort((left, right) => left.travel - right.travel);
        const middle = Math.floor(travels.length / 2);
        const target = travels.length % 2 === 0 ? (travels[middle - 1].travel + travels[middle].travel) / 2 : travels[middle].travel;
        for (const routeIndex of routeIndexes) {
          const candidates = candidatesByRoute.get(routeIndex) ?? [];
          const base = candidates.find(
            (candidate) => candidate.slack >= 0 && candidate.axis === preferred[start].axis && target >= candidate.legalTravel[0] - ROUTING_EPSILON && target <= candidate.legalTravel[1] + ROUTING_EPSILON && Math.abs(target - candidate.travel) <= ALIGNMENT_TOLERANCE_PX + ROUTING_EPSILON
          );
          if (!base) {
            continue;
          }
          const anchor = axisPoint(base.axis, target, base.track);
          const aligned = {
            ...base,
            travel: target,
            rect: centeredRect(anchor, base.rect),
            origin: "alignment",
            midpointDistance: base.midpointDistance + Math.abs(target - base.travel),
            alignmentSupport: routeIndexes.size
          };
          const defects = candidateDefects(
            world,
            routeSegmentIndex,
            pointsByRoute[routeIndex],
            occupied,
            routeIndex,
            aligned.segmentIndex,
            aligned.rect
          );
          if (defects.entityCollisionCount > 0) {
            continue;
          }
          candidates.push(aligned);
          candidates.sort(compareBaseCandidates);
        }
      }
      start = end;
    }
  }
  function resolveCandidateConflicts(world, candidatesByRoute, currentPoints, occupied) {
    const pending = /* @__PURE__ */ new Map();
    for (const [routeIndex, candidates] of candidatesByRoute) {
      const preferred = candidates[0];
      if (preferred && preferred.slack >= 0) {
        pending.set(routeIndex, preferred);
      }
    }
    const components = [];
    while (pending.size > 0) {
      const seed = pending.values().next().value;
      pending.delete(seed.routeIndex);
      const component = [seed];
      for (let cursor = 0; cursor < component.length; cursor += 1) {
        for (const candidate of [...pending.values()]) {
          if (candidate.axis === component[cursor].axis && Math.abs(candidate.travel - component[cursor].travel) <= ROUTING_EPSILON && candidateConflict(component[cursor], candidate)) {
            pending.delete(candidate.routeIndex);
            component.push(candidate);
          }
        }
      }
      if (component.length > 1) {
        components.push(component);
      }
    }
    const placements = [];
    const realizedPoints = /* @__PURE__ */ new Map();
    const routeIndexes = /* @__PURE__ */ new Set();
    components.sort(
      (left, right) => Math.min(...left.map(({ routeIndex }) => routeIndex)) - Math.min(...right.map(({ routeIndex }) => routeIndex))
    );
    for (const unsorted of components) {
      const axis = unsorted[0].axis;
      const travel = unsorted[0].travel;
      if (unsorted.some(
        (candidate) => candidate.axis !== axis || Math.abs(candidate.travel - travel) > ROUTING_EPSILON
      )) {
        continue;
      }
      const members = [...unsorted].sort(
        (left, right) => left.track - right.track || left.routeIndex - right.routeIndex
      );
      const tracks = balancedTracks(members);
      if (!tracks) {
        continue;
      }
      const jogMargins = displacementJogMargins(members, tracks, travel, currentPoints);
      const candidatePoints = [...currentPoints];
      const candidates = [];
      let failed = false;
      for (let index = 0; index < members.length; index += 1) {
        const member = members[index];
        const points = currentPoints[member.routeIndex];
        const track = tracks[index];
        const along = member.axis === "x" ? member.rect.width : member.rect.height;
        const window = [travel - along / 2, travel + along / 2];
        let realizedRoutePoints = points;
        let displacement;
        if (Math.abs(track - member.track) > ROUTING_EPSILON) {
          const realized = realizeRunDisplacement({
            points,
            segmentIndex: member.sourceSegmentIndex,
            labelWindow: window,
            displacedTrack: track,
            jogMargin: jogMargins[index],
            allowFullShift: true
          });
          if (!realized || addsObstacleCollision(world, points, realized.points)) {
            failed = true;
            break;
          }
          realizedRoutePoints = realized.points;
          displacement = realized.displacement;
        }
        candidatePoints[member.routeIndex] = realizedRoutePoints;
        const anchor = axisPoint(member.axis, travel, track);
        candidates.push({
          ...member,
          travel,
          track,
          rect: centeredRect(anchor, member.rect),
          origin: "alignment",
          alignmentSupport: members.length,
          segmentIndex: hostSegmentAt(realizedRoutePoints, member.axis, travel, track),
          ...displacement ? { points: realizedRoutePoints, displacement } : {}
        });
      }
      if (failed || candidates.length !== members.length || labelsOverlap(candidates)) {
        continue;
      }
      const affected = new Set(members.map(({ routeIndex }) => routeIndex));
      const before = affectedCollisionProfile(currentPoints, affected);
      const after = affectedCollisionProfile(candidatePoints, affected);
      if (after.crossings > before.crossings || after.overlapLength > before.overlapLength + ROUTING_EPSILON) {
        continue;
      }
      const candidateIndex = new TextRouteSegmentIndex(candidatePoints);
      if (candidates.some((candidate) => {
        const defects = candidateDefects(
          world,
          candidateIndex,
          candidatePoints[candidate.routeIndex],
          [
            ...occupied,
            ...candidates.filter((other) => other.routeIndex !== candidate.routeIndex).map(({ rect }) => rect)
          ],
          candidate.routeIndex,
          candidate.segmentIndex,
          candidate.rect
        );
        return !isClean(defects);
      })) {
        continue;
      }
      for (const candidate of candidates) {
        placements.push({
          routeIndex: candidate.routeIndex,
          rect: candidate.rect,
          host: {
            kind: "segment",
            segmentIndex: candidate.segmentIndex,
            ...candidate.displacement ? { displacement: candidate.displacement } : {}
          },
          tier: "on-line"
        });
        routeIndexes.add(candidate.routeIndex);
        if (candidate.points) {
          realizedPoints.set(candidate.routeIndex, candidate.points);
        }
      }
    }
    return { placements, points: realizedPoints, routeIndexes };
  }
  function candidateConflict(left, right) {
    return rectsOverlap(
      expandRect(left.rect, TERMINAL_LABEL_GAP_PX / 2),
      expandRect(right.rect, TERMINAL_LABEL_GAP_PX / 2)
    );
  }
  function labelsOverlap(candidates) {
    return candidates.some(
      (candidate, index) => candidates.some(
        (other, otherIndex) => index !== otherIndex && candidateConflict(candidate, other)
      )
    );
  }
  function balancedTracks(members) {
    const tracks = [0];
    for (let index = 1; index < members.length; index += 1) {
      tracks.push(tracks[index - 1] + memberGap(members[index - 1], members[index]));
    }
    const desiredShift = members.reduce((sum, member, index) => sum + member.track - tracks[index], 0) / members.length;
    return tracks.map((track) => track + desiredShift);
  }
  function memberGap(left, right) {
    const leftExtent = left.axis === "x" ? left.rect.height : left.rect.width;
    const rightExtent = right.axis === "x" ? right.rect.height : right.rect.width;
    return (leftExtent + rightExtent) / 2 + TERMINAL_LABEL_GAP_PX;
  }
  function displacementJogMargins(members, tracks, travel, pointsByRoute) {
    const amounts = members.map((member, index) => Math.abs(tracks[index] - member.track));
    const levels = [...new Set(amounts.filter((amount) => amount > ROUTING_EPSILON))].sort(
      (left, right) => left - right
    );
    return members.map((member, index) => {
      const points = pointsByRoute[member.routeIndex];
      const from = points[member.sourceSegmentIndex];
      const to = points[member.sourceSegmentIndex + 1];
      const along = member.axis === "x" ? member.rect.width : member.rect.height;
      const window = [travel - along / 2, travel + along / 2];
      const rank = levels.findIndex((amount) => Math.abs(amount - amounts[index]) <= ROUTING_EPSILON);
      return Math.max(
        LABEL_JOG_MARGIN_PX,
        preferredJogMargin(
          orderedSpan(axisStart(from, member.axis), axisStart(to, member.axis)),
          window
        ) - Math.max(0, levels.length - 1 - rank) * LABEL_LINE_CLEARANCE_PX
      );
    });
  }
  function addsObstacleCollision(world, before, after) {
    const incumbent = obstacleProfile(world, before);
    const candidate = obstacleProfile(world, after);
    return candidate.entityPiercings > incumbent.entityPiercings || candidate.containerCrossings > incumbent.containerCrossings;
  }
  function obstacleProfile(world, points) {
    let entityPiercings = 0;
    let containerCrossings = 0;
    for (let index = 0; index + 1 < points.length; index += 1) {
      const from = points[index];
      const to = points[index + 1];
      for (const entity of world.entities) {
        if (entity.isContainer === true) {
          containerCrossings += segmentContainerCrossings(from, to, entity);
        } else {
          entityPiercings += Number(segmentPiercesRect(from, to, entity));
        }
      }
    }
    return { entityPiercings, containerCrossings };
  }
  function segmentContainerCrossings(from, to, container) {
    const axis = segmentAxis(from, to);
    if (!axis) {
      return 0;
    }
    const travel = orderedSpan(axisStart(from, axis), axisStart(to, axis));
    const track = axisOrthMin(from, axis);
    const cross2 = axis === "x" ? [container.y, container.y + container.height] : [container.x, container.x + container.width];
    if (!inside(track, cross2[0], cross2[1] - cross2[0])) {
      return 0;
    }
    const boundaries = axis === "x" ? [container.x, container.x + container.width] : [container.y, container.y + container.height];
    return boundaries.filter((boundary) => inside(boundary, travel[0], travel[1] - travel[0])).length;
  }
  function affectedCollisionProfile(pointsByRoute, affectedRouteIndexes) {
    let crossings = 0;
    let overlapLength3 = 0;
    for (let leftIndex = 0; leftIndex < pointsByRoute.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < pointsByRoute.length; rightIndex += 1) {
        if (!affectedRouteIndexes.has(leftIndex) && !affectedRouteIndexes.has(rightIndex)) {
          continue;
        }
        const collision = geometryPairCollisionProfile(
          pointsByRoute[leftIndex],
          pointsByRoute[rightIndex]
        );
        crossings += collision.crossings;
        overlapLength3 += collision.overlapLength;
      }
    }
    return { crossings, overlapLength: overlapLength3 };
  }
  function geometryPairCollisionProfile(left, right) {
    let crossings = 0;
    let overlapLength3 = 0;
    for (let leftIndex = 0; leftIndex + 1 < left.length; leftIndex += 1) {
      for (let rightIndex = 0; rightIndex + 1 < right.length; rightIndex += 1) {
        const collision = segmentCollisionProfile(
          left[leftIndex],
          left[leftIndex + 1],
          right[rightIndex],
          right[rightIndex + 1]
        );
        crossings += collision.crossings;
        overlapLength3 += collision.overlapLength;
      }
    }
    return { crossings, overlapLength: overlapLength3 };
  }
  function offlinePlacement(world, points, routeSegmentIndex, occupied, candidate) {
    const { axis, routeIndex, segmentIndex, rect } = candidate;
    const anchor = axisPoint(axis, candidate.travel, candidate.track);
    const crossExtent = axis === "x" ? rect.height : rect.width;
    const crossOffset = crossExtent / 2 + LABEL_LINE_CLEARANCE_PX;
    const sides = routeIndex % 2 === 0 ? [1, -1] : [-1, 1];
    const choices = sides.map((side) => {
      const center2 = axis === "x" ? { x: anchor.x, y: anchor.y + side * crossOffset } : { x: anchor.x + side * crossOffset, y: anchor.y };
      const rect2 = centeredRect(center2, candidate.rect);
      return {
        rect: rect2,
        defects: candidateDefects(
          world,
          routeSegmentIndex,
          points,
          occupied,
          routeIndex,
          segmentIndex,
          rect2
        )
      };
    }).sort((left, right) => compareDefects(left.defects, right.defects));
    const choice = choices[0];
    const forced = !isClean(choice.defects);
    return {
      routeIndex,
      rect: choice.rect,
      host: { kind: "offline", anchor, ...forced ? { forced: true } : {} },
      tier: "offline"
    };
  }
  function compareEvaluatedCandidates(left, right) {
    return compareDefects(left.defects, right.defects) || compareBaseCandidates(left.candidate, right.candidate);
  }
  function compareBaseCandidates(left, right) {
    return Number(left.slack < 0) - Number(right.slack < 0) || compareNumber(candidateCost(left), candidateCost(right), ROUTING_EPSILON) || left.sourceSegmentIndex - right.sourceSegmentIndex || left.travel - right.travel || left.track - right.track;
  }
  function candidateCost(candidate) {
    return ORIGIN_COST[candidate.origin] - Math.min(160, candidate.slack) * 0.08 - Math.min(160, candidate.clearSpanLength) * 0.02 - candidate.alignmentSupport * 4 + Number(candidate.axis !== "x") * 6 + candidate.midpointDistance * 0.02 + (candidate.displacement ? 18 + Math.abs(candidate.displacement.displacedTrack - candidate.displacement.baseTrack) * 0.05 : 0);
  }
  function candidateDefects(world, routeSegmentIndex, ownerPoints, occupied, ownerRouteIndex, ownerSegmentIndex, rect) {
    const clearanceRect = expandRect(rect, LABEL_LINE_CLEARANCE_PX);
    return {
      occupiedOverlapCount: occupied.filter(
        (other) => rectsOverlap(expandRect(rect, TERMINAL_LABEL_GAP_PX), other)
      ).length,
      entityCollisionCount: world.entities.filter(
        (entity) => entity.isContainer === true ? rectCrossesBoundary(rect, entity) : rectsOverlap(rect, entity)
      ).length,
      lineCollisionCount: routeLineCollisionCount(ownerPoints, clearanceRect, ownerSegmentIndex) + routeSegmentIndex.segmentsInRect(clearanceRect, ownerRouteIndex).filter((segment) => segmentPiercesRect(segment.from, segment.to, clearanceRect)).length
    };
  }
  function routeLineCollisionCount(points, rect, ignoredSegmentIndex) {
    let ignoredStart = ignoredSegmentIndex ?? -1;
    let ignoredEnd = ignoredStart;
    if (ignoredSegmentIndex !== void 0) {
      const hostFrom = points[ignoredSegmentIndex];
      const hostTo = points[ignoredSegmentIndex + 1];
      const hostAxis = segmentAxis(hostFrom, hostTo);
      if (hostAxis) {
        const hostTrack = axisOrthMin(hostFrom, hostAxis);
        while (ignoredStart > 0 && segmentFollowsLine(points, ignoredStart - 1, hostAxis, hostTrack)) {
          ignoredStart -= 1;
        }
        while (ignoredEnd + 2 < points.length && segmentFollowsLine(points, ignoredEnd + 1, hostAxis, hostTrack)) {
          ignoredEnd += 1;
        }
      }
    }
    let count = 0;
    for (let index = 0; index + 1 < points.length; index += 1) {
      if ((index < ignoredStart || index > ignoredEnd) && segmentPiercesRect(points[index], points[index + 1], rect)) {
        count += 1;
      }
    }
    return count;
  }
  function segmentFollowsLine(points, segmentIndex, axis, track) {
    const from = points[segmentIndex];
    const to = points[segmentIndex + 1];
    return segmentAxis(from, to) === axis && Math.abs(axisOrthMin(from, axis) - track) <= ROUTING_EPSILON;
  }
  function isClean(defects) {
    return defects.occupiedOverlapCount === 0 && defects.entityCollisionCount === 0 && defects.lineCollisionCount === 0;
  }
  function compareDefects(left, right) {
    return left.occupiedOverlapCount - right.occupiedOverlapCount || left.entityCollisionCount - right.entityCollisionCount || left.lineCollisionCount - right.lineCollisionCount;
  }
  function preferredJogMargin(runSpan, labelWindow) {
    return Math.max(
      LABEL_JOG_MARGIN_PX,
      Math.min(
        labelWindow[0] - runSpan[0] - WIDE_U_END_MARGIN_PX,
        runSpan[1] - WIDE_U_END_MARGIN_PX - labelWindow[1]
      )
    );
  }
  function hostSegmentAt(points, axis, travel, track) {
    for (let index = 0; index + 1 < points.length; index += 1) {
      const from = points[index];
      const to = points[index + 1];
      const followsAxis = segmentAxis(from, to) === axis && Math.abs(axisOrthMin(from, axis) - track) <= ROUTING_EPSILON;
      const span = orderedSpan(axisStart(from, axis), axisStart(to, axis));
      if (followsAxis && coordinateInSpan(travel, span, ROUTING_EPSILON)) {
        return index;
      }
    }
    throw new Error(`label placement: displaced host segment missing at ${travel}:${track}`);
  }
  function segmentCollisionProfile(a, b, c, d) {
    const aAxis = segmentAxis(a, b);
    const cAxis = segmentAxis(c, d);
    if (!aAxis || !cAxis) {
      return { crossings: 0, overlapLength: 0 };
    }
    if (aAxis === cAxis) {
      const sameTrack = Math.abs(axisOrthMin(a, aAxis) - axisOrthMin(c, cAxis)) <= ROUTING_EPSILON;
      return {
        crossings: 0,
        overlapLength: sameTrack ? spanOverlapLength(
          orderedSpan(axisStart(a, aAxis), axisStart(b, aAxis)),
          orderedSpan(axisStart(c, cAxis), axisStart(d, cAxis))
        ) : 0
      };
    }
    const [horizontalFrom, horizontalTo, verticalFrom, verticalTo] = aAxis === "x" ? [a, b, c, d] : [c, d, a, b];
    return {
      crossings: Number(
        inside(
          verticalFrom.x,
          Math.min(horizontalFrom.x, horizontalTo.x),
          Math.abs(horizontalTo.x - horizontalFrom.x)
        ) && inside(
          horizontalFrom.y,
          Math.min(verticalFrom.y, verticalTo.y),
          Math.abs(verticalTo.y - verticalFrom.y)
        )
      ),
      overlapLength: 0
    };
  }
  function dedupeCandidates(candidates) {
    const byKey = /* @__PURE__ */ new Map();
    for (const candidate of candidates) {
      const key = `${candidate.sourceSegmentIndex}:${candidate.rect.x}:${candidate.rect.y}:${candidate.rect.width}:${candidate.rect.height}`;
      const current = byKey.get(key);
      if (!current || compareBaseCandidates(candidate, current) < 0) {
        byKey.set(key, candidate);
      }
    }
    return [...byKey.values()];
  }

  // packages/layout/src/routing/corridor/leafCuts.ts
  var ENTITY_CUT_INSET_PX = 4;
  function leafRects(world) {
    const result = [];
    for (let entityIndex = 0; entityIndex < world.entities.length; entityIndex += 1) {
      const entity = world.entities[entityIndex];
      if (entity.isContainer) {
        continue;
      }
      const rect = {
        x: entity.x + ENTITY_CUT_INSET_PX,
        y: entity.y + ENTITY_CUT_INSET_PX,
        width: entity.width - 2 * ENTITY_CUT_INSET_PX,
        height: entity.height - 2 * ENTITY_CUT_INSET_PX
      };
      if (rect.width > 0 && rect.height > 0) {
        result.push({ entityIndex, rect });
      }
    }
    return result;
  }
  function leafCutKeys(routes, index, leaves, entityCount) {
    const cuts = /* @__PURE__ */ new Set();
    for (const leaf of leaves) {
      for (const segment of index.unsortedSegmentsInRect(leaf.rect)) {
        const route = routes[segment.routeIndex];
        const own = route.from.entityIndex === leaf.entityIndex || route.to.entityIndex === leaf.entityIndex;
        const lastSegmentIndex = index.segmentsForRoute(segment.routeIndex).length - 1;
        if (own && (segment.segmentIndex === 0 || segment.segmentIndex === lastSegmentIndex)) {
          continue;
        }
        if (segmentPiercesRect(segment.from, segment.to, leaf.rect)) {
          cuts.add(segment.routeIndex * entityCount + leaf.entityIndex);
        }
      }
    }
    return cuts;
  }
  function authoredEndpointsIntact(routes) {
    for (const route of routes) {
      if (route.visits.length === 0) {
        continue;
      }
      const ports = route.ports();
      for (const [endpoint, point] of [
        [route.from, ports.from],
        [route.to, ports.to]
      ]) {
        if (endpoint.authoredTrack === void 0) {
          continue;
        }
        const actual = endpoint.face === "left" || endpoint.face === "right" ? point.y : point.x;
        if (Math.abs(actual - endpoint.authoredTrack) > AUTHORED_PORT_TOLERANCE_PX) {
          return false;
        }
      }
    }
    return true;
  }

  // packages/layout/src/routing/corridor/emit.ts
  var EPSILON6 = 1e-6;
  function haveSameEmissionInputs(route, baseline) {
    if (route.requestIndex !== baseline.requestIndex || !sameEndpoint(route.from, baseline.from) || !sameEndpoint(route.to, baseline.to) || route.visits.length !== baseline.visits.length) {
      return false;
    }
    if (route.visits.length === 0) {
      return true;
    }
    for (let visitIndex = 0; visitIndex < route.visits.length; visitIndex += 1) {
      const visit = route.visits[visitIndex];
      const baselineVisit = baseline.visits[visitIndex];
      if (visit.corridorIndex !== baselineVisit.corridorIndex || visit.feasibleTrack[0] !== baselineVisit.feasibleTrack[0] || visit.feasibleTrack[1] !== baselineVisit.feasibleTrack[1] || !sameBoundary(visit.entry, baselineVisit.entry) || !sameBoundary(visit.exit, baselineVisit.exit) || route.orderOf(visitIndex) !== baseline.orderOf(visitIndex) || route.nominalTrackOf(visitIndex) !== baseline.nominalTrackOf(visitIndex)) {
        return false;
      }
    }
    for (let afterVisitIndex = 1; afterVisitIndex < route.visits.length; afterVisitIndex += 1) {
      if (!sameBoundaryRealization(
        route.boundaryRealizationAfter(afterVisitIndex),
        baseline.boundaryRealizationAfter(afterVisitIndex)
      )) {
        return false;
      }
    }
    return true;
  }
  function emitRoutes(world, routes, options = {}) {
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      if (route.visits.length === 0) {
        continue;
      }
      if (options.routeIndexes && !options.routeIndexes.has(routeIndex)) {
        route.assertEmitted();
        continue;
      }
      route.assertSpaced();
      const from = emittedEndpointPoint(world, route.from, route.nominalTrackOf(0));
      const to = emittedEndpointPoint(world, route.to, route.nominalTrackOf(route.visits.length - 1));
      const raw = [from];
      const rawSegmentVisits = [];
      for (let visitIndex = 0; visitIndex + 1 < route.visits.length; visitIndex += 1) {
        const current = route.visits[visitIndex];
        const next = route.visits[visitIndex + 1];
        const portal = sharedPortal(world, current.exit, next.entry);
        const currentCorridor = world.indexer.corridors[current.corridorIndex];
        const nextCorridor = world.indexer.corridors[next.corridorIndex];
        if (portal.kind === "continue") {
          emitContinuation(
            raw,
            rawSegmentVisits,
            route,
            visitIndex,
            currentCorridor,
            nextCorridor,
            portal
          );
          continue;
        }
        emitTurn(raw, rawSegmentVisits, route, visitIndex, currentCorridor, nextCorridor, portal);
      }
      appendRaw(raw, rawSegmentVisits, to, route.visits.length - 1);
      const { points, segmentVisitByIndex } = simplifyEmittedGeometry(
        route.requestIndex,
        raw,
        rawSegmentVisits
      );
      route.setGeometry({ from, to }, points, segmentVisitByIndex);
    }
  }
  function emittedEndpointPoint(world, endpoint, track) {
    const sourceEntities = world.sourceEntities ?? world.entities;
    const source = sourceEntities[endpoint.entityIndex];
    const plane = terminalFacePlane(source, endpoint.face);
    const point = endpoint.face === "left" || endpoint.face === "right" ? { x: plane, y: track } : { x: track, y: plane };
    if (plane !== facePlane(source, endpoint.face)) {
      return point;
    }
    return clipFacePointToOutline(source, endpoint.face, point);
  }
  function routeError(route, message) {
    throw new Error(`route ${route.requestIndex}: ${message}`);
  }
  function emitContinuation(raw, rawSegmentVisits, route, visitIndex, currentCorridor, nextCorridor, portal) {
    const currentTrack = route.nominalTrackOf(visitIndex);
    const nextTrack = route.nominalTrackOf(visitIndex + 1);
    if (currentCorridor.axis !== nextCorridor.axis) {
      routeError(route, `invalid straight continuation at visit ${visitIndex}`);
    }
    const plane = portal.planeCoordinate;
    const realization = route.boundaryRealizationAfter(visitIndex + 1);
    if (Math.abs(currentTrack - nextTrack) <= EPSILON6) {
      if (currentTrack < portal.crossSpan[0] - EPSILON6 || currentTrack > portal.crossSpan[1] + EPSILON6) {
        routeError(route, `straight continuation misses portal ${portal.index}`);
      }
      appendRaw(
        raw,
        rawSegmentVisits,
        axisPoint(currentCorridor.axis, plane, currentTrack),
        visitIndex
      );
      return;
    }
    if (!realization) {
      routeError(route, `continuation ${visitIndex} changed track without a host`);
    }
    if (realization.kind !== "continue-retrack") {
      routeError(route, `continuation ${visitIndex} has a turn realization`);
    }
    appendBoundaryRealization(
      raw,
      rawSegmentVisits,
      route,
      visitIndex,
      currentCorridor,
      nextCorridor,
      plane,
      currentTrack,
      nextTrack,
      realization
    );
  }
  function emitTurn(raw, rawSegmentVisits, route, visitIndex, currentCorridor, nextCorridor, portal) {
    if (currentCorridor.axis === nextCorridor.axis) {
      routeError(route, "turn portal does not change axis");
    }
    const turnRealization = route.boundaryRealizationAfter(visitIndex + 1);
    if (turnRealization) {
      if (turnRealization.kind !== "turn-retrack") {
        routeError(route, `turn ${visitIndex} has a continuation plan`);
      }
      appendTurnBoundaryRealization(
        raw,
        rawSegmentVisits,
        route,
        visitIndex,
        currentCorridor,
        nextCorridor,
        portal,
        turnRealization
      );
      return;
    }
    const corner = axisPoint(
      currentCorridor.axis,
      route.nominalTrackOf(visitIndex + 1),
      route.nominalTrackOf(visitIndex)
    );
    if (!pointInRect(corner, portal.rect)) {
      routeError(route, `portal corner ${visitIndex} outside portal ${portal.index}`);
    }
    appendRaw(raw, rawSegmentVisits, corner, visitIndex);
  }
  function sameEndpoint(left, right) {
    return left.entityIndex === right.entityIndex && left.face === right.face && left.authoredTrack === right.authoredTrack && left.portGroup === right.portGroup;
  }
  function sameBoundary(left, right) {
    return left.kind === "terminal" ? right.kind === "terminal" && left.attachmentIndex === right.attachmentIndex : right.kind === "portal" && left.portalIndex === right.portalIndex && left.mode === right.mode;
  }
  function sameBoundaryRealization(left, right) {
    if (!left || !right) {
      return left === right;
    }
    if (left.kind !== right.kind || left.afterVisitIndex !== right.afterVisitIndex || left.shifts.length !== right.shifts.length) {
      return false;
    }
    if (left.kind === "turn-retrack" && (right.kind !== "turn-retrack" || left.beforePortalTrack !== right.beforePortalTrack || left.afterPortalTrack !== right.afterPortalTrack)) {
      return false;
    }
    return left.shifts.every((shift, shiftIndex) => {
      const candidate = right.shifts[shiftIndex];
      return shift.hostVisitIndex === candidate.hostVisitIndex && shift.shiftCoordinate === candidate.shiftCoordinate && shift.trackAfter === candidate.trackAfter;
    });
  }
  function appendTurnBoundaryRealization(raw, rawSegmentVisits, route, visitIndex, currentCorridor, nextCorridor, portal, realization) {
    const currentTrack = route.nominalTrackOf(visitIndex);
    const nextTrack = route.nominalTrackOf(visitIndex + 1);
    const currentShift = realization.shifts.find((shift) => shift.hostVisitIndex === visitIndex);
    const nextShift = realization.shifts.find((shift) => shift.hostVisitIndex === visitIndex + 1);
    if (realization.shifts.length !== Number(Boolean(currentShift)) + Number(Boolean(nextShift))) {
      throw new Error(`route ${route.requestIndex}: turn ${visitIndex} has a remote shift`);
    }
    if (currentShift) {
      if (Math.abs(currentShift.trackAfter - realization.beforePortalTrack) > EPSILON6) {
        throw new Error(`route ${route.requestIndex}: turn ${visitIndex} misses its before track`);
      }
      assertHostedShift(
        route,
        visitIndex,
        currentCorridor,
        currentTrack,
        currentShift.trackAfter,
        currentShift.shiftCoordinate
      );
      appendRaw(
        raw,
        rawSegmentVisits,
        axisPoint(currentCorridor.axis, currentShift.shiftCoordinate, currentTrack),
        visitIndex
      );
      appendRaw(
        raw,
        rawSegmentVisits,
        axisPoint(currentCorridor.axis, currentShift.shiftCoordinate, currentShift.trackAfter),
        visitIndex
      );
    }
    const corner = axisPoint(
      currentCorridor.axis,
      realization.afterPortalTrack,
      realization.beforePortalTrack
    );
    if (!pointInRect(corner, portal.rect)) {
      throw new Error(
        `route ${route.requestIndex}: re-tracked portal corner ${visitIndex} outside portal ${portal.index}`
      );
    }
    appendRaw(raw, rawSegmentVisits, corner, visitIndex);
    if (nextShift) {
      if (Math.abs(nextShift.trackAfter - nextTrack) > EPSILON6) {
        throw new Error(`route ${route.requestIndex}: turn ${visitIndex} misses its after track`);
      }
      assertHostedShift(
        route,
        visitIndex,
        nextCorridor,
        realization.afterPortalTrack,
        nextShift.trackAfter,
        nextShift.shiftCoordinate
      );
      appendRaw(
        raw,
        rawSegmentVisits,
        axisPoint(nextCorridor.axis, nextShift.shiftCoordinate, realization.afterPortalTrack),
        visitIndex + 1
      );
      appendRaw(
        raw,
        rawSegmentVisits,
        axisPoint(nextCorridor.axis, nextShift.shiftCoordinate, nextShift.trackAfter),
        visitIndex + 1
      );
    }
  }
  function appendBoundaryRealization(raw, rawSegmentVisits, route, visitIndex, currentCorridor, nextCorridor, plane, currentTrack, nextTrack, realization) {
    let activeTrack = currentTrack;
    let crossedBoundary = false;
    for (const shift of realization.shifts) {
      const hostIsCurrent = shift.hostVisitIndex === visitIndex;
      const hostIsNext = shift.hostVisitIndex === visitIndex + 1;
      if (!hostIsCurrent && !hostIsNext) {
        throw new Error(`route ${route.requestIndex}: continuation ${visitIndex} has a remote host`);
      }
      if (hostIsCurrent && crossedBoundary) {
        throw new Error(`route ${route.requestIndex}: continuation shifts reverse across boundary`);
      }
      const hostCorridor = hostIsCurrent ? currentCorridor : nextCorridor;
      assertHostedShift(
        route,
        visitIndex,
        hostCorridor,
        activeTrack,
        shift.trackAfter,
        shift.shiftCoordinate
      );
      if (hostIsNext && !crossedBoundary) {
        appendRaw(
          raw,
          rawSegmentVisits,
          axisPoint(currentCorridor.axis, plane, activeTrack),
          visitIndex
        );
        crossedBoundary = true;
      }
      appendRaw(
        raw,
        rawSegmentVisits,
        axisPoint(currentCorridor.axis, shift.shiftCoordinate, activeTrack),
        shift.hostVisitIndex
      );
      appendRaw(
        raw,
        rawSegmentVisits,
        axisPoint(currentCorridor.axis, shift.shiftCoordinate, shift.trackAfter),
        shift.hostVisitIndex
      );
      activeTrack = shift.trackAfter;
    }
    if (!crossedBoundary) {
      appendRaw(
        raw,
        rawSegmentVisits,
        axisPoint(currentCorridor.axis, plane, activeTrack),
        visitIndex
      );
    }
    if (Math.abs(activeTrack - nextTrack) > EPSILON6) {
      throw new Error(`route ${route.requestIndex}: continuation ${visitIndex} ends off track`);
    }
  }
  function assertHostedShift(route, visitIndex, hostCorridor, fromTrack, toTrack, shiftCoordinate) {
    const hostCrossStart = hostCorridor.axis === "x" ? hostCorridor.rect.y : hostCorridor.rect.x;
    const hostCrossEnd = hostCrossStart + (hostCorridor.axis === "x" ? hostCorridor.rect.height : hostCorridor.rect.width);
    const hostTravelStart = hostCorridor.axis === "x" ? hostCorridor.rect.x : hostCorridor.rect.y;
    const hostTravelEnd = hostTravelStart + (hostCorridor.axis === "x" ? hostCorridor.rect.width : hostCorridor.rect.height);
    if (fromTrack < hostCrossStart - EPSILON6 || fromTrack > hostCrossEnd + EPSILON6 || toTrack < hostCrossStart - EPSILON6 || toTrack > hostCrossEnd + EPSILON6 || shiftCoordinate < hostTravelStart - EPSILON6 || shiftCoordinate > hostTravelEnd + EPSILON6) {
      throw new Error(`route ${route.requestIndex}: continuation ${visitIndex} escapes its host`);
    }
  }
  function appendRaw(raw, rawSegmentVisits, point, visitIndex) {
    raw.push(point);
    rawSegmentVisits.push(visitIndex);
  }
  function sharedPortal(world, exit, entry) {
    if (exit.kind !== "portal" || entry.kind !== "portal" || exit.portalIndex !== entry.portalIndex || exit.mode !== entry.mode || exit.mode !== "turn" && exit.mode !== "continue-straight") {
      throw new Error("route emission: adjacent visits do not share one supported portal");
    }
    const portal = world.indexer.portals[exit.portalIndex];
    if (exit.mode === "turn" && portal.kind !== "turn" || exit.mode === "continue-straight" && portal.kind !== "continue") {
      throw new Error("route emission: boundary mode does not match portal kind");
    }
    return portal;
  }
  function simplifyEmittedGeometry(requestIndex, points, rawSegmentVisits) {
    const result = [];
    const segmentVisitByIndex = [];
    for (let rawSegmentIndex = 0; rawSegmentIndex + 1 < points.length; rawSegmentIndex += 1) {
      const from = points[rawSegmentIndex];
      const to = points[rawSegmentIndex + 1];
      if (samePoint(from, to)) {
        continue;
      }
      if (result.length === 0) {
        result.push(from);
      }
      const previous = result[result.length - 2];
      const current = result[result.length - 1];
      const visitIndex = rawSegmentVisits[rawSegmentIndex];
      const previousVisitIndex = segmentVisitByIndex[segmentVisitByIndex.length - 1];
      if (previous && collinear(requestIndex, previous, current, to) && previousVisitIndex === visitIndex) {
        result[result.length - 1] = to;
      } else {
        result.push(to);
        segmentVisitByIndex.push(visitIndex);
      }
    }
    if (result.length < 2) {
      throw new Error("route emission: polyline collapsed below two points");
    }
    return { points: result, segmentVisitByIndex: Int32Array.from(segmentVisitByIndex) };
  }
  function collinear(requestIndex, first, second, third) {
    const vertical = first.x === second.x && second.x === third.x;
    const horizontal = first.y === second.y && second.y === third.y;
    if (!vertical && !horizontal) {
      return false;
    }
    const firstDelta = vertical ? second.y - first.y : second.x - first.x;
    const secondDelta = vertical ? third.y - second.y : third.x - second.x;
    if (firstDelta * secondDelta < 0) {
      throw new Error(
        `route ${requestIndex}: emitted cardinal segment reverses direction ${JSON.stringify([first, second, third])}`
      );
    }
    return true;
  }

  // packages/layout/src/routing/measure/terminalDirection.ts
  var EPSILON7 = 0.01;
  function terminalDirectionViolation(points, face, endpoint) {
    if (points.length < 2) {
      return void 0;
    }
    const portIndex = endpoint === "from" ? 0 : points.length - 1;
    const step = endpoint === "from" ? 1 : -1;
    const port = points[portIndex];
    let adjacentIndex = portIndex + step;
    while (adjacentIndex >= 0 && adjacentIndex < points.length && Math.abs(points[adjacentIndex].x - port.x) <= EPSILON7 && Math.abs(points[adjacentIndex].y - port.y) <= EPSILON7) {
      adjacentIndex += step;
    }
    const adjacent = points[adjacentIndex];
    if (!adjacent) {
      return void 0;
    }
    const dx = adjacent.x - port.x;
    const dy = adjacent.y - port.y;
    const normalX = face === "left" ? -1 : face === "right" ? 1 : 0;
    const normalY = face === "up" ? -1 : face === "down" ? 1 : 0;
    const outward = dx * normalX + dy * normalY;
    const tangent = dx * normalY - dy * normalX;
    if (outward > EPSILON7 && Math.abs(tangent) <= EPSILON7) {
      return void 0;
    }
    return {
      kind: Math.abs(tangent) <= EPSILON7 ? "inward" : Math.abs(outward) <= EPSILON7 ? "tangential" : "diagonal",
      port: { ...port },
      adjacent: { ...adjacent }
    };
  }

  // packages/layout/src/routing/measure/portCentering.ts
  var CENTER_DEVIATION_EPSILON = 1e-6;
  var CORNER_PRESSURE_START = 0.6;
  function normalizedFaceCenterDeviation(coordinate, center2, halfSpan) {
    return halfSpan <= CENTER_DEVIATION_EPSILON ? 0 : Math.min(1, Math.abs(coordinate - center2) / halfSpan);
  }
  function convexPortCenteringCharge(deviation) {
    return deviation * (1 + deviation * deviation);
  }
  function portCornerPressure(deviation) {
    const proximity = Math.max(
      0,
      Math.min(1, (deviation - CORNER_PRESSURE_START) / (1 - CORNER_PRESSURE_START))
    );
    return convexPortCenteringCharge(proximity);
  }

  // packages/layout/src/routing/corridor/faceSlots.ts
  var SLOT_DEVIATION_DEADZONE_PX = 2;
  function assessFaceSlots(span, sortedCoordinates) {
    const count = sortedCoordinates.length;
    const length = span[1] - span[0];
    const halfSpan = length / 2;
    const slotLength = length / count;
    const expected = [];
    const deviations = [];
    let charge = 0;
    for (let index = 0; index < count; index += 1) {
      const slotCenter = span[0] + slotLength * (index + 0.5);
      expected.push(slotCenter);
      const deviation = Math.max(
        0,
        Math.abs(sortedCoordinates[index] - slotCenter) - SLOT_DEVIATION_DEADZONE_PX
      );
      deviations.push(deviation);
      if (halfSpan > 0) {
        const normalized = Math.min(1, deviation / halfSpan);
        charge += convexPortCenteringCharge(normalized);
      }
    }
    return { expected, deviations, charge };
  }

  // packages/layout/src/routing/corridor/endpointQuality.ts
  var EPSILON8 = 1e-6;
  var LARGE_CONTAINER_FACE_PX = 200;
  var LARGE_CONTAINER_SINGLETON_WEIGHT = 0.35;
  var NEITHER_ENDPOINT_CENTERED_WEIGHT = 0.5;
  var MIRROR_FAMILY_TOLERANCE_PX = 2;
  var SYMMETRY_FULL_PENALTY_PX = 24;
  function collectEndpointQualityEvents(world, routes, options = {}) {
    const slotEventEnabled = options.slotEvents === true;
    const groups = /* @__PURE__ */ new Map();
    const events = [];
    routes.forEach((route, routeIndex) => {
      if (route.visits.length === 0) {
        return;
      }
      const points = route.points();
      const ports = route.ports();
      for (const side of ["from", "to"]) {
        const endpoint = route[side];
        const visitIndex = side === "from" ? 0 : route.visits.length - 1;
        const corridorIndex = route.visits[visitIndex].corridorIndex;
        const violation = terminalDirectionViolation(points, endpoint.face, side);
        const entity = (world.sourceEntities ?? world.entities)[endpoint.entityIndex];
        const violationKind = violation?.kind ?? (entity.isContainer === true && terminalContainerExcursion(points, entity, side) ? "inward" : void 0);
        if (violationKind) {
          const event = {
            kind: "terminal-direction",
            cost: ROUTING_QUALITY_COSTS.terminalDirection,
            routeIndexes: [routeIndex],
            corridorIndexes: [corridorIndex],
            visits: [{ routeIndex, visitIndex }]
          };
          events.push(event);
        }
        if (endpoint.authoredTrack !== void 0) {
          continue;
        }
        const point = ports[side];
        const sample = {
          routeIndex,
          side,
          entityIndex: endpoint.entityIndex,
          face: endpoint.face,
          coordinate: endpoint.face === "left" || endpoint.face === "right" ? point.y : point.x,
          visit: { routeIndex, visitIndex },
          corridorIndex
        };
        const groupKey = `${endpoint.entityIndex}|${endpoint.face}`;
        const group = groups.get(groupKey) ?? [];
        group.push(sample);
        groups.set(groupKey, group);
      }
    });
    const singletonPenaltyByRouteSide = /* @__PURE__ */ new Map();
    for (const group of groups.values()) {
      const first = group[0];
      const entity = (world.sourceEntities ?? world.entities)[first.entityIndex];
      const faceSpan = faceCrossSpan(entity, first.face);
      const halfSpan = (faceSpan[1] - faceSpan[0]) / 2;
      const center2 = midpoint(faceSpan);
      const centroid = group.reduce((sum, sample) => sum + sample.coordinate, 0) / group.length;
      const deviation = normalizedFaceCenterDeviation(centroid, center2, halfSpan);
      const singletonWeight = entity.isContainer === true && halfSpan * 2 >= LARGE_CONTAINER_FACE_PX ? LARGE_CONTAINER_SINGLETON_WEIGHT + (1 - LARGE_CONTAINER_SINGLETON_WEIGHT) * deviation : 1;
      const perPortPenalty = convexPortCenteringCharge(deviation) * (group.length === 1 ? singletonWeight : 1);
      const contribution = perPortPenalty * group.length;
      if (!slotEventEnabled && contribution > EPSILON8) {
        events.push({
          kind: "port-centering",
          cost: ROUTING_QUALITY_COSTS.portCentering * contribution,
          routeIndexes: [...new Set(group.map((sample) => sample.routeIndex))],
          corridorIndexes: [...new Set(group.map((sample) => sample.corridorIndex))],
          visits: group.map((sample) => sample.visit)
        });
      }
      if (slotEventEnabled) {
        const fanEvent = faceFanSymmetryEvent(
          group,
          faceSpan,
          group.length === 1 ? singletonWeight : 1
        );
        if (fanEvent) {
          events.push(fanEvent);
        }
      }
      if (slotEventEnabled) {
        continue;
      }
      for (const sample of group) {
        const individualDeviation = normalizedFaceCenterDeviation(
          sample.coordinate,
          center2,
          halfSpan
        );
        const individualCornerPressure = portCornerPressure(individualDeviation);
        if (individualCornerPressure <= EPSILON8) {
          continue;
        }
        events.push({
          kind: "port-centering",
          cost: ROUTING_QUALITY_COSTS.portCentering * individualCornerPressure,
          routeIndexes: [sample.routeIndex],
          corridorIndexes: [sample.corridorIndex],
          visits: [sample.visit]
        });
      }
      if (group.length === 1) {
        singletonPenaltyByRouteSide.set(routeSideKey(first.routeIndex, first.side), {
          deviation,
          sample: first
        });
      }
    }
    routes.forEach((_, routeIndex) => {
      const from = singletonPenaltyByRouteSide.get(routeSideKey(routeIndex, "from"));
      const to = singletonPenaltyByRouteSide.get(routeSideKey(routeIndex, "to"));
      if (!from || !to) {
        return;
      }
      const contribution = Math.min(from.deviation, to.deviation) * NEITHER_ENDPOINT_CENTERED_WEIGHT;
      if (contribution <= EPSILON8) {
        return;
      }
      events.push({
        kind: "port-centering",
        cost: ROUTING_QUALITY_COSTS.portCentering * contribution,
        routeIndexes: [routeIndex],
        corridorIndexes: [from.sample.corridorIndex, to.sample.corridorIndex],
        visits: [from.sample.visit, to.sample.visit]
      });
    });
    events.push(...siblingSymmetryEvents(world, routes, groups));
    return events;
  }
  function faceFanSymmetryEvent(group, faceSpan, weight) {
    const coordinates = group.map((sample) => sample.coordinate).sort((left, right) => left - right);
    const assessment = assessFaceSlots(faceSpan, coordinates);
    if (assessment.charge * weight <= EPSILON8) {
      return void 0;
    }
    return {
      kind: "face-fan-symmetry",
      cost: ROUTING_QUALITY_COSTS.portCentering * assessment.charge * weight,
      routeIndexes: [...new Set(group.map((sample) => sample.routeIndex))],
      corridorIndexes: [...new Set(group.map((sample) => sample.corridorIndex))],
      visits: group.map((sample) => sample.visit)
    };
  }
  function terminalContainerExcursion(points, entity, side) {
    const interior = {
      x: entity.x + EPSILON8,
      y: entity.y + EPSILON8,
      width: entity.width - 2 * EPSILON8,
      height: entity.height - 2 * EPSILON8
    };
    if (interior.width <= 0 || interior.height <= 0) {
      return false;
    }
    const startSegmentIndex = side === "from" ? 1 : 0;
    const endSegmentIndex = side === "to" ? points.length - 2 : points.length - 1;
    for (let segmentIndex = startSegmentIndex; segmentIndex < endSegmentIndex; segmentIndex += 1) {
      if (segmentPiercesRect(points[segmentIndex], points[segmentIndex + 1], interior)) {
        return true;
      }
    }
    return false;
  }
  function siblingSymmetryEvents(world, routes, groups) {
    const events = [];
    for (const group of groups.values()) {
      if (!group.every((sample) => sample.side === group[0].side)) {
        continue;
      }
      if (group.length === 2) {
        const event = twoRouteSiblingSymmetryEvent(world, routes, group);
        if (event) {
          events.push(event);
        }
        continue;
      }
      if (group.length !== 3) {
        continue;
      }
      const sharedSide = group[0].side;
      const sharedFace = group[0].face;
      const expectedOppositeFace = OPPOSITE_DIRECTION[sharedFace];
      const ranked = group.map((sample) => {
        const route = routes[sample.routeIndex];
        const endpoint = route[sharedSide === "from" ? "to" : "from"];
        const entity = world.entities[endpoint.entityIndex];
        return {
          sample,
          endpoint,
          coordinate: sharedFace === "left" || sharedFace === "right" ? entity.y + entity.height / 2 : entity.x + entity.width / 2
        };
      }).sort((left, right) => left.coordinate - right.coordinate);
      if (ranked.some((record) => record.endpoint.face !== expectedOppositeFace)) {
        continue;
      }
      const sharedEntity = (world.sourceEntities ?? world.entities)[group[0].entityIndex];
      const sharedCenter = midpoint(faceCrossSpan(sharedEntity, sharedFace));
      if (Math.abs(ranked[1].coordinate - sharedCenter) > MIRROR_FAMILY_TOLERANCE_PX || Math.abs(ranked[0].coordinate + ranked[2].coordinate - sharedCenter * 2) > MIRROR_FAMILY_TOLERANCE_PX) {
        continue;
      }
      const outerTurnCoordinates = [ranked[0], ranked[2]].map(
        ({ sample }) => firstCrossAxisTurn(routes[sample.routeIndex], sharedSide, sharedFace)
      );
      if (outerTurnCoordinates[0] === void 0 || outerTurnCoordinates[1] === void 0) {
        continue;
      }
      const alignmentError = Math.abs(outerTurnCoordinates[0] - outerTurnCoordinates[1]);
      if (alignmentError <= EPSILON8) {
        continue;
      }
      events.push({
        kind: "sibling-symmetry",
        cost: ROUTING_QUALITY_COSTS.symmetry * Math.min(1, alignmentError / SYMMETRY_FULL_PENALTY_PX),
        routeIndexes: ranked.map(({ sample }) => sample.routeIndex),
        corridorIndexes: ranked.map(({ sample }) => sample.corridorIndex),
        visits: ranked.map(({ sample }) => sample.visit)
      });
    }
    return events;
  }
  function twoRouteSiblingSymmetryEvent(world, routes, group) {
    const sharedSide = group[0].side;
    const sharedFace = group[0].face;
    const expectedOppositeFace = OPPOSITE_DIRECTION[sharedFace];
    const ranked = group.map((sample) => {
      const route = routes[sample.routeIndex];
      const endpoint = route[sharedSide === "from" ? "to" : "from"];
      const entity = world.entities[endpoint.entityIndex];
      return {
        sample,
        endpoint,
        coordinate: sharedFace === "left" || sharedFace === "right" ? entity.y + entity.height / 2 : entity.x + entity.width / 2
      };
    }).sort((left, right) => left.coordinate - right.coordinate);
    if (ranked.some((record) => record.endpoint.face !== expectedOppositeFace)) {
      return void 0;
    }
    const sharedEntity = (world.sourceEntities ?? world.entities)[group[0].entityIndex];
    const sharedCenter = midpoint(faceCrossSpan(sharedEntity, sharedFace));
    if (ranked[0].coordinate >= sharedCenter - EPSILON8 || ranked[1].coordinate <= sharedCenter + EPSILON8) {
      return void 0;
    }
    const transverseVisits = ranked.map(
      ({ sample }) => firstTransverseVisit(
        world,
        routes[sample.routeIndex],
        sample.routeIndex,
        sharedSide,
        sharedFace
      )
    );
    const firstVisit = transverseVisits[0];
    const secondVisit = transverseVisits[1];
    if (!firstVisit || !secondVisit || firstVisit.corridorIndex !== secondVisit.corridorIndex) {
      return void 0;
    }
    const alignmentError = Math.abs(firstVisit.track - secondVisit.track);
    if (alignmentError <= EPSILON8) {
      return void 0;
    }
    const routeIndexes = [ranked[0].sample.routeIndex, ranked[1].sample.routeIndex];
    return {
      kind: "sibling-symmetry",
      cost: ROUTING_QUALITY_COSTS.symmetry * Math.min(1, alignmentError / SYMMETRY_FULL_PENALTY_PX),
      routeIndexes,
      corridorIndexes: [firstVisit.corridorIndex],
      visits: [firstVisit.visit, secondVisit.visit]
    };
  }
  function firstTransverseVisit(world, route, routeIndex, sharedSide, sharedFace) {
    const normalAxis = sharedFace === "left" || sharedFace === "right" ? "x" : "y";
    const visitIndexes = route.visits.map((_, visitIndex) => visitIndex);
    if (sharedSide === "from") {
      visitIndexes.reverse();
    }
    for (const visitIndex of visitIndexes) {
      const visit = route.visits[visitIndex];
      if (world.indexer.corridors[visit.corridorIndex].axis === normalAxis) {
        continue;
      }
      return {
        corridorIndex: visit.corridorIndex,
        track: route.nominalTrackOf(visitIndex),
        visit: { routeIndex, visitIndex }
      };
    }
    return void 0;
  }
  function firstCrossAxisTurn(route, sharedSide, sharedFace) {
    const points = sharedSide === "to" ? route.points() : [...route.points()].reverse();
    const normalAxis = sharedFace === "left" || sharedFace === "right" ? "x" : "y";
    for (let index = 1; index < points.length; index += 1) {
      const before = points[index - 1];
      const after = points[index];
      const segmentAxis3 = before.x === after.x ? "y" : before.y === after.y ? "x" : void 0;
      if (segmentAxis3 && segmentAxis3 !== normalAxis) {
        return normalAxis === "x" ? before.x : before.y;
      }
    }
    return void 0;
  }
  function routeSideKey(routeIndex, side) {
    return `${routeIndex}|${side}`;
  }

  // packages/layout/src/routing/corridor/routeIndex.ts
  var PROPER_CROSSING_EPSILON = 0.01;
  var RouteIndexer = class {
    constructor(routes) {
      __publicField(this, "segments");
      __publicField(this, "treesByAxis");
      __publicField(this, "segmentsByAxis");
      __publicField(this, "segmentsByRoute");
      __publicField(this, "segmentsByCorridor");
      const segments = [];
      const segmentsByAxis = { x: [], y: [] };
      const segmentsByRoute = routes.map(() => []);
      const segmentsByCorridor = [];
      for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
        const route = routes[routeIndex];
        if (route.visits.length === 0) {
          continue;
        }
        route.assertEmitted();
        const points = route.points();
        for (let segmentIndex = 0; segmentIndex + 1 < points.length; segmentIndex += 1) {
          const from = points[segmentIndex];
          const to = points[segmentIndex + 1];
          const axis = from.x === to.x ? "y" : "x";
          const visitIndex = route.segmentVisitOf(segmentIndex);
          const corridorIndex = route.visits[visitIndex].corridorIndex;
          const segment = {
            index: segments.length,
            routeIndex,
            segmentIndex,
            visitIndex,
            corridorIndex,
            axis,
            from,
            to,
            travel: axis === "x" ? [Math.min(from.x, to.x), Math.max(from.x, to.x)] : [Math.min(from.y, to.y), Math.max(from.y, to.y)],
            track: axis === "x" ? from.y : from.x,
            x: Math.min(from.x, to.x),
            y: Math.min(from.y, to.y),
            width: Math.abs(to.x - from.x),
            height: Math.abs(to.y - from.y)
          };
          segments.push(segment);
          segmentsByAxis[axis].push(segment);
          segmentsByRoute[routeIndex].push(segment);
          const corridorSegments = segmentsByCorridor[corridorIndex];
          if (corridorSegments) {
            corridorSegments.push(segment);
          } else {
            segmentsByCorridor[corridorIndex] = [segment];
          }
        }
      }
      this.segments = segments;
      this.treesByAxis = {
        x: new RTree().load(segmentsByAxis.x),
        y: new RTree().load(segmentsByAxis.y)
      };
      this.segmentsByAxis = segmentsByAxis;
      this.segmentsByRoute = segmentsByRoute;
      this.segmentsByCorridor = segmentsByCorridor;
    }
    segmentsForRoute(routeIndex) {
      return this.segmentsByRoute[routeIndex] ?? [];
    }
    segmentsForCorridor(corridorIndex) {
      return this.segmentsByCorridor[corridorIndex] ?? [];
    }
    segmentsInRect(rect) {
      return this.unsortedSegmentsInRect(rect).sort(compareSegmentIndex);
    }
    /** Spatial-query order for callers whose result is reduced into an order-independent set/count. */
    unsortedSegmentsInRect(rect) {
      const segments = [];
      const maxX = rect.x + rect.width;
      const maxY = rect.y + rect.height;
      this.treesByAxis.x.forEachIntersectingBounds(rect.x, rect.y, maxX, maxY, (segment) => {
        segments.push(segment);
      });
      this.treesByAxis.y.forEachIntersectingBounds(rect.x, rect.y, maxX, maxY, (segment) => {
        segments.push(segment);
      });
      return segments;
    }
    properCrossings() {
      const crossings = [];
      for (const horizontal of this.segmentsByAxis.x) {
        this.treesByAxis.y.forEachAtY(
          horizontal.track,
          horizontal.travel[0],
          horizontal.travel[1],
          (vertical) => {
            const first = horizontal.index < vertical.index ? horizontal : vertical;
            const second = first === horizontal ? vertical : horizontal;
            const crossing = properCrossing(first, second, this.segmentsByRoute);
            if (crossing) {
              crossings.push(crossing);
            }
          }
        );
      }
      return crossings.sort(
        (left, right) => left.a.index - right.a.index || left.b.index - right.b.index
      );
    }
    forEachParallelOverlap(maximumTrackGap, visitor) {
      this.forEachParallelOverlapAmong(this.segments, maximumTrackGap, void 0, visitor);
    }
    /** Visit each overlap involving at least one of the supplied routes. */
    forEachParallelOverlapForRoutes(maximumTrackGap, routeIndexes, visitor) {
      for (const routeIndex of routeIndexes) {
        this.forEachParallelOverlapAmong(
          this.segmentsByRoute[routeIndex] ?? [],
          maximumTrackGap,
          routeIndexes,
          visitor
        );
      }
    }
    forEachParallelOverlapAmong(segments, maximumTrackGap, selectedRouteIndexes, visitor) {
      for (const segment of segments) {
        const minX = segment.axis === "x" ? segment.travel[0] : segment.track - maximumTrackGap;
        const minY = segment.axis === "x" ? segment.track - maximumTrackGap : segment.travel[0];
        const maxX = segment.axis === "x" ? segment.travel[1] : segment.track + maximumTrackGap;
        const maxY = segment.axis === "x" ? segment.track + maximumTrackGap : segment.travel[1];
        this.treesByAxis[segment.axis].forEachIntersectingBounds(
          minX,
          minY,
          maxX,
          maxY,
          (candidate) => {
            if (candidate.routeIndex === segment.routeIndex || selectedRouteIndexes?.has(candidate.routeIndex) !== false && candidate.index <= segment.index) {
              return;
            }
            const travelStart = Math.max(segment.travel[0], candidate.travel[0]);
            const travelEnd = Math.min(segment.travel[1], candidate.travel[1]);
            if (travelEnd - travelStart > PROPER_CROSSING_EPSILON) {
              visitor(segment, candidate);
            }
          }
        );
      }
    }
  };
  function compareSegmentIndex(left, right) {
    return left.index - right.index;
  }
  function properCrossing(left, right, segmentsByRoute) {
    if (left.routeIndex === right.routeIndex || left.axis === right.axis) {
      return void 0;
    }
    const horizontal = left.axis === "x" ? left : right;
    const vertical = left.axis === "y" ? left : right;
    if (!insideVisualRun(vertical.track, horizontal, segmentsByRoute) || !insideVisualRun(horizontal.track, vertical, segmentsByRoute)) {
      return void 0;
    }
    return { a: left, b: right };
  }
  function insideVisualRun(value, segment, segmentsByRoute) {
    if (openBetween(value, segment.travel)) {
      return true;
    }
    const endpoint = segment.axis === "x" ? segment.to.x : segment.to.y;
    if (Math.abs(value - endpoint) > PROPER_CROSSING_EPSILON) {
      return false;
    }
    const next = segmentsByRoute[segment.routeIndex]?.[segment.segmentIndex + 1];
    return Boolean(
      next && next.axis === segment.axis && Math.abs(next.track - segment.track) <= PROPER_CROSSING_EPSILON && samePoint(next.from, segment.to) && direction(next) === direction(segment)
    );
  }
  function direction(segment) {
    const delta = segment.axis === "x" ? segment.to.x - segment.from.x : segment.to.y - segment.from.y;
    return delta < 0 ? -1 : 1;
  }
  function openBetween(value, span) {
    return value > span[0] + PROPER_CROSSING_EPSILON && value < span[1] - PROPER_CROSSING_EPSILON;
  }

  // packages/layout/src/routing/corridor/geometryQuality.ts
  function retainedLineMergesForUnchangedRoutes(baseline, changedRouteIndexes) {
    return baseline.events.flatMap(
      (event) => event.kind === "line-merge" && event.routeIndexes.every((routeIndex) => !changedRouteIndexes.has(routeIndex)) ? [event] : []
    );
  }
  function collectGeometryQualityEvents(routes, existingEvents = [], batchIndex, options = {}) {
    const events = [];
    const index = batchIndex ?? new RouteIndexer(routes);
    const crossings = index.properCrossings();
    const retainedLineMerges = options.retainedLineMerges ?? [];
    const discoveredLineMerges = emittedLineMerges(
      index,
      [...existingEvents, ...retainedLineMerges],
      options.lineMergeRouteIndexes
    );
    const lineMerges = [...retainedLineMerges, ...discoveredLineMerges].sort(compareLineMergeVisits);
    events.push(...lineMerges);
    for (const crossing of crossings) {
      const first = crossing.a.routeIndex < crossing.b.routeIndex ? crossing.a : crossing.b;
      const second = first === crossing.a ? crossing.b : crossing.a;
      const visits = [visitRef(first), visitRef(second)];
      events.push({
        kind: "crossing",
        cost: ROUTING_QUALITY_COSTS.crossing,
        routeIndexes: [first.routeIndex, second.routeIndex],
        corridorIndexes: first.corridorIndex === second.corridorIndex ? [first.corridorIndex] : [first.corridorIndex, second.corridorIndex],
        visits
      });
    }
    let bendCost = 0;
    let pathLength = 0;
    const scalarCostByRoute = /* @__PURE__ */ new Map();
    routes.forEach((route, routeIndex) => {
      if (route.visits.length === 0) {
        return;
      }
      const points = route.points();
      const routeBends = countBends(points);
      const kinkSegmentIndex = findTinyKink(points);
      const routeLength = measurePath(points);
      bendCost += ordinaryBendCost(routeBends);
      pathLength += routeLength;
      scalarCostByRoute.set(
        routeIndex,
        ordinaryBendCost(routeBends) + routeLength * ROUTING_QUALITY_COSTS.pathPerPx
      );
      if (kinkSegmentIndex !== void 0) {
        const visitIndex = route.segmentVisitOf(kinkSegmentIndex);
        events.push({
          kind: "tiny-kink",
          cost: ROUTING_QUALITY_COSTS.tinyKink,
          routeIndexes: [routeIndex],
          corridorIndexes: [route.visits[visitIndex].corridorIndex],
          visits: [{ routeIndex, visitIndex }]
        });
      }
      events.push(...collectBacktrackEvents(route, routeIndex, points));
    });
    return {
      events,
      scalarCosts: {
        ordinaryBends: bendCost,
        pathLength: pathLength * ROUTING_QUALITY_COSTS.pathPerPx,
        spacingDesire: 0
      },
      index,
      crossings,
      scalarCostByRoute
    };
  }
  function emittedLineMerges(index, existingEvents, routeIndexes) {
    const events = /* @__PURE__ */ new Map();
    const existingKeys = /* @__PURE__ */ new Set();
    for (const event of existingEvents) {
      if (event.kind === "line-merge" && event.visits) {
        existingKeys.add(mergeVisitKey(event.visits));
      }
    }
    const visit = (segment, candidate) => {
      const first = segment.routeIndex < candidate.routeIndex || segment.routeIndex === candidate.routeIndex && segment.visitIndex <= candidate.visitIndex ? segment : candidate;
      const second = first === segment ? candidate : segment;
      const key = mergeVisitPairKey(first, second);
      if (existingKeys.has(key)) {
        return;
      }
      const travelStart = Math.max(first.travel[0], second.travel[0]);
      const travelEnd = Math.min(first.travel[1], second.travel[1]);
      const sharedTravelLength = travelEnd - travelStart;
      const previous = events.get(key);
      if (previous && previous.sharedTravelLength >= sharedTravelLength) {
        return;
      }
      const visits = [visitRef(first), visitRef(second)];
      const corridorIndexes = first.corridorIndex === second.corridorIndex ? [first.corridorIndex] : [first.corridorIndex, second.corridorIndex];
      events.set(key, {
        sharedTravelLength,
        event: {
          kind: "line-merge",
          cost: ROUTING_QUALITY_COSTS.lineMerge,
          routeIndexes: [first.routeIndex, second.routeIndex],
          corridorIndexes,
          visits
        }
      });
    };
    if (routeIndexes) {
      index.forEachParallelOverlapForRoutes(1, routeIndexes, visit);
    } else {
      index.forEachParallelOverlap(1, visit);
    }
    return [...events.values()].map(({ event }) => event).sort(compareLineMergeVisits);
  }
  function compareLineMergeVisits(left, right) {
    return left.visits[0].routeIndex - right.visits[0].routeIndex || left.visits[0].visitIndex - right.visits[0].visitIndex || left.visits[1].routeIndex - right.visits[1].routeIndex || left.visits[1].visitIndex - right.visits[1].visitIndex;
  }
  function visitRef(segment) {
    return {
      routeIndex: segment.routeIndex,
      visitIndex: segment.visitIndex
    };
  }
  function mergeVisitPairKey(first, second) {
    const firstKey = `${first.routeIndex}:${first.visitIndex}`;
    const secondKey = `${second.routeIndex}:${second.visitIndex}`;
    return firstKey < secondKey ? `${firstKey}|${secondKey}` : `${secondKey}|${firstKey}`;
  }
  function mergeVisitKey(visits) {
    return visits.map((visit) => `${visit.routeIndex}:${visit.visitIndex}`).sort().join("|");
  }
  function collectBacktrackEvents(route, routeIndex, points) {
    const segments = [];
    for (let segmentIndex = 0; segmentIndex + 1 < points.length; segmentIndex += 1) {
      const from = points[segmentIndex];
      const to = points[segmentIndex + 1];
      if (from.y === to.y && from.x !== to.x) {
        segments.push({
          axis: "x",
          lane: from.y,
          travel: [Math.min(from.x, to.x), Math.max(from.x, to.x)],
          direction: Math.sign(to.x - from.x),
          segmentIndex
        });
      } else if (from.x === to.x && from.y !== to.y) {
        segments.push({
          axis: "y",
          lane: from.x,
          travel: [Math.min(from.y, to.y), Math.max(from.y, to.y)],
          direction: Math.sign(to.y - from.y),
          segmentIndex
        });
      }
    }
    const events = [];
    for (let first = 0; first < segments.length; first += 1) {
      for (let second = first + 1; second < segments.length; second += 1) {
        const a = segments[first];
        const b = segments[second];
        if (a.axis !== b.axis || a.direction === b.direction) {
          continue;
        }
        const overlap = Math.min(a.travel[1], b.travel[1]) - Math.max(a.travel[0], b.travel[0]);
        const separation = Math.abs(a.lane - b.lane);
        const cost = overlap > 0 ? backtrackCost(overlap, separation) : 0;
        if (cost <= 0) {
          continue;
        }
        const firstVisit = route.segmentVisitOf(a.segmentIndex);
        const secondVisit = route.segmentVisitOf(b.segmentIndex);
        const visits = [{ routeIndex, visitIndex: firstVisit }];
        if (secondVisit !== firstVisit) {
          visits.push({ routeIndex, visitIndex: secondVisit });
        }
        const firstCorridor = route.visits[firstVisit].corridorIndex;
        const secondCorridor = route.visits[secondVisit].corridorIndex;
        events.push({
          kind: "backtrack",
          cost,
          routeIndexes: [routeIndex],
          corridorIndexes: firstCorridor === secondCorridor ? [firstCorridor] : [Math.min(firstCorridor, secondCorridor), Math.max(firstCorridor, secondCorridor)],
          visits
        });
      }
    }
    return events;
  }
  function findTinyKink(points) {
    for (let pointIndex = 1; pointIndex < points.length - 2; pointIndex += 1) {
      const length = Math.abs(points[pointIndex + 1].x - points[pointIndex].x) + Math.abs(points[pointIndex + 1].y - points[pointIndex].y);
      const beforeHorizontal = points[pointIndex - 1].y === points[pointIndex].y;
      const segmentHorizontal = points[pointIndex].y === points[pointIndex + 1].y;
      const afterHorizontal = points[pointIndex + 1].y === points[pointIndex + 2].y;
      if (length < 16 && beforeHorizontal !== segmentHorizontal && segmentHorizontal !== afterHorizontal) {
        return pointIndex;
      }
    }
    return void 0;
  }
  function countBends(points) {
    let count = 0;
    for (let pointIndex = 1; pointIndex + 1 < points.length; pointIndex += 1) {
      const beforeHorizontal = points[pointIndex - 1].y === points[pointIndex].y;
      const afterHorizontal = points[pointIndex].y === points[pointIndex + 1].y;
      if (beforeHorizontal !== afterHorizontal) {
        count += 1;
      }
    }
    return count;
  }
  function measurePath(points) {
    let length = 0;
    for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
      length += Math.abs(points[pointIndex].x - points[pointIndex - 1].x) + Math.abs(points[pointIndex].y - points[pointIndex - 1].y);
    }
    return length;
  }

  // packages/layout/src/routing/corridor/disjointSweep.ts
  var EPSILON9 = 1e-6;
  function occupancies(world, route, fromVisit, step, sharedAxis) {
    const out = [];
    let sign = 1;
    let prevAxis;
    let prevDir = 0;
    for (let index = fromVisit; index >= 0 && index < route.visits.length; index += step) {
      const visit = route.visits[index];
      const before = route.visits[index - step];
      const after = route.visits[index + step];
      if (index !== fromVisit && before && after && before.corridorIndex === after.corridorIndex) {
        continue;
      }
      const corridor = world.indexer.corridors[visit.corridorIndex];
      const entry = boundaryTravelCoordinate(world, corridor, visit.entry);
      const exit = boundaryTravelCoordinate(world, corridor, visit.exit);
      const runLow = Math.min(entry, exit);
      const runHigh = Math.max(entry, exit);
      const rawDir = routeTravelDirection(world, route, index);
      const dir = step === 1 ? rawDir : -rawDir;
      if (prevAxis !== void 0 && corridor.axis !== prevAxis && prevDir !== 0 && dir !== 0) {
        sign = sign * -(prevDir * dir);
      }
      prevAxis = corridor.axis;
      if (dir !== 0) {
        prevDir = dir;
      }
      if (corridor.axis === sharedAxis) {
        out.push({
          travelStart: runLow,
          travelEnd: runHigh,
          crossLow: visit.feasibleTrack[0],
          crossHigh: visit.feasibleTrack[1],
          sign,
          sharedChain: out.every((occupancy) => occupancy.sharedChain)
        });
        continue;
      }
      const perpWindow = chainFeasibleBand(world, route, index);
      const at = (perpWindow[0] + perpWindow[1]) / 2;
      out.push({
        travelStart: at,
        travelEnd: at,
        crossLow: runLow,
        crossHigh: runHigh,
        sign,
        adjacentPerp: out.length === 1
      });
    }
    const terminal = step === 1 ? route.to : route.from;
    const point = endpointPoint(world.entities, terminal);
    const cross2 = sharedAxis === "x" ? point.y : point.x;
    const travel = sharedAxis === "x" ? point.x : point.y;
    out.push({
      travelStart: travel,
      travelEnd: travel,
      crossLow: cross2,
      crossHigh: cross2,
      sign,
      pin: true
    });
    return out;
  }
  function departureOrder(a, b, aList, bList) {
    const raySide = (perp, band) => {
      const exitsHigh = perp.crossHigh > band.crossHigh + EPSILON9;
      const exitsLow = perp.crossLow < band.crossLow - EPSILON9;
      if (exitsHigh === exitsLow) {
        return 0;
      }
      return exitsHigh ? 1 : -1;
    };
    const oneSided = (perp, band, bandList, perpList) => {
      if (!perp.adjacentPerp || perp.sign !== 1 || band.sign !== 1 || band.pin || band.adjacentPerp) {
        return 0;
      }
      const side = raySide(perp, band);
      if (side === 0) {
        return 0;
      }
      const mirrorRay = bandList.find((occupancy) => occupancy.adjacentPerp);
      const window = perpList[0];
      if (mirrorRay && mirrorRay.sign === 1 && window && Math.abs(mirrorRay.travelStart - perp.travelStart) <= EPSILON9 && raySide(mirrorRay, window) === side) {
        return 0;
      }
      return side;
    };
    const aSide = oneSided(a, b, bList, aList);
    if (aSide !== 0) {
      return aSide;
    }
    return -oneSided(b, a, aList, bList);
  }
  function disjointOrder(left, right) {
    if (Math.abs(left.crossLow - right.crossLow) <= EPSILON9 && Math.abs(left.crossHigh - right.crossHigh) <= EPSILON9) {
      return { order: 0, strict: false };
    }
    if (left.crossHigh <= right.crossLow + EPSILON9) {
      return { order: -1, strict: left.crossHigh < right.crossLow - EPSILON9 };
    }
    if (right.crossHigh <= left.crossLow + EPSILON9) {
      return { order: 1, strict: right.crossHigh < left.crossLow - EPSILON9 };
    }
    return { order: 0, strict: false };
  }
  function spanOrder(left, right) {
    const leftInRight = left.crossLow >= right.crossLow - EPSILON9 && left.crossHigh <= right.crossHigh + EPSILON9;
    const rightInLeft = right.crossLow >= left.crossLow - EPSILON9 && right.crossHigh <= left.crossHigh + EPSILON9;
    if (!leftInRight && !rightInLeft) {
      return 0;
    }
    const leftCentre = (left.crossLow + left.crossHigh) / 2;
    const rightCentre = (right.crossLow + right.crossHigh) / 2;
    if (Math.abs(leftCentre - rightCentre) <= EPSILON9) {
      return 0;
    }
    return leftCentre < rightCentre ? -1 : 1;
  }
  function hasFarOnSide(list, windows, side) {
    return list.some(
      (far) => !far.sharedChain && !far.pin && windows.some(
        (window) => far.travelStart <= window.travelEnd + EPSILON9 && window.travelStart <= far.travelEnd + EPSILON9 && disjointOrder(far, window).order === side
      )
    );
  }
  function sweepDirection(world, routeA, visitA, routeB, visitB, step, stepB, sharedAxis, sharedDir) {
    const left = occupancies(world, routeA, visitA, step, sharedAxis);
    const right = occupancies(world, routeB, visitB, stepB, sharedAxis);
    let indexLeft = 0;
    let indexRight = 0;
    let softest;
    while (indexLeft < left.length && indexRight < right.length) {
      const a = left[indexLeft];
      const b = right[indexRight];
      const coLocated = a.travelStart <= b.travelEnd + EPSILON9 && b.travelStart <= a.travelEnd + EPSILON9 && // A pin only compares with a pin. A port abutting the corridor's band edge says nothing
      // about order because both routes may end at ports on that edge; the pin rules below
      // handle a pin pair with actual endpoint information.
      a.pin === b.pin;
      const separation = coLocated ? disjointOrder(a, b) : { order: 0, strict: false };
      const literalSeparation = a.sharedChain || b.sharedChain;
      const companionVeto = separation.order !== 0 && literalSeparation && a.sharedChain !== b.sharedChain && hasFarOnSide(
        a.sharedChain ? left : right,
        a.sharedChain ? right.filter((o) => o.sharedChain) : left.filter((o) => o.sharedChain),
        a.sharedChain ? -separation.order : separation.order
      );
      if (separation.order !== 0 && !companionVeto && (literalSeparation || a.sign === b.sign)) {
        const inviolable = indexLeft === 0 && indexRight === 0 && separation.strict;
        const result = {
          order: separation.order * (literalSeparation ? 1 : a.sign),
          reason: inviolable ? "disjoint" : "touching",
          side: step === 1 ? "forward" : "backward",
          at: step === 1 ? Math.max(a.travelStart, b.travelStart) : Math.min(a.travelEnd, b.travelEnd)
        };
        if (!separation.strict) {
          const departure = coLocated ? departureOrder(a, b, left, right) : 0;
          if (departure !== 0) {
            return {
              order: departure,
              reason: "peel",
              side: step === 1 ? "forward" : "backward"
            };
          }
        }
        return result;
      }
      if (coLocated && a.sign === b.sign) {
        const departure = departureOrder(a, b, left, right);
        if (departure !== 0) {
          return {
            order: departure,
            reason: "peel",
            side: step === 1 ? "forward" : "backward"
          };
        }
      }
      if (!softest && coLocated && a.sign === b.sign) {
        const soft = spanOrder(a, b);
        if (soft !== 0) {
          softest = {
            order: soft * a.sign,
            reason: "span",
            side: step === 1 ? "forward" : "backward"
          };
        }
      }
      if (a.pin && b.pin && a.sign === b.sign && Math.abs(a.crossLow - b.crossLow) <= EPSILON9 && Math.abs(a.travelStart - b.travelStart) > EPSILON9) {
        const earlierFirst = (sharedDir === 1 ? a.travelStart < b.travelStart : a.travelStart > b.travelStart) ? -1 : 1;
        return {
          order: earlierFirst * a.sign * sharedDir,
          reason: "peel",
          side: step === 1 ? "forward" : "backward",
          weak: true
        };
      }
      const walkEnd = (o) => sharedDir === 1 ? o.travelEnd : -o.travelStart;
      const aEnd = walkEnd(a);
      const bEnd = walkEnd(b);
      if (Math.abs(aEnd - bEnd) <= EPSILON9) {
        const aExtent = a.travelEnd - a.travelStart;
        const bExtent = b.travelEnd - b.travelStart;
        if (aExtent <= bExtent + EPSILON9) {
          indexLeft += 1;
        }
        if (bExtent <= aExtent + EPSILON9) {
          indexRight += 1;
        }
      } else if (aEnd < bEnd) {
        indexLeft += 1;
      } else {
        indexRight += 1;
      }
    }
    const pinA = left[left.length - 1];
    const pinB = right[right.length - 1];
    if (pinA.pin && pinB.pin && pinA.sign === pinB.sign) {
      const crossDelta = pinA.crossLow - pinB.crossLow;
      if (Math.abs(crossDelta) > EPSILON9) {
        return {
          order: (crossDelta < 0 ? -1 : 1) * pinA.sign,
          reason: "touching",
          side: step === 1 ? "forward" : "backward",
          weak: true
        };
      }
      if (Math.abs(pinA.travelStart - pinB.travelStart) > EPSILON9) {
        const earlierFirst = (sharedDir === 1 ? pinA.travelStart < pinB.travelStart : pinA.travelStart > pinB.travelStart) ? -1 : 1;
        return {
          order: earlierFirst * pinA.sign * sharedDir,
          reason: "peel",
          side: step === 1 ? "forward" : "backward",
          weak: true
        };
      }
    }
    return softest;
  }
  function continuesStraight(route, visitIndex) {
    const entry = route.visits[visitIndex]?.entry;
    return entry !== void 0 && entry.kind === "portal" && entry.mode === "continue-straight";
  }
  function chainReachesStart(route, index) {
    let cursor = index;
    while (cursor > 0 && continuesStraight(route, cursor)) {
      cursor -= 1;
    }
    return cursor === 0;
  }
  function chainReachesEnd(route, index) {
    let cursor = index;
    while (cursor < route.visits.length - 1 && continuesStraight(route, cursor + 1)) {
      cursor += 1;
    }
    return cursor === route.visits.length - 1;
  }
  function routeTravelDirection(world, route, index) {
    const visit = route.visits[index];
    const corridor = world.indexer.corridors[visit.corridorIndex];
    const entry = boundaryTravelCoordinate(world, corridor, visit.entry);
    const exit = boundaryTravelCoordinate(world, corridor, visit.exit);
    if (Math.abs(exit - entry) > EPSILON9) {
      return exit > entry ? 1 : -1;
    }
    if (index <= 0 || index >= route.visits.length - 1) {
      return 0;
    }
    const chainBefore = chainFeasibleBand(world, route, index - 1);
    const chainAfter = chainFeasibleBand(world, route, index + 1);
    let before = (chainBefore[0] + chainBefore[1]) / 2;
    let after = (chainAfter[0] + chainAfter[1]) / 2;
    if (Math.abs(after - before) <= EPSILON9) {
      const travelOf2 = (point) => corridor.axis === "x" ? point.x : point.y;
      if (chainReachesStart(route, index - 1)) {
        before = travelOf2(endpointPoint(world.entities, route.from));
      }
      if (chainReachesEnd(route, index + 1)) {
        after = travelOf2(endpointPoint(world.entities, route.to));
      }
    }
    return after > before + EPSILON9 ? 1 : after < before - EPSILON9 ? -1 : 0;
  }
  function chainFeasibleBand(world, route, visitIndex) {
    const axis = world.indexer.corridors[route.visits[visitIndex].corridorIndex].axis;
    const sameAxis = (index) => world.indexer.corridors[route.visits[index].corridorIndex].axis === axis;
    let low = route.visits[visitIndex].feasibleTrack[0];
    let high = route.visits[visitIndex].feasibleTrack[1];
    for (let index = visitIndex; index > 0 && continuesStraight(route, index) && sameAxis(index - 1); index -= 1) {
      low = Math.max(low, route.visits[index - 1].feasibleTrack[0]);
      high = Math.min(high, route.visits[index - 1].feasibleTrack[1]);
    }
    for (let index = visitIndex + 1; index < route.visits.length && continuesStraight(route, index) && sameAxis(index); index += 1) {
      low = Math.max(low, route.visits[index].feasibleTrack[0]);
      high = Math.min(high, route.visits[index].feasibleTrack[1]);
    }
    return [low, high];
  }
  function walkChirality(world, route, fromVisit, toVisit) {
    const step = toVisit >= fromVisit ? 1 : -1;
    let sign = 1;
    let prevAxis;
    let prevDir = 0;
    for (let index = fromVisit; step === 1 ? index <= toVisit : index >= toVisit; index += step) {
      const visit = route.visits[index];
      const corridor = world.indexer.corridors[visit.corridorIndex];
      const rawDir = routeTravelDirection(world, route, index);
      const dir = step === 1 ? rawDir : -rawDir;
      if (prevAxis !== void 0 && corridor.axis !== prevAxis && prevDir !== 0 && dir !== 0) {
        sign = sign * -(prevDir * dir);
      }
      prevAxis = corridor.axis;
      if (dir !== 0) {
        prevDir = dir;
      }
    }
    return sign;
  }
  function disjointSweepOrder(world, routeA, visitA, routeB, visitB) {
    const shared = world.indexer.corridors[routeA.visits[visitA].corridorIndex];
    const sharedAxis = shared.axis;
    const travelSignAt = (route, visitIndex) => routeTravelDirection(world, route, visitIndex) >= 0 ? 1 : -1;
    const orientationB = travelSignAt(routeA, visitA) === travelSignAt(routeB, visitB) ? 1 : -1;
    const sharedDir = routeTravelDirection(world, routeA, visitA) >= 0 ? 1 : -1;
    const chainA = chainFeasibleBand(world, routeA, visitA);
    const chainB = chainFeasibleBand(world, routeB, visitB);
    const chainSeparation = chainA[0] <= chainA[1] + EPSILON9 && chainB[0] <= chainB[1] + EPSILON9 ? disjointOrder(
      { travelStart: 0, travelEnd: 0, crossLow: chainA[0], crossHigh: chainA[1], sign: 1 },
      { travelStart: 0, travelEnd: 0, crossLow: chainB[0], crossHigh: chainB[1], sign: 1 }
    ) : { order: 0, strict: false };
    if (chainSeparation.order !== 0 && chainSeparation.strict) {
      return { order: chainSeparation.order, reason: "disjoint" };
    }
    const decisive = (result) => result !== void 0 && (result.reason === "disjoint" || result.reason === "peel" || result.reason === "touching");
    const forward = sweepDirection(
      world,
      routeA,
      visitA,
      routeB,
      visitB,
      1,
      orientationB,
      sharedAxis,
      sharedDir
    );
    if (decisive(forward) && !forward?.weak) {
      return forward;
    }
    const backward = sweepDirection(
      world,
      routeA,
      visitA,
      routeB,
      visitB,
      -1,
      -orientationB,
      sharedAxis,
      -sharedDir
    );
    if (decisive(backward) && !backward?.weak) {
      return backward;
    }
    if (chainSeparation.order !== 0) {
      return { order: chainSeparation.order, reason: "touching" };
    }
    if (decisive(forward)) {
      return forward;
    }
    if (decisive(backward)) {
      return backward;
    }
    const soft = forward ?? backward;
    if (soft) {
      return soft;
    }
    return { order: 0, reason: "tied" };
  }

  // packages/layout/src/routing/corridor/ordering.ts
  var EPSILON10 = 1e-6;
  function orderRoutes(world, routes) {
    for (const route of routes) {
      if (route.hasRealization()) {
        throw new Error(`route ${route.requestIndex}: ordering requires a clear realization`);
      }
    }
    const refsByCorridor = buildVisitRefs(world, routes);
    const straightChains = buildStraightChains(routes);
    const pairRootCache = /* @__PURE__ */ new Map();
    const pairRoot = (refA, refB) => {
      const idsA = straightChains.idsByRoute[refA.routeIndex];
      const idsB = straightChains.idsByRoute[refB.routeIndex];
      const chainA = idsA[refA.visitIndex];
      const chainB = idsB[refB.visitIndex];
      const key = `${chainA}:${chainB}`;
      const cached = pairRootCache.get(key);
      if (cached) {
        return cached;
      }
      let root = [refA.visitIndex, refB.visitIndex];
      outer: for (let i = 0; i < routes[refA.routeIndex].visits.length; i += 1) {
        if (idsA[i] !== chainA) {
          continue;
        }
        const corridorIndex = routes[refA.routeIndex].visits[i].corridorIndex;
        for (let j = 0; j < routes[refB.routeIndex].visits.length; j += 1) {
          if (idsB[j] !== chainB) {
            continue;
          }
          if (routes[refB.routeIndex].visits[j].corridorIndex === corridorIndex) {
            root = [i, j];
            break outer;
          }
        }
      }
      pairRootCache.set(key, root);
      return root;
    };
    const orderByRoute = routes.map((route) => new Int32Array(route.visits.length));
    const groups = [];
    for (let corridorIndex = 0; corridorIndex < refsByCorridor.length; corridorIndex += 1) {
      const refs = refsByCorridor[corridorIndex];
      if (!refs || refs.length === 0) {
        continue;
      }
      refs.sort(compareStableRefs);
      const cellCount = refs.length * refs.length;
      const pairOrders = new Int8Array(cellCount);
      const hardOrders = new Int8Array(cellCount);
      const contendingOrders = new Int8Array(cellCount);
      const travelRuns = new Array(refs.length);
      const corridor = world.indexer.corridors[corridorIndex];
      for (let refIndex = 0; refIndex < refs.length; refIndex += 1) {
        const ref = refs[refIndex];
        const visit = routes[ref.routeIndex].visits[ref.visitIndex];
        const entry = boundaryTravelCoordinate(world, corridor, visit.entry);
        const exit = boundaryTravelCoordinate(world, corridor, visit.exit);
        travelRuns[refIndex] = [Math.min(entry, exit), Math.max(entry, exit)];
      }
      for (let left = 0; left < refs.length; left += 1) {
        for (let right = left + 1; right < refs.length; right += 1) {
          const [rootLeft, rootRight] = pairRoot(refs[left], refs[right]);
          const decision = compareVisitPair(
            world,
            routes,
            { ...refs[left], visitIndex: rootLeft },
            { ...refs[right], visitIndex: rootRight }
          );
          const forwardCell = left * refs.length + right;
          const reverseCell = right * refs.length + left;
          setPair(pairOrders, forwardCell, reverseCell, decision.order);
          const contending = Math.min(travelRuns[left][1], travelRuns[right][1]) - Math.max(travelRuns[left][0], travelRuns[right][0]) > EPSILON10;
          if (decision.reason !== "request-order" && decision.weak !== true || contending) {
            setPair(contendingOrders, forwardCell, reverseCell, decision.order);
          }
          if (decision.reason === "disjoint-feasible-tracks") {
            setPair(hardOrders, forwardCell, reverseCell, decision.order);
          }
        }
      }
      const ranked = rankGroup(refs, pairOrders, hardOrders, contendingOrders);
      const members = ranked.refIndexes.map((refIndex, order) => {
        const ref = refs[refIndex];
        orderByRoute[ref.routeIndex][ref.visitIndex] = order;
        return {
          routeIndex: ref.routeIndex,
          visitIndex: ref.visitIndex,
          order
        };
      });
      groups.push({ corridorIndex, members });
    }
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      if (route.visits.length === 0) {
        continue;
      }
      route.beginRealization();
      route.setOrder(orderByRoute[routeIndex]);
    }
    return { groups };
  }
  function setPair(matrix, forwardCell, reverseCell, order) {
    matrix[forwardCell] = order;
    matrix[reverseCell] = -order;
  }
  function buildVisitRefs(world, routes) {
    const refsByCorridor = new Array(world.indexer.corridors.length);
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      for (let visitIndex = 0; visitIndex < route.visits.length; visitIndex += 1) {
        const visit = route.visits[visitIndex];
        if (!world.indexer.corridors[visit.corridorIndex]) {
          throw new Error(`route ${route.requestIndex}: visit ${visitIndex} corridor missing`);
        }
        const ref = { routeIndex, requestIndex: route.requestIndex, visitIndex };
        const bucket = refsByCorridor[visit.corridorIndex] ?? [];
        bucket.push(ref);
        refsByCorridor[visit.corridorIndex] = bucket;
      }
    }
    return refsByCorridor;
  }
  function buildStraightChains(routes) {
    let nextChainId = 0;
    const idsByRoute = routes.map((route) => {
      const ids = new Int32Array(route.visits.length);
      for (let visitIndex = 0; visitIndex < route.visits.length; visitIndex += 1) {
        const entry = route.visits[visitIndex].entry;
        if (visitIndex > 0 && entry.kind === "portal" && entry.mode === "continue-straight") {
          ids[visitIndex] = ids[visitIndex - 1];
        } else {
          ids[visitIndex] = nextChainId;
          nextChainId += 1;
        }
      }
      return ids;
    });
    return { idsByRoute };
  }
  function compareVisitPair(world, routes, refA, refB) {
    const routeA = routes[refA.routeIndex];
    const routeB = routes[refB.routeIndex];
    const sweep = disjointSweepOrder(world, routeA, refA.visitIndex, routeB, refB.visitIndex);
    const strong = sweep.order !== 0 && !sweep.weak && sweep.reason !== "span";
    if (strong) {
      return {
        order: sweep.order,
        // Only STRICT separation is inviolable. Bands that merely touch are a strong preference:
        // spacing may still need to merge a continuation chain across that boundary.
        reason: sweep.reason === "disjoint" ? "disjoint-feasible-tracks" : "span-containment"
      };
    }
    if (refA.routeIndex !== refB.routeIndex) {
      const linked = linkedTurnOrder(world, routeA, refA.visitIndex, routeB, refB.visitIndex);
      if (linked !== 0) {
        return { order: linked, reason: "span-containment" };
      }
      if (sweep.order !== 0) {
        return { order: sweep.order, reason: "span-containment", weak: sweep.weak === true };
      }
      const rootVisitA = routeA.visits.findIndex(
        (visit) => routeB.visits.some((other) => other.corridorIndex === visit.corridorIndex)
      );
      if (rootVisitA >= 0) {
        const factor = walkChirality(world, routeA, rootVisitA, refA.visitIndex);
        return { order: signed(stablePairOrder(refA, refB) * factor), reason: "request-order" };
      }
    } else if (sweep.order !== 0) {
      return { order: sweep.order, reason: "span-containment", weak: sweep.weak === true };
    }
    return { order: stablePairOrder(refA, refB), reason: "request-order" };
  }
  function linkedTurnOrder(world, routeA, visitA, routeB, visitB) {
    const runOf = (route, visitIndex) => {
      const visit = route.visits[visitIndex];
      const corridor = world.indexer.corridors[visit.corridorIndex];
      const entry = boundaryTravelCoordinate(world, corridor, visit.entry);
      const exit = boundaryTravelCoordinate(world, corridor, visit.exit);
      return [Math.min(entry, exit), Math.max(entry, exit)];
    };
    for (let distance = 0; distance < routeA.visits.length; distance += 1) {
      const candidates = distance === 0 ? [visitA] : [visitA - distance, visitA + distance];
      for (const index of candidates) {
        if (index < 0 || index >= routeA.visits.length) {
          continue;
        }
        const corridorIndex = routeA.visits[index].corridorIndex;
        const [aLow, aHigh] = runOf(routeA, index);
        let mappedOrder = 0;
        let contradictory = false;
        for (let other = 0; other < routeB.visits.length; other += 1) {
          if (index === visitA && other === visitB) {
            continue;
          }
          if (routeB.visits[other].corridorIndex !== corridorIndex) {
            continue;
          }
          const [bLow, bHigh] = runOf(routeB, other);
          if (Math.min(aHigh, bHigh) - Math.max(aLow, bLow) <= EPSILON10) {
            continue;
          }
          const neighbor = disjointSweepOrder(world, routeA, index, routeB, other);
          if (neighbor.order === 0 || neighbor.weak || neighbor.reason === "span") {
            continue;
          }
          const mapped = signed(neighbor.order * walkChirality(world, routeA, visitA, index));
          if (mappedOrder === 0) {
            mappedOrder = mapped;
          } else if (mappedOrder !== mapped) {
            contradictory = true;
          }
        }
        if (mappedOrder !== 0 && !contradictory) {
          return mappedOrder;
        }
      }
    }
    return 0;
  }
  function rankGroup(refs, pairOrders, hardOrders, contendingOrders) {
    const indegree = new Int32Array(refs.length);
    for (let left = 0; left < refs.length; left += 1) {
      for (let right = left + 1; right < refs.length; right += 1) {
        const order = hardOrders[left * refs.length + right];
        if (order === 0) {
          continue;
        }
        const before = order < 0 ? left : right;
        const after = before === left ? right : left;
        indegree[after] += 1;
      }
    }
    const remaining = new Uint8Array(refs.length);
    remaining.fill(1);
    const refIndexes = [];
    while (refIndexes.length < refs.length) {
      let selected = -1;
      let selectedWins = -1;
      let selectedTiebreakWins = -1;
      for (let index = 0; index < refs.length; index += 1) {
        if (remaining[index] !== 1 || indegree[index] !== 0) {
          continue;
        }
        let wins = 0;
        let tiebreakWins = 0;
        for (let other = 0; other < refs.length; other += 1) {
          if (remaining[other] !== 1 || other === index) {
            continue;
          }
          if (contendingOrders[index * refs.length + other] < 0) {
            wins += 1;
          }
          if (pairOrders[index * refs.length + other] < 0) {
            tiebreakWins += 1;
          }
        }
        if (wins > selectedWins || wins === selectedWins && (tiebreakWins > selectedTiebreakWins || tiebreakWins === selectedTiebreakWins && (selected === -1 || compareStableRefs(refs[index], refs[selected]) < 0))) {
          selected = index;
          selectedWins = wins;
          selectedTiebreakWins = tiebreakWins;
        }
      }
      if (selected === -1) {
        for (let index = 0; index < refs.length; index += 1) {
          if (remaining[index] === 1 && (selected === -1 || compareStableRefs(refs[index], refs[selected]) < 0)) {
            selected = index;
          }
        }
      }
      remaining[selected] = 0;
      refIndexes.push(selected);
      for (let after = 0; after < refs.length; after += 1) {
        if (hardOrders[selected * refs.length + after] < 0) {
          indegree[after] -= 1;
        }
      }
    }
    return { refIndexes };
  }
  function stablePairOrder(left, right) {
    return compareStableRefs(left, right) <= 0 ? -1 : 1;
  }
  function compareStableRefs(left, right) {
    return left.requestIndex - right.requestIndex || left.routeIndex - right.routeIndex || left.visitIndex - right.visitIndex;
  }
  function signed(value) {
    return value <= 0 ? -1 : 1;
  }

  // packages/layout/src/routing/corridor/realize.ts
  var MAX_CONTINUATION_CUT_VALIDATIONS_PER_ROUND = 4;
  function reuseOptions(reuse, baseline) {
    return {
      incrementalSpacing: reuse.incrementalSpacing,
      incrementalSpacingBaseline: baseline,
      incrementalEmission: reuse.incrementalEmission,
      incrementalLineMerges: reuse.incrementalLineMerges
    };
  }
  function realizeRoutes(world, topologies, options = {}) {
    const spacingWorkspace = createSpacingRunWorkspace();
    const greedyContinuationCuts = options.continuationCutSelection !== "exhaustive";
    const orderingRoutes = cloneTopologies(topologies);
    const ordering = orderRoutes(world, orderingRoutes);
    const initialIncremental = initialIncrementalSeed(options, topologies, ordering);
    const incumbent = certifySpacingPolicy(
      world,
      topologies,
      ordering,
      options,
      options.terminalCenterContinuations ?? false,
      spacingWorkspace,
      initialIncremental,
      greedyContinuationCuts
    );
    const terminalCenter = evaluateTerminalCenterCandidate(
      world,
      topologies,
      ordering,
      options,
      spacingWorkspace,
      greedyContinuationCuts,
      incumbent
    );
    const selected = selectContinuationCuts(
      {
        world,
        topologies,
        ordering,
        options,
        workspace: spacingWorkspace,
        terminalCenterContinuations: (options.terminalCenterContinuations ?? false) || terminalCenter.accepted,
        greedy: greedyContinuationCuts
      },
      terminalCenter.selected
    );
    const { routes, spacing, endpointQuality, geometryQuality, wallQuality, quality } = selected;
    const labels = options.labelSpecs ? placeLabels(world, routes, options.labelSpecs) : void 0;
    return {
      routes,
      ordering,
      spacing,
      endpointQuality,
      geometryQuality,
      wallQuality,
      quality,
      ...labels ? { labels } : {}
    };
  }
  function evaluateTerminalCenterCandidate(world, topologies, ordering, options, workspace, greedyContinuationCuts, incumbent) {
    const hasTerminalCenterCandidate = incumbent.spacing.continuations.some(
      (policy) => policy.terminalCenterCandidate
    );
    if (options.terminalCenterContinuations !== void 0 || !hasTerminalCenterCandidate) {
      return { selected: incumbent, accepted: false };
    }
    const centered = certifySpacingPolicy(
      world,
      topologies,
      ordering,
      options,
      true,
      workspace,
      incrementalSeed(
        options,
        incumbent,
        incumbent.spacing.continuations.filter((policy) => policy.terminalCenterCandidate).flatMap((policy) => [policy.beforeCorridorIndex, policy.afterCorridorIndex])
      ),
      greedyContinuationCuts
    );
    const accepted = improvesQuality(centered, incumbent);
    return {
      selected: accepted ? centered : incumbent,
      accepted
    };
  }
  function selectContinuationCuts(context, initial) {
    const { world, topologies, ordering, options, workspace, terminalCenterContinuations, greedy } = context;
    let selected = initial;
    let selectedIndependentContinuations = [...options.independentContinuations ?? []];
    while (strictContinuationViolation(selected) > 0) {
      const cuts = infeasibleContinuationCuts(
        world,
        selected,
        selectedIndependentContinuations,
        greedy
      );
      if (!greedy) {
        let best;
        for (const cut of cuts) {
          let candidate;
          try {
            candidate = certifySpacingPolicy(
              world,
              topologies,
              ordering,
              {
                ...options,
                independentContinuations: [...selectedIndependentContinuations, cut]
              },
              terminalCenterContinuations,
              workspace,
              incrementalSeed(options, selected, continuationCorridors(selected, cut))
            );
          } catch {
            continue;
          }
          if (!improvesContinuationFeasibility(candidate, selected)) {
            continue;
          }
          if (!best || compareContinuationFeasibility(candidate, best.pass) < 0) {
            best = { cut, pass: candidate };
          }
        }
        if (!best) {
          break;
        }
        selected = best.pass;
        selectedIndependentContinuations = [...selectedIndependentContinuations, best.cut];
        continue;
      }
      let accepted;
      for (const cut of cuts.slice(0, MAX_CONTINUATION_CUT_VALIDATIONS_PER_ROUND)) {
        const candidateOptions = {
          ...options,
          independentContinuations: [...selectedIndependentContinuations, cut],
          incrementalEmission: true,
          incrementalLineMerges: true
        };
        const candidateSeed = continuationCandidateSeed(
          selected,
          continuationCorridors(selected, cut)
        );
        let solved;
        try {
          solved = solveSpacingPolicy(
            world,
            topologies,
            ordering,
            candidateOptions,
            terminalCenterContinuations,
            [],
            workspace,
            candidateSeed
          );
        } catch {
          continue;
        }
        const afterSpacingViolation = strictContinuationSpacingViolation(solved.spacing);
        if (!improvesSpacingContinuationFeasibility(solved.spacing, selected.spacing)) {
          continue;
        }
        const candidate = certifySolvedSpacingPolicy(
          world,
          topologies,
          ordering,
          candidateOptions,
          terminalCenterContinuations,
          solved,
          workspace,
          candidateSeed,
          afterSpacingViolation > 0
        );
        if (!improvesContinuationFeasibility(candidate, selected)) {
          continue;
        }
        accepted = { cut, pass: candidate };
        break;
      }
      if (!accepted) {
        break;
      }
      selected = accepted.pass;
      selectedIndependentContinuations = [...selectedIndependentContinuations, accepted.cut];
    }
    return selected;
  }
  function certifySpacingPolicy(world, topologies, ordering, options, terminalCenterContinuations, workspace, incremental, deferRequiredContentionsWhileInfeasible = false) {
    const solved = solveSpacingPolicy(
      world,
      topologies,
      ordering,
      options,
      terminalCenterContinuations,
      [],
      workspace,
      incremental
    );
    return certifySolvedSpacingPolicy(
      world,
      topologies,
      ordering,
      options,
      terminalCenterContinuations,
      solved,
      workspace,
      incremental,
      deferRequiredContentionsWhileInfeasible && strictContinuationSpacingViolation(solved.spacing) > 0
    );
  }
  function solveSpacingPolicy(world, topologies, ordering, options, terminalCenterContinuations, requiredContentions, workspace, incremental) {
    const policyOptions = {
      ...options,
      terminalCenterContinuations
    };
    const routes = cloneTopologies(topologies);
    applyOrdering(routes, ordering);
    const qualityLedger = new RoutingQualityLedger();
    const spacing = spaceRoutes(world, routes, ordering, {
      qualityLedger,
      terminalCenterContinuations: policyOptions.terminalCenterContinuations,
      independentContinuations: policyOptions.independentContinuations,
      turnRetrackCorridors: policyOptions.turnRetrackCorridors,
      continuationTrackClearance: policyOptions.continuationTrackClearance,
      requiredContentions,
      workspace,
      ...incremental ? {
        incrementalBaseline: {
          routes: incremental.baseline.routes,
          spacing: incremental.baseline.spacing,
          seedCorridorIndexes: incremental.corridorIndexes
        }
      } : {}
    });
    return { routes, ordering, spacing, qualityLedger };
  }
  function certifySolvedSpacingPolicy(world, topologies, ordering, options, terminalCenterContinuations, solved, workspace, incremental, deferRequiredContentions = false) {
    const policyOptions = {
      ...options,
      terminalCenterContinuations
    };
    const first = finishSpacingPass(world, solved, policyOptions, incremental);
    const requiredContentions = first.missingContentions;
    if (requiredContentions.length === 0) {
      return first;
    }
    if (deferRequiredContentions) {
      return first;
    }
    const retryIncremental = incrementalSeed(
      options,
      first,
      requiredContentions.map((contention) => contention.corridorIndexes[0])
    );
    const candidate = finishSpacingPass(
      world,
      solveSpacingPolicy(
        world,
        topologies,
        ordering,
        policyOptions,
        terminalCenterContinuations,
        requiredContentions,
        workspace,
        retryIncremental
      ),
      policyOptions,
      retryIncremental
    );
    if (candidate.missingContentions.length > 0) {
      return first;
    }
    if (!improvesQuality(candidate, first)) {
      return first;
    }
    return candidate;
  }
  function finishSpacingPass(world, solved, options, incremental) {
    const { routes, ordering, spacing, qualityLedger } = solved;
    const reuse = reuseEmittedRoutes(
      routes,
      options.incrementalEmission || options.incrementalLineMerges ? incremental?.baseline.routes : void 0,
      options.incrementalEmission === true
    );
    emitRoutes(
      world,
      reuse.routes,
      options.incrementalEmission !== true || !reuse.changedRouteIndexes ? {} : { routeIndexes: reuse.changedRouteIndexes }
    );
    const retainedLineMerges = options.incrementalLineMerges && incremental && reuse.changedRouteIndexes ? retainedLineMergesForUnchangedRoutes(
      incremental.baseline.geometryQuality,
      reuse.changedRouteIndexes
    ) : void 0;
    const lineMergeRouteIndexes = options.incrementalLineMerges ? reuse.changedRouteIndexes ?? /* @__PURE__ */ new Set() : void 0;
    const geometryQuality = collectGeometryQualityEvents(
      reuse.routes,
      spacing.quality.events,
      void 0,
      lineMergeRouteIndexes ? {
        lineMergeRouteIndexes,
        ...retainedLineMerges ? { retainedLineMerges } : {}
      } : {}
    );
    const missingContentions = collectMissingRealizedSpacingQualityEvents(
      world,
      reuse.routes,
      ordering,
      spacing.quality.events,
      geometryQuality.index
    );
    qualityLedger.replaceSource("spacing:realized-missing", "spacing", missingContentions);
    const wallQuality = collectWallQualityEvents(world, reuse.routes);
    qualityLedger.replaceSource("emission:wall-quality", "emission", wallQuality);
    const endpointQuality = collectEndpointQualityEvents(world, reuse.routes);
    qualityLedger.replaceSource("emission:endpoint-quality", "emission", endpointQuality);
    qualityLedger.replaceSource(
      "emission:geometry-quality",
      "emission",
      geometryQuality.events,
      geometryQuality.scalarCosts
    );
    const quality = qualityLedger.snapshot();
    return {
      routes: reuse.routes,
      ordering,
      spacing,
      missingContentions,
      endpointQuality,
      geometryQuality,
      wallQuality,
      quality
    };
  }
  function reuseEmittedRoutes(routes, baselineRoutes, reuseUnchanged) {
    if (!baselineRoutes) {
      return { routes };
    }
    if (routes.length !== baselineRoutes.length) {
      throw new Error("route emission: incremental baseline route count changed");
    }
    const changedRouteIndexes = /* @__PURE__ */ new Set();
    const sharedRoutes = routes.map((route, routeIndex) => {
      const baseline = baselineRoutes[routeIndex];
      if (haveSameEmissionInputs(route, baseline)) {
        return reuseUnchanged ? baseline : route;
      }
      changedRouteIndexes.add(routeIndex);
      return route;
    });
    return {
      routes: sharedRoutes,
      changedRouteIndexes
    };
  }
  function cloneTopologies(topologies) {
    return topologies.map((route) => cloneRoute(route));
  }
  function applyOrdering(routes, ordering) {
    const orderByRoute = routes.map((route) => new Int32Array(route.visits.length));
    for (const group of ordering.groups) {
      for (const member of group.members) {
        orderByRoute[member.routeIndex][member.visitIndex] = member.order;
      }
    }
    routes.forEach((route, routeIndex) => {
      if (route.visits.length === 0) {
        return;
      }
      route.beginRealization();
      route.setOrder(orderByRoute[routeIndex]);
    });
  }
  function incrementalSeed(options, baseline, corridorIndexes) {
    if (!options.incrementalSpacing && !options.incrementalEmission && !options.incrementalLineMerges) {
      return void 0;
    }
    const uniqueCorridorIndexes = [...new Set(corridorIndexes)];
    return {
      baseline,
      corridorIndexes: options.incrementalSpacing ? uniqueCorridorIndexes : []
    };
  }
  function continuationCandidateSeed(baseline, corridorIndexes) {
    return {
      baseline,
      corridorIndexes: [...new Set(corridorIndexes)]
    };
  }
  function initialIncrementalSeed(options, topologies, ordering) {
    const baseline = options.incrementalSpacingBaseline;
    if (!baseline || !options.incrementalSpacing && !options.incrementalEmission && !options.incrementalLineMerges) {
      return void 0;
    }
    const corridorIndexes = /* @__PURE__ */ new Set();
    topologies.forEach((route, routeIndex) => {
      const baselineRoute = baseline.routes[routeIndex];
      if (baselineRoute && haveSameSpacingInputs(route, baselineRoute)) {
        return;
      }
      for (const visit of route.visits) {
        corridorIndexes.add(visit.corridorIndex);
      }
      for (const visit of baselineRoute?.visits ?? []) {
        corridorIndexes.add(visit.corridorIndex);
      }
    });
    const baselineOrderByCorridor = new Map(
      baseline.ordering.groups.map((group) => [
        group.corridorIndex,
        group.members.map((member) => `${member.routeIndex}:${member.visitIndex}`).join(",")
      ])
    );
    for (const group of ordering.groups) {
      const signature = group.members.map((member) => `${member.routeIndex}:${member.visitIndex}`).join(",");
      if (baselineOrderByCorridor.get(group.corridorIndex) !== signature) {
        corridorIndexes.add(group.corridorIndex);
      }
      baselineOrderByCorridor.delete(group.corridorIndex);
    }
    for (const corridorIndex of baselineOrderByCorridor.keys()) {
      corridorIndexes.add(corridorIndex);
    }
    for (const continuation of options.independentContinuations ?? []) {
      addContinuationCorridors(corridorIndexes, topologies, continuation);
    }
    const requestedIndependentKeys = new Set(
      (options.independentContinuations ?? []).map(
        ({ routeIndex, afterVisitIndex }) => `${routeIndex}:${afterVisitIndex}`
      )
    );
    for (const policy of baseline.spacing.continuations) {
      const key = `${policy.routeIndex}:${policy.afterVisitIndex}`;
      const retainedForcedIndependent = policy.reason === "forced-independent" && requestedIndependentKeys.has(key);
      const retainedTerminalCenter = policy.reason === "terminal-center-conflict" && options.terminalCenterContinuations === true;
      if (policy.reason === "forced-independent" && !retainedForcedIndependent || policy.reason === "terminal-center-conflict" && !retainedTerminalCenter) {
        corridorIndexes.add(policy.beforeCorridorIndex);
        corridorIndexes.add(policy.afterCorridorIndex);
      }
    }
    for (const corridorIndex of options.turnRetrackCorridors ?? []) {
      corridorIndexes.add(corridorIndex);
    }
    return incrementalSeed(options, baseline, [...corridorIndexes]);
  }
  function addContinuationCorridors(result, routes, boundary) {
    const route = routes[boundary.routeIndex];
    const before = route?.visits[boundary.afterVisitIndex - 1];
    const after = route?.visits[boundary.afterVisitIndex];
    if (before) {
      result.add(before.corridorIndex);
    }
    if (after) {
      result.add(after.corridorIndex);
    }
  }
  function continuationCorridors(pass, boundary) {
    const policy = pass.spacing.continuations.find(
      (candidate) => candidate.routeIndex === boundary.routeIndex && candidate.afterVisitIndex === boundary.afterVisitIndex
    );
    if (policy) {
      return [policy.beforeCorridorIndex, policy.afterCorridorIndex];
    }
    const route = pass.routes[boundary.routeIndex];
    return [
      route.visits[boundary.afterVisitIndex - 1].corridorIndex,
      route.visits[boundary.afterVisitIndex].corridorIndex
    ];
  }
  function improvesQuality(candidate, incumbent) {
    return compareRoutingQualityCosts(candidate.quality.cost, incumbent.quality.cost) < 0;
  }
  function improvesContinuationFeasibility(candidate, incumbent) {
    return introducesNoInvalidEvents(candidate.quality.events, incumbent.quality.events) && introducesNoCapEvents(candidate.quality.events, incumbent.quality.events) && strictContinuationViolation(candidate) < strictContinuationViolation(incumbent);
  }
  function improvesSpacingContinuationFeasibility(candidate, incumbent) {
    return introducesNoInvalidEvents(candidate.quality.events, incumbent.quality.events) && introducesNoCapEvents(candidate.quality.events, incumbent.quality.events) && strictContinuationSpacingViolation(candidate) < strictContinuationSpacingViolation(incumbent);
  }
  function compareContinuationFeasibility(left, right) {
    return strictContinuationViolation(left) - strictContinuationViolation(right) || compareRoutingQualityCosts(left.quality.cost, right.quality.cost);
  }
  function strictContinuationViolation(pass) {
    return strictContinuationSpacingViolation(pass.spacing);
  }
  function strictContinuationSpacingViolation(spacing) {
    return spacing.shortfalls.reduce(
      (total, shortfall2) => shortfall2.kind === "straight-continuation" ? total + Math.max(0, shortfall2.required - shortfall2.achieved) : total,
      0
    );
  }
  function infeasibleContinuationCuts(world, pass, retained, ranked) {
    const offendingVisitsByRoute = /* @__PURE__ */ new Map();
    const paddedCandidateRanks = /* @__PURE__ */ new Map();
    for (const shortfall2 of pass.spacing.shortfalls) {
      if (shortfall2.kind !== "straight-continuation" || shortfall2.achieved >= shortfall2.required) {
        continue;
      }
      shortfall2.routeIndexes.forEach((routeIndex, index) => {
        const visitIndex = shortfall2.visitIndexes[index];
        if (visitIndex !== void 0) {
          const visits = offendingVisitsByRoute.get(routeIndex) ?? /* @__PURE__ */ new Set();
          visits.add(visitIndex);
          offendingVisitsByRoute.set(routeIndex, visits);
        }
      });
      if (shortfall2.reason === "empty-padded-intersection") {
        const violation = Math.max(0, shortfall2.required - shortfall2.achieved);
        for (const [localRank, candidate] of (shortfall2.candidateContinuations ?? []).entries()) {
          const key = continuationBoundaryKey(candidate);
          const incumbent = paddedCandidateRanks.get(key);
          if (!incumbent || violation > incumbent.violation || violation === incumbent.violation && localRank < incumbent.localRank) {
            paddedCandidateRanks.set(key, { localRank, violation });
          }
        }
      }
    }
    const retainedKeys = new Set(retained.map(continuationBoundaryKey));
    const candidates = pass.spacing.continuations.flatMap((policy) => {
      const route = pass.routes[policy.routeIndex];
      const offendingVisits = offendingVisitsByRoute.get(policy.routeIndex);
      const boundary = {
        routeIndex: policy.routeIndex,
        afterVisitIndex: policy.afterVisitIndex
      };
      const key = continuationBoundaryKey(boundary);
      return route && offendingVisits && policy.policy === "equal" && policy.reason !== "bundle-safety" && !retainedKeys.has(key) && offendingVisits.has(policy.afterVisitIndex - 1) && offendingVisits.has(policy.afterVisitIndex) && (paddedCandidateRanks.has(key) || isDirectTerminalContinuationBridge(route) && isSevereEndpointMisalignment(world, route) && offendingVisits.has(0) && offendingVisits.has(route.visits.length - 1)) ? [boundary] : [];
    });
    return ranked ? candidates.sort((left, right) => {
      const leftRank = paddedCandidateRanks.get(continuationBoundaryKey(left));
      const rightRank = paddedCandidateRanks.get(continuationBoundaryKey(right));
      return Number(Boolean(rightRank)) - Number(Boolean(leftRank)) || (rightRank?.violation ?? 0) - (leftRank?.violation ?? 0) || (leftRank?.localRank ?? Number.POSITIVE_INFINITY) - (rightRank?.localRank ?? Number.POSITIVE_INFINITY) || left.routeIndex - right.routeIndex || left.afterVisitIndex - right.afterVisitIndex;
    }) : candidates;
  }
  function continuationBoundaryKey(boundary) {
    return `${boundary.routeIndex}:${boundary.afterVisitIndex}`;
  }
  function isSevereEndpointMisalignment(world, route) {
    const ports = route.ports();
    const samples = [
      { endpoint: route.from, point: ports.from },
      { endpoint: route.to, point: ports.to }
    ].map(({ endpoint, point }) => {
      const span = faceCrossSpan(
        (world.sourceEntities ?? world.entities)[endpoint.entityIndex],
        endpoint.face
      );
      const coordinate = endpoint.face === "left" || endpoint.face === "right" ? point.y : point.x;
      const halfSpan = (span[1] - span[0]) / 2;
      return {
        normalizedDeviation: halfSpan > 0 ? Math.abs(coordinate - (endpoint.preferredTrack ?? midpoint(span))) / halfSpan : 0,
        edgeDistance: Math.min(coordinate - span[0], span[1] - coordinate)
      };
    });
    return samples.every((sample) => sample.normalizedDeviation >= 0.5) && samples.some((sample) => sample.edgeDistance <= PORT_EDGE_PADDING_PX);
  }
  function isDirectTerminalContinuationBridge(route) {
    const oppositeFaces = route.from.face === "left" && route.to.face === "right" || route.from.face === "right" && route.to.face === "left" || route.from.face === "up" && route.to.face === "down" || route.from.face === "down" && route.to.face === "up";
    return oppositeFaces && route.visits.length > 1 && route.visits.slice(1).every((visit) => visit.entry.kind === "portal" && visit.entry.mode === "continue-straight");
  }
  function introducesNoCapEvents(candidate, incumbent) {
    return introducesNoTierEvents(candidate, incumbent, "cap");
  }
  function introducesNoInvalidEvents(candidate, incumbent) {
    return introducesNoTierEvents(candidate, incumbent, "invalid");
  }
  function introducesNoTierEvents(candidate, incumbent, tier) {
    const available = qualityEventCounts(incumbent, tier);
    for (const event of candidate) {
      if (routingQualityTier(event.kind) !== tier) {
        continue;
      }
      const key = capEventKey(event);
      const remaining = available.get(key) ?? 0;
      if (remaining === 0) {
        return false;
      }
      available.set(key, remaining - 1);
    }
    return true;
  }
  function qualityEventCounts(events, tier) {
    const result = /* @__PURE__ */ new Map();
    for (const event of events) {
      if (routingQualityTier(event.kind) === tier) {
        const key = capEventKey(event);
        result.set(key, (result.get(key) ?? 0) + 1);
      }
    }
    return result;
  }
  function capEventKey(event) {
    if (event.kind === "line-merge") {
      const merge = event;
      return `line-merge:${merge.corridorIndexes[0]}:${visitKey2(merge.visits)}`;
    }
    if (event.kind === "wall-touch") {
      const touch = event;
      return `wall-touch:${touch.routeIndex}:${touch.entityIndex}:${touch.face}:${touch.bendPointIndex}`;
    }
    return `${event.kind}:${[...event.routeIndexes].sort((a, b) => a - b).join(",")}:${[
      ...event.corridorIndexes ?? []
    ].sort((a, b) => a - b).join(",")}:${visitKey2(event.visits ?? [])}`;
  }
  function visitKey2(visits) {
    return visits.map((visit) => `${visit.routeIndex}:${visit.visitIndex}`).sort().join(",");
  }

  // packages/layout/src/routing/corridor/mergedSpacingRepair.ts
  var MAX_CONTINUATION_CANDIDATES = 8;
  function repairMergedSpacing(world, initial, options = {}) {
    const incumbent = initial;
    const reuse = options.incrementalSpacing === false && options.incrementalEmission === false ? { incrementalSpacing: false, incrementalEmission: false, incrementalLineMerges: false } : {
      incrementalSpacing: options.incrementalSpacing !== false,
      incrementalEmission: options.incrementalEmission !== false,
      incrementalLineMerges: options.incrementalLineMerges !== false
    };
    const acceptedTerminalCenterContinuations = incumbent.spacing.continuations.some(
      (continuation) => continuation.policy === "independent" && continuation.reason === "terminal-center-conflict"
    );
    const tryCandidate = (realizeOverrides, accept) => {
      let candidate;
      try {
        candidate = realizeRoutes(world, incumbent.routes, {
          continuationCutSelection: "exhaustive",
          ...reuseOptions(reuse, incumbent),
          terminalCenterContinuations: acceptedTerminalCenterContinuations,
          ...realizeOverrides
        });
      } catch {
        return;
      }
      if (compareRoutingQualityCosts(candidate.quality.cost, incumbent.quality.cost) >= 0) {
        return;
      }
      accept(candidate);
    };
    const candidates = mergedRepairCandidates(incumbent);
    let best = incumbent;
    let acceptedContinuationBoundary;
    const isDeadStraight = (routeIndex) => {
      const route = incumbent.routes[routeIndex];
      if (!route) {
        return false;
      }
      try {
        const points = route.points();
        for (let pointIndex = 1; pointIndex + 1 < points.length; pointIndex += 1) {
          const beforeHorizontal = points[pointIndex - 1].y === points[pointIndex].y;
          const afterHorizontal = points[pointIndex].y === points[pointIndex + 1].y;
          if (beforeHorizontal !== afterHorizontal) {
            return false;
          }
        }
        return true;
      } catch {
        return false;
      }
    };
    for (const boundary of candidates.continuationBoundaries) {
      if (isDeadStraight(boundary.routeIndex)) {
        continue;
      }
      tryCandidate({ independentContinuations: [boundary] }, (candidate) => {
        if (best === incumbent || compareRoutingQualityCosts(candidate.quality.cost, best.quality.cost) < 0) {
          best = candidate;
          acceptedContinuationBoundary = boundary;
        }
      });
    }
    const corridorCandidateSets = [
      ...candidates.corridorIndexes.map((corridorIndex) => [corridorIndex]),
      ...candidates.corridorIndexes.length > 1 ? [candidates.corridorIndexes] : []
    ];
    for (const corridorIndexes of corridorCandidateSets) {
      tryCandidate(
        {
          turnRetrackCorridors: new Set(corridorIndexes),
          continuationTrackClearance: corridorIndexes.length > 1
        },
        (candidate) => {
          if (best === incumbent || compareRoutingQualityCosts(candidate.quality.cost, best.quality.cost) < 0) {
            best = candidate;
            acceptedContinuationBoundary = void 0;
          }
        }
      );
    }
    return {
      ...best,
      ...acceptedContinuationBoundary === void 0 ? {} : { acceptedContinuationBoundary }
    };
  }
  function mergedRepairCandidates(batch) {
    const corridorIndexes = /* @__PURE__ */ new Set();
    const continuations = /* @__PURE__ */ new Map();
    for (const event of batch.quality.events) {
      if (event.kind === "line-merge") {
        const merge = event;
        for (const corridorIndex of merge.corridorIndexes) {
          corridorIndexes.add(corridorIndex);
        }
      }
      for (const visit of event.visits ?? []) {
        addAdjacentContinuations(
          continuations,
          visit.routeIndex,
          batch.routes[visit.routeIndex],
          visit.visitIndex,
          event.kind,
          event.cost
        );
      }
    }
    const continuationBoundaries = [...continuations.values()].sort(
      (left, right) => compareRoutingQualityCosts(right.attributedCost, left.attributedCost) || left.routeIndex - right.routeIndex || left.afterVisitIndex - right.afterVisitIndex
    ).slice(0, MAX_CONTINUATION_CANDIDATES).map(({ routeIndex, afterVisitIndex }) => ({ routeIndex, afterVisitIndex }));
    return {
      corridorIndexes: [...corridorIndexes].sort((left, right) => left - right),
      continuationBoundaries
    };
  }
  function addAdjacentContinuations(result, routeIndex, route, visitIndex, eventKind, cost) {
    for (const afterVisitIndex of [visitIndex, visitIndex + 1]) {
      if (afterVisitIndex <= 0 || afterVisitIndex >= route.visits.length) {
        continue;
      }
      const entry = route.visits[afterVisitIndex].entry;
      if (entry.kind !== "portal" || entry.mode !== "continue-straight") {
        continue;
      }
      const key = `${routeIndex}:${afterVisitIndex}`;
      const previous = result.get(key);
      const previousCost = previous?.attributedCost ?? { invalid: 0, cap: 0, scalar: 0 };
      const tier = routingQualityTier(eventKind);
      const attributedCost = {
        ...previousCost,
        [tier]: previousCost[tier] + cost
      };
      result.set(key, { routeIndex, afterVisitIndex, attributedCost });
    }
  }

  // packages/layout/src/routing/corridor/portalDemands.ts
  var EPSILON11 = 1e-6;
  function makeRouteDemandDrafts(routes) {
    return routes.map((route, routeIndex) => ({
      routeIndex,
      requestIndex: route.requestIndex,
      crossingEventCount: 0,
      topologyQualityEventCount: 0,
      wallTouchEventCount: 0,
      wallHugEventCount: 0,
      terminalDirectionEventCount: 0,
      nearFaceTurnEventCount: 0,
      portCenteringEventCount: 0,
      qualityCost: 0,
      partners: /* @__PURE__ */ new Set(),
      portalEventCounts: /* @__PURE__ */ new Map(),
      corridorDemands: /* @__PURE__ */ new Map()
    }));
  }
  function addEndpointQualityDemand(drafts, routes, event) {
    if (event.kind !== "terminal-direction" && event.kind !== "near-face-turn" && event.kind !== "port-centering") {
      return;
    }
    for (const routeIndex of event.routeIndexes) {
      const draft = drafts[routeIndex];
      const route = routes[routeIndex];
      if (!draft || !route) {
        continue;
      }
      if (event.kind === "terminal-direction") {
        draft.terminalDirectionEventCount += 1;
      } else if (event.kind === "near-face-turn") {
        draft.nearFaceTurnEventCount += 1;
      } else {
        draft.portCenteringEventCount += 1;
      }
      draft.qualityCost += event.cost;
      for (const visit of event.visits ?? []) {
        if (visit.routeIndex === routeIndex) {
          addVisitPortals(draft.portalEventCounts, route, visit.visitIndex);
        }
      }
    }
  }
  function addWallQualityDemand(drafts, routes, event) {
    if (event.kind !== "wall-touch" && event.kind !== "wall-hug" && event.kind !== "near-face-turn") {
      return;
    }
    for (const routeIndex of event.routeIndexes) {
      const draft = drafts[routeIndex];
      const route = routes[routeIndex];
      if (!draft || !route) {
        continue;
      }
      if (event.kind === "wall-touch") {
        draft.wallTouchEventCount += 1;
      } else if (event.kind === "wall-hug") {
        draft.wallHugEventCount += 1;
      } else {
        draft.nearFaceTurnEventCount += 1;
      }
      draft.qualityCost += event.cost;
      for (const visit of event.visits ?? []) {
        if (visit.routeIndex === routeIndex) {
          addVisitPortals(draft.portalEventCounts, route, visit.visitIndex);
        }
      }
    }
  }
  function addCrossingDemand(drafts, routes, routeIndex, visitIndex, partnerRouteIndex) {
    const draft = drafts[routeIndex];
    draft.crossingEventCount += 1;
    draft.partners.add(partnerRouteIndex);
    const route = routes[routeIndex];
    addVisitPortals(draft.portalEventCounts, route, visitIndex);
    const visit = route.visits[visitIndex];
    if (visit) {
      addCorridorDemand(draft, visit.corridorIndex, ROUTING_QUALITY_COSTS.crossing);
    }
  }
  function addAttributedCorridorDemands(drafts, routes, event) {
    const seen = /* @__PURE__ */ new Set();
    for (const visitRef2 of event.visits ?? []) {
      const draft = drafts[visitRef2.routeIndex];
      const visit = routes[visitRef2.routeIndex]?.visits[visitRef2.visitIndex];
      if (!draft || !visit) {
        continue;
      }
      const key = `${visitRef2.routeIndex}:${visit.corridorIndex}`;
      if (!seen.has(key)) {
        seen.add(key);
        addCorridorDemand(draft, visit.corridorIndex, event.cost);
      }
    }
  }
  function addCorridorDemand(draft, corridorIndex, cost) {
    const demand = draft.corridorDemands.get(corridorIndex);
    draft.corridorDemands.set(corridorIndex, {
      corridorIndex,
      eventCount: (demand?.eventCount ?? 0) + 1,
      cost: (demand?.cost ?? 0) + cost
    });
  }
  function addVisitPortals(counts, route, visitIndex) {
    const visit = route.visits[visitIndex];
    if (!visit) {
      return;
    }
    const portalIndexes = /* @__PURE__ */ new Set();
    for (const boundary of [visit.entry, visit.exit]) {
      if (boundary.kind === "portal") {
        portalIndexes.add(boundary.portalIndex);
      }
    }
    for (const portalIndex of portalIndexes) {
      counts.set(portalIndex, (counts.get(portalIndex) ?? 0) + 1);
    }
  }
  function compareRouteDemands(left, right) {
    return right.wallTouchEventCount - left.wallTouchEventCount || right.terminalDirectionEventCount - left.terminalDirectionEventCount || compareNumber(right.qualityCost, left.qualityCost, EPSILON11) || right.wallHugEventCount - left.wallHugEventCount || right.nearFaceTurnEventCount - left.nearFaceTurnEventCount || right.portCenteringEventCount - left.portCenteringEventCount || Number(right.topologyQualityEventCount > 0) - Number(left.topologyQualityEventCount > 0) || right.topologyQualityEventCount - left.topologyQualityEventCount || right.crossingEventCount - left.crossingEventCount || right.partners.size - left.partners.size || left.requestIndex - right.requestIndex || left.routeIndex - right.routeIndex;
  }

  // packages/layout/src/routing/measure/crossings.ts
  function faceChordsCross(left, right) {
    const leftSideA = orientation(left.from, left.to, right.from);
    const leftSideB = orientation(left.from, left.to, right.to);
    const rightSideA = orientation(right.from, right.to, left.from);
    const rightSideB = orientation(right.from, right.to, left.to);
    if (leftSideA * leftSideB >= -EPS || rightSideA * rightSideB >= -EPS) {
      return false;
    }
    const intersection = segmentIntersection(left.from, left.to, right.from, right.to);
    return Boolean(
      intersection && facePointsToward(left.from, left.fromFace, intersection) && facePointsToward(left.to, left.toFace, intersection) && facePointsToward(right.from, right.fromFace, intersection) && facePointsToward(right.to, right.toFace, intersection)
    );
  }
  function orientation(from, to, point) {
    return (to.x - from.x) * (point.y - from.y) - (to.y - from.y) * (point.x - from.x);
  }
  function segmentIntersection(leftFrom, leftTo, rightFrom, rightTo) {
    const leftX = leftTo.x - leftFrom.x;
    const leftY = leftTo.y - leftFrom.y;
    const rightX = rightTo.x - rightFrom.x;
    const rightY = rightTo.y - rightFrom.y;
    const denominator = leftX * rightY - leftY * rightX;
    if (Math.abs(denominator) <= EPS) {
      return void 0;
    }
    const offsetX = rightFrom.x - leftFrom.x;
    const offsetY = rightFrom.y - leftFrom.y;
    const leftTravel = (offsetX * rightY - offsetY * rightX) / denominator;
    return { x: leftFrom.x + leftTravel * leftX, y: leftFrom.y + leftTravel * leftY };
  }
  function facePointsToward(from, face, target) {
    switch (face) {
      case "left":
        return target.x < from.x - EPS;
      case "right":
        return target.x > from.x + EPS;
      case "up":
        return target.y < from.y - EPS;
      case "down":
        return target.y > from.y + EPS;
    }
  }

  // packages/layout/src/routing/corridor/crossingClassification.ts
  function unexpectedCrossings(world, routes, crossings) {
    const pairCounts = /* @__PURE__ */ new Map();
    for (const crossing of crossings) {
      const key = pairKey(crossing, routes.length);
      pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
    }
    const expectedPairs = /* @__PURE__ */ new Set();
    for (const crossing of crossings) {
      const key = pairKey(crossing, routes.length);
      if (pairCounts.get(key) !== 1 || expectedPairs.has(key)) {
        continue;
      }
      const routeA = routes[crossing.a.routeIndex];
      const routeB = routes[crossing.b.routeIndex];
      if (routeA && routeB && faceChordsCross(routeChord(world, routeA), routeChord(world, routeB))) {
        expectedPairs.add(key);
      }
    }
    return expectedPairs.size === 0 ? [...crossings] : crossings.filter((crossing) => !expectedPairs.has(pairKey(crossing, routes.length)));
  }
  function pairKey(crossing, routeCount) {
    const lower = Math.min(crossing.a.routeIndex, crossing.b.routeIndex);
    const upper = Math.max(crossing.a.routeIndex, crossing.b.routeIndex);
    return lower * routeCount + upper;
  }
  function routeChord(world, route) {
    return {
      from: faceCenter(world.entities[route.from.entityIndex], route.from.face),
      fromFace: route.from.face,
      to: faceCenter(world.entities[route.to.entityIndex], route.to.face),
      toFace: route.to.face
    };
  }
  function faceCenter(entity, face) {
    switch (face) {
      case "left":
        return { x: entity.x, y: entity.y + entity.height / 2 };
      case "right":
        return { x: entity.x + entity.width, y: entity.y + entity.height / 2 };
      case "up":
        return { x: entity.x + entity.width / 2, y: entity.y };
      case "down":
        return { x: entity.x + entity.width / 2, y: entity.y + entity.height };
    }
  }

  // packages/layout/src/routing/corridor/repairAcceptance.ts
  function violatesRepairIdentity(candidateRoutes, candidateLeafCuts, incumbentLeafCuts) {
    for (const cut of candidateLeafCuts) {
      if (!incumbentLeafCuts.has(cut)) {
        return true;
      }
    }
    return !authoredEndpointsIntact(candidateRoutes);
  }

  // packages/layout/src/PriorityQueue.ts
  var PriorityQueue = class {
    constructor(compareTies) {
      this.compareTies = compareTies;
      __publicField(this, "values", []);
      __publicField(this, "priorities", new Float64Array(1024));
      __publicField(this, "len", 0);
    }
    get length() {
      return this.len;
    }
    push(value, priority) {
      let index = this.len++;
      if (index >= this.priorities.length) {
        this.grow();
      }
      while (index > 0) {
        const parent = index - 1 >> 1;
        const parentPriority = this.priorities[parent];
        if (priority > parentPriority) {
          break;
        }
        if (priority === parentPriority && (!this.compareTies || this.compareTies(value, this.values[parent]) >= 0)) {
          break;
        }
        this.values[index] = this.values[parent];
        this.priorities[index] = this.priorities[parent];
        index = parent;
      }
      this.values[index] = value;
      this.priorities[index] = priority;
    }
    pop() {
      if (this.len === 0) {
        return void 0;
      }
      const min = this.values[0];
      const value = this.values[--this.len];
      const priority = this.priorities[this.len];
      let index = 0;
      let child = 1;
      while (child < this.len) {
        if (child + 1 < this.len) {
          const right = child + 1;
          const leftPriority = this.priorities[child];
          const rightPriority = this.priorities[right];
          if (rightPriority < leftPriority || rightPriority === leftPriority && this.compareTies && this.compareTies(this.values[right], this.values[child]) <= 0) {
            child = right;
          }
        }
        const childPriority = this.priorities[child];
        if (priority < childPriority) {
          break;
        }
        if (priority === childPriority && (!this.compareTies || this.compareTies(value, this.values[child]) <= 0)) {
          break;
        }
        this.values[index] = this.values[child];
        this.priorities[index] = this.priorities[child];
        index = child;
        child = (child << 1) + 1;
      }
      this.values[index] = value;
      this.priorities[index] = priority;
      return min;
    }
    isEmpty() {
      return this.len === 0;
    }
    getSize() {
      return this.len;
    }
    peek() {
      return this.len > 0 ? this.values[0] : void 0;
    }
    grow() {
      const oldCapacity = this.priorities.length;
      const newCapacity = oldCapacity > 0 ? oldCapacity << 1 : 16;
      const priorities = new Float64Array(newCapacity);
      priorities.set(this.priorities);
      this.priorities = priorities;
      this.values.length = newCapacity;
    }
  };

  // packages/layout/src/routing/corridor/sortedArrayUtils.ts
  function lowerBound(values, value, from = 0) {
    let low = from;
    let high = values.length;
    while (low < high) {
      const mid = low + high >> 1;
      if (values[mid] < value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  function upperBound(values, value, from = 0) {
    let low = from;
    let high = values.length;
    while (low < high) {
      const mid = low + high >> 1;
      if (values[mid] <= value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  function lowerBoundInt32(coords, value) {
    let low = 0;
    let high = coords.length;
    while (low < high) {
      const mid = low + high >> 1;
      if (coords[mid] < value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  function upperBoundInt32(coords, value) {
    let low = 0;
    let high = coords.length;
    while (low < high) {
      const mid = low + high >> 1;
      if (coords[mid] <= value) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  }
  function insertAt(array, index, item) {
    array.push(item);
    array.copyWithin(index + 1, index);
    array[index] = item;
  }
  function insertIntoSortedBy(sorted, item, compare) {
    let low = 0;
    let high = sorted.length;
    while (low < high) {
      const mid = low + high >> 1;
      if (compare(sorted[mid], item) <= 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    insertAt(sorted, low, item);
  }
  function addUniqueNumber(sorted, num, initialIdx) {
    const idx = lowerBound(sorted, num, initialIdx);
    if (idx < sorted.length && sorted[idx] === num) {
      return -1;
    }
    insertAt(sorted, idx, num);
    return idx;
  }
  function sortedUnique(values) {
    values.sort((left, right) => left - right);
    const kept = [];
    for (const value of values) {
      if (kept.length === 0 || value !== kept[kept.length - 1]) {
        kept.push(value);
      }
    }
    return kept;
  }

  // packages/layout/src/routing/corridor/freeSpaceSubstrate.ts
  var compareObstacles = (left, right) => left.crossStart - right.crossStart || left.crossEnd - right.crossEnd;
  function buildFreeSpaceSubstrate(bounds, entities) {
    return {
      x: buildAxisFreeSpace(bounds, entities, "x"),
      y: buildAxisFreeSpace(bounds, entities, "y")
    };
  }
  function buildAxisFreeSpace(bounds, entities, axis) {
    const travelStart = axis === "x" ? bounds.x : bounds.y;
    const travelEnd = travelStart + (axis === "x" ? bounds.width : bounds.height);
    const crossStart = axis === "x" ? bounds.y : bounds.x;
    const crossEnd = crossStart + (axis === "x" ? bounds.height : bounds.width);
    const travelCuts = [travelStart, travelEnd];
    const obstacles = [];
    for (const entity of entities) {
      appendRect(entity, entity.isContainer !== true, axis, travelCuts, obstacles);
      const text = touchExternalTextRangeToEntityClippedToBodyFace(entity);
      if (text) {
        appendRect(text, true, axis, travelCuts, obstacles);
      }
    }
    const starts = /* @__PURE__ */ new Map();
    const ends = /* @__PURE__ */ new Map();
    for (const obstacle of obstacles) {
      appendValue(starts, obstacle.travelStart, obstacle);
      appendValue(ends, obstacle.travelEnd, obstacle);
    }
    const active = [];
    const slabOffsets = new Uint32Array(travelCuts.length);
    const crossSpans = [];
    for (let index = 0; index < travelCuts.length - 1; index += 1) {
      const start = travelCuts[index];
      for (const obstacle of ends.get(start) ?? []) {
        const activeIndex = active.indexOf(obstacle);
        if (activeIndex >= 0) {
          active.splice(activeIndex, 1);
        }
      }
      for (const obstacle of starts.get(start) ?? []) {
        insertIntoSortedBy(active, obstacle, compareObstacles);
      }
      slabOffsets[index] = crossSpans.length >>> 1;
      appendFreeCrossSpans(crossSpans, crossStart, crossEnd, active);
    }
    slabOffsets[travelCuts.length - 1] = crossSpans.length >>> 1;
    return {
      travelCuts: Int32Array.from(travelCuts),
      slabOffsets,
      crossSpans: Int32Array.from(crossSpans)
    };
  }
  function appendRect(rect, blocks, axis, cutValues, obstacles) {
    const rectTravelStart = axis === "x" ? rect.x : rect.y;
    const rectTravelEnd = rectTravelStart + (axis === "x" ? rect.width : rect.height);
    addUniqueNumber(cutValues, rectTravelStart, 0);
    addUniqueNumber(cutValues, rectTravelEnd, 0);
    if (!blocks) {
      return;
    }
    const rectCrossStart = axis === "x" ? rect.y : rect.x;
    obstacles.push({
      travelStart: rectTravelStart,
      travelEnd: rectTravelEnd,
      crossStart: rectCrossStart,
      crossEnd: rectCrossStart + (axis === "x" ? rect.height : rect.width)
    });
  }
  function appendValue(map, key, value) {
    const values = map.get(key);
    if (values) {
      values.push(value);
    } else {
      map.set(key, [value]);
    }
  }
  function slabContainsSpan(lane, slabIndex, span) {
    for (let intervalIndex = lane.slabOffsets[slabIndex]; intervalIndex < lane.slabOffsets[slabIndex + 1]; intervalIndex += 1) {
      const start = lane.crossSpans[intervalIndex * 2];
      const end = lane.crossSpans[intervalIndex * 2 + 1];
      if (start <= span[0] && end >= span[1]) {
        return true;
      }
      if (start > span[0]) {
        break;
      }
    }
    return false;
  }
  function firstSlabEndingBeyond(cuts, coord) {
    const low = upperBoundInt32(cuts, coord);
    return low > 0 ? low - 1 : 0;
  }
  function lastSlabStartingBefore(cuts, coord) {
    return lowerBoundInt32(cuts, coord) - 1;
  }
  function certifiedRunFrom(lane, plane, cross2, sign, cap) {
    const cuts = lane.travelCuts;
    let reached = plane;
    if (sign > 0) {
      for (let slab = firstSlabEndingBeyond(cuts, reached); slab < cuts.length - 1; slab += 1) {
        if (cuts[slab + 1] <= reached) {
          continue;
        }
        if (cuts[slab] > reached || !slabContainsSpan(lane, slab, cross2)) {
          break;
        }
        reached = Math.min(cuts[slab + 1], cap);
        if (reached >= cap) {
          break;
        }
      }
      return reached;
    }
    for (let slab = Math.min(lastSlabStartingBefore(cuts, reached), cuts.length - 2); slab >= 0; slab -= 1) {
      if (cuts[slab] >= reached) {
        continue;
      }
      if (cuts[slab + 1] < reached || !slabContainsSpan(lane, slab, cross2)) {
        break;
      }
      reached = Math.max(cuts[slab], cap);
      if (reached <= cap) {
        break;
      }
    }
    return reached;
  }
  function appendFreeCrossSpans(result, crossStart, crossEnd, obstacles) {
    let cursor = crossStart;
    for (const obstacle of obstacles) {
      const start = Math.max(crossStart, obstacle.crossStart);
      if (start > cursor) {
        result.push(cursor, Math.min(start, crossEnd));
      }
      cursor = Math.max(cursor, obstacle.crossEnd);
      if (cursor >= crossEnd) {
        return;
      }
    }
    if (cursor < crossEnd) {
      result.push(cursor, crossEnd);
    }
  }

  // packages/layout/src/routing/corridor/world.ts
  var ROOT_BOUNDS_MARGIN_PX = 20;
  var PORTAL_SEARCH_TIER_PREFERRED = 0;
  var PORTAL_SEARCH_TIER_ESCAPE = 1;
  var ORDERED_FACES = ["up", "right", "down", "left"];
  function terminalFaceRouteCount(world, endpoint) {
    return world.terminalFaceRouteCounts?.[endpoint.entityIndex * ORDERED_FACES.length + faceOrder(endpoint.face)] ?? 0;
  }
  function prefersSingletonContainerCenter(world, endpoint, opposite) {
    const entity = world.entities[endpoint.entityIndex];
    if (entity.isContainer !== true || terminalFaceRouteCount(world, endpoint) !== 1) {
      return false;
    }
    if (faceNormalAxis(endpoint.face) !== faceNormalAxis(opposite.face)) {
      return true;
    }
    return facePlane(entity, endpoint.face) !== facePlane(world.entities[opposite.entityIndex], opposite.face);
  }
  function buildTerminalFaceRouteCounts(entityCount, requests) {
    const counts = new Uint16Array(entityCount * ORDERED_FACES.length);
    for (const request of requests) {
      for (const endpoint of [request.from, request.to]) {
        counts[endpoint.entityIndex * ORDERED_FACES.length + faceOrder(endpoint.face)] += 1;
      }
    }
    return counts;
  }
  function buildBaseCorridorGeometry(layoutManager) {
    const entities = layoutManager.getEntities();
    const bounds = makePropsFromRange(
      addBufferToRange(layoutManager.getDims(), ROOT_BOUNDS_MARGIN_PX)
    );
    return { bounds, freeSpace: buildFreeSpaceSubstrate(bounds, entities) };
  }
  function buildTerminalAttachments(entities, corridors, requests) {
    const requestedFaces = new Uint8Array(entities.length * ORDERED_FACES.length);
    for (const request of requests) {
      for (const endpoint of [request.from, request.to]) {
        requestedFaces[endpoint.entityIndex * ORDERED_FACES.length + faceOrder(endpoint.face)] = 1;
      }
    }
    const indexByAxis = {
      x: buildCorridorStabbingIndex(corridors, "x"),
      y: buildCorridorStabbingIndex(corridors, "y")
    };
    const attachments = [];
    for (let entityIndex = 0; entityIndex < entities.length; entityIndex += 1) {
      for (let faceIndex = 0; faceIndex < ORDERED_FACES.length; faceIndex += 1) {
        if (requestedFaces[entityIndex * ORDERED_FACES.length + faceIndex] === 0) {
          continue;
        }
        const face = ORDERED_FACES[faceIndex];
        const entity = entities[entityIndex];
        const plane = terminalFacePlane(entity, face);
        const faceSpan = faceCrossSpan(entity, face);
        const axis = faceNormalAxis(face);
        for (const position of collectStabbedCorridorPositions(indexByAxis[axis], plane)) {
          const corridor = corridors[position];
          const travelSpan = corridorTravelSpan(corridor);
          if (!coordinateInSpan(plane, travelSpan, 0) || !extendsOutward(travelSpan, plane, face)) {
            continue;
          }
          const sharedSpan = intersectPositiveSpans(faceSpan, corridorCrossSpan(corridor), 0);
          if (sharedSpan) {
            attachments.push({
              index: attachments.length,
              entityIndex,
              face,
              corridorIndex: corridor.index,
              faceSpan: sharedSpan
            });
          }
        }
      }
    }
    return attachments;
  }
  var STABBING_CANDIDATE_SLACK = 1e-3;
  function buildCorridorStabbingIndex(corridors, axis) {
    const entries = [];
    for (let position = 0; position < corridors.length; position += 1) {
      const corridor = corridors[position];
      if (corridor.axis !== axis) {
        continue;
      }
      const travelSpan = corridorTravelSpan(corridor);
      entries.push({ position, start: travelSpan[0], end: travelSpan[1] });
    }
    entries.sort((left, right) => left.start - right.start);
    const size = entries.length;
    let leafBase = 1;
    while (leafBase < size) {
      leafBase *= 2;
    }
    const positions = new Int32Array(size);
    const starts = new Float64Array(size);
    const maxEnds = new Float64Array(2 * leafBase).fill(Number.NEGATIVE_INFINITY);
    entries.forEach((entry, sortedIndex) => {
      positions[sortedIndex] = entry.position;
      starts[sortedIndex] = entry.start;
      maxEnds[leafBase + sortedIndex] = entry.end;
    });
    for (let node = leafBase - 1; node >= 1; node -= 1) {
      maxEnds[node] = Math.max(maxEnds[2 * node], maxEnds[2 * node + 1]);
    }
    return { positions, starts, leafBase, maxEnds };
  }
  function collectStabbedCorridorPositions(index, plane) {
    const startLimit = plane + STABBING_CANDIDATE_SLACK;
    const minEnd = plane - STABBING_CANDIDATE_SLACK;
    const sortedLimit = countStartsAtMost(index.starts, startLimit);
    const positions = [];
    if (sortedLimit === 0) {
      return positions;
    }
    const collect = (node, nodeLo, nodeSize) => {
      if (nodeLo >= sortedLimit || index.maxEnds[node] < minEnd) {
        return;
      }
      if (nodeSize === 1) {
        positions.push(index.positions[nodeLo]);
        return;
      }
      const half = nodeSize / 2;
      collect(2 * node, nodeLo, half);
      collect(2 * node + 1, nodeLo + half, half);
    };
    collect(1, 0, index.leafBase);
    positions.sort((left, right) => left - right);
    return positions;
  }
  function countStartsAtMost(starts, limit) {
    let lo = 0;
    let hi = starts.length;
    while (lo < hi) {
      const mid = lo + hi >> 1;
      if (starts[mid] <= limit) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }
  function extendsOutward(travelSpan, plane, face) {
    return face === "right" || face === "down" ? travelSpan[1] > plane : travelSpan[0] < plane;
  }

  // packages/layout/src/routing/corridor/topology.ts
  var EPSILON12 = 1e-6;
  var NARROW_SECTION_TARGET_PX = 24;
  var NARROW_SECTION_WEIGHT = 1;
  var NARROW_WALL_CLEARANCE_TARGET_PX = 16;
  var INTERMEDIATE_TURN_NARROWING_WEIGHT = 4;
  var INTERMEDIATE_TURN_MIN_ONWARD_TRAVEL_PX = 8;
  var TERMINAL_TRANSITION_MIN_CAPACITY_PX = 8;
  var TERMINAL_TRANSITION_MAX_FACE_PX = 50;
  var TERMINAL_ALIGNMENT_REFERENCE_FACE_PX = 200;
  var TERMINAL_ALIGNMENT_WEIGHT = 0.9;
  var SINGLETON_TERMINAL_ALIGNMENT_WEIGHT = 1.5;
  var TERMINAL_ALIGNMENT_EDGE_WEIGHT = 2;
  var TERMINAL_ATTACHMENT_ALIGNMENT_WEIGHT = 1e-3;
  var TERMINAL_TURN_CORNER_CLEARANCE_PX = 5;
  var STRAIGHT_TERMINAL_FREE_MISALIGNMENT_PX = 32;
  var STRAIGHT_TERMINAL_MISALIGNMENT_WEIGHT = 5;
  var STRAIGHT_TERMINAL_FULL_WEIGHT_GAP_PX = 40;
  var STRAIGHT_TERMINAL_ZERO_WEIGHT_GAP_PX = 80;
  var WIDE_COLUMN_ALIGNMENT_MIN_FACE_PX = 160;
  var MAX_ROUTE_EXPANSIONS = 5e4;
  function dominates(dominator, contender, corridor) {
    return dominator.bendCount + dominator.predictedBendCount === 0 === (contender.bendCount + contender.predictedBendCount === 0) && spanContains(dominator.feasibleTrack, contender.feasibleTrack, EPSILON12) && dominator.cost + sectionTravelCost(
      corridor,
      dominator.representativeX,
      dominator.representativeY,
      contender.representativeX,
      contender.representativeY
    ) <= contender.cost + EPSILON12;
  }
  function crossOf(axis, label) {
    return axis === "x" ? label.representativeY : label.representativeX;
  }
  function travelOf(axis, label) {
    return axis === "x" ? label.representativeX : label.representativeY;
  }
  function pushDistinct(values, candidate) {
    if (!values.some((value) => Math.abs(value - candidate) <= EPSILON12)) {
      values.push(candidate);
    }
  }
  function requestEndpointCorridorIndexes(world, request, hiddenAttachmentIndexes) {
    const result = /* @__PURE__ */ new Set();
    for (const endpoint of [request.from, request.to]) {
      for (const attachmentIndex of world.indexer.attachmentsForEndpoint(endpoint)) {
        if (hiddenAttachmentIndexes?.has(attachmentIndex)) {
          continue;
        }
        result.add(world.indexer.attachments[attachmentIndex].corridorIndex);
      }
    }
    return result;
  }
  function continuationBendPenalty(world, endpointCorridorIndexes, portal) {
    if (endpointCorridorIndexes.has(portal.negativeCorridorIndex) === endpointCorridorIndexes.has(portal.positiveCorridorIndex)) {
      return 0;
    }
    const negativeSpan = corridorCrossSpan(world.indexer.corridors[portal.negativeCorridorIndex]);
    const positiveSpan = corridorCrossSpan(world.indexer.corridors[portal.positiveCorridorIndex]);
    if (spanContains(negativeSpan, positiveSpan, EPSILON12) || spanContains(positiveSpan, negativeSpan, EPSILON12)) {
      return 0;
    }
    return 2;
  }
  function searchRoute(world, request, options = {}) {
    const source = resolveEndpoint(world, request.from, options.hiddenAttachmentIndexes);
    const target = resolveEndpoint(world, request.to, options.hiddenAttachmentIndexes);
    const endpointCorridorIndexes = requestEndpointCorridorIndexes(
      world,
      request,
      options.hiddenAttachmentIndexes
    );
    const runs = [];
    if (source.attachments.length === 0 || target.attachments.length === 0) {
      return fallbackResult(
        request,
        source.attachments.length === 0 ? "no-source-attachment" : "no-target-attachment",
        "preferred",
        runs
      );
    }
    let searchPass = "preferred";
    let run = runSearch(
      world,
      source,
      target,
      endpointCorridorIndexes,
      PORTAL_SEARCH_TIER_PREFERRED,
      options.hiddenPortalIndexes,
      options.requiredCorridorIndex,
      options.corridorEntryPenalties,
      options.preferCenteredTerminalAttachments !== false
    );
    runs.push(run);
    if (!run.hit && !run.exhaustedBudget && hasVisibleEscapePortals(world, options.hiddenPortalIndexes)) {
      searchPass = "escape";
      run = runSearch(
        world,
        source,
        target,
        endpointCorridorIndexes,
        PORTAL_SEARCH_TIER_ESCAPE,
        options.hiddenPortalIndexes,
        options.requiredCorridorIndex,
        options.corridorEntryPenalties,
        options.preferCenteredTerminalAttachments !== false
      );
      runs.push(run);
    }
    if (!run.hit) {
      return fallbackResult(
        request,
        run.exhaustedBudget ? "search-budget" : "unreachable",
        searchPass,
        runs
      );
    }
    const corridorPenalty = run.hit.corridorPenalty ?? 0;
    const portalPenalty = run.hit.portalPenalty ?? 0;
    const cost = {
      distance: run.hit.distance,
      bendCount: run.hit.bendCount,
      narrow: run.hit.narrow,
      terminal: run.hit.terminal,
      ...corridorPenalty > EPSILON12 ? { corridorPenalty } : {},
      ...portalPenalty > EPSILON12 ? { portalPenalty } : {},
      total: run.hit.total
    };
    return {
      route: new Route(
        request.requestIndex,
        request.from,
        request.to,
        buildVisits(world, run.labels, run.hit, source, target)
      ),
      fallback: false,
      cost,
      searchPass,
      metrics: metrics(runs)
    };
  }
  function runSearch(world, source, target, endpointCorridorIndexes, maximumPortalTier, hiddenPortalIndexes, requiredCorridorIndex, corridorEntryPenalties, preferCenteredTerminalAttachments) {
    const { indexer } = world;
    const hasEndpointMarkerMetadata = source.endpoint.hasArrowhead !== void 0 || target.endpoint.hasArrowhead !== void 0;
    const sharedTerminalAlignmentWeight = shortTerminalGapWeight(source, target);
    const wideColumnTerminalAlignmentWeight = (endpoint) => {
      const entity = world.entities[endpoint.endpoint.entityIndex];
      const faceSpan = faceCrossSpan(entity, endpoint.endpoint.face);
      return entity.isContainer !== true && (endpoint.endpoint.face === "left" || endpoint.endpoint.face === "right") && faceSpan[1] - faceSpan[0] >= WIDE_COLUMN_ALIGNMENT_MIN_FACE_PX - EPSILON12 ? 1 : 0;
    };
    const terminalAlignmentWeight = (endpoint) => !hasEndpointMarkerMetadata || world.entities[endpoint.endpoint.entityIndex].isContainer === true ? sharedTerminalAlignmentWeight : Math.max(sharedTerminalAlignmentWeight, wideColumnTerminalAlignmentWeight(endpoint));
    const forceDirectContainerCentering = alignedTerminalCenters(world, source, target);
    const sourceAlignment = {
      endpoint: source,
      centering: prefersSingletonContainerCenter(world, source.endpoint, target.endpoint)
    };
    const targetAlignment = {
      endpoint: target,
      centering: prefersSingletonContainerCenter(world, target.endpoint, source.endpoint)
    };
    const terminalCost = ({ endpoint, centering }, track) => terminalAlignmentWeight(endpoint) * terminalAlignmentCost(endpoint, track, centering);
    const directTerminalCost = ({ endpoint, centering }, track) => (forceDirectContainerCentering ? 1 : terminalAlignmentWeight(endpoint)) * terminalAlignmentCost(endpoint, track, centering);
    const terminalAttachmentCost = ({ endpoint, centering }, attachment) => {
      if (!preferCenteredTerminalAttachments) {
        return 0;
      }
      const center2 = preferredEndpointTrack(endpoint);
      if (center2 >= attachment.faceSpan[0] - EPSILON12 && center2 <= attachment.faceSpan[1] + EPSILON12) {
        return 0;
      }
      return TERMINAL_ATTACHMENT_ALIGNMENT_WEIGHT * terminalAlignmentCost(endpoint, clampToSpan(center2, attachment.faceSpan), centering);
    };
    const labels = [];
    const liveByState = new Array(indexer.corridors.length * 2);
    const targetsByCorridor = new Array(
      indexer.corridors.length
    );
    const queue = new PriorityQueue((left, right) => left - right);
    for (const attachment of target.attachments) {
      const targets = targetsByCorridor[attachment.corridorIndex] ?? [];
      targets.push(attachment);
      targetsByCorridor[attachment.corridorIndex] = targets;
    }
    let expansions = 0;
    let maxQueue = 0;
    let maxLabelsPerCorridor = 0;
    let hit;
    let exhaustedBudget = false;
    const addLabel = (corridorIndex, feasibleTrack, representativeX, representativeY, distance, bendCount, predictedBendCount, sourceTerminal, corridorPenalty, portalPenalty, cost, cameFrom, entry, requiredCorridorVisited) => {
      const stateIndex = corridorIndex * 2 + Number(requiredCorridorVisited);
      const live = liveByState[stateIndex] ?? [];
      const corridor = indexer.corridors[corridorIndex];
      const candidate = {
        feasibleTrack,
        representativeX,
        representativeY,
        bendCount,
        predictedBendCount,
        cost
      };
      for (const otherId of live) {
        const other = labels[otherId];
        if (!other.dead && dominates(other, candidate, corridor)) {
          return;
        }
      }
      const id = labels.length;
      const label = {
        corridorIndex,
        feasibleTrack,
        representativeX,
        representativeY,
        distance,
        bendCount,
        predictedBendCount,
        sourceTerminal,
        corridorPenalty,
        portalPenalty,
        cost,
        estimatedTotal: cost + distanceToEndpoint(representativeX, representativeY, target),
        cameFrom,
        entry,
        requiredCorridorVisited,
        dead: false
      };
      labels.push(label);
      let survivorCount = 0;
      for (const otherId of live) {
        const other = labels[otherId];
        if (other.dead) {
          continue;
        }
        if (dominates(candidate, other, corridor)) {
          other.dead = true;
        } else {
          live[survivorCount] = otherId;
          survivorCount += 1;
        }
      }
      live.length = survivorCount;
      live.push(id);
      liveByState[stateIndex] = live;
      maxLabelsPerCorridor = Math.max(maxLabelsPerCorridor, live.length);
      queue.push(id, label.estimatedTotal);
      maxQueue = Math.max(maxQueue, queue.length);
    };
    for (const attachment of source.attachments) {
      const representativeTrack = clampToSpan(
        source.endpoint.authoredTrack ?? preferredEndpointTrack(source),
        attachment.faceSpan
      );
      const feasibleTrack = source.endpoint.authoredTrack === void 0 ? attachment.faceSpan : [representativeTrack, representativeTrack];
      const sourceTerminal = terminalAttachmentCost(sourceAlignment, attachment);
      const corridorPenalty = corridorEntryPenalty(
        world,
        corridorEntryPenalties,
        attachment.corridorIndex
      );
      addLabel(
        attachment.corridorIndex,
        feasibleTrack,
        source.axis === "x" ? source.plane : representativeTrack,
        source.axis === "x" ? representativeTrack : source.plane,
        0,
        0,
        0,
        sourceTerminal,
        corridorPenalty,
        0,
        sourceTerminal + corridorPenalty,
        -1,
        { kind: "terminal", attachmentIndex: attachment.index },
        requiredCorridorIndex === void 0 || attachment.corridorIndex === requiredCorridorIndex
      );
    }
    while (!queue.isEmpty()) {
      const labelId = queue.pop();
      if (labelId === void 0) {
        break;
      }
      const label = labels[labelId];
      if (label.dead) {
        continue;
      }
      if (hit && label.estimatedTotal >= hit.total - EPSILON12) {
        break;
      }
      if (expansions >= MAX_ROUTE_EXPANSIONS) {
        exhaustedBudget = true;
        break;
      }
      expansions += 1;
      const corridor = indexer.corridors[label.corridorIndex];
      const targetAttachments = targetsByCorridor[label.corridorIndex];
      if (targetAttachments && label.requiredCorridorVisited) {
        for (const attachment of targetAttachments) {
          const feasibleTrack = intersectSpans(
            label.feasibleTrack,
            endpointTrack(target, attachment),
            EPSILON12
          );
          if (!feasibleTrack || label.bendCount > 0 && target.endpoint.authoredTrack === void 0 && (feasibleTrack[1] - feasibleTrack[0] <= EPSILON12 || terminalTurnOverlapOnlyNearCorner(target, feasibleTrack))) {
            continue;
          }
          const finishCandidates = [clampToSpan(crossOf(corridor.axis, label), feasibleTrack)];
          const preferredFinish = clampToSpan(
            target.endpoint.authoredTrack ?? preferredEndpointTrack(target),
            feasibleTrack
          );
          pushDistinct(finishCandidates, preferredFinish);
          for (const finishCross of finishCandidates) {
            const finishX = corridor.axis === "x" ? target.plane : finishCross;
            const finishY = corridor.axis === "x" ? finishCross : target.plane;
            const incrementalDistance = manhattanCoords(
              label.representativeX,
              label.representativeY,
              finishX,
              finishY
            );
            const distance = label.distance + incrementalDistance;
            const sourceTerminal = label.bendCount === 0 ? label.sourceTerminal + directTerminalCost(sourceAlignment, finishCross) : label.sourceTerminal;
            const targetTerminal = terminalAttachmentCost(targetAlignment, attachment) + (label.bendCount === 0 ? directTerminalCost(targetAlignment, finishCross) : terminalCost(targetAlignment, finishCross));
            const straightTerminal = label.bendCount === 0 ? straightTerminalAlignmentCost(source, target) : 0;
            const terminal = sourceTerminal + targetTerminal + straightTerminal;
            const corridorPenalty = label.corridorPenalty;
            const portalPenalty = label.portalPenalty;
            const total = label.cost - label.sourceTerminal + sourceTerminal + sectionTravelCost(
              corridor,
              label.representativeX,
              label.representativeY,
              finishX,
              finishY
            ) + targetTerminal + straightTerminal;
            if (!hit || total < hit.total - EPSILON12) {
              hit = {
                labelId,
                attachment,
                distance,
                bendCount: label.bendCount,
                narrow: Math.max(
                  0,
                  total - distance - ordinaryBendCost(label.bendCount) - terminal - corridorPenalty - portalPenalty
                ),
                terminal,
                corridorPenalty,
                portalPenalty,
                total
              };
            }
          }
        }
      }
      for (const portal of indexer.portalsFrom(label.corridorIndex)) {
        if (hiddenPortalIndexes?.has(portal.index) || (world.portalSearchTiers?.[portal.index] ?? PORTAL_SEARCH_TIER_PREFERRED) > maximumPortalTier) {
          continue;
        }
        if (portal.kind === "continue") {
          if (reversesAtContinuationPlane(world, label.entry, portal)) {
            continue;
          }
          const reachableTrack2 = intersectSpans(label.feasibleTrack, portal.crossSpan, EPSILON12);
          if (!reachableTrack2) {
            continue;
          }
          const continueTrack = clampToSpan(crossOf(corridor.axis, label), reachableTrack2);
          const plane = portal.planeCoordinate;
          if (!continuesOutwardFromSource(source, label, corridor, plane)) {
            continue;
          }
          const continueX = corridor.axis === "x" ? plane : continueTrack;
          const continueY = corridor.axis === "x" ? continueTrack : plane;
          const otherCorridorIndex2 = indexer.otherCorridorIndex(portal, label.corridorIndex);
          const corridorPenalty2 = corridorEntryPenalty(
            world,
            corridorEntryPenalties,
            otherCorridorIndex2
          );
          const addedPredictedBends = continuationBendPenalty(world, endpointCorridorIndexes, portal);
          const currentTotalBends = label.bendCount + label.predictedBendCount;
          const nextPredictedBendCount = label.predictedBendCount + addedPredictedBends;
          const bendIncrement = ordinaryBendCost(currentTotalBends + addedPredictedBends) - ordinaryBendCost(currentTotalBends);
          const portalPenalty = ordinaryBendCost(label.bendCount + nextPredictedBendCount) - ordinaryBendCost(label.bendCount);
          const incrementalDistance = manhattanCoords(
            label.representativeX,
            label.representativeY,
            continueX,
            continueY
          );
          addLabel(
            otherCorridorIndex2,
            reachableTrack2,
            continueX,
            continueY,
            label.distance + incrementalDistance,
            label.bendCount,
            nextPredictedBendCount,
            label.sourceTerminal,
            label.corridorPenalty + corridorPenalty2,
            portalPenalty,
            label.cost + sectionTravelCost(
              corridor,
              label.representativeX,
              label.representativeY,
              continueX,
              continueY
            ) + terminalTransitionTrackNarrowingCost(source, label, reachableTrack2) + bendIncrement + corridorPenalty2,
            labelId,
            { kind: "portal", portalIndex: portal.index, mode: "continue-straight" },
            label.requiredCorridorVisited || otherCorridorIndex2 === requiredCorridorIndex
          );
          continue;
        }
        const reachableTrack = intersectSpans(
          label.feasibleTrack,
          portalCrossSpan(portal, corridor.axis),
          EPSILON12
        );
        if (!reachableTrack || reachableTrack[1] - reachableTrack[0] <= EPSILON12 && (label.bendCount > 0 || source.endpoint.authoredTrack === void 0) || label.bendCount === 0 && source.endpoint.authoredTrack === void 0 && terminalTurnOverlapOnlyNearCorner(source, reachableTrack)) {
          continue;
        }
        const portalTravel = portalTravelSpan(portal, corridor.axis);
        const turnCross = clampToSpan(crossOf(corridor.axis, label), reachableTrack);
        const otherCorridorIndex = indexer.otherCorridorIndex(portal, label.corridorIndex);
        const otherCorridor = indexer.corridors[otherCorridorIndex];
        const corridorPenalty = corridorEntryPenalty(
          world,
          corridorEntryPenalties,
          otherCorridorIndex
        );
        const turnTravels = [clampToSpan(travelOf(corridor.axis, label), portalTravel)];
        for (const attachment of targetsByCorridor[otherCorridorIndex] ?? []) {
          const targetSpan = intersectSpans(portalTravel, endpointTrack(target, attachment), EPSILON12);
          if (!targetSpan) {
            continue;
          }
          const targetTrack = clampToSpan(
            target.endpoint.authoredTrack ?? preferredEndpointTrack(target),
            targetSpan
          );
          pushDistinct(turnTravels, targetTrack);
        }
        for (const turnTravel of turnTravels) {
          const turnX = corridor.axis === "x" ? turnTravel : turnCross;
          const turnY = corridor.axis === "x" ? turnCross : turnTravel;
          const incrementalDistance = manhattanCoords(
            label.representativeX,
            label.representativeY,
            turnX,
            turnY
          );
          const sourceTerminal = label.bendCount === 0 ? label.sourceTerminal + terminalCost(sourceAlignment, turnCross) : label.sourceTerminal;
          const currentTotalBends = label.bendCount + label.predictedBendCount;
          const nextBendCount = label.bendCount + 1;
          const bendIncrement = ordinaryBendCost(currentTotalBends + 1) - ordinaryBendCost(currentTotalBends);
          const portalPenalty = ordinaryBendCost(nextBendCount + label.predictedBendCount) - ordinaryBendCost(nextBendCount);
          addLabel(
            otherCorridorIndex,
            portalTravel,
            turnX,
            turnY,
            label.distance + incrementalDistance,
            nextBendCount,
            label.predictedBendCount,
            sourceTerminal,
            label.corridorPenalty + corridorPenalty,
            portalPenalty,
            label.cost + sourceTerminal - label.sourceTerminal + sectionTravelCost(
              corridor,
              label.representativeX,
              label.representativeY,
              turnX,
              turnY
            ) + terminalTransitionTrackNarrowingCost(source, label, reachableTrack) + intermediateTurnTrackNarrowingCost(label, reachableTrack, otherCorridor, portal) + bendIncrement + corridorPenalty,
            labelId,
            { kind: "portal", portalIndex: portal.index, mode: "turn" },
            label.requiredCorridorVisited || otherCorridorIndex === requiredCorridorIndex
          );
        }
      }
    }
    return {
      labels,
      hit,
      expansions,
      maxQueue,
      maxLabelsPerCorridor,
      exhaustedBudget
    };
  }
  function continuesOutwardFromSource(source, label, corridor, plane) {
    if (label.bendCount > 0 || corridor.axis !== source.axis) {
      return true;
    }
    const currentTravel = corridor.axis === "x" ? label.representativeX : label.representativeY;
    const outwardSign2 = source.endpoint.face === "left" || source.endpoint.face === "up" ? -1 : 1;
    return (plane - currentTravel) * outwardSign2 > EPSILON12;
  }
  function reversesAtContinuationPlane(world, entry, exit) {
    if (entry.kind !== "portal" || entry.mode !== "continue-straight") {
      return false;
    }
    const entryPortal = world.indexer.portals[entry.portalIndex];
    return entryPortal.kind === "continue" && entryPortal.planeCoordinate === exit.planeCoordinate;
  }
  function buildVisits(world, labels, hit, source, target) {
    const chain = [];
    for (let labelId = hit.labelId; labelId !== -1; labelId = labels[labelId].cameFrom) {
      chain.push(labels[labelId]);
    }
    chain.reverse();
    return chain.map((label, chainIndex) => {
      const next = chain[chainIndex + 1];
      if (!next) {
        const exit = {
          kind: "terminal",
          attachmentIndex: hit.attachment.index
        };
        return {
          corridorIndex: label.corridorIndex,
          entry: label.entry,
          exit,
          feasibleTrack: localVisitTrack(
            world,
            world.indexer.corridors[label.corridorIndex],
            label.entry,
            exit,
            chainIndex === 0 ? source : void 0,
            target
          )
        };
      }
      if (next.entry.kind !== "portal") {
        throw new Error("route search: label has a non-portal predecessor");
      }
      if (next.entry.mode !== "turn" && next.entry.mode !== "continue-straight") {
        throw new Error("route search: label has an unsupported predecessor mode");
      }
      const corridor = world.indexer.corridors[label.corridorIndex];
      const feasibleTrack = localVisitTrack(
        world,
        corridor,
        label.entry,
        next.entry,
        chainIndex === 0 ? source : void 0,
        void 0
      );
      return {
        corridorIndex: label.corridorIndex,
        entry: label.entry,
        exit: next.entry,
        feasibleTrack
      };
    });
  }
  function localVisitTrack(world, corridor, entry, exit, source, target) {
    let feasibleTrack = corridorCrossSpan(corridor);
    for (const boundary of [entry, exit]) {
      if (boundary.kind !== "portal") {
        continue;
      }
      const portal = world.indexer.portals[boundary.portalIndex];
      if (portal.kind === "turn") {
        feasibleTrack = requireIntersection(
          feasibleTrack,
          portalCrossSpan(portal, corridor.axis),
          `turn portal ${portal.index}`
        );
      }
    }
    if (source) {
      const attachment = terminalAttachment(world, entry, "source");
      feasibleTrack = requireIntersection(
        feasibleTrack,
        endpointTrack(source, attachment),
        "source terminal"
      );
    }
    if (target) {
      const attachment = terminalAttachment(world, exit, "target");
      feasibleTrack = requireIntersection(
        feasibleTrack,
        endpointTrack(target, attachment),
        "target terminal"
      );
    }
    return feasibleTrack;
  }
  function terminalAttachment(world, boundary, side) {
    if (boundary.kind !== "terminal") {
      throw new Error(`route search: ${side} visit has no terminal boundary`);
    }
    return world.indexer.attachments[boundary.attachmentIndex];
  }
  function requireIntersection(left, right, context) {
    const result = intersectSpans(left, right, EPSILON12);
    if (!result) {
      throw new Error(`route search: local visit lost ${context}`);
    }
    return result;
  }
  function resolveEndpoint(world, endpoint, hiddenAttachmentIndexes) {
    const entity = world.entities[endpoint.entityIndex];
    const axis = faceNormalAxis(endpoint.face);
    return {
      endpoint,
      axis,
      plane: terminalFacePlane(entity, endpoint.face),
      crossSpan: faceCrossSpan(entity, endpoint.face),
      attachments: world.indexer.attachmentsForEndpoint(endpoint).filter((attachmentIndex) => !hiddenAttachmentIndexes?.has(attachmentIndex)).map((attachmentIndex) => world.indexer.attachments[attachmentIndex])
    };
  }
  function endpointTrack(endpoint, attachment) {
    if (endpoint.endpoint.authoredTrack === void 0) {
      return attachment.faceSpan;
    }
    const track = clampToSpan(endpoint.endpoint.authoredTrack, attachment.faceSpan);
    return [track, track];
  }
  function terminalTurnOverlapOnlyNearCorner(endpoint, overlap) {
    const overlapMidpoint = midpoint(overlap);
    return overlapMidpoint <= endpoint.crossSpan[0] + TERMINAL_TURN_CORNER_CLEARANCE_PX + EPSILON12 || overlapMidpoint >= endpoint.crossSpan[1] - TERMINAL_TURN_CORNER_CLEARANCE_PX - EPSILON12;
  }
  function distanceToEndpoint(x, y, endpoint) {
    let best = Number.POSITIVE_INFINITY;
    for (const attachment of endpoint.attachments) {
      const targetSpan = endpointTrack(endpoint, attachment);
      const distance = endpoint.axis === "x" ? Math.abs(x - endpoint.plane) + distanceToSpan(y, targetSpan) : Math.abs(y - endpoint.plane) + distanceToSpan(x, targetSpan);
      best = Math.min(best, distance);
    }
    return best;
  }
  function terminalAlignmentCost(endpoint, track, singletonCenteringAllowed) {
    if (endpoint.endpoint.authoredTrack !== void 0) {
      return 0;
    }
    const faceLength = endpoint.crossSpan[1] - endpoint.crossSpan[0];
    if (faceLength <= EPSILON12) {
      return 0;
    }
    const deviation = Math.abs(track - preferredEndpointTrack(endpoint));
    const normalized = Math.min(1, deviation / (faceLength / 2));
    const faceScale = singletonCenteringAllowed ? 1 : Math.min(1, TERMINAL_ALIGNMENT_REFERENCE_FACE_PX / faceLength);
    const centerWeight = singletonCenteringAllowed ? SINGLETON_TERMINAL_ALIGNMENT_WEIGHT : TERMINAL_ALIGNMENT_WEIGHT;
    return deviation * faceScale * (centerWeight + TERMINAL_ALIGNMENT_EDGE_WEIGHT * normalized * normalized);
  }
  function straightTerminalAlignmentCost(source, target) {
    if (source.axis !== target.axis || source.endpoint.authoredTrack !== void 0 || target.endpoint.authoredTrack !== void 0) {
      return 0;
    }
    const misalignment = Math.abs(preferredEndpointTrack(source) - preferredEndpointTrack(target));
    return Math.max(0, misalignment - STRAIGHT_TERMINAL_FREE_MISALIGNMENT_PX) * STRAIGHT_TERMINAL_MISALIGNMENT_WEIGHT * shortTerminalGapWeight(source, target);
  }
  function alignedTerminalCenters(world, source, target) {
    return source.axis === target.axis && world.entities[source.endpoint.entityIndex].isContainer === true && world.entities[target.endpoint.entityIndex].isContainer === true && (terminalFaceRouteCount(world, source.endpoint) > 1 || terminalFaceRouteCount(world, target.endpoint) > 1) && Math.abs(preferredEndpointTrack(source) - preferredEndpointTrack(target)) <= EPSILON12;
  }
  function preferredEndpointTrack(endpoint) {
    return endpoint.endpoint.preferredTrack ?? midpoint(endpoint.crossSpan);
  }
  function shortTerminalGapWeight(source, target) {
    if (source.axis !== target.axis) {
      return 0;
    }
    const normalGap = Math.abs(source.plane - target.plane);
    return clampToSpan(
      (STRAIGHT_TERMINAL_ZERO_WEIGHT_GAP_PX - normalGap) / (STRAIGHT_TERMINAL_ZERO_WEIGHT_GAP_PX - STRAIGHT_TERMINAL_FULL_WEIGHT_GAP_PX),
      [0, 1]
    );
  }
  function portalCrossSpan(portal, axis) {
    return axis === "x" ? [portal.rect.y, portal.rect.y + portal.rect.height] : [portal.rect.x, portal.rect.x + portal.rect.width];
  }
  function portalTravelSpan(portal, axis) {
    return axis === "x" ? [portal.rect.x, portal.rect.x + portal.rect.width] : [portal.rect.y, portal.rect.y + portal.rect.height];
  }
  function distanceToSpan(value, span) {
    return value < span[0] ? span[0] - value : value > span[1] ? value - span[1] : 0;
  }
  function wallAdjacentLength(borders, low, high) {
    let length = 0;
    for (const border of borders) {
      if (border.kind !== "entity") {
        continue;
      }
      const overlap = Math.min(high, border.span[1]) - Math.max(low, border.span[0]);
      if (overlap > 0) {
        length += overlap;
      }
    }
    return length;
  }
  function sectionTravelCost(corridor, fromX, fromY, toX, toY) {
    const distance = manhattanCoords(fromX, fromY, toX, toY);
    const width = corridor.axis === "x" ? corridor.rect.height : corridor.rect.width;
    const clearance = width / 2;
    const deficit = Math.max(0, NARROW_WALL_CLEARANCE_TARGET_PX - clearance) / NARROW_WALL_CLEARANCE_TARGET_PX;
    if (deficit === 0 || distance === 0) {
      return distance;
    }
    const low = corridor.axis === "x" ? Math.min(fromX, toX) : Math.min(fromY, toY);
    const high = corridor.axis === "x" ? Math.max(fromX, toX) : Math.max(fromY, toY);
    const profile = corridor.borderProfile;
    const wallLength = profile.axis === "x" ? wallAdjacentLength(profile.top, low, high) + wallAdjacentLength(profile.bottom, low, high) : wallAdjacentLength(profile.left, low, high) + wallAdjacentLength(profile.right, low, high);
    return distance + 0.5 * wallLength * deficit * deficit * NARROW_SECTION_WEIGHT;
  }
  function corridorEntryPenalty(world, penalties, corridorIndex) {
    const penalty = (world.corridorEntryCosts?.[corridorIndex] ?? 0) + (penalties?.get(corridorIndex) ?? 0);
    if (!Number.isFinite(penalty) || penalty < 0) {
      throw new Error(`route search: invalid corridor ${corridorIndex} penalty ${penalty}`);
    }
    return penalty;
  }
  function terminalTransitionTrackNarrowingCost(source, label, reachable) {
    if (source.crossSpan[1] - source.crossSpan[0] > TERMINAL_TRANSITION_MAX_FACE_PX || label.bendCount !== 0 || label.entry.kind !== "terminal" || reachable[1] - reachable[0] >= TERMINAL_TRANSITION_MIN_CAPACITY_PX) {
      return 0;
    }
    return trackNarrowingCost(label.feasibleTrack, reachable);
  }
  function intermediateTurnTrackNarrowingCost(label, reachable, nextCorridor, portal) {
    if (label.entry.kind !== "portal" || label.entry.mode !== "turn" || reachable[1] - reachable[0] > EPSILON12) {
      return 0;
    }
    const nextTravel = corridorTravelSpan(nextCorridor);
    const nextPortalTravel = portalTravelSpan(portal, nextCorridor.axis);
    const onwardTravel = Math.max(
      nextPortalTravel[0] - nextTravel[0],
      nextTravel[1] - nextPortalTravel[1]
    );
    if (onwardTravel < INTERMEDIATE_TURN_MIN_ONWARD_TRAVEL_PX) {
      return 0;
    }
    return INTERMEDIATE_TURN_NARROWING_WEIGHT * trackNarrowingCost(label.feasibleTrack, reachable);
  }
  function trackNarrowingCost(available, reachable) {
    const availableWidth = Math.min(NARROW_SECTION_TARGET_PX, available[1] - available[0]);
    const reachableWidth = Math.min(availableWidth, reachable[1] - reachable[0]);
    return Math.max(0, availableWidth - reachableWidth);
  }
  function fallbackResult(request, fallbackReason, searchPass, runs) {
    return {
      route: new Route(request.requestIndex, request.from, request.to, []),
      fallback: true,
      fallbackReason,
      searchPass,
      metrics: metrics(runs)
    };
  }
  function metrics(runs) {
    return {
      expansions: runs.reduce((total, run) => total + run.expansions, 0),
      maxQueue: Math.max(0, ...runs.map((run) => run.maxQueue)),
      maxLabelsPerCorridor: Math.max(0, ...runs.map((run) => run.maxLabelsPerCorridor)),
      passCount: runs.length
    };
  }
  function hasVisibleEscapePortals(world, hiddenPortalIndexes) {
    return world.portalSearchTiers?.some(
      (tier, portalIndex) => tier === PORTAL_SEARCH_TIER_ESCAPE && !hiddenPortalIndexes?.has(portalIndex)
    ) ?? false;
  }

  // packages/layout/src/routing/corridor/selectedPortalRepair.ts
  var EPSILON13 = 1e-6;
  var MAX_CROSSING_PASSES = 4;
  var MAX_OTHER_PASSES = 4;
  var MAX_CROSSING_CANDIDATE_EVALUATIONS = 48;
  var MAX_OTHER_CANDIDATE_EVALUATIONS = 32;
  var MAX_REROUTES_PER_ROUTE = 1;
  var ENDPOINT_DEMANDED_ROUTES_PER_PASS = 6;
  var MAX_PORTALS_PER_ROUTE = 4;
  var MAX_CORRIDORS_PER_ROUTE = 2;
  var DEFAULT_SELECTED_PORTAL_REPAIR_OPTIONS = {
    incrementalSpacing: true,
    incrementalEmission: true,
    incrementalLineMerges: true
  };
  function repairSelectedPortals(world, requests, initialTopologies, initial, overrides = {}) {
    return repairAttributedPortals(
      world,
      requests,
      initialTopologies,
      initial,
      overrides,
      "crossing"
    );
  }
  function repairWallRoutes(world, requests, initialTopologies, initial, overrides = {}) {
    return repairAttributedPortals(world, requests, initialTopologies, initial, overrides, "wall");
  }
  function repairEndpointRoutes(world, requests, initialTopologies, initial, overrides = {}) {
    return repairAttributedPortals(
      world,
      requests,
      initialTopologies,
      initial,
      overrides,
      "endpoint"
    );
  }
  function repairAttributedPortals(world, requests, initialTopologies, initial, overrides, mode) {
    const options = { ...DEFAULT_SELECTED_PORTAL_REPAIR_OPTIONS, ...overrides };
    validateOptions(options);
    validateRepairInputs("selected portal repair", requests, initialTopologies, initial.routes);
    const leaves = leafRects(world);
    let topologies = [...initialTopologies];
    let incumbent = evaluateBatch(initial, leaves, world.entities.length);
    let independentContinuations = [
      ...options.initialIndependentContinuations ?? []
    ];
    const routeReroutes = new Array(topologies.length).fill(0);
    const seenTopologies = /* @__PURE__ */ new Set([topologySignature(topologies)]);
    const candidates = [];
    let acceptedPasses = 0;
    let candidateSearches = 0;
    let candidateEvaluations = 0;
    let stoppedBy = "pass-budget";
    const maxPasses = mode === "crossing" ? MAX_CROSSING_PASSES : MAX_OTHER_PASSES;
    const maxCandidateEvaluations = mode === "crossing" ? MAX_CROSSING_CANDIDATE_EVALUATIONS : MAX_OTHER_CANDIDATE_EVALUATIONS;
    const deadlineReached = () => options.deadlineAtMs !== void 0 && performance.now() >= options.deadlineAtMs;
    for (let passIndex = 0; passIndex < maxPasses; passIndex += 1) {
      if (deadlineReached()) {
        stoppedBy = "time-budget";
        break;
      }
      const demandedRoutes = collectRouteDemands(world, incumbent, routeReroutes, mode);
      let best;
      let candidateBudgetReached = false;
      let timeBudgetReached = false;
      const portalOperations = demandedRoutes.flatMap(
        (demand) => demand.portals.flatMap((portal) => {
          const preserving = demand.preservedCorridorIndexes.map((requiredCorridorIndex) => ({
            demand,
            operation: {
              kind: "portal",
              portalIndex: portal.portalIndex,
              requiredCorridorIndex
            }
          }));
          return preserving.length > 0 ? preserving : [
            {
              demand,
              operation: {
                kind: "portal",
                portalIndex: portal.portalIndex
              }
            }
          ];
        })
      );
      const corridorOperations = demandedRoutes.flatMap(
        (demand) => demand.corridors.map((corridor) => ({
          demand,
          operation: {
            kind: "corridor",
            corridorIndex: corridor.corridorIndex,
            cost: corridor.cost
          }
        }))
      );
      operationLoop: for (const operations of [portalOperations, corridorOperations]) {
        if (operations === corridorOperations && best) {
          break;
        }
        for (const { demand, operation } of operations) {
          if (deadlineReached()) {
            timeBudgetReached = true;
            break operationLoop;
          }
          if (candidateEvaluations >= maxCandidateEvaluations) {
            candidateBudgetReached = true;
            break operationLoop;
          }
          candidateSearches += 1;
          const request = requests[demand.routeIndex];
          let search = searchRoute(
            world,
            request,
            operation.kind === "portal" ? {
              hiddenPortalIndexes: /* @__PURE__ */ new Set([operation.portalIndex]),
              requiredCorridorIndex: operation.requiredCorridorIndex,
              preferCenteredTerminalAttachments: false
            } : {
              corridorEntryPenalties: /* @__PURE__ */ new Map([[operation.corridorIndex, operation.cost]]),
              preferCenteredTerminalAttachments: false
            }
          );
          if (operation.kind === "portal" && !search.fallback && mode === "crossing" && (search.cost?.portalPenalty ?? 0) > EPSILON13) {
            candidateSearches += 1;
            search = searchRoute(world, request, {
              hiddenPortalIndexes: /* @__PURE__ */ new Set([
                ...pricedContinuationPortalIndexes(world, request),
                operation.portalIndex
              ]),
              preferCenteredTerminalAttachments: false
            });
          }
          const evidence = {
            passIndex,
            routeIndex: demand.routeIndex,
            ...operation.kind === "portal" ? {
              hiddenPortalIndex: operation.portalIndex,
              ...operation.requiredCorridorIndex === void 0 ? {} : { requiredCorridorIndex: operation.requiredCorridorIndex }
            } : {},
            status: "fallback"
          };
          const evidenceIndex = candidates.length;
          candidates.push(evidence);
          if (search.fallback) {
            evidence.fallbackReason = search.fallbackReason;
            continue;
          }
          const candidateTopologies = topologies.map(
            (route, routeIndex) => routeIndex === demand.routeIndex ? search.route : route
          );
          const signature = topologySignature(candidateTopologies);
          if (seenTopologies.has(signature)) {
            evidence.status = "duplicate-topology";
            continue;
          }
          seenTopologies.add(signature);
          candidateEvaluations += 1;
          const retainedIndependentContinuations = independentContinuations.filter(
            (continuation) => continuation.routeIndex !== demand.routeIndex
          );
          let candidate;
          try {
            candidate = evaluateBatch(
              realizeRoutes(world, candidateTopologies, {
                continuationCutSelection: "exhaustive",
                ...reuseOptions(options, incumbent),
                independentContinuations: retainedIndependentContinuations
              }),
              leaves,
              world.entities.length
            );
          } catch {
            evidence.status = "realization-rejection";
            continue;
          }
          let candidateIndependentContinuations = retainedIndependentContinuations;
          if (mode === "endpoint" && qualityEventCount(candidate.quality.events, "wall-touch") > qualityEventCount(incumbent.quality.events, "wall-touch") && qualityEventCount(candidate.quality.events, "line-merge") <= qualityEventCount(incumbent.quality.events, "line-merge")) {
            for (const continuation of pointOverlapWallTouchContinuations(
              candidate,
              demand.routeIndex,
              retainedIndependentContinuations
            )) {
              if (deadlineReached()) {
                timeBudgetReached = true;
                break;
              }
              if (candidateEvaluations >= maxCandidateEvaluations) {
                candidateBudgetReached = true;
                break;
              }
              candidateEvaluations += 1;
              const trialContinuations = [...retainedIndependentContinuations, continuation];
              try {
                const polished = evaluateBatch(
                  realizeRoutes(world, candidateTopologies, {
                    continuationCutSelection: "exhaustive",
                    ...reuseOptions(options, candidate),
                    independentContinuations: trialContinuations
                  }),
                  leaves,
                  world.entities.length
                );
                if (compareRoutingQualityCosts(polished.quality.cost, incumbent.quality.cost) >= 0 || violatesRepairIdentity(polished.routes, polished.leafCuts, incumbent.leafCuts)) {
                  continue;
                }
                candidate = polished;
                candidateIndependentContinuations = trialContinuations;
                break;
              } catch {
                continue;
              }
            }
          }
          if (compareRoutingQualityCosts(candidate.quality.cost, incumbent.quality.cost) >= 0) {
            evidence.status = "quality-rejection";
            continue;
          }
          if (violatesRepairIdentity(candidate.routes, candidate.leafCuts, incumbent.leafCuts)) {
            evidence.status = "identity-rejection";
            continue;
          }
          evidence.status = "eligible";
          const current = {
            evidenceIndex,
            routeIndex: demand.routeIndex,
            operationKey: operation.kind === "portal" ? `portal:${operation.portalIndex}:required:${operation.requiredCorridorIndex ?? "none"}` : `corridor:${operation.corridorIndex}:${operation.cost}`,
            topologies: candidateTopologies,
            batch: candidate,
            independentContinuations: candidateIndependentContinuations,
            signature
          };
          if (!best || compareCandidate(current, best) < 0) {
            best = current;
          }
        }
      }
      timeBudgetReached = timeBudgetReached || deadlineReached();
      if (!best) {
        stoppedBy = timeBudgetReached ? "time-budget" : candidateBudgetReached ? "candidate-budget" : "fixed-point";
        break;
      }
      candidates[best.evidenceIndex].status = "accepted";
      topologies = [...best.topologies];
      incumbent = best.batch;
      independentContinuations = [...best.independentContinuations];
      routeReroutes[best.routeIndex] += 1;
      acceptedPasses += 1;
      if (timeBudgetReached || candidateBudgetReached) {
        stoppedBy = timeBudgetReached ? "time-budget" : "candidate-budget";
        break;
      }
    }
    const { crossings, topologyQualityEvents, leafCuts, ...batch } = incumbent;
    return {
      ...batch,
      topologies,
      independentContinuations,
      metrics: {
        acceptedPasses,
        candidateSearches,
        stoppedBy,
        candidates
      }
    };
  }
  function pricedContinuationPortalIndexes(world, request) {
    const endpointCorridorIndexes = requestEndpointCorridorIndexes(world, request);
    const result = /* @__PURE__ */ new Set();
    for (const portal of world.indexer.portals) {
      if (portal.kind === "continue" && continuationBendPenalty(world, endpointCorridorIndexes, portal) > 0) {
        result.add(portal.index);
      }
    }
    return result;
  }
  function topologySignature(routes) {
    return JSON.stringify(
      routes.map((route) => [
        route.requestIndex,
        route.visits.map((visit) => [
          visit.corridorIndex,
          boundaryKey(visit.entry),
          boundaryKey(visit.exit),
          visit.feasibleTrack[0],
          visit.feasibleTrack[1]
        ])
      ])
    );
  }
  function boundaryKey(boundary) {
    if (!boundary) {
      return "missing";
    }
    return boundary.kind === "terminal" ? `terminal:${boundary.attachmentIndex}` : `portal:${boundary.portalIndex}:${boundary.mode}`;
  }
  function collectRouteDemands(world, batch, routeReroutes, mode) {
    const drafts = makeRouteDemandDrafts(batch.routes);
    const preservedCorridorsByRoute = /* @__PURE__ */ new Map();
    if (mode === "crossing") {
      for (const crossing of unexpectedCrossings(world, batch.routes, batch.crossings)) {
        addCrossingDemand(
          drafts,
          batch.routes,
          crossing.a.routeIndex,
          crossing.a.visitIndex,
          crossing.b.routeIndex
        );
        addCrossingDemand(
          drafts,
          batch.routes,
          crossing.b.routeIndex,
          crossing.b.visitIndex,
          crossing.a.routeIndex
        );
      }
      for (const event of batch.topologyQualityEvents) {
        const draft = drafts[event.routeIndex];
        draft.topologyQualityEventCount += 1;
        addVisitPortals(draft.portalEventCounts, batch.routes[event.routeIndex], event.visitIndex);
      }
      for (const event of batch.quality.events) {
        if (event.kind === "spacing-deficit") {
          addAttributedCorridorDemands(drafts, batch.routes, event);
        }
      }
    } else if (mode === "wall") {
      for (const event of batch.quality.events) {
        addWallQualityDemand(drafts, batch.routes, event);
        if (event.kind === "backtrack") {
          addAttributedCorridorDemands(drafts, batch.routes, event);
        }
        if (event.kind === "near-face-turn") {
          for (const visitRef2 of event.visits ?? []) {
            const route = batch.routes[visitRef2.routeIndex];
            const visit = route?.visits[visitRef2.visitIndex];
            if (!route || !visit) {
              continue;
            }
            const crossSpan = corridorCrossSpan(world.indexer.corridors[visit.corridorIndex]);
            const mouthConstrained = visit.feasibleTrack[0] > crossSpan[0] + EPSILON13 || visit.feasibleTrack[1] < crossSpan[1] - EPSILON13;
            if (!mouthConstrained) {
              continue;
            }
            const corridorIndexes = preservedCorridorsByRoute.get(visitRef2.routeIndex) ?? /* @__PURE__ */ new Set();
            corridorIndexes.add(visit.corridorIndex);
            preservedCorridorsByRoute.set(visitRef2.routeIndex, corridorIndexes);
          }
        }
        if (event.kind !== "wall-hug") {
          continue;
        }
        for (const visitRef2 of event.visits ?? []) {
          const route = batch.routes[visitRef2.routeIndex];
          const visit = route?.visits[visitRef2.visitIndex];
          if (!route || !visit || visit.feasibleTrack[1] - visit.feasibleTrack[0] > EPSILON13) {
            continue;
          }
          const crossSpan = corridorCrossSpan(world.indexer.corridors[visit.corridorIndex]);
          const corridorCenter2 = (crossSpan[0] + crossSpan[1]) / 2;
          if (Math.abs(route.nominalTrackOf(visitRef2.visitIndex) - corridorCenter2) <= EPSILON13) {
            continue;
          }
          const corridorIndexes = preservedCorridorsByRoute.get(visitRef2.routeIndex) ?? /* @__PURE__ */ new Set();
          corridorIndexes.add(visit.corridorIndex);
          preservedCorridorsByRoute.set(visitRef2.routeIndex, corridorIndexes);
        }
      }
    } else {
      for (const event of batch.quality.events) {
        addEndpointQualityDemand(drafts, batch.routes, event);
      }
    }
    return drafts.filter(
      (draft) => routeReroutes[draft.routeIndex] < MAX_REROUTES_PER_ROUTE && (draft.portalEventCounts.size > 0 || draft.corridorDemands.size > 0)
    ).sort(compareRouteDemands).filter(
      (_, demandIndex) => mode !== "endpoint" || demandIndex < ENDPOINT_DEMANDED_ROUTES_PER_PASS
    ).map((draft) => ({
      routeIndex: draft.routeIndex,
      preservedCorridorIndexes: [...preservedCorridorsByRoute.get(draft.routeIndex) ?? []].sort(
        (left, right) => left - right
      ),
      portals: [...draft.portalEventCounts].map(([portalIndex, eventCount]) => ({ portalIndex, eventCount })).sort(
        (left, right) => right.eventCount - left.eventCount || left.portalIndex - right.portalIndex
      ).slice(0, MAX_PORTALS_PER_ROUTE).map(({ portalIndex }) => ({ portalIndex })),
      corridors: [...draft.corridorDemands.values()].filter((corridor) => corridor.cost > EPSILON13).sort(
        (left, right) => compareNumber(right.cost, left.cost, EPSILON13) || right.eventCount - left.eventCount || left.corridorIndex - right.corridorIndex
      ).slice(0, MAX_CORRIDORS_PER_ROUTE).map(({ corridorIndex, cost }) => ({ corridorIndex, cost }))
    }));
  }
  function pointOverlapWallTouchContinuations(batch, routeIndex, retained) {
    const route = batch.routes[routeIndex];
    const touchedVisitIndexes = /* @__PURE__ */ new Set();
    for (const event of batch.wallQuality) {
      if (event.kind !== "wall-touch" || !event.routeIndexes.includes(routeIndex)) {
        continue;
      }
      for (const visit of event.visits ?? []) {
        if (visit.routeIndex === routeIndex) {
          touchedVisitIndexes.add(visit.visitIndex);
        }
      }
    }
    const retainedKeys = new Set(
      retained.map(
        ({ routeIndex: retainedRouteIndex, afterVisitIndex }) => continuationKey(retainedRouteIndex, afterVisitIndex)
      )
    );
    return batch.spacing.continuations.flatMap((policy) => {
      const { afterVisitIndex } = policy;
      const key = continuationKey(routeIndex, afterVisitIndex);
      if (policy.routeIndex !== routeIndex || policy.policy !== "equal" || policy.reason !== "partial-overlap" || retainedKeys.has(key) || !touchedVisitIndexes.has(afterVisitIndex) && !touchedVisitIndexes.has(afterVisitIndex - 1)) {
        return [];
      }
      const before = route.visits[afterVisitIndex - 1];
      const after = route.visits[afterVisitIndex];
      const overlapStart = Math.max(before.feasibleTrack[0], after.feasibleTrack[0]);
      const overlapEnd = Math.min(before.feasibleTrack[1], after.feasibleTrack[1]);
      if (Math.abs(overlapEnd - overlapStart) > EPSILON13) {
        return [];
      }
      return [{ routeIndex, afterVisitIndex }];
    });
  }
  function evaluateBatch(batch, leaves, entityCount) {
    const { index, crossings } = batch.geometryQuality;
    return {
      ...batch,
      crossings,
      topologyQualityEvents: collectTopologyQualityEvents(batch.routes),
      leafCuts: leafCutKeys(batch.routes, index, leaves, entityCount)
    };
  }
  function collectTopologyQualityEvents(routes) {
    const events = [];
    for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
      const route = routes[routeIndex];
      for (let visitIndex = 0; visitIndex < route.visits.length; visitIndex += 1) {
        const visit = route.visits[visitIndex];
        if (visit.entry.kind === "portal" && visit.entry.mode === "turn" && visit.exit.kind === "portal" && visit.exit.mode === "turn" && visit.entry.portalIndex === visit.exit.portalIndex) {
          events.push({
            kind: "same-portal-spur",
            routeIndex,
            requestIndex: route.requestIndex,
            visitIndex,
            portalIndex: visit.entry.portalIndex
          });
        }
      }
    }
    return events;
  }
  function compareCandidate(left, right) {
    return compareRoutingQualityCosts(left.batch.quality.cost, right.batch.quality.cost) || left.routeIndex - right.routeIndex || left.operationKey.localeCompare(right.operationKey) || left.signature.localeCompare(right.signature);
  }
  function validateRepairInputs(phase, requests, topologies, realizedRoutes) {
    if (requests.length !== topologies.length || topologies.length !== realizedRoutes.length) {
      throw new Error(`${phase} requires one request, topology, and route per index`);
    }
    for (let routeIndex = 0; routeIndex < requests.length; routeIndex += 1) {
      if (requests[routeIndex].requestIndex !== topologies[routeIndex].requestIndex || requests[routeIndex].requestIndex !== realizedRoutes[routeIndex].requestIndex) {
        throw new Error(`${phase} route ${routeIndex} request index mismatch`);
      }
    }
  }
  function validateOptions(options) {
    if (options.deadlineAtMs !== void 0 && (Number.isNaN(options.deadlineAtMs) || options.deadlineAtMs === Number.NEGATIVE_INFINITY)) {
      throw new Error(`selected portal repair: invalid deadlineAtMs ${options.deadlineAtMs}`);
    }
    for (const continuation of options.initialIndependentContinuations ?? []) {
      if (!Number.isInteger(continuation.routeIndex) || !Number.isInteger(continuation.afterVisitIndex)) {
        throw new Error("selected portal repair: invalid initial independent continuation");
      }
    }
  }

  // packages/layout/src/routing/corridor/portalJumpRepair.ts
  var EPSILON14 = 1e-6;
  var MAX_PORTALS_PER_ROUTE2 = 4;
  var MAX_FLIPS = 6;
  var ENDPOINT_DEMANDED_ROUTES = 6;
  function repairPortalJump(world, requests, initialTopologies, initial, options) {
    validateRepairInputs("portal jump repair", requests, initialTopologies, initial.routes);
    const maxDemandedRoutes = options.maxDemandedRoutes ?? ENDPOINT_DEMANDED_ROUTES;
    const maxFlips = options.maxFlips ?? MAX_FLIPS;
    validateBudgets(maxDemandedRoutes, maxFlips);
    if (options.deadlineAtMs !== void 0 && (Number.isNaN(options.deadlineAtMs) || options.deadlineAtMs === Number.NEGATIVE_INFINITY)) {
      throw new Error(`portal jump repair: invalid deadlineAtMs ${options.deadlineAtMs}`);
    }
    const deadlineReached = () => options.deadlineAtMs !== void 0 && performance.now() >= options.deadlineAtMs;
    const realization = options.realization ?? {};
    const inputContinuations = [...realization.independentContinuations ?? []];
    const retainedRealization = (topologies) => {
      const changed = /* @__PURE__ */ new Set();
      for (let routeIndex = 0; routeIndex < topologies.length; routeIndex += 1) {
        if (topologies[routeIndex] !== initialTopologies[routeIndex]) {
          changed.add(routeIndex);
        }
      }
      return {
        independentContinuations: (realization.independentContinuations ?? []).filter(
          (policy) => !changed.has(policy.routeIndex)
        )
      };
    };
    const maybeInvalidFallback = () => {
      if (!initial.quality.events.some((event) => routingQualityTier(event.kind) === "invalid")) {
        return void 0;
      }
      const engine = repairEndpointRoutes(world, requests, initialTopologies, initial, {
        ...realization.incrementalSpacing === void 0 ? {} : { incrementalSpacing: realization.incrementalSpacing },
        ...realization.incrementalEmission === void 0 ? {} : { incrementalEmission: realization.incrementalEmission },
        ...realization.incrementalLineMerges === void 0 ? {} : { incrementalLineMerges: realization.incrementalLineMerges }
      });
      return {
        batch: engine,
        topologies: engine.topologies,
        continuations: engine.independentContinuations
      };
    };
    const demands = collectPortalDemands(initial, maxDemandedRoutes, options.protectedRouteIndexes);
    const stageOne = demands.map((demand) => ({
      demand,
      assignment: "none"
    }));
    let timeBudgetReached = false;
    stageOneSearch: for (const routeState of stageOne) {
      const { demand } = routeState;
      const incumbentSignature = topologySignature([initialTopologies[demand.routeIndex]]);
      const seenSignatures = /* @__PURE__ */ new Set([incumbentSignature]);
      for (const portalIndex of demand.portalIndexes) {
        if (deadlineReached()) {
          timeBudgetReached = true;
          break stageOneSearch;
        }
        const search = searchRoute(world, requests[demand.routeIndex], {
          hiddenPortalIndexes: /* @__PURE__ */ new Set([portalIndex]),
          preferCenteredTerminalAttachments: false
        });
        if (search.fallback || !search.cost) {
          continue;
        }
        const signature = topologySignature([search.route]);
        if (signature === incumbentSignature) {
          continue;
        }
        if (seenSignatures.has(signature)) {
          continue;
        }
        seenSignatures.add(signature);
        const candidate = {
          searchTotal: search.cost.total,
          route: search.route
        };
        if (!routeState.best || candidate.searchTotal < routeState.best.searchTotal - EPSILON14) {
          routeState.second = routeState.best;
          routeState.best = candidate;
        } else if (!routeState.second || candidate.searchTotal < routeState.second.searchTotal - EPSILON14) {
          routeState.second = candidate;
        }
      }
      const hiddenAttachmentIndexes = offCenterAttachmentIndexes(
        world,
        initialTopologies[demand.routeIndex]
      );
      if (hiddenAttachmentIndexes.length > 0) {
        if (deadlineReached()) {
          timeBudgetReached = true;
          break;
        }
        const search = searchRoute(world, requests[demand.routeIndex], {
          hiddenAttachmentIndexes: new Set(hiddenAttachmentIndexes),
          preferCenteredTerminalAttachments: false
        });
        if (!search.fallback && search.cost) {
          const signature = topologySignature([search.route]);
          if (signature !== incumbentSignature && !seenSignatures.has(signature)) {
            seenSignatures.add(signature);
            const centeredCandidate = {
              searchTotal: search.cost.total,
              route: search.route
            };
            routeState.second = routeState.best;
            routeState.best = centeredCandidate;
          }
        }
      }
      if (routeState.best) {
        routeState.assignment = "best";
      }
    }
    const chosen = stageOne.filter((routeState) => routeState.best);
    const unchangedResult = (stoppedBy2) => {
      const fallback2 = stoppedBy2 === "time-budget" ? void 0 : maybeInvalidFallback();
      return buildResult(
        fallback2?.batch ?? initial,
        fallback2?.topologies ?? initialTopologies,
        fallback2?.continuations ?? inputContinuations
      );
    };
    if (timeBudgetReached || deadlineReached()) {
      return unchangedResult("time-budget");
    }
    if (chosen.length === 0) {
      return unchangedResult("no-candidates");
    }
    const assignedTopology = (routeState) => {
      if (routeState.assignment === "best" && routeState.best) {
        return routeState.best.route;
      }
      if (routeState.assignment === "second" && routeState.second) {
        return routeState.second.route;
      }
      return initialTopologies[routeState.demand.routeIndex];
    };
    const composeTopologies = () => {
      const byRoute = new Map(chosen.map((routeState) => [routeState.demand.routeIndex, routeState]));
      return initialTopologies.map((route, routeIndex) => {
        const routeState = byRoute.get(routeIndex);
        return routeState ? assignedTopology(routeState) : route;
      });
    };
    if (deadlineReached()) {
      return unchangedResult("time-budget");
    }
    let currentTopologies = composeTopologies();
    let currentBatch;
    try {
      currentBatch = realizeRoutes(world, currentTopologies, {
        continuationCutSelection: "exhaustive",
        ...retainedRealization(currentTopologies),
        ...reuseOptions(realization, initial)
      });
    } catch {
      return unchangedResult("jump-realization-failure");
    }
    const passesGates = (candidate) => compareRoutingQualityCosts(candidate.quality.cost, initial.quality.cost) < 0;
    const jumpAccepted = passesGates(currentBatch);
    let bestSeen = jumpAccepted ? { topologies: currentTopologies, batch: currentBatch } : void 0;
    const considerBest = (state) => {
      if (!passesGates(state.batch)) {
        return;
      }
      if (!bestSeen || compareRoutingQualityCosts(state.batch.quality.cost, bestSeen.batch.quality.cost) < 0) {
        bestSeen = state;
      }
    };
    const incumbentAttribution = attributeByRoute(
      initial.quality.events,
      initial.routes.length,
      initial.geometryQuality.scalarCostByRoute
    );
    let flipsTried = 0;
    let stoppedBy = "no-offenders";
    descent: while (flipsTried < maxFlips) {
      if (deadlineReached()) {
        stoppedBy = "time-budget";
        break;
      }
      const offenders = rankOffenders(
        chosen,
        attributeByRoute(
          currentBatch.quality.events,
          currentBatch.routes.length,
          currentBatch.geometryQuality.scalarCostByRoute
        ),
        incumbentAttribution
      );
      if (offenders.length === 0) {
        stoppedBy = "no-offenders";
        break;
      }
      let improved = false;
      for (const routeState of offenders) {
        if (deadlineReached()) {
          stoppedBy = "time-budget";
          break descent;
        }
        if (flipsTried >= maxFlips) {
          stoppedBy = "flip-budget";
          break descent;
        }
        flipsTried += 1;
        const routeIndex = routeState.demand.routeIndex;
        const actions = [
          { action: "revert", route: initialTopologies[routeIndex] }
        ];
        if (routeState.assignment === "best" && routeState.second) {
          actions.push({ action: "swap", route: routeState.second.route });
        }
        for (const { action, route } of actions) {
          if (deadlineReached()) {
            stoppedBy = "time-budget";
            break descent;
          }
          const flippedTopologies = currentTopologies.map(
            (current, index) => index === routeIndex ? route : current
          );
          let candidateBatch;
          try {
            candidateBatch = realizeRoutes(world, flippedTopologies, {
              continuationCutSelection: "exhaustive",
              ...retainedRealization(flippedTopologies),
              ...reuseOptions(realization, currentBatch)
            });
          } catch {
            continue;
          }
          considerBest({
            topologies: flippedTopologies,
            batch: candidateBatch
          });
          if (compareRoutingQualityCosts(candidateBatch.quality.cost, currentBatch.quality.cost) < 0) {
            currentTopologies = flippedTopologies;
            currentBatch = candidateBatch;
            routeState.assignment = action === "revert" ? "incumbent" : "second";
            improved = true;
            break;
          }
        }
        if (improved) {
          break;
        }
      }
      if (!improved) {
        stoppedBy = "no-improvement";
        break;
      }
    }
    if (flipsTried >= maxFlips && stoppedBy === "no-offenders") {
      stoppedBy = "flip-budget";
    }
    const finalState = bestSeen;
    const fallback = finalState || stoppedBy === "time-budget" ? void 0 : maybeInvalidFallback();
    const finalTopologies = finalState ? finalState.topologies : fallback?.topologies ?? initialTopologies;
    const finalBatch = finalState ? finalState.batch : fallback?.batch ?? initial;
    const finalContinuations = finalState ? retainedRealization(finalState.topologies).independentContinuations ?? [] : fallback?.continuations ?? inputContinuations;
    return buildResult(finalBatch, finalTopologies, finalContinuations);
  }
  function offCenterAttachmentIndexes(world, route) {
    const hidden = [];
    for (const endpoint of [route.from, route.to]) {
      if (endpoint.authoredTrack !== void 0) {
        continue;
      }
      const faceSpan = faceCrossSpan(world.entities[endpoint.entityIndex], endpoint.face);
      const center2 = endpoint.preferredTrack ?? midpoint(faceSpan);
      const attachments = world.indexer.attachmentsForEndpoint(endpoint).map((attachmentIndex) => world.indexer.attachments[attachmentIndex]);
      if (!attachments.some(
        (attachment) => center2 >= attachment.faceSpan[0] - EPSILON14 && center2 <= attachment.faceSpan[1] + EPSILON14
      )) {
        continue;
      }
      for (const attachment of attachments) {
        if (center2 < attachment.faceSpan[0] - EPSILON14 || center2 > attachment.faceSpan[1] + EPSILON14) {
          hidden.push(attachment.index);
        }
      }
    }
    return hidden;
  }
  function collectPortalDemands(batch, maxDemandedRoutes, protectedRouteIndexes) {
    const drafts = makeRouteDemandDrafts(batch.routes);
    for (const event of batch.quality.events) {
      addEndpointQualityDemand(drafts, batch.routes, event);
    }
    return drafts.filter(
      (draft) => !protectedRouteIndexes?.has(draft.routeIndex) && (draft.portalEventCounts.size > 0 || draft.portCenteringEventCount > 0)
    ).sort(compareRouteDemands).slice(0, maxDemandedRoutes).map((draft) => ({
      routeIndex: draft.routeIndex,
      portalIndexes: [...draft.portalEventCounts].sort(
        ([leftPortalIndex, leftEventCount], [rightPortalIndex, rightEventCount]) => rightEventCount - leftEventCount || leftPortalIndex - rightPortalIndex
      ).slice(0, MAX_PORTALS_PER_ROUTE2).map(([portalIndex]) => portalIndex)
    }));
  }
  function attributeByRoute(events, routeCount, scalarCostByRoute) {
    const attribution = Array.from({ length: routeCount }, () => ({
      invalidCount: 0,
      capCount: 0,
      scalarCost: 0
    }));
    for (const event of events) {
      for (const routeIndex of new Set(event.routeIndexes)) {
        const entry = attribution[routeIndex];
        if (!entry) {
          continue;
        }
        const tier = routingQualityTier(event.kind);
        if (tier === "invalid") {
          entry.invalidCount += 1;
        } else if (tier === "cap") {
          entry.capCount += 1;
        } else {
          entry.scalarCost += event.cost;
        }
      }
    }
    for (const [routeIndex, scalarCost] of scalarCostByRoute) {
      const entry = attribution[routeIndex];
      if (entry) {
        entry.scalarCost += scalarCost;
      }
    }
    return attribution;
  }
  function damageOf(candidate, incumbent) {
    return {
      invalidDelta: (candidate?.invalidCount ?? 0) - (incumbent?.invalidCount ?? 0),
      capDelta: (candidate?.capCount ?? 0) - (incumbent?.capCount ?? 0),
      scalarDelta: (candidate?.scalarCost ?? 0) - (incumbent?.scalarCost ?? 0)
    };
  }
  function isOffense(damage) {
    return damage.invalidDelta > 0 || damage.capDelta > 0 || damage.scalarDelta > EPSILON14;
  }
  function compareDamage(left, right) {
    return right.invalidDelta - left.invalidDelta || right.capDelta - left.capDelta || compareNumber(right.scalarDelta, left.scalarDelta, EPSILON14);
  }
  function rankOffenders(chosen, candidateAttribution, incumbentAttribution) {
    const damages = /* @__PURE__ */ new Map();
    const offenders = chosen.filter((routeState) => {
      if (routeState.assignment === "incumbent") {
        return false;
      }
      const routeIndex = routeState.demand.routeIndex;
      const damage = damageOf(candidateAttribution[routeIndex], incumbentAttribution[routeIndex]);
      damages.set(routeIndex, damage);
      return isOffense(damage);
    });
    return offenders.sort((left, right) => {
      const leftDamage = damages.get(left.demand.routeIndex);
      const rightDamage = damages.get(right.demand.routeIndex);
      if (!leftDamage || !rightDamage) {
        return left.demand.routeIndex - right.demand.routeIndex;
      }
      return compareDamage(leftDamage, rightDamage) || left.demand.routeIndex - right.demand.routeIndex;
    });
  }
  function buildResult(batch, topologies, independentContinuations) {
    return {
      ...batch,
      topologies,
      independentContinuations
    };
  }
  function validateBudgets(maxDemandedRoutes, maxFlips) {
    const budgets = [
      ["maxDemandedRoutes", maxDemandedRoutes],
      ["maxFlips", maxFlips]
    ];
    for (const [name, value] of budgets) {
      if (!Number.isInteger(value) || value < 0) {
        throw new Error(`portal jump repair: invalid ${name} ${value}`);
      }
    }
    if (maxDemandedRoutes === 0) {
      throw new Error("portal jump repair: route/portal budgets out of bounds");
    }
  }

  // packages/layout/src/routing/corridor/fanSpreadRepair.ts
  var EPSILON15 = 1e-6;
  var MIN_FACE_CHARGE = 0.15;
  var MAX_FACE_CANDIDATES = 12;
  function repairFanSpread(world, requests, initialTopologies, initial, options) {
    let incumbent = initial;
    let incumbentCost = slotModeCost(world, incumbent);
    let topologies = [...initialTopologies];
    let candidatesBuilt = 0;
    let candidatesAccepted = 0;
    const faces = slotChargedFaces(world, incumbent.routes);
    for (const fanFace of faces) {
      if (candidatesBuilt > 0 && performance.now() >= options.deadlineAtMs) {
        break;
      }
      if (candidatesBuilt >= MAX_FACE_CANDIDATES) {
        break;
      }
      const anchors = straightCoupledAnchors(world, incumbent.routes, fanFace);
      const targets = anchoredSlotTargets(fanFace, anchors);
      const pins = /* @__PURE__ */ new Map();
      fanFace.samples.forEach((sample, sampleIndex) => {
        pins.set(pinKey(sample.routeIndex, sample.side), targets[sampleIndex]);
      });
      for (const [sampleIndex, anchor] of anchors) {
        const sample = fanFace.samples[sampleIndex];
        const oppositeSide = sample.side === "from" ? "to" : "from";
        pins.set(pinKey(sample.routeIndex, oppositeSide), anchor);
      }
      const valveEndpoint = newWorstBandPinnedEndpoint(world, incumbent.routes, pins, fanFace);
      if (valveEndpoint !== void 0) {
        continue;
      }
      const researched = /* @__PURE__ */ new Map();
      let blockedRouteIndex;
      for (const [key, target] of pins) {
        const { routeIndex, side } = parsePinKey(key);
        const route = researched.get(routeIndex) ?? topologies[routeIndex];
        const visit = side === "from" ? route.visits[0] : route.visits[route.visits.length - 1];
        if (visit !== void 0 && target >= visit.feasibleTrack[0] - EPSILON15 && target <= visit.feasibleTrack[1] + EPSILON15) {
          continue;
        }
        if (options.protectedRouteIndexes?.has(routeIndex) === true) {
          blockedRouteIndex = routeIndex;
          break;
        }
        const search = searchRoute(
          world,
          pinnedSearchRequest(requests[routeIndex], topologies[routeIndex], pins, routeIndex),
          { preferCenteredTerminalAttachments: false }
        );
        if (search.fallback || !search.cost) {
          blockedRouteIndex = routeIndex;
          break;
        }
        researched.set(routeIndex, search.route);
      }
      if (blockedRouteIndex !== void 0) {
        continue;
      }
      const candidateTopologies = topologies.map((route, routeIndex) => {
        const base = researched.get(routeIndex) ?? route;
        const fromPin = pins.get(pinKey(routeIndex, "from"));
        const toPin = pins.get(pinKey(routeIndex, "to"));
        if (fromPin === void 0 && toPin === void 0 && base === route) {
          return cloneRoute(route);
        }
        return new Route(
          route.requestIndex,
          pinEndpoint(route.from, fromPin),
          pinEndpoint(route.to, toPin),
          base.visits
        );
      });
      candidatesBuilt += 1;
      let candidate;
      try {
        candidate = realizeRoutes(world, candidateTopologies, {
          continuationCutSelection: "exhaustive",
          independentContinuations: options.realization.independentContinuations,
          ...reuseOptions(
            {
              incrementalEmission: options.realization.incrementalEmission,
              incrementalLineMerges: options.realization.incrementalLineMerges
            },
            incumbent
          )
        });
      } catch {
        continue;
      }
      const candidateCost2 = slotModeCost(world, candidate);
      const accepted = compareRoutingQualityCosts(candidateCost2, incumbentCost) < 0 && !violatesRepairIdentity(
        candidate.routes,
        leafCutKeys(
          candidate.routes,
          candidate.geometryQuality.index,
          options.leaves,
          options.entityCount
        ),
        leafCutKeys(
          incumbent.routes,
          incumbent.geometryQuality.index,
          options.leaves,
          options.entityCount
        )
      );
      if (accepted) {
        incumbent = candidate;
        incumbentCost = candidateCost2;
        topologies = candidateTopologies;
        candidatesAccepted += 1;
      }
    }
    return {
      batch: incumbent,
      topologies,
      changed: candidatesBuilt > 0,
      accepted: candidatesAccepted > 0
    };
  }
  function slotModeCost(world, batch) {
    const otherEvents = batch.quality.sources.filter((source) => source.source !== "emission:endpoint-quality").flatMap((source) => source.events);
    const endpointQuality = collectEndpointQualityEvents(world, batch.routes, { slotEvents: true });
    return routingQualityCost([...otherEvents, ...endpointQuality], batch.quality.scalarCosts);
  }
  function pinKey(routeIndex, side) {
    return `${routeIndex}|${side}`;
  }
  function parsePinKey(key) {
    const [routeIndex, side] = key.split("|");
    return { routeIndex: Number(routeIndex), side };
  }
  function pinEndpoint(endpoint, pin) {
    return pin === void 0 ? endpoint : { ...endpoint, repairPinTrack: pin };
  }
  function pinnedSearchRequest(request, route, pins, routeIndex) {
    const sideEndpoint = (side) => {
      const endpoint = side === "from" ? request.from : request.to;
      const track = pins.get(pinKey(routeIndex, side)) ?? route[side].repairPinTrack;
      return track === void 0 ? endpoint : { ...endpoint, authoredTrack: track };
    };
    return { ...request, from: sideEndpoint("from"), to: sideEndpoint("to") };
  }
  function slotChargedFaces(world, routes) {
    const groups = /* @__PURE__ */ new Map();
    routes.forEach((route, routeIndex) => {
      if (route.visits.length === 0) {
        return;
      }
      const ports = route.ports();
      for (const side of ["from", "to"]) {
        const endpoint = route[side];
        if (endpoint.authoredTrack !== void 0) {
          continue;
        }
        const point = ports[side];
        const coordinate = endpoint.face === "left" || endpoint.face === "right" ? point.y : point.x;
        const key = `${endpoint.entityIndex}|${endpoint.face}`;
        const group = groups.get(key) ?? {
          entityIndex: endpoint.entityIndex,
          face: endpoint.face,
          samples: []
        };
        group.samples.push({ routeIndex, side, coordinate });
        groups.set(key, group);
      }
    });
    const faces = [];
    for (const group of groups.values()) {
      const samples = [...group.samples].sort((left, right) => left.coordinate - right.coordinate);
      const entity = (world.sourceEntities ?? world.entities)[group.entityIndex];
      const span = faceCrossSpan(entity, group.face);
      const assessment = assessFaceSlots(
        span,
        samples.map((sample) => sample.coordinate)
      );
      if (assessment.charge < MIN_FACE_CHARGE) {
        continue;
      }
      faces.push({ entityIndex: group.entityIndex, face: group.face, span, samples, assessment });
    }
    return faces.sort((left, right) => right.assessment.charge - left.assessment.charge);
  }
  var WORST_BAND_DEVIATION = 0.6;
  function facePortRecords(routes) {
    const byFace = /* @__PURE__ */ new Map();
    routes.forEach((route, routeIndex) => {
      if (route.visits.length === 0) {
        return;
      }
      const ports = route.ports();
      for (const side of ["from", "to"]) {
        const endpoint = route[side];
        if (endpoint.authoredTrack !== void 0) {
          continue;
        }
        const point = ports[side];
        const coordinate = endpoint.face === "left" || endpoint.face === "right" ? point.y : point.x;
        const key = `${endpoint.entityIndex}|${endpoint.face}`;
        const list = byFace.get(key) ?? [];
        list.push({ routeIndex, side, coordinate });
        byFace.set(key, list);
      }
    });
    for (const list of byFace.values()) {
      list.sort((left, right) => left.coordinate - right.coordinate);
    }
    return byFace;
  }
  function convexCharge(deviation, halfSpan) {
    if (halfSpan <= 0) {
      return 0;
    }
    const normalized = Math.min(1, Math.max(0, deviation) / halfSpan);
    return normalized * (1 + normalized * normalized);
  }
  function straightCoupledAnchors(world, routes, fanFace) {
    const anchors = /* @__PURE__ */ new Map();
    const byFace = facePortRecords(routes);
    const nearSpan = faceCrossSpan(
      (world.sourceEntities ?? world.entities)[fanFace.entityIndex],
      fanFace.face
    );
    const nearHalfSpan = (nearSpan[1] - nearSpan[0]) / 2;
    let previousAnchor = Number.NEGATIVE_INFINITY;
    fanFace.samples.forEach((sample, sampleIndex) => {
      const route = routes[sample.routeIndex];
      const oppositeSide = sample.side === "from" ? "to" : "from";
      const opposite = route[oppositeSide];
      if (opposite.authoredTrack !== void 0) {
        return;
      }
      const fanFaceIsSide = fanFace.face === "left" || fanFace.face === "right";
      const farFaceIsSide = opposite.face === "left" || opposite.face === "right";
      if (fanFaceIsSide !== farFaceIsSide) {
        return;
      }
      const farKey = `${opposite.entityIndex}|${opposite.face}`;
      const farPorts = byFace.get(farKey) ?? [];
      if (farPorts.length !== 1 && route.points().length !== 2) {
        return;
      }
      const farEntity = (world.sourceEntities ?? world.entities)[opposite.entityIndex];
      const farSpan = faceCrossSpan(farEntity, opposite.face);
      const farHalfSpan = (farSpan[1] - farSpan[0]) / 2;
      const farAssessment = assessFaceSlots(
        farSpan,
        farPorts.map((port) => port.coordinate)
      );
      const farRank = farPorts.findIndex(
        (port) => port.routeIndex === sample.routeIndex && port.side === oppositeSide
      );
      if (farRank < 0) {
        return;
      }
      const nearExpectation = fanFace.assessment.expected[sampleIndex];
      const farExpectation = farAssessment.expected[farRank];
      const low = Math.round(Math.min(nearExpectation, farExpectation));
      const high = Math.round(Math.max(nearExpectation, farExpectation));
      let anchor;
      let bestCharge = Number.POSITIVE_INFINITY;
      for (let track = low; track <= high; track += 1) {
        const charge = convexCharge(Math.abs(track - nearExpectation), nearHalfSpan) + convexCharge(Math.abs(track - farExpectation), farHalfSpan);
        if (charge < bestCharge - EPSILON15) {
          bestCharge = charge;
          anchor = track;
        }
      }
      if (anchor === void 0) {
        return;
      }
      const farNeighbourBefore = farPorts[farRank - 1]?.coordinate;
      const farNeighbourAfter = farPorts[farRank + 1]?.coordinate;
      if (anchor <= previousAnchor || anchor < nearSpan[0] + PORT_EDGE_PADDING_PX || anchor > nearSpan[1] - PORT_EDGE_PADDING_PX || anchor < farSpan[0] + PORT_EDGE_PADDING_PX || anchor > farSpan[1] - PORT_EDGE_PADDING_PX || farNeighbourBefore !== void 0 && anchor <= farNeighbourBefore || farNeighbourAfter !== void 0 && anchor >= farNeighbourAfter || Math.abs(anchor - farExpectation) > WORST_BAND_DEVIATION * farHalfSpan) {
        return;
      }
      previousAnchor = anchor;
      anchors.set(sampleIndex, anchor);
    });
    return anchors;
  }
  function anchoredSlotTargets(fanFace, anchors) {
    const count = fanFace.samples.length;
    if (anchors.size === 0) {
      return fanFace.assessment.expected.map((expected) => Math.round(expected));
    }
    const faceStart = fanFace.span[0];
    const faceEnd = fanFace.span[1];
    const targets = new Array(count);
    const anchorIndexes = [...anchors.keys()].sort((left, right) => left - right);
    let runStart = 0;
    let leftBound = faceStart;
    const flushRun = (runEndExclusive, rightBound) => {
      const freeCount = runEndExclusive - runStart;
      if (freeCount > 0) {
        const subLength = (rightBound - leftBound) / freeCount;
        for (let offset = 0; offset < freeCount; offset += 1) {
          targets[runStart + offset] = Math.round(leftBound + subLength * (offset + 0.5));
        }
      }
    };
    for (const anchorIndex of anchorIndexes) {
      const anchor = anchors.get(anchorIndex);
      flushRun(anchorIndex, anchor);
      targets[anchorIndex] = anchor;
      runStart = anchorIndex + 1;
      leftBound = anchor;
    }
    flushRun(count, faceEnd);
    return targets;
  }
  function newWorstBandPinnedEndpoint(world, routes, pins, fanFace) {
    const byFace = facePortRecords(routes);
    const fanFaceKey = `${fanFace.entityIndex}|${fanFace.face}`;
    for (const [faceKey, ports] of byFace) {
      if (faceKey === fanFaceKey) {
        continue;
      }
      if (![...pins.keys()].some(
        (key) => ports.some((port) => pinKey(port.routeIndex, port.side) === key)
      )) {
        continue;
      }
      const [entityIndex, face] = faceKey.split("|");
      const span = faceCrossSpan(
        (world.sourceEntities ?? world.entities)[Number(entityIndex)],
        face
      );
      const halfSpan = (span[1] - span[0]) / 2;
      if (halfSpan <= 0) {
        continue;
      }
      const before = assessFaceSlots(
        span,
        ports.map((port) => port.coordinate)
      );
      const pinnedCoordinates = ports.map((port) => pins.get(pinKey(port.routeIndex, port.side)) ?? port.coordinate).sort((left, right) => left - right);
      const after = assessFaceSlots(span, pinnedCoordinates);
      for (let rank = 0; rank < ports.length; rank += 1) {
        const wasPinned = pins.has(pinKey(ports[rank].routeIndex, ports[rank].side));
        if (!wasPinned) {
          continue;
        }
        const beforeDeviation = before.deviations[rank] / halfSpan;
        const afterDeviation = after.deviations[rank] / halfSpan;
        if (afterDeviation > WORST_BAND_DEVIATION && beforeDeviation <= WORST_BAND_DEVIATION) {
          return `${faceKey} rank ${rank} (${beforeDeviation.toFixed(2)} -> ${afterDeviation.toFixed(2)})`;
        }
      }
    }
    return void 0;
  }

  // packages/layout/src/routing/corridor/productionRepair.ts
  var DEFAULT_PRODUCTION_REPAIR_TIME_BUDGET_MS = 100;
  var PRODUCTION_REPAIR_PHASES = [
    "selectedPortal",
    "wallPortal",
    "mergedSpacing",
    "residualWallPortal",
    "endpointPortal",
    "fanSpread"
  ];
  var PHASE_BUDGET_WEIGHTS = {
    selectedPortal: 40,
    wallPortal: 25,
    mergedSpacing: 10,
    residualWallPortal: 5,
    endpointPortal: 20,
    fanSpread: 10
  };
  function phaseDeadlines(startedAt, timeBudgetMs, outerDeadlineAtMs) {
    const totalWeight = PRODUCTION_REPAIR_PHASES.reduce(
      (total, phase) => total + PHASE_BUDGET_WEIGHTS[phase],
      0
    );
    const deadlines = {};
    let cumulativeWeight = 0;
    for (const phase of PRODUCTION_REPAIR_PHASES) {
      cumulativeWeight += PHASE_BUDGET_WEIGHTS[phase];
      deadlines[phase] = Math.min(
        outerDeadlineAtMs,
        startedAt + timeBudgetMs * cumulativeWeight / totalWeight
      );
    }
    return deadlines;
  }
  function repairProductionRoutes(world, requests, initialTopologies, initial, options = {}) {
    const startedAt = performance.now();
    const timeBudgetMs = options.timeBudgetMs ?? DEFAULT_PRODUCTION_REPAIR_TIME_BUDGET_MS;
    const incrementalSpacing = options.incrementalSpacing !== false;
    const incrementalEmission = options.incrementalEmission ?? incrementalSpacing;
    const incrementalLineMerges = options.incrementalLineMerges ?? incrementalEmission;
    if (Number.isNaN(timeBudgetMs) || timeBudgetMs < 0 || timeBudgetMs === Number.NEGATIVE_INFINITY) {
      throw new Error(`timeBudgetMs must be a non-negative number, got ${timeBudgetMs}`);
    }
    const deadlineAtMs = timeBudgetMs === Number.POSITIVE_INFINITY ? Number.POSITIVE_INFINITY : startedAt + timeBudgetMs;
    const phaseDeadlineAtMs = phaseDeadlines(startedAt, timeBudgetMs, deadlineAtMs);
    let incumbent = initial;
    let topologies = [...initialTopologies];
    let independentContinuations = [];
    const leaves = leafRects(world);
    const endpointProtectedRouteIndexes = /* @__PURE__ */ new Set();
    const diagnostics = {};
    const completedPhases = [];
    const deadlineReached = () => performance.now() >= deadlineAtMs;
    const completePhase = (phase) => {
      completedPhases.push(phase);
    };
    const observePhase = (phase, before, phaseDiagnostics) => {
      options.onPhaseComplete?.({ phase, before, after: incumbent, diagnostics: phaseDiagnostics });
    };
    const finish = (stoppedBeforePhase) => ({
      ...incumbent,
      topologies,
      independentContinuations,
      diagnostics: {
        ...diagnostics,
        budget: {
          timeBudgetMs,
          exhausted: deadlineReached(),
          completedPhases,
          ...stoppedBeforePhase ? { stoppedBeforePhase } : {}
        }
      }
    });
    if (deadlineReached()) {
      return finish("selectedPortal");
    }
    let phaseInput = incumbent;
    const selected = repairSelectedPortals(world, requests, topologies, incumbent, {
      deadlineAtMs: phaseDeadlineAtMs.selectedPortal,
      incrementalSpacing,
      incrementalEmission,
      incrementalLineMerges
    });
    const selectedAssessment = assessPhase(leaves, world.entities.length, incumbent, selected);
    const selectedAccepted = selectedAssessment.accepted;
    if (selectedAccepted) {
      incumbent = selected;
      topologies = [...selected.topologies];
      independentContinuations = [...selected.independentContinuations];
    }
    diagnostics.selectedPortal = portalDiagnostics(
      selected,
      selectedAssessment.changed,
      selectedAccepted
    );
    observePhase("selectedPortal", phaseInput, diagnostics.selectedPortal);
    completePhase("selectedPortal");
    if (deadlineReached()) {
      return finish("wallPortal");
    }
    phaseInput = incumbent;
    const wall = repairWallRoutes(world, requests, topologies, incumbent, {
      deadlineAtMs: phaseDeadlineAtMs.wallPortal,
      incrementalSpacing,
      incrementalEmission,
      incrementalLineMerges
    });
    const wallAssessment = assessPhase(leaves, world.entities.length, incumbent, wall);
    const wallAccepted = wallAssessment.accepted;
    if (wallAccepted) {
      addCorridorPreservingRepairIndexes(endpointProtectedRouteIndexes, wall.metrics);
      incumbent = wall;
      topologies = [...wall.topologies];
      independentContinuations = [...wall.independentContinuations];
    }
    diagnostics.wallPortal = portalDiagnostics(wall, wallAssessment.changed, wallAccepted);
    observePhase("wallPortal", phaseInput, diagnostics.wallPortal);
    completePhase("wallPortal");
    if (deadlineReached()) {
      return finish("mergedSpacing");
    }
    let mergedChangedGeometry = false;
    if (performance.now() < phaseDeadlineAtMs.wallPortal) {
      phaseInput = incumbent;
      const merged = repairMergedSpacing(world, incumbent, {
        incrementalSpacing,
        incrementalEmission,
        incrementalLineMerges
      });
      const mergedAssessment = assessPhase(leaves, world.entities.length, incumbent, merged);
      const mergedCandidateChanged = mergedAssessment.changed;
      const mergedAccepted = mergedAssessment.accepted;
      if (mergedAccepted) {
        incumbent = merged;
      }
      mergedChangedGeometry = mergedAccepted && mergedCandidateChanged;
      independentContinuations = dedupeContinuations([
        ...independentContinuations,
        ...merged.acceptedContinuationBoundary ? [merged.acceptedContinuationBoundary] : []
      ]);
      diagnostics.mergedSpacing = {
        ...merged.acceptedContinuationBoundary ? { acceptedContinuationBoundary: merged.acceptedContinuationBoundary } : {},
        changed: mergedCandidateChanged,
        accepted: mergedAccepted
      };
      observePhase("mergedSpacing", phaseInput, diagnostics.mergedSpacing);
      completePhase("mergedSpacing");
    }
    if (mergedChangedGeometry) {
      if (deadlineReached()) {
        return finish("residualWallPortal");
      }
      phaseInput = incumbent;
      const residualWall = repairWallRoutes(world, requests, topologies, incumbent, {
        initialIndependentContinuations: independentContinuations,
        deadlineAtMs: phaseDeadlineAtMs.residualWallPortal,
        incrementalSpacing,
        incrementalEmission,
        incrementalLineMerges
      });
      const residualWallAssessment = assessPhase(
        leaves,
        world.entities.length,
        incumbent,
        residualWall
      );
      const residualWallAccepted = residualWallAssessment.accepted;
      if (residualWallAccepted) {
        addCorridorPreservingRepairIndexes(endpointProtectedRouteIndexes, residualWall.metrics);
        incumbent = residualWall;
        topologies = [...residualWall.topologies];
        independentContinuations = [...residualWall.independentContinuations];
      }
      diagnostics.residualWallPortal = portalDiagnostics(
        residualWall,
        residualWallAssessment.changed,
        residualWallAccepted
      );
      observePhase("residualWallPortal", phaseInput, diagnostics.residualWallPortal);
      completePhase("residualWallPortal");
    }
    if (deadlineReached()) {
      return finish("endpointPortal");
    }
    phaseInput = incumbent;
    const endpoint = repairPortalJump(world, requests, topologies, incumbent, {
      protectedRouteIndexes: endpointProtectedRouteIndexes,
      realization: {
        independentContinuations,
        incrementalEmission,
        incrementalLineMerges
      },
      deadlineAtMs: phaseDeadlineAtMs.endpointPortal
    });
    const endpointAccepted = assessPhase(leaves, world.entities.length, incumbent, endpoint).accepted;
    if (endpointAccepted) {
      incumbent = endpoint;
      topologies = [...endpoint.topologies];
      independentContinuations = [...endpoint.independentContinuations];
    }
    diagnostics.endpointPortal = {
      accepted: endpointAccepted
    };
    observePhase("endpointPortal", phaseInput, diagnostics.endpointPortal);
    completePhase("endpointPortal");
    if (deadlineReached()) {
      return finish("fanSpread");
    }
    phaseInput = incumbent;
    const fan = repairFanSpread(world, requests, topologies, incumbent, {
      deadlineAtMs: phaseDeadlineAtMs.fanSpread,
      leaves,
      entityCount: world.entities.length,
      protectedRouteIndexes: endpointProtectedRouteIndexes,
      realization: {
        independentContinuations,
        incrementalEmission,
        incrementalLineMerges
      }
    });
    if (fan.accepted) {
      incumbent = fan.batch;
      topologies = [...fan.topologies];
    }
    diagnostics.fanSpread = {
      changed: fan.changed,
      accepted: fan.accepted
    };
    observePhase("fanSpread", phaseInput, diagnostics.fanSpread);
    completePhase("fanSpread");
    const guardedTopologyIndexes = options.guardedTopologyIndexes;
    if (guardedTopologyIndexes !== void 0 && guardedTopologyIndexes.size > 0) {
      const needsRestore = [...guardedTopologyIndexes].some((index) => {
        const baseline = initialTopologies[index];
        const current = topologies[index];
        return baseline === void 0 || current === void 0 || changedTopology([baseline], [current]);
      });
      if (needsRestore) {
        topologies = topologies.map(
          (route, index) => guardedTopologyIndexes.has(index) ? cloneRoute(initialTopologies[index], route.requestIndex) : cloneRoute(route)
        );
        incumbent = realizeRoutes(world, topologies, {
          continuationCutSelection: "exhaustive",
          independentContinuations,
          ...reuseOptions({ incrementalEmission, incrementalLineMerges }, incumbent)
        });
      }
    }
    return finish();
  }
  function assessPhase(leaves, entityCount, incumbent, candidate) {
    const changed = changedGeometry(incumbent.routes, candidate.routes);
    const accepted = changed && compareRoutingQualityCosts(candidate.quality.cost, incumbent.quality.cost) < 0 && !violatesRepairIdentity(
      candidate.routes,
      leafCutKeys(candidate.routes, candidate.geometryQuality.index, leaves, entityCount),
      leafCutKeys(incumbent.routes, incumbent.geometryQuality.index, leaves, entityCount)
    );
    return { changed, accepted };
  }
  function portalDiagnostics(result, changed, accepted) {
    return {
      metrics: result.metrics,
      changed,
      accepted
    };
  }
  function changedTopology(left, right) {
    return left.some((route, routeIndex) => {
      const candidate = right[routeIndex];
      return !candidate || route.visits.length !== candidate.visits.length || route.visits.some(
        (visit, visitIndex) => visit.corridorIndex !== candidate.visits[visitIndex]?.corridorIndex || boundaryKey(visit.entry) !== boundaryKey(candidate.visits[visitIndex]?.entry) || boundaryKey(visit.exit) !== boundaryKey(candidate.visits[visitIndex]?.exit)
      );
    });
  }
  function addCorridorPreservingRepairIndexes(target, metrics2) {
    for (const candidate of metrics2.candidates) {
      if (candidate.status === "accepted" && candidate.requiredCorridorIndex !== void 0) {
        target.add(candidate.routeIndex);
      }
    }
  }
  function changedGeometry(left, right) {
    return left.some((route, routeIndex) => {
      const candidatePoints = right[routeIndex]?.points();
      const points = route.points();
      return !candidatePoints || points.length !== candidatePoints.length || points.some(
        (point, pointIndex) => point.x !== candidatePoints[pointIndex].x || point.y !== candidatePoints[pointIndex].y
      );
    });
  }

  // packages/layout/src/routing/corridor/borderProfile.ts
  function buildCorridorBorderProfile(layoutManager, bounds, corridor, externalTextEntities) {
    const cross2 = corridorCrossSpan(corridor);
    const travel = corridorTravelSpan(corridor);
    const boundsCross = crossSpanOf(corridor.axis, bounds);
    const negativeIsDiagramBorder = cross2[0] === boundsCross[0] || cross2[0] === boundsCross[1];
    const positiveIsDiagramBorder = cross2[1] === boundsCross[0] || cross2[1] === boundsCross[1];
    const bodyEntities = negativeIsDiagramBorder && positiveIsDiagramBorder ? [] : layoutManager.findEntitiesInRange(makeRangeFromEntity(corridor.rect));
    const entities = [...bodyEntities, ...externalTextEntities];
    const negative = negativeIsDiagramBorder ? [{ span: travel, kind: "diagram-border" }] : entityBorderSpans(travel, entityCandidates(corridor.axis, travel, cross2[0], entities));
    const positive = positiveIsDiagramBorder ? [{ span: travel, kind: "diagram-border" }] : entityBorderSpans(travel, entityCandidates(corridor.axis, travel, cross2[1], entities));
    return corridor.axis === "x" ? { axis: "x", top: negative, bottom: positive } : { axis: "y", left: negative, right: positive };
  }
  function entityCandidates(axis, travel, coordinate, entities) {
    return entities.flatMap((entity) => {
      const entityCross = crossSpanOf(axis, entity);
      const entityTravel = travelSpanOf(axis, entity);
      if (entityCross[0] !== coordinate && entityCross[1] !== coordinate || !intersectPositiveSpans(travel, entityTravel, 0)) {
        return [];
      }
      return [
        {
          span: entityTravel,
          kind: "entity",
          entityId: entity.id
        }
      ];
    });
  }
  function entityBorderSpans(border, candidates) {
    if (border[0] === border[1]) {
      return [];
    }
    const cuts = [border[0], border[1]];
    const clipped = [];
    for (const candidate of candidates) {
      const span = intersectPositiveSpans(border, candidate.span, 0);
      if (span) {
        clipped.push({ ...candidate, span });
        const index = addUniqueNumber(cuts, span[0], 0);
        addUniqueNumber(cuts, span[1], Math.max(index, 0));
      }
    }
    const result = [];
    for (let index = 1; index < cuts.length; index += 1) {
      const span = [cuts[index - 1], cuts[index]];
      if (span[1] <= span[0]) {
        continue;
      }
      const midpoint2 = (span[0] + span[1]) / 2;
      let winner;
      for (const candidate of clipped) {
        if (midpoint2 > candidate.span[0] && midpoint2 < candidate.span[1] && (!winner || candidate.entityId < winner.entityId)) {
          winner = candidate;
        }
      }
      if (!winner) {
        continue;
      }
      const previous = result[result.length - 1];
      if (previous?.kind === "entity" && previous.entityId === winner.entityId && previous.span[1] === span[0]) {
        result[result.length - 1] = { ...previous, span: [previous.span[0], span[1]] };
      } else {
        result.push({ span, kind: "entity", entityId: winner.entityId });
      }
    }
    return result;
  }

  // packages/layout/src/routing/corridor/corridorIndex.ts
  var FACE_COUNT = 4;
  var CorridorIndexer = class {
    constructor(corridors, portals, attachments, layoutManager, bounds) {
      __publicField(this, "corridors");
      __publicField(this, "portals");
      __publicField(this, "attachments");
      __publicField(this, "portalsByCorridor");
      __publicField(this, "attachmentsByFace");
      __publicField(this, "borderProfileCache");
      __publicField(this, "wallFaceCache");
      __publicField(this, "layoutManager");
      __publicField(this, "externalTextEntities");
      __publicField(this, "bounds");
      __publicField(this, "entityIndexById");
      assertIndexed(corridors, "corridor");
      assertIndexed(portals, "portal");
      assertIndexed(attachments, "attachment");
      const byCorridor = new Array(corridors.length);
      for (const portal of portals) {
        const firstIndex = portal.kind === "turn" ? portal.xCorridorIndex : portal.negativeCorridorIndex;
        const secondIndex = portal.kind === "turn" ? portal.yCorridorIndex : portal.positiveCorridorIndex;
        const first = corridors[firstIndex];
        const second = corridors[secondIndex];
        if (portal.kind === "turn") {
          if (first?.axis !== "x" || second?.axis !== "y") {
            throw new Error(`portal ${portal.index}: invalid turn corridor pair`);
          }
          if (portal.rect.width <= 0 || portal.rect.height <= 0) {
            throw new Error(`portal ${portal.index}: empty turn overlap`);
          }
        } else if (first?.axis !== portal.axis || second?.axis !== portal.axis || portal.crossSpan[1] <= portal.crossSpan[0]) {
          throw new Error(`portal ${portal.index}: invalid continuation corridor pair`);
        }
        pushToSlot(byCorridor, firstIndex, portal);
        pushToSlot(byCorridor, secondIndex, portal);
      }
      const entities = layoutManager.getEntities();
      const entityCount = entities.length;
      const byFace = new Array(entityCount * FACE_COUNT);
      for (const attachment of attachments) {
        if (corridors[attachment.corridorIndex] === void 0) {
          throw new Error(`attachment ${attachment.index}: corridor missing`);
        }
        if (attachment.entityIndex < 0 || attachment.entityIndex >= entityCount) {
          throw new Error(`attachment ${attachment.index}: entity missing`);
        }
        const slot = faceSlot(attachment.entityIndex, attachment.face);
        pushToSlot(byFace, slot, attachment.index);
      }
      this.borderProfileCache = new Array(corridors.length);
      this.wallFaceCache = new Array(corridors.length);
      this.layoutManager = layoutManager;
      this.externalTextEntities = makeExternalTextEntities(entities);
      this.bounds = bounds;
      this.entityIndexById = new Map(entities.map((entity, index) => [entity.id, index]));
      const indexer = this;
      const profiledPrototype = Object.defineProperty({}, "borderProfile", {
        enumerable: false,
        get() {
          return indexer.corridorBorderProfile(this.index);
        }
      });
      const profiled = new Array(corridors.length);
      for (let index = 0; index < corridors.length; index += 1) {
        profiled[index] = Object.assign(
          Object.create(profiledPrototype),
          corridors[index]
        );
      }
      this.corridors = profiled;
      this.portals = portals;
      this.attachments = attachments;
      this.portalsByCorridor = byCorridor;
      this.attachmentsByFace = byFace;
    }
    corridorBorderProfile(corridorIndex) {
      const cached = this.borderProfileCache[corridorIndex];
      if (cached) {
        return cached;
      }
      const corridor = this.corridors[corridorIndex];
      if (!corridor) {
        throw new Error(`corridor ${corridorIndex}: missing border-profile source`);
      }
      const profile = buildCorridorBorderProfile(
        this.layoutManager,
        this.bounds,
        corridor,
        this.externalTextEntities
      );
      this.borderProfileCache[corridorIndex] = profile;
      return profile;
    }
    /**
     * Lazily cache entity faces whose plane intersects this corridor. Hot-path
     * quality scoring deliberately ignores merely-near faces outside the corridor.
     */
    wallFacesForCorridor(corridorIndex) {
      const cached = this.wallFaceCache[corridorIndex];
      if (cached) {
        return cached;
      }
      const corridor = this.corridors[corridorIndex];
      if (!corridor) {
        throw new Error(`corridor ${corridorIndex}: missing wall-face source`);
      }
      const range = {
        minX: corridor.rect.x,
        minY: corridor.rect.y,
        maxX: corridor.rect.x + corridor.rect.width,
        maxY: corridor.rect.y + corridor.rect.height
      };
      const candidates = this.layoutManager.findEntitiesInRange(range);
      for (const text of this.externalTextEntities) {
        if (touchesRange(text, range)) {
          candidates.push(text);
        }
      }
      const faces = corridorWallFaces(corridor, candidates, this.entityIndexById);
      this.wallFaceCache[corridorIndex] = faces;
      return faces;
    }
    portalsFrom(corridorIndex) {
      return this.portalsByCorridor[corridorIndex] ?? [];
    }
    otherCorridorIndex(portal, corridorIndex) {
      const firstIndex = portal.kind === "turn" ? portal.xCorridorIndex : portal.negativeCorridorIndex;
      const secondIndex = portal.kind === "turn" ? portal.yCorridorIndex : portal.positiveCorridorIndex;
      if (firstIndex === corridorIndex) {
        return secondIndex;
      }
      if (secondIndex === corridorIndex) {
        return firstIndex;
      }
      throw new Error(`portal ${portal.index}: corridor ${corridorIndex} is not an endpoint`);
    }
    attachmentsForEndpoint(endpoint) {
      const candidates = this.attachmentsByFace[faceSlot(endpoint.entityIndex, endpoint.face)] ?? [];
      const authoredTrack = endpoint.authoredTrack;
      if (authoredTrack === void 0) {
        return candidates;
      }
      return candidates.filter((attachmentIndex) => {
        const [start, end] = this.attachments[attachmentIndex].faceSpan;
        return authoredTrack >= start - AUTHORED_PORT_TOLERANCE_PX && authoredTrack <= end + AUTHORED_PORT_TOLERANCE_PX;
      });
    }
  };
  function makeExternalTextEntities(entities) {
    const result = [];
    for (const entity of entities) {
      const rect = touchExternalTextRangeToEntityClippedToBodyFace(entity);
      if (!rect) {
        continue;
      }
      result.push({ ...entity, ...rect, textPlacement: void 0 });
    }
    return result;
  }
  function touchesRange(entity, range) {
    return entity.x <= range.maxX && entity.x + entity.width >= range.minX && entity.y <= range.maxY && entity.y + entity.height >= range.minY;
  }
  function corridorWallFaces(corridor, entities, entityIndexById) {
    const result = [];
    for (const entity of entities) {
      const entityIndex = entityIndexById.get(entity.id);
      if (entityIndex === void 0) {
        continue;
      }
      const candidates = [
        {
          face: "left",
          normalAxis: "x",
          coordinate: entity.x,
          span: [entity.y, entity.y + entity.height]
        },
        {
          face: "right",
          normalAxis: "x",
          coordinate: entity.x + entity.width,
          span: [entity.y, entity.y + entity.height]
        },
        {
          face: "up",
          normalAxis: "y",
          coordinate: entity.y,
          span: [entity.x, entity.x + entity.width]
        },
        {
          face: "down",
          normalAxis: "y",
          coordinate: entity.y + entity.height,
          span: [entity.x, entity.x + entity.width]
        }
      ];
      for (const face of candidates) {
        const normalStart = face.normalAxis === "x" ? corridor.rect.x : corridor.rect.y;
        const normalEnd = normalStart + (face.normalAxis === "x" ? corridor.rect.width : corridor.rect.height);
        const travelStart = face.normalAxis === "x" ? corridor.rect.y : corridor.rect.x;
        const travelEnd = travelStart + (face.normalAxis === "x" ? corridor.rect.height : corridor.rect.width);
        if (face.coordinate < normalStart || face.coordinate > normalEnd || face.span[1] < travelStart || face.span[0] > travelEnd) {
          continue;
        }
        result.push({ entityIndex, entityId: entity.id, ...face });
      }
    }
    return result.sort(
      (left, right) => left.entityId.localeCompare(right.entityId) || left.normalAxis.localeCompare(right.normalAxis) || left.coordinate - right.coordinate || left.face.localeCompare(right.face)
    );
  }
  function pushToSlot(slots, slot, value) {
    const values = slots[slot];
    if (values) {
      values.push(value);
    } else {
      slots[slot] = [value];
    }
  }
  function assertIndexed(values, name) {
    for (let index = 0; index < values.length; index += 1) {
      if (values[index].index !== index) {
        throw new Error(`${name} ${values[index].index} stored at position ${index}`);
      }
    }
  }
  function faceSlot(entityIndex, face) {
    return entityIndex * FACE_COUNT + faceOrder(face);
  }

  // packages/layout/src/routing/corridor/directGapCorridorConstruction.ts
  var DIRECT_RESIDUAL_MIN_CROSS_PX = 24;
  var DIRECT_RESIDUAL_ENTRY_COST_PX = 1;
  var DIRECT_NEAR_MISS_WALL_TOLERANCE_PX = 20;
  var DIRECT_NEAR_MISS_MAX_CROSS_PX = 100;
  var DIRECT_NARROW_ESCAPE_CROSS_PX = 8;
  function constructDirectGapCorridors({
    bounds,
    layoutManager,
    freeSpace,
    runways
  }) {
    const entities = layoutManager.getEntities();
    const indexes = buildEntityIndexes(bounds, entities, layoutManager);
    const boundaries = indexes.boundaries;
    const atoms = {
      x: freeAtoms("x", freeSpace.x, indexes.containersByTravel.x),
      y: freeAtoms("y", freeSpace.y, indexes.containersByTravel.y)
    };
    const slices = supportedGapSlices(atoms, indexes.walls, indexes.ancestors);
    const gapRuns = buildGapRuns(slices, freeSpace, indexes.containerCrossEdges, boundaries);
    const nearMissGaps = buildNearMissGapClaims(
      indexes.walls,
      indexes.ancestors,
      freeSpace,
      indexes.containerCrossEdges,
      boundaries
    );
    const structuralClaims = { x: [], y: [] };
    for (const runway of runways) {
      structuralClaims[runway.axis].push({
        travel: travelSpanOf(runway.axis, runway),
        cross: crossSpanOf(runway.axis, runway),
        source: "runway"
      });
    }
    structuralClaims.x.push(...gapRuns.x, ...nearMissGaps.x);
    structuralClaims.y.push(...gapRuns.y, ...nearMissGaps.y);
    const pieces = partitionAtoms(atoms, structuralClaims, boundaries, freeSpace);
    const corridors = new Array(pieces.length);
    const searchTiers = new Uint8Array(pieces.length);
    const entryCosts = new Float64Array(pieces.length);
    for (let index = 0; index < pieces.length; index += 1) {
      const piece = pieces[index];
      corridors[index] = { index, axis: piece.axis, rect: piece.rect };
      searchTiers[index] = piece.searchTier === "escape" ? 1 : 0;
      entryCosts[index] = piece.entryCost;
    }
    return { corridors, searchTiers, entryCosts };
  }
  function freeAtoms(axis, freeSpace, containers) {
    const result = [];
    let nextContainer = 0;
    const active = [];
    const slabEdges = [];
    for (let slabIndex = 0; slabIndex < freeSpace.travelCuts.length - 1; slabIndex += 1) {
      const travelStart = freeSpace.travelCuts[slabIndex];
      const travelEnd = freeSpace.travelCuts[slabIndex + 1];
      if (travelEnd <= travelStart) {
        continue;
      }
      const travel = [travelStart, travelEnd];
      while (nextContainer < containers.length) {
        const candidate = containers[nextContainer];
        if ((axis === "x" ? candidate.x : candidate.y) > travelStart) {
          break;
        }
        active.push(candidate);
        nextContainer += 1;
      }
      let activeCount = 0;
      for (let index = 0; index < active.length; index += 1) {
        const candidate = active[index];
        const candidateEnd = axis === "x" ? candidate.x + candidate.width : candidate.y + candidate.height;
        if (candidateEnd >= travelEnd) {
          active[activeCount] = candidate;
          activeCount += 1;
        }
      }
      active.length = activeCount;
      slabEdges.length = 0;
      for (const container of active) {
        const start = axis === "x" ? container.y : container.x;
        slabEdges.push(start, start + (axis === "x" ? container.height : container.width));
      }
      slabEdges.sort((left, right) => left - right);
      for (let intervalIndex = freeSpace.slabOffsets[slabIndex]; intervalIndex < freeSpace.slabOffsets[slabIndex + 1]; intervalIndex += 1) {
        const crossStart = freeSpace.crossSpans[intervalIndex * 2];
        const crossEnd = freeSpace.crossSpans[intervalIndex * 2 + 1];
        let cursor = crossStart;
        if (slabEdges.length > 0) {
          const low = upperBound(slabEdges, crossStart);
          for (let edgeIndex = low; edgeIndex < slabEdges.length; edgeIndex += 1) {
            const cut = slabEdges[edgeIndex];
            if (cut >= crossEnd) {
              break;
            }
            if (cut <= cursor) {
              continue;
            }
            result.push({ travel, cross: [cursor, cut], slabIndex });
            cursor = cut;
          }
        }
        if (crossEnd > cursor) {
          result.push({ travel, cross: [cursor, crossEnd], slabIndex });
        }
      }
    }
    return result;
  }
  function buildEntityIndexes(bounds, entities, layoutManager) {
    const sides = {
      x: { negative: newWallSideAccumulator(), positive: newWallSideAccumulator() },
      y: { negative: newWallSideAccumulator(), positive: newWallSideAccumulator() }
    };
    const fullTravel = {
      x: [bounds.x, bounds.x + bounds.width],
      y: [bounds.y, bounds.y + bounds.height]
    };
    appendWall(sides.x.negative, crossSpanOf("x", bounds)[0], fullTravel.x, -1, false);
    appendWall(sides.x.positive, crossSpanOf("x", bounds)[1], fullTravel.x, -1, false);
    appendWall(sides.y.negative, crossSpanOf("y", bounds)[0], fullTravel.y, -1, false);
    appendWall(sides.y.positive, crossSpanOf("y", bounds)[1], fullTravel.y, -1, false);
    const boundaries = { x: [], y: [] };
    const crossEdgesX = [];
    const crossEdgesY = [];
    const containersX = [];
    const containersY = [];
    const indexById = /* @__PURE__ */ new Map();
    for (let entityIndex = 0; entityIndex < entities.length; entityIndex += 1) {
      const entity = entities[entityIndex];
      indexById.set(entity.id, entityIndex);
      const isContainer = entity.isContainer === true;
      for (const axis of ["x", "y"]) {
        const [crossStart, crossEnd] = crossSpanOf(axis, entity);
        const travel = travelSpanOf(axis, entity);
        addEntityWall(sides[axis].negative, entity, entityIndex, axis, crossEnd, travel, false);
        addEntityWall(sides[axis].positive, entity, entityIndex, axis, crossStart, travel, false);
        if (isContainer) {
          addEntityWall(sides[axis].negative, entity, entityIndex, axis, crossStart, travel, true);
          addEntityWall(sides[axis].positive, entity, entityIndex, axis, crossEnd, travel, true);
          boundaries[axis].push(
            { coord: travel[0], cross: [crossStart, crossEnd] },
            { coord: travel[1], cross: [crossStart, crossEnd] }
          );
        }
      }
      if (isContainer) {
        crossEdgesX.push(entity.y, entity.y + entity.height);
        crossEdgesY.push(entity.x, entity.x + entity.width);
        containersX.push(entity);
        containersY.push(entity);
      }
    }
    boundaries.x.sort((left, right) => left.coord - right.coord);
    boundaries.y.sort((left, right) => left.coord - right.coord);
    containersX.sort((left, right) => left.x - right.x);
    containersY.sort((left, right) => left.y - right.y);
    const parentMapping = layoutManager.getParentMapping();
    const ancestorOffsets = new Uint32Array(entities.length + 1);
    const ancestorItems = [];
    for (let entityIndex = 0; entityIndex < entities.length; entityIndex += 1) {
      for (const ancestorId of parentMapping[entities[entityIndex].id] ?? []) {
        const ancestorIndex = indexById.get(ancestorId);
        if (ancestorIndex !== void 0) {
          ancestorItems.push(ancestorIndex);
        }
      }
      ancestorOffsets[entityIndex + 1] = ancestorItems.length;
    }
    return {
      walls: {
        x: { negative: packWallSide(sides.x.negative), positive: packWallSide(sides.x.positive) },
        y: { negative: packWallSide(sides.y.negative), positive: packWallSide(sides.y.positive) }
      },
      boundaries,
      containerCrossEdges: {
        // Bare .sort() on an Int32Array is numeric (typed-array default), not the
        // lexicographic Array default it resembles.
        x: Int32Array.from(crossEdgesX).sort(),
        y: Int32Array.from(crossEdgesY).sort()
      },
      ancestors: { offsets: ancestorOffsets, items: Int32Array.from(ancestorItems) },
      containersByTravel: { x: containersX, y: containersY }
    };
  }
  function newWallSideAccumulator() {
    return { boundaries: [], spanStarts: [], spanEnds: [], entityIndexes: [], innerFlags: [] };
  }
  function addEntityWall(side, entity, entityIndex, axis, boundary, travel, innerContainer) {
    for (const span of wallSpansOutsideTitle(entity, axis, boundary, travel, innerContainer)) {
      appendWall(side, boundary, span, entityIndex, innerContainer);
    }
  }
  function appendWall(side, boundary, span, entityIndex, innerContainer) {
    side.boundaries.push(boundary);
    side.spanStarts.push(span[0]);
    side.spanEnds.push(span[1]);
    side.entityIndexes.push(entityIndex);
    side.innerFlags.push(innerContainer ? 1 : 0);
  }
  function packWallSide(side) {
    const count = side.boundaries.length;
    const order = new Array(count);
    for (let index = 0; index < count; index += 1) {
      order[index] = index;
    }
    order.sort((left, right) => side.boundaries[left] - side.boundaries[right] || left - right);
    const coords = [];
    const offsets = [0];
    const spanStarts = new Int32Array(count);
    const spanEnds = new Int32Array(count);
    const entityIndexes = new Int32Array(count);
    const innerFlags = new Uint8Array(count);
    for (let position = 0; position < count; position += 1) {
      const source = order[position];
      const boundary = side.boundaries[source];
      if (coords.length === 0 || coords[coords.length - 1] !== boundary) {
        coords.push(boundary);
        offsets.push(position);
      }
      offsets[offsets.length - 1] = position + 1;
      spanStarts[position] = side.spanStarts[source];
      spanEnds[position] = side.spanEnds[source];
      entityIndexes[position] = side.entityIndexes[source];
      innerFlags[position] = side.innerFlags[source];
    }
    return {
      coords: Int32Array.from(coords),
      offsets: Uint32Array.from(offsets),
      spanStarts,
      spanEnds,
      entityIndexes,
      innerFlags
    };
  }
  function supportedGapSlices(atoms, walls, ancestors) {
    const result = [];
    for (const axis of ["x", "y"]) {
      for (const atom of atoms[axis]) {
        const negative = walls[axis].negative;
        const positive = walls[axis].positive;
        const negativeCoord = nearestCoordIndex(negative.coords, atom.cross[0]);
        if (negativeCoord < 0) {
          continue;
        }
        const positiveCoord = nearestCoordIndex(positive.coords, atom.cross[1]);
        if (positiveCoord < 0) {
          continue;
        }
        if (hasFacingWallPair(negative, negativeCoord, positive, positiveCoord, atom.travel, ancestors)) {
          result.push({ axis, travel: atom.travel, cross: atom.cross });
        }
      }
    }
    return result;
  }
  function hasFacingWallPair(negative, negativeCoord, positive, positiveCoord, travel, ancestors) {
    const travelStart = travel[0];
    const travelEnd = travel[1];
    for (let left = negative.offsets[negativeCoord]; left < negative.offsets[negativeCoord + 1]; left += 1) {
      if (negative.spanStarts[left] > travelStart || negative.spanEnds[left] < travelEnd) {
        continue;
      }
      for (let right = positive.offsets[positiveCoord]; right < positive.offsets[positiveCoord + 1]; right += 1) {
        if (positive.spanStarts[right] <= travelStart && positive.spanEnds[right] >= travelEnd && validWallPair(
          negative.entityIndexes[left],
          negative.innerFlags[left] === 1,
          positive.entityIndexes[right],
          positive.innerFlags[right] === 1,
          ancestors
        )) {
          return true;
        }
      }
    }
    return false;
  }
  function validWallPair(negativeEntity, negativeInner, positiveEntity, positiveInner, ancestors) {
    if (negativeEntity < 0 && positiveEntity < 0) {
      return false;
    }
    if (negativeEntity >= 0 && negativeEntity === positiveEntity) {
      return false;
    }
    if (negativeInner && (positiveEntity < 0 || !hasAncestor(ancestors, positiveEntity, negativeEntity))) {
      return false;
    }
    if (positiveInner && (negativeEntity < 0 || !hasAncestor(ancestors, negativeEntity, positiveEntity))) {
      return false;
    }
    return true;
  }
  function hasAncestor(ancestors, entityIndex, ancestorIndex) {
    for (let cursor = ancestors.offsets[entityIndex]; cursor < ancestors.offsets[entityIndex + 1]; cursor += 1) {
      if (ancestors.items[cursor] === ancestorIndex) {
        return true;
      }
    }
    return false;
  }
  function buildGapRuns(slices, freeSpace, containerCrossEdges, boundaries) {
    const groups = {
      x: /* @__PURE__ */ new Map(),
      y: /* @__PURE__ */ new Map()
    };
    for (const slice of slices) {
      const byCrossStart = groups[slice.axis];
      let byCrossEnd = byCrossStart.get(slice.cross[0]);
      if (!byCrossEnd) {
        byCrossEnd = /* @__PURE__ */ new Map();
        byCrossStart.set(slice.cross[0], byCrossEnd);
      }
      const values = byCrossEnd.get(slice.cross[1]);
      if (values) {
        values.push(slice);
      } else {
        byCrossEnd.set(slice.cross[1], [slice]);
      }
    }
    const result = { x: [], y: [] };
    for (const axis of ["x", "y"]) {
      for (const byCrossEnd of groups[axis].values()) {
        for (const group of byCrossEnd.values()) {
          group.sort(
            (left, right) => left.travel[0] - right.travel[0] || left.travel[1] - right.travel[1]
          );
          let start = group[0].travel[0];
          let end = group[0].travel[1];
          const cross2 = group[0].cross;
          for (let index = 1; index < group.length; index += 1) {
            const next = group[index];
            const candidateTravel = [start, Math.max(end, next.travel[1])];
            if (freeSpaceContains(freeSpace[axis], candidateTravel, cross2) && !crossesParallelContainerBoundary(axis, cross2, containerCrossEdges)) {
              end = candidateTravel[1];
            } else {
              result[axis].push(
                claimForGapRun(axis, [start, end], cross2, freeSpace, containerCrossEdges, boundaries)
              );
              start = next.travel[0];
              end = next.travel[1];
            }
          }
          result[axis].push(
            claimForGapRun(axis, [start, end], cross2, freeSpace, containerCrossEdges, boundaries)
          );
        }
      }
    }
    return result;
  }
  function buildNearMissGapClaims(walls, ancestors, freeSpace, containerCrossEdges, boundaries) {
    const result = { x: [], y: [] };
    const seen = /* @__PURE__ */ new Set();
    for (const axis of ["x", "y"]) {
      const negative = walls[axis].negative;
      const positive = walls[axis].positive;
      let windowStart = 0;
      for (let negativeIdx = 0; negativeIdx < negative.coords.length; negativeIdx += 1) {
        const negativeCoord = negative.coords[negativeIdx];
        while (windowStart < positive.coords.length && positive.coords[windowStart] <= negativeCoord) {
          windowStart += 1;
        }
        for (let positiveIdx = windowStart; positiveIdx < positive.coords.length; positiveIdx += 1) {
          const positiveCoord = positive.coords[positiveIdx];
          const cross2 = [negativeCoord, positiveCoord];
          if (cross2[1] - cross2[0] > DIRECT_NEAR_MISS_MAX_CROSS_PX) {
            break;
          }
          if (crossesParallelContainerBoundary(axis, cross2, containerCrossEdges)) {
            continue;
          }
          for (let left = negative.offsets[negativeIdx]; left < negative.offsets[negativeIdx + 1]; left += 1) {
            if (negative.entityIndexes[left] < 0) {
              continue;
            }
            for (let right = positive.offsets[positiveIdx]; right < positive.offsets[positiveIdx + 1]; right += 1) {
              if (positive.entityIndexes[right] < 0 || !validWallPair(
                negative.entityIndexes[left],
                negative.innerFlags[left] === 1,
                positive.entityIndexes[right],
                positive.innerFlags[right] === 1,
                ancestors
              )) {
                continue;
              }
              const travel = nearMissUnion(
                [negative.spanStarts[left], negative.spanEnds[left]],
                [positive.spanStarts[right], positive.spanEnds[right]]
              );
              if (!travel || !freeSpaceContains(freeSpace[axis], travel, cross2)) {
                continue;
              }
              const claim = claimForGapRun(
                axis,
                travel,
                cross2,
                freeSpace,
                containerCrossEdges,
                boundaries
              );
              const key = `${axis}:${claim.travel[0]}:${claim.travel[1]}:${claim.cross[0]}:${claim.cross[1]}`;
              if (!seen.has(key)) {
                seen.add(key);
                result[axis].push(claim);
              }
            }
          }
        }
      }
    }
    return result;
  }
  function nearMissUnion(left, right) {
    const miss = Math.max(left[0], right[0]) - Math.min(left[1], right[1]);
    if (miss <= 0 || miss > DIRECT_NEAR_MISS_WALL_TOLERANCE_PX) {
      return void 0;
    }
    return [Math.min(left[0], right[0]), Math.max(left[1], right[1])];
  }
  function claimForGapRun(axis, travel, cross2, freeSpace, containerCrossEdges, boundaries) {
    if (crossesParallelContainerBoundary(axis, cross2, containerCrossEdges)) {
      return { travel, cross: cross2, source: "gap" };
    }
    return {
      travel: extendTravelThroughFreeSpace(freeSpace[axis], boundaries[axis], travel, cross2),
      cross: cross2,
      source: "gap"
    };
  }
  function extendTravelThroughFreeSpace(freeSpace, boundaries, travel, cross2) {
    let backwardCap = Number.NEGATIVE_INFINITY;
    let forwardCap = Number.POSITIVE_INFINITY;
    for (const boundary of boundaries) {
      if (!spansOverlapPositive(boundary.cross, cross2, 0)) {
        continue;
      }
      if (boundary.coord < travel[0]) {
        backwardCap = Math.max(backwardCap, boundary.coord);
      } else if (boundary.coord > travel[1]) {
        forwardCap = Math.min(forwardCap, boundary.coord);
      }
    }
    return [
      certifiedRunFrom(freeSpace, travel[0], cross2, -1, backwardCap),
      certifiedRunFrom(freeSpace, travel[1], cross2, 1, forwardCap)
    ];
  }
  function partitionAtoms(atoms, claims, boundaries, freeSpace) {
    const state = {
      lanes: { x: /* @__PURE__ */ new Map(), y: /* @__PURE__ */ new Map() },
      survivors: { x: [], y: [] },
      dirtyLanes: { x: /* @__PURE__ */ new Set(), y: /* @__PURE__ */ new Set() },
      travelGrown: { x: /* @__PURE__ */ new Set(), y: /* @__PURE__ */ new Set() }
    };
    for (const axis of ["x", "y"]) {
      const sortedClaims = claims[axis].sort((left, right) => left.travel[0] - right.travel[0]);
      const tables = buildPartitionTables(atoms[axis], sortedClaims, freeSpace[axis].travelCuts);
      partitionAxisAtoms(axis, atoms[axis], sortedClaims, tables, state);
    }
    return finalizeCoalescedPieces(state, boundaries);
  }
  function buildPartitionTables(atoms, claims, travelCuts) {
    const overlay = [];
    for (const claim of claims) {
      if (nearestCoordIndex(travelCuts, claim.travel[0]) < 0) {
        overlay.push(claim.travel[0]);
      }
      if (nearestCoordIndex(travelCuts, claim.travel[1]) < 0) {
        overlay.push(claim.travel[1]);
      }
    }
    let travelCoords = travelCuts;
    let baseToExt = null;
    if (overlay.length > 0) {
      const kept = sortedUnique(overlay);
      travelCoords = mergeSortedCoords(travelCuts, kept);
      baseToExt = new Int32Array(travelCuts.length);
      let inserted = 0;
      for (let baseIndex = 0; baseIndex < travelCuts.length; baseIndex += 1) {
        while (inserted < kept.length && kept[inserted] < travelCuts[baseIndex]) {
          inserted += 1;
        }
        baseToExt[baseIndex] = baseIndex + inserted;
      }
    }
    const atomTravelStart = new Int32Array(atoms.length);
    const atomTravelEnd = new Int32Array(atoms.length);
    for (let index = 0; index < atoms.length; index += 1) {
      const startCut = atoms[index].slabIndex;
      atomTravelStart[index] = baseToExt === null ? startCut : baseToExt[startCut];
      atomTravelEnd[index] = baseToExt === null ? startCut + 1 : baseToExt[startCut + 1];
    }
    const claimTravelStart = new Int32Array(claims.length);
    const claimTravelEnd = new Int32Array(claims.length);
    for (let index = 0; index < claims.length; index += 1) {
      const claim = claims[index];
      claimTravelStart[index] = nearestCoordIndex(travelCoords, claim.travel[0]);
      claimTravelEnd[index] = nearestCoordIndex(travelCoords, claim.travel[1]);
    }
    return {
      travelCoords,
      atomTravelStart,
      atomTravelEnd,
      claimTravelStart,
      claimTravelEnd
    };
  }
  function nearestCoordIndex(coords, value) {
    const low = lowerBoundInt32(coords, value);
    return low < coords.length && coords[low] === value ? low : -1;
  }
  function mergeSortedCoords(base, overlay) {
    const merged = new Int32Array(base.length + overlay.length);
    let baseIndex = 0;
    let overlayIndex = 0;
    let write = 0;
    while (baseIndex < base.length || overlayIndex < overlay.length) {
      if (overlayIndex >= overlay.length || baseIndex < base.length && base[baseIndex] <= overlay[overlayIndex]) {
        merged[write] = base[baseIndex];
        baseIndex += 1;
      } else {
        merged[write] = overlay[overlayIndex];
        overlayIndex += 1;
      }
      write += 1;
    }
    return merged;
  }
  function partitionAxisAtoms(axis, atoms, claims, tables, state) {
    const { travelCoords, claimTravelStart, claimTravelEnd } = tables;
    const survivors = state.survivors[axis];
    let nextClaimIndex = 0;
    const activeClaims = [];
    let activeSlabStart = -1;
    const relevant = [];
    const open = [];
    const travelCutIdx = [];
    const crossCuts = [];
    for (let atomIndex = 0; atomIndex < atoms.length; atomIndex += 1) {
      const atomTs = tables.atomTravelStart[atomIndex];
      const atomTe = tables.atomTravelEnd[atomIndex];
      const atomCross = atoms[atomIndex].cross;
      const atomCs = atomCross[0];
      const atomCe = atomCross[1];
      if (activeSlabStart !== atomTs) {
        activeSlabStart = atomTs;
        let keep = 0;
        for (let index = 0; index < activeClaims.length; index += 1) {
          if (claimTravelEnd[activeClaims[index]] > atomTs) {
            activeClaims[keep] = activeClaims[index];
            keep += 1;
          }
        }
        activeClaims.length = keep;
        while (nextClaimIndex < claims.length && claimTravelStart[nextClaimIndex] < atomTe) {
          activeClaims.push(nextClaimIndex);
          nextClaimIndex += 1;
        }
      }
      relevant.length = 0;
      travelCutIdx.length = 0;
      travelCutIdx.push(atomTs, atomTe);
      for (let index = 0; index < activeClaims.length; index += 1) {
        const claimIndex = activeClaims[index];
        const claimTs = claimTravelStart[claimIndex];
        const claimTe = claimTravelEnd[claimIndex];
        if (claimTs >= atomTe || claimTe <= atomTs) {
          continue;
        }
        const claimCross = claims[claimIndex].cross;
        if (claimCross[0] >= atomCe || claimCross[1] <= atomCs) {
          continue;
        }
        relevant.push(claimIndex);
        if (claimTs > atomTs && claimTs < atomTe) {
          addUniqueNumber(travelCutIdx, claimTs, 0);
        }
        if (claimTe > atomTs && claimTe < atomTe) {
          addUniqueNumber(travelCutIdx, claimTe, 0);
        }
      }
      let nextRelevant = 0;
      open.length = 0;
      for (let travelIndex = 0; travelIndex < travelCutIdx.length - 1; travelIndex += 1) {
        const sliceTs = travelCutIdx[travelIndex];
        const sliceTe = travelCutIdx[travelIndex + 1];
        while (nextRelevant < relevant.length && claimTravelStart[relevant[nextRelevant]] < sliceTe) {
          open.push(relevant[nextRelevant]);
          nextRelevant += 1;
        }
        let openCount = 0;
        for (let index = 0; index < open.length; index += 1) {
          if (claimTravelEnd[open[index]] > sliceTs) {
            open[openCount] = open[index];
            openCount += 1;
          }
        }
        open.length = openCount;
        crossCuts.length = 0;
        crossCuts.push(atomCs, atomCe);
        for (let index = 0; index < open.length; index += 1) {
          const claimCross = claims[open[index]].cross;
          const claimCs = claimCross[0];
          const claimCe = claimCross[1];
          if (claimCs > atomCs && claimCs < atomCe) {
            addUniqueNumber(crossCuts, claimCs, 0);
          }
          if (claimCe > atomCs && claimCe < atomCe) {
            addUniqueNumber(crossCuts, claimCe, 0);
          }
        }
        const travel = [travelCoords[sliceTs], travelCoords[sliceTe]];
        for (let crossIndex = 0; crossIndex < crossCuts.length - 1; crossIndex += 1) {
          const cellCs = crossCuts[crossIndex];
          const cellCe = crossCuts[crossIndex + 1];
          let rank = SOURCE_RANK.residual;
          for (let index = 0; index < open.length; index += 1) {
            const claimIndex = open[index];
            if (claimTravelStart[claimIndex] > sliceTs || claimTravelEnd[claimIndex] < sliceTe) {
              continue;
            }
            const claim = claims[claimIndex];
            if (claim.cross[0] <= cellCs && claim.cross[1] >= cellCe) {
              if (claim.source === "runway") {
                rank = SOURCE_RANK.runway;
                break;
              }
              rank = SOURCE_RANK.gap;
            }
          }
          emitCoalescePiece(state, survivors, axis, travel, [cellCs, cellCe], rank);
        }
      }
    }
  }
  var SOURCE_RANK = {
    residual: 0,
    gap: 1,
    runway: 2
  };
  var SOURCE_BY_RANK = ["residual", "gap", "runway"];
  function coalesceLaneOf(state, axis, crossStart, crossEnd) {
    const byCrossStart = state.lanes[axis];
    let byCrossEnd = byCrossStart.get(crossStart);
    if (!byCrossEnd) {
      byCrossEnd = /* @__PURE__ */ new Map();
      byCrossStart.set(crossStart, byCrossEnd);
    }
    let lane = byCrossEnd.get(crossEnd);
    if (!lane) {
      lane = [];
      byCrossEnd.set(crossEnd, lane);
    }
    return lane;
  }
  function emitCoalescePiece(state, survivors, axis, travel, cross2, rank) {
    const lane = coalesceLaneOf(state, axis, cross2[0], cross2[1]);
    const tail = lane[lane.length - 1];
    if (tail !== void 0 && travel[0] <= tail.te) {
      if (travel[1] > tail.te) {
        tail.te = travel[1];
      }
      if (rank > tail.rank) {
        tail.rank = rank;
      }
      return;
    }
    const piece = {
      axis,
      ts: travel[0],
      te: travel[1],
      cs: cross2[0],
      ce: cross2[1],
      rank,
      alive: true,
      lane
    };
    lane.push(piece);
    survivors.push(piece);
  }
  function finalizeCoalescedPieces(state, boundaries) {
    const coalesced = [];
    for (const axis of ["x", "y"]) {
      let pieces = state.survivors[axis];
      pieces.sort(compareTravelMajor);
      while (true) {
        const crossMerges = crossStackSweep(state, axis, pieces, boundaries);
        const travelMerges = absorbDirtyLaneRuns(state, axis);
        if (crossMerges + travelMerges === 0) {
          break;
        }
        pieces = pieces.filter((piece) => piece.alive);
        for (const piece of state.travelGrown[axis]) {
          reinsertPiece(pieces, piece);
        }
        state.travelGrown[axis].clear();
      }
      pieces.sort(compareCoalescedCorridors);
      for (const piece of pieces) {
        coalesced.push(materializeCoalescedPiece(piece));
      }
    }
    return coalesced;
  }
  function compareTravelMajor(left, right) {
    return left.ts - right.ts || left.te - right.te || left.cs - right.cs;
  }
  function compareCoalescedCorridors(left, right) {
    return left.cs - right.cs || left.ce - right.ce || left.ts - right.ts || left.te - right.te;
  }
  function materializeCoalescedPiece(piece) {
    const source = SOURCE_BY_RANK[piece.rank];
    const rect = piece.axis === "x" ? { x: piece.ts, y: piece.cs, width: piece.te - piece.ts, height: piece.ce - piece.cs } : { x: piece.cs, y: piece.ts, width: piece.ce - piece.cs, height: piece.te - piece.ts };
    return {
      axis: piece.axis,
      rect,
      ...pieceClassification(source, piece.ce - piece.cs)
    };
  }
  function crossStackSweep(state, axis, pieces, boundaries) {
    let merges = 0;
    let previous;
    for (const piece of pieces) {
      if (previous !== void 0 && previous.ts === piece.ts && previous.te === piece.te && previous.cs <= piece.ce && piece.cs <= previous.ce && !crossesContainerWallAt(
        boundaries[piece.axis === "x" ? "y" : "x"],
        piece.cs,
        piece.ts,
        piece.te
      )) {
        removeFromLane(previous);
        removeFromLane(piece);
        piece.alive = false;
        if (piece.cs < previous.cs) {
          previous.cs = piece.cs;
        }
        if (piece.ce > previous.ce) {
          previous.ce = piece.ce;
        }
        if (piece.rank > previous.rank) {
          previous.rank = piece.rank;
        }
        const lane = coalesceLaneOf(state, previous.axis, previous.cs, previous.ce);
        insertIntoSortedBy(lane, previous, compareTravelStart);
        previous.lane = lane;
        state.dirtyLanes[axis].add(lane);
        merges += 1;
      } else {
        previous = piece;
      }
    }
    return merges;
  }
  function absorbDirtyLaneRuns(state, axis) {
    let merges = 0;
    for (const lane of state.dirtyLanes[axis]) {
      let write = 0;
      for (let read = 0; read < lane.length; read += 1) {
        const piece = lane[read];
        const previous = write > 0 ? lane[write - 1] : void 0;
        if (previous !== void 0 && piece.ts <= previous.te) {
          if (piece.te > previous.te) {
            previous.te = piece.te;
            state.travelGrown[axis].add(previous);
          }
          if (piece.rank > previous.rank) {
            previous.rank = piece.rank;
          }
          piece.alive = false;
          merges += 1;
        } else {
          lane[write] = piece;
          write += 1;
        }
      }
      lane.length = write;
    }
    state.dirtyLanes[axis].clear();
    return merges;
  }
  function removeFromLane(piece) {
    const lane = piece.lane;
    const index = lane.indexOf(piece);
    lane.copyWithin(index, index + 1);
    lane.length -= 1;
  }
  var compareTravelStart = (left, right) => left.ts - right.ts;
  function reinsertPiece(pieces, piece) {
    const index = pieces.indexOf(piece);
    pieces.copyWithin(index, index + 1);
    pieces.length -= 1;
    insertIntoSortedBy(pieces, piece, compareTravelMajor);
  }
  function pieceClassification(source, crossWidth) {
    if (crossWidth < DIRECT_NARROW_ESCAPE_CROSS_PX) {
      return { searchTier: "escape", entryCost: 0 };
    }
    if (source === "residual") {
      const ordinaryResidual = crossWidth >= DIRECT_RESIDUAL_MIN_CROSS_PX;
      return ordinaryResidual ? { searchTier: "preferred", entryCost: DIRECT_RESIDUAL_ENTRY_COST_PX } : { searchTier: "escape", entryCost: 0 };
    }
    return { searchTier: "preferred", entryCost: 0 };
  }
  function crossesContainerWallAt(boundaries, coord, spanStart, spanEnd) {
    for (const boundary of boundaries) {
      if (boundary.coord > coord) {
        break;
      }
      if (boundary.coord < coord) {
        continue;
      }
      if (Math.min(boundary.cross[1], spanEnd) > Math.max(boundary.cross[0], spanStart)) {
        return true;
      }
    }
    return false;
  }
  function freeSpaceContains(freeSpace, travel, cross2) {
    return certifiedRunFrom(freeSpace, travel[0], cross2, 1, travel[1]) >= travel[1];
  }
  function crossesParallelContainerBoundary(axis, cross2, containerCrossEdges) {
    const edges = containerCrossEdges[axis];
    const low = upperBoundInt32(edges, cross2[0]);
    return low < edges.length && edges[low] < cross2[1];
  }
  function wallSpansOutsideTitle(entity, axis, boundary, span, innerContainer) {
    if (!innerContainer || !entity.textPlacement) {
      return [span];
    }
    const title = entity.textPlacement;
    const titleCross = axis === "x" ? [entity.y + title.relativeY, entity.y + title.relativeY + title.height] : [entity.x + title.relativeX, entity.x + title.relativeX + title.width];
    if (titleCross[0] > boundary || titleCross[1] < boundary) {
      return [span];
    }
    const titleTravel = axis === "x" ? [entity.x + title.relativeX, entity.x + title.relativeX + title.width] : [entity.y + title.relativeY, entity.y + title.relativeY + title.height];
    return subtractSpan(span, titleTravel, 0);
  }

  // packages/layout/src/routing/corridor/landingZones.ts
  var FLOOR_EPSILON = 1e-6;
  var LANDING_ZONE_MIN_DEPTH_PX = 24;
  var LANDING_ZONE_MULTI_FACE_DEPTH_PX = 40;
  var LANDING_ZONE_PREFERRED_DEPTH_PX = 100;
  var LANDING_ZONE_OVERLAP_SHARE = 0.85;
  var LANDING_ZONE_JOIN_CLEARANCE_PX = 8;
  function planLandingZones(bounds, entities, requests, freeSpace) {
    const faces = usedFaces(entities, requests);
    const nearest = faces.map((face, index) => nearestOpposingFace(faces, face, index));
    const handled = new Uint8Array(faces.length);
    const zoneRects = [];
    for (let index = 0; index < faces.length; index += 1) {
      if (faceHasCertifiedOutwardRun(faces[index], freeSpace)) {
        handled[index] = 1;
      }
    }
    for (let index = 0; index < faces.length; index += 1) {
      if (handled[index]) {
        continue;
      }
      const face = faces[index];
      const oppositeIndex = nearest[index];
      if (oppositeIndex !== void 0 && !handled[oppositeIndex] && nearest[oppositeIndex] === index) {
        const opposite = faces[oppositeIndex];
        handled[index] = 1;
        handled[oppositeIndex] = 1;
        const shared = sharedZone(face, opposite, entities);
        if (shared) {
          zoneRects.push({ ...shared, axis: faceNormalAxis(face.face) });
          continue;
        }
        const gap = Math.abs(opposite.plane - face.plane);
        if (gap > LANDING_ZONE_MIN_DEPTH_PX * 2 && nestedFaceSpan(face, opposite, entities)) {
          const [outer, inner] = spanContains(face.crossSpan, opposite.crossSpan, 0) ? [face, opposite] : [opposite, face];
          addIndividualZone(zoneRects, outer, bounds, entities, preferredDepthForFace(outer));
          addIndividualZone(zoneRects, inner, bounds, entities, preferredDepthForFace(inner));
          continue;
        }
        addIndividualZone(
          zoneRects,
          face,
          bounds,
          entities,
          Math.min(preferredDepthForFace(face), gap / 2)
        );
        addIndividualZone(
          zoneRects,
          opposite,
          bounds,
          entities,
          Math.min(preferredDepthForFace(opposite), gap / 2)
        );
        continue;
      }
      handled[index] = 1;
      addIndividualZone(zoneRects, face, bounds, entities, preferredDepthForFace(face));
    }
    return zoneRects;
  }
  function nestedFaceSpan(first, second, entities) {
    if (spansEqual(first.crossSpan, second.crossSpan, 0)) {
      return false;
    }
    const inner = spanContains(first.crossSpan, second.crossSpan, 0) ? second.crossSpan : spanContains(second.crossSpan, first.crossSpan, 0) ? first.crossSpan : void 0;
    if (inner === void 0 || ![...first.authoredTracks, ...second.authoredTracks].every(
      (track) => track >= inner[0] && track <= inner[1]
    )) {
      return false;
    }
    const bridge = normalRect(first, Math.abs(second.plane - first.plane), inner);
    return leafClear(
      expandRect(bridge, LANDING_ZONE_JOIN_CLEARANCE_PX),
      entities,
      first.entityIndex,
      second.entityIndex
    );
  }
  function faceHasCertifiedOutwardRun(face, freeSpace) {
    const lane = freeSpace[faceNormalAxis(face.face)];
    const target = face.plane + face.sign * LANDING_ZONE_PREFERRED_DEPTH_PX;
    const reached = certifiedRunFrom(lane, face.plane, face.crossSpan, face.sign, target);
    return face.sign > 0 ? reached >= target : reached <= target;
  }
  function preferredDepthForFace(face) {
    return face.requestCount === 1 ? LANDING_ZONE_PREFERRED_DEPTH_PX : LANDING_ZONE_MULTI_FACE_DEPTH_PX;
  }
  function usedFaces(entities, requests) {
    const byKey = /* @__PURE__ */ new Map();
    for (const request of requests) {
      for (const endpoint of [request.from, request.to]) {
        const key = `${endpoint.entityIndex}:${faceOrder(endpoint.face)}`;
        const existing = byKey.get(key) ?? {
          entityIndex: endpoint.entityIndex,
          face: endpoint.face,
          authored: [],
          requestCount: 0
        };
        existing.requestCount += 1;
        if (endpoint.authoredTrack !== void 0) {
          existing.authored.push(endpoint.authoredTrack);
        }
        byKey.set(key, existing);
      }
    }
    return [...byKey.values()].sort(
      (left, right) => left.entityIndex - right.entityIndex || faceOrder(left.face) - faceOrder(right.face)
    ).map(({ entityIndex, face, authored, requestCount }) => ({
      entityIndex,
      face,
      plane: terminalFacePlane(entities[entityIndex], face),
      crossSpan: faceCrossSpan(entities[entityIndex], face),
      sign: outwardSign(face),
      authoredTracks: [...new Set(authored)].sort((left, right) => left - right),
      requestCount
    }));
  }
  function nearestOpposingFace(faces, source, sourceIndex) {
    let best;
    let bestGap = Number.POSITIVE_INFINITY;
    for (let index = 0; index < faces.length; index += 1) {
      const candidate = faces[index];
      const gap = source.sign * (candidate.plane - source.plane);
      if (index === sourceIndex || candidate.face !== OPPOSITE_DIRECTION[source.face] || gap <= 0 || spanOverlapLength(source.crossSpan, candidate.crossSpan) <= 0) {
        continue;
      }
      if (gap < bestGap || gap === bestGap && index < (best ?? index)) {
        best = index;
        bestGap = gap;
      }
    }
    return best;
  }
  function sharedZone(first, second, entities) {
    const overlap = intersectPositiveSpans(first.crossSpan, second.crossSpan, 0);
    if (!overlap) {
      return void 0;
    }
    const unionScale = Math.max(spanLength(first.crossSpan), spanLength(second.crossSpan));
    if (spanLength(overlap) / unionScale < LANDING_ZONE_OVERLAP_SHARE || ![...first.authoredTracks, ...second.authoredTracks].every(
      (track) => track >= overlap[0] && track <= overlap[1]
    )) {
      return void 0;
    }
    const rect = normalRect(first, Math.abs(second.plane - first.plane), overlap);
    if (!leafClear(rect, entities, first.entityIndex, second.entityIndex)) {
      return void 0;
    }
    return rect;
  }
  function addIndividualZone(zoneRects, face, bounds, entities, requestedDepth) {
    const clearDepth = maximumClearDepth(face, bounds, entities);
    const depth = Math.floor(Math.min(requestedDepth, clearDepth) + FLOOR_EPSILON);
    if (depth > 0) {
      zoneRects.push({
        ...normalRect(face, depth, face.crossSpan),
        axis: faceNormalAxis(face.face)
      });
    }
  }
  function maximumClearDepth(face, bounds, entities) {
    const normalAxis = faceNormalAxis(face.face);
    const boundStart = normalAxis === "x" ? bounds.x : bounds.y;
    const boundEnd = boundStart + (normalAxis === "x" ? bounds.width : bounds.height);
    let result = face.sign > 0 ? boundEnd - face.plane : face.plane - boundStart;
    for (let entityIndex = 0; entityIndex < entities.length; entityIndex += 1) {
      const entity = entities[entityIndex];
      if (entityIndex === face.entityIndex || entity.isContainer === true) {
        continue;
      }
      result = determineLesserDistance(face, normalAxis, entity, result);
      const text = touchExternalTextRangeToEntityClippedToBodyFace(entity);
      if (text) {
        result = determineLesserDistance(face, normalAxis, text, result);
      }
      if (result <= 0) {
        break;
      }
    }
    return Math.max(0, result);
  }
  function determineLesserDistance(face, normalAxis, obstacle, currentDistance) {
    const obstacleCross = crossSpanOf(normalAxis, obstacle);
    if (spanOverlapLength(face.crossSpan, obstacleCross) <= 0) {
      return currentDistance;
    }
    const start = normalAxis === "x" ? obstacle.x : obstacle.y;
    const end = start + (normalAxis === "x" ? obstacle.width : obstacle.height);
    const distance = face.sign > 0 ? start >= face.plane ? start - face.plane : end > face.plane ? 0 : Number.POSITIVE_INFINITY : end <= face.plane ? face.plane - end : start < face.plane ? 0 : Number.POSITIVE_INFINITY;
    return Math.min(currentDistance, distance);
  }
  function normalRect(face, depth, crossSpan) {
    const start = face.sign > 0 ? face.plane : face.plane - depth;
    return faceNormalAxis(face.face) === "x" ? { x: start, y: crossSpan[0], width: depth, height: spanLength(crossSpan) } : { x: crossSpan[0], y: start, width: spanLength(crossSpan), height: depth };
  }
  function leafClear(rect, entities, firstEntityIndex, secondEntityIndex) {
    return entities.every((entity, index) => {
      if (index === firstEntityIndex || index === secondEntityIndex || entity.isContainer === true) {
        return true;
      }
      const text = touchExternalTextRangeToEntityClippedToBodyFace(entity);
      return !rectsOverlap(rect, entity) && (!text || !rectsOverlap(rect, text));
    });
  }

  // packages/layout/src/routing/corridor/worldConstruction.ts
  function buildCorridorWorld(layoutManager, requests) {
    const sourceEntities = layoutManager.getEntities();
    const entities = snapEntitiesToGrid(sourceEntities);
    const routingManager = entities === sourceEntities ? layoutManager : new LayoutManager({
      entities: [...entities],
      connections: [],
      primaryDirection: layoutManager.primaryDirection,
      options: layoutManager.options,
      origin: layoutManager.origin
    });
    const base = buildBaseCorridorGeometry(routingManager);
    const runways = planLandingZones(base.bounds, entities, requests, base.freeSpace);
    const geometry = buildCorridorGeometry(routingManager, base, runways);
    const attachments = buildTerminalAttachments(entities, geometry.corridors, requests);
    const indexer = new CorridorIndexer(
      geometry.corridors,
      geometry.portals,
      attachments,
      routingManager,
      base.bounds
    );
    return {
      bounds: base.bounds,
      entities,
      sourceEntities,
      indexer,
      terminalFaceRouteCounts: buildTerminalFaceRouteCounts(entities.length, requests),
      corridorSearchTiers: geometry.corridorSearchTiers,
      corridorEntryCosts: geometry.corridorEntryCosts,
      portalSearchTiers: geometry.portalSearchTiers
    };
  }
  function scanCorridors(corridors) {
    const count = corridors.length;
    const xIndices = [];
    const yIndices = [];
    const travelStarts = new Int32Array(count);
    const travelEnds = new Int32Array(count);
    const crossStarts = new Int32Array(count);
    const crossEnds = new Int32Array(count);
    for (let index = 0; index < count; index += 1) {
      const corridor = corridors[index];
      const rect = corridor.rect;
      if (corridor.axis === "x") {
        xIndices.push(index);
        travelStarts[index] = rect.x;
        travelEnds[index] = rect.x + rect.width;
        crossStarts[index] = rect.y;
        crossEnds[index] = rect.y + rect.height;
      } else {
        yIndices.push(index);
        travelStarts[index] = rect.y;
        travelEnds[index] = rect.y + rect.height;
        crossStarts[index] = rect.x;
        crossEnds[index] = rect.x + rect.width;
      }
    }
    return { xIndices, yIndices, travelStarts, travelEnds, crossStarts, crossEnds };
  }
  function buildCorridorGeometry(layoutManager, base, runways) {
    const directConstruction = constructDirectGapCorridors({
      bounds: base.bounds,
      layoutManager,
      freeSpace: base.freeSpace,
      runways
    });
    const corridors = directConstruction.corridors;
    const scan = scanCorridors(corridors);
    const turns = buildTurnPortals(corridors, scan.xIndices, scan.yIndices);
    const continuationPortals = buildContinuationPortals(corridors, scan).map((portal, position) => ({
      ...portal,
      index: turns.length + position
    }));
    const escapeCorridors = directConstruction.searchTiers;
    const portals = [...turns, ...continuationPortals];
    const portalSearchTiers = new Uint8Array(portals.length);
    for (const portal of portals) {
      const firstIndex = portal.kind === "turn" ? portal.xCorridorIndex : portal.negativeCorridorIndex;
      const secondIndex = portal.kind === "turn" ? portal.yCorridorIndex : portal.positiveCorridorIndex;
      if (escapeCorridors[firstIndex] === 1 || escapeCorridors[secondIndex] === 1) {
        portalSearchTiers[portal.index] = PORTAL_SEARCH_TIER_ESCAPE;
      }
    }
    return {
      corridors,
      portals,
      corridorSearchTiers: directConstruction.searchTiers,
      corridorEntryCosts: directConstruction.entryCosts,
      portalSearchTiers
    };
  }
  function buildTurnPortals(corridors, xIndices, yIndices) {
    const portals = [];
    for (const xIndex of xIndices) {
      const xRect = corridors[xIndex].rect;
      for (const yIndex of yIndices) {
        const rect = overlapRect(xRect, corridors[yIndex].rect, 0);
        if (!rect) {
          continue;
        }
        portals.push({
          kind: "turn",
          index: portals.length,
          xCorridorIndex: xIndex,
          yCorridorIndex: yIndex,
          rect
        });
      }
    }
    return portals;
  }
  function buildContinuationPortals(corridors, scan) {
    const starts = /* @__PURE__ */ new Map();
    const ends = /* @__PURE__ */ new Map();
    for (let index = 0; index < corridors.length; index += 1) {
      const axis = corridors[index].axis;
      append(starts, `${axis}:${scan.travelStarts[index]}`, index);
      append(ends, `${axis}:${scan.travelEnds[index]}`, index);
    }
    const result = [];
    for (const [plane, negative] of ends) {
      const positive = starts.get(plane);
      if (!positive) {
        continue;
      }
      const compare = (left2, right2) => scan.crossStarts[left2] - scan.crossStarts[right2] || scan.crossEnds[left2] - scan.crossEnds[right2];
      negative.sort(compare);
      positive.sort(compare);
      let left = 0;
      let right = 0;
      while (left < negative.length && right < positive.length) {
        const firstStart = scan.crossStarts[negative[left]];
        const firstEnd = scan.crossEnds[negative[left]];
        const secondStart = scan.crossStarts[positive[right]];
        const secondEnd = scan.crossEnds[positive[right]];
        const start = Math.max(firstStart, secondStart);
        const end = Math.min(firstEnd, secondEnd);
        if (end > start) {
          result.push({
            kind: "continue",
            axis: corridors[negative[left]].axis,
            negativeCorridorIndex: negative[left],
            positiveCorridorIndex: positive[right],
            planeCoordinate: scan.travelEnds[negative[left]],
            crossSpan: [start, end]
          });
        }
        if (firstEnd <= secondEnd) {
          left += 1;
        }
        if (secondEnd <= firstEnd) {
          right += 1;
        }
      }
    }
    return result.sort(
      (a, b) => a.axis.localeCompare(b.axis) || a.planeCoordinate - b.planeCoordinate || a.crossSpan[0] - b.crossSpan[0] || a.crossSpan[1] - b.crossSpan[1] || a.negativeCorridorIndex - b.negativeCorridorIndex || a.positiveCorridorIndex - b.positiveCorridorIndex
    );
  }
  function append(map, key, value) {
    const values = map.get(key);
    if (values) {
      values.push(value);
    } else {
      map.set(key, [value]);
    }
  }

  // packages/layout/src/routing/executeCorridorRouting.ts
  var CorridorAdoptionError = class extends Error {
    constructor(routeIndexes) {
      super(`Could not adopt corridor routes: ${routeIndexes.join(", ")}`);
      this.routeIndexes = routeIndexes;
    }
  };
  function executeCorridorRouting(layoutManager, requests, options = {}) {
    const tracker = new TimeTracker();
    if (requests.length === 0) {
      return void 0;
    }
    const world = buildCorridorWorld(layoutManager, requests);
    tracker.mark("world");
    const guardedTopologyIndexes = /* @__PURE__ */ new Set();
    const searchResults = [];
    const failedAdoptionRouteIndexes = [];
    for (let routeIndex = 0; routeIndex < requests.length; routeIndex += 1) {
      const request = requests[routeIndex];
      const adopted = options.adoptedRoutes?.get(routeIndex);
      if (adopted === void 0) {
        searchResults.push(searchRoute(world, request));
        continue;
      }
      const route = adoptRoute(world, request, adopted.points, {
        pinTracks: adopted.pinTracks
      });
      if (route === void 0) {
        failedAdoptionRouteIndexes.push(routeIndex);
        continue;
      }
      guardedTopologyIndexes.add(routeIndex);
      searchResults.push({
        route,
        fallback: false,
        searchPass: "preferred",
        metrics: {
          expansions: 0,
          maxQueue: 0,
          maxLabelsPerCorridor: 0,
          passCount: 0
        }
      });
    }
    if (failedAdoptionRouteIndexes.length > 0) {
      throw new CorridorAdoptionError(failedAdoptionRouteIndexes);
    }
    tracker.mark("search");
    const timings = tracker.timings;
    if (searchResults.some((result) => result.fallback)) {
      return {
        status: "fallback",
        world,
        searchResults,
        timing: {
          world: timings["world"],
          search: timings["search"],
          realization: 0,
          repair: 0,
          labels: 0,
          total: tracker.totalMs()
        }
      };
    }
    const initialTopologies = searchResults.map((result) => result.route);
    tracker.reset();
    const initialRealization = realizeRoutes(world, initialTopologies);
    tracker.mark("realization");
    const productionRepair = options.repair !== false ? repairProductionRoutes(world, requests, initialTopologies, initialRealization, {
      ...options.repairOptions,
      guardedTopologyIndexes: /* @__PURE__ */ new Set([
        ...options.repairOptions?.guardedTopologyIndexes ?? [],
        ...guardedTopologyIndexes
      ])
    }) : void 0;
    tracker.mark("repair");
    const realization = productionRepair ?? initialRealization;
    const labels = options.labelSpecs && options.labelSpecs.length > 0 ? placeLabels(world, realization.routes, options.labelSpecs) : void 0;
    tracker.mark("labels");
    return {
      status: "completed",
      world,
      searchResults,
      initialTopologies,
      initialRealization,
      realization,
      ...productionRepair ? { productionRepair } : {},
      ...labels ? { labels } : {},
      timing: {
        world: timings["world"],
        search: timings["search"],
        realization: timings["realization"],
        repair: timings["repair"],
        labels: timings["labels"],
        total: tracker.totalMs()
      }
    };
  }

  // packages/layout/src/routing/corridorRoutingAdapter.ts
  function routeCorridorConnectionBatch({
    layoutManager,
    connectionsToRoute,
    options = {}
  }) {
    if (connectionsToRoute.length === 0) {
      return void 0;
    }
    const entitiesById = layoutManager.getEntitiesMapping();
    const routable = [];
    const unsupported = [];
    for (const connection of connectionsToRoute) {
      if (connection.from && connection.to && connection.from in entitiesById && connection.to in entitiesById) {
        const { x: _x, y: _y, points: _points, ...withoutGeometry } = connection;
        routable.push(withoutGeometry);
      } else {
        unsupported.push(connection);
      }
    }
    const results = [
      ...routable.length > 0 ? routeBoundCorridorConnectionBatch({ layoutManager, connectionsToRoute: routable, options }) : [],
      ...unsupported.length > 0 ? routeDirectFallbackBatch(layoutManager, unsupported, /* @__PURE__ */ new Map()) : []
    ];
    const resultById = new Map(results.map((result) => [result.connectionId, result]));
    return connectionsToRoute.flatMap((connection) => {
      const result = resultById.get(connection.id);
      return result ? [result] : [];
    });
  }
  function routeBoundCorridorConnectionBatch({
    layoutManager,
    connectionsToRoute,
    options
  }) {
    let fallbackConnections = connectionsToRoute;
    let fallbackRequests = /* @__PURE__ */ new Map();
    try {
      const entitiesById = layoutManager.getEntitiesMapping();
      const selectedById = new Map(
        connectionsToRoute.map((connection) => [connection.id, connection])
      );
      const selectedIds = new Set(selectedById.keys());
      const existingById = new Map(
        layoutManager.getConnections().map((connection) => [connection.id, connection])
      );
      const allConnections = layoutManager.getConnections().filter(
        (connection) => selectedIds.has(connection.id) || !!connection.from && !!connection.to && connection.from in entitiesById && connection.to in entitiesById
      ).map(
        (connection) => selectedIds.has(connection.id) ? selectedById.get(connection.id) ?? connection : connection
      );
      for (const connection of connectionsToRoute) {
        if (!existingById.has(connection.id)) {
          allConnections.push(connection);
        }
      }
      const mutableIds = options.pinUnaffectedRoutes === false ? new Set(allConnections.map((connection) => connection.id)) : selectedIds;
      fallbackConnections = allConnections.filter((connection) => mutableIds.has(connection.id));
      if (allConnections.some(
        (connection) => !connection.from || !connection.to || !(connection.from in entitiesById) || !(connection.to in entitiesById)
      )) {
        return routeDirectFallbackBatch(layoutManager, fallbackConnections, fallbackRequests);
      }
      const connections = faceSelectionConnections(allConnections, mutableIds, options);
      const requests = fixedFaceRequests(layoutManager, connections, entitiesById);
      fallbackRequests = new Map(
        allConnections.map((connection, routeIndex) => [connection.id, requests[routeIndex]])
      );
      const adoptedRoutes = /* @__PURE__ */ new Map();
      if (options.pinUnaffectedRoutes !== false) {
        for (let routeIndex = 0; routeIndex < allConnections.length; routeIndex += 1) {
          const connection = allConnections[routeIndex];
          if (mutableIds.has(connection.id) || !existingById.has(connection.id)) {
            continue;
          }
          const incumbent = existingById.get(connection.id);
          if (!incumbent) {
            return routeDirectFallbackBatch(layoutManager, fallbackConnections, fallbackRequests);
          }
          const points = absoluteConnectionPoints(incumbent);
          if (points.length < 2) {
            return routeDirectFallbackBatch(layoutManager, fallbackConnections, fallbackRequests);
          }
          adoptedRoutes.set(routeIndex, { points, pinTracks: true });
        }
      }
      const recovery = executeRecoverableCorridorRouting(layoutManager, requests, {
        repair: options.repair,
        repairTimeBudgetMs: options.repairTimeBudgetMs,
        labelSpecs: options.labels === false ? [] : measuredLabelSpecs(allConnections, mutableIds),
        adoptedRoutes
      });
      if (!recovery.execution) {
        return routeDirectFallbackBatch(layoutManager, fallbackConnections, fallbackRequests);
      }
      const { labels, realization } = recovery.execution;
      const labelByRoute = new Map(
        labels?.placements.map((placement) => [placement.routeIndex, placement]) ?? []
      );
      const localRouteIndexByOriginal = new Map(
        recovery.active.map(({ routeIndex }, localRouteIndex) => [routeIndex, localRouteIndex])
      );
      const failureByRoute = new Map(
        recovery.failures.map((failure) => [failure.routeIndex, failure])
      );
      const changes = /* @__PURE__ */ new Map();
      const fallbackInputs = /* @__PURE__ */ new Map();
      for (let routeIndex = 0; routeIndex < allConnections.length; routeIndex += 1) {
        const connection = allConnections[routeIndex];
        if (!mutableIds.has(connection.id)) {
          continue;
        }
        if (failureByRoute.has(routeIndex)) {
          const existing = existingById.get(connection.id);
          const effective = existing ? { ...existing, ...connection } : connection;
          const fixedConnection = {
            ...effective,
            authoredFromFace: requests[routeIndex].from.face,
            authoredToFace: requests[routeIndex].to.face
          };
          fallbackInputs.set(connection.id, fixedConnection);
          changes.set(
            connection.id,
            directFallbackChange(layoutManager, fixedConnection, requests[routeIndex])
          );
          continue;
        }
        const localRouteIndex = localRouteIndexByOriginal.get(routeIndex);
        if (localRouteIndex === void 0) {
          throw new Error(`corridor recovery lost route ${routeIndex}`);
        }
        const geometry = labels?.routePoints[localRouteIndex] ?? realization.routes[localRouteIndex].points();
        const fromEntity = entitiesById[connection.from];
        const toEntity = entitiesById[connection.to];
        changes.set(
          connection.id,
          connectionChange(
            geometry,
            labelByRoute.get(localRouteIndex),
            requests[routeIndex],
            fromEntity,
            toEntity
          )
        );
      }
      for (const connection of allConnections) {
        if (!mutableIds.has(connection.id)) {
          continue;
        }
        const change = changes.get(connection.id);
        if (!change) {
          continue;
        }
        if (existingById.has(connection.id)) {
          layoutManager.updateConnection(connection.id, change);
        } else {
          const input = fallbackInputs.get(connection.id) ?? connection;
          layoutManager.addConnection({
            ...input,
            ...change,
            ...fallbackInputs.has(connection.id) && !finiteTextPlacement(input.textPlacement) ? { textPlacement: void 0 } : {}
          });
        }
      }
      const fallbackConnectionIds = /* @__PURE__ */ new Set();
      for (const { routeIndex } of recovery.failures) {
        const connectionId = allConnections[routeIndex]?.id;
        if (connectionId !== void 0 && mutableIds.has(connectionId)) {
          fallbackConnectionIds.add(connectionId);
        }
      }
      return connectionRoutingResults(fallbackConnections, fallbackConnectionIds);
    } catch {
      return routeDirectFallbackBatch(layoutManager, fallbackConnections, fallbackRequests);
    }
  }
  function executeRecoverableCorridorRouting(layoutManager, requests, options) {
    let active = requests.map((request, routeIndex) => ({
      routeIndex,
      request
    }));
    const failures = [];
    while (active.length > 0) {
      const labelSpecs = active.flatMap(
        ({ routeIndex }, localRouteIndex) => options.labelSpecs.flatMap(
          (spec) => spec.routeIndex === routeIndex ? [{ ...spec, routeIndex: localRouteIndex }] : []
        )
      );
      const adoptedRoutes = /* @__PURE__ */ new Map();
      active.forEach(({ routeIndex }, localRouteIndex) => {
        const adopted = options.adoptedRoutes.get(routeIndex);
        if (adopted) {
          adoptedRoutes.set(localRouteIndex, adopted);
        }
      });
      try {
        const execution = executeCorridorRouting(
          layoutManager,
          active.map(({ request }, requestIndex) => ({ ...request, requestIndex })),
          {
            repair: options.repair,
            repairOptions: { timeBudgetMs: options.repairTimeBudgetMs },
            labelSpecs,
            adoptedRoutes
          }
        );
        if (!execution) {
          break;
        }
        if (execution.status === "completed") {
          return { execution, active, failures };
        }
        const failedLocalIndexes = execution.searchResults.flatMap(
          (result, localRouteIndex) => result.fallback ? [localRouteIndex] : []
        );
        if (failedLocalIndexes.length === 0) {
          break;
        }
        const failed = new Set(failedLocalIndexes);
        for (const localRouteIndex of failedLocalIndexes) {
          failures.push({ routeIndex: active[localRouteIndex].routeIndex });
        }
        active = active.filter((_, localRouteIndex) => !failed.has(localRouteIndex));
      } catch (error) {
        if (error instanceof CorridorAdoptionError) {
          const failedLocalIndexes2 = [...new Set(error.routeIndexes)];
          if (failedLocalIndexes2.length === 0 || failedLocalIndexes2.some(
            (routeIndex) => !Number.isInteger(routeIndex) || routeIndex < 0 || routeIndex >= active.length || !options.adoptedRoutes.has(active[routeIndex].routeIndex)
          )) {
            throw error;
          }
          const failed2 = new Set(failedLocalIndexes2);
          active = active.filter((_, localRouteIndex) => !failed2.has(localRouteIndex));
          continue;
        }
        if (!(error instanceof CorridorSpacingError)) {
          throw error;
        }
        const failedLocalIndexes = [...new Set(error.routeIndexes)];
        if (failedLocalIndexes.length === 0 || failedLocalIndexes.some(
          (routeIndex) => !Number.isInteger(routeIndex) || routeIndex < 0 || routeIndex >= active.length
        )) {
          throw error;
        }
        const failed = new Set(failedLocalIndexes);
        for (const localRouteIndex of failedLocalIndexes) {
          failures.push({ routeIndex: active[localRouteIndex].routeIndex });
        }
        active = active.filter((_, localRouteIndex) => !failed.has(localRouteIndex));
      }
    }
    return { active, failures };
  }
  function routeDirectFallbackBatch(layoutManager, connections, requestsByConnectionId) {
    try {
      return routeDirectFallbackBatchInternal(layoutManager, connections, requestsByConnectionId);
    } catch {
      return emergencyDirectFallbackBatch(layoutManager, connections);
    }
  }
  function routeDirectFallbackBatchInternal(layoutManager, connections, requestsByConnectionId) {
    for (const input of connections) {
      const existing = layoutManager.getConnectionById(input.id);
      const connection = existing ? { ...existing, ...input } : input;
      const request = requestsByConnectionId.get(connection.id);
      const fixedConnection = request ? {
        ...connection,
        authoredFromFace: request.from.face,
        authoredToFace: request.to.face
      } : connection;
      const change = directFallbackChange(layoutManager, fixedConnection, request);
      try {
        if (existing) {
          layoutManager.updateConnection(connection.id, change);
        } else {
          layoutManager.addConnection({
            ...fixedConnection,
            ...change,
            ...finiteTextPlacement(fixedConnection.textPlacement) ? { textPlacement: fixedConnection.textPlacement } : { textPlacement: void 0 }
          });
        }
      } catch {
      }
    }
    return connectionRoutingResults(connections, new Set(connections.map(({ id }) => id)));
  }
  function emergencyDirectFallbackBatch(layoutManager, connections) {
    for (const connection of connections) {
      const change = emergencyDirectFallbackChange(connection);
      try {
        const existing = layoutManager.getConnectionById(connection.id);
        if (existing) {
          layoutManager.updateConnection(connection.id, change);
        } else {
          layoutManager.addConnection({ ...connection, ...change });
        }
      } catch {
      }
    }
    return connectionRoutingResults(connections, new Set(connections.map(({ id }) => id)));
  }
  function connectionRoutingResults(connections, fallbackConnectionIds) {
    return connections.map(({ id }) => ({
      connectionId: id,
      status: fallbackConnectionIds.has(id) ? "fallback" : "valid"
    }));
  }
  function emergencyDirectFallbackChange(connection) {
    const start = storedAbsolutePoint(connection, connection.points?.[0]) ?? [0, 0];
    const end = storedAbsolutePoint(connection, connection.points?.at(-1)) ?? [start[0] + 10, start[1]];
    const fromFace = legacyDirectionToDirection(connection.authoredFromFace) ?? "right";
    const toFace = legacyDirectionToDirection(connection.authoredToFace) ?? OPPOSITE_DIRECTION[fromFace];
    return absolutePointsChange2(makeRoughFallbackPoints(start, end, fromFace, toFace));
  }
  function directFallbackChange(layoutManager, connection, request) {
    const entitiesById = layoutManager.getEntitiesMapping();
    const fromEntity = connection.from ? entitiesById[connection.from] : void 0;
    const toEntity = connection.to ? entitiesById[connection.to] : void 0;
    return makeRoughFallbackConnectionChange(layoutManager, connection, {
      fromFace: request?.from.face,
      toFace: request?.to.face,
      startPoint: fixedEndpointPoint(fromEntity, request?.from),
      endPoint: fixedEndpointPoint(toEntity, request?.to)
    });
  }
  function fixedEndpointPoint(entity, endpoint) {
    if (!entity || !endpoint) {
      return void 0;
    }
    const plane = Math.round(terminalFacePlane(entity, endpoint.face));
    const track = Math.round(
      endpoint.authoredTrack ?? (endpoint.face === "left" || endpoint.face === "right" ? entity.y + entity.height / 2 : entity.x + entity.width / 2)
    );
    const point = endpoint.face === "left" || endpoint.face === "right" ? [plane, track] : [track, plane];
    return finitePoint(point) ? point : void 0;
  }
  function storedAbsolutePoint(connection, relativePoint) {
    if (!relativePoint || !Number.isFinite(connection.x) || !Number.isFinite(connection.y)) {
      return void 0;
    }
    const point = [connection.x + relativePoint[0], connection.y + relativePoint[1]];
    return finitePoint(point) ? point : void 0;
  }
  function absolutePointsChange2(absolutePoints) {
    const start = absolutePoints[0] ?? [0, 0];
    return {
      x: start[0],
      y: start[1],
      points: absolutePoints.map(([x, y]) => [x - start[0], y - start[1]])
    };
  }
  function finitePoint(point) {
    return Number.isFinite(point[0]) && Number.isFinite(point[1]);
  }
  function finiteTextPlacement(placement) {
    return placement !== void 0 && Number.isFinite(placement.x) && Number.isFinite(placement.y) && Number.isFinite(placement.width) && Number.isFinite(placement.height);
  }
  function faceSelectionConnections(allConnections, selectedIds, options) {
    return allConnections.map((connection) => {
      const preservePorts = !selectedIds.has(connection.id) || options.preservePorts !== false;
      return {
        ...connection,
        authoredFromFace: legacyDirectionToDirection(connection.authoredFromFace) ?? (preservePorts ? faceFromRelativePort2(connection.relativeFromPort) : void 0),
        authoredToFace: legacyDirectionToDirection(connection.authoredToFace) ?? (preservePorts ? faceFromRelativePort2(connection.relativeToPort) : void 0),
        ...preservePorts ? {} : { relativeFromPort: void 0, relativeToPort: void 0 }
      };
    });
  }
  function faceFromRelativePort2(port) {
    if (!port) {
      return void 0;
    }
    const [x, y] = port;
    const distances = [
      ["up", y],
      ["down", 1 - y],
      ["left", x],
      ["right", 1 - x]
    ];
    return distances.reduce((best, candidate) => candidate[1] < best[1] ? candidate : best)[0];
  }
  function absoluteConnectionPoints(connection) {
    return connection.points.map(
      ([x, y]) => [Math.round(connection.x + x), Math.round(connection.y + y)]
    );
  }
  function fixedFaceRequests(layoutManager, connections, entitiesById) {
    const faceRequests = connections.map((connection) => ({
      connId: connection.id,
      from: connection.from,
      to: connection.to
    }));
    const faces = assignFaces(layoutManager, faceRequests, connections);
    const entityIndexById = new Map(
      layoutManager.getEntities().map((entity, entityIndex) => [entity.id, entityIndex])
    );
    return connections.map((connection, requestIndex) => {
      const fromEntity = entitiesById[connection.from];
      const toEntity = entitiesById[connection.to];
      const fromEntityIndex = entityIndexById.get(connection.from);
      const toEntityIndex = entityIndexById.get(connection.to);
      return {
        requestIndex,
        from: routeEndpoint(
          fromEntityIndex,
          faces[requestIndex].from,
          fromEntity,
          connection.relativeFromPort,
          connection.fromArrowhead
        ),
        to: routeEndpoint(
          toEntityIndex,
          faces[requestIndex].to,
          toEntity,
          connection.relativeToPort,
          connection.toArrowhead
        )
      };
    });
  }
  function routeEndpoint(entityIndex, face, entity, relativePort, hasArrowhead) {
    const authoredTrack = getRelativePortCoord(entity, relativePort, face);
    return {
      entityIndex,
      face,
      ...hasArrowhead === void 0 ? {} : { hasArrowhead },
      ...authoredTrack === void 0 ? {} : { authoredTrack: Math.round(authoredTrack) }
    };
  }
  function measuredLabelSpecs(connections, selectedIds) {
    return connections.flatMap((connection, routeIndex) => {
      if (!selectedIds.has(connection.id)) {
        return [];
      }
      const placement = connection.textPlacement;
      if (!placement || !Number.isFinite(placement.width) || !Number.isFinite(placement.height) || placement.width <= 0 || placement.height <= 0) {
        return [];
      }
      return [
        {
          routeIndex,
          size: { width: placement.width, height: placement.height }
        }
      ];
    });
  }
  function connectionChange(points, label, request, fromEntity, toEntity) {
    const normalizedPoints = simplifyCollinearPoints(points.map(({ x, y }) => [x, y]));
    const first = normalizedPoints[0];
    const last = normalizedPoints.at(-1);
    if (!first || !last) {
      throw new Error(`Routing corridor emitted an incomplete route ${request.requestIndex}`);
    }
    const fromPoint = [first[0], first[1]];
    const toPoint = [last[0], last[1]];
    return {
      x: first[0],
      y: first[1],
      points: normalizedPoints.map(([x, y]) => [x - first[0], y - first[1]]),
      relativeFromPort: getRelativePort(fromEntity, fromPoint, request.from.face),
      relativeToPort: getRelativePort(toEntity, toPoint, request.to.face),
      ...label ? { textPlacement: { ...label.rect } } : {}
    };
  }

  // packages/layout/src/routing/manualLabelAnchor.ts
  var LABEL_END_CAP_PX = 40;
  var AXIS_ALIGN_TOL = 0.0875;
  function classifyOrient(tangent) {
    const adx = Math.abs(tangent[0]);
    const ady = Math.abs(tangent[1]);
    if (ady <= AXIS_ALIGN_TOL * adx) {
      return "h";
    }
    if (adx <= AXIS_ALIGN_TOL * ady) {
      return "v";
    }
    return "free";
  }
  function segmentNormal(orient, tangent) {
    if (orient === "h") {
      return [0, -1];
    }
    if (orient === "v") {
      return [1, 0];
    }
    return [-tangent[1], tangent[0]];
  }
  function effectiveCap(totalLength, capPx) {
    return Math.min(capPx, totalLength / 2);
  }
  function classifyAlong(totalLength, arcPos, offset, capPx) {
    const cap = effectiveCap(totalLength, capPx);
    if (arcPos <= cap) {
      return { mode: "head", value: arcPos, offset };
    }
    if (arcPos >= totalLength - cap) {
      return { mode: "tail", value: totalLength - arcPos, offset };
    }
    const band = totalLength - 2 * cap;
    return { mode: "mid", value: band <= 0 ? 0.5 : (arcPos - cap) / band, offset };
  }
  function anchorToArcPos(totalLength, anchor, capPx) {
    const cap = effectiveCap(totalLength, capPx);
    if (anchor.mode === "head") {
      return Math.min(anchor.value, cap);
    }
    if (anchor.mode === "tail") {
      return totalLength - Math.min(anchor.value, cap);
    }
    return cap + Math.min(1, Math.max(0, anchor.value)) * (totalLength - 2 * cap);
  }
  function centerAtArcPos(routeScene, totalLength, arcPos, offset, dims) {
    const fraction = totalLength === 0 ? 0 : arcPos / totalLength;
    const { point, tangent } = pointAtArcLengthFraction(routeScene, fraction);
    const orient = classifyOrient(tangent);
    const normal = segmentNormal(orient, tangent);
    const perpHalfExtent = projectedHalfExtent(normal, dims.width, dims.height);
    const effOffset = effectiveLabelPerpOffset(offset, perpHalfExtent, LABEL_LINE_GAP);
    return {
      center: [point[0] + normal[0] * effOffset, point[1] + normal[1] * effOffset],
      orient
    };
  }
  function anchorFromStored(routeScene, centerScene, nominalOffset, capPx = LABEL_END_CAP_PX) {
    if (routeScene.length < 2) {
      return null;
    }
    const totalLength = polylineLength(routeScene);
    if (totalLength === 0) {
      return null;
    }
    const { fraction } = projectPointOntoPolyline(centerScene, routeScene);
    return classifyAlong(totalLength, fraction * totalLength, nominalOffset, capPx);
  }
  function resolveManualLabel(routeScene, anchor, dims, capPx = LABEL_END_CAP_PX) {
    if (routeScene.length < 2) {
      return null;
    }
    const totalLength = polylineLength(routeScene);
    if (totalLength === 0) {
      return null;
    }
    const arcPos = anchorToArcPos(totalLength, anchor, capPx);
    const { center: center2, orient } = centerAtArcPos(routeScene, totalLength, arcPos, anchor.offset, dims);
    return { center: center2, orient, anchor: { ...anchor } };
  }

  // packages/layout/src/routing/straightConnection.ts
  var EPSILON16 = 1e-9;
  function straightConnectionEndpoints(fromEntity, toEntity, options = {}) {
    const startTarget = options.toFace ? facePoint(toEntity, options.toFace) : center(toEntity);
    const start = options.fromFace ? facePoint(fromEntity, options.fromFace) : boundaryToward(fromEntity, startTarget);
    const end = options.toFace ? startTarget : boundaryToward(toEntity, start);
    return [start, end];
  }
  function facePoint(entity, face) {
    const [x, y] = getPortAsPoint(entity, face, false);
    const clipped = clipFacePointToOutline(entity, face, { x, y });
    return [clipped.x, clipped.y];
  }
  function center(entity) {
    return [entity.x + entity.width / 2, entity.y + entity.height / 2];
  }
  function boundaryToward(entity, target) {
    const origin = center(entity);
    const direction2 = { x: target[0] - origin[0], y: target[1] - origin[1] };
    if (Math.abs(direction2.x) < EPSILON16 && Math.abs(direction2.y) < EPSILON16) {
      return origin;
    }
    const outline = entity.outline ? createEntityOutline(entity.outline, entity) : null;
    const hit = outline?.intersectRay({ x: origin[0], y: origin[1] }, direction2);
    return hit ? [hit.x, hit.y] : boxExit(entity, origin, direction2);
  }
  function boxExit(entity, origin, direction2) {
    const tx = direction2.x === 0 ? Infinity : entity.width / 2 / Math.abs(direction2.x);
    const ty = direction2.y === 0 ? Infinity : entity.height / 2 / Math.abs(direction2.y);
    const t = Math.min(tx, ty);
    return [origin[0] + direction2.x * t, origin[1] + direction2.y * t];
  }
  return __toCommonJS(index_exports);
})();
