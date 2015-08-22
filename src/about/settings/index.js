/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

  'use strict';

  const {render, html, Address, Application} = require('reflex');
  const {Record, Any} = require('typed-immutable');
  const {Map} = require('immutable');
  const Settings = require('../../service/settings');
  const React = require('react');
  const {StyleSheet, Style} = require('../../common/style');
  const ClassSet = require('../../common/class-set');


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

  const Edit = Record({
    edit: true,
    name: String,
    input: String
  }, 'Edit');

  const update = (state, action) =>
    action instanceof Edit ?
      state.setIn(['settings', action.name], action) :
    action instanceof Settings.Changed ?
      state.setIn(['settings', action.name], action.value) :
    action instanceof Settings.Fetched ?
      state.mergeIn(['settings'], action.settings) :
    state;
  exports.update = update;

  // View

  const fieldStyle = StyleSheet.create({
    // input field is wrapped in a box so that input field itself
    // will resize to match it's container & subsequently typed text.
    // input field is positioned absolute so it's size won't affect
    // container & it's styles are blanked out as container is supposed
    // to be styled instead.
    input: {
      padding: 0,
      margin: 0,
      background: 'transparent',
      border: 'none',
      font: 'inherit',
      color: 'inherit',
      position: 'absolute',
      zIndex: 2,
      left: 0,
      width: '100%'
    },
    // Container box is positioned relative so that contaned input that
    // is positioned absolute will be relative to this container. Overflow is
    // also hidden so that input with in it will get clipped if it is too large.
    box: {
      position: 'relative',
      overflow: 'hidden'
    },
    // Container box content element is used to only to resize a container
    // based on the text of the input field that is also a text for the
    // content element.
    content: {
      font: 'inherit',
      left: 0,
      podding: 0,
      margin: 0,
      whiteSpace: 'pre',
      opacity: 0,
    },
    number: {
      background: 'transparent',
      border: 'none',
      color: 'inherit'
    }
  });

  const viewField = props => {
    return html.span(Object.assign({}, props, {
      key: 'field',
      style: fieldStyle.box,
    }),[
      html.span({
        key: 'sizer',
        style: fieldStyle.content,
      }, props.value),
      input(Object.assign({}, props, {
        style: fieldStyle.input,
        type: 'text',
        text: props.value,
        onChange: props.onChange
      }))
    ]);
  };

  const viewValue = (name, value, address) => {
    const type = value == null ? 'null' :
          typeof(value);

    return type === 'number' ? viewNumber(name, value, address) :
           //type === 'boolean' ? viewBoolean(name, value, address) :
           viewJSON(name, value, address);
  }

  const viewNumber = (name, value, address) =>
    html.input({
      type: 'number',
      style: fieldStyle.number,
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

  const parseInput = input => {
    try {
      return JSON.parse(input)
    } catch(error) {
      return error
    }
  }

  const viewJSON = (name, value, address) =>
    viewField({
      value: (value && value.edit) ? value.input :
             JSON.stringify(value),
      onClick: event => {
        if (value === true) {
          address.receive(Settings.Update({name, value: false}));
        }

        if (value === false) {
          address.receive(Settings.Update({name, value: true}));
        }
      },
      onChange: event => {
        const value = parseInput(event.target.value);
        if (value instanceof Error) {
          address.receive(Edit({name, input: event.target.value}));
        } else {
          address.receive(Settings.Update({name, value}));
        }
      }
    });

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
      className: ClassSet({
        'value': true,
        'cm-number': typeof(value) === 'number',
        'cm-string': typeof(value) === 'string',
        'cm-boolean': typeof(value) === 'boolean',
        'cm-atom': value == null ||
                   value === true ||
                   value === false,
        'cm-error': value && value.edit
      }),
      title: value,
    }, [ viewValue(name, value, address)])
  ]);

  const view = (state, address) => html.div({
    key: 'table',
    className: 'table'
  }, [
    html.meta({
      name: 'theme-color',
      content: '002b36|839496',
    }),
    ...state.settings.map((value, key) => {
      return render(key, viewSetting, key, value, address);
    }).values()
  ]);
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
