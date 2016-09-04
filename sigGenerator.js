Ext.onReady(function(){

    sigTemplate = new Ext.Template(
'<html>\n',
'<br /><br />\n',
'<p startcont="this" style="font-weight: bold; font-family: Helvetica,Arial,sans-serif;"><span style="font-size: 12px;">mit sportlichen Gr&uuml;&szlig;en/ with best regards</span></p>\n',
'<p style="font-weight: bold; font-family: Helvetica,Arial,sans-serif;">\n',
	'<span style="font-size: 12px;"><br />{name}<br /></span>\n',
	'<span style="color: rgb(255, 0, 0); font-size: 16px;">FUSSBALLVEREIN L&Ouml;CHGAU</span><br />\n',
    '<span style="font-size: 12px;">{area}</span></span></p>\n',

	'<p style="font-weight: bold; font-family: Helvetica,Arial,sans-serif;">\n',
	'<span style="font-size: 12px;">Am Sportplatz 1, 74369 L&ouml;chgau</span></p>\n',
	'<p style="font-weight: bold; font-family: Helvetica,Arial,sans-serif;">\n',
	'<span style="font-size: 12px;"> Tel: {phone}<br />\n',
									'Mobil: {cell}<br />\n',
									'Fax: {fax}<br />\n',
									'E-Mail: {email}<br />\n',
									'Homepage: http://www.fvloechgau.de</span></p>\n',									
'</body>\n',
'</html>');

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
            anchor: '90%',
            labelSeparator: ''
        },
        items:[{
            name: 'name',
            fieldLabel: 'Vor- und Nachname'
        },{
            name: 'area',
            fieldLabel: 'Bereich'
        },{
            name: 'email',
            fieldLabel: 'E-Mail Addresse',
            validator: Ext.form.VTypes.email,
			value: 'max.mustermann@fvloechgau.de'
        },{
            name: 'phone',
            fieldLabel: 'Telefon',
            xtype: 'textfield',
            minLength: 8,
			value: 'Format: +49 (0)7143/24200'
        },{
            name: 'cell',
            fieldLabel: 'Handynummer',
            xtype: 'textfield',
            allowBlank: true,
			value: 'Format: +49 (0)172-1234567 | Falls leer: -'
        },{
            name: 'fax',
            fieldLabel: 'Faxnummer',
            xtype: 'textfield',
            allowBlank: true,
			value: 'Format: +49 (0)172-1234567 | Falls leer: -'
        }]
    });

    var win = new Ext.Panel({
        title: 'FVL E-Mail-Signatur Generator',
        applyTo: 'sigform',
        style: 'margin: 10px;',
        frame: true,
        width: 550,
        height: 'auto',
        closable: false,
        items:[form],
        buttons:[{
            text: 'Generieren',
            scope: form,
            handler: function(b, e){
                var f = this.getForm();
                
                if (! f.isValid() ) {
                    return false;
                }

                var v = f.getValues();

                v['phones'] = window.renderPhoneLine(v.phone, 'o') + window.renderPhoneLine(v.cell, 'c') + window.renderPhoneLine(v.fax, 'f');
                
                var resWindow = new Ext.Window({
                    title: 'Signatur',
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
                            title: 'Vorschau',
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
            text: 'Zurücksetzen',
            scope: form,
            handler: function(b, e){ 
                this.getForm().reset();
            }
        }]    
    });

    win.show();
});
