(function (global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {});

  if (fabric.Layer) {
    fabric.warn('fabric.Layer is already defined');
    return;
  }

  /**
   * Layer class
   * @class fabric.Layer
   * @extends fabric.Group
   * @see {@link fabric.Layer#initialize} for constructor definition
   */
  fabric.Layer = fabric.util.createClass(fabric.Group, /** @lends fabric.Layer.prototype */ {

    /**
     * @default
     * @type string
     */
    type: 'layer',

    /**
     * @override
     * @default
     */
    layout: 'auto',

    /**
     * @override
     * @default
     */
    objectCaching: false,

    /**
     * @override
     * @default
     */
    strokeWidth: 0,

    /**
     * @override
     * @default
     */
    hasControls: false,

    /**
     * @override
     * @default
     */
    hasBorders: false,

    /**
     * @override
     * @default
     */
    lockMovementX: true,

    /**
     * @override
     * @default
     */
    lockMovementY: true,

    /**
     * @default
     * @override
     */
    originX: 'center',

    /**
     * @default
     * @override
     */
    originY: 'center',

    /**
     * we don't want to int with the layer, only with it's objects
     * this makes group selection possible over a layer
     * @override
     * @default
     */
    selectable: false,

    /**
     * @override we want instance to fill parent so we disregard transformations
     * @param {CanvasRenderingContext2D} ctx Context
     */
    transform: function (ctx) {
      var m = this.calcTransformMatrix(!this.needsFullTransform(ctx));
      ctx.transform(1, 0, 0, 1, m[4], m[5]);
    },

    /**
     * @override apply instance's transformations on objects
     * @param {CanvasRenderingContext2D} ctx Context to render on
     */
    drawObject: function (ctx) {
      this._renderBackground(ctx);
      ctx.save();
      var m = this.calcTransformMatrix(!this.needsFullTransform(ctx));
      ctx.transform(m[0], m[1], m[2], m[3], 0, 0);
      for (var i = 0, len = this._objects.length; i < len; i++) {
        this._objects[i].render(ctx);
      }
      ctx.restore();
      this._drawClipPath(ctx, this.clipPath);
    },

    /**
     * @private
     * @override we want instance to fill parent so we disregard transformations
     * @returns {fabric.Point} dimensions
     */
    _getTransformedDimensions: function () {
      return this.callSuper('_getTransformedDimensions', {
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        width: this.width,
        height: this.height,
        strokeWidth: 0
      });
    },

    /**
     * we need to invalidate instance's group if objects have changed
     * @override
     * @private
     */
    __objectMonitor: function (opt) {
      this.group && this.group.__objectMonitor(opt);
    },

    /**
     * @private
     * @override handled by {@link fabric.Layer#getLayoutStrategyResult}
     */
    _onParentResize: function (context) {
      this._applyLayoutStrategy(context);
    },

    /**
     * @private
     * @override we do not want to bubble layout
     */
    _bubbleLayout: function () {
      //  noop
    },

    /**
     * Layer will layout itself once it is added to a canvas/group and by listening to it's parent `resize`/`layout` events respectively
     * Override this method to customize layout
     * @public
     * @param {string} layoutDirective
     * @param {fabric.Object[]} objects
     * @param {object} context object with data regarding what triggered the call
     * @param {'initializion'|'canvas'|'canvas_resize'|'layout_change'} context.type
     * @param {fabric.Object[]} context.path array of objects starting from the object that triggered the call to the current one
     * @returns {Object} options object
     */
    getLayoutStrategyResult: function (layoutDirective, objects, context) {  // eslint-disable-line no-unused-vars
      if ((context.type === 'canvas' || context.type === 'canvas_resize') && this.canvas && !this.group) {
        return {
          centerX: this.canvas.width / 2,
          centerY: this.canvas.height / 2,
          width: this.canvas.width,
          height: this.canvas.height
        };
      }
      else if ((context.type === 'group' || context.type === 'group_layout') && this.group) {
        var w = this.group.width, h = this.group.height;
        return {
          centerX: 0,
          centerY: 0,
          width: w,
          height: h
        };
      }
    },

    toString: function () {
      return '#<fabric.Layer: (' + this.complexity() + ')>';
    },

  });

  /**
   * Returns fabric.Layer instance from an object representation
   * @static
   * @memberOf fabric.Layer
   * @param {Object} object Object to create an instance from
   * @returns {Promise<fabric.Layer>}
   */
  fabric.Layer.fromObject = function (object) {
    var objects = object.objects || [],
        options = fabric.util.object.clone(object, true);
    delete options.objects;
    return Promise.all([
      fabric.util.enlivenObjects(objects),
      fabric.util.enlivenObjectEnlivables(options)
    ]).then(function (enlivened) {
      return new fabric.Layer(enlivened[0], Object.assign(options, enlivened[1]), true);
    });
  };

})(typeof exports !== 'undefined' ? exports : this);