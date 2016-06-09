//Demo - Regionals
;(function(app){

    app.view('FieldsetA', {
        editors: {
            _global: {
                layout: {
                    label: 'col-sm-2',
                    field: 'col-sm-10'
                }
            },
            abc: {
                type: 'text',
                label: 'Abc',
                help: 'This is abc',
                tooltip: 'Hey Abc here!',
                fieldname: 'newfield',
                validate: {
                    required: {
                        msg: 'Hey input something!'
                    },
                    fn: function(val, parentCt){
                        if(!_.string.startsWith(val, 'A')) return 'You must start with an A';
                    }
                }

            },
            ab: {
                label: 'Ab',
                help: 'This is ab',
                tooltip: 'Hey Ab here!',
                placeholder: 'abc...',
                value: 'default',
                validate: function(val, parentCt){
                    app.debug(val);
                    if(val !== '123') return 'You must enter 123';
                }
            },
            efg: {
                label: 'Ha Ha',
                type: 'password',
                validate: {
                    checkitout: true
                }
            }
        }        
    });

    app.view('FieldsetB', {
        className: 'well well-sm',
        editors: {
            _global: {
                layout: {
                    label: 'col-sm-2',
                    field: 'col-sm-10'
                }
            },
            area: {
                label: 'Codes',
                type: 'textarea',
                validate: {
                    required: true
                }
            },
            readonly: {
                label: 'RO',
                value: '<p class="text-success">Nothing...but HTML</p>'
            },

            readonly2: {
                label: 'RO 2',
                type: 'ro',
                value: 'Unchange-able'
            },
            xyz: {
                label: 'File',
                type: 'file',
                help: 'Please choose your image to upload.',
                fieldname: 'files[]',
                upload: {
                    //standalone: true,
                    formData: function(){
                        //return [{name: 'a', value: 1}, {name: 'b', value: 2}];
                        return {a: 1, b: 2};
                    },
                    //formData: {a: 1, b: 2},
                    url: 'file/Blog2/',
                    callbacks: {
                        always: function(e, info){
                            app.debug(e, info);
                        }
                    }
                }
            },
            xyz2: {
                label: 'File2',
                type: 'file',
                help: 'Please choose your abc to upload.',
                //fieldname: 'files[]',
                upload: {
                    standalone: true,
                    formData: function(){
                        //return [{name: 'a', value: 1}, {name: 'b', value: 2}];
                        return {a: 1, b: 2};
                    },
                    //formData: {a: 1, b: 2},
                    url: 'sample/file/',
                    callbacks: {
                        always: function(e, info){
                            app.debug(e, info);
                        }
                    }
                }

            },
            radios: {
                label: 'Radios',
                type: 'radios',
                className: 'radio-success',
                help: 'choose the one you like',
                tooltip: {
                    title: 'hahahaha'
                },
                value: ['c'],
                options: {
                    inline: true,
                    //data: ['a', 'b', 'c', 'd']
                    data: [
                        {label: 'Haha', value: 'a'},
                        {label: 'Hb', value: 'b'},
                        {label: 'Hc', value: 'c'},
                        {label: 'Hd', value: 'd'}
                    ]
                }
            },
            checkboxes: {
                label: 'Checkboxes',
                type: 'checkboxes',
                className: 'checkbox-info',
                help: 'choose more than you like',
                fieldname: 'haha',
                value: ['1232', '1234'],
                options: {
                    //inline: true,
                    //data: ['a', 'b', 'c', 'd']
                    data: [
                        {key: 'abc1', val: '1231', other: 'bbb1'},
                        {key: 'abc2', val: '1232', other: 'bbb2'},
                        {key: 'abc3', val: '1233', other: 'bbb3'},
                        {key: 'abc4', val: '1234', other: 'bbb4'},
                        {key: 'abc5', val: '1235', other: 'bbb5'},
                    ],
                    labelField: 'other',
                    valueField: 'val'
                }
            },
            singlecheckbox: {
                label: 'Check?',
                type: 'checkbox',
                boxLabel: 'Select this one if you are smart...:D',
                checked: 'enabled',
                unchecked: 'disabled',
            },
            select: {
                label: 'Select',
                type: 'select',
                help: 'choose 1 you like',
                multiple: true,
                options: {
                    //data: ['a', 'b', 'c', 'd']
                    data: [
                        {key: 'abc1', val: '1231', other: 'bbb1'},
                        {key: 'abc2', val: '1232', other: 'bbb2'},
                        {key: 'abc3', val: '1233', other: 'bbb3'},
                        {key: 'abc4', val: '1234', other: 'bbb4'},
                        {key: 'abc5', val: '1235', other: 'bbb5'},
                    ],
                    labelField: 'other',
                    valueField: 'val'
                }
            },
            remoteselect: {
                label: 'Remote Select',
                type: 'select',
                options: {
                    remote: {
                        url: 'sample/choices'
                    }
                }
            } 
        }
    });

    //////////Form/////////
    app.view('Demo.Editors', {
        template: [
            '<div class="row">',
                '<div class="form form-horizontal">',
                    '<div region="fieldset-a" view="FieldsetA"></div>',
                    '<div region="fieldset-b" view="FieldsetB"></div>',
                '</div>',
            '</div>', //the class form form-horizontal is required for the editor layout class config to work in bootstrap 3
            '<div class="row">',
                '<div class="col-sm-10 col-sm-offset-2">',
                    '<span class="btn btn-primary" action="submit">Submit</span> ',
                    '<span class="btn btn-warning btn-outline" action="validate">Validate</span> ',
                    '<span class="btn btn-default" action="test">Test</span> ',
                    '<span class="btn btn-default btn-outline" action="test2">Test(Disable/Enable)</span> ',
                    '<span class="btn btn-info" action="info">Inform</span> ',
                    '<span class="btn btn-info btn-outline" action="clearinfo">Clear Info</span> ',
                '</div>',
            '</div>'
        ],
        editors: {
            _global: {
                layout: {
                    label: 'col-sm-2',
                    field: 'col-sm-10'
                },
                appendTo: 'div.form',
            },            
            'main.selectgroup': {
                label: 'Group',
                type: 'select',
                options: {
                    data: {
                        group1: [{label: 'abc', value: '123'}, {label: '4555', value: '1111'}],
                        group2: [{label: 'abcx', value: '123x'}, {label: '4555x', value: '1111x'}],
                    }
                }
            },
            //compond editor
            duration: app.view({
                className: 'form-group',
                template: [
                    '<label class="control-label col-sm-2">Duration (compond)</label>',
                    '<div class="col-sm-10">',
                        '<div class="row">',
                            '<div class="col-sm-6" editor="time"></div>',
                            '<div class="col-sm-6" editor="unit"></div>',
                        '</div>',
                    '</div>',
                ],
                editors: {
                    time: {
                        type: 'text',
                        name: 'time',
                        validate: {
                            required: true
                        }
                    },
                    unit: {
                        type: 'radios',
                        name: 'unit',
                        value: 'h',
                        options: {
                            inline: true,
                            data: [{
                                label: 'Hours',
                                value: 'h'
                            }, {
                                label: 'Minutes',
                                value: 'm'
                            }, {
                                label: 'Seconds',
                                value: 's'
                            }]
                        },
                        validate: {
                            required: true
                        }
                    }
                },
                getVal: function() {
                    var vals = this.get();
                    return vals.time + vals.unit;
                },
                setVal: function(val, loud) {
                    //set editor values
                }
            })
        },
        onReady: function(){

            // this.$('input').iCheck({
            //     checkboxClass: 'icheckbox_square',
            //     radioClass: 'iradio_square',
            // });

        },
        actions: {
            validate: function($btn){
                this.getViewIn('fieldset-a').validate(true);
                this.getViewIn('fieldset-b').validate(true);
                this.validate(true);
            },
            submit: function(){
                // var f = this.getEditor('fieldset-b.xyz');
                // f.upload({
                //     fileInput: this.$el.find('input[name="files[]"]')
                // });
                app.debug(_.extend(this.get(), {
                    'fieldset-a': this.getViewIn('fieldset-a').get(),
                    'fieldset-b': this.getViewIn('fieldset-b').get()
                }));
            },
            test: function(){
                this.set({
                    main: {
                        selectgroup: '1111x'
                    }
                });

                this.getViewIn('fieldset-b').set({
                    checkboxes: ['1231', '1233'],
                    readonly2: 'Hello!',
                    singlecheckbox: 'enabled',
                });

                //since we changed the inputs outside of iCheck plugin api.
                //this.$('input').iCheck('update');
            },
            test2: function(){
                var editor = this.getEditor('fieldset-b.checkboxes');
                if(!editor) return app.debug('Can not find editor:', 'fieldset-b.checkboxes');

                if(editor.isEnabled()) {
                    editor.disable(true);
                    this.getEditor('fieldset-a.ab').disable();
                    this.getEditor('fieldset-b.radios').disable();                    
                }
                else {
                    editor.disable(false);
                    this.getEditor('fieldset-a.ab').disable(false);
                    this.getEditor('fieldset-b.radios').disable(false);
                }
            },
            info: function(){
                this.status({
                    singlecheckbox: 'passed!',
                    efg: {
                        status: 'error',
                        message: 'another server error!'
                    }
                });
            },
            clearinfo: function(){
                this.getViewIn('fieldset-a').status();
                this.getViewIn('fieldset-b').status();
                this.status();
            }
        }
    });

})(Application);
  