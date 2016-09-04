Ext.onReady(function(){

    sigTemplate = new Ext.Template(
'<div style="font-family: \'Arial\'; font-size: 9pt; color:#000000;">\n',
'<div><strong style="font-size: 11pt;">{name}</strong></div>\n',
'<div style="font-size: 10pt;">{title}</div>\n',
'{phones}',
'<div><a href="mailto:{email}" style="color: #9b97b2;">{email}</a> | <a href="http://www.mydomain.com/" style="color: #9b97b2;">www.mydomain.com</a><div>\n',
'<div>1234 Some Pl, Suite 321, Big City VA, 12345-123</div>\n',
'</div>');

    sigPhoneTemplate = new Ext.Template('<div>{phone}&nbsp;({phoneType})</div>\n');

    renderPhoneLine = function(num, type) {
        if (num.length == 10) {
            var values = new Object();
            values['phone'] = num.slice(0,3) + '.' + num.slice(3,6) + '.' + num.slice(6,10);
            values['phoneType'] = type;
            return window.sigPhoneTemplate.apply(values);
        }
        
        return '';
    }

    downloadFile = function(contents) {
        /*
         * Download handler from http://filetree.extjs.eu/source.php?file=js/Ext.ux.FileTreePanel.js
         * which is licensed under LGPL 3.0
         */
        // create hidden target iframe
        var id = Ext.id();
        var frame = document.createElement('iframe');
        frame.id = id;
        frame.name = id;
        frame.className = 'x-hidden';
        if(Ext.isIE) {
        frame.src = Ext.SSL_SECURE_URL;
        }
         
        document.body.appendChild(frame);
         
        if(Ext.isIE) {
        document.frames[id].name = id;
        }
         
        var form = Ext.DomHelper.append(document.body, {
        tag:'form'
        ,method:'post'
        ,action: 'fileEcho.php'
        ,target:id
        });
         
        document.body.appendChild(form);
         
        var hidden;
         
        // append cmd to form
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'cmd';
        hidden.value = 'download';
        form.appendChild(hidden);
         
        // append path to form
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'value';
        hidden.value = contents;
        form.appendChild(hidden);
         
        var callback = function() {
        Ext.EventManager.removeListener(frame, 'load', callback, this);
        setTimeout(function() {document.body.removeChild(form);}, 100);
        setTimeout(function() {document.body.removeChild(frame);}, 110);
        };
         
        Ext.EventManager.on(frame, 'load', callback, this);
         
        form.submit();
    }

    var form = new Ext.form.FormPanel({
        xtype: 'form',
        border: false,
        bodyStyle: 'padding: 5px',
        defaults: {
            xtype: 'textfield',
            allowBlank: false,
            anchor: '95%',
            labelSeparator: '',
            labelStyle: 'font-weight: bold;'
        },
        items:[{
            name: 'name',
            fieldLabel: 'Full Name'
        },{
            name: 'title',
            fieldLabel: 'Funktion'
        },{
            name: 'email',
            fieldLabel: 'E-Mail Address',
            validator: Ext.form.VTypes.email
        },{
            name: 'phone',
            fieldLabel: 'Phone Number',
            xtype: 'textfield',
            minLength: 8
        },{
            name: 'cell',
            fieldLabel: 'Cell Number',
            xtype: 'textfield',
            allowBlank: true,
            minLength: 8
        },{
            name: 'fax',
            fieldLabel: 'Fax Number',
            xtype: 'textfield',
            allowBlank: true,
            minLength: 8
        }]
    });

    var win = new Ext.Panel({
        title: 'FVL E-Mail-Signatur Generator',
        applyTo: 'sigform',
        style: 'margin: 10px;',
        frame: true,
        width: 350,
        height: 'auto',
        closable: false,
        items:[form],
        buttons:[{
            text: 'Generate',
            scope: form,
            handler: function(b, e){
                var f = this.getForm();
                
                if (! f.isValid() ) {
                    return false;
                }

                var v = f.getValues();

                v['phones'] = window.renderPhoneLine(v.phone, 'o') + window.renderPhoneLine(v.cell, 'c') + window.renderPhoneLine(v.fax, 'f');
                
                var resWindow = new Ext.Window({
                    title: 'Signature',
                    width: 400,
                    autoHeight: true,
                    shadow: false,
                    buttons:[{
                        text: 'Download',
                        handler: function(b, e) {
                            window.downloadFile(window.sigTemplate.apply(v));
                        }
                    }],
                    items: [{
                        xtype: 'tabpanel',
                        activeTab: 0,
                        border: false,
                        defaults: {
                            xtype: 'panel',
                            layout: 'fit'
                        },
                        items:[{
                            title: 'Preview',
                            html: window.sigTemplate.apply(v),
                            bodyStyle: 'background: #ffffff; padding: 5px;'
                        },{
                            title: 'Code',
                            autoScroll: true,
                            html: '<pre>' + Ext.util.Format.htmlEncode(window.sigTemplate.apply(v)) + '</pre>',
                            bodyStyle: 'background: #ffffff; padding: 5px;'
                        }]
                    }]
                    
                });

                resWindow.show();               
            }
        },{
            text: 'Reset',
            scope: form,
            handler: function(b, e){ 
                this.getForm().reset();
            }
        }]    
    });

    win.show();
});
