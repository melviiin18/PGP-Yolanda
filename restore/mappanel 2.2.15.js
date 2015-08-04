

Ext.define('mappanel',{
	extend:'GeoExt.panel.Map',
	alias:'Widget.mappanel',	
	title: "Philippine Geoportal - Disaster Risk Reduction and Management",   			
	layout:'border',	
	region:'center',
	width:100,
	height:100,
	selLayer:'',
	execUrl:function(url, callback){
		Ext.Ajax.request({
				url:url,
				success: function(response){
					var obj = Ext.decode(response.responseText);					
					callback(obj)		
				}			
			});	
	
	},
	gCode:function(addr, callback){	  
				var geocoder = new google.maps.Geocoder();					
				geocoder.geocode({ 'address': addr }, function (results, status) {					
					if (status == google.maps.GeocoderStatus.OK) {		
						var xx=results[0].geometry.location.lng();			
						var yy=results[0].geometry.location.lat();		
						SourceDest={a:xx, b:yy};							
					}else{
						console.log("Geocoding failed: " + status); 
						Ext.Msg.alert("Geocoding failed", "Please enter location")
					}				
					callback(SourceDest);	
				})		
			},
	
	buildItems:function(){
		return[			
			{
				xtype:'textfield',
				itemId:'Search',
				width:200,
				emptyText:'Location Search',
			},{
				xtype:'button',
				text:'Go',
				itemId:'btnGo',
				//disabled:true,
				handler:function(){				
						
					var me=this.up();				
					var findThis = (me.getComponent('Search').getValue());					
					var me=this.up().up();					
					if  (me.map.getLayersByName('My Location').length > 0) {				
						me.map.getLayersByName('My Location')[0].destroy();					
					};	 				
					
					me.gCode(findThis, function(coord){					
						if  (me.map.getLayersByName('Gcode').length > 0) {				
							me.map.getLayersByName('Gcode')[0].destroy();					
						};		 				
						var currLoc = new OpenLayers.Geometry.Point(coord.a,coord.b).transform('EPSG:4326','EPSG:900913');
						var Location = new OpenLayers.Layer.Vector(	'Gcode', {
								 styleMap: new OpenLayers.StyleMap({'default':{										
										externalGraphic: "./chooser/icons/marker.png",				
										graphicYOffset: -25,
										graphicHeight: 35,
										graphicTitle: findThis
								}}), 	
								displayInLayerSwitcher: false,		
						});							
						Location.addFeatures([new OpenLayers.Feature.Vector(currLoc)]);						
						me.map.addLayer(Location);						
						me.map.zoomToExtent(Location.getDataExtent());			 		
					})						
				}			
			},
			
			{	
				xtype:'button',
				tooltip:'My current location',
				name:'rb',				
				itemId:'btnLoc',
				scale:'large',				
				icon:'./chooser/icons/myCurrLoc.png',
				width:25,
				height:25,	
				handler:function(){					
					var me=this.up('panel');			
					console.log(me);
					if(me.map.getLayersByName('Gcode').length > 0) {				
						me.map.getLayersByName('Gcode')[0].destroy();					
					};		
					
					if (navigator.geolocation) {   
						/** Overlay current location*/		
						navigator.geolocation.getCurrentPosition(
							function(position){					
								var currLoc = new OpenLayers.Geometry.Point(position.coords.longitude,position.coords.latitude).transform('EPSG:4326', 'EPSG:900913');
								console.log('myloc--',currLoc);
								var Location = new OpenLayers.Layer.Vector(	'My Location', {
										styleMap: new OpenLayers.StyleMap({'default':{
												externalGraphic: "./chooser/icons/MyLocation.png",				
												graphicYOffset: -25,
												graphicHeight: 35,
												graphicTitle: "You're here"
										}}) ,
										displayInLayerSwitcher: false,		
										
									});		
								Location.addFeatures([new OpenLayers.Feature.Vector(currLoc)]);						
								me.map.addLayers([Location]);												
								me.map.zoomToExtent(Location.getDataExtent());		
								}
						)		
						
					} else {
						console.log("Geolocation is not supported by this browser.");
					}						
				}		
			},{			
				xtype:'button',
				tooltip:'Max Extent',
				icon:'./chooser/icons/phil.png',
				scale:'medium',
				width:25,
				height:25,
				handler:function(){
					var me=this.up().up();				
					me.map.zoomToMaxExtent();		
					//console.log(me.map);
					
				}		
			
			},{
				xtype:'button',
				tooltip:'Buffer tool',
				icon:'./chooser/icons/buffer.png',
				scale:'medium',
				width:25,
				height:25,
				handler:function(){
					var me = this.up().up();
						console.log(me);						
					var win = Ext.create('BufferTool', {
						map:me.map
					})					
					win.show();					
					
				}
			}
		]	
	},
	
	
	
	initComponent:function(){		
	
		var popup, me=this 			
		map = new OpenLayers.Map(				
				{ 
				controls: [
					new OpenLayers.Control.Navigation(),					
					new OpenLayers.Control.Zoom(),
					new OpenLayers.Control.MousePosition(),				
				],
				
				fallThrough: true,							
				projection: 'EPSG:900913'
				
		});		
		        
       var pgp_basemap_cache = new OpenLayers.Layer.NAMRIA(
				'NAMRIA Basemap',
				'http://202.90.149.252/ArcGIS/rest/services/Basemap/PGS_Basemap/MapServer',
				{
					isBaseLayer: true,
					displayInLayerSwitcher: false,				
				}
		);
		
		var Location = new OpenLayers.Layer.Vector('My Location', {
		 displayInLayerSwitcher: false,		
		});	

		var Location2 = new OpenLayers.Layer.Vector('Gcode', {
		 displayInLayerSwitcher: false,		
		});			
		
		
		
		map.addLayers([pgp_basemap_cache, Location, Location2]);		
		map.zoomToMaxExtent()		
		
		map.events.register('click', map, function(e){			
			if (map.layers.length > 1) {
			
				mapIndex = map.layers.length-1
				
				if (map.layers[mapIndex].name=='My Location' || map.layers[mapIndex].name=='Gcode'){
					mapIndex=mapIndex-1
					if (map.layers[mapIndex].name=='My Location' || map.layers[mapIndex].name=='Gcode'){
						mapIndex=mapIndex-1
					}				
				}		
				
				var topLayer = map.layers[mapIndex].params.LAYERS									
				//var url = "http://202.90.149.231:8000/geoserver.namria.gov.ph/geoserver/geoportal/wms" 
				var url = "http://192.168.254.11:3000/geoserver.namria.gov.ph/geoserver/geoportal/wms" 			
						  + "?REQUEST=GetFeatureInfo"
						  + "&EXCEPTIONS=application/vnd.ogc.se_xml"
						  + "&SERVICE=WMS&VERSION=1.1.1"
						  + "&BBOX=" + map.getExtent().toBBOX()
						  + "&X=" + Math.round(e.xy.x)
						  + "&Y=" + Math.round(e.xy.y)
						  + "&INFO_FORMAT=application/json"					  
						  + "&QUERY_LAYERS=" + topLayer
						  + "&LAYERS=" + topLayer
						  + "&FEATURE_COUNT=10"
						  + "&SRS=EPSG:900913"
						  + "&STYLES="
						  + "&WIDTH=" + map.size.w
						  + "&HEIGHT=" + map.size.h;
				
						me.execUrl(url, function(callback){		
								console.log(callback);	
								if (callback.features.length > 0){							
									var pos =  e.xy									
									if (popup) {
										popup.close();
									}
									popup = Ext.create('GeoExt.window.Popup', {
										title: "Feature Information",
										location: pos,
										map:map,	
										width: 300,	
										height:150,							
										items: {
											xtype:'propertygrid',
											source:callback.features[0].properties,
											hideHeaders: false,
											sortableColumns: false
										},
										autoScroll: true
									})
									popup.show();
								}	
									
						})	
					
			}
		});  
		
		Ext.apply(this, {
			map:map,
			dockedItems: [
				{ xtype: 'toolbar',
				  dock: 'top',
				  items: this.buildItems(),
				}
			]			
		});		
		this.callParent();   
    }	
	
	
});


