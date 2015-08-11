/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

  'use strict';

  const {render, html, Address, Application} = require('reflex');
  const {Record, Any} = require('../../common/typed');
  const {Map} = require('immutable');
  const Settings = require('../../service/settings');
  const React = require('react');


  class Input extends React.Component {
    componentDidUpdate(props) {
      const value = this.props.text
      if (value != props.text) {
        const node = React.findDOMNode(this);
        const start = node.selectionStart;
        const end = node.selectionEnd;

        node.value = value;
        node.setSelectionRange(start, end);
      }
    }
    componentDidMount () {
      if (this.props.text) {
        const node = React.findDOMNode(this);
        node.value = this.props.text;
      }
    }
    render(props, state) {
      return React.createElement('input', this.props);
    }
  };

  const input = props => React.createElement(Input, props);

  // Model

  const Model = Record({
    settings: Any
  }, 'Settings');
  exports.Model = Model;

  // Update

  const update = (state, action) =>
    action instanceof Settings.Changed ?
      state.setIn(['settings', action.name], action.value) :
    action instanceof Settings.Fetched ?
      state.mergeIn(['settings'], action.settings) :
    state;
  exports.update = update;

  // View

  const viewField = props => {
    return html.span({
      key: 'field',
      style: {
        position: 'relative',
        overflow: 'hidden'
      }
    },[
      html.span({
        key: 'sizer',
        style: {
          left: 0,
          color: 'red',
          whiteSpace: 'pre',
          opacity: 0,
        }
      }, props.value),
      input({
        style: {
          padding: 0,
          margin: 0,
          background: 'transparent',
          border: 'none',
          font: 'inherit',
          margin: 0,
          padding: 0,
          position: 'absolute',
          zIndex: 2,
          left: 0,
          width: '100%'
        },
        type: 'text',
        text: props.value,
        onChange: props.onChange
      })
    ]);
  };

  const viewValue = (name, value, address) => {
    const type = value == null ? 'null' :
          typeof(value);

    return type === 'string' ? viewString(name, value, address) :
           type === 'number' ? viewNumber(name, value, address) :
           type === 'boolean' ? viewBoolean(name, value, address) :
           viewJSON(name, value, address);
  }

  const viewNumber = (name, value, address) =>
    html.input({
      type: 'number',
      style: {
        border: 'none',
        width: 'auto'
      },
      value,
      onChange: event => address.receive(Settings.Update({
        name, value: event.target.valueAsNumber
      }))});

  const viewBoolean = (name, value, address) =>
    html.input({
      type: 'checkbox',
      checked: value,
      onChange: event => address.receive(Settings.Update({
        name, value: event.target.checked
      }))});

  const viewString = (name, value, address) =>
    html.code(null, [
      '"',
      viewField({
        value,
        onChange: event => address.receive(Settings.Update({
          name,
          value: event.target.value
        }))}),
      '"'
    ]);

  const viewJSON = (name, value, address) =>
    viewField({
      value,
      onChange: event => address.receive(Settings.Update({
        name,
        value: event.target.value === 'true' ? true :
               event.target.value === 'false' ? false :
               event.target.value === 'null' ? null :
               !Number.isNaN(Number(event.target.value)) ? Number(event.target.value) :
               event.target.value
      }))});

  const viewSetting = (name, value, address) => html.div({
    className: 'row'
  }, [
    html.span({
      key: 'name',
      className: 'name',
      title: name
    }, name),
    html.span({
      key: 'value',
      className: 'value',
      title: value,
    }, [ viewValue(name, value, address)])
  ]);

  const view = (state, address) => html.div({
    key: 'table',
    className: 'table'
  }, state.settings.map((value, key) => {
    return render(key, viewSetting, key, value, address);
  }).values());
  exports.view = view;

  const address = new Address({
    receive(action) {
      application.receive(action);
      settings(action);
    }
  });

  const application = new Application({
    address, view, update,

    target: document.body,
    state: Model({settings: Map()})
  });

  const settings = Settings.service(address);

  address.receive(Settings.Fetch({id: 'about:settings', query: '*'}));
