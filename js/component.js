/* this source code form is subject to the terms of the mozilla public
 * license, v. 2.0. if a copy of the mpl was not distributed with this
 * file, you can obtain one at http://mozilla.org/mpl/2.0/. */

define((require, exports, module) => {
  "use strict";

  const React = require("react");

  const makeRender = ({render}) => function() {
    return render.call(this, this.props);
  };

  const Component = function(options) {
    const descriptor = Object.assign({},
                                     Component.prototype,
                                     options,
                                     {getDefaultProps: options.defaults,
                                      render: options.render &&
                                              makeRender(options)});
    const Type = React.createClass(descriptor);
    return React.createFactory(Type);
  };

  Component.patch = (component, delta) =>
    component.setProps(delta);
  Component.reset = (component, state) =>
    component.replaceProps(state);

  Component.prototype = {
    getOptions() {
      return this.props;
    },
    get options() {
      return this.props;
    },
    defaults() {
      return {};
    },
    mount(options) {

    },
    mounted(target, options) {
    },
    unmount(target, options) {
    },
    equal(before, after) {
      return before === after;
    },
    write(target, after, before) {

    },

    // Updates
    patch(delta) {
      this.setProps(delta);
    },
    reset(options) {
      this.replaceProps(options);
    },

    // API Bridge
    getDefaultProps() {
      return this.defaults();
    },
    componentWillMount() {
      this.mount(this.props);
    },
    componentDidMount() {
      this.mounted(this.getDOMNode(), this.props);
    },
    componentWillUnmount() {
      this.unmount(this.getDOMNode(), this.props);
    },
    shouldComponentUpdate(after) {
      return !this.equal(this.props, after);
    },
    componentDidUpdate(before) {
      this.write(this.getDOMNode(), this.props, before);
    }
  }
  exports.Component = Component;

  exports.render = React.render;
});
