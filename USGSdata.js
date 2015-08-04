Ext.define('USGSdata',{
	extend:'Ext.window.Window',
	alias:'widget.USGSdata',
	title:'Earthquake data (USGS)',
	width:250,
	mappanel:'',
	buildButtons:function(){
		return[{
				xtype:'button',				
				itemId:'Ok',
				text:'Ok',
				handler:function(){
					var me = this.up('panel')
					var Option = me.getComponent('rg1').getValue()					
					var url
					
					switch(Option.Option){
					case '1':						
						url='summary/all_hour.atom'
						break
					case '2':
						url='summary/all_day.atom'
						break
					case '3':
						url='summary/all_week.atom'
						break	
					case '4':
						url='summary/all_month.atom' 
						break	
					}
					
					//url = 'http://202.90.149.231:8000/earthquake.usgs.gov/earthquakes/feed/v1.0/' + url 
					url='/webapi/get.ashx?url=http://earthquake.usgs.gov/earthquakes/feed/v1.0/' + url
					console.log('url-------', url);	
					if (map.getLayersByName('Earthquakes (USGS)').length>0)	{
						map.getLayersByName('Earthquakes (USGS)')[0].destroy();		
					}
		
					var usgs = new OpenLayers.Layer.Vector("Earthquakes (USGS)", {
						projection: new OpenLayers.Projection("EPSG:4326"),
						strategies: [new OpenLayers.Strategy.Fixed()],
						protocol: new OpenLayers.Protocol.HTTP({											
							url:url,								
							format: new OpenLayers.Format.GeoRSS()
						}),
						styleMap: new OpenLayers.StyleMap({'default':{
							externalGraphic: "./chooser/icons/Equake.png",				
							graphicYOffset: -25,
							graphicHeight: 20,
							
						}}) ,
					});					
					//
					selectctrl = new OpenLayers.Control.SelectFeature(
					usgs,
						{
						 clickout: false, 
						 toggle: false,
						 multiple: false, 
						 hover: false,	
						}				
					)
					
					var me = this.up('panel')
					
					me.mappanel.map.addControl(selectctrl)
				
					selectctrl.activate();        
					usgs.events.on({
						"featureselected": function(event) {
						console.log('aaa',event);
												
						var summary = event.feature.data.description
						summary = summary.replace(/<\/?[^>]+(>|$)/g, " ");
						summary = summary.replace(' DYFI? -  I', " ");
						summary = summary.replace('Time', " ");
						var fdata = {'Description':event.feature.data.title, 'Summary':summary}			
						popup = Ext.create('GeoExt.window.Popup', {
							title: "Feature Information",
							//location: pos,
							map:map,	
							width: 400,	
							height:140,							
							items: {
								xtype:'propertygrid',
								fit:true,								
								source:fdata,
								hideHeaders: false,
								sortableColumns: false
							},
							autoScroll: true
						})
						popup.show();  
						}
					});
					//
					console.log(usgs);
					me.mappanel.map.addLayer(usgs);					
					me.close()					
				
				}	
			},
			{
				xtype:'button',				
				itemId:'Close',
				text:'Close',	
				handler:function(){	
					var me = this.up('panel')
					me.close();				
				}	
			
			}
		
		
		]
	
	},
	buildItems:function(){
		return[{
			xtype: 'radiogroup',	
			itemId:'rg1',	
			height:130,	
			columns:1,
			items:[{
				boxLabel: 'Earthquake for the past hour',
				checked:true,
                name: 'Option',
                inputValue: '1'				
				
			},
			{
				boxLabel: 'Earthquake for the past day',
                name: 'Option',
                inputValue: '2'				
				
			},
			{
				boxLabel: 'Earthquake for the past week',
                name: 'Option',
                inputValue: '3'								
				
			},
			{
				boxLabel: 'Earthquake for the past month',
                name: 'Option',
                inputValue: '4'				
				
			}
			],
			
			
			
			
		}]
	
	},
	initComponent:function(){
		this.items = this.buildItems();
		this.buttons=this.buildButtons();
	
this.callParent();	
	}
	
	


});